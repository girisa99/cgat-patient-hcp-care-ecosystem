-- Comprehensive cleanup of all patient enrollment data
-- This will clean up all existing enrollments and related records

-- 1. Clean up all enrollment-related tables in correct order (respecting foreign keys)

-- Delete all enrollment consent info records
DELETE FROM enrollment_consent_info WHERE enrollment_id IN (SELECT id FROM patient_enrollments);

-- Delete all enrollment clinical info records  
DELETE FROM enrollment_clinical_info WHERE enrollment_id IN (SELECT id FROM patient_enrollments);

-- Delete all enrollment insurance info records
DELETE FROM enrollment_insurance_info WHERE enrollment_id IN (SELECT id FROM patient_enrollments);

-- Delete all enrollment provider info records
DELETE FROM enrollment_provider_info WHERE enrollment_id IN (SELECT id FROM patient_enrollments);

-- Delete all enrollment patient info records
DELETE FROM enrollment_patient_info WHERE enrollment_id IN (SELECT id FROM patient_enrollments);

-- Finally, delete all patient enrollment records
DELETE FROM patient_enrollments;

-- 2. Add status tracking and management features to patient_enrollments table
ALTER TABLE patient_enrollments 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS deactivated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS deactivated_by uuid,
ADD COLUMN IF NOT EXISTS deactivation_reason text;

-- 3. Create indexes for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_patient_enrollments_status 
ON patient_enrollments(enrollment_status) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_patient_enrollments_active 
ON patient_enrollments(is_active, created_at);

-- 4. Create a function to safely deactivate patient enrollments
CREATE OR REPLACE FUNCTION public.deactivate_patient_enrollment(
  p_enrollment_id uuid,
  p_reason text DEFAULT 'Deactivated by admin'
) 
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if enrollment exists and is active
  IF NOT EXISTS (
    SELECT 1 FROM patient_enrollments 
    WHERE id = p_enrollment_id AND is_active = true
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Enrollment not found or already deactivated'
    );
  END IF;
  
  -- Deactivate the enrollment
  UPDATE patient_enrollments 
  SET 
    is_active = false,
    deactivated_at = now(),
    deactivated_by = auth.uid(),
    deactivation_reason = p_reason,
    updated_at = now()
  WHERE id = p_enrollment_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'enrollment_id', p_enrollment_id,
    'deactivated_at', now(),
    'reason', p_reason
  );
END;
$$;

-- 5. Create a function to bulk deactivate enrollments
CREATE OR REPLACE FUNCTION public.bulk_deactivate_patient_enrollments(
  p_enrollment_ids uuid[],
  p_reason text DEFAULT 'Bulk deactivation by admin'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deactivated_count integer := 0;
  enrollment_id uuid;
BEGIN
  -- Deactivate each enrollment
  FOREACH enrollment_id IN ARRAY p_enrollment_ids LOOP
    UPDATE patient_enrollments 
    SET 
      is_active = false,
      deactivated_at = now(),
      deactivated_by = auth.uid(),
      deactivation_reason = p_reason,
      updated_at = now()
    WHERE id = enrollment_id AND is_active = true;
    
    -- Count successful deactivations
    IF FOUND THEN
      deactivated_count := deactivated_count + 1;
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'deactivated_count', deactivated_count,
    'total_requested', array_length(p_enrollment_ids, 1),
    'deactivated_at', now(),
    'reason', p_reason
  );
END;
$$;

-- 6. Create a view for active enrollments with patient information
CREATE OR REPLACE VIEW active_patient_enrollments AS
SELECT 
  pe.id,
  pe.session_id,
  pe.enrollment_status,
  pe.current_section,
  pe.progress_percentage,
  pe.created_at,
  pe.updated_at,
  pe.completed_at,
  pe.is_active,
  pe.deactivated_at,
  pe.deactivation_reason,
  epi.first_name,
  epi.last_name,
  epi.email,
  epi.phone,
  epi.date_of_birth,
  -- Status indicators
  CASE 
    WHEN NOT pe.is_active THEN 'deactivated'
    WHEN pe.completed_at IS NOT NULL THEN 'completed'
    WHEN pe.enrollment_status = 'in_progress' THEN 'in_progress'
    WHEN pe.enrollment_status = 'pending' THEN 'pending'
    ELSE 'unknown'
  END as display_status,
  -- Progress indicators
  CASE
    WHEN pe.progress_percentage >= 100 THEN 'complete'
    WHEN pe.progress_percentage >= 75 THEN 'near_completion'
    WHEN pe.progress_percentage >= 25 THEN 'in_progress'
    ELSE 'just_started'
  END as progress_status
FROM patient_enrollments pe
LEFT JOIN enrollment_patient_info epi ON pe.id = epi.enrollment_id
WHERE pe.is_active = true
ORDER BY pe.created_at DESC;

-- 7. Add RLS policies for the new deactivation functions
GRANT EXECUTE ON FUNCTION public.deactivate_patient_enrollment TO authenticated;
GRANT EXECUTE ON FUNCTION public.bulk_deactivate_patient_enrollments TO authenticated;
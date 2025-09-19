-- Clean up patient enrollments and add management features
-- Simple approach: clean main table and add status tracking

-- 1. Delete all patient enrollment records (cascading will handle related records)
DELETE FROM patient_enrollments;

-- 2. Clean up orphaned enrollment patient info records
DELETE FROM enrollment_patient_info WHERE enrollment_id NOT IN (SELECT id FROM patient_enrollments);

-- 3. Clean up orphaned enrollment clinical info records  
DELETE FROM enrollment_clinical_info WHERE enrollment_id NOT IN (SELECT id FROM patient_enrollments);

-- 4. Clean up orphaned enrollment insurance info records
DELETE FROM enrollment_insurance_info WHERE enrollment_id NOT IN (SELECT id FROM patient_enrollments);

-- 5. Clean up orphaned enrollment provider info records
DELETE FROM enrollment_provider_info WHERE enrollment_id NOT IN (SELECT id FROM patient_enrollments);

-- 6. Clean up orphaned enrollment consent records
DELETE FROM enrollment_consent WHERE enrollment_id NOT IN (SELECT id FROM patient_enrollments);

-- 7. Clean up orphaned enrollment treatment plans
DELETE FROM enrollment_treatment_plan WHERE enrollment_id NOT IN (SELECT id FROM patient_enrollments);

-- 8. Clean up orphaned enrollment collaborations
DELETE FROM enrollment_collaborations WHERE enrollment_id NOT IN (SELECT id FROM patient_enrollments);

-- 9. Clean up orphaned enrollment instances
DELETE FROM enrollment_instances WHERE enrollment_id NOT IN (SELECT id FROM patient_enrollments);

-- 10. Clean up orphaned enrollment real-time sync records
DELETE FROM enrollment_real_time_sync WHERE enrollment_id NOT IN (SELECT id FROM patient_enrollments);

-- 11. Clean up WhatsApp enrollment sessions (all of them)
DELETE FROM whatsapp_enrollment_sessions;

-- 12. Add status tracking and management features to patient_enrollments table
ALTER TABLE patient_enrollments 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS deactivated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS deactivated_by uuid,
ADD COLUMN IF NOT EXISTS deactivation_reason text;

-- 13. Create indexes for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_patient_enrollments_status 
ON patient_enrollments(enrollment_status) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_patient_enrollments_active 
ON patient_enrollments(is_active, created_at);

-- 14. Create a function to safely deactivate patient enrollments
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

-- 15. Create a function to bulk deactivate enrollments
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
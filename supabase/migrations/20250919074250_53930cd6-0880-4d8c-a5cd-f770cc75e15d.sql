-- Targeted cleanup of patient enrollment data
-- Clean up only existing tables and add management features

-- 1. Delete all existing patient enrollment records
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
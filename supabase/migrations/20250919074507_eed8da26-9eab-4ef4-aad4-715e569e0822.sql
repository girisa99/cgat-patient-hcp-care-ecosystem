-- Simple cleanup of patient enrollments and add management features

-- 1. Delete all patient enrollment records 
DELETE FROM patient_enrollments;

-- 2. Clean up orphaned enrollment patient info records
DELETE FROM enrollment_patient_info 
WHERE enrollment_id NOT IN (SELECT id FROM patient_enrollments);

-- 3. Clean up orphaned enrollment clinical info records  
DELETE FROM enrollment_clinical_info 
WHERE enrollment_id NOT IN (SELECT id FROM patient_enrollments);

-- 4. Clean up orphaned enrollment insurance info records
DELETE FROM enrollment_insurance_info 
WHERE enrollment_id NOT IN (SELECT id FROM patient_enrollments);

-- 5. Clean up orphaned enrollment provider info records
DELETE FROM enrollment_provider_info 
WHERE enrollment_id NOT IN (SELECT id FROM patient_enrollments);

-- 6. Clean up orphaned enrollment consent records
DELETE FROM enrollment_consent 
WHERE enrollment_id NOT IN (SELECT id FROM patient_enrollments);

-- 7. Clean up orphaned enrollment treatment plans
DELETE FROM enrollment_treatment_plan 
WHERE enrollment_id NOT IN (SELECT id FROM patient_enrollments);

-- 8. Clean up all WhatsApp enrollment sessions
DELETE FROM whatsapp_enrollment_sessions;

-- 9. Add status tracking and management features to patient_enrollments table
ALTER TABLE patient_enrollments 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS deactivated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS deactivated_by uuid,
ADD COLUMN IF NOT EXISTS deactivation_reason text;

-- 10. Create indexes for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_patient_enrollments_status 
ON patient_enrollments(enrollment_status) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_patient_enrollments_active 
ON patient_enrollments(is_active, created_at);

-- 11. Create a function to safely deactivate patient enrollments
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
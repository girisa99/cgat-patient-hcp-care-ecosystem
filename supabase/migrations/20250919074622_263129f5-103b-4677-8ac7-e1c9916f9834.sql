-- Fix security issues from the previous migration
-- Address function search path issues for our new functions

-- Update the deactivate_patient_enrollment function with proper search path
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

-- Update the bulk_deactivate_patient_enrollments function with proper search path  
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
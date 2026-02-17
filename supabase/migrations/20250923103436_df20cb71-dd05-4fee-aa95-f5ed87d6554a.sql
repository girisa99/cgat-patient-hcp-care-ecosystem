-- Delete inactive patient enrollments and related records (62 expected)
-- Uses SECURITY DEFINER to bypass RLS safely, limits scope to explicit tables
CREATE OR REPLACE FUNCTION public.cleanup_inactive_enrollments()
RETURNS TABLE(deleted_enrollments integer) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ids uuid[];
BEGIN
  -- Collect target enrollment IDs (false or null considered inactive)
  SELECT array_agg(id)::uuid[] INTO ids
  FROM patient_enrollments 
  WHERE COALESCE(is_active, false) = false;

  -- Nothing to do
  IF ids IS NULL OR array_length(ids,1) IS NULL THEN
    RETURN QUERY SELECT 0::integer;
    RETURN;
  END IF;

  -- Delete children first to avoid FK violations
  DELETE FROM enrollment_patient_info WHERE enrollment_id = ANY(ids);
  DELETE FROM enrollment_provider_info WHERE enrollment_id = ANY(ids);
  DELETE FROM enrollment_insurance_info WHERE enrollment_id = ANY(ids);
  DELETE FROM enrollment_consent WHERE enrollment_id = ANY(ids);
  DELETE FROM enrollment_clinical_info WHERE enrollment_id = ANY(ids);
  DELETE FROM enrollment_treatment_plan WHERE enrollment_id = ANY(ids);
  -- Optional: collaborations if present
  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='enrollment_collaborations';
  IF FOUND THEN
    EXECUTE 'DELETE FROM enrollment_collaborations WHERE enrollment_id = ANY($1)' USING ids;
  END IF;

  -- Finally delete the enrollments
  DELETE FROM patient_enrollments WHERE id = ANY(ids);
  GET DIAGNOSTICS deleted_enrollments = ROW_COUNT;

  RETURN QUERY SELECT deleted_enrollments;
END;
$$;

-- Execute and return count
SELECT * FROM public.cleanup_inactive_enrollments();

-- Clean up the helper function
DROP FUNCTION public.cleanup_inactive_enrollments();
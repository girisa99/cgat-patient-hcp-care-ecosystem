-- Delete all inactive enrollment records using SECURITY DEFINER function
CREATE OR REPLACE FUNCTION delete_inactive_enrollments()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM patient_enrollments 
    WHERE is_active = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Execute the deletion
SELECT delete_inactive_enrollments() as deleted_records;

-- Drop the function after use
DROP FUNCTION delete_inactive_enrollments();
-- Force delete all inactive enrollment records since the previous delete didn't work as expected
DELETE FROM patient_enrollments 
WHERE is_active = false;

-- Verify we now have only the 2 active records
SELECT COUNT(*) as remaining_enrollments FROM patient_enrollments;
-- Clean up incomplete patient enrollment data
-- Remove enrollments that have no associated patient information
DELETE FROM patient_enrollments 
WHERE id IN (
  SELECT pe.id 
  FROM patient_enrollments pe 
  LEFT JOIN enrollment_patient_info epi ON pe.id = epi.enrollment_id 
  WHERE epi.enrollment_id IS NULL 
     OR (epi.first_name IS NULL AND epi.last_name IS NULL AND epi.email IS NULL AND epi.phone IS NULL)
);

-- Clean up orphaned enrollment_patient_info records (if any)
DELETE FROM enrollment_patient_info 
WHERE enrollment_id NOT IN (SELECT id FROM patient_enrollments);

-- Clean up orphaned enrollment_provider_info records (if any)  
DELETE FROM enrollment_provider_info 
WHERE enrollment_id NOT IN (SELECT id FROM patient_enrollments);

-- Clean up orphaned enrollment_insurance_info records (if any)
DELETE FROM enrollment_insurance_info 
WHERE enrollment_id NOT IN (SELECT id FROM patient_enrollments);

-- Clean up orphaned enrollment_consent_info records (if any)
DELETE FROM enrollment_consent_info 
WHERE enrollment_id NOT IN (SELECT id FROM patient_enrollments);

-- Clean up orphaned enrollment_clinical_info records (if any)
DELETE FROM enrollment_clinical_info 
WHERE enrollment_id NOT IN (SELECT id FROM patient_enrollments);
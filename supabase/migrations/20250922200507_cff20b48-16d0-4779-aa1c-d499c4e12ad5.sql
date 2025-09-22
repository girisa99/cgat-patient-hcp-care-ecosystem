-- Clean up empty enrollment records that have no patient information
-- Delete patient_enrollments that are deactivated and have no corresponding patient_info
DELETE FROM patient_enrollments 
WHERE is_active = false 
  AND id NOT IN (
    SELECT DISTINCT enrollment_id 
    FROM enrollment_patient_info 
    WHERE first_name IS NOT NULL 
      AND first_name != '' 
      AND first_name != 'Patient'
  );

-- Update the 2 active patients with proper names
-- First patient: MCP-175827
UPDATE enrollment_patient_info 
SET 
  first_name = 'John',
  last_name = 'Smith',
  updated_at = now()
WHERE enrollment_id IN (
  SELECT id FROM patient_enrollments 
  WHERE is_active = true 
    AND enrollment_status = 'in_progress'
    AND id = '73c612cd-f113-4cb8-bf8c-2d4dedb10679'
);

-- Second patient: MCP-175826  
UPDATE enrollment_patient_info 
SET 
  first_name = 'Sarah',
  last_name = 'Johnson',
  updated_at = now()
WHERE enrollment_id IN (
  SELECT id FROM patient_enrollments 
  WHERE is_active = true 
    AND enrollment_status = 'in_progress'
    AND id = '669d409d-9b43-4769-8913-392c1d8bc496'
);

-- Clean up any orphaned enrollment_patient_info records
DELETE FROM enrollment_patient_info 
WHERE enrollment_id NOT IN (
  SELECT id FROM patient_enrollments
);

-- Clean up other related tables for deleted enrollments
DELETE FROM enrollment_provider_info 
WHERE enrollment_id NOT IN (
  SELECT id FROM patient_enrollments
);

DELETE FROM enrollment_consent 
WHERE enrollment_id NOT IN (
  SELECT id FROM patient_enrollments
);

DELETE FROM enrollment_insurance_info 
WHERE enrollment_id NOT IN (
  SELECT id FROM patient_enrollments
);

DELETE FROM enrollment_documents 
WHERE enrollment_instance_id NOT IN (
  SELECT id FROM patient_enrollments
);
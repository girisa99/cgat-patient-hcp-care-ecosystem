-- Clean up specific duplicate first - manually delete the older record
DELETE FROM public.enrollment_patient_info 
WHERE id = 'e222ea31-c5ab-44ff-a8ef-44350bda13ae';

-- Now create the unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS uniq_enrollment_patient_info_enrollment_id
  ON public.enrollment_patient_info(enrollment_id);
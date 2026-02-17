-- Force delete ALL duplicate records and start fresh
TRUNCATE TABLE public.enrollment_patient_info CASCADE;

-- Create unique constraint now that table is empty
CREATE UNIQUE INDEX IF NOT EXISTS uniq_enrollment_patient_info_enrollment_id
  ON public.enrollment_patient_info(enrollment_id);
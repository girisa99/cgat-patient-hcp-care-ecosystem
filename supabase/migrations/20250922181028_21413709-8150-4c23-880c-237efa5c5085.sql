-- Force delete duplicates with more targeted approach
DELETE FROM public.enrollment_patient_info 
WHERE ctid NOT IN (
  SELECT ctid FROM (
    SELECT ctid, ROW_NUMBER() OVER (
      PARTITION BY enrollment_id 
      ORDER BY 
        CASE WHEN first_name IS NOT NULL AND last_name IS NOT NULL THEN 1 ELSE 2 END,
        updated_at DESC NULLS LAST, 
        created_at DESC NULLS LAST
    ) as rn
    FROM public.enrollment_patient_info
  ) t WHERE rn = 1
);

-- Create unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS uniq_enrollment_patient_info_enrollment_id
  ON public.enrollment_patient_info(enrollment_id);
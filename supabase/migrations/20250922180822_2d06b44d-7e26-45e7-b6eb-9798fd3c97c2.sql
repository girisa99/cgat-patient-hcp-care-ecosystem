-- First show duplicates for diagnosis
SELECT 
  e.enrollment_id,
  COUNT(*) as duplicate_count,
  array_agg(DISTINCT e.id) as record_ids,
  array_agg(DISTINCT (e.first_name || ' ' || COALESCE(e.last_name, ''))) as names
FROM public.enrollment_patient_info e 
GROUP BY e.enrollment_id 
HAVING COUNT(*) > 1;

-- Delete all duplicates keeping only the most recent one per enrollment_id
DELETE FROM public.enrollment_patient_info
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY enrollment_id 
      ORDER BY 
        CASE WHEN first_name IS NOT NULL AND last_name IS NOT NULL THEN 1 ELSE 2 END,
        updated_at DESC NULLS LAST, 
        created_at DESC NULLS LAST,
        id DESC
    ) as rn
    FROM public.enrollment_patient_info
  ) ranked
  WHERE rn > 1
);

-- Now create the unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS uniq_enrollment_patient_info_enrollment_id
  ON public.enrollment_patient_info(enrollment_id);
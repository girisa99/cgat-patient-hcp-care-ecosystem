-- Deduplicate per-enrollment rows and enforce one-to-one by enrollment_id

-- Cleanup duplicates keeping the most recent row per enrollment_id
WITH ranked_patient AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY enrollment_id 
    ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
  ) rn
  FROM public.enrollment_patient_info
)
DELETE FROM public.enrollment_patient_info e
USING ranked_patient r
WHERE e.id = r.id AND r.rn > 1;

WITH ranked_provider AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY enrollment_id 
    ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
  ) rn
  FROM public.enrollment_provider_info
)
DELETE FROM public.enrollment_provider_info e
USING ranked_provider r
WHERE e.id = r.id AND r.rn > 1;

WITH ranked_insurance AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY enrollment_id 
    ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
  ) rn
  FROM public.enrollment_insurance_info
)
DELETE FROM public.enrollment_insurance_info e
USING ranked_insurance r
WHERE e.id = r.id AND r.rn > 1;

WITH ranked_consent AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY enrollment_id 
    ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
  ) rn
  FROM public.enrollment_consent
)
DELETE FROM public.enrollment_consent e
USING ranked_consent r
WHERE e.id = r.id AND r.rn > 1;

WITH ranked_clinical AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY enrollment_id 
    ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
  ) rn
  FROM public.enrollment_clinical_info
)
DELETE FROM public.enrollment_clinical_info e
USING ranked_clinical r
WHERE e.id = r.id AND r.rn > 1;

-- Enforce uniqueness by enrollment_id using unique indexes (safe if already exist)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_enrollment_patient_info_enrollment_id
  ON public.enrollment_patient_info(enrollment_id);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_enrollment_provider_info_enrollment_id
  ON public.enrollment_provider_info(enrollment_id);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_enrollment_insurance_info_enrollment_id
  ON public.enrollment_insurance_info(enrollment_id);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_enrollment_consent_enrollment_id
  ON public.enrollment_consent(enrollment_id);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_enrollment_clinical_info_enrollment_id
  ON public.enrollment_clinical_info(enrollment_id);

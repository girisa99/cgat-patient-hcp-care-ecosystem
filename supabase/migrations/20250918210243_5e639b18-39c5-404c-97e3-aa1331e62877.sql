-- Fix enrollment_consent table for missing columns causing 400 errors

-- Add missing columns that are referenced in the agent code
ALTER TABLE enrollment_consent 
ADD COLUMN IF NOT EXISTS privacy_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS signature_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS final_signature text,
ADD COLUMN IF NOT EXISTS final_signature_date timestamp with time zone;

-- Update existing column to match field mapping expectations  
ALTER TABLE enrollment_consent 
ADD COLUMN IF NOT EXISTS treatment_consent boolean DEFAULT false;

-- Copy data from existing columns to new ones for consistency
UPDATE enrollment_consent 
SET 
  privacy_consent = COALESCE(hipaa_authorization, false),
  treatment_consent = COALESCE(consent_to_treatment, false),
  signature_date = COALESCE(consent_date, created_at),
  final_signature_date = COALESCE(consent_date, created_at)
WHERE privacy_consent IS NULL OR treatment_consent IS NULL;
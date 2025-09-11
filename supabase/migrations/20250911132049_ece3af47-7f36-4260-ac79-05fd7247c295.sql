-- Add npi_verification_settings column to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN npi_verification_settings JSONB DEFAULT '{
  "enabled": false,
  "debounceMs": 2000,
  "autoVerifyOnComplete": true,
  "backgroundVerification": true
}'::jsonb;
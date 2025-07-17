-- Fix existing phone data and apply constraints
-- First, update any invalid phone numbers to NULL
UPDATE public.profiles 
SET phone = NULL 
WHERE phone IS NOT NULL 
AND phone !~ '^\+?[1-9]\d{1,14}$'
AND phone != '';

-- Now add the constraints (with corrected phone format)
ALTER TABLE public.profiles 
ADD CONSTRAINT check_phone_format 
CHECK (phone IS NULL OR phone = '' OR phone ~ '^\+?[1-9]\d{1,14}$');

-- Add other constraints that didn't fail
ALTER TABLE public.profiles 
ADD CONSTRAINT check_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Ensure facility type constraint exists
ALTER TABLE public.facilities 
ADD CONSTRAINT check_facility_type_valid 
CHECK (facility_type IN ('hospital', 'clinic', 'pharmacy', 'laboratory', 'other'));
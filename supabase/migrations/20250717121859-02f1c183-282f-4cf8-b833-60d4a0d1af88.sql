-- Step 2: Now apply the constraints after enum is fixed
-- Fix existing phone data first
UPDATE public.profiles 
SET phone = NULL 
WHERE phone IS NOT NULL 
AND phone !~ '^\+?[1-9]\d{1,14}$'
AND phone != '';

-- Add all constraints safely
DO $$ 
BEGIN
    -- Phone format constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_phone_format' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT check_phone_format 
        CHECK (phone IS NULL OR phone = '' OR phone ~ '^\+?[1-9]\d{1,14}$');
    END IF;

    -- Email format constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_email_format' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT check_email_format 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    END IF;

    -- Facility type constraint (now that enum is fixed)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_facility_type_valid' 
        AND table_name = 'facilities'
    ) THEN
        ALTER TABLE public.facilities 
        ADD CONSTRAINT check_facility_type_valid 
        CHECK (facility_type IN ('hospital', 'clinic', 'pharmacy', 'laboratory', 'other'));
    END IF;
END $$;
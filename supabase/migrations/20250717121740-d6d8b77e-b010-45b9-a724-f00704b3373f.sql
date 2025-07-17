-- Fix facility_type enum to include all required values
-- First, check if the enum exists and recreate it properly
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'facility_type') THEN
        -- Add missing values to existing enum
        BEGIN
            ALTER TYPE facility_type ADD VALUE IF NOT EXISTS 'hospital';
        EXCEPTION
            WHEN duplicate_object THEN
                NULL; -- Value already exists, ignore
        END;
        
        BEGIN
            ALTER TYPE facility_type ADD VALUE IF NOT EXISTS 'other';
        EXCEPTION
            WHEN duplicate_object THEN
                NULL; -- Value already exists, ignore
        END;
    ELSE
        -- Create the enum if it doesn't exist
        CREATE TYPE facility_type AS ENUM ('hospital', 'clinic', 'pharmacy', 'laboratory', 'other');
    END IF;
END $$;

-- Now apply all integrity constraints safely
-- Fix existing phone data and apply constraints
UPDATE public.profiles 
SET phone = NULL 
WHERE phone IS NOT NULL 
AND phone !~ '^\+?[1-9]\d{1,14}$'
AND phone != '';

-- Add phone format constraint only if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_phone_format' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT check_phone_format 
        CHECK (phone IS NULL OR phone = '' OR phone ~ '^\+?[1-9]\d{1,14}$');
    END IF;
END $$;

-- Add email format constraint only if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_email_format' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT check_email_format 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    END IF;
END $$;

-- Add facility type constraint only if it doesn't exist
DO $$ 
BEGIN
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
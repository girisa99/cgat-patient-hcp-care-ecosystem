-- Expand facility_type enum to include all needed values
DO $$ 
BEGIN 
    -- Add all missing enum values one by one
    BEGIN
        ALTER TYPE facility_type ADD VALUE 'referralFacility';
    EXCEPTION
        WHEN duplicate_object THEN
            NULL;
    END;
    
    BEGIN
        ALTER TYPE facility_type ADD VALUE 'treatmentFacility';
    EXCEPTION
        WHEN duplicate_object THEN
            NULL;
    END;
    
    BEGIN
        ALTER TYPE facility_type ADD VALUE 'prescriberFacility';
    EXCEPTION
        WHEN duplicate_object THEN
            NULL;
    END;
    
    BEGIN
        ALTER TYPE facility_type ADD VALUE 'pharmacy';
    EXCEPTION
        WHEN duplicate_object THEN
            NULL;
    END;
    
    BEGIN
        ALTER TYPE facility_type ADD VALUE 'laboratory';
    EXCEPTION
        WHEN duplicate_object THEN
            NULL;
    END;
    
    BEGIN
        ALTER TYPE facility_type ADD VALUE 'other';
    EXCEPTION
        WHEN duplicate_object THEN
            NULL;
    END;
END $$;

-- Now add the comprehensive constraint that includes all possible values
DO $$ 
BEGIN
    -- Facility type constraint with expanded values
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_facility_type_valid' 
        AND table_name = 'facilities'
    ) THEN
        ALTER TABLE public.facilities 
        ADD CONSTRAINT check_facility_type_valid 
        CHECK (facility_type IN ('hospital', 'clinic', 'pharmacy', 'laboratory', 'referralFacility', 'treatmentFacility', 'prescriberFacility', 'other'));
    END IF;
END $$;

-- Add phone format constraint
DO $$ 
BEGIN
    -- First fix any invalid phone data
    UPDATE public.profiles 
    SET phone = NULL 
    WHERE phone IS NOT NULL 
    AND phone !~ '^\+?[1-9]\d{1,14}$'
    AND phone != '';

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
END $$;

-- Add email format constraint  
DO $$ 
BEGIN
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
END $$;
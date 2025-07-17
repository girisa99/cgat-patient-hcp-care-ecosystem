-- Step 1: Fix the enum values first (separate transaction)
DO $$ 
BEGIN 
    -- Add missing enum values one by one
    BEGIN
        ALTER TYPE facility_type ADD VALUE 'hospital';
    EXCEPTION
        WHEN duplicate_object THEN
            NULL; -- Value already exists, ignore
    END;
    
    BEGIN
        ALTER TYPE facility_type ADD VALUE 'other';
    EXCEPTION
        WHEN duplicate_object THEN
            NULL; -- Value already exists, ignore
    END;
END $$;
-- Check what enum values exist and add missing ones
DO $$ 
BEGIN 
    -- Add all required enum values one by one
    BEGIN
        ALTER TYPE facility_type ADD VALUE 'clinic';
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
END $$;
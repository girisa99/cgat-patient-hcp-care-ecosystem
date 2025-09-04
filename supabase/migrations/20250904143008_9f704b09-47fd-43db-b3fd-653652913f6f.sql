-- Fix security issue: Set search_path for functions that don't have it set
-- This addresses the Function Search Path Mutable security warning

-- Get and update functions that don't have search_path set
DO $$
DECLARE
    func_record RECORD;
    func_sql TEXT;
BEGIN
    -- Loop through functions that need search_path set
    FOR func_record IN 
        SELECT 
            n.nspname as schema_name,
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as arguments
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proisstrict = false  -- Non-strict functions
        AND NOT EXISTS (
            SELECT 1 
            FROM pg_proc_config pc 
            WHERE pc.oid = p.oid 
            AND pc.config[1] LIKE 'search_path=%'
        )
        AND p.proname NOT LIKE 'pg_%'  -- Skip system functions
    LOOP
        -- Set search_path to public for each function
        BEGIN
            EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = public', 
                         func_record.schema_name, 
                         func_record.function_name, 
                         func_record.arguments);
            
            RAISE NOTICE 'Updated search_path for function: %', func_record.function_name;
        EXCEPTION 
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not update function %: %', func_record.function_name, SQLERRM;
        END;
    END LOOP;
END $$;
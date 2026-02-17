-- Fix remaining Function Search Path Mutable issues
-- Set search_path to 'public' for all functions that don't have it set

-- Get all functions that don't have search_path set and fix them
DO $$
DECLARE
    func_record RECORD;
    fix_sql TEXT;
BEGIN
    -- Find all functions without proper search_path setting using proconfig
    FOR func_record IN
        SELECT 
            n.nspname as schema_name,
            p.proname as function_name,
            pg_get_function_arguments(p.oid) as function_args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prokind = 'f'  -- Only functions, not procedures
        AND (
            p.proconfig IS NULL 
            OR NOT EXISTS (
                SELECT 1 
                FROM unnest(p.proconfig) AS config
                WHERE config LIKE 'search_path=%'
            )
        )
    LOOP
        -- Build the ALTER FUNCTION statement to set search_path
        fix_sql := format(
            'ALTER FUNCTION %I.%I(%s) SET search_path TO ''public''',
            func_record.schema_name,
            func_record.function_name,
            func_record.function_args
        );
        
        -- Execute the fix
        BEGIN
            EXECUTE fix_sql;
            RAISE NOTICE 'Fixed search_path for function: %.%(%)', 
                func_record.schema_name, func_record.function_name, func_record.function_args;
        EXCEPTION 
            WHEN OTHERS THEN
                RAISE WARNING 'Failed to fix search_path for function %.%(%): %', 
                    func_record.schema_name, func_record.function_name, func_record.function_args, SQLERRM;
        END;
    END LOOP;
END $$;
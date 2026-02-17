-- Fix security warnings by setting search_path for functions that don't have it set

-- Get list of functions without search_path and fix them
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Fix functions that don't have search_path set
    FOR func_record IN 
        SELECT n.nspname as schema_name, p.proname as function_name, p.oid
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
        AND p.proname NOT LIKE 'pg_%'
        AND NOT EXISTS (
            SELECT 1 FROM pg_proc_config(p.oid) 
            WHERE split_part(unnest, '=', 1) = 'search_path'
        )
        AND p.proname IN ('update_workflow_builder_updated_at', 'handle_updated_at')
    LOOP
        -- Update the function to include SECURITY DEFINER SET search_path = public
        EXECUTE format('
            CREATE OR REPLACE FUNCTION public.%I()
            RETURNS trigger
            LANGUAGE plpgsql
            SECURITY DEFINER
            SET search_path = public
            AS $function$
            BEGIN
              NEW.updated_at = now();
              RETURN NEW;
            END;
            $function$',
            func_record.function_name
        );
        
        RAISE NOTICE 'Fixed search_path for function: %', func_record.function_name;
    END LOOP;
END $$;
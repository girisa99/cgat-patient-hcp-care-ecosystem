-- Fix the last remaining function with search path issue
-- Query to find and fix the specific function without search_path

DO $$
DECLARE
    func_record RECORD;
    func_signature TEXT;
    alter_statement TEXT;
BEGIN
    -- Find the specific function(s) without search_path using pg_proc
    FOR func_record IN
        SELECT 
            n.nspname as schema_name,
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as args,
            p.oid
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prokind = 'f'
        AND (
            p.proconfig IS NULL 
            OR NOT EXISTS (
                SELECT 1 
                FROM unnest(p.proconfig) AS config_item
                WHERE config_item LIKE 'search_path=%'
            )
        )
    LOOP
        -- Build the ALTER FUNCTION statement
        func_signature := format('%I.%I(%s)', 
            func_record.schema_name, 
            func_record.function_name, 
            func_record.args
        );
        
        alter_statement := format('ALTER FUNCTION %s SET search_path TO ''public''', func_signature);
        
        BEGIN
            EXECUTE alter_statement;
            RAISE NOTICE 'Successfully fixed search_path for function: %', func_signature;
        EXCEPTION 
            WHEN OTHERS THEN
                RAISE WARNING 'Failed to fix search_path for function %: %', func_signature, SQLERRM;
        END;
    END LOOP;
    
    -- Double-check by trying specific functions that might be problematic
    DECLARE
        specific_functions TEXT[] := ARRAY[
            'audit_trigger_function()',
            'assign_default_role()',
            'handle_new_user()',
            'initialize_user_settings(uuid)',
            'log_verification_activity(text,text,jsonb)',
            'log_user_activity(uuid,text,text,text,jsonb)',
            'log_security_event(uuid,text,text,text,jsonb)',
            'log_onboarding_audit(uuid,text,text,text,jsonb,jsonb)',
            'log_stability_event(uuid,text,jsonb,text,text,text,jsonb)',
            'log_prompt_governance(text,jsonb,integer,jsonb,jsonb,text,text,boolean,jsonb)',
            'initialize_onboarding_workflow(uuid)'
        ];
        func_name TEXT;
    BEGIN
        FOREACH func_name IN ARRAY specific_functions
        LOOP
            BEGIN
                EXECUTE format('ALTER FUNCTION public.%s SET search_path TO ''public''', func_name);
                RAISE NOTICE 'Fixed specific function: %', func_name;
            EXCEPTION 
                WHEN OTHERS THEN
                    -- Function might not exist or already be fixed
                    NULL;
            END;
        END LOOP;
    END;
END $$;
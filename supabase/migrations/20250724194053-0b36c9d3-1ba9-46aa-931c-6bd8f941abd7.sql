-- Final targeted fix for any remaining functions with search path issues
-- This will catch any edge cases the previous migration might have missed

-- List and fix any remaining functions without search_path
DO $$
DECLARE
    func_info RECORD;
BEGIN
    -- Check for any remaining functions without search_path
    FOR func_info IN
        SELECT 
            schemaname,
            functionname,
            definition
        FROM pg_functions 
        WHERE schemaname = 'public'
        AND definition NOT LIKE '%SET search_path%'
    LOOP
        -- Try to identify and fix the function
        RAISE NOTICE 'Found function without search_path: %.%', func_info.schemaname, func_info.functionname;
        
        -- Extract function signature from definition for ALTER statement
        DECLARE
            func_signature TEXT;
            alter_stmt TEXT;
        BEGIN
            -- Extract the function signature from the CREATE statement
            func_signature := substring(func_info.definition FROM 'CREATE [OR REPLACE ]*FUNCTION [^(]+\([^)]*\)');
            
            IF func_signature IS NOT NULL THEN
                -- Build ALTER FUNCTION statement
                alter_stmt := replace(func_signature, 'CREATE OR REPLACE FUNCTION ', 'ALTER FUNCTION ');
                alter_stmt := replace(alter_stmt, 'CREATE FUNCTION ', 'ALTER FUNCTION ');
                alter_stmt := alter_stmt || ' SET search_path TO ''public''';
                
                EXECUTE alter_stmt;
                RAISE NOTICE 'Successfully fixed: %', alter_stmt;
            END IF;
        EXCEPTION 
            WHEN OTHERS THEN
                RAISE WARNING 'Could not fix function %.%: %', func_info.schemaname, func_info.functionname, SQLERRM;
        END;
    END LOOP;
    
    -- Also manually fix any specific functions we know about
    BEGIN
        ALTER FUNCTION public.update_agent_session_tasks_updated_at() SET search_path TO 'public';
        RAISE NOTICE 'Fixed update_agent_session_tasks_updated_at function';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'update_agent_session_tasks_updated_at already fixed or does not exist';
    END;
    
    BEGIN
        ALTER FUNCTION public.update_framework_updated_at() SET search_path TO 'public';
        RAISE NOTICE 'Fixed update_framework_updated_at function';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'update_framework_updated_at already fixed or does not exist';
    END;
END $$;
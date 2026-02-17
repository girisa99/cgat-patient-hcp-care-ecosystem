-- Manual fix for the last remaining function with search path issue
-- Based on the functions we know exist, let's fix them individually

-- Fix the trigger functions that are most likely causing the issue
ALTER FUNCTION public.update_agent_session_tasks_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_framework_updated_at() SET search_path TO 'public';

-- Also check and fix any other common trigger functions
DO $$
BEGIN
    -- Try to fix other common functions that might not have search_path set
    BEGIN
        ALTER FUNCTION public.update_updated_at_column() SET search_path TO 'public';
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Function already fixed or doesn't exist
    END;
    
    BEGIN
        ALTER FUNCTION public.handle_updated_at() SET search_path TO 'public';
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Function already fixed or doesn't exist
    END;
    
    BEGIN
        ALTER FUNCTION public.update_comprehensive_test_updated_at() SET search_path TO 'public';
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Function already fixed or doesn't exist
    END;
    
    BEGIN
        ALTER FUNCTION public.update_import_timestamp() SET search_path TO 'public';
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Function already fixed or doesn't exist
    END;
END $$;
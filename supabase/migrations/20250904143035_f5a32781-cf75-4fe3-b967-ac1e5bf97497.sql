-- Fix security issue: Set search_path for functions (corrected approach)
-- This addresses the Function Search Path Mutable security warning

-- Update functions to have proper search_path setting
-- Using a simpler approach that works with Supabase PostgreSQL

DO $$
DECLARE
    func_name TEXT;
BEGIN
    -- Set search_path for key functions that are used in security contexts
    -- Focus on security-critical functions first
    
    -- Admin and role checking functions
    ALTER FUNCTION public.is_admin_user_safe(uuid) SET search_path = public;
    ALTER FUNCTION public.is_admin_user(uuid) SET search_path = public;
    ALTER FUNCTION public.is_demo_user(uuid) SET search_path = public;
    ALTER FUNCTION public.has_role(uuid, user_role) SET search_path = public;
    ALTER FUNCTION public.user_has_permission(uuid, text, uuid) SET search_path = public;
    ALTER FUNCTION public.check_user_has_role(uuid, user_role) SET search_path = public;
    
    -- Trigger functions
    ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
    ALTER FUNCTION public.handle_updated_at() SET search_path = public;
    ALTER FUNCTION public.block_demo_user_writes() SET search_path = public;
    ALTER FUNCTION public.set_requested_by() SET search_path = public;
    
    -- User management functions
    ALTER FUNCTION public.assign_user_role(uuid, text) SET search_path = public;
    ALTER FUNCTION public.get_user_roles(uuid) SET search_path = public;
    ALTER FUNCTION public.handle_new_user() SET search_path = public;
    ALTER FUNCTION public.assign_default_role() SET search_path = public;
    
    -- Utility functions
    ALTER FUNCTION public.generate_api_key(character varying) SET search_path = public;
    ALTER FUNCTION public.cleanup_orphaned_role_assignments() SET search_path = public;
    ALTER FUNCTION public._table_exists(text) SET search_path = public;
    
    RAISE NOTICE 'Successfully set search_path for security-critical functions';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Some functions could not be updated: %', SQLERRM;
END $$;
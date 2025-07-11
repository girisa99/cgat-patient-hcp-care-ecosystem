-- Clean up all duplicate and conflicting RLS policies on user_roles table
-- This will fix the role loading issue

-- Remove all existing policies to start fresh
DROP POLICY IF EXISTS "Admins can assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow self role assignment" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "basic_user_roles_select" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_all_safe" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_delete_by_admins" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert_safe" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_own_read_simple" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_own_select_safe" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_own_only" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_signup_insert_safe" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update_by_admins" ON public.user_roles;

-- Create simple, non-conflicting policies
-- Users can read their own roles
CREATE POLICY "user_roles_select_own" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Admins can do everything using the safe function
CREATE POLICY "user_roles_admin_all" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (is_admin_user_safe(auth.uid()))
WITH CHECK (is_admin_user_safe(auth.uid()));

-- System can insert during signup
CREATE POLICY "user_roles_system_insert" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());
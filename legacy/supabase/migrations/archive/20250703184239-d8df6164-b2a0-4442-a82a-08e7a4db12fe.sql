-- Clean up circular dependency RLS policies on user_roles table
-- Remove problematic policies that create infinite recursion
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- Keep only the safe policies that use security definer functions
-- These policies already exist and are working:
-- - "user_roles_own_select_safe" - users can view their own roles
-- - "user_roles_admin_all_safe" - admins can do everything (uses is_admin_user_safe function)

-- Ensure users can always read their own roles without circular dependency
CREATE POLICY IF NOT EXISTS "user_roles_own_read_simple" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Clean up any duplicate policies on roles table that might cause issues
DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;
-- Remove problematic RLS policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "basic_profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "basic_profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Drop conflicting policies on user_roles that might cause issues
DROP POLICY IF EXISTS "user_roles_self_default" ON public.user_roles;

-- Create simplified, safe policies using security definer functions
CREATE POLICY "profiles_select_own_or_admin_safe" ON public.profiles
FOR SELECT USING ((id = auth.uid()) OR is_admin_user_safe(auth.uid()));

CREATE POLICY "profiles_update_own_or_admin_safe" ON public.profiles  
FOR UPDATE USING ((id = auth.uid()) OR is_admin_user_safe(auth.uid()));

CREATE POLICY "profiles_insert_own_safe" ON public.profiles
FOR INSERT WITH CHECK (id = auth.uid());

-- Ensure user_roles policies are safe
CREATE POLICY "user_roles_insert_safe" ON public.user_roles
FOR INSERT WITH CHECK (user_id = auth.uid());
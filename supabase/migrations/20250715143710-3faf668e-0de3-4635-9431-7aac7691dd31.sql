-- Clean up duplicate policies that might cause conflicts

-- Remove duplicate SELECT policies on profiles table
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;

-- Remove duplicate UPDATE policies on profiles table  
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;

-- Remove duplicate SELECT policies on roles table
DROP POLICY IF EXISTS "basic_roles_select" ON public.roles;
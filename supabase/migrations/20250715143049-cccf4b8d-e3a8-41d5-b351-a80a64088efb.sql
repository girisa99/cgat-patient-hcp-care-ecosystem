-- Clean up duplicate INSERT policies that are blocking the service role

-- Remove the old restrictive profiles INSERT policy
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

-- Remove the old restrictive user_roles INSERT policies  
DROP POLICY IF EXISTS "user_roles_insert_safe" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_system_insert" ON public.user_roles;

-- Create a new user_roles INSERT policy that allows service role insertions
CREATE POLICY "user_roles_insert_safe_new" ON public.user_roles
FOR INSERT WITH CHECK (
  user_id = auth.uid() OR 
  is_admin_user_safe(auth.uid()) OR 
  current_user = 'service_role'
);
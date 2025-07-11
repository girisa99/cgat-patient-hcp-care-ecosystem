
-- Fix infinite recursion in RLS policies by using the safe function consistently
-- Drop problematic policies that cause recursion
DROP POLICY IF EXISTS "user_roles_own_select" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_all" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_signup_insert" ON public.user_roles;

-- Create completely safe, non-recursive policies using the safe function
CREATE POLICY "user_roles_own_select_final" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_roles_admin_all_final" ON public.user_roles
  FOR ALL USING (public.is_admin_user_safe(auth.uid()));

-- Allow role assignment during signup without recursion
CREATE POLICY "user_roles_signup_insert_final" ON public.user_roles
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR public.is_admin_user_safe(auth.uid())
  );

-- Fix API keys policies to use the safe function
DROP POLICY IF EXISTS "Admins can view all API keys" ON public.api_keys;
CREATE POLICY "Admins can view all API keys safe" ON public.api_keys
  FOR SELECT USING (public.is_admin_user_safe(auth.uid()));

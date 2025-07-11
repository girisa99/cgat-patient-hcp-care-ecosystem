
-- Fix infinite recursion in user_roles RLS policies
-- Remove all existing problematic policies first
DROP POLICY IF EXISTS "profiles_own_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "user_roles_own_select" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_all" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_signup_insert" ON public.user_roles;

-- Update the existing security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = check_user_id
    AND r.name IN ('superAdmin', 'onboardingTeam')
  );
$$;

-- Create simple, non-recursive policies for profiles
CREATE POLICY "profiles_own_select" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_own_update" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (public.is_admin_user(auth.uid()));

-- Create simple, non-recursive policies for user_roles
CREATE POLICY "user_roles_own_select" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_roles_admin_all" ON public.user_roles
  FOR ALL USING (public.is_admin_user(auth.uid()));

-- Allow role assignment during signup (needed for onboarding)
CREATE POLICY "user_roles_signup_insert" ON public.user_roles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Verify the existing has_role function is properly configured
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = user_id
    AND r.name = role_name
  );
$$;

-- Update user_has_role function to match
CREATE OR REPLACE FUNCTION public.user_has_role(check_user_id uuid, role_name user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = check_user_id
    AND r.name = role_name
  );
$$;

-- Verify check_user_has_role function
CREATE OR REPLACE FUNCTION public.check_user_has_role(check_user_id uuid, role_name user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = check_user_id
    AND r.name = role_name
  );
$$;


-- Fix infinite recursion in RLS policies by updating security definer functions
-- First, drop existing problematic policies that cause recursion
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow role assignment" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_own_select" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_all" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_signup_insert" ON public.user_roles;

-- Update the security definer function to be completely non-recursive
CREATE OR REPLACE FUNCTION public.is_admin_user_safe(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  -- Direct query without any RLS recursion
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = check_user_id
    AND r.name IN ('superAdmin', 'onboardingTeam')
  );
$$;

-- Create simple, non-recursive policies for user_roles
CREATE POLICY "user_roles_own_select_safe" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_roles_admin_all_safe" ON public.user_roles
  FOR ALL USING (public.is_admin_user_safe(auth.uid()));

-- Allow role assignment during signup without recursion
CREATE POLICY "user_roles_signup_insert_safe" ON public.user_roles
  FOR INSERT WITH CHECK (
    -- Allow if user is assigning role to themselves OR if they're an admin
    user_id = auth.uid() OR public.is_admin_user_safe(auth.uid())
  );

-- Update profiles policies to use the safe function
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all_safe" ON public.profiles
  FOR ALL USING (public.is_admin_user_safe(auth.uid()));

-- Ensure API integration registry uses safe policies
DROP POLICY IF EXISTS "Admins can manage API integration registry" ON public.api_integration_registry;
CREATE POLICY "Admins can manage API integration registry safe" ON public.api_integration_registry
  FOR ALL USING (public.is_admin_user_safe(auth.uid()));

-- Update external API registry policies
DROP POLICY IF EXISTS "Users can view external APIs they created or published ones" ON public.external_api_registry;
CREATE POLICY "Users can view external APIs safe" ON public.external_api_registry
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      created_by = auth.uid() OR 
      status::text = 'published' OR 
      visibility::text IN ('public', 'marketplace') OR
      public.is_admin_user_safe(auth.uid())
    )
  );

-- Verify the function works correctly
SELECT public.is_admin_user_safe(auth.uid()) as is_admin_check;

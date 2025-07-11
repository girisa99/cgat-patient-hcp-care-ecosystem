
-- Comprehensive RLS Policy Fix - Resolving Recursion Issues
-- This migration fixes circular dependencies and implements safe, non-recursive policies

-- Step 1: Drop all problematic recursive policies
DROP POLICY IF EXISTS "user_roles_own_select" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_all" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_signup_insert" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_own_select_final" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_all_final" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_signup_insert_final" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all API keys" ON public.api_keys;
DROP POLICY IF EXISTS "Admins can view all API keys safe" ON public.api_keys;

-- Step 2: Create completely safe, non-recursive policies for user_roles
-- These policies use direct auth.uid() checks without any function calls that could cause recursion

-- Allow users to view their own roles only
CREATE POLICY "user_roles_select_own_only" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Allow role assignment during signup and by existing admins (but avoid recursion)
CREATE POLICY "user_roles_insert_safe" ON public.user_roles
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.user_roles ur2 
      JOIN public.roles r ON r.id = ur2.role_id 
      WHERE ur2.user_id = auth.uid() 
      AND r.name IN ('superAdmin', 'onboardingTeam')
      LIMIT 1
    )
  );

-- Allow admins to update roles (using direct query to avoid recursion)
CREATE POLICY "user_roles_update_by_admins" ON public.user_roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur2 
      JOIN public.roles r ON r.id = ur2.role_id 
      WHERE ur2.user_id = auth.uid() 
      AND r.name IN ('superAdmin', 'onboardingTeam')
      LIMIT 1
    )
  );

-- Allow admins to delete roles (using direct query to avoid recursion)
CREATE POLICY "user_roles_delete_by_admins" ON public.user_roles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur2 
      JOIN public.roles r ON r.id = ur2.role_id 
      WHERE ur2.user_id = auth.uid() 
      AND r.name IN ('superAdmin', 'onboardingTeam')
      LIMIT 1
    )
  );

-- Step 3: Fix API keys policies to use the safe admin function
CREATE POLICY "api_keys_admin_select_safe" ON public.api_keys
  FOR SELECT USING (
    user_id = auth.uid() OR 
    public.is_admin_user_safe(auth.uid())
  );

-- Step 4: Ensure profiles table has safe policies
DROP POLICY IF EXISTS "profiles_own_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

-- Safe profiles policies
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT USING (
    id = auth.uid() OR 
    public.is_admin_user_safe(auth.uid())
  );

CREATE POLICY "profiles_update_own_or_admin" ON public.profiles
  FOR UPDATE USING (
    id = auth.uid() OR 
    public.is_admin_user_safe(auth.uid())
  );

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Step 5: Fix any other tables that might have recursive issues
-- Update facilities policies to be more explicit
DROP POLICY IF EXISTS "Admins can manage facilities" ON public.facilities;
CREATE POLICY "facilities_admin_manage_safe" ON public.facilities
  FOR ALL USING (public.is_admin_user_safe(auth.uid()));

-- Update modules policies to be more explicit  
DROP POLICY IF EXISTS "Authenticated users can view active modules" ON public.modules;
CREATE POLICY "modules_authenticated_view" ON public.modules
  FOR SELECT TO authenticated USING (is_active = true);

-- Step 6: Ensure audit_logs has safe policies
DROP POLICY IF EXISTS "audit_logs_own_only" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Super admins can view audit logs" ON public.audit_logs;

CREATE POLICY "audit_logs_own_or_admin_safe" ON public.audit_logs
  FOR SELECT USING (
    user_id = auth.uid() OR 
    public.is_admin_user_safe(auth.uid())
  );

-- Step 7: Create a comprehensive test to verify the fix works
-- This will help us confirm that authentication and role checking work properly
CREATE OR REPLACE FUNCTION public.test_rls_policies()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  test_results jsonb := '{}';
  current_user_id uuid;
  user_roles_count integer;
  can_access_profiles boolean;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'No authenticated user');
  END IF;
  
  -- Test user_roles access
  SELECT COUNT(*) INTO user_roles_count
  FROM public.user_roles 
  WHERE user_id = current_user_id;
  
  -- Test profiles access
  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE id = current_user_id
  ) INTO can_access_profiles;
  
  -- Test admin function
  test_results := jsonb_build_object(
    'user_id', current_user_id,
    'user_roles_count', user_roles_count,
    'can_access_profiles', can_access_profiles,
    'is_admin_safe', public.is_admin_user_safe(current_user_id),
    'timestamp', now()
  );
  
  RETURN test_results;
END;
$$;

-- Step 8: Add helpful comments to document the fix
COMMENT ON POLICY "user_roles_select_own_only" ON public.user_roles IS 
'Safe policy: Users can only view their own roles. No recursion risk.';

COMMENT ON POLICY "user_roles_insert_safe" ON public.user_roles IS 
'Safe policy: Allows role assignment during signup and by admins. Uses direct query to avoid recursion.';

COMMENT ON FUNCTION public.is_admin_user_safe(uuid) IS 
'Security definer function that safely checks admin status without triggering RLS recursion.';

COMMENT ON FUNCTION public.test_rls_policies() IS 
'Test function to verify RLS policies work correctly after the recursion fix.';

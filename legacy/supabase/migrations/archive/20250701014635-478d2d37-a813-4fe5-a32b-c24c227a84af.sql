
-- Comprehensive RLS Policy Verification and Enhancement
-- This will ensure all critical tables have proper RLS policies before consolidation

-- First, let's verify and enhance profiles table policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  );

-- Verify user_roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all user roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  );

CREATE POLICY "Admins can manage user roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  );

-- Verify roles table policies
DROP POLICY IF EXISTS "Authenticated users can view roles" ON public.roles;

CREATE POLICY "Authenticated users can view roles"
  ON public.roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage roles"
  ON public.roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() 
      AND r.name = 'superAdmin'
    )
  );

-- Verify facilities policies
DROP POLICY IF EXISTS "Authenticated users can view facilities" ON public.facilities;
DROP POLICY IF EXISTS "Admins can manage facilities" ON public.facilities;

CREATE POLICY "Authenticated users can view facilities"
  ON public.facilities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage facilities"
  ON public.facilities FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  );

-- Verify API keys policies (for API Services page)
DROP POLICY IF EXISTS "Users can view their own API keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can manage their own API keys" ON public.api_keys;
DROP POLICY IF EXISTS "Admins can view all API keys" ON public.api_keys;

CREATE POLICY "Users can view their own API keys"
  ON public.api_keys FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own API keys"
  ON public.api_keys FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all API keys"
  ON public.api_keys FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  );

-- Add audit logging policies for system verification
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  );

-- Ensure active_issues table has proper policies for system health monitoring
DROP POLICY IF EXISTS "Admins can view active issues" ON public.active_issues;
DROP POLICY IF EXISTS "Admins can manage active issues" ON public.active_issues;

CREATE POLICY "Admins can view active issues"
  ON public.active_issues FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  );

CREATE POLICY "Admins can manage active issues"
  ON public.active_issues FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  );

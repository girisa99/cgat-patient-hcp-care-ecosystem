
-- First, completely drop ALL existing RLS policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Super admins can manage user roles" ON user_roles;
DROP POLICY IF EXISTS "Onboarding team can manage user roles" ON user_roles;
DROP POLICY IF EXISTS "All authenticated users can view facilities" ON facilities;
DROP POLICY IF EXISTS "Users can view own facility access" ON user_facility_access;
DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Super admins can view all audit logs" ON audit_logs;
DROP POLICY IF EXISTS "All authenticated users can view feature flags" ON feature_flags;
DROP POLICY IF EXISTS "Super admins can manage feature flags" ON feature_flags;
DROP POLICY IF EXISTS "All authenticated users can view roles" ON roles;
DROP POLICY IF EXISTS "All authenticated users can view permissions" ON permissions;
DROP POLICY IF EXISTS "All authenticated users can view role permissions" ON role_permissions;

-- Create the absolute simplest RLS policies possible

-- Profiles: Only allow users to see their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- User roles: Allow users to see their own roles
CREATE POLICY "user_roles_select_own" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Allow all authenticated users to read reference tables (no user-specific data)
CREATE POLICY "roles_select_all" ON roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "permissions_select_all" ON permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "role_permissions_select_all" ON role_permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "facilities_select_all" ON facilities 
  FOR SELECT TO authenticated USING (true);

-- For admin functions, create a simple policy that allows management by checking user_id directly
CREATE POLICY "user_roles_admin_manage" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur2 
      JOIN roles r ON r.id = ur2.role_id 
      WHERE ur2.user_id = auth.uid() 
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  );

-- Feature flags and audit logs - simple policies
CREATE POLICY "feature_flags_select_all" ON feature_flags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "audit_logs_select_own" ON audit_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_facility_access_select_own" ON user_facility_access
  FOR SELECT USING (user_id = auth.uid());

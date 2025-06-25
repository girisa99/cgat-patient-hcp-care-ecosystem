
-- Fix the overly restrictive RLS policies that are preventing user data from loading

-- Drop the current restrictive policies
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "user_roles_select_own" ON user_roles;
DROP POLICY IF EXISTS "user_roles_admin_manage" ON user_roles;
DROP POLICY IF EXISTS "roles_select_all" ON roles;
DROP POLICY IF EXISTS "permissions_select_all" ON permissions;
DROP POLICY IF EXISTS "role_permissions_select_all" ON role_permissions;
DROP POLICY IF EXISTS "facilities_select_all" ON facilities;
DROP POLICY IF EXISTS "feature_flags_select_all" ON feature_flags;
DROP POLICY IF EXISTS "audit_logs_select_own" ON audit_logs;
DROP POLICY IF EXISTS "user_facility_access_select_own" ON user_facility_access;

-- Create properly permissive policies that actually work

-- Profiles: Users can see their own profile, admins can see all
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT USING (
    id = auth.uid() 
    OR check_user_has_role(auth.uid(), 'superAdmin')
  );

CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- User roles: Users can see their own roles, admins can manage all
CREATE POLICY "user_roles_select_policy" ON user_roles
  FOR SELECT USING (
    user_id = auth.uid()
    OR check_user_has_role(auth.uid(), 'superAdmin')
    OR check_user_has_role(auth.uid(), 'onboardingTeam')
  );

CREATE POLICY "user_roles_manage_policy" ON user_roles
  FOR ALL USING (
    check_user_has_role(auth.uid(), 'superAdmin')
    OR check_user_has_role(auth.uid(), 'onboardingTeam')
  );

-- Reference tables: All authenticated users can read these
CREATE POLICY "roles_select_policy" ON roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "permissions_select_policy" ON permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "role_permissions_select_policy" ON role_permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "facilities_select_policy" ON facilities 
  FOR SELECT TO authenticated USING (true);

-- Feature flags: All authenticated users can read
CREATE POLICY "feature_flags_select_policy" ON feature_flags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "feature_flags_manage_policy" ON feature_flags
  FOR ALL USING (check_user_has_role(auth.uid(), 'superAdmin'));

-- Audit logs: Users can see their own, admins can see all
CREATE POLICY "audit_logs_select_policy" ON audit_logs
  FOR SELECT USING (
    user_id = auth.uid()
    OR check_user_has_role(auth.uid(), 'superAdmin')
  );

-- User facility access: Users can see their own access
CREATE POLICY "user_facility_access_select_policy" ON user_facility_access
  FOR SELECT USING (
    user_id = auth.uid()
    OR check_user_has_role(auth.uid(), 'superAdmin')
    OR check_user_has_role(auth.uid(), 'onboardingTeam')
  );

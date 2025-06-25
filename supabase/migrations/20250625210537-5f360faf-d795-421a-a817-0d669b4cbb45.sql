
-- Drop ALL existing RLS policies to start completely fresh
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "user_roles_select_policy" ON user_roles;
DROP POLICY IF EXISTS "user_roles_manage_policy" ON user_roles;
DROP POLICY IF EXISTS "roles_select_policy" ON roles;
DROP POLICY IF EXISTS "permissions_select_policy" ON permissions;
DROP POLICY IF EXISTS "role_permissions_select_policy" ON role_permissions;
DROP POLICY IF EXISTS "facilities_select_policy" ON facilities;
DROP POLICY IF EXISTS "feature_flags_select_policy" ON feature_flags;
DROP POLICY IF EXISTS "feature_flags_manage_policy" ON feature_flags;
DROP POLICY IF EXISTS "audit_logs_select_policy" ON audit_logs;
DROP POLICY IF EXISTS "user_facility_access_select_policy" ON user_facility_access;

-- Create the absolute simplest possible policies that work

-- Profiles: Users can see their own profile, period
CREATE POLICY "profiles_own_only" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- User roles: Users can see their own roles, period
CREATE POLICY "user_roles_own_only" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Reference tables: Everyone authenticated can read these (no user-specific filtering)
CREATE POLICY "roles_read_all" ON roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "permissions_read_all" ON permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "role_permissions_read_all" ON role_permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "facilities_read_all" ON facilities 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "feature_flags_read_all" ON feature_flags
  FOR SELECT TO authenticated USING (true);

-- Simple audit and facility access policies
CREATE POLICY "audit_logs_own_only" ON audit_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_facility_access_own_only" ON user_facility_access
  FOR SELECT USING (user_id = auth.uid());

-- For admin operations, we'll handle permissions in the application layer
-- rather than trying to do complex RLS checks that cause recursion

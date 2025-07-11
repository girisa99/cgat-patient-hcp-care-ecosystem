
-- First, let's completely drop all existing RLS policies that are causing infinite recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Managers can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their facility" ON facilities;
DROP POLICY IF EXISTS "Users can view their facility access" ON user_facility_access;
DROP POLICY IF EXISTS "Users can view their own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Super admins can view all audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Authenticated users can view feature flags" ON feature_flags;
DROP POLICY IF EXISTS "Super admins can manage feature flags" ON feature_flags;
DROP POLICY IF EXISTS "Authenticated users can view roles" ON roles;
DROP POLICY IF EXISTS "Authenticated users can view permissions" ON permissions;
DROP POLICY IF EXISTS "Authenticated users can view role permissions" ON role_permissions;

-- Create completely safe, non-recursive RLS policies

-- Profiles: Simple policies that don't reference other tables
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Super simple admin policy using the security definer function
CREATE POLICY "Super admins can view all profiles" ON profiles
  FOR SELECT USING (public.check_user_has_role(auth.uid(), 'superAdmin'));

-- User roles: Simple policies
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage user roles" ON user_roles
  FOR ALL USING (public.check_user_has_role(auth.uid(), 'superAdmin'));

CREATE POLICY "Onboarding team can manage user roles" ON user_roles
  FOR ALL USING (public.check_user_has_role(auth.uid(), 'onboardingTeam'));

-- Facilities: Simple policy
CREATE POLICY "All authenticated users can view facilities" ON facilities
  FOR SELECT TO authenticated USING (true);

-- User facility access
CREATE POLICY "Users can view own facility access" ON user_facility_access
  FOR SELECT USING (user_id = auth.uid());

-- Audit logs
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all audit logs" ON audit_logs
  FOR SELECT USING (public.check_user_has_role(auth.uid(), 'superAdmin'));

-- Feature flags
CREATE POLICY "All authenticated users can view feature flags" ON feature_flags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Super admins can manage feature flags" ON feature_flags
  FOR ALL USING (public.check_user_has_role(auth.uid(), 'superAdmin'));

-- Roles and permissions (read-only for authenticated users)
CREATE POLICY "All authenticated users can view roles" ON roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "All authenticated users can view permissions" ON permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "All authenticated users can view role permissions" ON role_permissions
  FOR SELECT TO authenticated USING (true);

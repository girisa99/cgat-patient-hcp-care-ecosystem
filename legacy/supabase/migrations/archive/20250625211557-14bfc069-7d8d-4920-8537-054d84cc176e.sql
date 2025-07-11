
-- Drop all existing RLS policies to start fresh
DROP POLICY IF EXISTS "Users can view their facility" ON facilities;
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view user roles" ON user_roles;
DROP POLICY IF EXISTS "Authenticated users can view permissions" ON permissions;
DROP POLICY IF EXISTS "Authenticated users can view role permissions" ON role_permissions;

-- Create the most basic RLS policies possible to avoid recursion
-- Profiles: Users can only see their own profile (no function calls)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- User roles: Users can only see their own roles (no function calls)
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Permissions: All authenticated users can view (no restrictions)
CREATE POLICY "All authenticated users can view permissions" ON permissions
  FOR SELECT TO authenticated USING (true);

-- Role permissions: All authenticated users can view (no restrictions)
CREATE POLICY "All authenticated users can view role permissions" ON role_permissions
  FOR SELECT TO authenticated USING (true);

-- Facilities: All authenticated users can view (simplified for now)
CREATE POLICY "All authenticated users can view facilities" ON facilities
  FOR SELECT TO authenticated USING (true);

-- Roles table: All authenticated users can view roles
CREATE POLICY "All authenticated users can view roles" ON roles
  FOR SELECT TO authenticated USING (true);

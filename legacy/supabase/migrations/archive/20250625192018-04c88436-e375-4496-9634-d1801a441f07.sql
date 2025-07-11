
-- Fix the infinite recursion in RLS policies by updating them properly

-- First, drop the existing problematic policies
DROP POLICY IF EXISTS "Users can view their facility" ON facilities;
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view user roles" ON user_roles;

-- Create non-recursive RLS policies for facilities
CREATE POLICY "Users can view facilities" ON facilities
  FOR SELECT USING (
    id = (SELECT facility_id FROM profiles WHERE id = auth.uid() LIMIT 1)
    OR EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON r.id = ur.role_id 
      WHERE ur.user_id = auth.uid() AND r.name = 'superAdmin'
    )
  );

-- Create non-recursive RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins and managers can view profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON r.id = ur.role_id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('superAdmin', 'caseManager')
    )
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Create non-recursive RLS policies for user_roles
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all user roles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON r.id = ur.role_id 
      WHERE ur.user_id = auth.uid() AND r.name = 'superAdmin'
    )
  );

CREATE POLICY "Admins and onboarding team can manage user roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON r.id = ur.role_id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  );

-- Ensure the audit logs policies don't cause recursion
DROP POLICY IF EXISTS "Super admins can view all audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can view their own audit logs" ON audit_logs;

CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON r.id = ur.role_id 
      WHERE ur.user_id = auth.uid() AND r.name = 'superAdmin'
    )
  );

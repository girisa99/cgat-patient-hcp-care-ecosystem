
-- Fix role assignment by updating RLS policies
-- The issue is that the current policies are too restrictive for role assignment

-- First, let's check and update the user_roles policies
DROP POLICY IF EXISTS "basic_user_roles_select" ON user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;

-- Create more permissive policies for user_roles
-- Allow users to view their own roles
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Allow admins to view all roles
CREATE POLICY "Admins can view all roles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur2 
      JOIN roles r ON r.id = ur2.role_id 
      WHERE ur2.user_id = auth.uid() 
      AND r.name = 'superAdmin'
    )
  );

-- CRITICAL: Allow role assignment during signup
-- This policy allows INSERT operations when the user is the target of the role assignment
-- or when an admin/onboarding team member is assigning roles
CREATE POLICY "Allow role assignment" ON user_roles
  FOR INSERT WITH CHECK (
    -- Allow users to be assigned roles (for signup process)
    user_id = auth.uid()
    OR
    -- Allow admins and onboarding team to assign roles
    EXISTS (
      SELECT 1 FROM user_roles ur2 
      JOIN roles r ON r.id = ur2.role_id 
      WHERE ur2.user_id = auth.uid() 
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  );

-- Allow role updates and deletions for admins
CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur2 
      JOIN roles r ON r.id = ur2.role_id 
      WHERE ur2.user_id = auth.uid() 
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  );

-- Ensure roles table is readable by authenticated users
DROP POLICY IF EXISTS "basic_roles_select" ON roles;
DROP POLICY IF EXISTS "Authenticated users can view roles" ON roles;

CREATE POLICY "Authenticated users can view roles" ON roles
  FOR SELECT TO authenticated USING (true);

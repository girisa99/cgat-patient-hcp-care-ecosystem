
-- Fix the role assignment RLS policy
-- The current policy is too restrictive and prevents initial role assignment

-- Drop the problematic policy
DROP POLICY IF EXISTS "Allow role assignment" ON user_roles;

-- Create a more permissive policy for INSERT operations
-- This allows any authenticated user to have roles assigned to them
-- This is necessary for the signup process to work
CREATE POLICY "Allow role assignment during signup" ON user_roles
  FOR INSERT WITH CHECK (
    -- Allow any authenticated user to have roles assigned
    -- This is needed for signup process and admin assignment
    auth.role() = 'authenticated'
  );

-- Also make sure we have a policy for admins to assign roles to others
CREATE POLICY "Admins can assign roles to anyone" ON user_roles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur2 
      JOIN roles r ON r.id = ur2.role_id 
      WHERE ur2.user_id = auth.uid() 
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  );

-- Create a more flexible UPDATE/DELETE policy for admins
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;

CREATE POLICY "Admins can update and delete roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur2 
      JOIN roles r ON r.id = ur2.role_id 
      WHERE ur2.user_id = auth.uid() 
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  );

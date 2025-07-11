
-- Drop the existing function first
DROP FUNCTION IF EXISTS get_user_effective_modules(UUID);

-- Fix audit_logs RLS policy to allow authenticated users to insert their own logs
DROP POLICY IF EXISTS "Users can insert audit logs" ON audit_logs;
CREATE POLICY "Users can insert audit logs" 
  ON audit_logs 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Ensure audit_logs RLS is enabled
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create a policy for viewing audit logs (only super admins)
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;  
CREATE POLICY "Super admins can view audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'superAdmin'
    )
  );

-- Create function to get user effective modules
CREATE OR REPLACE FUNCTION get_user_effective_modules(check_user_id UUID)
RETURNS TABLE (
  module_id UUID,
  module_name TEXT,
  module_description TEXT,
  access_source TEXT,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Direct user module assignments
  SELECT 
    m.id as module_id,
    m.name as module_name,
    m.description as module_description,
    'direct'::TEXT as access_source,
    uma.expires_at
  FROM user_module_assignments uma
  JOIN modules m ON uma.module_id = m.id
  WHERE uma.user_id = check_user_id 
    AND uma.is_active = true
    AND m.is_active = true
    AND (uma.expires_at IS NULL OR uma.expires_at > NOW())
  
  UNION
  
  -- Role-based module assignments
  SELECT 
    m.id as module_id,
    m.name as module_name,
    m.description as module_description,
    'role'::TEXT as access_source,
    NULL::TIMESTAMPTZ as expires_at
  FROM user_roles ur
  JOIN role_module_assignments rma ON ur.role_id = rma.role_id
  JOIN modules m ON rma.module_id = m.id
  WHERE ur.user_id = check_user_id
    AND rma.is_active = true
    AND m.is_active = true;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_effective_modules(UUID) TO authenticated;

-- Create RLS policies for module-related tables if they don't exist
ALTER TABLE user_module_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_module_assignments ENABLE ROW LEVEL SECURITY;

-- Policy for user_module_assignments
DROP POLICY IF EXISTS "Users can view their module assignments" ON user_module_assignments;
CREATE POLICY "Users can view their module assignments"
  ON user_module_assignments
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  );

-- Policy for inserting user module assignments (super admins and onboarding team only)
DROP POLICY IF EXISTS "Admins can manage user module assignments" ON user_module_assignments;
CREATE POLICY "Admins can manage user module assignments"
  ON user_module_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  );

-- Policy for role_module_assignments
DROP POLICY IF EXISTS "Admins can manage role module assignments" ON role_module_assignments;
CREATE POLICY "Admins can manage role module assignments"
  ON role_module_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  );

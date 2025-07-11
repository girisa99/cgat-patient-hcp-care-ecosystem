
-- First, let's ensure we have all the core roles defined
DO $$
BEGIN
    -- Add any missing roles to the user_role enum if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM (
            'superAdmin',
            'onboardingTeam', 
            'healthcareProvider',
            'caseManager',
            'nurse',
            'patientCaregiver',
            'financeTeam',
            'contractTeam',
            'workflowManager',
            'technicalServices'
        );
    END IF;
END $$;

-- Add the new technicalServices role if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM unnest(enum_range(NULL::user_role)) AS e(enumval) WHERE enumval = 'technicalServices') THEN
        ALTER TYPE user_role ADD VALUE 'technicalServices';
    END IF;
END $$;

-- Insert core roles into roles table
INSERT INTO roles (name, description) VALUES 
    ('superAdmin', 'System Administrator with full access'),
    ('onboardingTeam', 'Onboarding team members with administrative privileges'),
    ('healthcareProvider', 'Healthcare providers and clinical staff'),
    ('caseManager', 'Case managers with care coordination access'),
    ('nurse', 'Nursing staff with patient care access'),
    ('patientCaregiver', 'Patients and their caregivers'),
    ('financeTeam', 'Finance team members'),
    ('contractTeam', 'Contract team members'),
    ('workflowManager', 'Workflow and process managers'),  
    ('technicalServices', 'Technical staff for API testing, CMS, testing suite, workflow automation')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- Insert all 11 core modules
INSERT INTO modules (name, description, is_active) VALUES 
    ('Dashboard', 'Main dashboard and overview', true),
    ('User Management', 'User administration and management', true),
    ('Patient Management', 'Patient data and care management', true),
    ('Facility Management', 'Healthcare facility administration', true),
    ('Module Management', 'System module configuration', true),
    ('API Services', 'API integration and management services', true),
    ('Security Management', 'Security settings and access control', true),
    ('Testing Suite', 'Comprehensive testing and validation tools', true),
    ('Data Import/Export', 'Data migration and export utilities', true),
    ('Active Verification', 'Real-time verification and monitoring', true),
    ('Onboarding', 'User and facility onboarding workflows', true),
    ('Care Coordination', 'Case management and care coordination', true),
    ('Content Management', 'Content and document management system', true),
    ('Workflow Automation', 'Process automation and workflow management', true)
ON CONFLICT (name) DO UPDATE SET 
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;

-- Create role-module assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS role_module_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    access_level VARCHAR(50) DEFAULT 'read',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(role_id, module_id)
);

-- Enable RLS on role_module_assignments
ALTER TABLE role_module_assignments ENABLE ROW LEVEL SECURITY;

-- Create user_module_assignments table for direct user-module assignments
CREATE TABLE IF NOT EXISTS user_module_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    access_level VARCHAR(50) DEFAULT 'read',
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    assigned_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, module_id)
);

-- Enable RLS on user_module_assignments  
ALTER TABLE user_module_assignments ENABLE ROW LEVEL SECURITY;

-- Now set up role-module assignments based on your requirements

-- SuperAdmin: Full access to all modules
INSERT INTO role_module_assignments (role_id, module_id, access_level)
SELECT r.id, m.id, 'admin'
FROM roles r 
CROSS JOIN modules m 
WHERE r.name = 'superAdmin'
ON CONFLICT (role_id, module_id) DO UPDATE SET access_level = 'admin';

-- Onboarding Team: Access to onboarding and user management
INSERT INTO role_module_assignments (role_id, module_id, access_level)
SELECT r.id, m.id, 'write'
FROM roles r 
CROSS JOIN modules m 
WHERE r.name = 'onboardingTeam' 
AND m.name IN ('Onboarding', 'User Management', 'Facility Management', 'Dashboard')
ON CONFLICT (role_id, module_id) DO UPDATE SET access_level = 'write';

-- Healthcare Provider: Healthcare-focused modules
INSERT INTO role_module_assignments (role_id, module_id, access_level)
SELECT r.id, m.id, 'write'
FROM roles r 
CROSS JOIN modules m 
WHERE r.name = 'healthcareProvider' 
AND m.name IN ('Patient Management', 'Facility Management', 'Care Coordination', 'Dashboard')
ON CONFLICT (role_id, module_id) DO UPDATE SET access_level = 'write';

-- Patient Caregiver: Patient-focused access (can search with patient or caregiver context)
INSERT INTO role_module_assignments (role_id, module_id, access_level)
SELECT r.id, m.id, 'read'
FROM roles r 
CROSS JOIN modules m 
WHERE r.name = 'patientCaregiver' 
AND m.name IN ('Patient Management', 'Dashboard')
ON CONFLICT (role_id, module_id) DO UPDATE SET access_level = 'read';

-- Case Manager: Care coordination focus
INSERT INTO role_module_assignments (role_id, module_id, access_level)
SELECT r.id, m.id, 'write'
FROM roles r 
CROSS JOIN modules m 
WHERE r.name = 'caseManager' 
AND m.name IN ('Care Coordination', 'Patient Management', 'Dashboard')
ON CONFLICT (role_id, module_id) DO UPDATE SET access_level = 'write';

-- Nurse: Patient care access
INSERT INTO role_module_assignments (role_id, module_id, access_level)
SELECT r.id, m.id, 'write'
FROM roles r 
CROSS JOIN modules m 
WHERE r.name = 'nurse' 
AND m.name IN ('Patient Management', 'Care Coordination', 'Dashboard')
ON CONFLICT (role_id, module_id) DO UPDATE SET access_level = 'write';

-- Technical Services: All technical modules (API, Testing, CMS, Workflow, etc.)
INSERT INTO role_module_assignments (role_id, module_id, access_level)
SELECT r.id, m.id, 'admin'
FROM roles r 
CROSS JOIN modules m 
WHERE r.name = 'technicalServices' 
AND m.name IN ('API Services', 'Testing Suite', 'Content Management', 'Workflow Automation', 'Data Import/Export', 'Active Verification', 'Dashboard')
ON CONFLICT (role_id, module_id) DO UPDATE SET access_level = 'admin';

-- API Services and Testing Suite: Available to ALL users who have module access
INSERT INTO role_module_assignments (role_id, module_id, access_level)
SELECT r.id, m.id, 'read'
FROM roles r 
CROSS JOIN modules m 
WHERE m.name IN ('API Services', 'Testing Suite')
AND r.name IN ('healthcareProvider', 'caseManager', 'nurse', 'onboardingTeam', 'workflowManager', 'financeTeam', 'contractTeam')
ON CONFLICT (role_id, module_id) DO UPDATE SET access_level = GREATEST(EXCLUDED.access_level, role_module_assignments.access_level);

-- Create RLS policies for role_module_assignments
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

-- Create RLS policies for user_module_assignments
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

-- Update the modules table RLS to allow authenticated users to view active modules
DROP POLICY IF EXISTS "modules_authenticated_view" ON modules;
CREATE POLICY "modules_authenticated_view"
  ON modules
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Allow admins to manage modules
DROP POLICY IF EXISTS "modules_admin_manage" ON modules;
CREATE POLICY "modules_admin_manage"
  ON modules
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

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_role_module_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_role_module_assignments_updated_at ON role_module_assignments;
CREATE TRIGGER update_role_module_assignments_updated_at
  BEFORE UPDATE ON role_module_assignments
  FOR EACH ROW EXECUTE FUNCTION update_role_module_assignments_updated_at();

DROP TRIGGER IF EXISTS update_user_module_assignments_updated_at ON user_module_assignments;
CREATE TRIGGER update_user_module_assignments_updated_at
  BEFORE UPDATE ON user_module_assignments
  FOR EACH ROW EXECUTE FUNCTION update_role_module_assignments_updated_at();

-- Update the get_user_effective_modules function to handle the fixed relationships
DROP FUNCTION IF EXISTS get_user_effective_modules(UUID);
CREATE OR REPLACE FUNCTION get_user_effective_modules(check_user_id UUID)
RETURNS TABLE (
  module_id UUID,
  module_name TEXT,
  module_description TEXT,
  access_source TEXT,
  access_level TEXT,
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
    COALESCE(m.description, '') as module_description,
    'direct'::TEXT as access_source,
    uma.access_level as access_level,
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
    COALESCE(m.description, '') as module_description,
    r.name::TEXT as access_source,
    rma.access_level as access_level,
    NULL::TIMESTAMPTZ as expires_at
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  JOIN role_module_assignments rma ON ur.role_id = rma.role_id
  JOIN modules m ON rma.module_id = m.id
  WHERE ur.user_id = check_user_id
    AND rma.is_active = true
    AND m.is_active = true;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_effective_modules(UUID) TO authenticated;


-- Create a more granular permissions system
-- First, let's add more specific permissions
INSERT INTO permissions (name, description) VALUES 
  ('create_users', 'Create new user accounts'),
  ('edit_users', 'Edit user profiles and information'),
  ('delete_users', 'Delete user accounts'),
  ('assign_roles', 'Assign roles to users'),
  ('remove_roles', 'Remove roles from users'),
  ('view_all_users', 'View all users in the system'),
  ('manage_facilities', 'Create, edit, and delete facilities'),
  ('view_facilities', 'View facility information'),
  ('manage_user_facility_access', 'Assign users to facilities'),
  ('view_audit_logs', 'View system audit logs'),
  ('manage_system_settings', 'Access system configuration'),
  ('bulk_user_operations', 'Perform bulk operations on users'),
  ('export_data', 'Export system data'),
  ('import_data', 'Import data into the system')
ON CONFLICT (name) DO NOTHING;

-- Create user_permissions table for individual user permissions (overrides)
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, permission_id)
);

-- Create role_permission_overrides table for dynamic role permissions
CREATE TABLE IF NOT EXISTS public.role_permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  is_granted BOOLEAN DEFAULT true, -- true = grant, false = revoke
  facility_id UUID REFERENCES facilities(id), -- optional: facility-specific permissions
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_id, facility_id)
);

-- Assign default permissions to existing roles
-- Super Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'superAdmin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Healthcare Provider permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'healthcareProvider' 
AND p.name IN ('view_patients', 'edit_patients', 'view_facilities')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Nurse permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'nurse' 
AND p.name IN ('view_patients', 'edit_patients')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Case Manager permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'caseManager' 
AND p.name IN ('view_patients', 'edit_patients', 'view_all_users', 'view_facilities', 'manage_user_facility_access')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Onboarding Team permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'onboardingTeam' 
AND p.name IN ('create_users', 'edit_users', 'assign_roles', 'manage_facilities', 'view_facilities', 'manage_user_facility_access', 'bulk_user_operations')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Patient Caregiver permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'patientCaregiver' 
AND p.name IN ('view_patients')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permission_overrides ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_permissions
CREATE POLICY "Super admins can view all user permissions" ON user_permissions
  FOR SELECT USING (has_role(auth.uid(), 'superAdmin'));

CREATE POLICY "Users can view their own permissions" ON user_permissions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage user permissions" ON user_permissions
  FOR ALL USING (has_role(auth.uid(), 'superAdmin'));

-- RLS policies for role_permission_overrides
CREATE POLICY "Super admins can view role permission overrides" ON role_permission_overrides
  FOR SELECT USING (has_role(auth.uid(), 'superAdmin'));

CREATE POLICY "Super admins can manage role permission overrides" ON role_permission_overrides
  FOR ALL USING (has_role(auth.uid(), 'superAdmin'));

-- Create enhanced permission checking function
CREATE OR REPLACE FUNCTION public.user_has_permission(check_user_id UUID, permission_name TEXT, facility_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  -- Check if user has direct permission grant
  SELECT CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM public.user_permissions up
      JOIN public.permissions p ON p.id = up.permission_id
      WHERE up.user_id = check_user_id 
      AND p.name = permission_name
      AND up.is_active = true
      AND (up.expires_at IS NULL OR up.expires_at > NOW())
    ) THEN true
    
    -- Check role-based permissions with overrides
    WHEN EXISTS (
      SELECT 1
      FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      JOIN public.role_permissions rp ON rp.role_id = r.id
      JOIN public.permissions p ON p.id = rp.permission_id
      LEFT JOIN public.role_permission_overrides rpo ON (
        rpo.role_id = r.id 
        AND rpo.permission_id = p.id 
        AND (rpo.facility_id = facility_id OR rpo.facility_id IS NULL)
      )
      WHERE ur.user_id = check_user_id
      AND p.name = permission_name
      AND (rpo.is_granted IS NULL OR rpo.is_granted = true)
    ) THEN true
    
    ELSE false
  END;
$$;

-- Create function to get user's effective permissions (fixed type matching)
CREATE OR REPLACE FUNCTION public.get_user_effective_permissions(check_user_id UUID, facility_id UUID DEFAULT NULL)
RETURNS TABLE(permission_name TEXT, source TEXT, expires_at TIMESTAMP WITH TIME ZONE)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  -- Direct user permissions
  SELECT 
    p.name,
    'direct'::TEXT as source,
    up.expires_at
  FROM public.user_permissions up
  JOIN public.permissions p ON p.id = up.permission_id
  WHERE up.user_id = check_user_id 
  AND up.is_active = true
  AND (up.expires_at IS NULL OR up.expires_at > NOW())
  
  UNION
  
  -- Role-based permissions
  SELECT DISTINCT
    p.name,
    r.name::TEXT as source,
    NULL::TIMESTAMP WITH TIME ZONE as expires_at
  FROM public.user_roles ur
  JOIN public.roles r ON r.id = ur.role_id
  JOIN public.role_permissions rp ON rp.role_id = r.id
  JOIN public.permissions p ON p.id = rp.permission_id
  LEFT JOIN public.role_permission_overrides rpo ON (
    rpo.role_id = r.id 
    AND rpo.permission_id = p.id 
    AND (rpo.facility_id = facility_id OR rpo.facility_id IS NULL)
  )
  WHERE ur.user_id = check_user_id
  AND (rpo.is_granted IS NULL OR rpo.is_granted = true)
  -- Exclude permissions that are directly granted (to avoid duplicates)
  AND NOT EXISTS (
    SELECT 1 
    FROM public.user_permissions up2
    JOIN public.permissions p2 ON p2.id = up2.permission_id
    WHERE up2.user_id = check_user_id 
    AND p2.name = p.name
    AND up2.is_active = true
    AND (up2.expires_at IS NULL OR up2.expires_at > NOW())
  );
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission_id ON user_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_role_permission_overrides_role_id ON role_permission_overrides(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permission_overrides_permission_id ON role_permission_overrides(permission_id);

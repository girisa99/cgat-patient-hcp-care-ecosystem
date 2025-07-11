
-- Check existing constraints and add only the missing ones

-- Add missing foreign key relationships (only if they don't exist)
DO $$
BEGIN
    -- Check and add user_roles constraints
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_roles_user_id_fkey' 
        AND table_name = 'user_roles'
    ) THEN
        ALTER TABLE user_roles 
        ADD CONSTRAINT user_roles_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_roles_role_id_fkey' 
        AND table_name = 'user_roles'
    ) THEN
        ALTER TABLE user_roles 
        ADD CONSTRAINT user_roles_role_id_fkey 
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_roles_assigned_by_fkey' 
        AND table_name = 'user_roles'
    ) THEN
        ALTER TABLE user_roles 
        ADD CONSTRAINT user_roles_assigned_by_fkey 
        FOREIGN KEY (assigned_by) REFERENCES auth.users(id);
    END IF;

    -- Check and add role_permissions constraints
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'role_permissions_role_id_fkey' 
        AND table_name = 'role_permissions'
    ) THEN
        ALTER TABLE role_permissions 
        ADD CONSTRAINT role_permissions_role_id_fkey 
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'role_permissions_permission_id_fkey' 
        AND table_name = 'role_permissions'
    ) THEN
        ALTER TABLE role_permissions 
        ADD CONSTRAINT role_permissions_permission_id_fkey 
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE;
    END IF;

    -- Check and add user_facility_access constraints
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_facility_access_user_id_fkey' 
        AND table_name = 'user_facility_access'
    ) THEN
        ALTER TABLE user_facility_access 
        ADD CONSTRAINT user_facility_access_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_facility_access_granted_by_fkey' 
        AND table_name = 'user_facility_access'
    ) THEN
        ALTER TABLE user_facility_access 
        ADD CONSTRAINT user_facility_access_granted_by_fkey 
        FOREIGN KEY (granted_by) REFERENCES auth.users(id);
    END IF;
END $$;

-- Implement comprehensive RLS policies

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their facility" ON facilities;
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view user roles" ON user_roles;
DROP POLICY IF EXISTS "Authenticated users can view permissions" ON permissions;
DROP POLICY IF EXISTS "Authenticated users can view role permissions" ON role_permissions;
DROP POLICY IF EXISTS "Users can view their facility access" ON user_facility_access;

-- Facilities: Users can view facilities they belong to or have access to
CREATE POLICY "Users can view accessible facilities" ON facilities
  FOR SELECT USING (
    id IN (
      -- User's primary facility
      SELECT facility_id FROM profiles WHERE id = auth.uid()
      UNION
      -- Facilities with explicit access
      SELECT facility_id FROM user_facility_access 
      WHERE user_id = auth.uid() AND is_active = true
    )
    OR has_role(auth.uid(), 'superAdmin')
    OR has_role(auth.uid(), 'onboardingTeam')
  );

-- Super admins and onboarding team can manage facilities
CREATE POLICY "Admins can manage facilities" ON facilities
  FOR ALL USING (
    has_role(auth.uid(), 'superAdmin')
    OR has_role(auth.uid(), 'onboardingTeam')
  );

-- Profiles: Enhanced access control
CREATE POLICY "Users can view accessible profiles" ON profiles
  FOR SELECT USING (
    id = auth.uid() 
    OR has_role(auth.uid(), 'superAdmin')
    OR has_role(auth.uid(), 'caseManager')
    OR has_role(auth.uid(), 'onboardingTeam')
    OR (
      -- Can view profiles from same facility
      facility_id IN (
        SELECT facility_id FROM profiles WHERE id = auth.uid()
        UNION
        SELECT facility_id FROM user_facility_access 
        WHERE user_id = auth.uid() AND is_active = true
      )
      AND (
        has_role(auth.uid(), 'healthcareProvider')
        OR has_role(auth.uid(), 'nurse')
      )
    )
  );

-- Users can update their own profile, admins can update any
CREATE POLICY "Users can update profiles" ON profiles
  FOR UPDATE USING (
    id = auth.uid()
    OR has_role(auth.uid(), 'superAdmin')
    OR has_role(auth.uid(), 'onboardingTeam')
  );

-- User roles: Enhanced management
CREATE POLICY "Users can view accessible user roles" ON user_roles
  FOR SELECT USING (
    user_id = auth.uid()
    OR has_role(auth.uid(), 'superAdmin')
    OR has_role(auth.uid(), 'onboardingTeam')
    OR (
      -- Can view roles for users in same facility
      user_id IN (
        SELECT id FROM profiles WHERE facility_id IN (
          SELECT facility_id FROM profiles WHERE id = auth.uid()
          UNION
          SELECT facility_id FROM user_facility_access 
          WHERE user_id = auth.uid() AND is_active = true
        )
      )
      AND has_role(auth.uid(), 'caseManager')
    )
  );

-- Only super admins and onboarding team can modify user roles
CREATE POLICY "Admins can manage user roles" ON user_roles
  FOR ALL USING (
    has_role(auth.uid(), 'superAdmin')
    OR has_role(auth.uid(), 'onboardingTeam')
  );

-- Permissions: All authenticated users can view permissions
CREATE POLICY "Authenticated users can view permissions" ON permissions
  FOR SELECT TO authenticated USING (true);

-- Role permissions: All authenticated users can view role permissions
CREATE POLICY "Authenticated users can view role permissions" ON role_permissions
  FOR SELECT TO authenticated USING (true);

-- User facility access policies
CREATE POLICY "Users can view facility access" ON user_facility_access
  FOR SELECT USING (
    user_id = auth.uid()
    OR has_role(auth.uid(), 'superAdmin')
    OR has_role(auth.uid(), 'onboardingTeam')
    OR (
      -- Can view access for users in managed facilities
      facility_id IN (
        SELECT facility_id FROM profiles WHERE id = auth.uid()
        UNION
        SELECT facility_id FROM user_facility_access 
        WHERE user_id = auth.uid() AND is_active = true AND access_level = 'admin'
      )
      AND has_role(auth.uid(), 'caseManager')
    )
  );

-- Only super admins and facility admins can manage facility access
CREATE POLICY "Admins can manage facility access" ON user_facility_access
  FOR ALL USING (
    has_role(auth.uid(), 'superAdmin')
    OR has_role(auth.uid(), 'onboardingTeam')
    OR (
      facility_id IN (
        SELECT facility_id FROM user_facility_access 
        WHERE user_id = auth.uid() AND is_active = true AND access_level = 'admin'
      )
      AND has_role(auth.uid(), 'caseManager')
    )
  );

-- Add some essential role-permission mappings
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'superAdmin' 
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'onboardingTeam' AND p.name IN ('onboard_facilities', 'manage_users', 'manage_facilities')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'caseManager' AND p.name IN ('view_patients', 'edit_patients', 'view_reports')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'healthcareProvider' AND p.name IN ('view_patients', 'edit_patients')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'nurse' AND p.name IN ('view_patients', 'edit_patients')
ON CONFLICT (role_id, permission_id) DO NOTHING;

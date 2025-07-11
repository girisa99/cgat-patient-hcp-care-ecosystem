
-- First, let's update the user_role enum to include the specific roles
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM (
  'superAdmin',
  'healthcareProvider',
  'nurse', 
  'caseManager',
  'onboardingTeam',
  'patientCaregiver'
);

-- Create facility_type enum for the specific facility types
DROP TYPE IF EXISTS facility_type CASCADE;
CREATE TYPE facility_type AS ENUM (
  'treatmentFacility',
  'referralFacility',
  'prescriberFacility'
);

-- Update the roles table to use the new enum
DROP TABLE IF EXISTS roles CASCADE;
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name user_role NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the specific roles
INSERT INTO roles (name, description) VALUES 
  ('superAdmin', 'Super Administrator with full system access'),
  ('healthcareProvider', 'Healthcare Provider (HCP) with clinical access'),
  ('nurse', 'Nurse with patient care responsibilities'),
  ('caseManager', 'Case/Care Manager coordinating patient care'),
  ('onboardingTeam', 'Onboarding Team managing facility and user setup'),
  ('patientCaregiver', 'Patient/Caregiver with limited access to personal data');

-- Update facilities table to use the new facility_type enum
DROP TABLE IF EXISTS facilities CASCADE;
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  facility_type facility_type NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  license_number VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_facilities_type ON facilities(facility_type);
CREATE INDEX idx_facilities_active ON facilities(is_active);

-- Update profiles table to reference facilities
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  department VARCHAR(100),
  facility_id UUID REFERENCES facilities(id),
  avatar_url TEXT,
  is_email_verified BOOLEAN DEFAULT false,
  has_mfa_enabled BOOLEAN DEFAULT false,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate user_roles table with the updated roles reference
DROP TABLE IF EXISTS user_roles CASCADE;
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- Create permissions table
DROP TABLE IF EXISTS permissions CASCADE;
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role_permissions junction table
DROP TABLE IF EXISTS role_permissions CASCADE;
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Insert basic permissions
INSERT INTO permissions (name, description) VALUES 
  ('view_patients', 'View patient information'),
  ('edit_patients', 'Edit patient information'),
  ('manage_facilities', 'Manage facility settings'),
  ('manage_users', 'Manage user accounts'),
  ('view_reports', 'View system reports'),
  ('manage_modules', 'Manage system modules'),
  ('onboard_facilities', 'Onboard new facilities'),
  ('view_audit_logs', 'View audit logs');

-- Update the user role checking functions
DROP FUNCTION IF EXISTS has_role(UUID, user_role);
CREATE OR REPLACE FUNCTION has_role(user_id UUID, role_name user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = user_id
    AND r.name = role_name
  );
$$;

-- Update the permission checking function
DROP FUNCTION IF EXISTS has_permission(UUID, TEXT);
CREATE OR REPLACE FUNCTION has_permission(user_id UUID, permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role_id = ur.role_id
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = user_id
    AND p.name = permission_name
  );
$$;

-- Update the trigger function for new users
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'firstName',
    NEW.raw_user_meta_data->>'lastName',
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX idx_profiles_facility_id ON profiles(facility_id);

-- Enable RLS on all tables
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
-- Facilities: Users can view facilities they belong to, admins can view all
CREATE POLICY "Users can view their facility" ON facilities
  FOR SELECT USING (
    id IN (SELECT facility_id FROM profiles WHERE id = auth.uid())
    OR has_role(auth.uid(), 'superAdmin')
  );

-- Profiles: Users can view their own profile, admins and managers can view all
CREATE POLICY "Users can view profiles" ON profiles
  FOR SELECT USING (
    id = auth.uid() 
    OR has_role(auth.uid(), 'superAdmin')
    OR has_role(auth.uid(), 'caseManager')
  );

-- User roles: Users can view their own roles, admins can view all
CREATE POLICY "Users can view user roles" ON user_roles
  FOR SELECT USING (
    user_id = auth.uid()
    OR has_role(auth.uid(), 'superAdmin')
  );

-- Permissions: All authenticated users can view permissions
CREATE POLICY "Authenticated users can view permissions" ON permissions
  FOR SELECT TO authenticated USING (true);

-- Role permissions: All authenticated users can view role permissions
CREATE POLICY "Authenticated users can view role permissions" ON role_permissions
  FOR SELECT TO authenticated USING (true);

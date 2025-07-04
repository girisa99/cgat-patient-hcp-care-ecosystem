-- ===============================================
-- ENTERPRISE HEALTHCARE RBAC SCHEMA
-- ===============================================

-- First, ensure profiles table exists and has proper structure
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create healthcare roles enum
DO $$ BEGIN
  CREATE TYPE public.healthcare_role AS ENUM (
    'superAdmin',
    'admin', 
    'provider',
    'nurse',
    'onboardingTeam',
    'technicalServices',
    'billing',
    'compliance',
    'caregiver',
    'patient'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name public.healthcare_role UNIQUE NOT NULL,
  description TEXT,
  hierarchy_level INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table (junction table)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
  granted_by UUID REFERENCES public.profiles(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  facility_id UUID, -- For facility-specific roles
  UNIQUE(user_id, role_id, facility_id)
);

-- Add role column to user_roles for easier querying
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS role public.healthcare_role;

-- Update role column when role_id changes
CREATE OR REPLACE FUNCTION update_user_role_column()
RETURNS TRIGGER AS $$
BEGIN
  SELECT name INTO NEW.role FROM public.roles WHERE id = NEW.role_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update role column
DROP TRIGGER IF EXISTS trigger_update_user_role_column ON public.user_roles;
CREATE TRIGGER trigger_update_user_role_column
  BEFORE INSERT OR UPDATE OF role_id ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION update_user_role_column();

-- Enable RLS on all tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Insert default healthcare roles
INSERT INTO public.roles (name, description, hierarchy_level) VALUES
('superAdmin', 'System Super Administrator - Full Access', 1),
('admin', 'Facility Administrator', 2),
('provider', 'Healthcare Provider', 3),
('nurse', 'Nursing Staff', 4),
('onboardingTeam', 'Onboarding Team Member', 5),
('technicalServices', 'Technical Services', 6),
('billing', 'Billing Department', 7),
('compliance', 'Compliance Officer', 8),
('caregiver', 'Patient Caregiver', 9),
('patient', 'Patient', 10)
ON CONFLICT (name) DO UPDATE SET
description = EXCLUDED.description,
hierarchy_level = EXCLUDED.hierarchy_level,
updated_at = NOW();

-- Create function to sync user profiles from auth.users
CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-sync profiles
DROP TRIGGER IF EXISTS trigger_sync_user_profile ON auth.users;
CREATE TRIGGER trigger_sync_user_profile
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_user_profile();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.roles TO anon, authenticated;
GRANT ALL ON public.user_roles TO anon, authenticated;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for roles (everyone can read roles)
DROP POLICY IF EXISTS "Everyone can view roles" ON public.roles;
CREATE POLICY "Everyone can view roles" ON public.roles
  FOR SELECT TO authenticated USING (true);

-- Create RLS policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('superAdmin', 'admin')
      AND ur.is_active = true
    )
  );

-- Function to assign role to user
CREATE OR REPLACE FUNCTION assign_user_role(
  user_email TEXT,
  role_name public.healthcare_role,
  granted_by_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  target_user_id UUID;
  target_role_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO target_user_id 
  FROM public.profiles 
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Get role ID
  SELECT id INTO target_role_id 
  FROM public.roles 
  WHERE name = role_name;
  
  IF target_role_id IS NULL THEN
    RAISE EXCEPTION 'Role % not found', role_name;
  END IF;
  
  -- Assign role
  INSERT INTO public.user_roles (user_id, role_id, role, granted_by)
  VALUES (target_user_id, target_role_id, role_name, granted_by_id)
  ON CONFLICT (user_id, role_id, facility_id) DO UPDATE SET
    is_active = true,
    granted_at = NOW(),
    granted_by = EXCLUDED.granted_by;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION assign_user_role TO authenticated;

-- Function to check if user exists and create profile if needed
CREATE OR REPLACE FUNCTION ensure_user_profile(user_email TEXT)
RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Try to find existing user
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User % not found in auth.users', user_email;
  END IF;
  
  -- Ensure profile exists
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (user_id, user_email, 'Super', 'Admin')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the superadmin user profile and assign role
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- First ensure the user profile exists
  SELECT ensure_user_profile('superadmintest@geniecellgene.com') INTO admin_user_id;
  
  -- Assign superAdmin role
  PERFORM assign_user_role('superadmintest@geniecellgene.com', 'superAdmin');
  
  RAISE NOTICE 'SuperAdmin role assigned to superadmintest@geniecellgene.com';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error setting up superadmin: %', SQLERRM;
END $$;
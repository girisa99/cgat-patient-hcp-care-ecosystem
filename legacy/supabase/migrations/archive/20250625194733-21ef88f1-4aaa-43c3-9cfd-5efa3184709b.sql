
-- Complete RLS Fix: Remove all problematic policies and create proper security definer functions

-- First, drop all existing problematic RLS policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins and managers can view profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view facilities" ON facilities;
DROP POLICY IF EXISTS "Users can view their facility" ON facilities;
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins and onboarding team can manage user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their facility access" ON user_facility_access;
DROP POLICY IF EXISTS "Users can view their own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Super admins can view all audit logs" ON audit_logs;

-- Create the missing has_permission function that the codebase expects
CREATE OR REPLACE FUNCTION public.has_permission(user_id uuid, permission_name text)
RETURNS boolean
LANGUAGE sql
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

-- Create the missing get_user_accessible_facilities function that the codebase expects
CREATE OR REPLACE FUNCTION public.get_user_accessible_facilities(user_id uuid)
RETURNS TABLE (
  facility_id uuid,
  facility_name varchar(255),
  access_level varchar(50)
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    f.id,
    f.name,
    COALESCE(ufa.access_level, 'read') as access_level
  FROM public.facilities f
  LEFT JOIN public.user_facility_access ufa ON f.id = ufa.facility_id AND ufa.user_id = user_id AND ufa.is_active = true
  LEFT JOIN public.profiles p ON p.id = user_id
  WHERE f.is_active = true
  AND (
    p.facility_id = f.id
    OR ufa.facility_id IS NOT NULL
    OR EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON r.id = ur.role_id WHERE ur.user_id = user_id AND r.name = 'superAdmin')
  );
$$;

-- Now create simple, non-recursive RLS policies

-- Profiles policies - simple and safe
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (public.check_user_has_role(auth.uid(), 'superAdmin'));

CREATE POLICY "Managers can view profiles" ON profiles
  FOR SELECT USING (public.check_user_has_role(auth.uid(), 'caseManager'));

-- User roles policies - simple and safe
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all user roles" ON user_roles
  FOR SELECT USING (public.check_user_has_role(auth.uid(), 'superAdmin'));

CREATE POLICY "Admins can manage user roles" ON user_roles
  FOR ALL USING (
    public.check_user_has_role(auth.uid(), 'superAdmin') OR
    public.check_user_has_role(auth.uid(), 'onboardingTeam')
  );

-- Facilities policies - simple and safe
CREATE POLICY "Users can view their facility" ON facilities
  FOR SELECT USING (
    id IN (SELECT facility_id FROM profiles WHERE id = auth.uid() AND facility_id IS NOT NULL)
    OR public.check_user_has_role(auth.uid(), 'superAdmin')
  );

-- User facility access policies
CREATE POLICY "Users can view their facility access" ON user_facility_access
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.check_user_has_role(auth.uid(), 'superAdmin')
    OR public.check_user_has_role(auth.uid(), 'onboardingTeam')
  );

-- Audit logs policies
CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all audit logs" ON audit_logs
  FOR SELECT USING (public.check_user_has_role(auth.uid(), 'superAdmin'));

-- Feature flags policies
CREATE POLICY "Authenticated users can view feature flags" ON feature_flags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Super admins can manage feature flags" ON feature_flags
  FOR ALL USING (public.check_user_has_role(auth.uid(), 'superAdmin'));

-- Roles and permissions policies (read-only for most users)
CREATE POLICY "Authenticated users can view roles" ON roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view permissions" ON permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view role permissions" ON role_permissions
  FOR SELECT TO authenticated USING (true);


-- First, drop all the problematic RLS policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins and managers can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view facilities" ON facilities;
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins and onboarding team can manage user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Super admins can view all audit logs" ON audit_logs;

-- Create simple, non-recursive RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Create a security definer function to check roles without recursion
CREATE OR REPLACE FUNCTION public.check_user_has_role(check_user_id uuid, role_name user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = check_user_id
    AND r.name = role_name
  );
$$;

-- Create admin policy for profiles using the security definer function
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    public.check_user_has_role(auth.uid(), 'superAdmin') OR
    public.check_user_has_role(auth.uid(), 'caseManager')
  );

-- Create simple policies for user_roles
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all user roles" ON user_roles
  FOR SELECT USING (public.check_user_has_role(auth.uid(), 'superAdmin'));

CREATE POLICY "Admins can manage user roles" ON user_roles
  FOR ALL USING (
    public.check_user_has_role(auth.uid(), 'superAdmin') OR
    public.check_user_has_role(auth.uid(), 'onboardingTeam')
  );

-- Create simple policies for facilities
CREATE POLICY "Users can view their facility" ON facilities
  FOR SELECT USING (
    id IN (SELECT facility_id FROM profiles WHERE id = auth.uid() AND facility_id IS NOT NULL)
    OR public.check_user_has_role(auth.uid(), 'superAdmin')
  );

-- Create simple policies for audit_logs
CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all audit logs" ON audit_logs
  FOR SELECT USING (public.check_user_has_role(auth.uid(), 'superAdmin'));

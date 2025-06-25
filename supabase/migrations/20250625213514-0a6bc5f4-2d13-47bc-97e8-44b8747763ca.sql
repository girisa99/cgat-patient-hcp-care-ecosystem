
-- Drop ALL existing policies on user_roles to start fresh
DROP POLICY IF EXISTS "Allow role assignment during signup" ON user_roles;
DROP POLICY IF EXISTS "Admins can assign roles to anyone" ON user_roles;
DROP POLICY IF EXISTS "Admins can update and delete roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Allow role assignment" ON user_roles;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.user_has_role(uuid, text);

-- Create a security definer function to check if a user has a specific role
-- This prevents recursion by using elevated privileges to bypass RLS
-- Using the correct user_role enum type instead of text
CREATE OR REPLACE FUNCTION public.user_has_role(check_user_id uuid, role_name user_role)
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

-- Create simple, non-recursive RLS policies for user_roles

-- Policy 1: Users can view their own roles
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Policy 2: Allow INSERT for the user themselves (for signup process)
CREATE POLICY "Allow self role assignment" ON user_roles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policy 3: Allow admins to INSERT roles for any user
CREATE POLICY "Admins can assign roles" ON user_roles
  FOR INSERT WITH CHECK (
    public.user_has_role(auth.uid(), 'superAdmin'::user_role) OR
    public.user_has_role(auth.uid(), 'onboardingTeam'::user_role)
  );

-- Policy 4: Allow admins to view all roles
CREATE POLICY "Admins can view all roles" ON user_roles
  FOR SELECT USING (
    public.user_has_role(auth.uid(), 'superAdmin'::user_role) OR
    public.user_has_role(auth.uid(), 'onboardingTeam'::user_role)
  );

-- Policy 5: Allow admins to UPDATE and DELETE roles
CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL USING (
    public.user_has_role(auth.uid(), 'superAdmin'::user_role) OR
    public.user_has_role(auth.uid(), 'onboardingTeam'::user_role)
  );

-- Also ensure the roles table is readable by authenticated users
DROP POLICY IF EXISTS "Authenticated users can view roles" ON roles;
CREATE POLICY "Authenticated users can view roles" ON roles
  FOR SELECT TO authenticated USING (true);

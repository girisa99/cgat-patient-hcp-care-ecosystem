
-- Complete RLS Policy Fix - Remove all problematic recursive policies and create clean ones

-- First, drop ALL existing problematic policies to start completely clean
DO $$
DECLARE
    pol_name TEXT;
    table_name TEXT;
BEGIN
    -- Drop all policies on critical tables
    FOR table_name, pol_name IN 
        SELECT tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'user_roles', 'roles', 'facilities', 'permissions', 'role_permissions', 'api_keys', 'audit_logs', 'user_facility_access', 'feature_flags', 'active_issues')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol_name || '" ON public.' || table_name;
    END LOOP;
END $$;

-- Create a single, robust security definer function to check user roles without recursion
CREATE OR REPLACE FUNCTION public.get_user_role_safe(check_user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT r.name
  FROM public.user_roles ur
  JOIN public.roles r ON r.id = ur.role_id
  WHERE ur.user_id = check_user_id
  LIMIT 1;
$$;

-- Create a function to check if user is admin without recursion
CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id uuid)
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
    AND r.name IN ('superAdmin', 'onboardingTeam')
  );
$$;

-- PROFILES TABLE - Simple, non-recursive policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_own_select" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_own_update" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (public.is_admin_user(auth.uid()));

-- USER_ROLES TABLE - Critical: No recursive references
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_roles_own_select" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_roles_admin_all" ON public.user_roles
  FOR ALL USING (public.is_admin_user(auth.uid()));

-- Allow role assignment during signup (needed for onboarding)
CREATE POLICY "user_roles_signup_insert" ON public.user_roles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ROLES TABLE - Read-only for authenticated users
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roles_read_all" ON public.roles
  FOR SELECT TO authenticated USING (true);

-- FACILITIES TABLE - All authenticated users can read
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "facilities_read_all" ON public.facilities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "facilities_admin_manage" ON public.facilities
  FOR ALL USING (public.is_admin_user(auth.uid()));

-- PERMISSIONS and ROLE_PERMISSIONS - Read-only for authenticated users
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "permissions_read_all" ON public.permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "role_permissions_read_all" ON public.role_permissions
  FOR SELECT TO authenticated USING (true);

-- API_KEYS TABLE - Users can manage their own keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_keys_own_manage" ON public.api_keys
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "api_keys_admin_view" ON public.api_keys
  FOR SELECT USING (public.is_admin_user(auth.uid()));

-- AUDIT_LOGS TABLE - Users can view their own logs, admins can view all
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_own_select" ON public.audit_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "audit_logs_admin_all" ON public.audit_logs
  FOR ALL USING (public.is_admin_user(auth.uid()));

-- USER_FACILITY_ACCESS TABLE - Users can view their own access
ALTER TABLE public.user_facility_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_facility_access_own_select" ON public.user_facility_access
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_facility_access_admin_all" ON public.user_facility_access
  FOR ALL USING (public.is_admin_user(auth.uid()));

-- FEATURE_FLAGS TABLE - Read-only for authenticated users
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feature_flags_read_all" ON public.feature_flags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "feature_flags_admin_manage" ON public.feature_flags
  FOR ALL USING (public.is_admin_user(auth.uid()));

-- ACTIVE_ISSUES TABLE - Admins only
ALTER TABLE public.active_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "active_issues_admin_only" ON public.active_issues
  FOR ALL USING (public.is_admin_user(auth.uid()));

-- Verify that all functions exist and are properly configured
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_user_role_safe', 'is_admin_user', 'check_user_has_role', 'user_has_role', 'has_role')
ORDER BY routine_name;

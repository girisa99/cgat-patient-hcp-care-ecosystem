-- SECURITY FIX: Complete the remaining function search_path security updates
-- This addresses the remaining "Function Search Path Mutable" warnings

-- Update user_has_permission with secure search_path (keeping existing signature and logic)
CREATE OR REPLACE FUNCTION public.user_has_permission(check_user_id uuid, permission_name text, facility_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
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

-- Update has_role function with secure search_path
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = user_id
    AND r.name = role_name
  );
$$;

-- Update has_role_optimized function with secure search_path
CREATE OR REPLACE FUNCTION public.has_role_optimized(_user_id uuid, _role_name user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON r.id = ur.role_id
        WHERE ur.user_id = _user_id
        AND r.name = _role_name
    );
$$;

-- Update is_demo_user function with secure search_path
CREATE OR REPLACE FUNCTION public.is_demo_user(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = check_user_id
    AND r.name = 'demoUser'
  );
$$;

-- Update is_demo_user_or_admin function with secure search_path  
CREATE OR REPLACE FUNCTION public.is_demo_user_or_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = check_user_id
    AND r.name IN ('superAdmin', 'onboardingTeam', 'demoUser')
  );
$$;

-- Update get_user_roles function with secure search_path
CREATE OR REPLACE FUNCTION public.get_user_roles(check_user_id uuid)
RETURNS TABLE(role_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.name::text
  FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  WHERE ur.user_id = check_user_id;
$$;
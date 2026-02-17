-- Fix remaining security linter issues
-- Update functions to have proper search_path (addressing 4 warnings)

-- Fix get_user_roles function
CREATE OR REPLACE FUNCTION public.get_user_roles(check_user_id uuid)
RETURNS TABLE(role_name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT r.name::text
  FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  WHERE ur.user_id = check_user_id;
$$;

-- Fix has_role function
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = user_id
    AND r.name = role_name
  );
$$;

-- Fix has_role_optimized function
CREATE OR REPLACE FUNCTION public.has_role_optimized(_user_id uuid, _role_name user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
    -- Direct join for better performance
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON r.id = ur.role_id
        WHERE ur.user_id = _user_id
        AND r.name = _role_name
    );
$$;

-- Fix has_permission function
CREATE OR REPLACE FUNCTION public.has_permission(user_id uuid, permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
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
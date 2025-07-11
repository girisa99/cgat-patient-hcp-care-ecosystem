
-- Create a simple security definer function to check user roles
-- This helps avoid RLS recursion issues when checking admin permissions
CREATE OR REPLACE FUNCTION public.check_user_has_role(check_user_id UUID, role_name user_role)
RETURNS BOOLEAN
LANGUAGE SQL
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

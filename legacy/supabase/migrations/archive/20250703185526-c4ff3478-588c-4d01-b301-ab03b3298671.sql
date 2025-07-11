-- Create a simple function to get user roles that bypasses RLS issues
CREATE OR REPLACE FUNCTION public.get_user_roles(check_user_id uuid)
RETURNS TABLE(role_name text)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.name::text
  FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  WHERE ur.user_id = check_user_id;
$$;
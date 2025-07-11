-- Grant explicit execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_roles(uuid) TO authenticated;

-- Also grant to anon in case there are session issues
GRANT EXECUTE ON FUNCTION public.get_user_roles(uuid) TO anon;

-- Ensure the function has proper security context
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
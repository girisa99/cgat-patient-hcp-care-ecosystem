-- Create a function to assign a role to a user
CREATE OR REPLACE FUNCTION public.assign_user_role(p_user_id uuid, p_role_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  role_uuid uuid;
BEGIN
  -- Get the role ID for the role name
  SELECT id INTO role_uuid 
  FROM public.roles 
  WHERE name = p_role_name::user_role;
  
  IF role_uuid IS NULL THEN
    RAISE EXCEPTION 'Role % not found', p_role_name;
  END IF;
  
  -- Insert the user role assignment
  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (p_user_id, role_uuid)
  ON CONFLICT (user_id, role_id) DO NOTHING;
END;
$$;
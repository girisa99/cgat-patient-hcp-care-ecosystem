-- Fix the assign_default_role function to use proper schema references
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE 
  _role uuid;
BEGIN
  SELECT id INTO _role
  FROM public.roles
  WHERE is_default = true
  LIMIT 1;

  IF _role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.id, _role)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;
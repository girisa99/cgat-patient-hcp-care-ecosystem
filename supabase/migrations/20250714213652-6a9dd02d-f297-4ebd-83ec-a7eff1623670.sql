-- Create a function to create patient users (same mechanism as self-registration)
CREATE OR REPLACE FUNCTION public.create_patient_user(
  p_email text,
  p_password text,
  p_first_name text,
  p_last_name text,
  p_facility_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
  patient_role_id uuid;
BEGIN
  -- Get the patient role ID
  SELECT id INTO patient_role_id 
  FROM public.roles 
  WHERE name = 'patientCaregiver';
  
  IF patient_role_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Patient role not found');
  END IF;
  
  -- Create the user in auth.users (this requires elevated privileges)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    jsonb_build_object('firstName', p_first_name, 'lastName', p_last_name),
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;
  
  -- Create profile
  INSERT INTO public.profiles (id, first_name, last_name, email, facility_id)
  VALUES (new_user_id, p_first_name, p_last_name, p_email, p_facility_id);
  
  -- Assign patient role
  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (new_user_id, patient_role_id);
  
  RETURN jsonb_build_object('success', true, 'user_id', new_user_id);
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;
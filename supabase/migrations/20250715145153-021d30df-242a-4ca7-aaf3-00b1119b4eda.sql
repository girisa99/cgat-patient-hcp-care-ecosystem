-- Update the create_patient_profile_and_role function to ensure proper schema access
CREATE OR REPLACE FUNCTION public.create_patient_profile_and_role(
  p_user_id uuid, 
  p_first_name text, 
  p_last_name text, 
  p_email text, 
  p_facility_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  patient_role_id uuid;
BEGIN
  -- Get the patient role ID
  SELECT id INTO patient_role_id 
  FROM public.roles 
  WHERE name = 'patientCaregiver';
  
  IF patient_role_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Patient role not found');
  END IF;
  
  -- Create profile (the user should already exist in auth.users)
  INSERT INTO public.profiles (id, first_name, last_name, email, facility_id)
  VALUES (p_user_id, p_first_name, p_last_name, p_email, p_facility_id);
  
  -- Assign patient role
  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (p_user_id, patient_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;
  
  RETURN jsonb_build_object('success', true, 'user_id', p_user_id);
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;
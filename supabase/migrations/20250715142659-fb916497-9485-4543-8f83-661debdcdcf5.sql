-- Fix the profiles INSERT policy to allow the create_patient_profile_and_role function to work
DROP POLICY IF EXISTS "profiles_insert_own_safe" ON public.profiles;

-- Create a new policy that allows both user self-insertion and admin/service role insertions
CREATE POLICY "profiles_insert_safe" ON public.profiles
FOR INSERT WITH CHECK (
  id = auth.uid() OR 
  is_admin_user_safe(auth.uid()) OR 
  current_user = 'service_role'
);
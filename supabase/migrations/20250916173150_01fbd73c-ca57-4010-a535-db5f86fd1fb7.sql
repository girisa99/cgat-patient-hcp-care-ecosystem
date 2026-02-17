-- CRITICAL SECURITY FIX 1: Fix infinite recursion in user_facility_access
-- Drop the problematic policies causing infinite recursion
DROP POLICY IF EXISTS "Users can view their facility access" ON public.user_facility_access;
DROP POLICY IF EXISTS "Users can update their facility access" ON public.user_facility_access;
DROP POLICY IF EXISTS "Admins can manage all facility access" ON public.user_facility_access;

-- Create simple, non-recursive policies
CREATE POLICY "user_facility_access_own_select" 
ON public.user_facility_access 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "user_facility_access_admin_all" 
ON public.user_facility_access 
FOR ALL 
TO authenticated
USING (is_admin_user_safe(auth.uid()))
WITH CHECK (is_admin_user_safe(auth.uid()));

-- CRITICAL SECURITY FIX 2: Secure treatment_center_onboarding table
-- This contains highly sensitive data: SSNs, bank accounts, tax IDs
CREATE POLICY "treatment_center_onboarding_owner_only" 
ON public.treatment_center_onboarding 
FOR ALL 
TO authenticated
USING (
  auth.uid() = created_by OR 
  is_admin_user_safe(auth.uid())
)
WITH CHECK (
  auth.uid() = created_by OR 
  is_admin_user_safe(auth.uid())
);

-- CRITICAL SECURITY FIX 3: Update is_admin_user_safe function to prevent search path issues
CREATE OR REPLACE FUNCTION public.is_admin_user_safe(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = check_user_id
    AND r.name IN ('superAdmin', 'admin', 'onboardingTeam')
  );
$$;
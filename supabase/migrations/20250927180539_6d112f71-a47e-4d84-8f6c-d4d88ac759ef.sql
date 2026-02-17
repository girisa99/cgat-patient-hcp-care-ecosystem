-- ULTIMATE SECURITY FIX: Explicit deny for anonymous access
-- Create a restrictive policy that explicitly blocks anonymous access

-- Drop the current policy
DROP POLICY IF EXISTS "treatment_center_ultra_secure_access" ON public.treatment_center_onboarding;

-- Create an explicit deny-all policy for anonymous users
CREATE POLICY "deny_anonymous_access"
ON public.treatment_center_onboarding
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Create a separate policy for authenticated users only
CREATE POLICY "authenticated_users_only"
ON public.treatment_center_onboarding  
FOR ALL
TO authenticated
USING (
  -- Must have valid auth.uid() and either own the record or be authorized staff
  auth.uid() IS NOT NULL 
  AND 
  (
    -- Own record access
    auth.uid() = user_id
    OR 
    -- Staff access with role verification
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND 
  (
    auth.uid() = user_id
    OR 
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  )
);

-- Also revoke all public access explicitly
REVOKE ALL ON public.treatment_center_onboarding FROM anon;
REVOKE ALL ON public.treatment_center_onboarding FROM public;
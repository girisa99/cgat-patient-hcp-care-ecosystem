-- EMERGENCY FIX: Force strict RLS and handle NULL user_id records
-- Check for NULL user_id records and ensure they're protected

-- First, let's see if there are NULL user_id records causing the bypass
-- Update any NULL user_id records to have a system placeholder (this prevents them from being accessible)
UPDATE treatment_center_onboarding 
SET user_id = '00000000-0000-0000-0000-000000000000'
WHERE user_id IS NULL;

-- Make user_id NOT NULL to prevent future NULL bypasses
ALTER TABLE treatment_center_onboarding ALTER COLUMN user_id SET NOT NULL;

-- Drop and recreate the policy with more explicit NULL handling
DROP POLICY IF EXISTS "treatment_center_secure_access" ON public.treatment_center_onboarding;

-- Create ultra-strict policy with explicit NULL checks
CREATE POLICY "treatment_center_ultra_secure_access"
ON public.treatment_center_onboarding
FOR ALL
TO authenticated
USING (
  -- Must be authenticated AND match one of these conditions
  auth.uid() IS NOT NULL 
  AND 
  (
    -- Users can access their own applications (with explicit NULL safety)
    (user_id IS NOT NULL AND auth.uid() = user_id) 
    OR 
    -- Only specific authorized staff can access all applications
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  )
)
WITH CHECK (
  -- Must be authenticated for any modifications
  auth.uid() IS NOT NULL
  AND
  (
    -- Users can only create/update their own applications
    (user_id IS NOT NULL AND auth.uid() = user_id)
    OR
    -- Authorized staff can manage all applications  
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  )
);

-- Force RLS to apply to table owners and all roles (not just public role)
ALTER TABLE public.treatment_center_onboarding FORCE ROW LEVEL SECURITY;
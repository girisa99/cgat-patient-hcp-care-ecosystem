-- Phase 3 Final Security Cleanup - Remove remaining problematic policies (Fixed)

-- Clean up overly permissive policies that allow any authenticated user access
DROP POLICY IF EXISTS "Authenticated users can view therapies" ON public.therapies;

-- Remove duplicate or conflicting policies on treatment_center_onboarding
DROP POLICY IF EXISTS "Healthcare staff can view treatment center onboarding" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "Restricted access to treatment center onboarding" ON public.treatment_center_onboarding;

-- Remove overly permissive policies on other sensitive tables
DROP POLICY IF EXISTS "Restricted access to clinical trials" ON public.clinical_trials;
DROP POLICY IF EXISTS "Restricted access to commercial products" ON public.commercial_products;  
DROP POLICY IF EXISTS "Restricted access to manufacturers" ON public.manufacturers;
DROP POLICY IF EXISTS "Restricted access to products" ON public.products;

-- Create secure, restrictive policies for therapies
CREATE POLICY "Admins can manage therapies secure" 
ON public.therapies 
FOR ALL 
TO authenticated
USING (is_admin_user_safe(auth.uid()))
WITH CHECK (is_admin_user_safe(auth.uid()));

CREATE POLICY "Healthcare professionals can view therapies secure" 
ON public.therapies 
FOR SELECT 
TO authenticated
USING (
  is_admin_user_safe(auth.uid()) OR 
  user_has_permission(auth.uid(), 'view_therapies'::text)
);

-- Phase 3 security cleanup completed successfully
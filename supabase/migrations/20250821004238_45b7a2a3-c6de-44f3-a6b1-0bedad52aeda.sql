-- PHASE 1 SECURITY FIX: Secure Remaining Healthcare Data Tables
-- Add strict authentication-only RLS policies to prevent unauthorized access

-- Enable RLS on all remaining vulnerable tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_center_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modalities ENABLE ROW LEVEL SECURITY;

-- Products Table Security - Restrict to healthcare professionals and business users
CREATE POLICY "products_authenticated_read_only" 
ON public.products 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND (
    is_admin_user_safe(auth.uid()) 
    OR has_role(auth.uid(), 'healthcareProvider'::user_role)
    OR has_role(auth.uid(), 'onboardingTeam'::user_role)
    OR has_role(auth.uid(), 'financeTeam'::user_role)
  )
);

CREATE POLICY "products_admin_management" 
ON public.products 
FOR ALL 
TO authenticated
USING (is_admin_user_safe(auth.uid()))
WITH CHECK (is_admin_user_safe(auth.uid()));

-- Treatment Center Onboarding Table Security - Restrict to facility owners and authorized staff
CREATE POLICY "treatment_center_onboarding_authenticated_read_only" 
ON public.treatment_center_onboarding 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND (
    is_admin_user_safe(auth.uid()) 
    OR has_role(auth.uid(), 'onboardingTeam'::user_role)
    OR has_role(auth.uid(), 'financeTeam'::user_role)
  )
);

CREATE POLICY "treatment_center_onboarding_admin_management" 
ON public.treatment_center_onboarding 
FOR ALL 
TO authenticated
USING (is_admin_user_safe(auth.uid()))
WITH CHECK (is_admin_user_safe(auth.uid()));

-- Therapies Table Security - Restrict to authorized medical professionals
CREATE POLICY "therapies_authenticated_read_only" 
ON public.therapies 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND (
    is_admin_user_safe(auth.uid()) 
    OR has_role(auth.uid(), 'healthcareProvider'::user_role)
    OR has_role(auth.uid(), 'onboardingTeam'::user_role)
  )
);

CREATE POLICY "therapies_admin_management" 
ON public.therapies 
FOR ALL 
TO authenticated
USING (is_admin_user_safe(auth.uid()))
WITH CHECK (is_admin_user_safe(auth.uid()));

-- Services Table Security - Restrict to authorized business partners and customers
CREATE POLICY "services_authenticated_read_only" 
ON public.services 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND (
    is_admin_user_safe(auth.uid()) 
    OR has_role(auth.uid(), 'healthcareProvider'::user_role)
    OR has_role(auth.uid(), 'onboardingTeam'::user_role)
    OR has_role(auth.uid(), 'financeTeam'::user_role)
    OR has_role(auth.uid(), 'contractTeam'::user_role)
  )
);

CREATE POLICY "services_admin_management" 
ON public.services 
FOR ALL 
TO authenticated
USING (is_admin_user_safe(auth.uid()))
WITH CHECK (is_admin_user_safe(auth.uid()));

-- Service Providers Table Security - Restrict to authorized business users
CREATE POLICY "service_providers_authenticated_read_only" 
ON public.service_providers 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND (
    is_admin_user_safe(auth.uid()) 
    OR has_role(auth.uid(), 'healthcareProvider'::user_role)
    OR has_role(auth.uid(), 'onboardingTeam'::user_role)
    OR has_role(auth.uid(), 'contractTeam'::user_role)
  )
);

CREATE POLICY "service_providers_admin_management" 
ON public.service_providers 
FOR ALL 
TO authenticated
USING (is_admin_user_safe(auth.uid()))
WITH CHECK (is_admin_user_safe(auth.uid()));

-- Modalities Table Security - Restrict to authorized manufacturing and clinical staff
CREATE POLICY "modalities_authenticated_read_only" 
ON public.modalities 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND (
    is_admin_user_safe(auth.uid()) 
    OR has_role(auth.uid(), 'healthcareProvider'::user_role)
    OR has_role(auth.uid(), 'onboardingTeam'::user_role)
  )
);

CREATE POLICY "modalities_admin_management" 
ON public.modalities 
FOR ALL 
TO authenticated
USING (is_admin_user_safe(auth.uid()))
WITH CHECK (is_admin_user_safe(auth.uid()));
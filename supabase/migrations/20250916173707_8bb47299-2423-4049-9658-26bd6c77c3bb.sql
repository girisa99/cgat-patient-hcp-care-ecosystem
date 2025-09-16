-- CRITICAL SECURITY FIX: Secure treatment_center_onboarding table
-- This contains highly sensitive data (SSNs, tax IDs, bank accounts)
ALTER TABLE public.treatment_center_onboarding ENABLE ROW LEVEL SECURITY;

-- Restrict to admins only - contains federal tax IDs, SSNs, bank accounts
CREATE POLICY "treatment_center_onboarding_admin_only" 
ON public.treatment_center_onboarding 
FOR ALL 
TO authenticated
USING (is_admin_user_safe(auth.uid()))
WITH CHECK (is_admin_user_safe(auth.uid()));

-- Allow users to view their own onboarding records
CREATE POLICY "treatment_center_onboarding_own_view" 
ON public.treatment_center_onboarding 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- CRITICAL SECURITY FIX: Secure other business intelligence tables
-- Products table - restrict competitive data access
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_restricted_access" 
ON public.products 
FOR SELECT 
TO authenticated
USING (is_admin_user_safe(auth.uid()));

-- Services table - restrict competitive data access  
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_restricted_access" 
ON public.services 
FOR SELECT 
TO authenticated
USING (is_admin_user_safe(auth.uid()));

-- Service providers table - contact info protection
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_providers_admin_only" 
ON public.service_providers 
FOR SELECT 
TO authenticated
USING (is_admin_user_safe(auth.uid()));

-- Therapies table - medical research data protection
ALTER TABLE public.therapies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "therapies_restricted_access" 
ON public.therapies 
FOR SELECT 
TO authenticated
USING (is_admin_user_safe(auth.uid()));
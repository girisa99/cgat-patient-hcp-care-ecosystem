-- CRITICAL SECURITY FIX 1: Already implemented above - user_facility_access recursion fix

-- CRITICAL SECURITY FIX 2: Secure treatment_center_onboarding table
-- First, check if it has RLS enabled
ALTER TABLE public.treatment_center_onboarding ENABLE ROW LEVEL SECURITY;

-- Create policy based on actual table structure - restrict to admins only for now
-- since this contains highly sensitive data (SSNs, tax IDs, bank accounts)
CREATE POLICY "treatment_center_onboarding_admin_only" 
ON public.treatment_center_onboarding 
FOR ALL 
TO authenticated
USING (is_admin_user_safe(auth.uid()))
WITH CHECK (is_admin_user_safe(auth.uid()));

-- CRITICAL SECURITY FIX 3: Secure other business intelligence tables
-- Enable RLS and restrict access to prevent competitive data theft

-- Products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_admin_and_provider_access" 
ON public.products 
FOR SELECT 
TO authenticated
USING (
  is_admin_user_safe(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('provider', 'facilityAdmin')
  )
);

-- Services table  
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_admin_and_provider_access" 
ON public.services 
FOR SELECT 
TO authenticated
USING (
  is_admin_user_safe(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('provider', 'facilityAdmin')
  )
);

-- Service providers table
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_providers_admin_only" 
ON public.service_providers 
FOR SELECT 
TO authenticated
USING (is_admin_user_safe(auth.uid()));

-- Therapies table
ALTER TABLE public.therapies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "therapies_admin_and_provider_access" 
ON public.therapies 
FOR SELECT 
TO authenticated
USING (
  is_admin_user_safe(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('provider', 'facilityAdmin', 'nurse', 'caseManager')
  )
);
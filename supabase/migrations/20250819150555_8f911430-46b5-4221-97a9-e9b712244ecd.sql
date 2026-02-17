-- FINAL Security Fix Phase 4 - Fixed - Handle existing policies properly

-- ============================================================================
-- CRITICAL: Drop ALL existing policies first, then create secure ones
-- ============================================================================

-- Drop ALL existing policies on healthcare/business tables (both permissive and existing secure ones)
DROP POLICY IF EXISTS "All authenticated users can view clinical trials" ON public.clinical_trials;
DROP POLICY IF EXISTS "Authenticated users can view clinical trials" ON public.clinical_trials;
DROP POLICY IF EXISTS "Healthcare professionals can view clinical trials" ON public.clinical_trials;

DROP POLICY IF EXISTS "All authenticated users can view commercial products" ON public.commercial_products;
DROP POLICY IF EXISTS "Authenticated users can view commercial products" ON public.commercial_products;
DROP POLICY IF EXISTS "Business users can view commercial products" ON public.commercial_products;

DROP POLICY IF EXISTS "All authenticated users can view manufacturers" ON public.manufacturers;
DROP POLICY IF EXISTS "Authenticated users can view manufacturers" ON public.manufacturers;
DROP POLICY IF EXISTS "Business users can view manufacturers" ON public.manufacturers;

DROP POLICY IF EXISTS "All authenticated users can view products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
DROP POLICY IF EXISTS "Authorized users can view products" ON public.products;

DROP POLICY IF EXISTS "All authenticated users can view therapies" ON public.therapies;
DROP POLICY IF EXISTS "Authenticated users can view therapies" ON public.therapies;
DROP POLICY IF EXISTS "Healthcare professionals can view therapies" ON public.therapies;
DROP POLICY IF EXISTS "Healthcare professionals can view therapies secure" ON public.therapies;

DROP POLICY IF EXISTS "All authenticated users can view service providers" ON public.service_providers;
DROP POLICY IF EXISTS "Authenticated users can view service providers" ON public.service_providers;
DROP POLICY IF EXISTS "Business users can view service providers" ON public.service_providers;

DROP POLICY IF EXISTS "All authenticated users can view services" ON public.services;
DROP POLICY IF EXISTS "Authenticated users can view services" ON public.services;
DROP POLICY IF EXISTS "Business users can view services" ON public.services;
DROP POLICY IF EXISTS "Business users can view services secure" ON public.services;

DROP POLICY IF EXISTS "All authenticated users can view treatment center onboarding" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "Authenticated users can view treatment center onboarding" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "Users can view their own onboarding data" ON public.treatment_center_onboarding;

-- ============================================================================
-- Create secure, restrictive RLS policies (only once each)
-- ============================================================================

-- Clinical Trials - Healthcare professionals only
CREATE POLICY "Healthcare professionals can view clinical trials secured" 
ON public.clinical_trials 
FOR SELECT 
TO authenticated
USING (
  is_admin_user_safe(auth.uid()) OR 
  user_has_permission(auth.uid(), 'view_clinical_trials'::text)
);

-- Commercial Products - Business users only
CREATE POLICY "Business users can view commercial products secured" 
ON public.commercial_products 
FOR SELECT 
TO authenticated
USING (
  is_admin_user_safe(auth.uid()) OR 
  user_has_permission(auth.uid(), 'view_commercial_data'::text)
);

-- Manufacturers - Business users only
CREATE POLICY "Business users can view manufacturers secured" 
ON public.manufacturers 
FOR SELECT 
TO authenticated
USING (
  is_admin_user_safe(auth.uid()) OR 
  user_has_permission(auth.uid(), 'view_manufacturers'::text)
);

-- Products - Healthcare and business users
CREATE POLICY "Authorized users can view products secured" 
ON public.products 
FOR SELECT 
TO authenticated
USING (
  is_admin_user_safe(auth.uid()) OR 
  user_has_permission(auth.uid(), 'view_products'::text)
);

-- Therapies - Healthcare professionals only  
CREATE POLICY "Healthcare professionals can view therapies final" 
ON public.therapies 
FOR SELECT 
TO authenticated
USING (
  is_admin_user_safe(auth.uid()) OR 
  user_has_permission(auth.uid(), 'view_therapies'::text)
);

-- Service Providers - Business users only
CREATE POLICY "Business users can view service providers secured" 
ON public.service_providers 
FOR SELECT 
TO authenticated
USING (
  is_admin_user_safe(auth.uid()) OR 
  user_has_permission(auth.uid(), 'view_service_providers'::text)
);

-- Services - Business users only
CREATE POLICY "Business users can view services final" 
ON public.services 
FOR SELECT 
TO authenticated
USING (
  is_admin_user_safe(auth.uid()) OR 
  user_has_permission(auth.uid(), 'view_services'::text)
);

-- Treatment Center Onboarding - Users can only access their own data
CREATE POLICY "Users can view their own onboarding data secured" 
ON public.treatment_center_onboarding 
FOR SELECT 
TO authenticated
USING (
  is_admin_user_safe(auth.uid()) OR 
  created_by = auth.uid() OR
  user_has_permission(auth.uid(), 'view_all_onboarding'::text)
);

-- ============================================================================
-- Ensure RLS is enabled on all tables
-- ============================================================================

ALTER TABLE public.clinical_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_center_onboarding ENABLE ROW LEVEL SECURITY;

-- All unauthorized access issues should now be resolved
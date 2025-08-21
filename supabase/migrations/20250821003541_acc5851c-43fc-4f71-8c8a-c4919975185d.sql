-- SECURITY FIX: Secure Healthcare Data Tables
-- Drop all existing potentially permissive policies and create strict authentication-only policies

-- Clinical Trials Table Security
DROP POLICY IF EXISTS "Admins can manage clinical_trials" ON public.clinical_trials;
DROP POLICY IF EXISTS "Authorized researchers can view clinical trials" ON public.clinical_trials;
DROP POLICY IF EXISTS "Clinical trials management for authorized users" ON public.clinical_trials;
DROP POLICY IF EXISTS "Only admins can manage clinical trials" ON public.clinical_trials;

-- Commercial Products Table Security  
DROP POLICY IF EXISTS "Admins can manage commercial_products" ON public.commercial_products;
DROP POLICY IF EXISTS "Commercial products management for business managers" ON public.commercial_products;
DROP POLICY IF EXISTS "Healthcare professionals can view commercial products" ON public.commercial_products;
DROP POLICY IF EXISTS "Only admins can manage commercial products" ON public.commercial_products;

-- Manufacturers Table Security
DROP POLICY IF EXISTS "Admins can manage manufacturers" ON public.manufacturers;
DROP POLICY IF EXISTS "Authorized staff can view manufacturers" ON public.manufacturers;
DROP POLICY IF EXISTS "Manufacturers management for authorized users" ON public.manufacturers;
DROP POLICY IF EXISTS "Only admins can manage manufacturers" ON public.manufacturers;

-- Create strict authentication-only policies for Clinical Trials
CREATE POLICY "clinical_trials_authenticated_read_only" 
ON public.clinical_trials 
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

CREATE POLICY "clinical_trials_admin_management" 
ON public.clinical_trials 
FOR ALL 
TO authenticated
USING (is_admin_user_safe(auth.uid()))
WITH CHECK (is_admin_user_safe(auth.uid()));

-- Create strict authentication-only policies for Commercial Products
CREATE POLICY "commercial_products_authenticated_read_only" 
ON public.commercial_products 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND (
    is_admin_user_safe(auth.uid()) 
    OR has_role(auth.uid(), 'healthcareProvider'::user_role)
    OR has_role(auth.uid(), 'financeTeam'::user_role)
    OR has_role(auth.uid(), 'contractTeam'::user_role)
  )
);

CREATE POLICY "commercial_products_admin_management" 
ON public.commercial_products 
FOR ALL 
TO authenticated
USING (is_admin_user_safe(auth.uid()))
WITH CHECK (is_admin_user_safe(auth.uid()));

-- Create strict authentication-only policies for Manufacturers
CREATE POLICY "manufacturers_authenticated_read_only" 
ON public.manufacturers 
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

CREATE POLICY "manufacturers_admin_management" 
ON public.manufacturers 
FOR ALL 
TO authenticated
USING (is_admin_user_safe(auth.uid()))
WITH CHECK (is_admin_user_safe(auth.uid()));

-- Ensure RLS is enabled on all tables
ALTER TABLE public.clinical_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_products ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;
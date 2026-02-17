-- Clean up existing permissive policies and replace with restrictive ones
-- Current state: Multiple SELECT policies allowing broad access, need to restrict to demo/admin only

-- Clinical trials - remove all existing SELECT policies, keep admin management
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.clinical_trials;
DROP POLICY IF EXISTS "Authenticated read clinical_trials" ON public.clinical_trials;
DROP POLICY IF EXISTS "Authenticated users can view clinical_trials" ON public.clinical_trials;
DROP POLICY IF EXISTS "Clinical trials are viewable by authenticated users" ON public.clinical_trials;
DROP POLICY IF EXISTS "Clinical trials visible to authenticated users only" ON public.clinical_trials;
DROP POLICY IF EXISTS "authenticated_users_can_read_clinical_trials" ON public.clinical_trials;

-- Create single restrictive SELECT policy for clinical_trials
CREATE POLICY "Restricted access to clinical trials" 
ON public.clinical_trials FOR SELECT USING (is_demo_user_or_admin(auth.uid()));

-- Commercial products - remove permissive SELECT policies
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.commercial_products;
DROP POLICY IF EXISTS "Authenticated read commercial_products" ON public.commercial_products;
DROP POLICY IF EXISTS "Authenticated users can view commercial_products" ON public.commercial_products;
DROP POLICY IF EXISTS "Commercial products are viewable by authenticated users" ON public.commercial_products;
DROP POLICY IF EXISTS "Commercial products visible to business users only" ON public.commercial_products;
DROP POLICY IF EXISTS "authenticated_users_can_read_commercial_products" ON public.commercial_products;

-- Create single restrictive SELECT policy for commercial_products
CREATE POLICY "Restricted access to commercial products" 
ON public.commercial_products FOR SELECT USING (is_demo_user_or_admin(auth.uid()));

-- Manufacturers - remove permissive SELECT policies
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.manufacturers;
DROP POLICY IF EXISTS "Authenticated read manufacturers" ON public.manufacturers;
DROP POLICY IF EXISTS "Authenticated users can view manufacturers" ON public.manufacturers;
DROP POLICY IF EXISTS "Manufacturers are viewable by authenticated users" ON public.manufacturers;
DROP POLICY IF EXISTS "Manufacturers visible to authenticated users only" ON public.manufacturers;
DROP POLICY IF EXISTS "authenticated_users_can_read_manufacturers" ON public.manufacturers;

-- Create single restrictive SELECT policy for manufacturers
CREATE POLICY "Restricted access to manufacturers" 
ON public.manufacturers FOR SELECT USING (is_demo_user_or_admin(auth.uid()));

-- Products - remove permissive SELECT policies
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.products;
DROP POLICY IF EXISTS "Authenticated read products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
DROP POLICY IF EXISTS "Products are viewable by authenticated users" ON public.products;
DROP POLICY IF EXISTS "Products visible to authenticated users only" ON public.products;
DROP POLICY IF EXISTS "authenticated_users_can_read_products" ON public.products;

-- Create single restrictive SELECT policy for products
CREATE POLICY "Restricted access to products" 
ON public.products FOR SELECT USING (is_demo_user_or_admin(auth.uid()));

-- Treatment center onboarding - check if any permissive SELECT policies exist and remove them
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "Authenticated read treatment_center_onboarding" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "Authenticated users can view treatment_center_onboarding" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "Treatment center onboarding visible to authenticated users only" ON public.treatment_center_onboarding;

-- Create restrictive SELECT policy for treatment_center_onboarding
CREATE POLICY "Restricted access to treatment center onboarding" 
ON public.treatment_center_onboarding FOR SELECT USING (is_demo_user_or_admin(auth.uid()));

-- Keep admin ALL policies as they are already properly restrictive
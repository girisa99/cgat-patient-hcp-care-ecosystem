-- Secure sensitive healthcare and business data tables
-- Focus on the main security vulnerabilities identified

-- Clinical trials - sensitive healthcare research data
DROP POLICY IF EXISTS "Public read access to clinical trials" ON public.clinical_trials;
CREATE POLICY "Authorized roles can view clinical trials" 
ON public.clinical_trials FOR SELECT USING (is_demo_user_or_admin(auth.uid()));

-- Commercial products - business sensitive data  
DROP POLICY IF EXISTS "Public read access to commercial products" ON public.commercial_products;
CREATE POLICY "Authorized roles can view commercial products" 
ON public.commercial_products FOR SELECT USING (is_demo_user_or_admin(auth.uid()));

-- Manufacturers - business intelligence data
DROP POLICY IF EXISTS "Public read access to manufacturers" ON public.manufacturers;
CREATE POLICY "Authorized roles can view manufacturers" 
ON public.manufacturers FOR SELECT USING (is_demo_user_or_admin(auth.uid()));

-- Products - commercial product information
DROP POLICY IF EXISTS "Public read access to products" ON public.products;
CREATE POLICY "Authorized roles can view products" 
ON public.products FOR SELECT USING (is_demo_user_or_admin(auth.uid()));

-- Treatment center onboarding - restrict to admin/demo users only
DROP POLICY IF EXISTS "Public read access to treatment center onboarding" ON public.treatment_center_onboarding;
CREATE POLICY "Authorized roles can view treatment center onboarding" 
ON public.treatment_center_onboarding FOR SELECT USING (is_demo_user_or_admin(auth.uid()));

-- System configuration tables - require authentication
DROP POLICY IF EXISTS "Public read access to use cases" ON public.use_cases;
CREATE POLICY "Authenticated users can view use cases" 
ON public.use_cases FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only allow reading these tables, admins can manage via direct SQL
CREATE POLICY "Admins can manage healthcare data" 
ON public.clinical_trials FOR ALL USING (is_admin_user_safe(auth.uid())) WITH CHECK (is_admin_user_safe(auth.uid()));

CREATE POLICY "Admins can manage commercial products" 
ON public.commercial_products FOR ALL USING (is_admin_user_safe(auth.uid())) WITH CHECK (is_admin_user_safe(auth.uid()));

CREATE POLICY "Admins can manage manufacturers" 
ON public.manufacturers FOR ALL USING (is_admin_user_safe(auth.uid())) WITH CHECK (is_admin_user_safe(auth.uid()));

CREATE POLICY "Admins can manage products" 
ON public.products FOR ALL USING (is_admin_user_safe(auth.uid())) WITH CHECK (is_admin_user_safe(auth.uid()));

CREATE POLICY "Admins can manage treatment center onboarding" 
ON public.treatment_center_onboarding FOR ALL USING (is_admin_user_safe(auth.uid())) WITH CHECK (is_admin_user_safe(auth.uid()));
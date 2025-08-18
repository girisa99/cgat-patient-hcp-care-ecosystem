-- Comprehensive security lockdown for sensitive tables
-- Drop all existing policies first, then create new restrictive ones

-- Clinical trials table
DROP POLICY IF EXISTS "Public read access to clinical trials" ON public.clinical_trials;
DROP POLICY IF EXISTS "Admins can manage clinical trials" ON public.clinical_trials;
DROP POLICY IF EXISTS "Authorized roles can view clinical trials" ON public.clinical_trials;
CREATE POLICY "Authorized roles can view clinical trials" 
ON public.clinical_trials FOR SELECT USING (is_demo_user_or_admin(auth.uid()));
CREATE POLICY "Admins can manage clinical trials" 
ON public.clinical_trials FOR ALL USING (is_admin_user_safe(auth.uid())) WITH CHECK (is_admin_user_safe(auth.uid()));

-- Commercial products table
DROP POLICY IF EXISTS "Public read access to commercial products" ON public.commercial_products;
DROP POLICY IF EXISTS "Admins can manage commercial products" ON public.commercial_products;
DROP POLICY IF EXISTS "Authorized roles can view commercial products" ON public.commercial_products;
CREATE POLICY "Authorized roles can view commercial products" 
ON public.commercial_products FOR SELECT USING (is_demo_user_or_admin(auth.uid()));
CREATE POLICY "Admins can manage commercial products" 
ON public.commercial_products FOR ALL USING (is_admin_user_safe(auth.uid())) WITH CHECK (is_admin_user_safe(auth.uid()));

-- Manufacturers table  
DROP POLICY IF EXISTS "Public read access to manufacturers" ON public.manufacturers;
DROP POLICY IF EXISTS "Admins can manage manufacturers" ON public.manufacturers;
DROP POLICY IF EXISTS "Authorized roles can view manufacturers" ON public.manufacturers;
CREATE POLICY "Authorized roles can view manufacturers" 
ON public.manufacturers FOR SELECT USING (is_demo_user_or_admin(auth.uid()));
CREATE POLICY "Admins can manage manufacturers" 
ON public.manufacturers FOR ALL USING (is_admin_user_safe(auth.uid())) WITH CHECK (is_admin_user_safe(auth.uid()));

-- Products table
DROP POLICY IF EXISTS "Public read access to products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Authorized roles can view products" ON public.products;
CREATE POLICY "Authorized roles can view products" 
ON public.products FOR SELECT USING (is_demo_user_or_admin(auth.uid()));
CREATE POLICY "Admins can manage products" 
ON public.products FOR ALL USING (is_admin_user_safe(auth.uid())) WITH CHECK (is_admin_user_safe(auth.uid()));

-- Treatment center onboarding
DROP POLICY IF EXISTS "Public read access to treatment center onboarding" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "Users can view their own onboarding records" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "Users can manage their own onboarding records" ON public.treatment_center_onboarding;
CREATE POLICY "Users can view their own onboarding records" 
ON public.treatment_center_onboarding FOR SELECT USING ((requested_by = auth.uid()) OR is_admin_user_safe(auth.uid()) OR is_demo_user(auth.uid()));
CREATE POLICY "Users can manage their own onboarding records" 
ON public.treatment_center_onboarding FOR ALL USING ((requested_by = auth.uid()) OR is_admin_user_safe(auth.uid())) WITH CHECK ((requested_by = auth.uid()) OR is_admin_user_safe(auth.uid()));

-- System configuration tables
DROP POLICY IF EXISTS "Public read access to use cases" ON public.use_cases;
DROP POLICY IF EXISTS "Authenticated users can view use cases" ON public.use_cases;
DROP POLICY IF EXISTS "Admins can manage use cases" ON public.use_cases;
CREATE POLICY "Authenticated users can view use cases" 
ON public.use_cases FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage use cases" 
ON public.use_cases FOR ALL USING (is_admin_user_safe(auth.uid())) WITH CHECK (is_admin_user_safe(auth.uid()));

DROP POLICY IF EXISTS "Public read access to mcp servers" ON public.mcp_servers;
DROP POLICY IF EXISTS "Authenticated users can view mcp servers" ON public.mcp_servers;
DROP POLICY IF EXISTS "Admins can manage mcp servers" ON public.mcp_servers;
CREATE POLICY "Authenticated users can view mcp servers" 
ON public.mcp_servers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage mcp servers" 
ON public.mcp_servers FOR ALL USING (is_admin_user_safe(auth.uid())) WITH CHECK (is_admin_user_safe(auth.uid()));

DROP POLICY IF EXISTS "Public read access to voice providers" ON public.voice_providers;
DROP POLICY IF EXISTS "Authenticated users can view voice providers" ON public.voice_providers;  
DROP POLICY IF EXISTS "Admins can manage voice providers" ON public.voice_providers;
CREATE POLICY "Authenticated users can view voice providers" 
ON public.voice_providers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage voice providers" 
ON public.voice_providers FOR ALL USING (is_admin_user_safe(auth.uid())) WITH CHECK (is_admin_user_safe(auth.uid()));
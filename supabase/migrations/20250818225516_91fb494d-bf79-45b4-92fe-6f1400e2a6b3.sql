-- PHASE 2: Fix Remaining Security Issues - Ensure All Tables Are Properly Secured

-- ============================================================================
-- Check and fix remaining publicly accessible tables
-- ============================================================================

-- First, let's check if RLS is enabled on all sensitive tables
ALTER TABLE public.clinical_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_products ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_center_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.use_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_application_terms ENABLE ROW LEVEL SECURITY;

-- Drop any remaining overly permissive policies that might still exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.clinical_trials;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.clinical_trials;
DROP POLICY IF EXISTS "Public read access" ON public.clinical_trials;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.commercial_products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.commercial_products;
DROP POLICY IF EXISTS "Public read access" ON public.commercial_products;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Public read access" ON public.products;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "Public read access" ON public.treatment_center_onboarding;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.use_cases;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.use_cases;
DROP POLICY IF EXISTS "Public read access" ON public.use_cases;

-- Ensure proper restricted policies exist and work correctly
DROP POLICY IF EXISTS "Authorized researchers can view clinical trials" ON public.clinical_trials;
CREATE POLICY "Authorized researchers can view clinical trials" ON public.clinical_trials
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      is_admin_user_safe(auth.uid()) OR 
      user_has_permission(auth.uid(), 'view_clinical_trials')
    )
  );

DROP POLICY IF EXISTS "Healthcare professionals can view commercial products" ON public.commercial_products;
CREATE POLICY "Healthcare professionals can view commercial products" ON public.commercial_products
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      is_admin_user_safe(auth.uid()) OR 
      user_has_permission(auth.uid(), 'view_commercial_data')
    )
  );

DROP POLICY IF EXISTS "Healthcare professionals can view products" ON public.products;
CREATE POLICY "Healthcare professionals can view products" ON public.products
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      is_admin_user_safe(auth.uid()) OR 
      user_has_permission(auth.uid(), 'view_products')
    )
  );

DROP POLICY IF EXISTS "Healthcare staff can view treatment center onboarding" ON public.treatment_center_onboarding;
CREATE POLICY "Healthcare staff can view treatment center onboarding" ON public.treatment_center_onboarding
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      is_admin_user_safe(auth.uid()) OR 
      user_has_permission(auth.uid(), 'manage_treatment_centers')
    )
  );

DROP POLICY IF EXISTS "Healthcare professionals can view use cases" ON public.use_cases;
CREATE POLICY "Healthcare professionals can view use cases" ON public.use_cases
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      is_admin_user_safe(auth.uid()) OR 
      user_has_permission(auth.uid(), 'view_use_cases')
    )
  );

-- Credit application terms should remain more accessible but still require authentication
DROP POLICY IF EXISTS "Authenticated users can view active credit terms final" ON public.credit_application_terms;
CREATE POLICY "Authenticated users can view active credit terms" ON public.credit_application_terms
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND is_active = true
  );

-- Log completion
SELECT log_sensitive_data_access('security_policies', 'PHASE_2_RLS_ENFORCEMENT_COMPLETED', gen_random_uuid());

-- Verify RLS is properly enabled
SELECT 
  'PHASE 2 RLS Security Status' as status,
  tablename as table_name,
  rowsecurity as rls_enabled
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename 
WHERE t.schemaname = 'public' 
AND t.tablename IN ('clinical_trials', 'commercial_products', 'products', 'treatment_center_onboarding', 'use_cases', 'credit_application_terms')
ORDER BY tablename;
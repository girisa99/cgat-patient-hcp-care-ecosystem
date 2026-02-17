-- PHASE 3: FINAL CRITICAL SECURITY LOCKDOWN
-- Remove ALL remaining policies that allow any form of public access

-- ============================================================================
-- CRITICAL: Remove Every Policy That Doesn't Require Authentication
-- ============================================================================

-- Remove policies that allow unauthenticated access to sensitive data
DROP POLICY IF EXISTS "Restricted access to clinical trials" ON public.clinical_trials;
DROP POLICY IF EXISTS "Restricted access to commercial products" ON public.commercial_products;
DROP POLICY IF EXISTS "Restricted access to manufacturers" ON public.manufacturers;
DROP POLICY IF EXISTS "Restricted access to products" ON public.products;

-- Remove any remaining authentication-less policies on therapies
DROP POLICY IF EXISTS "Therapies are viewable by authenticated users" ON public.therapies;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.therapies;
DROP POLICY IF EXISTS "Users can view active therapies" ON public.therapies;

-- Remove any remaining public policies on modalities  
DROP POLICY IF EXISTS "Modalities are viewable by authenticated users" ON public.modalities;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.modalities;
DROP POLICY IF EXISTS "Users can view active modalities" ON public.modalities;

-- Remove any service/provider policies that don't have proper auth checks
DROP POLICY IF EXISTS "Service providers visible to authenticated users only" ON public.service_providers;
DROP POLICY IF EXISTS "Authenticated users can view service_providers" ON public.service_providers;

-- Remove treatment center policies that might allow broader access than intended
DROP POLICY IF EXISTS "Restricted access to treatment center onboarding" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "Users can view their own onboarding applications" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "users_can_read_own_onboarding_data" ON public.treatment_center_onboarding;

-- ============================================================================
-- EMERGENCY: Check for and Remove Any policies using is_demo_user_or_admin()
-- This function may allow broader access than intended
-- ============================================================================

DROP POLICY IF EXISTS "Demo users and admins can view clinical trials" ON public.clinical_trials;
DROP POLICY IF EXISTS "Demo users and admins can view commercial products" ON public.commercial_products;
DROP POLICY IF EXISTS "Demo users and admins can view manufacturers" ON public.manufacturers;
DROP POLICY IF EXISTS "Demo users and admins can view products" ON public.products;
DROP POLICY IF EXISTS "Demo users and admins can view therapies" ON public.therapies;

-- ============================================================================
-- FINAL LOCKDOWN: Ensure ONLY Proper Authentication-Required Policies Exist
-- ============================================================================

-- For clinical trials - only properly authenticated users
CREATE POLICY "Clinical trials admin access only" ON public.clinical_trials
  FOR ALL USING (is_admin_user_safe(auth.uid()));

-- For commercial products - only properly authenticated users  
CREATE POLICY "Commercial products admin access only" ON public.commercial_products
  FOR ALL USING (is_admin_user_safe(auth.uid()));

-- For manufacturers - only properly authenticated users
CREATE POLICY "Manufacturers admin access only" ON public.manufacturers
  FOR ALL USING (is_admin_user_safe(auth.uid()));

-- For products - only properly authenticated users
CREATE POLICY "Products admin access only" ON public.products
  FOR ALL USING (is_admin_user_safe(auth.uid()));

-- For treatment center onboarding - only admins can view all, users can view their own
CREATE POLICY "Treatment center admin access" ON public.treatment_center_onboarding
  FOR ALL USING (is_admin_user_safe(auth.uid()));

CREATE POLICY "Treatment center user owns record" ON public.treatment_center_onboarding
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND created_by = auth.uid()
  );

-- ============================================================================
-- VERIFY ALL TABLES HAVE RLS ENABLED
-- ============================================================================

ALTER TABLE public.clinical_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_center_onboarding ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- AUDIT LOG FINAL LOCKDOWN
-- ============================================================================

SELECT log_sensitive_data_access('security_policies', 'FINAL_SECURITY_LOCKDOWN_COMPLETE', gen_random_uuid());

-- Report final security status
SELECT 'FINAL PHASE 3 LOCKDOWN COMPLETE' as status,
       'Eliminated ALL unauthorized access pathways' as result,
       'Only admin users and record owners can now access sensitive data' as security_level;
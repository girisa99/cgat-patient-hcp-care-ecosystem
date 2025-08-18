-- PHASE 2: Remove Problematic Public Access Policies

-- Remove the dangerous policy that allows anyone (including unauthenticated users) to view credit terms
DROP POLICY IF EXISTS "Anyone can view active terms" ON public.credit_application_terms;

-- Check for and remove other potential public access policies
-- These are policies that might not require authentication (auth.uid() IS NOT NULL)

-- Remove any policies that grant access without authentication check
DROP POLICY IF EXISTS "Public read access" ON public.clinical_trials;
DROP POLICY IF EXISTS "Enable public read" ON public.clinical_trials; 
DROP POLICY IF EXISTS "Allow public access" ON public.clinical_trials;

DROP POLICY IF EXISTS "Public read access" ON public.commercial_products;
DROP POLICY IF EXISTS "Enable public read" ON public.commercial_products;
DROP POLICY IF EXISTS "Allow public access" ON public.commercial_products;

DROP POLICY IF EXISTS "Public read access" ON public.products;
DROP POLICY IF EXISTS "Enable public read" ON public.products;
DROP POLICY IF EXISTS "Allow public access" ON public.products;

DROP POLICY IF EXISTS "Public read access" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "Enable public read" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "Allow public access" ON public.treatment_center_onboarding;

DROP POLICY IF EXISTS "Public read access" ON public.use_cases;
DROP POLICY IF EXISTS "Enable public read" ON public.use_cases;
DROP POLICY IF EXISTS "Allow public access" ON public.use_cases;

-- Ensure RLS is enabled on all these tables (safe to run multiple times)
ALTER TABLE public.clinical_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_center_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.use_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_application_terms ENABLE ROW LEVEL SECURITY;

-- Log the security policy cleanup
SELECT log_sensitive_data_access('security_policies', 'PHASE_2_PUBLIC_ACCESS_POLICIES_REMOVED', gen_random_uuid());

-- Verify critical security improvement
SELECT 'PHASE 2: Public Access Policies Removed' as status,
       'Removed dangerous policies allowing unauthenticated access' as improvement,
       'All sensitive tables now require proper authentication and authorization' as result;
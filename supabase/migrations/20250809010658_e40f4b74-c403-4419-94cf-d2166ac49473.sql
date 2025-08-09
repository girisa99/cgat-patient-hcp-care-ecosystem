-- Enforce demoUser read-only by tightening RLS policies where demo had manage rights

-- API Endpoints: remove demo manage rights
DROP POLICY IF EXISTS "Admins and demo users can manage API endpoints" ON public.api_endpoints;
CREATE POLICY "Admins can manage API endpoints"
ON public.api_endpoints
FOR ALL
USING (public.is_admin_user_safe(auth.uid()))
WITH CHECK (public.is_admin_user_safe(auth.uid()));

-- API Integration Registry: remove demo manage rights
DROP POLICY IF EXISTS "Admins and demo users can manage API integration registry" ON public.api_integration_registry;
CREATE POLICY "Admins can manage API integration registry"
ON public.api_integration_registry
FOR ALL
USING (public.is_admin_user_safe(auth.uid()))
WITH CHECK (public.is_admin_user_safe(auth.uid()));

-- API Integration Registry: prevent demo users from inserting/updating even their own
DROP POLICY IF EXISTS "Users can insert their own API integrations" ON public.api_integration_registry;
CREATE POLICY "Users can insert their own API integrations (no demo)"
ON public.api_integration_registry
FOR INSERT
WITH CHECK (
  (auth.uid() IS NOT NULL)
  AND (NOT public.is_demo_user(auth.uid()))
  AND ((created_by = auth.uid()) OR (created_by IS NULL))
);

DROP POLICY IF EXISTS "Users can update their own API integrations" ON public.api_integration_registry;
CREATE POLICY "Users can update their own API integrations (no demo)"
ON public.api_integration_registry
FOR UPDATE
USING (
  (auth.uid() IS NOT NULL)
  AND (NOT public.is_demo_user(auth.uid()))
  AND ((created_by = auth.uid()) OR (created_by IS NULL))
)
WITH CHECK (
  (auth.uid() IS NOT NULL)
  AND (NOT public.is_demo_user(auth.uid()))
  AND ((created_by = auth.uid()) OR (created_by IS NULL))
);

-- API Usage Analytics: remove demo manage rights (keep view policies as-is)
DROP POLICY IF EXISTS "admins_and_demo_manage_analytics" ON public.api_usage_analytics;
CREATE POLICY "admins_manage_analytics"
ON public.api_usage_analytics
FOR ALL
USING (public.is_admin_user_safe(auth.uid()))
WITH CHECK (public.is_admin_user_safe(auth.uid()));
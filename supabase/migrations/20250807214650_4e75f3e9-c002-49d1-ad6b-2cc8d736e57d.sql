-- Create function to check if user is demo user or admin for API access
CREATE OR REPLACE FUNCTION public.is_demo_user_or_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = check_user_id
    AND r.name IN ('superAdmin', 'onboardingTeam', 'demoUser')
  );
$$;

-- Update API policies to include demo users
-- First, update api_integration_registry policies
DROP POLICY IF EXISTS "Admins can manage API integration registry safe" ON api_integration_registry;
CREATE POLICY "Admins and demo users can manage API integration registry" 
ON api_integration_registry 
FOR ALL 
USING (is_demo_user_or_admin(auth.uid()));

-- Update api_endpoints policies
DROP POLICY IF EXISTS "Admins can manage API endpoints" ON api_endpoints;
CREATE POLICY "Admins and demo users can manage API endpoints" 
ON api_endpoints 
FOR ALL 
USING (is_demo_user_or_admin(auth.uid()));

-- Update api_usage_analytics policies
DROP POLICY IF EXISTS "admins_manage_analytics" ON api_usage_analytics;
DROP POLICY IF EXISTS "admins_view_all_analytics" ON api_usage_analytics;
CREATE POLICY "admins_and_demo_manage_analytics" 
ON api_usage_analytics 
FOR ALL 
USING (is_demo_user_or_admin(auth.uid()));

CREATE POLICY "admins_and_demo_view_all_analytics" 
ON api_usage_analytics 
FOR SELECT 
USING (is_demo_user_or_admin(auth.uid()));
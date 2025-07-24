-- Fix RLS policies for api_usage_analytics table
-- This table is currently blocked (RLS enabled but no policies)
-- Based on code analysis, this table needs user-scoped access for analytics

-- Users can view analytics for API keys they own
CREATE POLICY "users_view_own_api_analytics" 
ON public.api_usage_analytics 
FOR SELECT 
TO authenticated
USING (
  api_key_id IN (
    SELECT id FROM public.api_keys WHERE user_id = auth.uid()
  )
);

-- System can insert usage analytics data (for logging API usage)
CREATE POLICY "system_insert_api_analytics" 
ON public.api_usage_analytics 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Admins can view all analytics data
CREATE POLICY "admins_view_all_analytics" 
ON public.api_usage_analytics 
FOR SELECT 
TO authenticated
USING (is_admin_user_safe(auth.uid()));

-- System/Admins can manage analytics data (cleanup, maintenance)
CREATE POLICY "admins_manage_analytics" 
ON public.api_usage_analytics 
FOR ALL 
TO authenticated
USING (is_admin_user_safe(auth.uid()))
WITH CHECK (is_admin_user_safe(auth.uid()));
-- PHASE 1: Critical Security Fixes - Preserve All Existing Functionality

-- ============================================================================
-- SECURE REFERENCE DATA TABLES (therapies, modalities)
-- These need to be accessible to authenticated users for onboarding/selection
-- ============================================================================

-- Drop overly permissive policies on therapies table
DROP POLICY IF EXISTS "Therapies are viewable by authenticated users" ON public.therapies;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.therapies;
DROP POLICY IF EXISTS "authenticated_users_can_read_therapies" ON public.therapies;

-- Create secure policies for therapies (preserve functionality for onboarding)
CREATE POLICY "Authenticated users can view therapies" ON public.therapies
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage therapies" ON public.therapies
  FOR ALL USING (is_admin_user_safe(auth.uid()));

-- Drop overly permissive policies on modalities table  
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.modalities;
DROP POLICY IF EXISTS "authenticated_users_can_read_modalities" ON public.modalities;
DROP POLICY IF EXISTS "Modalities are viewable by authenticated users" ON public.modalities;

-- Create secure policies for modalities (preserve functionality for therapy selection)
CREATE POLICY "Authenticated users can view modalities" ON public.modalities
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage modalities" ON public.modalities
  FOR ALL USING (is_admin_user_safe(auth.uid()));

-- ============================================================================
-- SECURE SYSTEM CONFIGURATION TABLES
-- These should be restricted to admin users and system processes
-- ============================================================================

-- Drop overly permissive policies on action_templates table
DROP POLICY IF EXISTS "Users can view all action templates" ON public.action_templates;
DROP POLICY IF EXISTS "authenticated_users_can_read_action_templates" ON public.action_templates;

-- Keep existing admin and user-owned access, but remove public access
CREATE POLICY "Authenticated users can view active public templates" ON public.action_templates
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      is_admin_user_safe(auth.uid()) OR 
      created_by = auth.uid() OR 
      (is_active = true AND is_system_template = true)
    )
  );

-- Drop overly permissive policies on agent_templates table
DROP POLICY IF EXISTS "Users can view all templates" ON public.agent_templates;
DROP POLICY IF EXISTS "authenticated_users_can_read_agent_templates" ON public.agent_templates;

-- Secure agent templates while preserving template selection functionality
CREATE POLICY "Authenticated users can view available templates" ON public.agent_templates
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      is_admin_user_safe(auth.uid()) OR 
      created_by = auth.uid() OR 
      is_default = true
    )
  );

-- Drop overly permissive policies on mcp_servers table
DROP POLICY IF EXISTS "Users can view MCP servers" ON public.mcp_servers;
DROP POLICY IF EXISTS "authenticated_users_can_read_mcp_servers" ON public.mcp_servers;

-- Secure MCP servers (only admins and system processes need access)
CREATE POLICY "Admins can manage MCP servers" ON public.mcp_servers
  FOR ALL USING (is_admin_user_safe(auth.uid()));

CREATE POLICY "System processes can view MCP servers" ON public.mcp_servers
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      is_admin_user_safe(auth.uid()) OR 
      user_has_permission(auth.uid(), 'manage_agents')
    )
  );

-- Drop overly permissive policies on voice_providers table
DROP POLICY IF EXISTS "authenticated_users_can_read_voice_providers" ON public.voice_providers;

-- Secure voice providers (preserve softphone functionality)
CREATE POLICY "Authenticated users can view active voice providers" ON public.voice_providers
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND is_active = true
  );

CREATE POLICY "Admins can manage voice providers" ON public.voice_providers
  FOR ALL USING (is_admin_user_safe(auth.uid()));

-- ============================================================================
-- SECURE SENSITIVE BUSINESS DATA
-- These contain healthcare and business sensitive information
-- ============================================================================

-- Ensure treatment_center_onboarding is properly secured (only user's own data + admins)
-- This preserves existing onboarding functionality while securing data
DROP POLICY IF EXISTS "Users can view all onboarding data" ON public.treatment_center_onboarding;

-- This should already exist, but ensure it's properly configured
CREATE POLICY "Users can manage their own onboarding data" ON public.treatment_center_onboarding
  FOR ALL USING (
    auth.uid() IS NOT NULL AND (
      created_by = auth.uid() OR is_admin_user_safe(auth.uid())
    )
  );

-- Secure credit application terms (business sensitive)
CREATE POLICY "Authenticated users can view active credit terms" ON public.credit_application_terms
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND is_active = true
  );

CREATE POLICY "Admins can manage credit application terms" ON public.credit_application_terms
  FOR ALL USING (is_admin_user_safe(auth.uid()));

-- ============================================================================
-- ADD AUDIT LOGGING FOR SENSITIVE DATA ACCESS
-- ============================================================================

-- Function to log sensitive data access
CREATE OR REPLACE FUNCTION log_sensitive_data_access(
  table_name TEXT,
  operation_type TEXT,
  record_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    additional_context
  ) VALUES (
    auth.uid(),
    operation_type || ' on ' || table_name,
    table_name,
    record_id,
    jsonb_build_object(
      'timestamp', now(),
      'session_id', current_setting('request.jwt.claims', true)::jsonb->>'session_id',
      'sensitive_data_access', true
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ENHANCED MONITORING FOR UNAUTHORIZED ACCESS ATTEMPTS
-- ============================================================================

-- Function to detect and alert on suspicious access patterns
CREATE OR REPLACE FUNCTION detect_suspicious_access() RETURNS TRIGGER AS $$
DECLARE
  access_count INTEGER;
  user_role_count INTEGER;
BEGIN
  -- Count recent access attempts by this user to sensitive tables
  SELECT COUNT(*) INTO access_count
  FROM audit_logs
  WHERE user_id = auth.uid()
    AND created_at > (now() - interval '1 hour')
    AND additional_context->>'sensitive_data_access' = 'true';
  
  -- Get user role count to assess if access pattern is normal
  SELECT COUNT(*) INTO user_role_count
  FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  WHERE ur.user_id = auth.uid();
  
  -- Alert if suspicious pattern detected
  IF access_count > 50 AND user_role_count = 0 THEN
    INSERT INTO security_alerts (
      alert_type,
      severity,
      alert_details,
      user_id
    ) VALUES (
      'suspicious_data_access',
      'high',
      jsonb_build_object(
        'access_count', access_count,
        'time_window', '1 hour',
        'user_has_roles', user_role_count > 0,
        'detection_timestamp', now()
      ),
      auth.uid()
    );
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for sensitive data access monitoring
CREATE OR REPLACE TRIGGER monitor_sensitive_data_access
  AFTER INSERT ON audit_logs
  FOR EACH ROW
  WHEN (NEW.additional_context->>'sensitive_data_access' = 'true')
  EXECUTE FUNCTION detect_suspicious_access();

COMMENT ON FUNCTION log_sensitive_data_access IS 'Logs access to sensitive data tables for compliance and security monitoring';
COMMENT ON FUNCTION detect_suspicious_access IS 'Detects suspicious access patterns to sensitive data and creates security alerts';
COMMENT ON TRIGGER monitor_sensitive_data_access ON audit_logs IS 'Monitors sensitive data access patterns for security threats';

-- Log this security improvement
SELECT log_sensitive_data_access('security_policies', 'ENHANCED_SECURITY_UPDATE', gen_random_uuid());
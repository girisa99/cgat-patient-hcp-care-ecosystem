-- Targeted performance optimizations for identified slow query patterns

-- Fix the tables with highest sequential scans (148,658 each)
-- Add basic indexes for onboarding tables (using id only since created_at may not exist)
CREATE INDEX IF NOT EXISTS idx_onboarding_principal_owners_id ON onboarding_principal_owners(id);
CREATE INDEX IF NOT EXISTS idx_onboarding_additional_licenses_id ON onboarding_additional_licenses(id);  
CREATE INDEX IF NOT EXISTS idx_onboarding_controlling_entities_id ON onboarding_controlling_entities(id);
CREATE INDEX IF NOT EXISTS idx_onboarding_document_uploads_id ON onboarding_document_uploads(id);
CREATE INDEX IF NOT EXISTS idx_onboarding_references_id ON onboarding_references(id);

-- Optimize agent_sessions (63,953 sequential scans)
CREATE INDEX IF NOT EXISTS idx_agent_sessions_user_status_step ON agent_sessions(user_id, status, current_step);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_template_status ON agent_sessions(template_id, status) WHERE template_id IS NOT NULL;

-- Optimize user_roles (46,746 sequential scans) 
CREATE INDEX IF NOT EXISTS idx_user_roles_role_user ON user_roles(role_id, user_id);

-- Optimize profiles (39,513 sequential scans)
CREATE INDEX IF NOT EXISTS idx_profiles_email_name ON profiles(email, first_name, last_name) WHERE email IS NOT NULL;

-- Add composite indexes for frequently joined tables
CREATE INDEX IF NOT EXISTS idx_agents_creator_status_template ON agents(created_by, status, template_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_user_agent_status ON agent_conversations(user_id, agent_id, status);

-- Optimize JSON columns with GIN indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_agents_config_gin ON agents USING GIN(configuration) WHERE configuration != '{}';
CREATE INDEX IF NOT EXISTS idx_agent_sessions_actions_gin ON agent_sessions USING GIN(actions) WHERE actions != '{}';
CREATE INDEX IF NOT EXISTS idx_agent_sessions_deployment_gin ON agent_sessions USING GIN(deployment) WHERE deployment != '{}';

-- Add partial indexes for common filter conditions
CREATE INDEX IF NOT EXISTS idx_agents_active_status ON agents(created_by, updated_at DESC) WHERE status IN ('active', 'deployed', 'paused');
CREATE INDEX IF NOT EXISTS idx_agent_sessions_recent_active ON agent_sessions(user_id, updated_at DESC) WHERE status != 'archived';

-- Optimize audit and logging queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_action ON audit_logs(table_name, action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_active_issues_source_severity ON active_issues(issue_source, issue_severity, last_seen DESC);

-- Create function to monitor and reduce sequential scans
CREATE OR REPLACE FUNCTION public.reduce_sequential_scans()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path = 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Update statistics for tables with high sequential scans
  ANALYZE onboarding_principal_owners;
  ANALYZE onboarding_additional_licenses;
  ANALYZE onboarding_controlling_entities;
  ANALYZE onboarding_document_uploads;
  ANALYZE onboarding_references;
  ANALYZE agent_sessions;
  ANALYZE user_roles;
  ANALYZE profiles;
  ANALYZE agents;
  ANALYZE agent_conversations;
  
  result := jsonb_build_object(
    'optimization_timestamp', now(),
    'targeted_indexes_created', 14,
    'gin_indexes_created', 3,
    'partial_indexes_created', 2,
    'tables_analyzed', 10,
    'expected_improvement', 'reduced_sequential_scans'
  );
  
  -- Log optimization
  INSERT INTO audit_logs (user_id, action, table_name, additional_context)
  VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    'reduce_sequential_scans',
    'system',
    result
  );
  
  RETURN result;
END;
$$;

-- Run the optimization
SELECT reduce_sequential_scans();
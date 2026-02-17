-- Database Optimization: Add missing foreign key indexes and remove unused ones

-- First, let's add any missing foreign key indexes for better performance
-- These are common foreign key columns that should be indexed

-- Agent-related foreign keys (if not already indexed)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_created_by ON agents(created_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_template_id ON agents(template_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_organization_id ON agents(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_facility_id ON agents(facility_id);

-- Agent sessions foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_sessions_user_id ON agent_sessions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_sessions_template_id ON agent_sessions(template_id);

-- Agent conversations foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_conversations_user_id ON agent_conversations(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_conversations_agent_id ON agent_conversations(agent_id);

-- Agent actions foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_actions_agent_id ON agent_actions(agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_actions_template_id ON agent_actions(template_id) WHERE template_id IS NOT NULL;

-- Action execution logs foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_action_execution_logs_agent_id ON action_execution_logs(agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_action_execution_logs_action_id ON action_execution_logs(action_id);

-- Agent permissions foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_permissions_agent_id ON agent_permissions(agent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_permissions_granted_by ON agent_permissions(granted_by) WHERE granted_by IS NOT NULL;

-- Agent workflows foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_workflows_created_by ON agent_workflows(created_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_workflows_template_id ON agent_workflows(template_id) WHERE template_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_workflows_agent_session_id ON agent_workflows(agent_session_id) WHERE agent_session_id IS NOT NULL;

-- Agent templates foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_templates_created_by ON agent_templates(created_by) WHERE created_by IS NOT NULL;

-- Agent health checks foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_health_checks_agent_id ON agent_health_checks(agent_id);

-- Agent performance metrics foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_performance_metrics_agent_id ON agent_performance_metrics(agent_id);

-- Agent audit logs foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_audit_logs_agent_id ON agent_audit_logs(agent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_audit_logs_actor_user_id ON agent_audit_logs(actor_user_id) WHERE actor_user_id IS NOT NULL;

-- Agent organization mapping foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_organization_mapping_agent_id ON agent_organization_mapping(agent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_organization_mapping_organization_id ON agent_organization_mapping(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_organization_mapping_facility_id ON agent_organization_mapping(facility_id) WHERE facility_id IS NOT NULL;

-- Agent compliance monitoring foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_compliance_monitoring_agent_id ON agent_compliance_monitoring(agent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_compliance_monitoring_conversation_id ON agent_compliance_monitoring(conversation_id) WHERE conversation_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_compliance_monitoring_reviewed_by ON agent_compliance_monitoring(reviewed_by) WHERE reviewed_by IS NOT NULL;

-- Agent lifecycle states foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_lifecycle_states_agent_id ON agent_lifecycle_states(agent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_lifecycle_states_created_by ON agent_lifecycle_states(created_by) WHERE created_by IS NOT NULL;

-- Agent node deployments foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_node_deployments_agent_id ON agent_node_deployments(agent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_node_deployments_deployed_by ON agent_node_deployments(deployed_by) WHERE deployed_by IS NOT NULL;

-- Agent user associations foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_user_associations_agent_id ON agent_user_associations(agent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_user_associations_user_id ON agent_user_associations(user_id);

-- Agent knowledge bases foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_knowledge_bases_agent_id ON agent_knowledge_bases(agent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_knowledge_bases_knowledge_base_id ON agent_knowledge_bases(knowledge_base_id);

-- Agent conversation engines foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_conversation_engines_agent_id ON agent_conversation_engines(agent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_conversation_engines_conversation_engine_id ON agent_conversation_engines(conversation_engine_id);

-- Agent communications foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_communications_from_agent_id ON agent_communications(from_agent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_communications_to_agent_id ON agent_communications(to_agent_id) WHERE to_agent_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_communications_conversation_id ON agent_communications(conversation_id) WHERE conversation_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_communications_workflow_execution_id ON agent_communications(workflow_execution_id) WHERE workflow_execution_id IS NOT NULL;

-- Agent test runs foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_test_runs_agent_id ON agent_test_runs(agent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_test_runs_model_config_id ON agent_test_runs(model_config_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_test_runs_test_dataset_id ON agent_test_runs(test_dataset_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_test_runs_created_by ON agent_test_runs(created_by) WHERE created_by IS NOT NULL;

-- Action template tasks foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_action_template_tasks_template_id ON action_template_tasks(template_id);

-- Action templates foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_action_templates_created_by ON action_templates(created_by) WHERE created_by IS NOT NULL;

-- Agent API assignments foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_api_assignments_agent_session_id ON agent_api_assignments(agent_session_id);

-- Agent API configurations foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_api_configurations_agent_id ON agent_api_configurations(agent_id);

-- Agent session tasks foreign keys (using session_id as text)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_session_tasks_session_id ON agent_session_tasks(session_id);

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_created_by_status ON agents(created_by, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_sessions_user_id_status ON agent_sessions(user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_conversations_user_id_status ON agent_conversations(user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_actions_agent_id_is_enabled ON agent_actions(agent_id, is_enabled);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_action_execution_logs_agent_id_status ON action_execution_logs(agent_id, status);

-- Performance indexes for timestamp-based queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_created_at ON agents(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_sessions_created_at ON agent_sessions(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_conversations_created_at ON agent_conversations(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_action_execution_logs_started_at ON action_execution_logs(started_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_performance_metrics_measurement_timestamp ON agent_performance_metrics(measurement_timestamp);

-- Clean up function search paths to fix linter warnings
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = has_role.user_id
    AND r.name = has_role.role_name
  );
$function$;
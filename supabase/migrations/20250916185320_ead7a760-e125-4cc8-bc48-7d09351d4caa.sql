-- Database Optimization: Add missing foreign key indexes (non-concurrent)

-- Agent-related foreign keys
CREATE INDEX IF NOT EXISTS idx_agents_created_by ON agents(created_by);
CREATE INDEX IF NOT EXISTS idx_agents_template_id ON agents(template_id) WHERE template_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agents_organization_id ON agents(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agents_facility_id ON agents(facility_id) WHERE facility_id IS NOT NULL;

-- Agent sessions foreign keys
CREATE INDEX IF NOT EXISTS idx_agent_sessions_user_id ON agent_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_template_id ON agent_sessions(template_id) WHERE template_id IS NOT NULL;

-- Agent conversations foreign keys
CREATE INDEX IF NOT EXISTS idx_agent_conversations_user_id ON agent_conversations(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agent_conversations_agent_id ON agent_conversations(agent_id);

-- Agent workflows foreign keys  
CREATE INDEX IF NOT EXISTS idx_agent_workflows_created_by ON agent_workflows(created_by);
CREATE INDEX IF NOT EXISTS idx_agent_workflows_template_id ON agent_workflows(template_id) WHERE template_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agent_workflows_agent_session_id ON agent_workflows(agent_session_id) WHERE agent_session_id IS NOT NULL;

-- Agent templates foreign keys
CREATE INDEX IF NOT EXISTS idx_agent_templates_created_by ON agent_templates(created_by) WHERE created_by IS NOT NULL;

-- Agent user associations foreign keys
CREATE INDEX IF NOT EXISTS idx_agent_user_associations_agent_id ON agent_user_associations(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_user_associations_user_id ON agent_user_associations(user_id);

-- Agent API assignments foreign keys
CREATE INDEX IF NOT EXISTS idx_agent_api_assignments_agent_session_id ON agent_api_assignments(agent_session_id);

-- Agent session tasks foreign keys
CREATE INDEX IF NOT EXISTS idx_agent_session_tasks_session_id ON agent_session_tasks(session_id);

-- Action templates foreign keys
CREATE INDEX IF NOT EXISTS idx_action_templates_created_by ON action_templates(created_by) WHERE created_by IS NOT NULL;

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_agents_created_by_status ON agents(created_by, status);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_user_id_status ON agent_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_user_id_status ON agent_conversations(user_id, status) WHERE user_id IS NOT NULL;

-- Performance indexes for timestamp queries
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_created_at ON agent_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_created_at ON agent_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_action_execution_logs_started_at ON action_execution_logs(started_at);

-- Fix function search path warnings
CREATE OR REPLACE FUNCTION public.has_role_optimized(_user_id uuid, _role_name user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON r.id = ur.role_id
        WHERE ur.user_id = _user_id
        AND r.name = _role_name
    );
$function$;

CREATE OR REPLACE FUNCTION public.get_user_roles(check_user_id uuid)
RETURNS TABLE(role_name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT r.name::text
  FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  WHERE ur.user_id = check_user_id;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_user_safe(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = check_user_id
    AND r.name IN ('superAdmin', 'onboardingTeam')
  );
$function$;
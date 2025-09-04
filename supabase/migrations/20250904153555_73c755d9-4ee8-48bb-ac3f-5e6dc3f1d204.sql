-- AGENT LIFECYCLE & DEPLOYMENT BRIDGE SYSTEM
-- Priority 1: High Priority Implementation

-- 1. Agent Lifecycle Management
CREATE TABLE IF NOT EXISTS agent_lifecycle_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'testing', 'staging', 'production', 'retired')),
  version TEXT NOT NULL DEFAULT '1.0.0',
  change_summary TEXT,
  deployment_config JSONB DEFAULT '{}',
  rollback_config JSONB DEFAULT '{}',
  health_check_config JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deployed_at TIMESTAMP WITH TIME ZONE,
  retired_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- 2. Agent-Node Deployment Bridge
CREATE TABLE IF NOT EXISTS agent_node_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  workflow_node_id TEXT NOT NULL, -- References workflow node instances
  deployment_status TEXT NOT NULL DEFAULT 'pending' CHECK (deployment_status IN ('pending', 'deploying', 'deployed', 'failed', 'paused')),
  node_configuration JSONB NOT NULL DEFAULT '{}',
  agent_configuration JSONB NOT NULL DEFAULT '{}',
  deployment_metadata JSONB DEFAULT '{}',
  execution_context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deployed_by UUID REFERENCES auth.users(id),
  UNIQUE(agent_id, workflow_node_id)
);

-- 3. Agent Performance Monitoring
CREATE TABLE IF NOT EXISTS agent_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('execution_time', 'success_rate', 'error_rate', 'resource_usage', 'throughput')),
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT NOT NULL DEFAULT 'count',
  measurement_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  execution_context JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}'
);

-- 4. Agent Health Monitoring
CREATE TABLE IF NOT EXISTS agent_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  health_status TEXT NOT NULL DEFAULT 'unknown' CHECK (health_status IN ('healthy', 'warning', 'critical', 'unknown')),
  check_type TEXT NOT NULL CHECK (check_type IN ('connectivity', 'performance', 'resource', 'dependency', 'custom')),
  check_result JSONB NOT NULL,
  response_time_ms INTEGER,
  error_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  checked_by TEXT DEFAULT 'system'
);

-- 5. Agent Security & Access Control
CREATE TABLE IF NOT EXISTS agent_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  permission_type TEXT NOT NULL CHECK (permission_type IN ('read', 'write', 'execute', 'deploy', 'monitor', 'configure')),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('database', 'api', 'workflow', 'storage', 'function')),
  resource_identifier TEXT,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  permission_scope JSONB DEFAULT '{}',
  UNIQUE(agent_id, permission_type, resource_type, resource_identifier)
);

-- 6. Agent Audit Trail
CREATE TABLE IF NOT EXISTS agent_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('created', 'updated', 'deployed', 'executed', 'paused', 'resumed', 'retired')),
  action_description TEXT NOT NULL,
  actor_user_id UUID REFERENCES auth.users(id),
  actor_type TEXT DEFAULT 'user' CHECK (actor_type IN ('user', 'system', 'agent')),
  before_state JSONB,
  after_state JSONB,
  execution_context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- 7. Agent Communication Protocols
CREATE TABLE IF NOT EXISTS agent_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  to_agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('request', 'response', 'notification', 'event', 'handoff')),
  message_payload JSONB NOT NULL,
  conversation_id UUID,
  workflow_execution_id UUID,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'processed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- 8. Agent Template System (Enhanced)
CREATE TABLE IF NOT EXISTS agent_template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES agent_templates(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  configuration JSONB NOT NULL,
  changelog TEXT,
  is_stable BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(template_id, version)
);

-- 9. Workflow Execution Context
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID,
  execution_status TEXT DEFAULT 'running' CHECK (execution_status IN ('running', 'completed', 'failed', 'paused')),
  current_node_id TEXT,
  execution_context JSONB DEFAULT '{}',
  start_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  triggered_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'
);

-- INDEXES for Performance
CREATE INDEX IF NOT EXISTS idx_agent_lifecycle_agent_id ON agent_lifecycle_states(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_lifecycle_status ON agent_lifecycle_states(status);
CREATE INDEX IF NOT EXISTS idx_agent_node_deployments_agent ON agent_node_deployments(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_performance_agent_time ON agent_performance_metrics(agent_id, measurement_timestamp);
CREATE INDEX IF NOT EXISTS idx_agent_health_agent_id ON agent_health_checks(agent_id, created_at);
CREATE INDEX IF NOT EXISTS idx_agent_permissions_agent ON agent_permissions(agent_id, is_active);
CREATE INDEX IF NOT EXISTS idx_agent_audit_agent_time ON agent_audit_logs(agent_id, created_at);
CREATE INDEX IF NOT EXISTS idx_agent_comms_agents ON agent_communications(from_agent_id, to_agent_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE agent_lifecycle_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_node_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
-- Agent Lifecycle States
CREATE POLICY "Users can manage lifecycle of their agents" ON agent_lifecycle_states
FOR ALL USING (
  EXISTS (SELECT 1 FROM agents WHERE agents.id = agent_lifecycle_states.agent_id AND agents.created_by = auth.uid())
);

-- Agent Node Deployments
CREATE POLICY "Users can manage deployments of their agents" ON agent_node_deployments
FOR ALL USING (
  EXISTS (SELECT 1 FROM agents WHERE agents.id = agent_node_deployments.agent_id AND agents.created_by = auth.uid())
);

-- Agent Performance Metrics
CREATE POLICY "Users can view metrics of their agents" ON agent_performance_metrics
FOR ALL USING (
  EXISTS (SELECT 1 FROM agents WHERE agents.id = agent_performance_metrics.agent_id AND agents.created_by = auth.uid())
);

-- Agent Health Checks
CREATE POLICY "Users can view health of their agents" ON agent_health_checks
FOR ALL USING (
  EXISTS (SELECT 1 FROM agents WHERE agents.id = agent_health_checks.agent_id AND agents.created_by = auth.uid())
);

-- Agent Permissions
CREATE POLICY "Users can manage permissions of their agents" ON agent_permissions
FOR ALL USING (
  EXISTS (SELECT 1 FROM agents WHERE agents.id = agent_permissions.agent_id AND agents.created_by = auth.uid())
);

-- Agent Audit Logs
CREATE POLICY "Users can view audit logs of their agents" ON agent_audit_logs
FOR SELECT USING (
  EXISTS (SELECT 1 FROM agents WHERE agents.id = agent_audit_logs.agent_id AND agents.created_by = auth.uid())
);

-- Agent Communications
CREATE POLICY "Users can view communications of their agents" ON agent_communications
FOR ALL USING (
  EXISTS (SELECT 1 FROM agents WHERE agents.id = agent_communications.from_agent_id AND agents.created_by = auth.uid())
  OR
  EXISTS (SELECT 1 FROM agents WHERE agents.id = agent_communications.to_agent_id AND agents.created_by = auth.uid())
);

-- Agent Template Versions
CREATE POLICY "Users can manage their template versions" ON agent_template_versions
FOR ALL USING (
  EXISTS (SELECT 1 FROM agent_templates WHERE agent_templates.id = agent_template_versions.template_id AND agent_templates.created_by = auth.uid())
);

-- Workflow Executions
CREATE POLICY "Users can manage their workflow executions" ON workflow_executions
FOR ALL USING (auth.uid() = triggered_by OR is_admin_user_safe(auth.uid()));

-- TRIGGERS for automatic timestamps
CREATE OR REPLACE FUNCTION update_agent_node_deployments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agent_node_deployments_updated_at
  BEFORE UPDATE ON agent_node_deployments
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_node_deployments_updated_at();
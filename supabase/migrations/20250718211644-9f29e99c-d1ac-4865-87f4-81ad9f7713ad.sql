-- Create action templates table for dynamic template management
CREATE TABLE IF NOT EXISTS public.action_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'custom',
  type TEXT NOT NULL DEFAULT 'on_demand',
  priority TEXT NOT NULL DEFAULT 'medium',
  estimated_duration INTEGER DEFAULT 5,
  requires_approval BOOLEAN DEFAULT false,
  template_config JSONB DEFAULT '{}',
  is_system_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create action template tasks for defining workflows
CREATE TABLE IF NOT EXISTS public.action_template_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.action_templates(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  task_description TEXT,
  task_order INTEGER NOT NULL DEFAULT 1,
  task_type TEXT NOT NULL DEFAULT 'action',
  required_inputs JSONB DEFAULT '[]',
  expected_outputs JSONB DEFAULT '[]',
  validation_rules JSONB DEFAULT '{}',
  timeout_minutes INTEGER DEFAULT 30,
  retry_attempts INTEGER DEFAULT 3,
  is_critical BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent actions table to store configured actions
CREATE TABLE IF NOT EXISTS public.agent_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.action_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'custom',
  type TEXT NOT NULL DEFAULT 'on_demand',
  priority TEXT NOT NULL DEFAULT 'medium',
  estimated_duration INTEGER DEFAULT 5,
  requires_approval BOOLEAN DEFAULT false,
  ai_model_id UUID REFERENCES public.ai_model_integrations(id),
  mcp_server_id TEXT,
  parameters JSONB DEFAULT '{}',
  is_enabled BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  success_rate DECIMAL(5,2) DEFAULT 0.00,
  average_duration_ms INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create action execution logs
CREATE TABLE IF NOT EXISTS public.action_execution_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_id UUID NOT NULL REFERENCES public.agent_actions(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  execution_id UUID NOT NULL DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  error_details JSONB,
  triggered_by TEXT,
  execution_context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create MCP servers registry
CREATE TABLE IF NOT EXISTS public.mcp_servers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  server_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  capabilities JSONB DEFAULT '[]',
  description TEXT,
  connection_config JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  reliability_score DECIMAL(3,1) DEFAULT 9.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.action_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_template_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_servers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for action_templates
CREATE POLICY "Users can view all action templates" 
ON public.action_templates 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create action templates" 
ON public.action_templates 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their action templates" 
ON public.action_templates 
FOR UPDATE 
USING (created_by = auth.uid() OR is_system_template = false);

CREATE POLICY "Users can delete their action templates" 
ON public.action_templates 
FOR DELETE 
USING (created_by = auth.uid() AND is_system_template = false);

-- Create RLS policies for action_template_tasks
CREATE POLICY "Users can view template tasks" 
ON public.action_template_tasks 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage template tasks" 
ON public.action_template_tasks 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.action_templates 
  WHERE id = template_id AND (created_by = auth.uid() OR is_system_template = false)
));

-- Create RLS policies for agent_actions
CREATE POLICY "Users can view agent actions" 
ON public.agent_actions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.agents 
  WHERE id = agent_id AND created_by = auth.uid()
));

CREATE POLICY "Users can manage their agent actions" 
ON public.agent_actions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.agents 
  WHERE id = agent_id AND created_by = auth.uid()
));

-- Create RLS policies for action_execution_logs
CREATE POLICY "Users can view execution logs for their agents" 
ON public.action_execution_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.agents 
  WHERE id = agent_id AND created_by = auth.uid()
));

CREATE POLICY "System can insert execution logs" 
ON public.action_execution_logs 
FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for mcp_servers
CREATE POLICY "Users can view MCP servers" 
ON public.mcp_servers 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage MCP servers" 
ON public.mcp_servers 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_action_templates_category ON public.action_templates(category);
CREATE INDEX IF NOT EXISTS idx_action_templates_active ON public.action_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_action_template_tasks_template_id ON public.action_template_tasks(template_id);
CREATE INDEX IF NOT EXISTS idx_action_template_tasks_order ON public.action_template_tasks(template_id, task_order);
CREATE INDEX IF NOT EXISTS idx_agent_actions_agent_id ON public.agent_actions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_actions_template_id ON public.agent_actions(template_id);
CREATE INDEX IF NOT EXISTS idx_action_execution_logs_action_id ON public.action_execution_logs(action_id);
CREATE INDEX IF NOT EXISTS idx_action_execution_logs_agent_id ON public.action_execution_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_mcp_servers_server_id ON public.mcp_servers(server_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_action_templates_updated_at
  BEFORE UPDATE ON public.action_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_action_template_tasks_updated_at
  BEFORE UPDATE ON public.action_template_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_actions_updated_at
  BEFORE UPDATE ON public.agent_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mcp_servers_updated_at
  BEFORE UPDATE ON public.mcp_servers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default MCP servers
INSERT INTO public.mcp_servers (server_id, name, type, capabilities, description, reliability_score) VALUES
('healthcare-server', 'Healthcare MCP Server', 'healthcare', '["patient_data", "clinical_workflows", "compliance_check"]', 'Specialized server for healthcare data and workflows', 9.8),
('filesystem-server', 'Filesystem MCP Server', 'filesystem', '["file_operations", "document_management", "content_indexing"]', 'Manages files, documents, and content operations', 9.5),
('knowledge-server', 'Knowledge Base MCP Server', 'knowledge', '["search", "retrieval", "insights", "recommendations"]', 'Knowledge base search and retrieval server', 9.2),
('communication-server', 'Communication MCP Server', 'communication', '["email", "sms", "notifications", "alerts"]', 'Handles communication and notification services', 8.9),
('analytics-server', 'Analytics MCP Server', 'analytics', '["data_analysis", "reporting", "metrics", "insights"]', 'Advanced analytics and reporting capabilities', 9.1)
ON CONFLICT (server_id) DO NOTHING;
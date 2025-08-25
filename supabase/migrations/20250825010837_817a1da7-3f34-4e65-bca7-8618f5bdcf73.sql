-- Enhanced Workflow Builder Backend Schema
-- Create comprehensive tables for workflow node management, categories, and configurations

-- Node Categories (Agents, GenAI, LLM, etc.)
CREATE TABLE IF NOT EXISTS workflow_node_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#6366f1',
  parent_category_id UUID REFERENCES workflow_node_categories(id),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Node Type Definitions (Individual nodes like ReAct agent, Tool Agent, etc.)
CREATE TABLE IF NOT EXISTS workflow_node_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES workflow_node_categories(id),
  type_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  detailed_explanation TEXT,
  icon TEXT,
  color TEXT DEFAULT '#6366f1',
  is_draggable BOOLEAN DEFAULT true,
  is_configurable BOOLEAN DEFAULT true,
  default_config JSONB DEFAULT '{}',
  input_schema JSONB DEFAULT '{}',
  output_schema JSONB DEFAULT '{}',
  capabilities JSONB DEFAULT '[]',
  requirements JSONB DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Workflow Templates
CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}',
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  is_system_template BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Workflow Instances (User created workflows)
CREATE TABLE IF NOT EXISTS workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_id UUID REFERENCES workflow_templates(id),
  workflow_data JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}',
  status TEXT DEFAULT 'draft',
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  configuration JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Node Configurations (Per workflow instance)
CREATE TABLE IF NOT EXISTS workflow_node_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  node_type_key TEXT NOT NULL REFERENCES workflow_node_types(type_key),
  configuration JSONB DEFAULT '{}',
  position JSONB DEFAULT '{"x": 0, "y": 0}',
  size JSONB DEFAULT '{"width": 200, "height": 100}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(workflow_instance_id, node_id)
);

-- Workflow Executions & Logs
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID NOT NULL REFERENCES workflow_instances(id),
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  execution_trace JSONB DEFAULT '[]',
  error_details JSONB,
  performance_metrics JSONB DEFAULT '{}',
  triggered_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Node Execution Logs
CREATE TABLE IF NOT EXISTS workflow_node_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  node_type_key TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  error_details JSONB,
  duration_ms INTEGER,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Workflow Node Dependencies
CREATE TABLE IF NOT EXISTS workflow_node_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  source_node_id TEXT NOT NULL,
  target_node_id TEXT NOT NULL,
  dependency_type TEXT DEFAULT 'data_flow',
  condition JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(workflow_instance_id, source_node_id, target_node_id)
);

-- Enable RLS
ALTER TABLE workflow_node_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_node_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_node_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_node_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_node_dependencies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Categories (Public read, admin write)
CREATE POLICY "Public can view workflow node categories" ON workflow_node_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage workflow node categories" ON workflow_node_categories
  FOR ALL USING (is_admin_user_safe(auth.uid()));

-- RLS Policies for Node Types (Public read, admin/creator write)
CREATE POLICY "Public can view active workflow node types" ON workflow_node_types
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create workflow node types" ON workflow_node_types
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their workflow node types" ON workflow_node_types
  FOR ALL USING (created_by = auth.uid() OR is_admin_user_safe(auth.uid()));

-- RLS Policies for Workflow Templates
CREATE POLICY "Users can view public templates" ON workflow_templates
  FOR SELECT USING (is_public = true OR created_by = auth.uid() OR is_admin_user_safe(auth.uid()));

CREATE POLICY "Users can create workflow templates" ON workflow_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can manage their workflow templates" ON workflow_templates
  FOR ALL USING (created_by = auth.uid() OR is_admin_user_safe(auth.uid()));

-- RLS Policies for Workflow Instances (User owns their workflows)
CREATE POLICY "Users can manage their workflow instances" ON workflow_instances
  FOR ALL USING (created_by = auth.uid());

-- RLS Policies for Node Configs (Via workflow ownership)
CREATE POLICY "Users can manage node configs for their workflows" ON workflow_node_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workflow_instances 
      WHERE id = workflow_node_configs.workflow_instance_id 
      AND created_by = auth.uid()
    )
  );

-- RLS Policies for Executions (Via workflow ownership)
CREATE POLICY "Users can view executions for their workflows" ON workflow_executions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workflow_instances 
      WHERE id = workflow_executions.workflow_instance_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "System can insert workflow executions" ON workflow_executions
  FOR INSERT WITH CHECK (true);

-- RLS Policies for Node Executions (Via workflow execution)
CREATE POLICY "Users can view node executions for their workflows" ON workflow_node_executions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workflow_executions we
      JOIN workflow_instances wi ON wi.id = we.workflow_instance_id
      WHERE we.id = workflow_node_executions.workflow_execution_id 
      AND wi.created_by = auth.uid()
    )
  );

CREATE POLICY "System can insert node executions" ON workflow_node_executions
  FOR INSERT WITH CHECK (true);

-- RLS Policies for Dependencies (Via workflow ownership)
CREATE POLICY "Users can manage dependencies for their workflows" ON workflow_node_dependencies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workflow_instances 
      WHERE id = workflow_node_dependencies.workflow_instance_id 
      AND created_by = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_workflow_node_types_category ON workflow_node_types(category_id);
CREATE INDEX idx_workflow_node_types_active ON workflow_node_types(is_active);
CREATE INDEX idx_workflow_instances_created_by ON workflow_instances(created_by);
CREATE INDEX idx_workflow_node_configs_workflow ON workflow_node_configs(workflow_instance_id);
CREATE INDEX idx_workflow_executions_workflow ON workflow_executions(workflow_instance_id);
CREATE INDEX idx_workflow_node_executions_execution ON workflow_node_executions(workflow_execution_id);

-- Create triggers for updated_at
CREATE TRIGGER update_workflow_node_categories_updated_at
  BEFORE UPDATE ON workflow_node_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_node_types_updated_at
  BEFORE UPDATE ON workflow_node_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_templates_updated_at
  BEFORE UPDATE ON workflow_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_instances_updated_at
  BEFORE UPDATE ON workflow_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_node_configs_updated_at
  BEFORE UPDATE ON workflow_node_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
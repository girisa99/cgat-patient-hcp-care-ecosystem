-- Create nodes_config table for auditability
CREATE TABLE public.nodes_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id TEXT NOT NULL,
  workflow_id UUID REFERENCES public.agent_workflows(id) ON DELETE CASCADE,
  agent_session_id UUID REFERENCES public.agent_sessions(id) ON DELETE CASCADE,
  node_type TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Audit fields
  version INTEGER DEFAULT 1,
  change_summary TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Create tool_executions table for logging tool runs
CREATE TABLE public.tool_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_config_id UUID REFERENCES public.nodes_config(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  tool_type TEXT NOT NULL,
  execution_context JSONB DEFAULT '{}',
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'timeout')),
  error_details JSONB,
  duration_ms INTEGER,
  triggered_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create vector_configs table for vector store configurations
CREATE TABLE public.vector_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_config_id UUID REFERENCES public.nodes_config(id) ON DELETE CASCADE,
  vector_store_type TEXT NOT NULL,
  embedding_model TEXT NOT NULL,
  knowledge_name TEXT NOT NULL,
  description TEXT,
  configuration JSONB NOT NULL DEFAULT '{}',
  document_sources JSONB DEFAULT '[]',
  return_source_documents BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create knowledge_base_configs table for knowledge configurations
CREATE TABLE public.knowledge_base_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_config_id UUID REFERENCES public.nodes_config(id) ON DELETE CASCADE,
  knowledge_type TEXT NOT NULL CHECK (knowledge_type IN ('document_store', 'vector_embedding', 'api_source')),
  source_table TEXT,
  source_column TEXT,
  configuration JSONB NOT NULL DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_enabled BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nodes_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vector_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nodes_config
CREATE POLICY "Users can manage their node configs" ON public.nodes_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.agent_sessions 
      WHERE id = nodes_config.agent_session_id 
      AND user_id = auth.uid()
    ) OR 
    EXISTS (
      SELECT 1 FROM public.agent_workflows 
      WHERE id = nodes_config.workflow_id 
      AND created_by = auth.uid()
    )
  );

-- RLS Policies for tool_executions
CREATE POLICY "Users can view tool executions for their nodes" ON public.tool_executions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.nodes_config nc
      JOIN public.agent_sessions s ON nc.agent_session_id = s.id
      WHERE nc.id = tool_executions.node_config_id 
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert tool executions" ON public.tool_executions
  FOR INSERT WITH CHECK (true);

-- RLS Policies for vector_configs
CREATE POLICY "Users can manage their vector configs" ON public.vector_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.nodes_config nc
      JOIN public.agent_sessions s ON nc.agent_session_id = s.id
      WHERE nc.id = vector_configs.node_config_id 
      AND s.user_id = auth.uid()
    )
  );

-- RLS Policies for knowledge_base_configs
CREATE POLICY "Users can manage their knowledge configs" ON public.knowledge_base_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.nodes_config nc
      JOIN public.agent_sessions s ON nc.agent_session_id = s.id
      WHERE nc.id = knowledge_base_configs.node_config_id 
      AND s.user_id = auth.uid()
    )
  );

-- Add indexes for performance
CREATE INDEX idx_nodes_config_workflow_id ON public.nodes_config(workflow_id);
CREATE INDEX idx_nodes_config_session_id ON public.nodes_config(agent_session_id);
CREATE INDEX idx_tool_executions_node_config ON public.tool_executions(node_config_id);
CREATE INDEX idx_tool_executions_created_at ON public.tool_executions(created_at);
CREATE INDEX idx_vector_configs_node_config ON public.vector_configs(node_config_id);
CREATE INDEX idx_knowledge_configs_node_config ON public.knowledge_base_configs(node_config_id);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_nodes_config_updated_at BEFORE UPDATE ON public.nodes_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vector_configs_updated_at BEFORE UPDATE ON public.vector_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_configs_updated_at BEFORE UPDATE ON public.knowledge_base_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
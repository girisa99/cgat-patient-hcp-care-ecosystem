-- Create workflow execution engine tables for full backend functionality

-- Create workflow instances table to track running workflows
CREATE TABLE IF NOT EXISTS public.workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  workflow_data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'paused', 'completed', 'failed', 'cancelled')),
  current_node_id TEXT,
  execution_context JSONB DEFAULT '{}',
  variables JSONB DEFAULT '{}',
  error_details JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create workflow execution logs table for detailed tracking
CREATE TABLE IF NOT EXISTS public.workflow_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id UUID REFERENCES public.workflow_instances(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  node_type TEXT NOT NULL,
  execution_status TEXT NOT NULL DEFAULT 'started' CHECK (execution_status IN ('started', 'completed', 'failed', 'skipped')),
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  error_details JSONB,
  execution_time_ms INTEGER,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create vector store configurations table
CREATE TABLE IF NOT EXISTS public.vector_store_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  store_type TEXT NOT NULL DEFAULT 'supabase' CHECK (store_type IN ('supabase', 'postgres', 'mysql', 'pinecone', 'weaviate', 'chroma')),
  connection_config JSONB NOT NULL DEFAULT '{}',
  vector_dimension INTEGER NOT NULL DEFAULT 1536,
  distance_metric TEXT DEFAULT 'cosine' CHECK (distance_metric IN ('cosine', 'euclidean', 'manhattan', 'dot_product')),
  index_type TEXT DEFAULT 'ivfflat' CHECK (index_type IN ('ivfflat', 'hnsw', 'flat')),
  embedding_config JSONB DEFAULT '{}',
  search_config JSONB DEFAULT '{}',
  performance_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create deployment environments table
CREATE TABLE IF NOT EXISTS public.deployment_environments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  environment_type TEXT NOT NULL DEFAULT 'development' CHECK (environment_type IN ('development', 'testing', 'uat', 'staging', 'production')),
  cloud_provider TEXT DEFAULT 'supabase',
  region TEXT DEFAULT 'us-east-1',
  infrastructure_config JSONB DEFAULT '{}',
  resource_allocation JSONB DEFAULT '{}',
  scaling_config JSONB DEFAULT '{}',
  security_config JSONB DEFAULT '{}',
  monitoring_config JSONB DEFAULT '{}',
  deployment_config JSONB DEFAULT '{}',
  environment_variables JSONB DEFAULT '[]',
  secrets JSONB DEFAULT '[]',
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'deploying', 'failed')),
  last_deployed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create test configurations table
CREATE TABLE IF NOT EXISTS public.test_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  test_type TEXT NOT NULL DEFAULT 'flow_tester' CHECK (test_type IN ('flow_tester', 'response_validator', 'load_tester', 'debug_console')),
  test_config JSONB NOT NULL DEFAULT '{}',
  test_scenarios JSONB DEFAULT '[]',
  assertions JSONB DEFAULT '[]',
  performance_thresholds JSONB DEFAULT '{}',
  reporting_config JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create test execution results table
CREATE TABLE IF NOT EXISTS public.test_execution_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_configuration_id UUID REFERENCES public.test_configurations(id) ON DELETE CASCADE,
  workflow_instance_id UUID REFERENCES public.workflow_instances(id) ON DELETE CASCADE,
  test_status TEXT NOT NULL DEFAULT 'running' CHECK (test_status IN ('running', 'passed', 'failed', 'cancelled')),
  test_results JSONB DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  error_details JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for all tables
ALTER TABLE public.workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vector_store_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_execution_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workflow_instances
DROP POLICY IF EXISTS "Users can manage their own workflow instances" ON public.workflow_instances;
CREATE POLICY "Users can manage their own workflow instances"
ON public.workflow_instances
FOR ALL
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Create RLS policies for workflow_execution_logs
DROP POLICY IF EXISTS "Users can view execution logs for their workflows" ON public.workflow_execution_logs;
CREATE POLICY "Users can view execution logs for their workflows"
ON public.workflow_execution_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.workflow_instances 
    WHERE id = workflow_execution_logs.workflow_instance_id 
    AND created_by = auth.uid()
  )
);

DROP POLICY IF EXISTS "System can insert execution logs" ON public.workflow_execution_logs;
CREATE POLICY "System can insert execution logs"
ON public.workflow_execution_logs
FOR INSERT
WITH CHECK (true);

-- Create RLS policies for vector_store_configs
DROP POLICY IF EXISTS "Users can manage their own vector store configs" ON public.vector_store_configs;
CREATE POLICY "Users can manage their own vector store configs"
ON public.vector_store_configs
FOR ALL
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Create RLS policies for deployment_environments
DROP POLICY IF EXISTS "Users can manage their own deployment environments" ON public.deployment_environments;
CREATE POLICY "Users can manage their own deployment environments"
ON public.deployment_environments
FOR ALL
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Create RLS policies for test_configurations
DROP POLICY IF EXISTS "Users can manage their own test configurations" ON public.test_configurations;
CREATE POLICY "Users can manage their own test configurations"
ON public.test_configurations
FOR ALL
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Create RLS policies for test_execution_results
DROP POLICY IF EXISTS "Users can view test results for their tests" ON public.test_execution_results;
CREATE POLICY "Users can view test results for their tests"
ON public.test_execution_results
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.test_configurations 
    WHERE id = test_execution_results.test_configuration_id 
    AND created_by = auth.uid()
  )
);

DROP POLICY IF EXISTS "System can insert test results" ON public.test_execution_results;
CREATE POLICY "System can insert test results"
ON public.test_execution_results
FOR INSERT
WITH CHECK (true);

-- Create updated_at triggers (drop first to avoid conflicts)
DROP TRIGGER IF EXISTS update_workflow_instances_updated_at ON public.workflow_instances;
CREATE TRIGGER update_workflow_instances_updated_at
  BEFORE UPDATE ON public.workflow_instances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_vector_store_configs_updated_at ON public.vector_store_configs;
CREATE TRIGGER update_vector_store_configs_updated_at
  BEFORE UPDATE ON public.vector_store_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_deployment_environments_updated_at ON public.deployment_environments;
CREATE TRIGGER update_deployment_environments_updated_at
  BEFORE UPDATE ON public.deployment_environments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_test_configurations_updated_at ON public.test_configurations;
CREATE TRIGGER update_test_configurations_updated_at
  BEFORE UPDATE ON public.test_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_instances_agent_id ON public.workflow_instances(agent_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_status ON public.workflow_instances(status);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_created_by ON public.workflow_instances(created_by);

CREATE INDEX IF NOT EXISTS idx_workflow_execution_logs_workflow_instance_id ON public.workflow_execution_logs(workflow_instance_id);
CREATE INDEX IF NOT EXISTS idx_workflow_execution_logs_node_id ON public.workflow_execution_logs(node_id);

CREATE INDEX IF NOT EXISTS idx_vector_store_configs_store_type ON public.vector_store_configs(store_type);
CREATE INDEX IF NOT EXISTS idx_vector_store_configs_created_by ON public.vector_store_configs(created_by);

CREATE INDEX IF NOT EXISTS idx_deployment_environments_environment_type ON public.deployment_environments(environment_type);
CREATE INDEX IF NOT EXISTS idx_deployment_environments_created_by ON public.deployment_environments(created_by);

CREATE INDEX IF NOT EXISTS idx_test_configurations_test_type ON public.test_configurations(test_type);
CREATE INDEX IF NOT EXISTS idx_test_configurations_created_by ON public.test_configurations(created_by);
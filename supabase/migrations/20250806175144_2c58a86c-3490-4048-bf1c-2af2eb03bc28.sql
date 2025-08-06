-- Create comprehensive test data and model integration tables (fixed)

-- Test datasets table for different model types
CREATE TABLE IF NOT EXISTS public.test_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  dataset_type TEXT NOT NULL CHECK (dataset_type IN ('vision', 'text', 'speech', 'multimodal', 'labeling')),
  description TEXT,
  data_format TEXT NOT NULL CHECK (data_format IN ('json', 'csv', 'images', 'audio', 'video')),
  storage_path TEXT,
  sample_count INTEGER DEFAULT 0,
  labels JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Model configurations for different AI services
CREATE TABLE IF NOT EXISTS public.ai_model_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  model_type TEXT NOT NULL CHECK (model_type IN ('vision', 'text', 'speech_to_text', 'text_to_speech', 'multimodal', 'embedding')),
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'huggingface', 'elevenlabs', 'anthropic', 'custom')),
  model_id TEXT NOT NULL,
  configuration JSONB DEFAULT '{}',
  performance_tier TEXT DEFAULT 'standard' CHECK (performance_tier IN ('lightweight', 'standard', 'premium', 'gpu_intensive')),
  cost_per_request DECIMAL(10,6) DEFAULT 0.0,
  max_concurrent_requests INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Agent test runs for tracking performance against test data
CREATE TABLE IF NOT EXISTS public.agent_test_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id),
  test_dataset_id UUID NOT NULL REFERENCES test_datasets(id),
  model_config_id UUID NOT NULL REFERENCES ai_model_configs(id),
  test_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  start_time TIMESTAMPTZ DEFAULT now(),
  end_time TIMESTAMPTZ,
  total_samples INTEGER DEFAULT 0,
  processed_samples INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.0,
  avg_response_time_ms INTEGER DEFAULT 0,
  avg_accuracy DECIMAL(5,2) DEFAULT 0.0,
  results JSONB DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  error_logs JSONB DEFAULT '[]',
  resource_usage JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id)
);

-- Test samples for detailed tracking
CREATE TABLE IF NOT EXISTS public.test_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_run_id UUID NOT NULL REFERENCES agent_test_runs(id),
  sample_index INTEGER NOT NULL,
  input_data JSONB NOT NULL,
  expected_output JSONB,
  actual_output JSONB,
  processing_time_ms INTEGER,
  accuracy_score DECIMAL(5,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'timeout')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.test_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_model_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_samples ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their test datasets" ON public.test_datasets
FOR ALL USING (auth.uid() = created_by OR is_admin_user_safe(auth.uid()));

CREATE POLICY "Users can view AI model configs" ON public.ai_model_configs
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage AI model configs" ON public.ai_model_configs
FOR ALL USING (is_admin_user_safe(auth.uid()));

CREATE POLICY "Users can manage test runs for their agents" ON public.agent_test_runs
FOR ALL USING (
  EXISTS (SELECT 1 FROM agents WHERE agents.id = agent_test_runs.agent_id AND agents.created_by = auth.uid())
  OR is_admin_user_safe(auth.uid())
);

CREATE POLICY "Users can view test samples for their test runs" ON public.test_samples
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM agent_test_runs atr 
    JOIN agents a ON a.id = atr.agent_id 
    WHERE atr.id = test_samples.test_run_id 
    AND (a.created_by = auth.uid() OR is_admin_user_safe(auth.uid()))
  )
);

-- Triggers for updated_at
CREATE TRIGGER update_test_datasets_updated_at
  BEFORE UPDATE ON public.test_datasets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_ai_model_configs_updated_at
  BEFORE UPDATE ON public.ai_model_configs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
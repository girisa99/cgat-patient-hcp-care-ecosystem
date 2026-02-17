-- Create observability configurations table
CREATE TABLE public.observability_configs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  platform text NOT NULL CHECK (platform IN ('arize', 'langwatch')),
  is_enabled boolean NOT NULL DEFAULT false,
  api_key_encrypted text,
  space_key text, -- for Arize
  project_id text, -- for LangWatch
  configuration jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Enable RLS
ALTER TABLE public.observability_configs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own observability configs"
  ON public.observability_configs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create traces table for storing AI workflow traces
CREATE TABLE public.ai_workflow_traces (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  agent_id uuid,
  conversation_id uuid,
  trace_id text NOT NULL,
  span_id text,
  parent_span_id text,
  operation_name text NOT NULL,
  start_time timestamp with time zone NOT NULL DEFAULT now(),
  end_time timestamp with time zone,
  duration_ms integer,
  status text CHECK (status IN ('pending', 'success', 'error')),
  metadata jsonb DEFAULT '{}',
  tags jsonb DEFAULT '{}',
  logs jsonb DEFAULT '[]',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_workflow_traces ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own traces"
  ON public.ai_workflow_traces
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_observability_configs_user_platform ON public.observability_configs(user_id, platform);
CREATE INDEX idx_ai_workflow_traces_user_id ON public.ai_workflow_traces(user_id);
CREATE INDEX idx_ai_workflow_traces_trace_id ON public.ai_workflow_traces(trace_id);
CREATE INDEX idx_ai_workflow_traces_agent_id ON public.ai_workflow_traces(agent_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_observability_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_observability_configs_updated_at
  BEFORE UPDATE ON public.observability_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_observability_configs_updated_at();
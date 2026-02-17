-- Create agent channel deployments table for flexible assignment
CREATE TABLE IF NOT EXISTS public.agent_channel_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('voice-call', 'web-chat', 'email', 'messaging', 'voice-assistant', 'instagram')),
  deployment_status TEXT NOT NULL DEFAULT 'pending' CHECK (deployment_status IN ('pending', 'active', 'paused', 'failed', 'stopped')),
  deployment_config JSONB DEFAULT '{}',
  priority INTEGER DEFAULT 1,
  max_concurrent_sessions INTEGER DEFAULT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deployed_at TIMESTAMP WITH TIME ZONE,
  last_health_check TIMESTAMP WITH TIME ZONE,
  health_status TEXT DEFAULT 'unknown' CHECK (health_status IN ('healthy', 'degraded', 'unhealthy', 'unknown')),
  performance_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create conversation engine configurations table
CREATE TABLE IF NOT EXISTS public.conversation_engines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  engine_type TEXT NOT NULL CHECK (engine_type IN ('llm', 'sml', 'mcp', 'hybrid')),
  provider TEXT NOT NULL, -- openai, anthropic, local, etc
  model_identifier TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  capabilities JSONB DEFAULT '{}', -- intent_understanding, entity_extraction, context_management
  performance_profile JSONB DEFAULT '{}', -- response_time, accuracy, cost
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create agent conversation engine assignments
CREATE TABLE IF NOT EXISTS public.agent_conversation_engines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  conversation_engine_id UUID NOT NULL REFERENCES public.conversation_engines(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('primary', 'fallback', 'specialized', 'comparative')),
  priority INTEGER DEFAULT 1,
  conditions JSONB DEFAULT '{}', -- when to use this engine
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(agent_id, conversation_engine_id, role)
);

-- Create voice provider configurations
CREATE TABLE IF NOT EXISTS public.voice_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('five9', 'genesys', 'avaya', 'twilio', 'vonage', 'voxiplant')),
  configuration JSONB NOT NULL DEFAULT '{}',
  api_credentials JSONB DEFAULT '{}', -- encrypted credentials
  capabilities JSONB DEFAULT '{}', -- voice_quality, languages, features
  rate_limits JSONB DEFAULT '{}',
  webhook_config JSONB DEFAULT '{}',
  health_check_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create multi-model conversation sessions
CREATE TABLE IF NOT EXISTS public.multi_model_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_mode TEXT NOT NULL CHECK (conversation_mode IN ('single', 'multi-model', 'comparative')),
  active_models JSONB NOT NULL DEFAULT '[]', -- array of model configurations
  conversation_history JSONB NOT NULL DEFAULT '[]',
  model_responses JSONB DEFAULT '{}', -- responses from each model
  user_preferences JSONB DEFAULT '{}',
  context_data JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create conversation message routing table
CREATE TABLE IF NOT EXISTS public.conversation_message_routing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.multi_model_conversations(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL,
  intent_classification JSONB DEFAULT '{}',
  entity_extraction JSONB DEFAULT '{}',
  routing_decision JSONB NOT NULL,
  selected_models JSONB NOT NULL DEFAULT '[]',
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_channel_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_engines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_conversation_engines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multi_model_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_message_routing ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_channel_deployments
CREATE POLICY "Users can manage their agent deployments" ON public.agent_channel_deployments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.agents 
    WHERE agents.id = agent_channel_deployments.agent_id 
    AND agents.created_by = auth.uid()
  )
);

-- RLS Policies for conversation_engines
CREATE POLICY "Users can view conversation engines" ON public.conversation_engines
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage conversation engines" ON public.conversation_engines
FOR ALL USING (is_admin_user_safe(auth.uid()));

-- RLS Policies for agent_conversation_engines
CREATE POLICY "Users can manage their agent conversation engines" ON public.agent_conversation_engines
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.agents 
    WHERE agents.id = agent_conversation_engines.agent_id 
    AND agents.created_by = auth.uid()
  )
);

-- RLS Policies for voice_providers
CREATE POLICY "Users can view voice providers" ON public.voice_providers
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage voice providers" ON public.voice_providers
FOR ALL USING (is_admin_user_safe(auth.uid()));

-- RLS Policies for multi_model_conversations
CREATE POLICY "Users can manage their conversations" ON public.multi_model_conversations
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for conversation_message_routing
CREATE POLICY "Users can view routing for their conversations" ON public.conversation_message_routing
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.multi_model_conversations 
    WHERE multi_model_conversations.id = conversation_message_routing.conversation_id 
    AND multi_model_conversations.user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_channel_deployments_agent_id ON public.agent_channel_deployments(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_channel_deployments_channel_type ON public.agent_channel_deployments(channel_type);
CREATE INDEX IF NOT EXISTS idx_agent_channel_deployments_status ON public.agent_channel_deployments(deployment_status);
CREATE INDEX IF NOT EXISTS idx_conversation_engines_type ON public.conversation_engines(engine_type);
CREATE INDEX IF NOT EXISTS idx_multi_model_conversations_user ON public.multi_model_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_multi_model_conversations_session ON public.multi_model_conversations(session_id);

-- Create triggers for updated_at
CREATE TRIGGER update_agent_channel_deployments_updated_at
  BEFORE UPDATE ON public.agent_channel_deployments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_engines_updated_at
  BEFORE UPDATE ON public.conversation_engines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_providers_updated_at
  BEFORE UPDATE ON public.voice_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_multi_model_conversations_updated_at
  BEFORE UPDATE ON public.multi_model_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
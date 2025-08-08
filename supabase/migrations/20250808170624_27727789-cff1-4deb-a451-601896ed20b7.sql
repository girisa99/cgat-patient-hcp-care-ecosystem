-- Voice Live Agents table
CREATE TABLE IF NOT EXISTS public.voice_live_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  department TEXT,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy', 'away')),
  skills TEXT[] DEFAULT '{}',
  max_concurrent_calls INTEGER DEFAULT 3,
  current_calls INTEGER DEFAULT 0,
  avg_response_time INTEGER DEFAULT 0,
  total_calls_handled INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Voice Configurations table
CREATE TABLE IF NOT EXISTS public.voice_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  voice_provider_id UUID REFERENCES voice_providers(id),
  configuration JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Voice Connectors table
CREATE TABLE IF NOT EXISTS public.voice_connectors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('SIP', 'API', 'Webhook', 'Database', 'CRM', 'Cloud')),
  configuration JSONB NOT NULL DEFAULT '{}',
  endpoints TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'testing')),
  health_status TEXT DEFAULT 'unknown' CHECK (health_status IN ('healthy', 'warning', 'error', 'unknown')),
  last_tested_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Voice Analytics Events table
CREATE TABLE IF NOT EXISTS public.voice_analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('call_started', 'call_ended', 'transfer', 'queue_join', 'queue_leave', 'agent_login', 'agent_logout')),
  agent_id UUID,
  live_agent_id UUID REFERENCES voice_live_agents(id),
  connector_id UUID REFERENCES voice_connectors(id),
  call_duration INTEGER,
  queue_wait_time INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Transfer Queue table
CREATE TABLE IF NOT EXISTS public.voice_transfer_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id),
  live_agent_id UUID REFERENCES voice_live_agents(id),
  customer_info JSONB DEFAULT '{}',
  priority INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'assigned', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.voice_live_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_transfer_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for voice_live_agents
CREATE POLICY "Admins can manage live agents" ON public.voice_live_agents
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('superAdmin', 'onboardingTeam')
  )
);

-- RLS Policies for voice_configurations
CREATE POLICY "Users can manage their voice configurations" ON public.voice_configurations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM agents a
    WHERE a.id = voice_configurations.agent_id
    AND a.created_by = auth.uid()
  )
);

-- RLS Policies for voice_connectors
CREATE POLICY "Admins can manage voice connectors" ON public.voice_connectors
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('superAdmin', 'onboardingTeam')
  ) OR created_by = auth.uid()
);

-- RLS Policies for voice_analytics_events
CREATE POLICY "Users can view voice analytics" ON public.voice_analytics_events
FOR SELECT USING (
  auth.uid() IS NOT NULL
);

CREATE POLICY "System can insert analytics events" ON public.voice_analytics_events
FOR INSERT WITH CHECK (true);

-- RLS Policies for voice_transfer_queue
CREATE POLICY "Users can manage transfer queue for their agents" ON public.voice_transfer_queue
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM agents a
    WHERE a.id = voice_transfer_queue.agent_id
    AND a.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('superAdmin', 'onboardingTeam')
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_voice_live_agents_status ON public.voice_live_agents(status);
CREATE INDEX IF NOT EXISTS idx_voice_configurations_agent_id ON public.voice_configurations(agent_id);
CREATE INDEX IF NOT EXISTS idx_voice_connectors_type ON public.voice_connectors(type);
CREATE INDEX IF NOT EXISTS idx_voice_analytics_events_created_at ON public.voice_analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_voice_transfer_queue_status ON public.voice_transfer_queue(status);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_voice_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_voice_live_agents_updated_at
  BEFORE UPDATE ON public.voice_live_agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_voice_updated_at();

CREATE TRIGGER update_voice_configurations_updated_at
  BEFORE UPDATE ON public.voice_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_voice_updated_at();

CREATE TRIGGER update_voice_connectors_updated_at
  BEFORE UPDATE ON public.voice_connectors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_voice_updated_at();
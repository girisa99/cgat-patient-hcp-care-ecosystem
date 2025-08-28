-- Create agents table to store workflow agents
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  nodes JSONB DEFAULT '[]'::jsonb,
  edges JSONB DEFAULT '[]'::jsonb,
  configuration JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deployments table to track agent deployments across environments
CREATE TABLE public.deployments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  environment TEXT NOT NULL CHECK (environment IN ('dev', 'test', 'uat', 'prod')),
  channel TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'deploying', 'active', 'failed', 'stopped')),
  deployment_config JSONB DEFAULT '{}'::jsonb,
  snippet_code TEXT,
  endpoint_url TEXT,
  deployed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create channels table to manage deployment channels
CREATE TABLE public.channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('web_widget', 'api', 'webhook', 'slack', 'discord', 'teams', 'whatsapp')),
  configuration JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

-- Create policies for agents
CREATE POLICY "Users can view their own agents" 
ON public.agents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agents" 
ON public.agents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents" 
ON public.agents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents" 
ON public.agents 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for deployments
CREATE POLICY "Users can view deployments of their agents" 
ON public.deployments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.agents 
    WHERE agents.id = deployments.agent_id 
    AND agents.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create deployments for their agents" 
ON public.deployments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.agents 
    WHERE agents.id = deployments.agent_id 
    AND agents.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update deployments of their agents" 
ON public.deployments 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.agents 
    WHERE agents.id = deployments.agent_id 
    AND agents.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete deployments of their agents" 
ON public.deployments 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.agents 
    WHERE agents.id = deployments.agent_id 
    AND agents.user_id = auth.uid()
  )
);

-- Create policies for channels (public read, authenticated users can manage)
CREATE POLICY "Everyone can view active channels" 
ON public.channels 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can create channels" 
ON public.channels 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update channels" 
ON public.channels 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_agents_updated_at
BEFORE UPDATE ON public.agents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deployments_updated_at
BEFORE UPDATE ON public.deployments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_channels_updated_at
BEFORE UPDATE ON public.channels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default channels
INSERT INTO public.channels (name, type, configuration) VALUES
('Web Widget', 'web_widget', '{"theme": "default", "position": "bottom-right"}'),
('REST API', 'api', '{"rate_limit": 1000, "auth_required": true}'),
('Webhook', 'webhook', '{"timeout": 30, "retry_attempts": 3}'),
('Slack Bot', 'slack', '{"bot_name": "AI Assistant"}'),
('Discord Bot', 'discord', '{"bot_name": "AI Assistant"}'),
('Microsoft Teams', 'teams', '{"bot_name": "AI Assistant"}'),
('WhatsApp', 'whatsapp', '{"business_number": ""});

-- Create indexes for better performance
CREATE INDEX idx_agents_user_id ON public.agents(user_id);
CREATE INDEX idx_agents_status ON public.agents(status);
CREATE INDEX idx_deployments_agent_id ON public.deployments(agent_id);
CREATE INDEX idx_deployments_environment ON public.deployments(environment);
CREATE INDEX idx_deployments_status ON public.deployments(status);
CREATE INDEX idx_channels_type ON public.channels(type);
CREATE INDEX idx_channels_active ON public.channels(is_active);
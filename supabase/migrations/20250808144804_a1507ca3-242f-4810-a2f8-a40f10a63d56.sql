-- Create missing voice_configurations table
CREATE TABLE IF NOT EXISTS public.voice_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID,
  voice_provider_id UUID REFERENCES voice_providers(id),
  configuration JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create missing api_service_configurations table  
CREATE TABLE IF NOT EXISTS public.api_service_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID,
  service_name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  credentials JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  health_status TEXT DEFAULT 'unknown',
  last_health_check TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on voice_configurations
ALTER TABLE public.voice_configurations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on api_service_configurations
ALTER TABLE public.api_service_configurations ENABLE ROW LEVEL SECURITY;

-- RLS policies for voice_configurations
CREATE POLICY "Users can manage voice configurations" ON public.voice_configurations
FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS policies for api_service_configurations  
CREATE POLICY "Users can manage API service configurations" ON public.api_service_configurations
FOR ALL USING (auth.uid() IS NOT NULL);

-- Create update triggers
CREATE TRIGGER update_voice_configurations_updated_at
BEFORE UPDATE ON public.voice_configurations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_service_configurations_updated_at
BEFORE UPDATE ON public.api_service_configurations  
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Clear existing providers first and seed with correct provider types
DELETE FROM public.voice_providers;

-- Seed voice providers using valid provider_type values
INSERT INTO public.voice_providers (name, provider_type, configuration, capabilities, is_active)
VALUES 
  ('Twilio Voice Platform', 'twilio', '{"api_version": "v1", "region": "us1", "features": ["voice", "sms", "video"]}', '["voice", "sms", "video", "real-time", "PSTN", "SIP"]', true),
  ('Five9 Contact Center', 'five9', '{"region": "us", "features": ["voice", "chat", "email"]}', '["voice", "omnichannel", "analytics", "workforce_management"]', true),
  ('Genesys Cloud CX', 'genesys', '{"region": "us-east-1", "features": ["voice", "digital", "workforce"]}', '["voice", "digital_channels", "ai", "analytics"]', true),
  ('Avaya OneCloud', 'avaya', '{"deployment": "cloud", "features": ["voice", "collaboration"]}', '["voice", "collaboration", "contact_center"]', false),
  ('Vonage Communications APIs', 'vonage', '{"api_version": "v2", "features": ["voice", "messaging", "video"]}', '["voice", "messaging", "video", "verification"]', false),
  ('Voximplant Cloud Platform', 'voxiplant', '{"region": "us", "features": ["voice", "video", "messaging"]}', '["voice", "video", "messaging", "ai"]', false);
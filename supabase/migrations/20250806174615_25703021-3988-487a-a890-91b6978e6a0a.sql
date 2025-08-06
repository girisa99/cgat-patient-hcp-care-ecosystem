-- Create voice_providers table for deployment functionality
CREATE TABLE IF NOT EXISTS public.voice_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('five9', 'genesys', 'avaya', 'twilio', 'vonage', 'voxiplant')),
  configuration JSONB NOT NULL DEFAULT '{}',
  api_credentials JSONB NOT NULL DEFAULT '{}',
  capabilities JSONB NOT NULL DEFAULT '{}',
  rate_limits JSONB NOT NULL DEFAULT '{}',
  webhook_config JSONB NOT NULL DEFAULT '{}',
  health_check_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.voice_providers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for voice_providers
CREATE POLICY "Admins can manage voice providers" 
ON public.voice_providers
FOR ALL
USING (is_admin_user_safe(auth.uid()));

CREATE POLICY "Authenticated users can view active voice providers" 
ON public.voice_providers
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Create trigger for updated_at
CREATE TRIGGER update_voice_providers_updated_at
  BEFORE UPDATE ON public.voice_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert some default voice providers
INSERT INTO public.voice_providers (name, provider_type, configuration, capabilities) VALUES
('Twilio Voice', 'twilio', 
 '{"base_url": "https://api.twilio.com", "version": "2010-04-01"}',
 '{"languages": ["en-US", "es-ES"], "voice_quality": "HD", "features": ["text-to-speech", "speech-to-text"]}'),
('Five9 Contact Center', 'five9',
 '{"base_url": "https://api.five9.com", "version": "v3"}',
 '{"languages": ["en-US"], "voice_quality": "HD", "features": ["call-routing", "ivr"]}'),
('Genesys Cloud', 'genesys',
 '{"base_url": "https://api.mypurecloud.com", "version": "v2"}',
 '{"languages": ["en-US", "en-UK"], "voice_quality": "Premium", "features": ["omnichannel", "analytics"]}')
ON CONFLICT (id) DO NOTHING;
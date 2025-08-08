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

-- Clear existing providers first and seed with new ones
DELETE FROM public.voice_providers;

-- Seed voice providers with the original providers
INSERT INTO public.voice_providers (name, provider_type, configuration, capabilities, is_active)
VALUES 
  ('Twilio Voice', 'voice_call', '{"api_version": "v1", "region": "us1"}', '["voice", "sms", "video", "real-time", "PSTN", "SIP"]', true),
  ('Deepgram STT', 'stt', '{"model": "nova-2", "language": "en-US"}', '["STT", "real-time", "streaming", "multiple_languages"]', true),
  ('ElevenLabs TTS', 'tts', '{"voice_id": "default", "model": "eleven_multilingual_v2"}', '["TTS", "natural_voice", "voice_cloning", "multilingual"]', true),
  ('Azure Speech', 'speech', '{"region": "eastus", "endpoint": "https://eastus.api.cognitive.microsoft.com/"}', '["STT", "TTS", "translation"]', false),
  ('OpenAI Whisper', 'stt', '{"model": "whisper-1", "language": "en"}', '["STT", "transcription", "multiple_languages"]', false),
  ('Google Cloud Speech', 'speech', '{"region": "us-central1"}', '["STT", "TTS", "real-time"]', false);
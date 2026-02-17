-- Insert Hugging Face as a voice provider
INSERT INTO voice_providers (
  name, 
  provider_type, 
  status, 
  api_endpoint, 
  supported_features, 
  configuration_schema,
  is_ai_powered,
  created_at
) VALUES (
  'Hugging Face Voice',
  'huggingface', 
  'active',
  'https://api-inference.huggingface.co/models',
  '["text_to_speech", "speech_to_text", "voice_cloning"]',
  '{
    "api_key": {"type": "string", "required": true, "description": "Hugging Face API Token"},
    "model": {"type": "string", "required": true, "default": "microsoft/speecht5_tts", "description": "TTS Model"},
    "voice_preset": {"type": "string", "required": false, "description": "Voice preset for TTS"}
  }'::jsonb,
  true,
  now()
) ON CONFLICT (provider_type) DO UPDATE SET 
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  api_endpoint = EXCLUDED.api_endpoint,
  supported_features = EXCLUDED.supported_features,
  configuration_schema = EXCLUDED.configuration_schema,
  is_ai_powered = EXCLUDED.is_ai_powered;

-- Insert Hugging Face AI model configurations
INSERT INTO ai_model_configs (
  name,
  provider,
  model_id,
  model_type,
  configuration,
  is_active,
  performance_tier,
  cost_per_request
) VALUES 
(
  'SpeechT5 TTS',
  'huggingface',
  'microsoft/speecht5_tts',
  'text_to_speech',
  '{
    "max_length": 1000,
    "sample_rate": 16000,
    "vocoder": "microsoft/speecht5_hifigan"
  }'::jsonb,
  true,
  'standard',
  0.001
),
(
  'Whisper ASR',
  'huggingface',
  'openai/whisper-base',
  'speech_to_text',
  '{
    "language": "auto",
    "task": "transcribe",
    "return_timestamps": false
  }'::jsonb,
  true,
  'standard',
  0.002
),
(
  'Bark TTS',
  'huggingface',
  'suno/bark',
  'text_to_speech',
  '{
    "voice_preset": "v2/en_speaker_6",
    "temperature": 0.7,
    "fine_temperature": 0.4
  }'::jsonb,
  true,
  'premium',
  0.003
) ON CONFLICT (provider, model_id) DO UPDATE SET 
  name = EXCLUDED.name,
  model_type = EXCLUDED.model_type,
  configuration = EXCLUDED.configuration,
  is_active = EXCLUDED.is_active;

-- Insert Hugging Face AI model integration
INSERT INTO ai_model_integrations (
  name,
  provider,
  model_type,
  capabilities,
  model_config,
  api_endpoint,
  is_active,
  supports_function_calling,
  supports_vision,
  healthcare_specialization
) VALUES (
  'Hugging Face Voice Models',
  'huggingface',
  'voice',
  '["text_to_speech", "speech_to_text", "voice_cloning", "multilingual"]',
  '{
    "available_models": [
      "microsoft/speecht5_tts",
      "openai/whisper-base", 
      "suno/bark",
      "facebook/mms-tts",
      "espnet/hindi_male_fgl"
    ],
    "default_tts": "microsoft/speecht5_tts",
    "default_stt": "openai/whisper-base",
    "supported_languages": ["en", "es", "fr", "de", "it", "pt", "ru", "ja", "ko", "zh", "hi", "ar"]
  }'::jsonb,
  'https://api-inference.huggingface.co',
  true,
  false,
  false,
  '["medical_transcription", "patient_communication"]'
) ON CONFLICT (provider, model_type) DO UPDATE SET 
  name = EXCLUDED.name,
  capabilities = EXCLUDED.capabilities,
  model_config = EXCLUDED.model_config,
  is_active = EXCLUDED.is_active;

-- Insert Hugging Face API service configuration
INSERT INTO api_service_configurations (
  service_name,
  service_type,
  configuration,
  is_active,
  health_status
) VALUES (
  'Hugging Face Inference API',
  'voice_ai',
  '{
    "api_endpoint": "https://api-inference.huggingface.co",
    "supported_tasks": ["text-to-speech", "automatic-speech-recognition", "audio-classification"],
    "rate_limits": {
      "requests_per_minute": 60,
      "requests_per_day": 1000
    },
    "model_configs": {
      "tts_models": ["microsoft/speecht5_tts", "suno/bark", "facebook/mms-tts"],
      "stt_models": ["openai/whisper-base", "openai/whisper-small", "facebook/wav2vec2-base-960h"],
      "default_voice": "microsoft/speecht5_tts"
    }
  }'::jsonb,
  true,
  'active'
) ON CONFLICT (service_name) DO UPDATE SET 
  configuration = EXCLUDED.configuration,
  is_active = EXCLUDED.is_active;
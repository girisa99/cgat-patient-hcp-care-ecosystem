-- Add missing AI-powered voice providers with correct JSONB format for capabilities
INSERT INTO voice_providers (name, provider_type, capabilities, configuration, is_active, api_credentials) VALUES
-- ElevenLabs TTS Provider
(
  'ElevenLabs Text-to-Speech',
  'elevenlabs',
  '["tts", "voice_synthesis", "multilingual", "real_time"]'::jsonb,
  '{
    "api_version": "v1",
    "features": ["text_to_speech", "voice_cloning", "multilingual"],
    "supported_formats": ["mp3", "wav", "ogg"],
    "sample_rates": [22050, 44100],
    "languages": 29,
    "default_voice": "alloy"
  }'::jsonb,
  false,
  '{}'::jsonb
),
-- OpenAI Voice Provider  
(
  'OpenAI Speech Services',
  'openai',
  '["tts", "stt", "whisper", "real_time"]'::jsonb,
  '{
    "api_version": "v1", 
    "features": ["text_to_speech", "speech_to_text", "real_time_api"],
    "tts_models": ["tts-1", "tts-1-hd"],
    "stt_models": ["whisper-1"],
    "voices": ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
    "supported_formats": ["mp3", "opus", "aac", "flac"]
  }'::jsonb,
  false,
  '{}'::jsonb
),
-- Hugging Face Voice Provider
(
  'Hugging Face Voice Models',
  'huggingface',
  '["tts", "stt", "voice_models", "open_source"]'::jsonb,
  '{
    "features": ["text_to_speech", "speech_to_text", "voice_conversion"],
    "popular_models": [
      "microsoft/speecht5_tts",
      "facebook/wav2vec2-base-960h", 
      "openai/whisper-tiny.en",
      "bark-models/bark"
    ],
    "supported_formats": ["wav", "mp3", "flac"]
  }'::jsonb,
  false,
  '{}'::jsonb
),
-- Claude AI Integration (for voice workflow orchestration)
(
  'Claude AI Voice Orchestrator',
  'claude',
  '["ai_orchestration", "voice_workflow", "conversation_management"]'::jsonb,
  '{
    "features": ["conversation_orchestration", "voice_workflow_management", "context_understanding"],
    "models": ["claude-3-5-sonnet", "claude-3-haiku"],
    "integration_type": "orchestrator"
  }'::jsonb,
  false,
  '{}'::jsonb
);
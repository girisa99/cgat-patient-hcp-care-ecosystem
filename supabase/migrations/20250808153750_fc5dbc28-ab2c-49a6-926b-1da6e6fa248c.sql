-- Add missing AI-powered voice providers to cover ElevenLabs, Hugging Face, OpenAI, and Claude
INSERT INTO voice_providers (name, provider_type, capabilities, configuration, is_active, api_credentials) VALUES
-- ElevenLabs TTS Provider
(
  'ElevenLabs Text-to-Speech',
  'elevenlabs',
  '["tts", "voice_synthesis", "multilingual", "real_time", "voice_cloning"]'::jsonb,
  '{
    "api_version": "v1",
    "features": ["text_to_speech", "voice_cloning", "multilingual", "real_time"],
    "supported_formats": ["mp3", "wav", "ogg"],
    "sample_rates": [22050, 44100],
    "languages": 29,
    "default_voice": "alloy",
    "popular_voices": ["aria", "roger", "sarah", "laura", "charlie"]
  }'::jsonb,
  false,
  '{}'::jsonb
),
-- Hugging Face Voice Models
(
  'Hugging Face Voice Models',
  'huggingface',
  '["tts", "stt", "voice_models", "open_source", "transformers"]'::jsonb,
  '{
    "features": ["text_to_speech", "speech_to_text", "voice_conversion", "model_hosting"],
    "popular_models": [
      "microsoft/speecht5_tts",
      "facebook/wav2vec2-base-960h", 
      "openai/whisper-tiny.en",
      "bark-models/bark",
      "microsoft/DialoGPT-medium"
    ],
    "supported_formats": ["wav", "mp3", "flac"],
    "framework": "transformers.js"
  }'::jsonb,
  false,
  '{}'::jsonb
),
-- OpenAI Voice Services
(
  'OpenAI Speech Services',
  'openai',
  '["tts", "stt", "whisper", "real_time", "conversation"]'::jsonb,
  '{
    "api_version": "v1", 
    "features": ["text_to_speech", "speech_to_text", "real_time_api", "conversation"],
    "tts_models": ["tts-1", "tts-1-hd"],
    "stt_models": ["whisper-1"],
    "voices": ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
    "supported_formats": ["mp3", "opus", "aac", "flac"],
    "realtime_model": "gpt-4o-realtime-preview"
  }'::jsonb,
  false,
  '{}'::jsonb
),
-- Claude AI for Voice Orchestration
(
  'Claude AI Voice Orchestrator',
  'claude',
  '["ai_orchestration", "voice_workflow", "conversation_management", "context_understanding"]'::jsonb,
  '{
    "features": ["conversation_orchestration", "voice_workflow_management", "context_understanding"],
    "models": ["claude-3-5-sonnet", "claude-3-haiku", "claude-3-opus"],
    "integration_type": "orchestrator",
    "use_cases": ["voice_assistant", "conversation_flow", "intelligent_routing"]
  }'::jsonb,
  false,
  '{}'::jsonb
);
-- Add missing AI-powered voice providers
INSERT INTO voice_providers (name, provider_type, capabilities, configuration, is_active, api_credentials) VALUES
-- ElevenLabs TTS Provider
(
  'ElevenLabs Text-to-Speech',
  'elevenlabs',
  ARRAY['tts', 'voice_synthesis', 'multilingual', 'real_time'],
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
  ARRAY['tts', 'stt', 'whisper', 'real_time'],
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
  ARRAY['tts', 'stt', 'voice_models', 'open_source'],
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
  ARRAY['ai_orchestration', 'voice_workflow', 'conversation_management'],
  '{
    "features": ["conversation_orchestration", "voice_workflow_management", "context_understanding"],
    "models": ["claude-3-5-sonnet", "claude-3-haiku"],
    "integration_type": "orchestrator"
  }'::jsonb,
  false,
  '{}'::jsonb
);

-- Add missing AI model configurations for voice
INSERT INTO ai_model_configs (name, model_id, provider, model_type, configuration, is_active, cost_per_request, performance_tier) VALUES
-- ElevenLabs Models
(
  'ElevenLabs TTS Standard',
  'eleven_multilingual_v2',
  'elevenlabs',
  'tts',
  '{
    "voice_id": "21m00Tcm4TlvDq8ikWAM",
    "model_id": "eleven_multilingual_v2", 
    "voice_settings": {
      "stability": 0.5,
      "similarity_boost": 0.5,
      "style": 0.0,
      "use_speaker_boost": true
    }
  }'::jsonb,
  true,
  0.0003,
  'standard'
),
-- OpenAI TTS Models
(
  'OpenAI TTS HD',
  'tts-1-hd',
  'openai',
  'tts',
  '{
    "model": "tts-1-hd",
    "voice": "alloy",
    "response_format": "mp3",
    "speed": 1.0
  }'::jsonb,
  true,
  0.0015,
  'premium'
),
(
  'OpenAI Whisper STT',
  'whisper-1',
  'openai', 
  'stt',
  '{
    "model": "whisper-1",
    "language": "en",
    "response_format": "json",
    "temperature": 0
  }'::jsonb,
  true,
  0.006,
  'standard'
),
-- Hugging Face Voice Models
(
  'Hugging Face SpeechT5 TTS',
  'microsoft/speecht5_tts',
  'huggingface',
  'tts',
  '{
    "model_id": "microsoft/speecht5_tts",
    "task": "text-to-speech",
    "parameters": {
      "temperature": 0.7,
      "max_length": 1000
    }
  }'::jsonb,
  true,
  0.0001,
  'standard'
),
(
  'Hugging Face Wav2Vec2 STT',
  'facebook/wav2vec2-base-960h',
  'huggingface',
  'stt',
  '{
    "model_id": "facebook/wav2vec2-base-960h",
    "task": "automatic-speech-recognition",
    "parameters": {
      "chunk_length_s": 10,
      "stride_length_s": 1
    }
  }'::jsonb,
  true,
  0.0001,
  'standard'
);

-- Add API service configurations for AI voice services
INSERT INTO api_service_configurations (service_name, service_type, configuration, is_active, health_status) VALUES
(
  'ElevenLabs TTS Service',
  'voice',
  '{
    "base_url": "https://api.elevenlabs.io/v1",
    "endpoints": {
      "text_to_speech": "/text-to-speech/{voice_id}",
      "voices": "/voices",
      "models": "/models"
    },
    "authentication": {
      "type": "api_key",
      "header": "xi-api-key"
    },
    "rate_limits": {
      "requests_per_minute": 120,
      "characters_per_month": 10000
    }
  }'::jsonb,
  false,
  'unknown'
),
(
  'OpenAI Speech Service',
  'voice',
  '{
    "base_url": "https://api.openai.com/v1",
    "endpoints": {
      "text_to_speech": "/audio/speech",
      "speech_to_text": "/audio/transcriptions",
      "real_time": "wss://api.openai.com/v1/realtime"
    },
    "authentication": {
      "type": "bearer_token",
      "header": "Authorization"
    },
    "rate_limits": {
      "requests_per_minute": 50,
      "tokens_per_minute": 150000
    }
  }'::jsonb,
  false,
  'unknown'
),
(
  'Hugging Face Voice Service',
  'voice',
  '{
    "base_url": "https://api-inference.huggingface.co",
    "endpoints": {
      "text_to_speech": "/models/{model_id}",
      "speech_to_text": "/models/{model_id}"
    },
    "authentication": {
      "type": "bearer_token",
      "header": "Authorization"
    },
    "rate_limits": {
      "requests_per_hour": 1000
    }
  }'::jsonb,
  false,
  'unknown'
),
(
  'Claude AI Orchestration Service',
  'ai_model',
  '{
    "base_url": "https://api.anthropic.com/v1",
    "endpoints": {
      "messages": "/messages",
      "completions": "/completions"
    },
    "authentication": {
      "type": "api_key",
      "header": "x-api-key"
    },
    "models": ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"],
    "rate_limits": {
      "requests_per_minute": 100,
      "tokens_per_minute": 200000
    }
  }'::jsonb,
  false,
  'unknown'
);

-- Add comprehensive AI model integrations for missing providers
INSERT INTO ai_model_integrations (name, provider, model_type, model_config, capabilities, healthcare_specialization, is_active, supports_vision, supports_function_calling, max_context_length) VALUES
-- ElevenLabs TTS Models
(
  'ElevenLabs Multilingual TTS',
  'elevenlabs',
  'tts',
  '{
    "model_id": "eleven_multilingual_v2",
    "supported_languages": 29,
    "voice_options": ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
    "audio_formats": ["mp3", "wav", "ogg"],
    "sample_rates": [22050, 44100]
  }'::jsonb,
  ARRAY['text_to_speech', 'multilingual', 'voice_synthesis', 'real_time'],
  ARRAY['patient_communication', 'accessibility', 'multilingual_support'],
  true,
  false,
  false,
  1000
),
-- OpenAI Voice Models
(
  'OpenAI Text-to-Speech HD',
  'openai',
  'tts',
  '{
    "model_id": "tts-1-hd",
    "voices": ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
    "response_formats": ["mp3", "opus", "aac", "flac"],
    "speed_range": [0.25, 4.0]
  }'::jsonb,
  ARRAY['text_to_speech', 'high_quality', 'voice_synthesis'],
  ARRAY['patient_communication', 'medical_dictation', 'accessibility'],
  true,
  false,
  false,
  4000
),
(
  'OpenAI Whisper STT',
  'openai', 
  'stt',
  '{
    "model_id": "whisper-1",
    "supported_formats": ["flac", "m4a", "mp3", "mp4", "mpeg", "mpga", "oga", "ogg", "wav", "webm"],
    "max_file_size": "25MB",
    "languages": "multilingual"
  }'::jsonb,
  ARRAY['speech_to_text', 'multilingual', 'transcription', 'real_time'],
  ARRAY['patient_interviews', 'clinical_notes', 'medical_dictation', 'documentation'],
  true,
  false,
  false,
  30000
),
-- Hugging Face Voice Models
(
  'Hugging Face SpeechT5 TTS',
  'huggingface',
  'tts',
  '{
    "model_id": "microsoft/speecht5_tts",
    "architecture": "transformer",
    "task": "text-to-speech",
    "license": "MIT"
  }'::jsonb,
  ARRAY['text_to_speech', 'open_source', 'customizable'],
  ARRAY['research', 'cost_effective_solutions', 'customization'],
  true,
  false,
  false,
  1000
),
(
  'Hugging Face Wav2Vec2 STT',
  'huggingface',
  'stt', 
  '{
    "model_id": "facebook/wav2vec2-base-960h",
    "architecture": "wav2vec2",
    "task": "automatic-speech-recognition",
    "training_data": "LibriSpeech"
  }'::jsonb,
  ARRAY['speech_to_text', 'open_source', 'research_grade'],
  ARRAY['research', 'cost_effective_solutions', 'academic_use'],
  true,
  false,
  false,
  1000
),
-- Claude AI for Voice Workflow Orchestration
(
  'Claude AI Voice Orchestrator',
  'anthropic',
  'llm',
  '{
    "model_id": "claude-3-5-sonnet-20241022",
    "context_window": 200000,
    "output_tokens": 8192,
    "use_case": "voice_workflow_orchestration"
  }'::jsonb,
  ARRAY['reasoning', 'conversation_management', 'workflow_orchestration', 'context_understanding'],
  ARRAY['conversation_flow', 'voice_interaction_management', 'clinical_workflow'],
  true,
  true,
  true,
  200000
);
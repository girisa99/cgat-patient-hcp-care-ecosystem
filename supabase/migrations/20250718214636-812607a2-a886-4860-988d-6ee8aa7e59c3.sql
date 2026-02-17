-- Insert AI model integrations with correct model types
INSERT INTO ai_model_integrations (
  name, provider, model_type, capabilities, healthcare_specialization, 
  supports_vision, supports_function_calling, max_context_length, 
  model_config, is_active
) VALUES 
(
  'Claude 3.5 Sonnet', 
  'anthropic', 
  'llm', 
  ARRAY['reasoning', 'analysis', 'writing', 'coding', 'conversation'],
  ARRAY['clinical_reasoning', 'compliance', 'medical_analysis', 'patient_care'],
  false,
  true,
  200000,
  '{"temperature": 0.7, "max_tokens": 4000, "top_p": 0.95}',
  true
),
(
  'GPT-4o', 
  'openai', 
  'multimodal', 
  ARRAY['vision', 'reasoning', 'real_time', 'multimodal', 'function_calling'],
  ARRAY['document_analysis', 'medical_imaging', 'patient_communication'],
  true,
  true,
  128000,
  '{"temperature": 0.7, "max_tokens": 4000, "response_format": {"type": "text"}}',
  true
),
(
  'GPT-4o Mini', 
  'openai', 
  'small_language_model', 
  ARRAY['reasoning', 'writing', 'analysis', 'function_calling'],
  ARRAY['quick_analysis', 'patient_queries', 'documentation'],
  false,
  true,
  128000,
  '{"temperature": 0.7, "max_tokens": 2000}',
  true
),
(
  'Gemini Pro', 
  'custom', 
  'multimodal', 
  ARRAY['reasoning', 'math', 'coding', 'vision', 'integration'],
  ARRAY['analytics', 'calculations', 'data_processing'],
  true,
  true,
  1000000,
  '{"temperature": 0.7, "top_p": 0.8, "top_k": 40}',
  true
),
(
  'Llama 3.1 70B', 
  'huggingface', 
  'llm', 
  ARRAY['reasoning', 'coding', 'analysis', 'conversation'],
  ARRAY['general_healthcare', 'research_assistance'],
  false,
  false,
  128000,
  '{"temperature": 0.7, "max_tokens": 4000}',
  true
),
(
  'BioGPT', 
  'huggingface', 
  'small_language_model', 
  ARRAY['biomedical_text', 'clinical_notes', 'medical_qa'],
  ARRAY['clinical_notes', 'biomedical_research', 'drug_discovery', 'diagnostics'],
  false,
  false,
  1024,
  '{"temperature": 0.5, "max_tokens": 1000}',
  true
),
(
  'Med-PaLM 2', 
  'custom', 
  'llm', 
  ARRAY['medical_qa', 'clinical_reasoning', 'medical_knowledge'],
  ARRAY['clinical_decision_support', 'medical_education', 'patient_triage'],
  false,
  false,
  8192,
  '{"temperature": 0.3, "max_tokens": 2000}',
  true
),
(
  'Whisper Large V3', 
  'openai', 
  'multimodal', 
  ARRAY['speech_recognition', 'audio_transcription', 'multilingual'],
  ARRAY['patient_interviews', 'clinical_notes', 'medical_dictation'],
  false,
  false,
  30000,
  '{"language": "en", "task": "transcribe"}',
  true
);
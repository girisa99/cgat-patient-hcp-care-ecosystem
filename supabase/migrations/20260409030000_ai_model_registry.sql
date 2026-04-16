-- =============================================================================
-- AI MODEL REGISTRY — Dynamic, DB-Driven Model Management
-- =============================================================================
-- Single source of truth for ALL AI model versions across all providers.
-- When ANY provider launches, retires, or updates a model:
--   UPDATE this table → everything adapts within 5 minutes. No deploys.
--
-- model_alias[] maps old/retired IDs to the current canonical model.
-- replaced_by chains allow automatic resolution of deprecated models.
-- =============================================================================

-- ─── TABLES ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.ai_model_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Identity
  model_id TEXT NOT NULL UNIQUE,
  model_alias TEXT[] DEFAULT '{}',
  display_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  capabilities TEXT[] NOT NULL DEFAULT '{}',
  -- Lifecycle
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','deprecated','sunset','preview','retired')),
  replaced_by TEXT,
  sunset_date TIMESTAMPTZ,
  -- Routing
  quality_tier TEXT DEFAULT 'advanced',
  speed_tier TEXT DEFAULT 'medium',
  api_endpoint TEXT,
  -- Cost
  cost_per_1m_input DECIMAL(10,4),
  cost_per_1m_output DECIMAL(10,4),
  -- Capabilities
  max_context_window INTEGER,
  max_output_tokens INTEGER,
  supports_vision BOOLEAN DEFAULT false,
  supports_function_calling BOOLEAN DEFAULT false,
  supports_streaming BOOLEAN DEFAULT true,
  -- Metadata
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_model_regional_routing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  sub_region TEXT,
  language_code TEXT,
  capability TEXT NOT NULL,
  primary_model_id TEXT NOT NULL,
  fallback_model_ids TEXT[] DEFAULT '{}',
  reason TEXT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(region, COALESCE(sub_region,''), COALESCE(language_code,''), capability)
);

-- ─── INDEXES ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_model_provider ON ai_model_registry(provider, status);
CREATE INDEX IF NOT EXISTS idx_model_capabilities ON ai_model_registry USING GIN(capabilities);
CREATE INDEX IF NOT EXISTS idx_model_alias ON ai_model_registry USING GIN(model_alias);
CREATE INDEX IF NOT EXISTS idx_routing_lookup ON ai_model_regional_routing(region, capability, is_active);

-- ─── RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE ai_model_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_regional_routing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read models" ON ai_model_registry FOR SELECT USING (true);
CREATE POLICY "Service write models" ON ai_model_registry FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Public read routing" ON ai_model_regional_routing FOR SELECT USING (true);
CREATE POLICY "Service write routing" ON ai_model_regional_routing FOR ALL USING (auth.role() = 'service_role');

-- ─── UPDATED_AT TRIGGER ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_ai_model_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ai_model_registry_updated_at
  BEFORE UPDATE ON ai_model_registry
  FOR EACH ROW EXECUTE FUNCTION update_ai_model_updated_at();

CREATE TRIGGER trg_ai_model_regional_routing_updated_at
  BEFORE UPDATE ON ai_model_regional_routing
  FOR EACH ROW EXECUTE FUNCTION update_ai_model_updated_at();

-- =============================================================================
-- SEED DATA — All providers, all models
-- =============================================================================

INSERT INTO ai_model_registry (model_id, model_alias, display_name, provider, capabilities, status, replaced_by, sunset_date, quality_tier, speed_tier, api_endpoint, cost_per_1m_input, cost_per_1m_output, max_context_window, max_output_tokens, supports_vision, supports_function_calling, supports_streaming, meta) VALUES

-- ═══════════════════════════════════════════════════════════════════════════
-- ANTHROPIC (Claude)
-- ═══════════════════════════════════════════════════════════════════════════
('claude-sonnet-4-6', ARRAY['claude-sonnet-4-20250514','claude-sonnet-4','claude-3-5-sonnet-20241022','claude-3-5-sonnet','claude-sonnet-latest'], 'Claude Sonnet 4.6', 'anthropic', ARRAY['llm','vision','code-gen','function-calling'], 'active', NULL, NULL, 'advanced', 'medium', NULL, 3.0000, 15.0000, 200000, 8192, true, true, true, '{"family":"claude-4"}'),

('claude-opus-4-7', ARRAY['claude-opus-4-6','claude-opus-4-5','claude-opus-4','claude-opus-4-1-20250805','claude-opus-latest'], 'Claude Opus 4.7', 'anthropic', ARRAY['llm','vision','code-gen','function-calling','streaming','coding','agentic'], 'active', NULL, NULL, 'premium', 'medium', NULL, 5.0000, 25.0000, 1000000, 8192, true, true, true, '{"family":"claude-4"}'),

('claude-opus-4-6', ARRAY[]::TEXT[], 'Claude Opus 4.6 (Deprecated)', 'anthropic', ARRAY['llm','vision','code-gen','function-calling','reasoning'], 'deprecated', 'claude-opus-4-7', NULL, 'premium', 'slow', NULL, 15.0000, 75.0000, 200000, 8192, true, true, true, '{"family":"claude-4"}'),

('claude-haiku-4-5', ARRAY['claude-3-5-haiku-20241022','claude-3-5-haiku','claude-haiku-latest','claude-haiku-4-5'], 'Claude Haiku 4.5', 'anthropic', ARRAY['llm','vision','code-gen','function-calling'], 'active', NULL, NULL, 'standard', 'fast', NULL, 0.8000, 4.0000, 200000, 8192, true, true, true, '{"family":"claude-4"}'),

('claude-3-5-sonnet-20241022', ARRAY[]::TEXT[], 'Claude 3.5 Sonnet (Retired)', 'anthropic', ARRAY['llm','vision','code-gen'], 'retired', 'claude-sonnet-4-6', '2025-10-01'::TIMESTAMPTZ, 'advanced', 'medium', NULL, 3.0000, 15.0000, 200000, 8192, true, true, true, '{}'),

('claude-3-5-haiku-20241022', ARRAY[]::TEXT[], 'Claude 3.5 Haiku (Retired)', 'anthropic', ARRAY['llm','vision'], 'retired', 'claude-haiku-4-5', '2025-10-01'::TIMESTAMPTZ, 'standard', 'fast', NULL, 0.8000, 4.0000, 200000, 8192, true, true, true, '{}'),

-- ═══════════════════════════════════════════════════════════════════════════
-- OPENAI
-- ═══════════════════════════════════════════════════════════════════════════
('gpt-4o', ARRAY['gpt-4o-2024-08-06'], 'GPT-4o', 'openai', ARRAY['llm','vision','function-calling','code-gen'], 'active', NULL, NULL, 'advanced', 'medium', NULL, 2.5000, 10.0000, 128000, 16384, true, true, true, '{}'),

('gpt-4o-mini', ARRAY['gpt-4o-mini-2024-07-18'], 'GPT-4o Mini', 'openai', ARRAY['llm','vision','function-calling'], 'active', NULL, NULL, 'standard', 'fast', NULL, 0.1500, 0.6000, 128000, 16384, true, true, true, '{}'),

('gpt-5-2025-08-07', ARRAY['gpt-5','gpt-5-latest'], 'GPT-5', 'openai', ARRAY['llm','vision','function-calling','reasoning','code-gen'], 'active', NULL, NULL, 'premium', 'medium', NULL, 5.0000, 15.0000, 256000, 32768, true, true, true, '{}'),

('gpt-5-mini-2025-08-07', ARRAY['gpt-5-mini','gpt-5-mini-latest'], 'GPT-5 Mini', 'openai', ARRAY['llm','vision','function-calling'], 'active', NULL, NULL, 'standard', 'fast', NULL, 0.5000, 2.0000, 256000, 32768, true, true, true, '{}'),

('gpt-5-nano-2025-08-07', ARRAY['gpt-5-nano'], 'GPT-5 Nano', 'openai', ARRAY['llm','function-calling'], 'active', NULL, NULL, 'economy', 'fast', NULL, 0.1000, 0.4000, 128000, 16384, false, true, true, '{}'),

('gpt-4.1-2025-04-14', ARRAY['gpt-4.1'], 'GPT-4.1', 'openai', ARRAY['llm','vision','function-calling','code-gen'], 'active', NULL, NULL, 'advanced', 'medium', NULL, 2.0000, 8.0000, 1047576, 32768, true, true, true, '{}'),

('o3-2025-04-16', ARRAY['o3','o3-latest'], 'O3', 'openai', ARRAY['llm','reasoning','function-calling','vision'], 'active', NULL, NULL, 'premium', 'slow', NULL, 10.0000, 40.0000, 200000, 100000, true, true, true, '{}'),

('o4-mini-2025-04-16', ARRAY['o4-mini','o4-mini-latest'], 'O4 Mini', 'openai', ARRAY['llm','reasoning','function-calling','vision'], 'active', NULL, NULL, 'advanced', 'medium', NULL, 1.1000, 4.4000, 200000, 100000, true, true, true, '{}'),

('gpt-image-1', ARRAY['gpt-image','dall-e-4'], 'GPT Image 1', 'openai', ARRAY['image-gen','text-to-image','image-editing'], 'active', NULL, NULL, 'advanced', 'medium', 'ai-image-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('dall-e-3', ARRAY[]::TEXT[], 'DALL-E 3 (Sunsetting)', 'openai', ARRAY['text-to-image'], 'deprecated', 'gpt-image-1', '2025-05-12'::TIMESTAMPTZ, 'advanced', 'medium', 'ai-image-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('dall-e-2', ARRAY[]::TEXT[], 'DALL-E 2 (Sunsetting)', 'openai', ARRAY['text-to-image'], 'deprecated', 'gpt-image-1', '2025-05-12'::TIMESTAMPTZ, 'standard', 'fast', 'ai-image-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('whisper-1', ARRAY['whisper'], 'Whisper 1', 'openai', ARRAY['stt','speech-recognition'], 'active', NULL, NULL, 'advanced', 'medium', 'ai-universal-processor', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('tts-1-hd', ARRAY['tts-1','openai-tts-hd'], 'OpenAI TTS HD', 'openai', ARRAY['tts'], 'active', NULL, NULL, 'advanced', 'medium', 'multi-provider-tts', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('sora-2.0-turbo', ARRAY['sora-2','sora-2.0','sora','sora-turbo'], 'Sora 2.0 Turbo', 'openai', ARRAY['text-to-video','image-to-video'], 'active', NULL, NULL, 'premium', 'slow', 'ai-video-generator', NULL, NULL, NULL, NULL, false, false, false, '{"provider_sub":"sora"}'),

-- ═══════════════════════════════════════════════════════════════════════════
-- GOOGLE / GEMINI
-- ═══════════════════════════════════════════════════════════════════════════
('gemini-2.5-pro', ARRAY['gemini-2.5-pro-preview-05-06','google/gemini-2.5-pro','gemini-pro-latest'], 'Gemini 2.5 Pro', 'gemini', ARRAY['llm','vision','code-gen','function-calling'], 'active', NULL, NULL, 'advanced', 'medium', NULL, 1.2500, 10.0000, 1048576, 65536, true, true, true, '{}'),

('gemini-2.5-flash', ARRAY['gemini-2.5-flash-preview','google/gemini-2.5-flash','gemini-flash-latest','gemini-2.5-flash-image'], 'Gemini 2.5 Flash', 'gemini', ARRAY['llm','vision','image-gen','function-calling'], 'active', NULL, NULL, 'standard', 'fast', NULL, 0.1500, 0.6000, 1048576, 65536, true, true, true, '{}'),

('gemini-3.0-flash-preview', ARRAY['google/gemini-3-flash-preview','gemini-3-flash','gemini-3.0-flash'], 'Gemini 3.0 Flash Preview', 'gemini', ARRAY['llm','vision','image-gen','function-calling'], 'preview', NULL, NULL, 'advanced', 'fast', NULL, 0.2000, 0.8000, 1048576, 65536, true, true, true, '{}'),

('gemini-1.5-pro', ARRAY['gemini-1.5-pro-latest'], 'Gemini 1.5 Pro (Retired)', 'gemini', ARRAY['llm','vision'], 'retired', 'gemini-2.5-pro', '2025-02-01'::TIMESTAMPTZ, 'advanced', 'medium', NULL, 1.2500, 5.0000, 2097152, 8192, true, true, true, '{}'),

('gemini-1.5-flash', ARRAY['gemini-1.5-flash-latest'], 'Gemini 1.5 Flash (Retired)', 'gemini', ARRAY['llm','vision'], 'retired', 'gemini-2.5-flash', '2025-02-01'::TIMESTAMPTZ, 'standard', 'fast', NULL, 0.0750, 0.3000, 1048576, 8192, true, true, true, '{}'),

('gemini-pro', ARRAY['gemini-1.0-pro'], 'Gemini Pro (Retired)', 'gemini', ARRAY['llm'], 'retired', 'gemini-2.5-pro', '2025-02-01'::TIMESTAMPTZ, 'standard', 'medium', NULL, 0.5000, 1.5000, 32760, 8192, false, false, true, '{}'),

('imagen-3.0-generate-002', ARRAY['imagen-3','imagen-3.0-generate-001','imagegeneration@006'], 'Imagen 3.0', 'gemini', ARRAY['text-to-image'], 'active', NULL, NULL, 'premium', 'medium', 'ai-image-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('veo-3.1-generate', ARRAY['veo-3','veo-002','veo'], 'Veo 3.1', 'gemini', ARRAY['text-to-video'], 'active', NULL, NULL, 'premium', 'slow', 'ai-video-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('gemini-nano-banana', ARRAY['gemini-3-pro-image','google/gemini-3-pro-image-preview'], 'Gemini Image Gen', 'gemini', ARRAY['image-gen','text-to-image'], 'active', NULL, NULL, 'standard', 'fast', 'gemini-generate-image', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('gemini-2.5-flash-preview-image-generation', ARRAY['gemini-2.5-flash-image-preview','google/gemini-2.5-flash-image-preview','google/gemini-2.5-flash-image'], 'Gemini 2.5 Flash Image', 'gemini', ARRAY['image-gen','text-to-image'], 'active', NULL, NULL, 'standard', 'fast', 'gemini-generate-image', NULL, NULL, NULL, NULL, false, false, false, '{}'),

-- ═══════════════════════════════════════════════════════════════════════════
-- ALIBABA / DASHSCOPE
-- ═══════════════════════════════════════════════════════════════════════════
('qwen-max', ARRAY['qwen-max-latest'], 'Qwen Max', 'alibaba', ARRAY['llm','text-generation','function-calling'], 'active', NULL, NULL, 'advanced', 'medium', NULL, 1.6000, 6.4000, 131072, 8192, false, true, true, '{}'),

('qwen-2.5-72b', ARRAY['qwen-2.5-72b-instruct'], 'Qwen 2.5 72B', 'alibaba', ARRAY['llm','text-generation'], 'active', NULL, NULL, 'advanced', 'medium', NULL, 0.9000, 0.9000, 131072, 8192, false, false, true, '{}'),

('qwen-turbo', ARRAY['qwen-turbo-latest'], 'Qwen Turbo', 'alibaba', ARRAY['llm','text-generation'], 'active', NULL, NULL, 'standard', 'fast', NULL, 0.3000, 0.6000, 131072, 8192, false, false, true, '{}'),

('qwen-plus', ARRAY['qwen-plus-latest'], 'Qwen Plus', 'alibaba', ARRAY['llm','text-generation'], 'active', NULL, NULL, 'advanced', 'medium', NULL, 0.8000, 2.0000, 131072, 8192, false, true, true, '{}'),

('qwen-vl-plus', ARRAY['qwen-vl-plus-latest'], 'Qwen VL Plus', 'alibaba', ARRAY['llm','vision'], 'active', NULL, NULL, 'advanced', 'medium', NULL, 1.0000, 2.0000, 131072, 8192, true, false, true, '{}'),

-- Alibaba Video
('wan2.6-t2v', ARRAY['wanx-v1-t2v'], 'Wan 2.6 T2V', 'alibaba', ARRAY['text-to-video'], 'active', NULL, NULL, 'advanced', 'slow', 'alibaba-video-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('wan2.6-i2v', ARRAY['wanx-v1-i2v'], 'Wan 2.6 I2V', 'alibaba', ARRAY['image-to-video'], 'active', NULL, NULL, 'advanced', 'slow', 'alibaba-video-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('wan2.6-flf2v', ARRAY['wanx-v1-flf2v'], 'Wan 2.6 FLF2V', 'alibaba', ARRAY['first-last-frame-to-video'], 'active', NULL, NULL, 'advanced', 'slow', 'alibaba-video-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('wan2.2-s2v', ARRAY[]::TEXT[], 'Wan 2.2 S2V', 'alibaba', ARRAY['speech-to-video','lipsync'], 'active', NULL, NULL, 'advanced', 'slow', 'alibaba-video-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('wan2.2-animate', ARRAY[]::TEXT[], 'Wan 2.2 Animate', 'alibaba', ARRAY['animation','motion-transfer'], 'active', NULL, NULL, 'advanced', 'slow', 'alibaba-video-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('wan2.1-t2v', ARRAY['wan2.1-t2v-turbo','wan2.2-t2v-plus'], 'Wan 2.1 T2V (Deprecated)', 'alibaba', ARRAY['text-to-video'], 'deprecated', 'wan2.6-t2v', NULL, 'standard', 'slow', 'alibaba-video-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('wan2.1-i2v', ARRAY[]::TEXT[], 'Wan 2.1 I2V (Deprecated)', 'alibaba', ARRAY['image-to-video'], 'deprecated', 'wan2.6-i2v', NULL, 'standard', 'slow', 'alibaba-video-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

-- Alibaba Image
('wan2.6-t2i', ARRAY[]::TEXT[], 'Wan 2.6 T2I', 'alibaba', ARRAY['text-to-image'], 'active', NULL, NULL, 'advanced', 'medium', 'ai-image-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('wanx-v2.1', ARRAY['wanx-v1'], 'Wanx v2.1', 'alibaba', ARRAY['text-to-image'], 'active', NULL, NULL, 'standard', 'medium', 'ai-image-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('flux-merged', ARRAY[]::TEXT[], 'FLUX Merged (Alibaba)', 'alibaba', ARRAY['text-to-image'], 'active', NULL, NULL, 'standard', 'fast', 'ai-image-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('qwen-image-max', ARRAY[]::TEXT[], 'Qwen Image Max', 'alibaba', ARRAY['text-to-image','image-editing'], 'active', NULL, NULL, 'advanced', 'medium', 'ai-image-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

-- Alibaba TTS
('cosyvoice-v3-flash', ARRAY['cosyvoice-flash'], 'CosyVoice v3 Flash', 'alibaba', ARRAY['tts'], 'active', NULL, NULL, 'standard', 'fast', 'multi-provider-tts', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('cosyvoice-v3-plus', ARRAY['cosyvoice-plus'], 'CosyVoice v3 Plus', 'alibaba', ARRAY['tts','tts-premium'], 'active', NULL, NULL, 'advanced', 'medium', 'multi-provider-tts', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('qwen3-tts', ARRAY['qwen3-tts-flash','qwen3-tts-instruct-flash-realtime','qwen3-tts-flash-realtime'], 'Qwen3 TTS', 'alibaba', ARRAY['tts'], 'active', NULL, NULL, 'standard', 'fast', 'multi-provider-tts', NULL, NULL, NULL, NULL, false, false, false, '{}'),

-- Alibaba STT
('paraformer', ARRAY['fun-asr','qwen3-asr-flash','qwen3-asr-flash-realtime'], 'Paraformer', 'alibaba', ARRAY['stt','speech-recognition'], 'active', NULL, NULL, 'standard', 'fast', 'ai-universal-processor', NULL, NULL, NULL, NULL, false, false, false, '{}'),

-- Alibaba Avatar / 3D
('tao-avatar', ARRAY[]::TEXT[], 'Tao Avatar', 'alibaba', ARRAY['avatar-3d','full-body-ar'], 'active', NULL, NULL, 'advanced', 'slow', 'alibaba-3d-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('mach', ARRAY[]::TEXT[], 'Mach', 'alibaba', ARRAY['text-to-3d-character'], 'active', NULL, NULL, 'advanced', 'slow', 'alibaba-3d-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

-- Alibaba Lipsync
('alibaba-wan2.2', ARRAY[]::TEXT[], 'Alibaba Wan 2.2 Lipsync', 'alibaba', ARRAY['lipsync'], 'active', NULL, NULL, 'advanced', 'medium', 'ai-video-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('alibaba-omniavatar', ARRAY[]::TEXT[], 'Alibaba OmniAvatar', 'alibaba', ARRAY['lipsync','audio-driven-avatar'], 'active', NULL, NULL, 'premium', 'slow', 'ai-video-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

-- ═══════════════════════════════════════════════════════════════════════════
-- ELEVENLABS
-- ═══════════════════════════════════════════════════════════════════════════
('eleven_multilingual_v2', ARRAY['eleven_monolingual_v1','eleven_multilingual_v1','elevenlabs-multilingual','elevenlabs-v2'], 'ElevenLabs Multilingual v2', 'elevenlabs', ARRAY['tts','multilingual-tts'], 'active', NULL, NULL, 'premium', 'medium', 'multi-provider-tts', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('eleven_turbo_v2_5', ARRAY['elevenlabs-turbo'], 'ElevenLabs Turbo v2.5', 'elevenlabs', ARRAY['tts','low-latency-tts'], 'active', NULL, NULL, 'advanced', 'fast', 'multi-provider-tts', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('eleven_monolingual_v1', ARRAY[]::TEXT[], 'ElevenLabs Mono v1 (Retired)', 'elevenlabs', ARRAY['tts'], 'retired', 'eleven_multilingual_v2', NULL, 'standard', 'medium', 'multi-provider-tts', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('eleven_multilingual_v1', ARRAY[]::TEXT[], 'ElevenLabs Multi v1 (Retired)', 'elevenlabs', ARRAY['tts','multilingual-tts'], 'retired', 'eleven_multilingual_v2', NULL, 'standard', 'medium', 'multi-provider-tts', NULL, NULL, NULL, NULL, false, false, false, '{}'),

-- ═══════════════════════════════════════════════════════════════════════════
-- DEEPGRAM
-- ═══════════════════════════════════════════════════════════════════════════
('nova-3', ARRAY['nova-2','deepgram-nova-2','deepgram-nova-3','deepgram-nova'], 'Deepgram Nova 3', 'deepgram', ARRAY['stt','speech-recognition','real-time-stt'], 'active', NULL, NULL, 'premium', 'fast', NULL, NULL, NULL, NULL, NULL, false, false, false, '{}'),

('nova-2', ARRAY[]::TEXT[], 'Deepgram Nova 2 (Deprecated)', 'deepgram', ARRAY['stt','speech-recognition'], 'deprecated', 'nova-3', NULL, 'advanced', 'fast', NULL, NULL, NULL, NULL, NULL, false, false, false, '{}'),

-- ═══════════════════════════════════════════════════════════════════════════
-- DEEPSEEK
-- ═══════════════════════════════════════════════════════════════════════════
('deepseek-chat', ARRAY['deepseek-v3','deepseek/deepseek-chat'], 'DeepSeek Chat', 'deepseek', ARRAY['llm','text-generation','code-gen'], 'active', NULL, NULL, 'advanced', 'fast', NULL, 0.1400, 0.2800, 131072, 8192, false, true, true, '{}'),

('deepseek-reasoner', ARRAY['deepseek-r1','deepseek/deepseek-reasoner'], 'DeepSeek Reasoner', 'deepseek', ARRAY['llm','reasoning'], 'active', NULL, NULL, 'advanced', 'medium', NULL, 0.5500, 2.1900, 131072, 8192, false, false, true, '{}'),

-- ═══════════════════════════════════════════════════════════════════════════
-- FLUX (Black Forest Labs)
-- ═══════════════════════════════════════════════════════════════════════════
('flux-pro', ARRAY['flux-1.1-pro','flux-pro-1.1'], 'FLUX Pro', 'flux', ARRAY['text-to-image'], 'active', NULL, NULL, 'premium', 'medium', 'ai-image-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('flux-dev', ARRAY['flux-1-dev'], 'FLUX Dev', 'flux', ARRAY['text-to-image'], 'active', NULL, NULL, 'advanced', 'medium', 'ai-image-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('flux-schnell', ARRAY['flux-1-schnell','black-forest-labs/FLUX.1-schnell','black-forest-labs/flux-schnell'], 'FLUX Schnell', 'flux', ARRAY['text-to-image','fast-image'], 'active', NULL, NULL, 'standard', 'fast', 'ai-image-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

-- ═══════════════════════════════════════════════════════════════════════════
-- REPLICATE
-- ═══════════════════════════════════════════════════════════════════════════
('sadtalker', ARRAY['replicate-sadtalker'], 'SadTalker', 'replicate', ARRAY['lipsync','face-animation'], 'active', NULL, NULL, 'standard', 'medium', 'ai-video-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('wav2lip', ARRAY['replicate-wav2lip'], 'Wav2Lip', 'replicate', ARRAY['lipsync'], 'active', NULL, NULL, 'standard', 'fast', 'ai-video-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('triposr', ARRAY['replicate-triposr'], 'TripoSR', 'replicate', ARRAY['image-to-3d'], 'active', NULL, NULL, 'standard', 'medium', 'alibaba-3d-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('luma-ray', ARRAY['luma/ray','replicate-luma'], 'Luma Ray', 'replicate', ARRAY['text-to-video'], 'active', NULL, NULL, 'advanced', 'slow', 'ai-video-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

-- ═══════════════════════════════════════════════════════════════════════════
-- MODELSLAB
-- ═══════════════════════════════════════════════════════════════════════════
('animatediff', ARRAY['modelslab-animatediff','modelslab-animate'], 'AnimateDiff', 'modelslab', ARRAY['text-to-video','animation'], 'active', NULL, NULL, 'standard', 'medium', 'ai-video-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('svd', ARRAY['modelslab-svd','stable-video-diffusion'], 'Stable Video Diffusion', 'modelslab', ARRAY['image-to-video'], 'active', NULL, NULL, 'standard', 'slow', 'ai-video-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('modelslab-text2video', ARRAY[]::TEXT[], 'ModelsLab Text2Video', 'modelslab', ARRAY['text-to-video'], 'active', NULL, NULL, 'standard', 'medium', 'ai-video-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('modelslab-3d', ARRAY[]::TEXT[], 'ModelsLab 3D', 'modelslab', ARRAY['text-to-3d'], 'active', NULL, NULL, 'standard', 'medium', 'alibaba-3d-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('modelslab-flux', ARRAY['modelslab','modelslab-image'], 'ModelsLab FLUX', 'modelslab', ARRAY['text-to-image'], 'active', NULL, NULL, 'advanced', 'medium', 'ai-image-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

-- ═══════════════════════════════════════════════════════════════════════════
-- HUGGINGFACE
-- ═══════════════════════════════════════════════════════════════════════════
('hf-flux-schnell', ARRAY['huggingface-flux-schnell','stabilityai/stable-diffusion-xl-base-1.0'], 'HF FLUX Schnell', 'huggingface', ARRAY['text-to-image','fast-image'], 'active', NULL, NULL, 'standard', 'fast', 'ai-image-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('hf-animatediff-lightning', ARRAY['ByteDance/AnimateDiff-Lightning'], 'HF AnimateDiff Lightning', 'huggingface', ARRAY['text-to-video'], 'active', NULL, NULL, 'standard', 'fast', 'ai-video-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

-- ═══════════════════════════════════════════════════════════════════════════
-- STABILITY AI
-- ═══════════════════════════════════════════════════════════════════════════
('stable-diffusion-xl', ARRAY['sdxl','stable-diffusion-xl-1024-v1-0','sdxl-base-1.0','stability'], 'Stable Diffusion XL', 'stability', ARRAY['text-to-image'], 'active', NULL, NULL, 'standard', 'medium', 'ai-image-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('stable-diffusion-3', ARRAY['sd3','sd3-large','sd3-medium'], 'Stable Diffusion 3', 'stability', ARRAY['text-to-image'], 'active', NULL, NULL, 'advanced', 'medium', 'ai-image-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

-- ═══════════════════════════════════════════════════════════════════════════
-- MESHY (3D Generation)
-- ═══════════════════════════════════════════════════════════════════════════
('meshy-6', ARRAY['meshy-latest'], 'Meshy 6', 'meshy', ARRAY['text-to-3d','image-to-3d','texture'], 'active', NULL, NULL, 'advanced', 'medium', 'alibaba-3d-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('meshy-text-to-3d', ARRAY[]::TEXT[], 'Meshy Text-to-3D', 'meshy', ARRAY['text-to-3d'], 'active', NULL, NULL, 'advanced', 'medium', 'alibaba-3d-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('meshy-image-to-3d', ARRAY[]::TEXT[], 'Meshy Image-to-3D', 'meshy', ARRAY['image-to-3d'], 'active', NULL, NULL, 'advanced', 'medium', 'alibaba-3d-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('meshy-texture', ARRAY[]::TEXT[], 'Meshy Texture', 'meshy', ARRAY['texture'], 'active', NULL, NULL, 'advanced', 'medium', 'alibaba-3d-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('meshy-4', ARRAY[]::TEXT[], 'Meshy 4 (Sunset)', 'meshy', ARRAY['text-to-3d','image-to-3d','texture'], 'sunset', 'meshy-6', '2026-03-20'::TIMESTAMPTZ, 'standard', 'medium', 'alibaba-3d-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

-- ═══════════════════════════════════════════════════════════════════════════
-- AZURE (Neural TTS / Translator)
-- ═══════════════════════════════════════════════════════════════════════════
('azure-neural-tts', ARRAY['azure-neural','azure-tts'], 'Azure Neural TTS', 'azure', ARRAY['tts','multilingual-tts'], 'active', NULL, NULL, 'advanced', 'fast', 'multi-provider-tts', NULL, NULL, NULL, NULL, false, false, false, '{}'),

('azure-translator', ARRAY['azure-translate'], 'Azure Translator', 'azure', ARRAY['translation'], 'active', NULL, NULL, 'advanced', 'fast', NULL, NULL, NULL, NULL, NULL, false, false, false, '{}'),

-- ═══════════════════════════════════════════════════════════════════════════
-- MINIMAX
-- ═══════════════════════════════════════════════════════════════════════════
('minimax-video-01', ARRAY['minimax/video-01'], 'MiniMax Video 01', 'minimax', ARRAY['text-to-video'], 'active', NULL, NULL, 'advanced', 'slow', 'ai-video-generator', NULL, NULL, NULL, NULL, false, false, false, '{}'),

-- ═══════════════════════════════════════════════════════════════════════════
-- TRANSLATION PROVIDERS
-- ═══════════════════════════════════════════════════════════════════════════
('deepl', ARRAY['deepl-translate','deepl-pro'], 'DeepL', 'deepl', ARRAY['translation'], 'active', NULL, NULL, 'premium', 'fast', NULL, NULL, NULL, NULL, NULL, false, false, false, '{}'),

('google-translate', ARRAY['google-cloud-translate'], 'Google Translate', 'google', ARRAY['translation'], 'active', NULL, NULL, 'standard', 'fast', NULL, NULL, NULL, NULL, NULL, false, false, false, '{}'),

('qwen-mt', ARRAY['qwen-translate','alibaba-translate'], 'Qwen MT', 'alibaba', ARRAY['translation'], 'active', NULL, NULL, 'advanced', 'fast', NULL, NULL, NULL, NULL, NULL, false, false, false, '{}'),

('nllb', ARRAY['meta-nllb'], 'NLLB', 'meta', ARRAY['translation'], 'active', NULL, NULL, 'standard', 'medium', NULL, NULL, NULL, NULL, NULL, false, false, false, '{}'),

-- ═══════════════════════════════════════════════════════════════════════════
-- MUSIC / AUDIO
-- ═══════════════════════════════════════════════════════════════════════════
('elevenlabs-music', ARRAY[]::TEXT[], 'ElevenLabs Music', 'elevenlabs', ARRAY['music-gen'], 'active', NULL, NULL, 'premium', 'medium', NULL, NULL, NULL, NULL, NULL, false, false, false, '{}'),

('google-lyria-2', ARRAY['lyria-2'], 'Google Lyria 2', 'google', ARRAY['music-gen'], 'active', NULL, NULL, 'advanced', 'medium', NULL, NULL, NULL, NULL, NULL, false, false, false, '{}'),

-- ═══════════════════════════════════════════════════════════════════════════
-- RUNPOD
-- ═══════════════════════════════════════════════════════════════════════════
('runpod-ffmpeg', ARRAY['runpod'], 'RunPod FFmpeg', 'runpod', ARRAY['video-rendering','ffmpeg'], 'active', NULL, NULL, 'advanced', 'medium', NULL, NULL, NULL, NULL, NULL, false, false, false, '{}')

ON CONFLICT (model_id) DO UPDATE SET
  model_alias = EXCLUDED.model_alias,
  display_name = EXCLUDED.display_name,
  provider = EXCLUDED.provider,
  capabilities = EXCLUDED.capabilities,
  status = EXCLUDED.status,
  replaced_by = EXCLUDED.replaced_by,
  sunset_date = EXCLUDED.sunset_date,
  quality_tier = EXCLUDED.quality_tier,
  speed_tier = EXCLUDED.speed_tier,
  api_endpoint = EXCLUDED.api_endpoint,
  cost_per_1m_input = EXCLUDED.cost_per_1m_input,
  cost_per_1m_output = EXCLUDED.cost_per_1m_output,
  max_context_window = EXCLUDED.max_context_window,
  max_output_tokens = EXCLUDED.max_output_tokens,
  supports_vision = EXCLUDED.supports_vision,
  supports_function_calling = EXCLUDED.supports_function_calling,
  supports_streaming = EXCLUDED.supports_streaming,
  meta = EXCLUDED.meta,
  updated_at = now();

-- =============================================================================
-- SEED REGIONAL ROUTING (16 parent regions)
-- =============================================================================

INSERT INTO ai_model_regional_routing (region, capability, primary_model_id, fallback_model_ids, reason, is_active) VALUES

-- LLM Routing
('nam',     'llm', 'claude-sonnet-4-6',  ARRAY['gpt-4o','deepseek-chat','gemini-2.5-pro'], 'Best English + code quality', true),
('eu',      'llm', 'claude-sonnet-4-6',  ARRAY['gpt-4o','deepseek-chat','gemini-2.5-pro'], 'Best European language support', true),
('latam',   'llm', 'claude-sonnet-4-6',  ARRAY['gpt-4o','deepseek-chat','gemini-2.5-pro'], 'Strong Spanish/Portuguese', true),
('oceania', 'llm', 'claude-sonnet-4-6',  ARRAY['gpt-4o','deepseek-chat','gemini-2.5-pro'], 'English-primary region', true),
('turkey',  'llm', 'claude-sonnet-4-6',  ARRAY['gpt-4o','gemini-2.5-pro'], 'Good Turkish support', true),
('eurasia', 'llm', 'claude-sonnet-4-6',  ARRAY['gpt-4o','gemini-2.5-pro'], 'Russian + regional', true),
('caribbean','llm', 'gpt-4o',            ARRAY['claude-sonnet-4-6','deepseek-chat','gemini-2.5-pro'], 'Multi-language Caribbean', true),
('pakistan', 'llm', 'gpt-4o',            ARRAY['claude-sonnet-4-6','deepseek-chat','gemini-2.5-pro'], 'Urdu + English', true),
('cjk',     'llm', 'qwen-max',           ARRAY['gpt-4o','deepseek-chat','gemini-2.5-pro'], 'Best CJK native support', true),
('mena',    'llm', 'qwen-max',           ARRAY['gpt-4o','claude-sonnet-4-6','gemini-2.5-pro'], 'Best Arabic support', true),
('central_asia','llm', 'gpt-4o',         ARRAY['qwen-max','claude-sonnet-4-6','gemini-2.5-pro'], 'Turkic + Russian', true),
('india',   'llm', 'gemini-2.5-pro',     ARRAY['gpt-4o','claude-sonnet-4-6','deepseek-chat'], 'Best Indic language support', true),
('bangladesh','llm','gemini-2.5-pro',     ARRAY['gpt-4o','claude-sonnet-4-6'], 'Best Bangla support', true),
('south_asia','llm','gemini-2.5-pro',     ARRAY['gpt-4o','claude-sonnet-4-6'], 'Indic + regional', true),
('sea',     'llm', 'gemini-2.5-pro',     ARRAY['gpt-4o','qwen-max','claude-sonnet-4-6'], 'Best SEA language support', true),
('africa',  'llm', 'gemini-2.5-pro',     ARRAY['gpt-4o','claude-sonnet-4-6'], 'African language coverage', true),

-- TTS Routing
('nam',     'tts', 'eleven_multilingual_v2', ARRAY['azure-neural-tts','tts-1-hd'], 'Premium English TTS', true),
('eu',      'tts', 'eleven_multilingual_v2', ARRAY['azure-neural-tts','tts-1-hd'], 'Premium European TTS', true),
('latam',   'tts', 'eleven_multilingual_v2', ARRAY['azure-neural-tts','tts-1-hd'], 'Spanish/Portuguese TTS', true),
('cjk',     'tts', 'cosyvoice-v3-flash',    ARRAY['qwen3-tts','azure-neural-tts'], 'Best CJK voice quality', true),
('mena',    'tts', 'azure-neural-tts',       ARRAY['eleven_multilingual_v2','cosyvoice-v3-flash'], 'Best Arabic voice', true),
('india',   'tts', 'azure-neural-tts',       ARRAY['eleven_multilingual_v2','cosyvoice-v3-flash'], 'Hindi/Tamil/Telugu voices', true),
('sea',     'tts', 'azure-neural-tts',       ARRAY['eleven_multilingual_v2','cosyvoice-v3-flash'], 'SEA language voices', true),
('africa',  'tts', 'azure-neural-tts',       ARRAY['eleven_multilingual_v2'], 'Swahili/Amharic/Yoruba', true),
('turkey',  'tts', 'azure-neural-tts',       ARRAY['eleven_multilingual_v2'], 'Turkish neural voice', true),
('pakistan', 'tts', 'azure-neural-tts',       ARRAY['eleven_multilingual_v2'], 'Urdu neural voice', true),
('oceania', 'tts', 'eleven_multilingual_v2', ARRAY['azure-neural-tts','tts-1-hd'], 'English TTS', true),
('caribbean','tts','eleven_multilingual_v2', ARRAY['azure-neural-tts'], 'Multi-language TTS', true),
('eurasia', 'tts', 'azure-neural-tts',       ARRAY['eleven_multilingual_v2'], 'Russian neural voice', true),
('central_asia','tts','azure-neural-tts',    ARRAY['eleven_multilingual_v2'], 'Turkic voices', true),
('bangladesh','tts','azure-neural-tts',      ARRAY['eleven_multilingual_v2'], 'Bangla voice', true),
('south_asia','tts','azure-neural-tts',      ARRAY['eleven_multilingual_v2'], 'Regional voices', true),

-- Image Generation Routing
('nam',     'image-gen', 'gpt-image-1',   ARRAY['flux-pro','gemini-nano-banana','wan2.6-t2i'], 'Best quality images', true),
('eu',      'image-gen', 'gpt-image-1',   ARRAY['flux-pro','gemini-nano-banana','wan2.6-t2i'], 'Quality + compliance', true),
('cjk',     'image-gen', 'wan2.6-t2i',    ARRAY['gpt-image-1','flux-pro','gemini-nano-banana'], 'Best CJK aesthetics', true),
('mena',    'image-gen', 'gpt-image-1',   ARRAY['wan2.6-t2i','flux-pro'], 'Cultural sensitivity', true),
('india',   'image-gen', 'gpt-image-1',   ARRAY['wan2.6-t2i','flux-pro','gemini-nano-banana'], 'Diverse representation', true),
('sea',     'image-gen', 'wan2.6-t2i',    ARRAY['gpt-image-1','flux-pro'], 'SEA aesthetics', true),
('latam',   'image-gen', 'gpt-image-1',   ARRAY['flux-pro','wan2.6-t2i'], 'Quality images', true),
('africa',  'image-gen', 'gpt-image-1',   ARRAY['flux-pro','wan2.6-t2i'], 'Diverse representation', true),

-- Video Generation Routing
('nam',     'video-gen', 'wan2.6-t2v',    ARRAY['sora-2.0-turbo','veo-3.1-generate','animatediff'], 'Best quality video', true),
('eu',      'video-gen', 'wan2.6-t2v',    ARRAY['sora-2.0-turbo','veo-3.1-generate','animatediff'], 'Quality video', true),
('cjk',     'video-gen', 'wan2.6-t2v',    ARRAY['sora-2.0-turbo','animatediff'], 'Native CJK support', true),
('india',   'video-gen', 'wan2.6-t2v',    ARRAY['sora-2.0-turbo','animatediff'], 'Diverse content', true),
('latam',   'video-gen', 'wan2.6-t2v',    ARRAY['sora-2.0-turbo','animatediff'], 'Video generation', true),

-- STT Routing
('nam',     'stt', 'whisper-1',           ARRAY['paraformer','nova-3'], 'Best English STT', true),
('eu',      'stt', 'whisper-1',           ARRAY['paraformer','nova-3'], 'Multi-language STT', true),
('cjk',     'stt', 'paraformer',          ARRAY['whisper-1','nova-3'], 'Best CJK recognition', true),
('mena',    'stt', 'whisper-1',           ARRAY['paraformer','nova-3'], 'Arabic recognition', true),
('india',   'stt', 'whisper-1',           ARRAY['paraformer','nova-3'], 'Indic language STT', true),
('sea',     'stt', 'paraformer',          ARRAY['whisper-1','nova-3'], 'SEA language STT', true)

ON CONFLICT DO NOTHING;

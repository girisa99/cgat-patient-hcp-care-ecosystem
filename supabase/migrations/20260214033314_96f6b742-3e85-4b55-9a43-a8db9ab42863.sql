
-- =====================================================
-- COMPETITIVE INTELLIGENCE ENGINE - Schema Extension
-- =====================================================

-- 1. Competitor Profiles
CREATE TABLE public.competitor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  website_url TEXT,
  category TEXT NOT NULL,
  subcategories TEXT[] DEFAULT '{}'::TEXT[],
  description TEXT,
  tagline TEXT,
  pricing_model TEXT,
  pricing_range TEXT,
  key_features TEXT[] DEFAULT '{}'::TEXT[],
  weaknesses TEXT[] DEFAULT '{}'::TEXT[],
  strengths TEXT[] DEFAULT '{}'::TEXT[],
  target_market TEXT[] DEFAULT '{}'::TEXT[],
  regions_active TEXT[] DEFAULT '{}'::TEXT[],
  languages_supported INTEGER DEFAULT 0,
  last_scraped_at TIMESTAMPTZ,
  scraped_data JSONB DEFAULT '{}',
  logo_url TEXT,
  founded_year INTEGER,
  funding_status TEXT,
  estimated_users TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Feature Comparison Matrix
CREATE TABLE public.feature_comparison_matrix (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_name TEXT NOT NULL,
  feature_category TEXT NOT NULL,
  genie_product TEXT NOT NULL,
  genie_capability TEXT NOT NULL,
  genie_details TEXT,
  is_differentiator BOOLEAN NOT NULL DEFAULT false,
  competitor_scores JSONB DEFAULT '{}',
  importance_weight NUMERIC(3,2) DEFAULT 1.0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Market Analysis Results
CREATE TABLE public.market_analysis_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_type TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'global',
  scope_filter TEXT,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  detailed_analysis JSONB NOT NULL DEFAULT '{}',
  key_insights TEXT[] DEFAULT '{}'::TEXT[],
  recommendations TEXT[] DEFAULT '{}'::TEXT[],
  data_sources TEXT[] DEFAULT '{}'::TEXT[],
  confidence_score NUMERIC(3,2) DEFAULT 0.8,
  model_used TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Trend Monitoring Log
CREATE TABLE public.trend_monitoring_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trend_type TEXT NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact_level TEXT NOT NULL DEFAULT 'medium',
  affected_products TEXT[] DEFAULT '{}'::TEXT[],
  affected_competitors TEXT[] DEFAULT '{}'::TEXT[],
  raw_data JSONB DEFAULT '{}',
  action_taken TEXT,
  is_addressed BOOLEAN NOT NULL DEFAULT false,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. USP Registry
CREATE TABLE public.usp_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL,
  usp_statement TEXT NOT NULL,
  supporting_evidence TEXT[] DEFAULT '{}'::TEXT[],
  competitors_lacking TEXT[] DEFAULT '{}'::TEXT[],
  market_segment TEXT,
  strength_score NUMERIC(3,2) DEFAULT 0.8,
  is_validated BOOLEAN NOT NULL DEFAULT false,
  validated_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.competitor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_comparison_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_monitoring_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usp_registry ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can read competitor profiles" ON public.competitor_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert competitor profiles" ON public.competitor_profiles FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own competitor profiles" ON public.competitor_profiles FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "System profiles readable by anon" ON public.competitor_profiles FOR SELECT TO anon USING (created_by IS NULL);

CREATE POLICY "Authenticated users can read feature matrix" ON public.feature_comparison_matrix FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert feature matrix" ON public.feature_comparison_matrix FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update feature matrix" ON public.feature_comparison_matrix FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read analysis results" ON public.market_analysis_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert analysis results" ON public.market_analysis_results FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own analysis results" ON public.market_analysis_results FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Authenticated users can read trends" ON public.trend_monitoring_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert trends" ON public.trend_monitoring_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update trends" ON public.trend_monitoring_log FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read USPs" ON public.usp_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert USPs" ON public.usp_registry FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update USPs" ON public.usp_registry FOR UPDATE TO authenticated USING (true);

-- Indexes
CREATE INDEX idx_competitor_profiles_category ON public.competitor_profiles(category);
CREATE INDEX idx_feature_matrix_category ON public.feature_comparison_matrix(feature_category);
CREATE INDEX idx_market_analysis_type ON public.market_analysis_results(analysis_type);
CREATE INDEX idx_trend_monitoring_type ON public.trend_monitoring_log(trend_type);
CREATE INDEX idx_usp_registry_product ON public.usp_registry(product_id);

-- Seed competitor profiles
INSERT INTO public.competitor_profiles (name, website_url, category, subcategories, description, pricing_model, pricing_range, key_features, weaknesses, target_market) VALUES
('Synthesia', 'https://synthesia.io', 'ai_video', ARRAY['avatar_3d']::TEXT[], 'AI avatar video platform', 'subscription', '$29-$600/mo', ARRAY['150+ avatars', '140+ languages', 'API access']::TEXT[], ARRAY['No voice cloning', 'Limited templates', 'No healthcare compliance']::TEXT[], ARRAY['enterprise', 'education']::TEXT[]),
('HeyGen', 'https://heygen.com', 'ai_video', ARRAY['avatar_3d', 'translation']::TEXT[], 'AI video generator with avatars', 'subscription', '$24-$180/mo', ARRAY['Avatar cloning', 'Video translate', 'Streaming avatar']::TEXT[], ARRAY['No RAG/knowledge base', 'No end-to-end pipeline', 'Limited compliance']::TEXT[], ARRAY['creators', 'smb']::TEXT[]),
('Pictory', 'https://pictory.ai', 'ai_video', ARRAY['video_editing']::TEXT[], 'Text to video platform', 'subscription', '$19-$99/mo', ARRAY['Blog to video', 'Auto-captions', 'Stock footage']::TEXT[], ARRAY['No avatar', 'No 3D', 'No multi-language TTS']::TEXT[], ARRAY['creators', 'smb']::TEXT[]),
('Lumen5', 'https://lumen5.com', 'ai_video', ARRAY['video_editing']::TEXT[], 'AI video creation for marketing', 'subscription', '$19-$149/mo', ARRAY['Blog to video', 'Brand kit', 'Stock library']::TEXT[], ARRAY['No AI generation', 'No voice synthesis', 'Template-only']::TEXT[], ARRAY['smb', 'enterprise']::TEXT[]),
('Gamma', 'https://gamma.app', 'ppt', ARRAY['ai_video']::TEXT[], 'AI presentation builder', 'freemium', '$0-$20/mo', ARRAY['AI generation', 'Web-based', 'Analytics']::TEXT[], ARRAY['No video export', 'No multi-language', 'No avatar']::TEXT[], ARRAY['creators', 'smb']::TEXT[]),
('Beautiful.AI', 'https://beautiful.ai', 'ppt', '{}'::TEXT[], 'Smart presentation software', 'subscription', '$12-$50/mo', ARRAY['Smart templates', 'Team features']::TEXT[], ARRAY['No AI content gen', 'No video', 'No localization']::TEXT[], ARRAY['enterprise', 'smb']::TEXT[]),
('Canva', 'https://canva.com', 'ppt', ARRAY['video_editing', 'media_production']::TEXT[], 'All-in-one design platform', 'freemium', '$0-$30/mo', ARRAY['Huge template library', 'Brand kit', 'Video editing']::TEXT[], ARRAY['Surface-level AI', 'No knowledge base', 'No voice cloning', 'No compliance']::TEXT[], ARRAY['creators', 'smb', 'education']::TEXT[]),
('Tome', 'https://tome.app', 'ppt', '{}'::TEXT[], 'AI storytelling tool', 'freemium', '$0-$16/mo', ARRAY['AI narrative', 'Web-based']::TEXT[], ARRAY['No video output', 'Limited customization', 'No multi-modal']::TEXT[], ARRAY['creators', 'smb']::TEXT[]),
('Descript', 'https://descript.com', 'podcast', ARRAY['video_editing', 'script_editor']::TEXT[], 'AI-powered audio/video editor', 'freemium', '$0-$33/mo', ARRAY['Text-based editing', 'Overdub voice', 'Transcription']::TEXT[], ARRAY['No presentation', 'No multi-language', 'No avatar/3D']::TEXT[], ARRAY['creators', 'podcast']::TEXT[]),
('Riverside', 'https://riverside.fm', 'podcast', ARRAY['video_editing']::TEXT[], 'Remote recording studio', 'subscription', '$15-$24/mo', ARRAY['Studio quality', 'Transcription', 'Magic clips']::TEXT[], ARRAY['Recording only', 'No AI generation', 'No localization']::TEXT[], ARRAY['creators', 'podcast']::TEXT[]),
('DeepL', 'https://deepl.com', 'translation', '{}'::TEXT[], 'Machine translation', 'freemium', '$0-$50/mo', ARRAY['High quality MT', '32 languages', 'API']::TEXT[], ARRAY['Translation only', 'No transcreation', 'No audio/video']::TEXT[], ARRAY['enterprise', 'smb']::TEXT[]),
('Smartling', 'https://smartling.com', 'translation', '{}'::TEXT[], 'Enterprise translation management', 'enterprise', '$200+/mo', ARRAY['TMS', 'Neural MT', 'Workflows']::TEXT[], ARRAY['No content creation', 'Enterprise pricing', 'No video']::TEXT[], ARRAY['enterprise']::TEXT[]),
('ElevenLabs', 'https://elevenlabs.io', 'tts', ARRAY['stt']::TEXT[], 'AI voice synthesis', 'freemium', '$0-$99/mo', ARRAY['Voice cloning', '29 languages', 'Emotional TTS']::TEXT[], ARRAY['Voice only', 'No video', 'No knowledge base']::TEXT[], ARRAY['creators', 'enterprise']::TEXT[]),
('Play.ht', 'https://play.ht', 'tts', '{}'::TEXT[], 'AI voice generator', 'subscription', '$14-$99/mo', ARRAY['900+ voices', 'Voice cloning', 'API']::TEXT[], ARRAY['TTS only', 'No multi-modal', 'No compliance']::TEXT[], ARRAY['creators', 'smb']::TEXT[]),
('D-ID', 'https://d-id.com', 'avatar_3d', ARRAY['ai_video']::TEXT[], 'AI-generated video with avatars', 'freemium', '$0-$108/mo', ARRAY['Photo-to-video', 'API', 'Streaming']::TEXT[], ARRAY['Limited customization', 'No PPT', 'No knowledge base']::TEXT[], ARRAY['enterprise', 'creators']::TEXT[]),
('Meshy', 'https://meshy.ai', 'avatar_3d', '{}'::TEXT[], '3D model generation', 'freemium', '$0-$60/mo', ARRAY['Text-to-3D', 'Image-to-3D', 'PBR textures']::TEXT[], ARRAY['3D only', 'No video pipeline', 'No audio']::TEXT[], ARRAY['creators', 'gaming']::TEXT[]),
('CapCut', 'https://capcut.com', 'mobile_first', ARRAY['video_editing']::TEXT[], 'Mobile video editor by ByteDance', 'freemium', '$0-$10/mo', ARRAY['Mobile-first', 'Huge effects library', 'AI effects']::TEXT[], ARRAY['Consumer-only', 'No enterprise', 'No compliance', 'No knowledge base']::TEXT[], ARRAY['creators']::TEXT[]),
('InShot', 'https://inshot.com', 'mobile_first', ARRAY['video_editing']::TEXT[], 'Mobile video editor', 'freemium', '$0-$4/mo', ARRAY['Easy editing', 'Social presets']::TEXT[], ARRAY['Basic only', 'No AI', 'No enterprise']::TEXT[], ARRAY['creators']::TEXT[]),
('Adobe Express', 'https://express.adobe.com', 'media_production', ARRAY['video_editing', 'ppt']::TEXT[], 'Quick content creation', 'freemium', '$0-$10/mo', ARRAY['Adobe ecosystem', 'Templates', 'Brand kit']::TEXT[], ARRAY['Surface AI', 'No voice synthesis', 'No healthcare']::TEXT[], ARRAY['creators', 'smb']::TEXT[]),
('Runway', 'https://runwayml.com', 'ai_video', ARRAY['media_production']::TEXT[], 'AI creative tools', 'subscription', '$12-$76/mo', ARRAY['Gen-3 video AI', 'Motion brush', 'Advanced editing']::TEXT[], ARRAY['No TTS', 'No PPT', 'No localization', 'No knowledge base']::TEXT[], ARRAY['creators', 'enterprise']::TEXT[]);

-- Seed feature comparison matrix
INSERT INTO public.feature_comparison_matrix (feature_name, feature_category, genie_product, genie_capability, genie_details, is_differentiator, competitor_scores, importance_weight) VALUES
('End-to-End Pipeline (Knowledge to Video to Publish)', 'ai', 'Genie Suite', 'unique', 'Mind to Spark to Vibe to Arc to Cast to Deck to Publish', true, '{"synthesia":"none","heygen":"none","canva":"none","descript":"none","gamma":"none"}'::JSONB, 1.0),
('RAG-Powered Knowledge Base', 'ai', 'Genie Mind', 'full', 'Semantic search, document ingestion, AI-enhanced responses', true, '{"synthesia":"none","heygen":"none","canva":"none","gamma":"none","descript":"none"}'::JSONB, 0.95),
('Multi-Model AI Routing (30+ providers)', 'ai', 'Genie Suite', 'unique', 'Gemini, OpenAI, Claude, DeepSeek, Alibaba, HuggingFace + regional routing', true, '{"synthesia":"partial","heygen":"partial","canva":"none","runway":"none"}'::JSONB, 0.95),
('Healthcare HIPAA Compliance', 'compliance', 'Genie Suite', 'full', 'Built-in compliance for healthcare under $100/mo', true, '{"synthesia":"none","heygen":"none","canva":"none","descript":"none"}'::JSONB, 0.9),
('Voice Cloning + Multi-Language TTS (50+ languages)', 'audio', 'Genie Vibe', 'full', 'ElevenLabs, Azure, Google TTS with 140+ dialects', false, '{"elevenlabs":"full","heygen":"partial","synthesia":"partial","descript":"partial"}'::JSONB, 0.85),
('AI Transcreation (not just translation)', 'localization', 'Genie Cast', 'unique', 'Cultural adaptation, regional compliance, native-feel messaging for 62+ sub-regions', true, '{"deepl":"none","smartling":"partial","heygen":"partial","synthesia":"partial"}'::JSONB, 0.95),
('AI Agent Builder with Journey Stages', 'ai', 'Genie Studio', 'unique', 'No-code agent creation with configurable knowledge bases and actions', true, '{"synthesia":"none","heygen":"none","canva":"none"}'::JSONB, 0.9),
('3D Asset Generation', 'video', 'Genie Vibe', 'full', 'Meshy integration for text-to-3D and image-to-3D', false, '{"synthesia":"none","heygen":"none","canva":"none","runway":"partial"}'::JSONB, 0.8),
('Framework-Aware Messaging (STP+StoryBrand+AIDA+JTBD)', 'ai', 'Genie Cast', 'unique', '6 marketing frameworks auto-applied per audience segment', true, '{"canva":"none","gamma":"none","beautiful_ai":"none"}'::JSONB, 0.9),
('Label Studio RLHF Feedback Loop', 'ai', 'Genie Suite', 'unique', 'User feedback trains AI models via Label Studio integration', true, '{"synthesia":"none","heygen":"none","canva":"none","runway":"none"}'::JSONB, 0.85),
('Multi-Channel Deployment (Web, WhatsApp, API)', 'deployment', 'Genie Studio', 'full', 'Deploy agents across web chat, WhatsApp, Twilio, API', true, '{"synthesia":"none","heygen":"none"}'::JSONB, 0.85),
('Presentation + Video from Same Pipeline', 'video', 'Genie Deck + Vibe', 'unique', 'Generate PPT and video from same knowledge source', true, '{"gamma":"none","beautiful_ai":"none","canva":"partial","tome":"none"}'::JSONB, 0.9);

-- Seed USPs
INSERT INTO public.usp_registry (product_id, usp_statement, supporting_evidence, competitors_lacking, market_segment, strength_score, is_validated, validated_by) VALUES
('genie_suite', 'Only platform offering Knowledge to Script to Video to Publish in one pipeline', ARRAY['Mind extracts knowledge', 'Spark generates scripts', 'Vibe creates video', 'Cast publishes globally']::TEXT[], ARRAY['Synthesia', 'HeyGen', 'Canva', 'Descript', 'Gamma']::TEXT[], 'all', 0.95, true, 'market_data'),
('genie_suite', 'Healthcare HIPAA compliance at under $100/mo vs $600+ competitors', ARRAY['Pro plan includes compliance', 'PHI-safe agent deployment', 'Audit logging built-in']::TEXT[], ARRAY['Synthesia', 'HeyGen', 'Canva', 'Descript']::TEXT[], 'healthcare', 0.92, true, 'market_data'),
('genie_cast', 'AI Transcreation across 62+ sub-regions not just translation', ARRAY['Cultural adaptation engine', 'Regional compliance checks', 'Native-feel messaging', '140+ dialects supported']::TEXT[], ARRAY['DeepL', 'Smartling', 'HeyGen', 'Synthesia']::TEXT[], 'global', 0.93, true, 'market_data'),
('genie_suite', '30+ AI provider routing with regional optimization', ARRAY['Gemini, OpenAI, Claude, DeepSeek, Alibaba', 'Auto-fallback chains', 'Zone-based provider selection']::TEXT[], ARRAY['Synthesia', 'HeyGen', 'Canva', 'Runway']::TEXT[], 'enterprise', 0.90, true, 'market_data'),
('genie_studio', 'No-code AI agent builder with healthcare-grade compliance', ARRAY['Journey stage designer', 'Knowledge base integration', 'Multi-channel deployment', 'HIPAA audit trails']::TEXT[], ARRAY['Synthesia', 'HeyGen', 'Canva']::TEXT[], 'healthcare', 0.91, true, 'market_data'),
('genie_suite', 'RLHF feedback loop via Label Studio that learns from user preferences', ARRAY['Like/Dislike on all outputs', 'A/B preference collection', 'Confidence-gated suggestions', 'Continuous model improvement']::TEXT[], ARRAY['Synthesia', 'HeyGen', 'Canva', 'Runway', 'Gamma']::TEXT[], 'enterprise', 0.88, true, 'ai_analysis');

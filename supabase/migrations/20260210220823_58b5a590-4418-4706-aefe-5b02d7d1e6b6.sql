
-- Regional Welcome Narration Scripts
-- Stores crafted Hook → Problem → Solution → CTA scripts per region
-- Supports multiple languages per region, A/B testing, and version history

CREATE TABLE public.regional_narration_scripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Region & Language
  region_code TEXT NOT NULL,              -- 'nam', 'eu', 'latam', 'mena', 'africa', 'india', 'sea', 'cjk'
  region_display_name TEXT NOT NULL,      -- 'North America', 'Europe', etc.
  language_code TEXT NOT NULL DEFAULT 'en', -- ISO 639-1: 'en', 'es', 'ar', 'hi', 'zh', etc.
  language_display_name TEXT NOT NULL DEFAULT 'English',
  
  -- Script Sections (the narration content)
  hook TEXT NOT NULL,                     -- Opening hook (attention grabber, 1-2 sentences)
  problem_statement TEXT NOT NULL,        -- Pain point (region-specific, 2-3 sentences)
  solution TEXT NOT NULL,                 -- How Genie Suite solves it (3-4 sentences)
  cta TEXT NOT NULL,                      -- Call to action (1-2 sentences)
  full_script TEXT GENERATED ALWAYS AS (
    hook || ' ' || problem_statement || ' ' || solution || ' ' || cta
  ) STORED,                              -- Auto-concatenated full narration
  
  -- Positioning & Messaging Metadata
  positioning_angle TEXT,                 -- e.g. 'cost-efficiency', 'speed-to-market', 'localization'
  target_persona TEXT,                    -- e.g. 'Healthcare CTO', 'Startup Founder', 'Enterprise Marketing'
  emotional_tone TEXT DEFAULT 'inspiring', -- 'inspiring', 'urgent', 'empathetic', 'authoritative'
  
  -- TTS Configuration
  tts_provider TEXT DEFAULT 'azure',      -- 'azure', 'qwen3', 'elevenlabs'
  tts_voice_id TEXT,                      -- Provider-specific voice identifier
  tts_voice_name TEXT,                    -- Human-readable voice name
  tts_speed NUMERIC DEFAULT 1.0,         -- Playback speed multiplier
  tts_pitch TEXT DEFAULT 'default',       -- 'low', 'default', 'high'
  
  -- Background Music
  background_music_url TEXT,              -- URL to background music track
  background_music_volume NUMERIC DEFAULT 0.15, -- 0.0-1.0, subtle by default
  
  -- Generated Audio Cache
  generated_audio_url TEXT,               -- Cached TTS audio file URL
  audio_duration_seconds NUMERIC,         -- Duration of generated audio
  audio_generated_at TIMESTAMPTZ,         -- When audio was last generated
  
  -- Versioning & Status
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft',   -- 'draft', 'review', 'approved', 'active', 'archived'
  is_default BOOLEAN DEFAULT false,       -- One default per region+language combo
  
  -- A/B Testing
  variant_label TEXT DEFAULT 'A',         -- 'A', 'B', 'C' for A/B testing
  impression_count INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  completion_rate NUMERIC DEFAULT 0,
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('draft', 'review', 'approved', 'active', 'archived')),
  CONSTRAINT valid_region CHECK (region_code IN ('nam', 'eu', 'latam', 'mena', 'africa', 'india', 'sea', 'cjk')),
  CONSTRAINT valid_tone CHECK (emotional_tone IN ('inspiring', 'urgent', 'empathetic', 'authoritative', 'conversational')),
  CONSTRAINT valid_tts_provider CHECK (tts_provider IN ('azure', 'qwen3', 'elevenlabs'))
);

-- Indexes
CREATE INDEX idx_narration_region_lang ON public.regional_narration_scripts(region_code, language_code);
CREATE INDEX idx_narration_status ON public.regional_narration_scripts(status);
CREATE UNIQUE INDEX idx_narration_default ON public.regional_narration_scripts(region_code, language_code) WHERE is_default = true;

-- RLS
ALTER TABLE public.regional_narration_scripts ENABLE ROW LEVEL SECURITY;

-- Everyone can read active scripts (public landing pages)
CREATE POLICY "Anyone can read active narration scripts"
  ON public.regional_narration_scripts FOR SELECT
  USING (status = 'active');

-- Authenticated users can read all scripts (for admin/preview)
CREATE POLICY "Authenticated users can read all scripts"
  ON public.regional_narration_scripts FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only creators can insert
CREATE POLICY "Authenticated users can create scripts"
  ON public.regional_narration_scripts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only creators can update their own scripts
CREATE POLICY "Users can update own scripts"
  ON public.regional_narration_scripts FOR UPDATE
  USING (auth.uid() = created_by);

-- Only creators can delete draft scripts
CREATE POLICY "Users can delete own draft scripts"
  ON public.regional_narration_scripts FOR DELETE
  USING (auth.uid() = created_by AND status = 'draft');

-- Timestamp trigger
CREATE TRIGGER update_regional_narration_scripts_updated_at
  BEFORE UPDATE ON public.regional_narration_scripts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial draft scripts for all 8 regions (English, to be reviewed)

INSERT INTO public.regional_narration_scripts 
  (region_code, region_display_name, language_code, language_display_name, hook, problem_statement, solution, cta, positioning_angle, target_persona, emotional_tone, tts_provider, tts_voice_name, status, is_default, variant_label)
VALUES
  -- North America
  ('nam', 'North America', 'en', 'English',
   'What if one platform could take your idea from thought to global campaign — in minutes, not months?',
   'Today, healthcare innovators and enterprise teams juggle dozens of disconnected tools. Content creation is slow. Localization is expensive. And by the time you launch, the market has moved on.',
   'The Genie Suite changes everything. Seven AI-powered products — from Mind for intelligent content generation, to Cast for cinematic video production, to Spark for real-time presentations — all working together on one platform. Over 206 automated pipelines handle translation into 140 languages, voice synthesis, avatar creation, and multi-channel publishing. What used to take a team of twenty now takes one person and one platform.',
   'Explore the suite below. Click any product to see it in action. Your next breakthrough is one click away.',
   'speed-to-market', 'Enterprise Marketing Leader', 'inspiring', 'azure', 'en-US-JennyNeural', 'draft', true, 'A'),

  -- Europe
  ('eu', 'Europe', 'en', 'English',
   'In a continent of 24 official languages, how do you speak to every market authentically?',
   'European businesses face a unique challenge: regulatory complexity across borders, cultural nuances that make or break campaigns, and localization costs that eat into margins. Most teams compromise — launching in two or three languages and hoping for the best.',
   'The Genie Suite was built for exactly this challenge. With native support for every EU language, GDPR-compliant workflows, and cultural adaptation powered by AI, you can launch across all European markets simultaneously. From Mind''s multilingual content engine to Deck''s localized presentation builder, every product understands that Paris is not Berlin is not Madrid.',
   'Discover how each product adapts to your market. Select a product tab below to begin.',
   'localization', 'EU Market Director', 'authoritative', 'azure', 'en-GB-SoniaNeural', 'draft', true, 'A'),

  -- Latin America
  ('latam', 'Latin America', 'es', 'Spanish',
   '¿Qué pasaría si pudieras llegar a 650 millones de personas en su propio idioma, con su propia voz?',
   'Las empresas en Latinoamérica enfrentan una paradoja: un mercado enorme y conectado, pero fragmentado por dialectos, culturas y regulaciones locales. El contenido que funciona en México puede fracasar en Argentina. La traducción genérica pierde el alma del mensaje.',
   'Genie Suite entiende Latinoamérica. Desde el español mexicano hasta el portugués brasileño, desde el tono formal corporativo hasta el estilo vibrante de las redes sociales. Siete productos de IA trabajan juntos: Mind genera contenido culturalmente adaptado, Cast produce videos con voces nativas, y Arc distribuye en todas las plataformas simultáneamente. 206 pipelines automatizados, un solo equipo.',
   'Explora cada producto del suite abajo. Haz clic en cualquier pestaña para ver la magia en acción.',
   'cultural-authenticity', 'LATAM Marketing Director', 'conversational', 'azure', 'es-MX-DaliaNeural', 'draft', true, 'A'),

  -- MENA
  ('mena', 'Middle East & North Africa', 'ar', 'Arabic',
   'ماذا لو كانت منصة واحدة تفهم لهجتك، وثقافتك، ورؤيتك؟',
   'في منطقة الشرق الأوسط وشمال أفريقيا، تواجه الشركات تحدياً فريداً: سبع لهجات عربية مختلفة، محتوى يجب أن يكون من اليمين إلى اليسار، وحساسيات ثقافية تتطلب فهماً عميقاً. الأدوات العالمية لا تفهم هذا السياق.',
   'جيني سويت صُمم للمنطقة. يدعم جميع اللهجات العربية السبع، مع تصميم RTL أصلي، ومحتوى يحترم القيم الثقافية. من إنشاء المحتوى الذكي إلى إنتاج الفيديو السينمائي، سبعة منتجات ذكاء اصطناعي تعمل معاً لتحويل أفكارك إلى حملات عالمية.',
   'استكشف كل منتج أدناه. انقر على أي تبويب لتبدأ رحلتك.',
   'cultural-sensitivity', 'MENA Enterprise Leader', 'authoritative', 'azure', 'ar-SA-HamedNeural', 'draft', true, 'A'),

  -- Africa
  ('africa', 'Africa', 'en', 'English',
   'Africa''s next billion users are coming online. Are you ready to speak their language?',
   'The African market is the world''s fastest-growing digital economy, but content tools weren''t built for it. Low-bandwidth optimization is an afterthought. Local languages are unsupported. And the cost of professional content production prices out most businesses on the continent.',
   'Genie Suite is different. Built with Africa''s unique infrastructure in mind — lightweight outputs for low-bandwidth networks, support for Swahili, Yoruba, Amharic, and dozens more languages, and pricing that makes enterprise-grade AI accessible. Seven products, 206 pipelines, and the power to create professional content that resonates locally and competes globally.',
   'See the products that will transform your content strategy. Explore the tabs below.',
   'accessibility', 'African Tech Founder', 'empathetic', 'azure', 'en-NG-AbeoNeural', 'draft', true, 'A'),

  -- India
  ('india', 'India', 'en', 'English',
   'One billion people. Twenty-two official languages. One platform that speaks them all.',
   'India''s diversity is its superpower — and its biggest content challenge. A campaign that wins in Mumbai may miss in Chennai. Hindi content doesn''t reach Kerala. And building multilingual teams for every market is simply not scalable.',
   'Genie Suite embraces India''s linguistic richness. Full support for Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, and more — with culturally-aware AI that understands regional nuances. From Bollywood-quality video production with Cast, to vernacular presentations with Deck, every product is tuned for the Indian market. One platform, twenty-two languages, infinite possibilities.',
   'Dive into each product below. Your pan-India content strategy starts here.',
   'scale', 'Indian Enterprise CTO', 'inspiring', 'azure', 'en-IN-NeerjaNeural', 'draft', true, 'A'),

  -- Southeast Asia
  ('sea', 'Southeast Asia', 'en', 'English',
   'From Singapore to Manila, from Bangkok to Jakarta — what if your content could travel as fast as your ambition?',
   'Southeast Asia is the world''s most exciting digital market, but also one of the most fragmented. Six major languages, vastly different cultural norms, and audiences that expect mobile-first, visually rich content. Most global platforms treat SEA as an afterthought.',
   'Not Genie Suite. Purpose-built for the region''s unique demands — Thai, Vietnamese, Bahasa Indonesia, Filipino, Malay, and Burmese language support, mobile-optimized outputs, and visual-first content strategies. Seven AI products working in harmony: Mind thinks in your language, Vibe designs for your audience, and Cast produces video your market will share.',
   'Explore the complete suite below. Tap any product to see what''s possible.',
   'mobile-first', 'SEA Digital Director', 'conversational', 'azure', 'en-SG-LunaNeural', 'draft', true, 'A'),

  -- CJK (China, Japan, Korea)
  ('cjk', 'China, Japan & Korea', 'en', 'English',
   'In the world''s most sophisticated digital markets, good enough is never enough.',
   'CJK markets demand perfection. Japanese audiences expect pitch-perfect keigo. Korean consumers want culturally native content, not translations. And the Chinese market requires not just language support, but deep platform integration with WeChat, Douyin, and Xiaohongshu. Western tools simply cannot deliver this level of sophistication.',
   'Genie Suite rises to the standard. With Qwen3-TTS for native tonal fidelity in Mandarin, Japanese, and Korean, platform-specific content formatting, and cultural intelligence built into every pipeline. From Mind''s kaizen-inspired content refinement to Cast''s anime-quality visual production, this is AI that understands excellence.',
   'Discover each product below. Experience the precision your market demands.',
   'quality-perfection', 'CJK Market Strategist', 'authoritative', 'qwen3', 'qwen3-zh-default', 'draft', true, 'A');

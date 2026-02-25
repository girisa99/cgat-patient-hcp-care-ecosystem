-- ============================================================================
-- COMPREHENSIVE PRODUCTION EXPANSION — Phase 7
--
-- This migration expands the ENTIRE cast production infrastructure:
--   1. Languages: 37 → 85+ covering all 16 regions and 62 subregions
--   2. Content Categories: 24 → 40+ industries
--   3. Characters: Expand for all style groups × all regions
--   4. Production Capabilities: Unified provider routing table
--   5. Output Presets: Ensure encoding configs are populated
--   6. Capability → Provider routing map (new table)
--   7. Style → Character regional coverage
--
-- Date: 2026-02-25
-- ============================================================================

-- ============================================================================
-- 1. LANGUAGES TABLE (new) — 85+ languages across all regions
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.cast_languages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,                -- ISO 639-1 or extended code (e.g. 'en', 'hi', 'zh-CN')
  name TEXT NOT NULL,                       -- English name
  native_name TEXT NOT NULL,                -- Native script name
  flag TEXT DEFAULT '',                     -- Emoji flag
  region_code TEXT NOT NULL,                -- Maps to REGION_HIERARCHY groupCode (e.g. 'NAM', 'INDIA', 'CJK')
  subregion_code TEXT,                      -- Maps to REGION_HIERARCHY child code (e.g. 'INDIA_SOUTH_TA')
  script_direction TEXT DEFAULT 'ltr' CHECK (script_direction IN ('ltr', 'rtl')),
  tts_provider_primary TEXT,               -- Primary TTS provider for this language
  tts_provider_fallback TEXT,              -- Fallback TTS provider
  tts_voice_id_male TEXT,                  -- Default male voice ID
  tts_voice_id_female TEXT,                -- Default female voice ID
  deepl_supported BOOLEAN DEFAULT false,   -- Whether DeepL supports this language
  google_translate_supported BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cast_languages_region ON public.cast_languages(region_code);
CREATE INDEX IF NOT EXISTS idx_cast_languages_code ON public.cast_languages(code);

ALTER TABLE public.cast_languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read cast_languages" ON public.cast_languages FOR SELECT USING (true);

-- Seed 85+ languages across all 16 regions and 62 subregions
INSERT INTO public.cast_languages (code, name, native_name, flag, region_code, subregion_code, script_direction, tts_provider_primary, tts_provider_fallback, deepl_supported, sort_order) VALUES
  -- NAM (North America) — 3 languages
  ('en-US', 'English (US)', 'English', '🇺🇸', 'NAM', 'NAM_US', 'ltr', 'elevenlabs', 'azure', true, 1),
  ('en-CA', 'English (Canada)', 'English', '🇨🇦', 'NAM', 'NAM_CA', 'ltr', 'elevenlabs', 'azure', true, 2),
  ('fr-CA', 'French (Canada)', 'Français canadien', '🇨🇦', 'NAM', 'NAM_CA', 'ltr', 'azure', 'google', true, 3),

  -- EU (Europe) — 20 languages
  ('en-GB', 'English (UK)', 'English', '🇬🇧', 'EU', 'EU_WEST', 'ltr', 'elevenlabs', 'azure', true, 10),
  ('de-DE', 'German', 'Deutsch', '🇩🇪', 'EU', 'EU_DE', 'ltr', 'azure', 'elevenlabs', true, 11),
  ('de-AT', 'German (Austria)', 'Deutsch (Österreich)', '🇦🇹', 'EU', 'EU_AT', 'ltr', 'azure', 'google', true, 12),
  ('de-CH', 'German (Switzerland)', 'Schweizerdeutsch', '🇨🇭', 'EU', 'EU_CH', 'ltr', 'azure', 'google', true, 13),
  ('fr-FR', 'French', 'Français', '🇫🇷', 'EU', 'EU_FR', 'ltr', 'azure', 'elevenlabs', true, 14),
  ('fr-BE', 'French (Belgium)', 'Français (Belgique)', '🇧🇪', 'EU', 'EU_BE_FR', 'ltr', 'azure', 'google', true, 15),
  ('nl-NL', 'Dutch', 'Nederlands', '🇳🇱', 'EU', 'EU_NL', 'ltr', 'azure', 'google', true, 16),
  ('nl-BE', 'Dutch (Belgium)', 'Vlaams', '🇧🇪', 'EU', 'EU_BE_NL', 'ltr', 'azure', 'google', true, 17),
  ('es-ES', 'Spanish (Spain)', 'Español', '🇪🇸', 'EU', 'EU_ES', 'ltr', 'azure', 'elevenlabs', true, 18),
  ('pt-PT', 'Portuguese (Portugal)', 'Português', '🇵🇹', 'EU', 'EU_PT', 'ltr', 'azure', 'google', true, 19),
  ('it-IT', 'Italian', 'Italiano', '🇮🇹', 'EU', 'EU_ITALY', 'ltr', 'azure', 'elevenlabs', true, 20),
  ('sv-SE', 'Swedish', 'Svenska', '🇸🇪', 'EU', 'EU_SE', 'ltr', 'azure', 'google', true, 21),
  ('nb-NO', 'Norwegian', 'Norsk', '🇳🇴', 'EU', 'EU_NO', 'ltr', 'azure', 'google', true, 22),
  ('da-DK', 'Danish', 'Dansk', '🇩🇰', 'EU', 'EU_DK', 'ltr', 'azure', 'google', true, 23),
  ('fi-FI', 'Finnish', 'Suomi', '🇫🇮', 'EU', 'EU_FI', 'ltr', 'azure', 'google', true, 24),
  ('pl-PL', 'Polish', 'Polski', '🇵🇱', 'EU', 'EU_PL', 'ltr', 'azure', 'google', true, 25),
  ('cs-CZ', 'Czech', 'Čeština', '🇨🇿', 'EU', 'EU_CZ', 'ltr', 'azure', 'google', true, 26),
  ('ro-RO', 'Romanian', 'Română', '🇷🇴', 'EU', 'EU_RO', 'ltr', 'azure', 'google', true, 27),
  ('hu-HU', 'Hungarian', 'Magyar', '🇭🇺', 'EU', 'EU_HU', 'ltr', 'azure', 'google', true, 28),
  ('el-GR', 'Greek', 'Ελληνικά', '🇬🇷', 'EU', 'EU_GR', 'ltr', 'azure', 'google', true, 29),
  ('bg-BG', 'Bulgarian', 'Български', '🇧🇬', 'EU', 'EU_BG', 'ltr', 'azure', 'google', true, 30),
  ('sk-SK', 'Slovak', 'Slovenčina', '🇸🇰', 'EU', 'EU_SK', 'ltr', 'azure', 'google', true, 31),

  -- EURASIA (Eastern Europe & Caucasus) — 4 languages
  ('uk-UA', 'Ukrainian', 'Українська', '🇺🇦', 'EURASIA', 'EU_UKRAINE', 'ltr', 'azure', 'google', true, 32),
  ('sr-RS', 'Serbian', 'Српски', '🇷🇸', 'EURASIA', 'EU_BALKANS', 'ltr', 'azure', 'google', false, 33),
  ('hr-HR', 'Croatian', 'Hrvatski', '🇭🇷', 'EURASIA', 'EU_BALKANS', 'ltr', 'azure', 'google', false, 34),
  ('ka-GE', 'Georgian', 'ქართული', '🇬🇪', 'EURASIA', 'EU_CAUCASUS', 'ltr', 'google', 'azure', false, 35),

  -- TURKEY — 1 language
  ('tr-TR', 'Turkish', 'Türkçe', '🇹🇷', 'TURKEY', 'TURKEY', 'ltr', 'azure', 'google', true, 36),

  -- MENA (Middle East & North Africa) — 6 languages
  ('ar-AE', 'Arabic (Gulf)', 'العربية (خليجي)', '🇦🇪', 'MENA', 'MENA_GULF', 'rtl', 'azure', 'google', true, 40),
  ('ar-EG', 'Arabic (Egyptian)', 'العربية (مصري)', '🇪🇬', 'MENA', 'MENA_EGYPT', 'rtl', 'azure', 'google', true, 41),
  ('ar-LB', 'Arabic (Levantine)', 'العربية (شامي)', '🇱🇧', 'MENA', 'MENA_LEVANT', 'rtl', 'azure', 'google', false, 42),
  ('ar-MA', 'Arabic (Maghrebi)', 'العربية (مغربي)', '🇲🇦', 'MENA', 'MENA_MAGHREB', 'rtl', 'azure', 'google', false, 43),
  ('ar', 'Arabic (MSA)', 'العربية الفصحى', '🕌', 'MENA', 'MENA_MSA', 'rtl', 'azure', 'google', true, 44),
  ('he-IL', 'Hebrew', 'עברית', '🇮🇱', 'MENA', 'MENA_ISRAEL', 'rtl', 'azure', 'google', false, 45),
  ('fa-IR', 'Persian (Farsi)', 'فارسی', '🇮🇷', 'MENA', 'MENA_LEVANT', 'rtl', 'azure', 'google', false, 46),

  -- AFRICA — 6 languages
  ('en-NG', 'English (Nigeria)', 'English', '🇳🇬', 'AFRICA', 'AFRICA_WEST', 'ltr', 'azure', 'google', true, 50),
  ('yo-NG', 'Yoruba', 'Yorùbá', '🇳🇬', 'AFRICA', 'AFRICA_WEST', 'ltr', 'google', 'azure', false, 51),
  ('sw-KE', 'Swahili', 'Kiswahili', '🇰🇪', 'AFRICA', 'AFRICA_EAST', 'ltr', 'google', 'azure', false, 52),
  ('am-ET', 'Amharic', 'አማርኛ', '🇪🇹', 'AFRICA', 'AFRICA_EAST', 'ltr', 'google', 'azure', false, 53),
  ('zu-ZA', 'Zulu', 'isiZulu', '🇿🇦', 'AFRICA', 'AFRICA_SOUTH', 'ltr', 'google', 'azure', false, 54),
  ('fr-SN', 'French (West Africa)', 'Français (Afrique)', '🇸🇳', 'AFRICA', 'AFRICA_FRANCO', 'ltr', 'azure', 'google', true, 55),

  -- INDIA — 12 languages
  ('hi-IN', 'Hindi', 'हिन्दी', '🇮🇳', 'INDIA', 'INDIA_NORTH_HI', 'ltr', 'azure', 'google', false, 60),
  ('ur-IN', 'Urdu (India)', 'اردو', '🇮🇳', 'INDIA', 'INDIA_NORTH_UR', 'rtl', 'azure', 'google', false, 61),
  ('pa-IN', 'Punjabi', 'ਪੰਜਾਬੀ', '🇮🇳', 'INDIA', 'INDIA_NORTH_PA', 'ltr', 'google', 'azure', false, 62),
  ('ta-IN', 'Tamil', 'தமிழ்', '🇮🇳', 'INDIA', 'INDIA_SOUTH_TA', 'ltr', 'azure', 'google', false, 63),
  ('te-IN', 'Telugu', 'తెలుగు', '🇮🇳', 'INDIA', 'INDIA_SOUTH_TE', 'ltr', 'azure', 'google', false, 64),
  ('kn-IN', 'Kannada', 'ಕನ್ನಡ', '🇮🇳', 'INDIA', 'INDIA_SOUTH_KN', 'ltr', 'azure', 'google', false, 65),
  ('ml-IN', 'Malayalam', 'മലയാളം', '🇮🇳', 'INDIA', 'INDIA_SOUTH_ML', 'ltr', 'azure', 'google', false, 66),
  ('mr-IN', 'Marathi', 'मराठी', '🇮🇳', 'INDIA', 'INDIA_WEST_MR', 'ltr', 'azure', 'google', false, 67),
  ('gu-IN', 'Gujarati', 'ગુજરાતી', '🇮🇳', 'INDIA', 'INDIA_WEST_GU', 'ltr', 'azure', 'google', false, 68),
  ('bn-IN', 'Bengali (India)', 'বাংলা', '🇮🇳', 'INDIA', 'INDIA_EAST_BN', 'ltr', 'azure', 'google', false, 69),
  ('or-IN', 'Odia', 'ଓଡ଼ିଆ', '🇮🇳', 'INDIA', 'INDIA_EAST_OR', 'ltr', 'google', 'azure', false, 70),
  ('en-IN', 'English (India)', 'English', '🇮🇳', 'INDIA', 'INDIA_PAN', 'ltr', 'azure', 'elevenlabs', true, 71),

  -- PAKISTAN — 3 languages
  ('ur-PK', 'Urdu (Pakistan)', 'اردو', '🇵🇰', 'PAKISTAN', 'PAKISTAN', 'rtl', 'azure', 'google', false, 72),
  ('pa-PK', 'Punjabi (Pakistan)', 'پنجابی', '🇵🇰', 'PAKISTAN', 'PAKISTAN', 'rtl', 'google', 'azure', false, 73),
  ('ps-AF', 'Pashto', 'پښتو', '🇵🇰', 'PAKISTAN', 'PAKISTAN', 'rtl', 'google', 'azure', false, 74),

  -- BANGLADESH — 1 language
  ('bn-BD', 'Bengali (Bangladesh)', 'বাংলা', '🇧🇩', 'BANGLADESH', 'BANGLADESH', 'ltr', 'azure', 'google', false, 75),

  -- SOUTH ASIA — 3 languages
  ('ne-NP', 'Nepali', 'नेपाली', '🇳🇵', 'SOUTH_ASIA', 'SA_NEPAL', 'ltr', 'google', 'azure', false, 76),
  ('si-LK', 'Sinhala', 'සිංහල', '🇱🇰', 'SOUTH_ASIA', 'SA_SRILANKA', 'ltr', 'google', 'azure', false, 77),
  ('dv-MV', 'Dhivehi', 'ދިވެހި', '🇲🇻', 'SOUTH_ASIA', 'SA_MALDIVES', 'rtl', 'google', 'azure', false, 78),

  -- SEA (Southeast Asia) — 6 languages
  ('ms-MY', 'Malay', 'Bahasa Melayu', '🇲🇾', 'SEA', 'SEA_MALAY', 'ltr', 'azure', 'google', false, 80),
  ('id-ID', 'Indonesian', 'Bahasa Indonesia', '🇮🇩', 'SEA', 'SEA_MALAY', 'ltr', 'azure', 'google', true, 81),
  ('th-TH', 'Thai', 'ไทย', '🇹🇭', 'SEA', 'SEA_THAI', 'ltr', 'azure', 'google', false, 82),
  ('vi-VN', 'Vietnamese', 'Tiếng Việt', '🇻🇳', 'SEA', 'SEA_VIET', 'ltr', 'azure', 'google', false, 83),
  ('tl-PH', 'Filipino (Tagalog)', 'Filipino', '🇵🇭', 'SEA', 'SEA_PHIL', 'ltr', 'google', 'azure', false, 84),
  ('en-SG', 'English (Singapore)', 'English', '🇸🇬', 'SEA', 'SEA_PAN', 'ltr', 'azure', 'elevenlabs', true, 85),

  -- CJK (China, Japan, Korea) — 5 languages
  ('zh-CN', 'Chinese (Simplified)', '简体中文', '🇨🇳', 'CJK', 'CJK_CN', 'ltr', 'alibaba', 'azure', true, 90),
  ('zh-HK', 'Cantonese', '粵語', '🇭🇰', 'CJK', 'CJK_CN', 'ltr', 'alibaba', 'azure', false, 91),
  ('zh-TW', 'Chinese (Traditional)', '繁體中文', '🇹🇼', 'CJK', 'CJK_TW', 'ltr', 'azure', 'google', true, 92),
  ('ja-JP', 'Japanese', '日本語', '🇯🇵', 'CJK', 'CJK_JP', 'ltr', 'azure', 'google', true, 93),
  ('ko-KR', 'Korean', '한국어', '🇰🇷', 'CJK', 'CJK_KR', 'ltr', 'azure', 'google', true, 94),

  -- LATAM (Latin America) — 5 languages
  ('pt-BR', 'Portuguese (Brazil)', 'Português brasileiro', '🇧🇷', 'LATAM', 'LATAM_BRAZIL', 'ltr', 'azure', 'elevenlabs', true, 100),
  ('es-MX', 'Spanish (Mexico)', 'Español mexicano', '🇲🇽', 'LATAM', 'LATAM_MEXICO', 'ltr', 'azure', 'elevenlabs', true, 101),
  ('es-CO', 'Spanish (Colombia)', 'Español colombiano', '🇨🇴', 'LATAM', 'LATAM_ANDEAN', 'ltr', 'azure', 'google', true, 102),
  ('es-AR', 'Spanish (Argentina)', 'Español rioplatense', '🇦🇷', 'LATAM', 'LATAM_CONESUR', 'ltr', 'azure', 'google', true, 103),
  ('es-DO', 'Spanish (Caribbean)', 'Español caribeño', '🇩🇴', 'LATAM', 'LATAM_CARIB', 'ltr', 'azure', 'google', true, 104),

  -- CARIBBEAN — 2 languages
  ('en-JM', 'English (Jamaica)', 'English', '🇯🇲', 'CARIBBEAN', 'CARIBBEAN_EN', 'ltr', 'azure', 'google', true, 105),
  ('ht-HT', 'Haitian Creole', 'Kreyòl ayisyen', '🇭🇹', 'CARIBBEAN', 'CARIBBEAN_FR', 'ltr', 'google', 'azure', false, 106),

  -- OCEANIA — 2 languages
  ('en-AU', 'English (Australia)', 'English', '🇦🇺', 'OCEANIA', 'OCEANIA_AU', 'ltr', 'elevenlabs', 'azure', true, 110),
  ('en-NZ', 'English (NZ)', 'English', '🇳🇿', 'OCEANIA', 'OCEANIA_NZ', 'ltr', 'azure', 'elevenlabs', true, 111),

  -- CENTRAL ASIA — 3 languages
  ('kk-KZ', 'Kazakh', 'Қазақша', '🇰🇿', 'CENTRAL_ASIA', 'ASIA_CENTRAL_KZ', 'ltr', 'google', 'azure', false, 115),
  ('uz-UZ', 'Uzbek', 'Oʻzbek', '🇺🇿', 'CENTRAL_ASIA', 'ASIA_CENTRAL_UZ', 'ltr', 'google', 'azure', false, 116),
  ('az-AZ', 'Azerbaijani', 'Azərbaycan', '🇦🇿', 'CENTRAL_ASIA', 'ASIA_CENTRAL_AZ', 'ltr', 'google', 'azure', false, 117),

  -- GLOBAL — Russian (spans multiple regions)
  ('ru-RU', 'Russian', 'Русский', '🇷🇺', 'EURASIA', 'EU_BALKANS', 'ltr', 'azure', 'google', true, 120),
  -- Armenian
  ('hy-AM', 'Armenian', 'Հայերեն', '🇦🇲', 'EURASIA', 'EU_CAUCASUS', 'ltr', 'google', 'azure', false, 121),
  -- Myanmar
  ('my-MM', 'Burmese', 'မြန်မာဘာသာ', '🇲🇲', 'SEA', 'SEA_THAI', 'ltr', 'google', 'azure', false, 122),
  -- Khmer
  ('km-KH', 'Khmer', 'ខ្មែរ', '🇰🇭', 'SEA', 'SEA_THAI', 'ltr', 'google', 'azure', false, 123),
  -- Lao
  ('lo-LA', 'Lao', 'ລາວ', '🇱🇦', 'SEA', 'SEA_THAI', 'ltr', 'google', 'azure', false, 124)

ON CONFLICT (code) DO NOTHING;


-- ============================================================================
-- 2. EXPAND CONTENT CATEGORIES (24 → 40+)
-- ============================================================================

INSERT INTO public.cast_content_categories (name, label, description, icon, color, sort_order) VALUES
  ('agriculture', 'Agriculture & Farming', 'Agricultural industry and farming content', 'Wheat', 'text-green-700', 21),
  ('construction', 'Construction & Infrastructure', 'Construction and building industry content', 'HardHat', 'text-yellow-700', 22),
  ('energy_renewables', 'Energy & Renewables', 'Renewable energy and sustainability content', 'Zap', 'text-emerald-500', 23),
  ('sports_fitness', 'Sports & Fitness', 'Sports, athletics, and fitness content', 'Dumbbell', 'text-red-500', 24),
  ('beauty_cosmetics', 'Beauty & Cosmetics', 'Beauty, cosmetics, and personal care content', 'Sparkles', 'text-pink-400', 25),
  ('fashion_apparel', 'Fashion & Apparel', 'Fashion, clothing, and accessories content', 'Shirt', 'text-purple-500', 26),
  ('gaming_esports', 'Gaming & Esports', 'Video gaming and esports industry content', 'Gamepad2', 'text-indigo-500', 27),
  ('music_arts', 'Music & Performing Arts', 'Music, theater, and performing arts content', 'Music', 'text-violet-600', 28),
  ('pharma_biotech', 'Pharma & Biotech', 'Pharmaceutical and biotechnology content', 'Pill', 'text-cyan-600', 29),
  ('aerospace_defense', 'Aerospace & Defense', 'Aerospace, aviation, and defense content', 'Rocket', 'text-slate-600', 30),
  ('mining_metals', 'Mining & Metals', 'Mining and metals industry content', 'Pickaxe', 'text-stone-600', 31),
  ('retail_ecommerce', 'Retail & E-Commerce', 'Retail, shopping, and e-commerce content', 'ShoppingCart', 'text-orange-500', 32),
  ('hospitality_hotels', 'Hotels & Resorts', 'Hotel and resort hospitality content', 'Hotel', 'text-amber-600', 33),
  ('environmental', 'Environmental & Climate', 'Environmental sustainability and climate content', 'Leaf', 'text-green-600', 34),
  ('cybersecurity', 'Cybersecurity', 'Information security and cyber defense content', 'ShieldCheck', 'text-red-700', 35),
  ('ai_ml', 'AI & Machine Learning', 'Artificial intelligence and ML content', 'Brain', 'text-purple-700', 36),
  ('pet_care', 'Pet Care & Veterinary', 'Pet care and veterinary services content', 'Dog', 'text-amber-500', 37),
  ('wellness_spa', 'Wellness & Spa', 'Wellness, spa, and holistic health content', 'Flower2', 'text-teal-500', 38)
ON CONFLICT (name) DO NOTHING;

-- Link all new categories to all formats
INSERT INTO public.cast_category_formats (category_id, format_id, is_active)
SELECT c.id, f.id, true
FROM public.cast_content_categories c
CROSS JOIN public.cast_content_formats f
WHERE c.is_active = true AND f.is_active = true
ON CONFLICT (category_id, format_id) DO NOTHING;


-- ============================================================================
-- 3. PRODUCTION CAPABILITY PROVIDER MAP (unified routing)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.cast_production_capability_provider_map (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  capability_id UUID NOT NULL REFERENCES public.cast_production_capabilities(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,              -- e.g. 'elevenlabs', 'alibaba-wan2.2', 'meshy-3d'
  provider_type TEXT NOT NULL DEFAULT 'primary' CHECK (provider_type IN ('primary', 'fallback', 'regional')),
  edge_function TEXT NOT NULL,              -- e.g. 'elevenlabs-voice', 'alibaba-avatar-generator'
  region_codes TEXT[] DEFAULT '{}',         -- Empty = global, otherwise region-specific
  priority INTEGER DEFAULT 1,              -- Lower = higher priority
  cost_per_unit NUMERIC(10,4) DEFAULT 0,   -- Cost tracking
  max_concurrent INTEGER DEFAULT 10,       -- Rate limiting
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',               -- Provider-specific config
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(capability_id, provider_name, provider_type)
);

CREATE INDEX IF NOT EXISTS idx_cap_provider_map_capability ON public.cast_production_capability_provider_map(capability_id);
CREATE INDEX IF NOT EXISTS idx_cap_provider_map_active ON public.cast_production_capability_provider_map(is_active) WHERE is_active = true;

ALTER TABLE public.cast_production_capability_provider_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read capability provider map" ON public.cast_production_capability_provider_map FOR SELECT USING (true);
CREATE POLICY "Admins can manage capability provider map"
  ON public.cast_production_capability_provider_map FOR ALL
  USING (public.has_genie_studio_role(auth.uid(), 'super_admin') OR public.has_genie_studio_role(auth.uid(), 'content_manager'));

-- Populate provider routing for ALL 26 capabilities
-- Voice capabilities
INSERT INTO public.cast_production_capability_provider_map (capability_id, provider_name, provider_type, edge_function, priority, config) VALUES
  -- scene_voiceover
  ((SELECT id FROM cast_production_capabilities WHERE name='scene_voiceover'), 'elevenlabs', 'primary', 'elevenlabs-voice', 1, '{"model":"eleven_multilingual_v2"}'),
  ((SELECT id FROM cast_production_capabilities WHERE name='scene_voiceover'), 'azure', 'fallback', 'azure-tts', 2, '{"voice_style":"narration"}'),
  ((SELECT id FROM cast_production_capabilities WHERE name='scene_voiceover'), 'google', 'fallback', 'google-tts', 3, '{}'),
  ((SELECT id FROM cast_production_capabilities WHERE name='scene_voiceover'), 'alibaba', 'regional', 'multi-provider-tts', 4, '{"regions":["CJK"]}'),
  -- slide_voiceover
  ((SELECT id FROM cast_production_capabilities WHERE name='slide_voiceover'), 'elevenlabs', 'primary', 'elevenlabs-voice', 1, '{"model":"eleven_multilingual_v2","style":"presentation"}'),
  ((SELECT id FROM cast_production_capabilities WHERE name='slide_voiceover'), 'azure', 'fallback', 'azure-tts', 2, '{}'),
  -- full_voiceover
  ((SELECT id FROM cast_production_capabilities WHERE name='full_voiceover'), 'elevenlabs', 'primary', 'elevenlabs-voice', 1, '{"model":"eleven_multilingual_v2","style":"audiobook"}'),
  ((SELECT id FROM cast_production_capabilities WHERE name='full_voiceover'), 'azure', 'fallback', 'azure-tts', 2, '{}'),
  -- dubbing
  ((SELECT id FROM cast_production_capabilities WHERE name='dubbing'), 'elevenlabs', 'primary', 'elevenlabs-voice', 1, '{"mode":"dubbing","preserve_emotion":true}'),
  ((SELECT id FROM cast_production_capabilities WHERE name='dubbing'), 'azure', 'fallback', 'azure-tts', 2, '{"mode":"dubbing"}'),
  -- voice_clone
  ((SELECT id FROM cast_production_capabilities WHERE name='voice_clone'), 'elevenlabs', 'primary', 'elevenlabs-voice', 1, '{"mode":"voice_clone","api":"voice-lab"}'),
  ((SELECT id FROM cast_production_capabilities WHERE name='voice_clone'), 'azure', 'fallback', 'azure-tts', 2, '{"mode":"custom_neural_voice"}')
ON CONFLICT (capability_id, provider_name, provider_type) DO NOTHING;

-- Avatar capabilities
INSERT INTO public.cast_production_capability_provider_map (capability_id, provider_name, provider_type, edge_function, priority, config) VALUES
  -- lip_sync
  ((SELECT id FROM cast_production_capabilities WHERE name='lip_sync'), 'alibaba-wan2.2', 'primary', 'alibaba-avatar-generator', 1, '{"mode":"lip_sync"}'),
  ((SELECT id FROM cast_production_capabilities WHERE name='lip_sync'), 'vertex-lip-sync', 'fallback', 'ai-universal-processor', 2, '{"action":"lip_sync"}'),
  -- avatar_talking_head
  ((SELECT id FROM cast_production_capabilities WHERE name='avatar_talking_head'), 'alibaba-wan2.2', 'primary', 'alibaba-avatar-generator', 1, '{"mode":"talking_head"}'),
  ((SELECT id FROM cast_production_capabilities WHERE name='avatar_talking_head'), 'meshy-3d', 'fallback', 'ai-universal-processor', 2, '{"action":"avatar_generate"}'),
  -- avatar_full_body
  ((SELECT id FROM cast_production_capabilities WHERE name='avatar_full_body'), 'alibaba-wan2.2', 'primary', 'alibaba-avatar-generator', 1, '{"mode":"full_body"}'),
  ((SELECT id FROM cast_production_capabilities WHERE name='avatar_full_body'), 'meshy-3d', 'fallback', 'ai-universal-processor', 2, '{"action":"avatar_full_body"}')
ON CONFLICT (capability_id, provider_name, provider_type) DO NOTHING;

-- Visual capabilities
INSERT INTO public.cast_production_capability_provider_map (capability_id, provider_name, provider_type, edge_function, priority, config) VALUES
  -- text_to_video
  ((SELECT id FROM cast_production_capabilities WHERE name='text_to_video'), 'vertex-veo', 'primary', 'ai-video-generator', 1, '{}'),
  ((SELECT id FROM cast_production_capabilities WHERE name='text_to_video'), 'alibaba-wan', 'fallback', 'alibaba-video-generator', 2, '{}'),
  ((SELECT id FROM cast_production_capabilities WHERE name='text_to_video'), 'gemini', 'fallback', 'gemini-generate-video', 3, '{}'),
  -- text_to_image
  ((SELECT id FROM cast_production_capabilities WHERE name='text_to_image'), 'gemini', 'primary', 'gemini-generate-image', 1, '{}'),
  ((SELECT id FROM cast_production_capabilities WHERE name='text_to_image'), 'dall-e', 'fallback', 'ai-image-generator', 2, '{"provider":"openai"}'),
  ((SELECT id FROM cast_production_capabilities WHERE name='text_to_image'), 'stability-ai', 'fallback', 'ai-image-generator', 3, '{"provider":"stability"}'),
  -- image_to_image
  ((SELECT id FROM cast_production_capabilities WHERE name='image_to_image'), 'stability-ai', 'primary', 'ai-image-generator', 1, '{"mode":"img2img"}'),
  ((SELECT id FROM cast_production_capabilities WHERE name='image_to_image'), 'dall-e', 'fallback', 'ai-image-generator', 2, '{"mode":"edit"}'),
  -- diff_animate
  ((SELECT id FROM cast_production_capabilities WHERE name='diff_animate'), 'alibaba-wan', 'primary', 'alibaba-video-generator', 1, '{"mode":"animate"}'),
  ((SELECT id FROM cast_production_capabilities WHERE name='diff_animate'), 'replicate', 'fallback', 'ai-universal-processor', 2, '{"action":"animate"}'),
  -- pixar_3d
  ((SELECT id FROM cast_production_capabilities WHERE name='pixar_3d'), 'meshy-3d', 'primary', 'alibaba-3d-generator', 1, '{"style":"pixar"}'),
  ((SELECT id FROM cast_production_capabilities WHERE name='pixar_3d'), 'tripo3d', 'fallback', 'ai-universal-processor', 2, '{"action":"3d_generate"}'),
  -- cartoon_animation
  ((SELECT id FROM cast_production_capabilities WHERE name='cartoon_animation'), 'alibaba-wan', 'primary', 'alibaba-video-generator', 1, '{"style":"cartoon"}'),
  ((SELECT id FROM cast_production_capabilities WHERE name='cartoon_animation'), 'modelslab', 'fallback', 'ai-universal-processor', 2, '{"action":"cartoon_animate"}'),
  -- style_transfer
  ((SELECT id FROM cast_production_capabilities WHERE name='style_transfer'), 'stability-ai', 'primary', 'ai-image-generator', 1, '{"mode":"style_transfer"}'),
  ((SELECT id FROM cast_production_capabilities WHERE name='style_transfer'), 'dall-e', 'fallback', 'ai-image-generator', 2, '{"mode":"style_transfer"}'),
  -- 3d_scene_gen
  ((SELECT id FROM cast_production_capabilities WHERE name='3d_scene_gen'), 'meshy-3d', 'primary', 'alibaba-3d-generator', 1, '{"mode":"scene"}'),
  ((SELECT id FROM cast_production_capabilities WHERE name='3d_scene_gen'), 'tripo3d', 'fallback', 'ai-universal-processor', 2, '{"action":"3d_scene"}'),
  -- ar_filters
  ((SELECT id FROM cast_production_capabilities WHERE name='ar_filters'), 'vertex-ar', 'primary', 'ai-universal-processor', 1, '{"action":"ar_filter"}'),
  -- multi_camera
  ((SELECT id FROM cast_production_capabilities WHERE name='multi_camera'), 'json2video', 'primary', 'ai-universal-processor', 1, '{"action":"multi_camera"}'),
  -- green_screen
  ((SELECT id FROM cast_production_capabilities WHERE name='green_screen'), 'stability-ai', 'primary', 'ai-image-generator', 1, '{"mode":"remove_background"}'),
  ((SELECT id FROM cast_production_capabilities WHERE name='green_screen'), 'replicate', 'fallback', 'ai-universal-processor', 2, '{"action":"green_screen"}')
ON CONFLICT (capability_id, provider_name, provider_type) DO NOTHING;

-- Audio capabilities
INSERT INTO public.cast_production_capability_provider_map (capability_id, provider_name, provider_type, edge_function, priority, config) VALUES
  -- music_sfx_gen
  ((SELECT id FROM cast_production_capabilities WHERE name='music_sfx_gen'), 'elevenlabs-music', 'primary', 'elevenlabs-music', 1, '{}'),
  ((SELECT id FROM cast_production_capabilities WHERE name='music_sfx_gen'), 'elevenlabs-sfx', 'primary', 'elevenlabs-sfx', 1, '{"type":"sfx"}'),
  ((SELECT id FROM cast_production_capabilities WHERE name='music_sfx_gen'), 'multi-provider', 'fallback', 'multi-provider-music', 2, '{}')
ON CONFLICT (capability_id, provider_name, provider_type) DO NOTHING;

-- Formatting capabilities
INSERT INTO public.cast_production_capability_provider_map (capability_id, provider_name, provider_type, edge_function, priority, config) VALUES
  -- subtitle_burn
  ((SELECT id FROM cast_production_capabilities WHERE name='subtitle_burn'), 'json2video', 'primary', 'ai-caption-generator', 1, '{"mode":"burn_in"}'),
  ((SELECT id FROM cast_production_capabilities WHERE name='subtitle_burn'), 'ffmpeg', 'fallback', 'ai-universal-processor', 2, '{"action":"burn_subtitles"}'),
  -- brand_watermark
  ((SELECT id FROM cast_production_capabilities WHERE name='brand_watermark'), 'ffmpeg', 'primary', 'ai-universal-processor', 1, '{"action":"watermark_overlay"}'),
  -- motion_capture
  ((SELECT id FROM cast_production_capabilities WHERE name='motion_capture'), 'mediapipe', 'primary', 'ai-universal-processor', 1, '{"action":"motion_capture"}')
ON CONFLICT (capability_id, provider_name, provider_type) DO NOTHING;

-- Immersive/Distribution capabilities
INSERT INTO public.cast_production_capability_provider_map (capability_id, provider_name, provider_type, edge_function, priority, config) VALUES
  -- vr_ar_immersive
  ((SELECT id FROM cast_production_capabilities WHERE name='vr_ar_immersive'), 'vertex-ar', 'primary', 'ai-universal-processor', 1, '{"action":"vr_render"}'),
  -- live_streaming
  ((SELECT id FROM cast_production_capabilities WHERE name='live_streaming'), 'obs-websocket', 'primary', 'ai-universal-processor', 1, '{"action":"live_stream"}'),
  -- screen_recording
  ((SELECT id FROM cast_production_capabilities WHERE name='screen_recording'), 'browser-recorder', 'primary', 'ai-universal-processor', 1, '{"action":"screen_record"}')
ON CONFLICT (capability_id, provider_name, provider_type) DO NOTHING;


-- ============================================================================
-- 4. EXPAND CHARACTERS — Regional characters for all style groups
-- ============================================================================

-- Add region_code column to cast_style_characters for regional coverage
ALTER TABLE public.cast_style_characters
  ADD COLUMN IF NOT EXISTS region_code TEXT DEFAULT 'global',
  ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'neutral' CHECK (gender IN ('male', 'female', 'neutral')),
  ADD COLUMN IF NOT EXISTS age_group TEXT DEFAULT 'adult' CHECK (age_group IN ('child', 'teen', 'young_adult', 'adult', 'senior')),
  ADD COLUMN IF NOT EXISTS ethnicity_tag TEXT DEFAULT 'diverse';

-- Insert regional characters for all parent styles
-- We'll add characters for the key parent style groups
-- First, get all parent style IDs dynamically

-- Character templates: For each parent style, add diverse regional characters
-- NAM characters
INSERT INTO public.cast_style_characters (style_id, name, label, character_type, icon, description, region_code, gender, age_group, ethnicity_tag, sort_order)
SELECT
  s.id,
  s.name || '_nam_' || gender_t.g || '_' || age_t.a,
  CASE gender_t.g WHEN 'male' THEN 'Alex' WHEN 'female' THEN 'Sarah' ELSE 'Jordan' END || ' (' || s.label || ')',
  s.character_type || '_avatar',
  CASE gender_t.g WHEN 'male' THEN '👨' WHEN 'female' THEN '👩' ELSE '🧑' END,
  gender_t.g || ' ' || age_t.a || ' character for ' || s.label || ' style in North America',
  'NAM',
  gender_t.g,
  age_t.a,
  'north_american',
  ROW_NUMBER() OVER ()
FROM public.cast_visual_styles s
CROSS JOIN (VALUES ('male'), ('female'), ('neutral')) AS gender_t(g)
CROSS JOIN (VALUES ('young_adult'), ('adult')) AS age_t(a)
WHERE s.parent_style_id IS NULL AND s.is_active = true
ON CONFLICT DO NOTHING;

-- India characters
INSERT INTO public.cast_style_characters (style_id, name, label, character_type, icon, description, region_code, gender, age_group, ethnicity_tag, sort_order)
SELECT
  s.id,
  s.name || '_india_' || gender_t.g || '_' || age_t.a,
  CASE gender_t.g WHEN 'male' THEN 'Arjun' WHEN 'female' THEN 'Priya' ELSE 'Kiran' END || ' (' || s.label || ')',
  s.character_type || '_avatar',
  CASE gender_t.g WHEN 'male' THEN '👨' WHEN 'female' THEN '👩' ELSE '🧑' END,
  gender_t.g || ' ' || age_t.a || ' character for ' || s.label || ' style in India',
  'INDIA',
  gender_t.g,
  age_t.a,
  'south_asian',
  ROW_NUMBER() OVER () + 100
FROM public.cast_visual_styles s
CROSS JOIN (VALUES ('male'), ('female'), ('neutral')) AS gender_t(g)
CROSS JOIN (VALUES ('young_adult'), ('adult')) AS age_t(a)
WHERE s.parent_style_id IS NULL AND s.is_active = true
ON CONFLICT DO NOTHING;

-- MENA characters
INSERT INTO public.cast_style_characters (style_id, name, label, character_type, icon, description, region_code, gender, age_group, ethnicity_tag, sort_order)
SELECT
  s.id,
  s.name || '_mena_' || gender_t.g || '_' || age_t.a,
  CASE gender_t.g WHEN 'male' THEN 'Omar' WHEN 'female' THEN 'Fatima' ELSE 'Noor' END || ' (' || s.label || ')',
  s.character_type || '_avatar',
  CASE gender_t.g WHEN 'male' THEN '👨' WHEN 'female' THEN '👩' ELSE '🧑' END,
  gender_t.g || ' ' || age_t.a || ' character for ' || s.label || ' style in MENA region',
  'MENA',
  gender_t.g,
  age_t.a,
  'middle_eastern',
  ROW_NUMBER() OVER () + 200
FROM public.cast_visual_styles s
CROSS JOIN (VALUES ('male'), ('female'), ('neutral')) AS gender_t(g)
CROSS JOIN (VALUES ('young_adult'), ('adult')) AS age_t(a)
WHERE s.parent_style_id IS NULL AND s.is_active = true
ON CONFLICT DO NOTHING;

-- EU characters
INSERT INTO public.cast_style_characters (style_id, name, label, character_type, icon, description, region_code, gender, age_group, ethnicity_tag, sort_order)
SELECT
  s.id,
  s.name || '_eu_' || gender_t.g || '_' || age_t.a,
  CASE gender_t.g WHEN 'male' THEN 'Luca' WHEN 'female' THEN 'Emma' ELSE 'Robin' END || ' (' || s.label || ')',
  s.character_type || '_avatar',
  CASE gender_t.g WHEN 'male' THEN '👨' WHEN 'female' THEN '👩' ELSE '🧑' END,
  gender_t.g || ' ' || age_t.a || ' character for ' || s.label || ' style in Europe',
  'EU',
  gender_t.g,
  age_t.a,
  'european',
  ROW_NUMBER() OVER () + 300
FROM public.cast_visual_styles s
CROSS JOIN (VALUES ('male'), ('female'), ('neutral')) AS gender_t(g)
CROSS JOIN (VALUES ('young_adult'), ('adult')) AS age_t(a)
WHERE s.parent_style_id IS NULL AND s.is_active = true
ON CONFLICT DO NOTHING;

-- CJK characters
INSERT INTO public.cast_style_characters (style_id, name, label, character_type, icon, description, region_code, gender, age_group, ethnicity_tag, sort_order)
SELECT
  s.id,
  s.name || '_cjk_' || gender_t.g || '_' || age_t.a,
  CASE gender_t.g WHEN 'male' THEN 'Wei' WHEN 'female' THEN 'Mei' ELSE 'Ren' END || ' (' || s.label || ')',
  s.character_type || '_avatar',
  CASE gender_t.g WHEN 'male' THEN '👨' WHEN 'female' THEN '👩' ELSE '🧑' END,
  gender_t.g || ' ' || age_t.a || ' character for ' || s.label || ' style in CJK region',
  'CJK',
  gender_t.g,
  age_t.a,
  'east_asian',
  ROW_NUMBER() OVER () + 400
FROM public.cast_visual_styles s
CROSS JOIN (VALUES ('male'), ('female'), ('neutral')) AS gender_t(g)
CROSS JOIN (VALUES ('young_adult'), ('adult')) AS age_t(a)
WHERE s.parent_style_id IS NULL AND s.is_active = true
ON CONFLICT DO NOTHING;

-- LATAM characters
INSERT INTO public.cast_style_characters (style_id, name, label, character_type, icon, description, region_code, gender, age_group, ethnicity_tag, sort_order)
SELECT
  s.id,
  s.name || '_latam_' || gender_t.g || '_' || age_t.a,
  CASE gender_t.g WHEN 'male' THEN 'Carlos' WHEN 'female' THEN 'Maria' ELSE 'Angel' END || ' (' || s.label || ')',
  s.character_type || '_avatar',
  CASE gender_t.g WHEN 'male' THEN '👨' WHEN 'female' THEN '👩' ELSE '🧑' END,
  gender_t.g || ' ' || age_t.a || ' character for ' || s.label || ' style in Latin America',
  'LATAM',
  gender_t.g,
  age_t.a,
  'latin_american',
  ROW_NUMBER() OVER () + 500
FROM public.cast_visual_styles s
CROSS JOIN (VALUES ('male'), ('female'), ('neutral')) AS gender_t(g)
CROSS JOIN (VALUES ('young_adult'), ('adult')) AS age_t(a)
WHERE s.parent_style_id IS NULL AND s.is_active = true
ON CONFLICT DO NOTHING;

-- SEA characters
INSERT INTO public.cast_style_characters (style_id, name, label, character_type, icon, description, region_code, gender, age_group, ethnicity_tag, sort_order)
SELECT
  s.id,
  s.name || '_sea_' || gender_t.g || '_' || age_t.a,
  CASE gender_t.g WHEN 'male' THEN 'Budi' WHEN 'female' THEN 'Sari' ELSE 'Anh' END || ' (' || s.label || ')',
  s.character_type || '_avatar',
  CASE gender_t.g WHEN 'male' THEN '👨' WHEN 'female' THEN '👩' ELSE '🧑' END,
  gender_t.g || ' ' || age_t.a || ' character for ' || s.label || ' style in Southeast Asia',
  'SEA',
  gender_t.g,
  age_t.a,
  'southeast_asian',
  ROW_NUMBER() OVER () + 600
FROM public.cast_visual_styles s
CROSS JOIN (VALUES ('male'), ('female'), ('neutral')) AS gender_t(g)
CROSS JOIN (VALUES ('young_adult'), ('adult')) AS age_t(a)
WHERE s.parent_style_id IS NULL AND s.is_active = true
ON CONFLICT DO NOTHING;

-- AFRICA characters
INSERT INTO public.cast_style_characters (style_id, name, label, character_type, icon, description, region_code, gender, age_group, ethnicity_tag, sort_order)
SELECT
  s.id,
  s.name || '_africa_' || gender_t.g || '_' || age_t.a,
  CASE gender_t.g WHEN 'male' THEN 'Kwame' WHEN 'female' THEN 'Amara' ELSE 'Zuri' END || ' (' || s.label || ')',
  s.character_type || '_avatar',
  CASE gender_t.g WHEN 'male' THEN '👨' WHEN 'female' THEN '👩' ELSE '🧑' END,
  gender_t.g || ' ' || age_t.a || ' character for ' || s.label || ' style in Africa',
  'AFRICA',
  gender_t.g,
  age_t.a,
  'african',
  ROW_NUMBER() OVER () + 700
FROM public.cast_visual_styles s
CROSS JOIN (VALUES ('male'), ('female'), ('neutral')) AS gender_t(g)
CROSS JOIN (VALUES ('young_adult'), ('adult')) AS age_t(a)
WHERE s.parent_style_id IS NULL AND s.is_active = true
ON CONFLICT DO NOTHING;

-- OCEANIA characters
INSERT INTO public.cast_style_characters (style_id, name, label, character_type, icon, description, region_code, gender, age_group, ethnicity_tag, sort_order)
SELECT
  s.id,
  s.name || '_oceania_' || gender_t.g || '_' || age_t.a,
  CASE gender_t.g WHEN 'male' THEN 'Jack' WHEN 'female' THEN 'Olivia' ELSE 'Riley' END || ' (' || s.label || ')',
  s.character_type || '_avatar',
  CASE gender_t.g WHEN 'male' THEN '👨' WHEN 'female' THEN '👩' ELSE '🧑' END,
  gender_t.g || ' ' || age_t.a || ' character for ' || s.label || ' style in Oceania',
  'OCEANIA',
  gender_t.g,
  age_t.a,
  'oceanian',
  ROW_NUMBER() OVER () + 800
FROM public.cast_visual_styles s
CROSS JOIN (VALUES ('male'), ('female')) AS gender_t(g)
CROSS JOIN (VALUES ('young_adult'), ('adult')) AS age_t(a)
WHERE s.parent_style_id IS NULL AND s.is_active = true
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 5. UPDATE PIPELINE ORCHESTRATOR CAPABILITY ROUTING
-- Add provider_routing JSON to production capabilities that lack it
-- ============================================================================

UPDATE public.cast_production_capabilities
SET provider_routing = jsonb_build_object(
  'primary', (
    SELECT json_build_object('provider', pm.provider_name, 'edge_function', pm.edge_function)
    FROM cast_production_capability_provider_map pm
    WHERE pm.capability_id = cast_production_capabilities.id AND pm.provider_type = 'primary' AND pm.is_active = true
    ORDER BY pm.priority LIMIT 1
  ),
  'fallback', (
    SELECT json_build_object('provider', pm.provider_name, 'edge_function', pm.edge_function)
    FROM cast_production_capability_provider_map pm
    WHERE pm.capability_id = cast_production_capabilities.id AND pm.provider_type = 'fallback' AND pm.is_active = true
    ORDER BY pm.priority LIMIT 1
  )
)
WHERE provider_routing IS NULL OR provider_routing = '{}'::jsonb;


-- ============================================================================
-- 6. ENSURE OUTPUT PRESETS HAVE ENCODING CONFIGS
-- ============================================================================

-- Update any presets missing encoding config (from Phase 6B migration)
UPDATE public.cast_output_presets
SET
  codec = COALESCE(codec, 'h264'),
  fps = COALESCE(fps, 30),
  bitrate = COALESCE(bitrate, CASE
    WHEN width >= 3840 THEN '35M'
    WHEN width >= 1920 THEN '8M'
    WHEN width >= 1280 THEN '5M'
    ELSE '2.5M'
  END),
  audio_codec = COALESCE(audio_codec, 'aac'),
  audio_bitrate = COALESCE(audio_bitrate, '192k'),
  max_file_size_mb = COALESCE(max_file_size_mb, CASE
    WHEN width >= 3840 THEN 2000
    WHEN width >= 1920 THEN 500
    WHEN width >= 1280 THEN 250
    ELSE 100
  END),
  encoding_profile = COALESCE(encoding_profile, 'high')
WHERE codec IS NULL OR bitrate IS NULL;


-- ============================================================================
-- 7. ENSURE SUB-VARIANTS EXIST FOR ALL PARENT STYLES
-- Add sub-variants for any parent style that has zero children
-- ============================================================================

-- Generate 3 sub-variants per parent style that lacks any sub-styles
INSERT INTO public.cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
SELECT
  p.name || '_variant_a',
  p.label || ' – Standard',
  p.category,
  p.icon,
  'Standard variant of ' || p.label || ' optimized for general use',
  p.sort_order,
  p.id,
  1,
  COALESCE(p.complexity_score, 5),
  COALESCE(p.render_time_estimate, 'medium'),
  true
FROM public.cast_visual_styles p
WHERE p.parent_style_id IS NULL
  AND p.is_active = true
  AND NOT EXISTS (SELECT 1 FROM public.cast_visual_styles sub WHERE sub.parent_style_id = p.id)
ON CONFLICT DO NOTHING;

INSERT INTO public.cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
SELECT
  p.name || '_variant_b',
  p.label || ' – Premium',
  p.category,
  p.icon,
  'Premium high-fidelity variant of ' || p.label,
  p.sort_order,
  p.id,
  2,
  LEAST(COALESCE(p.complexity_score, 5) + 2, 10),
  'slow',
  true
FROM public.cast_visual_styles p
WHERE p.parent_style_id IS NULL
  AND p.is_active = true
  AND NOT EXISTS (SELECT 1 FROM public.cast_visual_styles sub WHERE sub.parent_style_id = p.id AND sub.name LIKE '%_variant_b')
ON CONFLICT DO NOTHING;

INSERT INTO public.cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
SELECT
  p.name || '_variant_c',
  p.label || ' – Quick',
  p.category,
  p.icon,
  'Fast-render lightweight variant of ' || p.label,
  p.sort_order,
  p.id,
  3,
  GREATEST(COALESCE(p.complexity_score, 5) - 2, 1),
  'fast',
  true
FROM public.cast_visual_styles p
WHERE p.parent_style_id IS NULL
  AND p.is_active = true
  AND NOT EXISTS (SELECT 1 FROM public.cast_visual_styles sub WHERE sub.parent_style_id = p.id AND sub.name LIKE '%_variant_c')
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 8. ADD SUB-FORMATS FOR ALL NEW CATEGORIES
-- Each new category gets format-specific sub-formats
-- ============================================================================

-- Agriculture sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'agri_seasonal', 'Seasonal Farming Guide', 'Wheat', 'text-green-700', 'Seasonal agricultural guidance video', ARRAY['youtube','facebook'], '{"tone":"educational","structure":"seasonal","narrative":"practical"}', 50),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'agri_equipment', 'Equipment Demo', 'Wrench', 'text-yellow-700', 'Agricultural equipment demonstration', ARRAY['youtube'], '{"tone":"technical","structure":"demo","narrative":"hands_on"}', 51),
  ((SELECT id FROM cast_content_formats WHERE name='presentation'), 'agri_report', 'Crop Report', 'BarChart3', 'text-green-600', 'Agricultural data and yield reports', ARRAY['website','linkedin'], '{"tone":"data_driven","structure":"report","narrative":"analytical"}', 50)
ON CONFLICT (format_id, name) DO NOTHING;

-- Construction sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'construct_timelapse', 'Construction Timelapse', 'HardHat', 'text-yellow-600', 'Project progress timelapse', ARRAY['youtube','linkedin'], '{"tone":"impressive","structure":"timelapse","narrative":"progress"}', 52),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'construct_safety', 'Safety Training', 'ShieldCheck', 'text-red-600', 'Construction safety protocols', ARRAY['youtube','lms'], '{"tone":"serious","structure":"checklist","narrative":"compliance"}', 53),
  ((SELECT id FROM cast_content_formats WHERE name='presentation'), 'construct_proposal', 'Project Proposal', 'FileCheck', 'text-blue-600', 'Construction project bid', ARRAY['website','email'], '{"tone":"professional","structure":"proposal","narrative":"persuasive"}', 51)
ON CONFLICT (format_id, name) DO NOTHING;

-- Energy & Renewables sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'energy_explainer', 'Sustainability Explainer', 'Zap', 'text-emerald-500', 'Renewable energy educational content', ARRAY['youtube','linkedin'], '{"tone":"optimistic","structure":"educational","narrative":"future_focused"}', 54),
  ((SELECT id FROM cast_content_formats WHERE name='infographic'), 'energy_dashboard', 'Energy Dashboard', 'BarChart3', 'text-emerald-600', 'Real-time energy data visualization', ARRAY['website'], '{"tone":"data_driven","structure":"dashboard","narrative":"monitoring"}', 50)
ON CONFLICT (format_id, name) DO NOTHING;

-- Sports & Fitness sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'sports_highlight', 'Sports Highlight Reel', 'Trophy', 'text-red-500', 'Game highlights and best moments', ARRAY['youtube','instagram_reels','tiktok'], '{"tone":"energetic","structure":"highlights","narrative":"exciting"}', 55),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'sports_tutorial', 'Training Tutorial', 'Dumbbell', 'text-blue-500', 'Exercise and training guidance', ARRAY['youtube','tiktok'], '{"tone":"motivating","structure":"step_by_step","narrative":"coaching"}', 56)
ON CONFLICT (format_id, name) DO NOTHING;

-- Beauty & Cosmetics sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'beauty_tutorial', 'Makeup Tutorial', 'Sparkles', 'text-pink-400', 'Step-by-step beauty application', ARRAY['youtube','instagram_reels','tiktok'], '{"tone":"friendly","structure":"tutorial","narrative":"step_by_step"}', 57),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'beauty_review', 'Product Review', 'Star', 'text-pink-500', 'Cosmetics product review', ARRAY['youtube','tiktok'], '{"tone":"honest","structure":"review","narrative":"comparison"}', 58)
ON CONFLICT (format_id, name) DO NOTHING;

-- Gaming & Esports sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'gaming_walkthrough', 'Game Walkthrough', 'Gamepad2', 'text-indigo-500', 'Full game walkthrough guide', ARRAY['youtube','twitch'], '{"tone":"entertaining","structure":"sequential","narrative":"guided"}', 59),
  ((SELECT id FROM cast_content_formats WHERE name='live_streaming'), 'gaming_tournament', 'Tournament Stream', 'Trophy', 'text-purple-500', 'Esports tournament broadcast', ARRAY['twitch','youtube'], '{"tone":"competitive","structure":"live","narrative":"commentary"}', 10)
ON CONFLICT (format_id, name) DO NOTHING;

-- Pharma & Biotech sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'pharma_moa', 'Mechanism of Action', 'Atom', 'text-cyan-600', 'Drug mechanism animation', ARRAY['youtube','website'], '{"tone":"scientific","structure":"process","narrative":"educational"}', 60),
  ((SELECT id FROM cast_content_formats WHERE name='presentation'), 'pharma_clinical', 'Clinical Trial Results', 'FileCheck', 'text-blue-600', 'Trial data presentation', ARRAY['linkedin','website'], '{"tone":"evidence_based","structure":"data","narrative":"analytical"}', 52)
ON CONFLICT (format_id, name) DO NOTHING;

-- AI & ML sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'ai_demo', 'AI Demo Video', 'Brain', 'text-purple-700', 'AI product demonstration', ARRAY['youtube','linkedin'], '{"tone":"innovative","structure":"demo","narrative":"capability_showcase"}', 61),
  ((SELECT id FROM cast_content_formats WHERE name='presentation'), 'ai_research', 'Research Presentation', 'BookOpen', 'text-purple-600', 'AI research findings deck', ARRAY['linkedin','website'], '{"tone":"academic","structure":"findings","narrative":"research"}', 53)
ON CONFLICT (format_id, name) DO NOTHING;

-- Cybersecurity sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'cyber_awareness', 'Security Awareness', 'ShieldCheck', 'text-red-700', 'Cybersecurity training video', ARRAY['youtube','lms'], '{"tone":"urgent","structure":"scenarios","narrative":"awareness"}', 62),
  ((SELECT id FROM cast_content_formats WHERE name='training'), 'cyber_phishing', 'Phishing Training', 'AlertTriangle', 'text-red-600', 'Anti-phishing simulation', ARRAY['lms','email'], '{"tone":"practical","structure":"simulation","narrative":"hands_on"}', 10)
ON CONFLICT (format_id, name) DO NOTHING;

-- Retail & E-Commerce sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'retail_seasonal', 'Seasonal Campaign', 'Calendar', 'text-orange-500', 'Holiday and seasonal retail video', ARRAY['youtube','instagram','tiktok'], '{"tone":"festive","structure":"campaign","narrative":"seasonal"}', 63),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'retail_influencer', 'Influencer Collab', 'Users', 'text-pink-500', 'Creator collaboration content', ARRAY['youtube','instagram_reels','tiktok'], '{"tone":"authentic","structure":"collab","narrative":"social_proof"}', 64)
ON CONFLICT (format_id, name) DO NOTHING;


-- ============================================================================
-- 9. TRIGGER MAINTENANCE
-- ============================================================================

DROP TRIGGER IF EXISTS update_cast_languages_updated_at ON public.cast_languages;
CREATE TRIGGER update_cast_languages_updated_at
  BEFORE UPDATE ON public.cast_languages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_cast_prod_cap_provider_map_updated_at ON public.cast_production_capability_provider_map;
CREATE TRIGGER update_cast_prod_cap_provider_map_updated_at
  BEFORE UPDATE ON public.cast_production_capability_provider_map
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

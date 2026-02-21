
-- ============================================================================
-- 1. Add size/complexity columns to cast_visual_styles
-- ============================================================================
ALTER TABLE public.cast_visual_styles
  ADD COLUMN IF NOT EXISTS estimated_size_mb NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS complexity_score INTEGER DEFAULT 5 CHECK (complexity_score BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS render_time_estimate TEXT DEFAULT 'medium';

-- ============================================================================
-- 2. Create cast_style_characters table (tag-based multi-select)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cast_style_characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  style_id UUID NOT NULL REFERENCES public.cast_visual_styles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  character_type TEXT NOT NULL DEFAULT 'generic',
  icon TEXT DEFAULT '🧑',
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cast_style_characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read cast_style_characters" ON public.cast_style_characters FOR SELECT USING (true);

-- ============================================================================
-- 3. Create cast_style_capability_rules (auto-select rules)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cast_style_capability_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  style_id UUID NOT NULL REFERENCES public.cast_visual_styles(id) ON DELETE CASCADE,
  capability_id UUID NOT NULL REFERENCES public.cast_production_capabilities(id) ON DELETE CASCADE,
  auto_select BOOLEAN DEFAULT false,
  is_recommended BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(style_id, capability_id)
);

ALTER TABLE public.cast_style_capability_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read cast_style_capability_rules" ON public.cast_style_capability_rules FOR SELECT USING (true);

-- ============================================================================
-- 4. Update complexity/size for existing parent styles
-- ============================================================================
UPDATE public.cast_visual_styles SET estimated_size_mb = 150, complexity_score = 8, render_time_estimate = 'high' WHERE name = 'pixar_3d';
UPDATE public.cast_visual_styles SET estimated_size_mb = 80, complexity_score = 5, render_time_estimate = 'medium' WHERE name = 'cartoon_2d';
UPDATE public.cast_visual_styles SET estimated_size_mb = 120, complexity_score = 7, render_time_estimate = 'high' WHERE name = 'anime';
UPDATE public.cast_visual_styles SET estimated_size_mb = 60, complexity_score = 4, render_time_estimate = 'low' WHERE name = 'watercolor';
UPDATE public.cast_visual_styles SET estimated_size_mb = 100, complexity_score = 6, render_time_estimate = 'medium' WHERE name = 'cinematic';
UPDATE public.cast_visual_styles SET estimated_size_mb = 40, complexity_score = 3, render_time_estimate = 'low' WHERE name = 'minimalist';
UPDATE public.cast_visual_styles SET estimated_size_mb = 90, complexity_score = 6, render_time_estimate = 'medium' WHERE name = 'motion_graphics';
UPDATE public.cast_visual_styles SET estimated_size_mb = 70, complexity_score = 5, render_time_estimate = 'medium' WHERE name = 'infographic';

-- Sub-styles inherit parent complexity +/- offset
UPDATE public.cast_visual_styles SET estimated_size_mb = 180, complexity_score = 9, render_time_estimate = 'high' WHERE name = 'pixar_disney_universal';
UPDATE public.cast_visual_styles SET estimated_size_mb = 100, complexity_score = 6, render_time_estimate = 'medium' WHERE name = 'pixar_chibi';
UPDATE public.cast_visual_styles SET estimated_size_mb = 130, complexity_score = 7, render_time_estimate = 'high' WHERE name = 'pixar_mascot';
UPDATE public.cast_visual_styles SET estimated_size_mb = 140, complexity_score = 7, render_time_estimate = 'high' WHERE name = 'pixar_animal';
UPDATE public.cast_visual_styles SET estimated_size_mb = 160, complexity_score = 8, render_time_estimate = 'high' WHERE name = 'pixar_landscape';
UPDATE public.cast_visual_styles SET estimated_size_mb = 170, complexity_score = 9, render_time_estimate = 'high' WHERE name = 'pixar_claymation';

UPDATE public.cast_visual_styles SET estimated_size_mb = 50, complexity_score = 4, render_time_estimate = 'low' WHERE name = 'cartoon_classic';
UPDATE public.cast_visual_styles SET estimated_size_mb = 45, complexity_score = 3, render_time_estimate = 'low' WHERE name = 'cartoon_modern_flat';
UPDATE public.cast_visual_styles SET estimated_size_mb = 55, complexity_score = 4, render_time_estimate = 'low' WHERE name = 'cartoon_comic_strip';
UPDATE public.cast_visual_styles SET estimated_size_mb = 60, complexity_score = 5, render_time_estimate = 'medium' WHERE name = 'cartoon_pop_art';
UPDATE public.cast_visual_styles SET estimated_size_mb = 35, complexity_score = 3, render_time_estimate = 'low' WHERE name = 'cartoon_sticker';

UPDATE public.cast_visual_styles SET estimated_size_mb = 110, complexity_score = 7, render_time_estimate = 'high' WHERE name = 'anime_shonen';
UPDATE public.cast_visual_styles SET estimated_size_mb = 130, complexity_score = 8, render_time_estimate = 'high' WHERE name = 'anime_ghibli';
UPDATE public.cast_visual_styles SET estimated_size_mb = 140, complexity_score = 8, render_time_estimate = 'high' WHERE name = 'anime_cyberpunk';
UPDATE public.cast_visual_styles SET estimated_size_mb = 80, complexity_score = 5, render_time_estimate = 'medium' WHERE name = 'anime_kawaii';
UPDATE public.cast_visual_styles SET estimated_size_mb = 150, complexity_score = 9, render_time_estimate = 'high' WHERE name = 'anime_mecha';
UPDATE public.cast_visual_styles SET estimated_size_mb = 90, complexity_score = 6, render_time_estimate = 'medium' WHERE name = 'anime_ukiyoe';

UPDATE public.cast_visual_styles SET estimated_size_mb = 40, complexity_score = 3, render_time_estimate = 'low' WHERE name = 'watercolor_portrait';
UPDATE public.cast_visual_styles SET estimated_size_mb = 45, complexity_score = 4, render_time_estimate = 'low' WHERE name = 'watercolor_landscape';
UPDATE public.cast_visual_styles SET estimated_size_mb = 35, complexity_score = 3, render_time_estimate = 'low' WHERE name = 'watercolor_botanical';
UPDATE public.cast_visual_styles SET estimated_size_mb = 50, complexity_score = 5, render_time_estimate = 'medium' WHERE name = 'watercolor_ink_wash';
UPDATE public.cast_visual_styles SET estimated_size_mb = 38, complexity_score = 3, render_time_estimate = 'low' WHERE name = 'watercolor_storybook';

-- ============================================================================
-- 5. Seed characters for key styles
-- ============================================================================

-- Pixar Disney/Universal characters
INSERT INTO public.cast_style_characters (style_id, name, label, character_type, icon, description, sort_order) 
SELECT id, 'woody', 'Woody', 'hero', '🤠', 'Classic cowboy hero — brave, loyal leader', 1 FROM public.cast_visual_styles WHERE name = 'pixar_disney_universal'
UNION ALL SELECT id, 'buzz', 'Buzz Lightyear', 'hero', '🚀', 'Space ranger — confident, adventurous', 2 FROM public.cast_visual_styles WHERE name = 'pixar_disney_universal'
UNION ALL SELECT id, 'simba', 'Simba', 'hero', '🦁', 'Lion king — courageous, born leader', 3 FROM public.cast_visual_styles WHERE name = 'pixar_disney_universal'
UNION ALL SELECT id, 'elsa', 'Elsa', 'hero', '❄️', 'Ice queen — powerful, independent', 4 FROM public.cast_visual_styles WHERE name = 'pixar_disney_universal'
UNION ALL SELECT id, 'nemo', 'Nemo', 'sidekick', '🐠', 'Adventurous clownfish — curious, brave', 5 FROM public.cast_visual_styles WHERE name = 'pixar_disney_universal'
UNION ALL SELECT id, 'olaf', 'Olaf', 'comic_relief', '⛄', 'Cheerful snowman — warm, funny', 6 FROM public.cast_visual_styles WHERE name = 'pixar_disney_universal'
UNION ALL SELECT id, 'custom_hero', 'Custom Hero', 'custom', '✨', 'AI-generated custom character', 7 FROM public.cast_visual_styles WHERE name = 'pixar_disney_universal';

-- Pixar Chibi characters
INSERT INTO public.cast_style_characters (style_id, name, label, character_type, icon, description, sort_order) 
SELECT id, 'chibi_warrior', 'Chibi Warrior', 'hero', '⚔️', 'Mini warrior with big energy', 1 FROM public.cast_visual_styles WHERE name = 'pixar_chibi'
UNION ALL SELECT id, 'chibi_wizard', 'Chibi Wizard', 'hero', '🧙', 'Cute spellcaster with oversized hat', 2 FROM public.cast_visual_styles WHERE name = 'pixar_chibi'
UNION ALL SELECT id, 'chibi_robot', 'Chibi Robot', 'tech', '🤖', 'Adorable robot companion', 3 FROM public.cast_visual_styles WHERE name = 'pixar_chibi'
UNION ALL SELECT id, 'chibi_custom', 'Custom Chibi', 'custom', '✨', 'AI-generated chibi character', 4 FROM public.cast_visual_styles WHERE name = 'pixar_chibi';

-- Pixar Animal characters
INSERT INTO public.cast_style_characters (style_id, name, label, character_type, icon, description, sort_order) 
SELECT id, 'wise_owl', 'Wise Owl', 'mentor', '🦉', 'Knowledgeable guide — explains complex topics', 1 FROM public.cast_visual_styles WHERE name = 'pixar_animal'
UNION ALL SELECT id, 'clever_fox', 'Clever Fox', 'hero', '🦊', 'Smart strategist — problem solver', 2 FROM public.cast_visual_styles WHERE name = 'pixar_animal'
UNION ALL SELECT id, 'brave_bear', 'Brave Bear', 'hero', '🐻', 'Strong protector — reliable, steady', 3 FROM public.cast_visual_styles WHERE name = 'pixar_animal'
UNION ALL SELECT id, 'squirrel', 'Nutty Squirrel', 'comic_relief', '🐿️', 'Energetic, hyper, always collecting data', 4 FROM public.cast_visual_styles WHERE name = 'pixar_animal'
UNION ALL SELECT id, 'custom_animal', 'Custom Animal', 'custom', '✨', 'AI-generated animal character', 5 FROM public.cast_visual_styles WHERE name = 'pixar_animal';

-- Pixar Mascot characters
INSERT INTO public.cast_style_characters (style_id, name, label, character_type, icon, description, sort_order) 
SELECT id, 'brand_mascot', 'Brand Mascot', 'mascot', '🎪', 'Custom brand mascot — your product persona', 1 FROM public.cast_visual_styles WHERE name = 'pixar_mascot'
UNION ALL SELECT id, 'tech_buddy', 'Tech Buddy', 'tech', '💻', 'Friendly tech assistant character', 2 FROM public.cast_visual_styles WHERE name = 'pixar_mascot'
UNION ALL SELECT id, 'health_hero', 'Health Hero', 'healthcare', '🏥', 'Healthcare guide mascot', 3 FROM public.cast_visual_styles WHERE name = 'pixar_mascot';

-- Anime characters
INSERT INTO public.cast_style_characters (style_id, name, label, character_type, icon, description, sort_order) 
SELECT id, 'shonen_hero', 'Shōnen Hero', 'hero', '⚡', 'Determined hero on a quest', 1 FROM public.cast_visual_styles WHERE name = 'anime_shonen'
UNION ALL SELECT id, 'rival', 'Rival', 'antagonist', '🔥', 'Competitive rival driving the story', 2 FROM public.cast_visual_styles WHERE name = 'anime_shonen'
UNION ALL SELECT id, 'sensei', 'Sensei', 'mentor', '🥋', 'Wise teacher guiding the hero', 3 FROM public.cast_visual_styles WHERE name = 'anime_shonen';

INSERT INTO public.cast_style_characters (style_id, name, label, character_type, icon, description, sort_order) 
SELECT id, 'ghibli_heroine', 'Ghibli Heroine', 'hero', '🌿', 'Nature-connected brave heroine', 1 FROM public.cast_visual_styles WHERE name = 'anime_ghibli'
UNION ALL SELECT id, 'forest_spirit', 'Forest Spirit', 'magical', '🍃', 'Mystical nature spirit guide', 2 FROM public.cast_visual_styles WHERE name = 'anime_ghibli'
UNION ALL SELECT id, 'totoro', 'Friendly Giant', 'sidekick', '🌳', 'Gentle giant forest guardian', 3 FROM public.cast_visual_styles WHERE name = 'anime_ghibli';

INSERT INTO public.cast_style_characters (style_id, name, label, character_type, icon, description, sort_order) 
SELECT id, 'cyber_hacker', 'Cyber Hacker', 'hero', '💻', 'Elite hacker in neon city', 1 FROM public.cast_visual_styles WHERE name = 'anime_cyberpunk'
UNION ALL SELECT id, 'android', 'Android', 'tech', '🤖', 'Sentient AI companion', 2 FROM public.cast_visual_styles WHERE name = 'anime_cyberpunk'
UNION ALL SELECT id, 'netrunner', 'Netrunner', 'hero', '🌐', 'VR-diving data specialist', 3 FROM public.cast_visual_styles WHERE name = 'anime_cyberpunk';

INSERT INTO public.cast_style_characters (style_id, name, label, character_type, icon, description, sort_order) 
SELECT id, 'mecha_pilot', 'Mecha Pilot', 'hero', '🎮', 'Giant robot pilot — determined fighter', 1 FROM public.cast_visual_styles WHERE name = 'anime_mecha'
UNION ALL SELECT id, 'mecha_unit', 'Mecha Unit', 'vehicle', '🤖', 'The giant mecha robot itself', 2 FROM public.cast_visual_styles WHERE name = 'anime_mecha';

-- ============================================================================
-- 6. Seed auto-capability rules (style → capability auto-select)
-- ============================================================================

-- All Pixar 3D styles auto-select lip_sync
INSERT INTO public.cast_style_capability_rules (style_id, capability_id, auto_select, is_recommended, reason)
SELECT vs.id, pc.id, true, true, 'Lip-sync is essential for 3D character animation'
FROM public.cast_visual_styles vs, public.cast_production_capabilities pc
WHERE vs.name IN ('pixar_3d', 'pixar_disney_universal', 'pixar_chibi', 'pixar_mascot', 'pixar_animal', 'pixar_claymation')
AND pc.name = 'lip_sync';

-- Pixar 3D auto-select 3d_scene_gen
INSERT INTO public.cast_style_capability_rules (style_id, capability_id, auto_select, is_recommended, reason)
SELECT vs.id, pc.id, true, true, '3D scene generation is core to Pixar-style production'
FROM public.cast_visual_styles vs, public.cast_production_capabilities pc
WHERE vs.name IN ('pixar_3d', 'pixar_disney_universal', 'pixar_landscape', 'pixar_claymation')
AND pc.name = '3d_scene_gen';

-- Anime styles auto-select lip_sync and recommend style_transfer
INSERT INTO public.cast_style_capability_rules (style_id, capability_id, auto_select, is_recommended, reason)
SELECT vs.id, pc.id, true, true, 'Lip-sync enhances anime character expression'
FROM public.cast_visual_styles vs, public.cast_production_capabilities pc
WHERE vs.name IN ('anime', 'anime_shonen', 'anime_ghibli', 'anime_cyberpunk', 'anime_mecha')
AND pc.name = 'lip_sync';

INSERT INTO public.cast_style_capability_rules (style_id, capability_id, auto_select, is_recommended, reason)
SELECT vs.id, pc.id, false, true, 'Style transfer recommended for consistent anime aesthetics'
FROM public.cast_visual_styles vs, public.cast_production_capabilities pc
WHERE vs.name IN ('anime', 'anime_shonen', 'anime_ghibli', 'anime_cyberpunk')
AND pc.name = 'style_transfer';

-- Anime Cyberpunk recommends AR filters
INSERT INTO public.cast_style_capability_rules (style_id, capability_id, auto_select, is_recommended, reason)
SELECT vs.id, pc.id, false, true, 'AR overlays enhance cyberpunk aesthetic with HUD elements'
FROM public.cast_visual_styles vs, public.cast_production_capabilities pc
WHERE vs.name = 'anime_cyberpunk' AND pc.name = 'ar_filters';

-- Cartoon 2D recommends music/SFX
INSERT INTO public.cast_style_capability_rules (style_id, capability_id, auto_select, is_recommended, reason)
SELECT vs.id, pc.id, false, true, 'AI music/SFX adds life to cartoon animations'
FROM public.cast_visual_styles vs, public.cast_production_capabilities pc
WHERE vs.name IN ('cartoon_2d', 'cartoon_classic', 'cartoon_comic_strip', 'cartoon_pop_art')
AND pc.name = 'music_sfx_gen';

-- Watercolor styles recommend subtitle_burn (no lip-sync needed)
INSERT INTO public.cast_style_capability_rules (style_id, capability_id, auto_select, is_recommended, reason)
SELECT vs.id, pc.id, false, true, 'Subtitles recommended for watercolor narration style'
FROM public.cast_visual_styles vs, public.cast_production_capabilities pc
WHERE vs.name IN ('watercolor', 'watercolor_portrait', 'watercolor_landscape', 'watercolor_storybook')
AND pc.name = 'subtitle_burn';


-- ═══════════════════════════════════════════════════════════
-- 1. Add parent_style_id to cast_visual_styles for hierarchy
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.cast_visual_styles 
  ADD COLUMN IF NOT EXISTS parent_style_id UUID REFERENCES public.cast_visual_styles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sub_sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS character_type TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS style_variant TEXT DEFAULT NULL;

-- Index for quick parent lookups
CREATE INDEX IF NOT EXISTS idx_cast_visual_styles_parent ON public.cast_visual_styles(parent_style_id);

-- ═══════════════════════════════════════════════════════════
-- 2. Insert sub-variants for PIXAR 3D (parent: 1d24b717)
-- ═══════════════════════════════════════════════════════════
INSERT INTO public.cast_visual_styles (name, label, icon, description, category, is_active, sort_order, parent_style_id, sub_sort_order, character_type, style_variant, allows_photorealistic, requires_face_consent)
VALUES
  ('pixar_disney_character', 'Disney/Universal Character', 'Box', 'Classic Disney/Pixar character proportions — big eyes, expressive faces', 'character', true, 1, '1d24b717-e077-4a35-bd08-45a2ca2ba664', 1, 'humanoid', 'disney_universal', false, false),
  ('pixar_chibi', 'Chibi Pixar', 'Box', 'Cute super-deformed 3D characters with oversized heads', 'character', true, 1, '1d24b717-e077-4a35-bd08-45a2ca2ba664', 2, 'chibi', 'chibi_3d', false, false),
  ('pixar_mascot', 'Pixar Brand Mascot', 'Box', '3D brand mascot with character personality and brand colors', 'character', true, 1, '1d24b717-e077-4a35-bd08-45a2ca2ba664', 3, 'mascot', 'mascot_3d', false, false),
  ('pixar_animal', 'Pixar Animal Character', 'Box', 'Anthropomorphic animal characters in Pixar style (Zootopia, Finding Nemo)', 'character', true, 1, '1d24b717-e077-4a35-bd08-45a2ca2ba664', 4, 'animal', 'animal_3d', false, false),
  ('pixar_landscape', 'Pixar Environment', 'Box', '3D environments and landscapes in Pixar render quality', 'character', true, 1, '1d24b717-e077-4a35-bd08-45a2ca2ba664', 5, 'environment', 'landscape_3d', false, false),
  ('pixar_claymation', 'Claymation 3D', 'Box', 'Stop-motion clay look with 3D rendering (Wallace & Gromit style)', 'character', true, 1, '1d24b717-e077-4a35-bd08-45a2ca2ba664', 6, 'humanoid', 'claymation', false, false);

-- ═══════════════════════════════════════════════════════════
-- 3. Insert sub-variants for CARTOON 2D (parent: 3f584d70)
-- ═══════════════════════════════════════════════════════════
INSERT INTO public.cast_visual_styles (name, label, icon, description, category, is_active, sort_order, parent_style_id, sub_sort_order, character_type, style_variant, allows_photorealistic, requires_face_consent)
VALUES
  ('cartoon_classic', 'Classic Cartoon', 'Smile', 'Looney Tunes / Tom & Jerry style — bold outlines, exaggerated expressions', 'character', true, 2, '3f584d70-8671-44e5-8b56-13798edeb7f2', 1, 'humanoid', 'classic_toon', false, false),
  ('cartoon_modern_flat', 'Modern Flat Cartoon', 'Smile', 'Adventure Time / Rick & Morty style — clean vector lines, flat colors', 'character', true, 2, '3f584d70-8671-44e5-8b56-13798edeb7f2', 2, 'humanoid', 'modern_flat', false, false),
  ('cartoon_comic_strip', 'Comic Strip', 'Smile', 'Newspaper comic strip style — panels, speech bubbles, bold ink', 'character', true, 2, '3f584d70-8671-44e5-8b56-13798edeb7f2', 3, 'humanoid', 'comic_strip', false, false),
  ('cartoon_chibi_2d', 'Chibi 2D', 'Smile', 'Cute chibi characters in 2D cartoon style', 'character', true, 2, '3f584d70-8671-44e5-8b56-13798edeb7f2', 4, 'chibi', 'chibi_2d', false, false),
  ('cartoon_pop_art', 'Pop Art', 'Smile', 'Roy Lichtenstein-inspired bold dots, primary colors, dramatic shadows', 'character', true, 2, '3f584d70-8671-44e5-8b56-13798edeb7f2', 5, 'humanoid', 'pop_art', false, false),
  ('cartoon_sticker', 'Sticker / Emoji Style', 'Smile', 'Cute sticker-style characters with thick outlines and pastel fills', 'character', true, 2, '3f584d70-8671-44e5-8b56-13798edeb7f2', 6, 'humanoid', 'sticker', false, false);

-- ═══════════════════════════════════════════════════════════
-- 4. Insert sub-variants for ANIME (parent: aa40065c)
-- ═══════════════════════════════════════════════════════════
INSERT INTO public.cast_visual_styles (name, label, icon, description, category, is_active, sort_order, parent_style_id, sub_sort_order, character_type, style_variant, allows_photorealistic, requires_face_consent)
VALUES
  ('anime_shonen', 'Shonen Action', 'Star', 'Dragon Ball / Naruto style — dynamic poses, speed lines, energy effects', 'character', true, 3, 'aa40065c-c892-49d1-aaba-ad0caf902e4d', 1, 'humanoid', 'shonen', false, false),
  ('anime_ghibli', 'Studio Ghibli', 'Star', 'Miyazaki-inspired watercolor backgrounds with gentle character design', 'character', true, 3, 'aa40065c-c892-49d1-aaba-ad0caf902e4d', 2, 'humanoid', 'ghibli', false, false),
  ('anime_cyberpunk', 'Cyberpunk Anime', 'Star', 'Ghost in the Shell / Akira — neon cities, tech overlays, gritty detail', 'character', true, 3, 'aa40065c-c892-49d1-aaba-ad0caf902e4d', 3, 'humanoid', 'cyberpunk', false, false),
  ('anime_kawaii', 'Kawaii / Cute', 'Star', 'Pastel colors, sparkles, oversized eyes — cute aesthetic', 'character', true, 3, 'aa40065c-c892-49d1-aaba-ad0caf902e4d', 4, 'humanoid', 'kawaii', false, false),
  ('anime_mecha', 'Mecha / Sci-Fi', 'Star', 'Gundam / Evangelion — detailed mechanical design, epic scale', 'character', true, 3, 'aa40065c-c892-49d1-aaba-ad0caf902e4d', 5, 'humanoid', 'mecha', false, false),
  ('anime_ukiyo_e', 'Ukiyo-e Fusion', 'Star', 'Traditional Japanese woodblock merged with modern anime', 'character', true, 3, 'aa40065c-c892-49d1-aaba-ad0caf902e4d', 6, 'humanoid', 'ukiyo_e', false, false);

-- ═══════════════════════════════════════════════════════════
-- 5. Insert sub-variants for WATERCOLOR (parent: 0665144d)
-- ═══════════════════════════════════════════════════════════
INSERT INTO public.cast_visual_styles (name, label, icon, description, category, is_active, sort_order, parent_style_id, sub_sort_order, character_type, style_variant, allows_photorealistic, requires_face_consent)
VALUES
  ('watercolor_portrait', 'Watercolor Portrait', 'Droplets', 'Soft watercolor human portraits with visible brush strokes', 'illustration', true, 5, '0665144d-3263-414d-bd8a-f4f99a51a874', 1, 'humanoid', 'portrait', false, false),
  ('watercolor_landscape', 'Watercolor Landscape', 'Droplets', 'Dreamy nature scenes with watercolor bleeding and washes', 'illustration', true, 5, '0665144d-3263-414d-bd8a-f4f99a51a874', 2, 'environment', 'landscape', false, false),
  ('watercolor_botanical', 'Botanical Illustration', 'Droplets', 'Detailed botanical/floral illustrations in watercolor', 'illustration', true, 5, '0665144d-3263-414d-bd8a-f4f99a51a874', 3, 'object', 'botanical', false, false),
  ('watercolor_ink_wash', 'Ink Wash (Sumi-e)', 'Droplets', 'Traditional East Asian ink wash painting with minimal color', 'illustration', true, 5, '0665144d-3263-414d-bd8a-f4f99a51a874', 4, 'abstract', 'ink_wash', false, false),
  ('watercolor_storybook', 'Storybook Illustration', 'Droplets', 'Children''s book illustration style — warm, whimsical watercolor', 'illustration', true, 5, '0665144d-3263-414d-bd8a-f4f99a51a874', 5, 'humanoid', 'storybook', false, false);

-- ═══════════════════════════════════════════════════════════
-- 6. New Production Capabilities
-- ═══════════════════════════════════════════════════════════
INSERT INTO public.cast_production_capabilities (name, label, icon, description, category, is_active, sort_order, requires_visual, requires_audio, requires_avatar, requires_consent, safety_level)
VALUES
  ('ar_filters', 'AR Filters & Overlays', 'Sparkles', 'Augmented reality face/scene filters, brand overlays, interactive AR elements', 'visual', true, 20, true, false, false, false, 'standard'),
  ('music_sfx_gen', 'AI Music & SFX', 'Music', 'AI-generated background music, sound effects, ambient audio per scene', 'audio', true, 21, false, true, false, false, 'standard'),
  ('multi_camera', 'Multi-Camera & Split-Screen', 'Layout', 'Simulated multi-angle shots, picture-in-picture, split-screen layouts', 'visual', true, 22, true, false, false, false, 'standard'),
  ('green_screen', 'Green Screen & Compositing', 'Layers', 'Virtual backgrounds, chroma key, scene compositing layers', 'visual', true, 23, true, false, false, false, 'standard'),
  ('3d_scene_gen', '3D Scene Generation', 'Box', 'Full 3D scene/environment generation from text prompts', 'visual', true, 24, true, false, false, false, 'standard'),
  ('style_transfer', 'Real-time Style Transfer', 'Palette', 'Apply art styles (Pixar, Anime, Watercolor) to live/uploaded footage', 'visual', true, 25, true, false, false, false, 'standard'),
  ('subtitle_burn', 'Subtitle Burn-in', 'Type', 'Hardcoded multi-language subtitles with custom fonts and positioning', 'visual', true, 26, true, false, false, false, 'standard'),
  ('voice_clone', 'Voice Cloning', 'Mic', 'Clone a speaker voice for consistent narration across languages', 'audio', true, 27, false, true, false, true, 'elevated'),
  ('motion_capture', 'AI Motion Capture', 'Activity', 'Generate body motion from text/audio for avatar animation', 'avatar', true, 28, true, true, true, false, 'standard'),
  ('brand_watermark', 'Brand Watermark & Outro', 'Shield', 'Auto-inject brand watermarks, intros, and outros per output', 'visual', true, 29, true, false, false, false, 'standard');

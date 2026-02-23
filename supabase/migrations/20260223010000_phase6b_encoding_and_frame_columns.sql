-- Phase 6B: B-011 + B-012 — Add encoding config + character frame columns
-- B-011: Encoding config columns on cast_output_presets
-- B-012: Character frame overlay sizing on cast_visual_styles

-- ═══════════════════════════════════════════════════════════════════════
-- B-011: Add encoding columns to cast_output_presets
-- Enables FFmpeg pipeline to know bitrate, codec, fps per preset
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE public.cast_output_presets
  ADD COLUMN IF NOT EXISTS codec TEXT DEFAULT 'h264',
  ADD COLUMN IF NOT EXISTS fps INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS bitrate TEXT DEFAULT '5000k',
  ADD COLUMN IF NOT EXISTS audio_codec TEXT DEFAULT 'aac',
  ADD COLUMN IF NOT EXISTS audio_bitrate TEXT DEFAULT '192k',
  ADD COLUMN IF NOT EXISTS max_file_size_mb INTEGER DEFAULT 500,
  ADD COLUMN IF NOT EXISTS encoding_profile TEXT DEFAULT 'main';

-- Update existing presets with correct encoding configs
UPDATE public.cast_output_presets SET codec = 'h264', fps = 30, bitrate = '5000k', encoding_profile = 'main' WHERE name = '720p';
UPDATE public.cast_output_presets SET codec = 'h264', fps = 30, bitrate = '8000k', encoding_profile = 'high' WHERE name = '1080p';
UPDATE public.cast_output_presets SET codec = 'h264', fps = 30, bitrate = '12000k', encoding_profile = 'high' WHERE name = '1440p';
UPDATE public.cast_output_presets SET codec = 'h265', fps = 30, bitrate = '20000k', encoding_profile = 'main10' WHERE name = '4k';
UPDATE public.cast_output_presets SET codec = 'h264', fps = 30, bitrate = '6000k' WHERE name = 'portrait_hd';
UPDATE public.cast_output_presets SET codec = 'h264', fps = 30, bitrate = '4000k' WHERE name = 'portrait_720';
UPDATE public.cast_output_presets SET codec = 'h264', fps = 30, bitrate = '6000k' WHERE name = 'square_hd';
UPDATE public.cast_output_presets SET codec = 'h264', fps = 30, bitrate = '4000k' WHERE name = 'square_sm';
UPDATE public.cast_output_presets SET codec = 'h264', fps = 30, bitrate = '6000k' WHERE name = 'ig_portrait';
UPDATE public.cast_output_presets SET codec = 'h264', fps = 24, bitrate = '3000k' WHERE name = 'ppt_standard';
UPDATE public.cast_output_presets SET codec = 'h264', fps = 24, bitrate = '5000k' WHERE name = 'ppt_widescreen';
UPDATE public.cast_output_presets SET codec = 'h264', fps = 24, bitrate = '6000k' WHERE name = 'keynote_retina';
UPDATE public.cast_output_presets SET codec = 'h264', fps = 30, bitrate = '8000k' WHERE name = 'web_hero';
UPDATE public.cast_output_presets SET codec = 'h264', fps = 30, bitrate = '5000k' WHERE name = 'web_embed';
UPDATE public.cast_output_presets SET codec = 'gif', fps = 15, bitrate = '0', max_file_size_mb = 10 WHERE name = 'email_gif';
UPDATE public.cast_output_presets SET codec = 'h264', fps = 30, bitrate = '8000k' WHERE name = 'signage_h';
UPDATE public.cast_output_presets SET codec = 'h264', fps = 30, bitrate = '8000k' WHERE name = 'signage_v';
UPDATE public.cast_output_presets SET codec = 'h265', fps = 30, bitrate = '25000k', encoding_profile = 'main10' WHERE name = 'ctv_4k';
UPDATE public.cast_output_presets SET codec = 'h264', fps = 30, bitrate = '6000k' WHERE name = 'podcast_square';
UPDATE public.cast_output_presets SET codec = 'h264', fps = 24, bitrate = '12000k', encoding_profile = 'high' WHERE name = 'cinema_ultrawide';
UPDATE public.cast_output_presets SET codec = 'h264', fps = 24, bitrate = '15000k', encoding_profile = 'high' WHERE name = 'cinema_scope';

-- ═══════════════════════════════════════════════════════════════════════
-- B-012: Add columns to cast_visual_styles that code expects
-- These match the VisualStyle interface in useCastContentRegistry.ts
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE public.cast_visual_styles
  ADD COLUMN IF NOT EXISTS ip_safe BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS parent_style_id UUID REFERENCES public.cast_visual_styles(id),
  ADD COLUMN IF NOT EXISTS sub_sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS character_type TEXT,
  ADD COLUMN IF NOT EXISTS style_variant TEXT,
  ADD COLUMN IF NOT EXISTS estimated_size_mb NUMERIC DEFAULT 50,
  ADD COLUMN IF NOT EXISTS complexity_score NUMERIC DEFAULT 3,
  ADD COLUMN IF NOT EXISTS render_time_estimate TEXT DEFAULT '2-5 min',
  ADD COLUMN IF NOT EXISTS preview_image_url TEXT,
  ADD COLUMN IF NOT EXISTS character_frame_percent INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS is_user_created BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS is_saved_globally BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS custom_prompt TEXT,
  ADD COLUMN IF NOT EXISTS uploaded_reference_url TEXT,
  ADD COLUMN IF NOT EXISTS uploaded_reference_type TEXT;

-- Add constraint for character_frame_percent range
ALTER TABLE public.cast_visual_styles
  ADD CONSTRAINT character_frame_percent_range
  CHECK (character_frame_percent >= 10 AND character_frame_percent <= 100);

-- ═══════════════════════════════════════════════════════════════════════
-- B-010: Cultural / Religious style category seed data
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO public.cast_visual_styles (name, label, category, icon, description, ip_safe, character_type, style_variant, sample_prompt, character_frame_percent)
VALUES
  -- Cultural styles
  ('diwali_rangoli', 'Diwali Rangoli', 'cultural', 'Sparkles', 'Vibrant rangoli patterns with diyas and marigolds', true, 'cultural_mascot', 'festive', 'Colorful rangoli design with oil lamps and marigold garlands, warm golden lighting', 50),
  ('chinese_new_year', 'Chinese New Year', 'cultural', 'Sparkles', 'Red and gold with lanterns and dragons', true, 'cultural_mascot', 'festive', 'Red and gold Chinese New Year celebration with paper lanterns and dragon motifs', 50),
  ('eid_crescent', 'Eid Celebration', 'cultural', 'Moon', 'Crescent moon and star with Islamic geometric patterns', true, 'cultural_mascot', 'festive', 'Elegant crescent moon with geometric Islamic art patterns in blue and gold', 50),
  ('hanami_sakura', 'Hanami / Sakura', 'cultural', 'Flower2', 'Cherry blossom viewing season aesthetic', true, 'cultural_mascot', 'seasonal', 'Soft pink cherry blossoms falling in a serene Japanese garden setting', 50),
  ('dia_de_muertos', 'Día de Muertos', 'cultural', 'Skull', 'Mexican Day of the Dead sugar skull aesthetics', true, 'cultural_mascot', 'festive', 'Colorful sugar skull patterns with marigolds and papel picado', 50),
  ('songkran_water', 'Songkran Festival', 'cultural', 'Droplets', 'Thai water festival with golden temple backdrop', true, 'cultural_mascot', 'festive', 'Thai water splashing celebration with golden temple and jasmine garlands', 50),
  ('african_ankara', 'African Ankara', 'cultural', 'Palette', 'Bold Ankara/Kente cloth patterns', true, 'cultural_mascot', 'regional', 'Bold geometric Ankara textile patterns in vibrant African colors', 50),
  ('persian_miniature', 'Persian Miniature', 'cultural', 'PaintBucket', 'Classical Persian miniature painting style', true, 'cultural_mascot', 'artistic', 'Detailed Persian miniature painting with ornate borders and garden scenes', 50),

  -- Religious / Spiritual styles
  ('islamic_geometric', 'Islamic Geometric', 'religious', 'Hexagon', 'Non-figurative geometric tessellations', true, null, 'spiritual', 'Intricate Islamic geometric tessellation in blue, gold, and white marble', 50),
  ('hindu_mandala', 'Hindu Mandala', 'religious', 'CircleDot', 'Sacred geometry mandala patterns', true, null, 'spiritual', 'Ornate mandala with lotus petals and sacred geometry in warm colors', 50),
  ('zen_minimalist', 'Zen Minimalist', 'religious', 'Minus', 'Japanese Zen rock garden aesthetic', true, null, 'spiritual', 'Minimalist zen rock garden with raked sand patterns and single stone', 50),
  ('stained_glass', 'Stained Glass', 'religious', 'Church', 'Cathedral stained glass window style', true, null, 'artistic', 'Vibrant stained glass window pattern with light streaming through', 50)
ON CONFLICT (name) DO NOTHING;

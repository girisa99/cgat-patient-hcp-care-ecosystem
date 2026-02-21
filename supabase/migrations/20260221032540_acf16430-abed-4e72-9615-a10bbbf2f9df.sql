
-- Create cast_output_presets table properly 
CREATE TABLE IF NOT EXISTS public.cast_output_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  aspect_ratio TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📐',
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cast_output_presets ENABLE ROW LEVEL SECURITY;

-- Public read access (presets are shared across all users)
CREATE POLICY "Output presets are publicly readable" ON public.cast_output_presets
  FOR SELECT USING (true);

-- Seed comprehensive output presets covering ALL publishing types
INSERT INTO public.cast_output_presets (name, label, category, width, height, aspect_ratio, description, icon, is_default, sort_order)
VALUES
  -- Standard video
  ('720p', '720p HD', 'video', 1280, 720, '16:9', 'Standard HD video', '📺', false, 1),
  ('1080p', '1080p Full HD', 'video', 1920, 1080, '16:9', 'Full HD production', '🖥️', true, 2),
  ('1440p', '1440p QHD', 'video', 2560, 1440, '16:9', 'Quad HD video', '🎬', false, 3),
  ('4k', '4K UHD', 'video', 3840, 2160, '16:9', 'Ultra HD 4K', '✨', false, 4),
  -- Portrait / Mobile
  ('portrait_hd', 'Portrait HD', 'social', 1080, 1920, '9:16', 'Reels / TikTok / Stories', '📱', false, 10),
  ('portrait_720', 'Portrait 720p', 'social', 720, 1280, '9:16', 'Mobile-first portrait', '📲', false, 11),
  -- Square
  ('square_hd', 'Square HD', 'social', 1080, 1080, '1:1', 'Instagram square post', '⬜', false, 20),
  ('square_sm', 'Square SM', 'social', 720, 720, '1:1', 'Lightweight square', '🔲', false, 21),
  -- Instagram specific
  ('ig_portrait', 'IG Portrait', 'social', 1080, 1350, '4:5', 'Instagram portrait post', '📐', false, 25),
  -- Presentation
  ('ppt_standard', 'PPT Standard', 'presentation', 1024, 768, '4:3', 'PowerPoint standard slides', '📊', false, 30),
  ('ppt_widescreen', 'PPT Widescreen', 'presentation', 1920, 1080, '16:9', 'PowerPoint widescreen', '📽️', false, 31),
  ('keynote_retina', 'Keynote Retina', 'presentation', 2048, 1536, '4:3', 'Apple Keynote retina', '🍎', false, 32),
  -- Web
  ('web_hero', 'Web Hero', 'web', 1920, 1080, '16:9', 'Website hero banner', '🌐', false, 40),
  ('web_embed', 'Web Embed', 'web', 1280, 720, '16:9', 'Embeddable web player', '▶️', false, 41),
  ('email_gif', 'Email GIF', 'web', 600, 338, '16:9', 'Email-safe animated GIF', '✉️', false, 42),
  -- Broadcast
  ('signage_h', 'Signage H', 'broadcast', 1920, 1080, '16:9', 'Digital signage horizontal', '🖥️', false, 50),
  ('signage_v', 'Signage V', 'broadcast', 1080, 1920, '9:16', 'Digital signage vertical', '📺', false, 51),
  ('ctv_4k', 'CTV 4K', 'broadcast', 3840, 2160, '16:9', 'Connected TV 4K', '📡', false, 52),
  ('podcast_square', 'Podcast', 'broadcast', 1080, 1080, '1:1', 'Podcast video clip', '🎙️', false, 53),
  -- Cinematic
  ('cinema_ultrawide', 'Ultrawide', 'cinematic', 2560, 1080, '21:9', 'Cinematic ultrawide', '🎬', false, 60),
  ('cinema_scope', 'CinemaScope', 'cinematic', 2048, 858, '2.39:1', 'Film industry anamorphic', '🎞️', false, 61)
ON CONFLICT (name) DO NOTHING;

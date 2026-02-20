
-- Production Capabilities Registry (fully dynamic, no hardcoding)
CREATE TABLE public.cast_production_capabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  label text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  icon text NOT NULL DEFAULT 'Zap',
  color text NOT NULL DEFAULT 'text-primary',
  description text,
  -- Provider routing config (regional/sub-regional)
  default_provider text,
  provider_routing jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Constraints
  requires_audio boolean NOT NULL DEFAULT false,
  requires_visual boolean NOT NULL DEFAULT false,
  requires_avatar boolean NOT NULL DEFAULT false,
  -- Safety & IP
  safety_level text NOT NULL DEFAULT 'standard',
  requires_consent boolean NOT NULL DEFAULT false,
  -- Metadata
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Junction: which capabilities each format supports
CREATE TABLE public.cast_format_capabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  format_id uuid NOT NULL REFERENCES public.cast_content_formats(id) ON DELETE CASCADE,
  capability_id uuid NOT NULL REFERENCES public.cast_production_capabilities(id) ON DELETE CASCADE,
  is_default boolean NOT NULL DEFAULT false,
  regional_overrides jsonb NOT NULL DEFAULT '{}'::jsonb,
  config_overrides jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(format_id, capability_id)
);

-- Visual Style Registry (dynamic, not hardcoded)
CREATE TABLE public.cast_visual_styles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  label text NOT NULL,
  category text NOT NULL DEFAULT 'illustration',
  icon text NOT NULL DEFAULT 'Palette',
  color text NOT NULL DEFAULT 'text-primary',
  description text,
  -- Style constraints
  allows_photorealistic boolean NOT NULL DEFAULT false,
  requires_face_consent boolean NOT NULL DEFAULT false,
  sample_prompt text,
  style_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Provider routing
  default_provider text,
  provider_routing jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Asset source types registry
CREATE TABLE public.cast_asset_source_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  label text NOT NULL,
  icon text NOT NULL DEFAULT 'Upload',
  description text,
  -- Safety
  requires_safety_scan boolean NOT NULL DEFAULT false,
  requires_consent boolean NOT NULL DEFAULT false,
  allowed_mime_types text[] NOT NULL DEFAULT '{image/png,image/jpeg,image/webp}',
  max_file_size_mb integer NOT NULL DEFAULT 20,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add visual_style_id and asset_source to cast_projects
ALTER TABLE public.cast_projects
  ADD COLUMN IF NOT EXISTS visual_style_id uuid REFERENCES public.cast_visual_styles(id),
  ADD COLUMN IF NOT EXISTS asset_source_type text DEFAULT 'generate',
  ADD COLUMN IF NOT EXISTS selected_capabilities text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS safety_flags jsonb NOT NULL DEFAULT '{}'::jsonb;

-- RLS for all new tables
ALTER TABLE public.cast_production_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_format_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_visual_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_asset_source_types ENABLE ROW LEVEL SECURITY;

-- Public read for registry tables
CREATE POLICY "Anyone can read active capabilities" ON public.cast_production_capabilities FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated can manage capabilities" ON public.cast_production_capabilities FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can read format capabilities" ON public.cast_format_capabilities FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated can manage format capabilities" ON public.cast_format_capabilities FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can read active visual styles" ON public.cast_visual_styles FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated can manage visual styles" ON public.cast_visual_styles FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can read active asset source types" ON public.cast_asset_source_types FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated can manage asset source types" ON public.cast_asset_source_types FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Triggers
CREATE TRIGGER update_cast_production_capabilities_updated_at BEFORE UPDATE ON public.cast_production_capabilities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cast_visual_styles_updated_at BEFORE UPDATE ON public.cast_visual_styles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed production capabilities
INSERT INTO public.cast_production_capabilities (name, label, category, icon, description, requires_audio, requires_visual, requires_avatar, safety_level, sort_order) VALUES
  ('scene_voiceover', 'Scene-Based Voiceover', 'voice', 'Mic', 'TTS narration per scene/segment', true, false, false, 'standard', 1),
  ('slide_voiceover', 'Slide-Based Voiceover', 'voice', 'Presentation', 'TTS narration per slide', true, false, false, 'standard', 2),
  ('full_voiceover', 'Full Voiceover', 'voice', 'AudioLines', 'Complete narration track', true, false, false, 'standard', 3),
  ('lip_sync', 'Lip Sync', 'avatar', 'Smile', 'Sync avatar mouth to audio', true, true, true, 'elevated', 4),
  ('dubbing', 'Multi-Language Dubbing', 'voice', 'Languages', 'Voice dubbing in multiple languages', true, false, false, 'standard', 5),
  ('diff_animate', 'Diff-Animate', 'visual', 'Wand2', 'Animate still images with motion', false, true, false, 'standard', 6),
  ('avatar_talking_head', 'Avatar Talking Head', 'avatar', 'User', 'AI avatar bust/head', true, true, true, 'elevated', 7),
  ('avatar_full_body', 'Avatar Full Body', 'avatar', 'PersonStanding', 'Full body AI avatar', true, true, true, 'elevated', 8),
  ('text_to_image', 'Text to Image', 'visual', 'Image', 'Generate images from text prompts', false, true, false, 'standard', 9),
  ('image_to_image', 'Image to Image', 'visual', 'ImagePlus', 'Transform/style-transfer images', false, true, false, 'standard', 10),
  ('text_to_video', 'Text to Video', 'visual', 'Video', 'Generate video from text', false, true, false, 'standard', 11),
  ('pixar_3d', 'Pixar / 3D Style', 'visual', 'Box', '3D Pixar-quality character rendering', false, true, false, 'standard', 12),
  ('cartoon_animation', 'Cartoon Animation', 'visual', 'Smile', '2D cartoon style animation', false, true, false, 'standard', 13),
  ('vr_ar_immersive', 'VR/AR Immersive', 'immersive', 'Glasses', '360° or spatial content', false, true, false, 'elevated', 14),
  ('live_streaming', 'Live Streaming', 'distribution', 'Radio', 'Real-time broadcast output', true, true, false, 'elevated', 15),
  ('screen_recording', 'Screen Recording', 'visual', 'Monitor', 'Capture screen with narration', true, true, false, 'standard', 16);

-- Seed visual styles
INSERT INTO public.cast_visual_styles (name, label, category, icon, description, allows_photorealistic, requires_face_consent, sort_order) VALUES
  ('pixar_3d', 'Pixar 3D', 'character', 'Box', 'Pixar-quality 3D characters and scenes', false, false, 1),
  ('cartoon_2d', 'Cartoon 2D', 'character', 'Smile', 'Classic 2D cartoon illustration', false, false, 2),
  ('anime', 'Anime', 'character', 'Star', 'Japanese anime art style', false, false, 3),
  ('flat_illustration', 'Flat Illustration', 'illustration', 'Palette', 'Modern flat design illustrations', false, false, 4),
  ('watercolor', 'Watercolor', 'illustration', 'Droplets', 'Soft watercolor artistic style', false, false, 5),
  ('isometric_3d', 'Isometric 3D', 'technical', 'Box', '3D isometric diagrams and scenes', false, false, 6),
  ('realistic_stylized', 'Realistic Stylized', 'photographic', 'Camera', 'Enhanced realism with artistic touch', true, true, 7),
  ('cinematic', 'Cinematic', 'photographic', 'Film', 'Movie-quality visual treatment', true, true, 8),
  ('minimalist', 'Minimalist', 'illustration', 'Minus', 'Clean minimal design', false, false, 9),
  ('infographic', 'Infographic', 'technical', 'BarChart3', 'Data visualization style', false, false, 10),
  ('whiteboard', 'Whiteboard', 'illustration', 'PenTool', 'Hand-drawn whiteboard style', false, false, 11),
  ('comic_book', 'Comic Book', 'character', 'BookOpen', 'Comic/graphic novel style', false, false, 12);

-- Seed asset source types
INSERT INTO public.cast_asset_source_types (name, label, icon, description, requires_safety_scan, requires_consent, sort_order) VALUES
  ('generate', 'AI Generate', 'Sparkles', 'Generate new visuals with AI', false, false, 1),
  ('pre_uploaded', 'From Brand Library', 'FolderOpen', 'Use pre-uploaded brand assets', false, false, 2),
  ('upload_new', 'Upload New', 'Upload', 'Upload new assets for this project', true, false, 3),
  ('stock', 'Stock Library', 'Image', 'Use stock images and videos', false, false, 4),
  ('screen_capture', 'Screen Capture', 'Monitor', 'Capture product screens', false, false, 5);


-- Video Style Registry: Database-driven style system for multi-modal routing

CREATE TABLE public.video_style_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  style_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  subcategory TEXT,
  description TEXT,
  
  -- Provider routing chains (ordered by priority)
  image_providers JSONB NOT NULL DEFAULT '[]',
  video_providers JSONB NOT NULL DEFAULT '[]',
  avatar_providers JSONB NOT NULL DEFAULT '[]',
  three_d_providers JSONB NOT NULL DEFAULT '[]',
  motion_providers JSONB NOT NULL DEFAULT '[]',
  lipsync_providers JSONB NOT NULL DEFAULT '[]',
  
  -- Cultural & regional metadata
  target_regions TEXT[] DEFAULT '{}',
  cultural_tags TEXT[] DEFAULT '{}',
  tone_modifier TEXT DEFAULT 'professional',
  aesthetic_keywords TEXT[] DEFAULT '{}',
  
  -- Output format support
  supported_formats JSONB NOT NULL DEFAULT '["image", "video"]',
  supported_aspect_ratios TEXT[] DEFAULT ARRAY['16:9', '9:16', '1:1'],
  default_resolution TEXT DEFAULT '1080p',
  
  -- Flags
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system_default BOOLEAN NOT NULL DEFAULT false,
  requires_premium BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  preview_thumbnail_url TEXT,
  sort_order INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.video_style_registry ENABLE ROW LEVEL SECURITY;

-- Public read access (styles are shared globally)
CREATE POLICY "Anyone can view active styles"
  ON public.video_style_registry FOR SELECT
  USING (is_active = true);

-- Admin write access using existing user_has_role function
CREATE POLICY "Admins can manage styles"
  ON public.video_style_registry FOR ALL
  USING (public.user_has_role(auth.uid(), 'superAdmin'));

-- Indexes
CREATE INDEX idx_video_style_category ON public.video_style_registry(category);
CREATE INDEX idx_video_style_key ON public.video_style_registry(style_key);
CREATE INDEX idx_video_style_cultural_tags ON public.video_style_registry USING GIN(cultural_tags);
CREATE INDEX idx_video_style_regions ON public.video_style_registry USING GIN(target_regions);

-- Updated at trigger
CREATE TRIGGER update_video_style_registry_updated_at
  BEFORE UPDATE ON public.video_style_registry
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

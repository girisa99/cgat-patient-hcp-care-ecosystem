
-- ============================================
-- Cast Style-Capability-Provider-Platform Mapping Registry
-- DB-driven for subscription/white-label scalability
-- ============================================

-- 1. Master Video Styles Registry
CREATE TABLE public.cast_video_styles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  icon TEXT DEFAULT '🎬',
  style_group TEXT NOT NULL DEFAULT 'video', -- video, ppt, asset, 3d_avatar
  description TEXT,
  base_token_cost INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  is_system_default BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Master AI Capabilities Registry
CREATE TABLE public.cast_ai_capabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  icon TEXT DEFAULT '⚡',
  category TEXT NOT NULL DEFAULT 'generation', -- generation, post_processing, delivery
  description TEXT,
  base_token_cost INTEGER DEFAULT 500,
  is_active BOOLEAN DEFAULT true,
  is_system_default BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Style → Capabilities mapping (which capabilities each style needs)
CREATE TABLE public.cast_style_capability_map (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  style_value TEXT NOT NULL REFERENCES public.cast_video_styles(value) ON DELETE CASCADE,
  capability_value TEXT NOT NULL REFERENCES public.cast_ai_capabilities(value) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT true, -- required vs optional for this style
  priority INTEGER DEFAULT 1, -- execution order in production pipeline
  token_multiplier NUMERIC(3,1) DEFAULT 1.0, -- style-specific cost adjustment
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(style_value, capability_value)
);

-- 4. Capability → Provider mapping (which providers serve each capability, with fallback chain)
CREATE TABLE public.cast_capability_provider_map (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  capability_value TEXT NOT NULL REFERENCES public.cast_ai_capabilities(value) ON DELETE CASCADE,
  provider_value TEXT NOT NULL, -- references aiProvidersConfig registry value
  provider_label TEXT NOT NULL,
  fallback_order INTEGER DEFAULT 1, -- 1=primary, 2=secondary, etc.
  zone TEXT DEFAULT 'global', -- global, western, cjk, mena, india
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(capability_value, provider_value, zone)
);

-- 5. Style → Platform mapping (which platforms are recommended per style)
CREATE TABLE public.cast_style_platform_map (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  style_value TEXT NOT NULL REFERENCES public.cast_video_styles(value) ON DELETE CASCADE,
  platform_id TEXT NOT NULL, -- references target-platforms-registry id
  is_recommended BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(style_value, platform_id)
);

-- 6. Intent → Style mapping (which styles are relevant per intent)
CREATE TABLE public.cast_intent_style_map (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  intent_value TEXT NOT NULL, -- e.g., 'product-demo', 'hero-banner', 'educational'
  style_value TEXT NOT NULL REFERENCES public.cast_video_styles(value) ON DELETE CASCADE,
  relevance_score INTEGER DEFAULT 50, -- 0-100, higher = more relevant
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(intent_value, style_value)
);

-- Enable RLS on all tables
ALTER TABLE public.cast_video_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_ai_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_style_capability_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_capability_provider_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_style_platform_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_intent_style_map ENABLE ROW LEVEL SECURITY;

-- Read access for authenticated users (system registry data)
CREATE POLICY "Authenticated users can read cast_video_styles"
  ON public.cast_video_styles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read cast_ai_capabilities"
  ON public.cast_ai_capabilities FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read cast_style_capability_map"
  ON public.cast_style_capability_map FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read cast_capability_provider_map"
  ON public.cast_capability_provider_map FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read cast_style_platform_map"
  ON public.cast_style_platform_map FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read cast_intent_style_map"
  ON public.cast_intent_style_map FOR SELECT
  USING (auth.role() = 'authenticated');

-- Indexes for fast lookups
CREATE INDEX idx_style_cap_map_style ON public.cast_style_capability_map(style_value);
CREATE INDEX idx_style_cap_map_capability ON public.cast_style_capability_map(capability_value);
CREATE INDEX idx_cap_provider_map_capability ON public.cast_capability_provider_map(capability_value);
CREATE INDEX idx_cap_provider_map_zone ON public.cast_capability_provider_map(zone);
CREATE INDEX idx_style_platform_map_style ON public.cast_style_platform_map(style_value);
CREATE INDEX idx_intent_style_map_intent ON public.cast_intent_style_map(intent_value);

-- Updated_at trigger
CREATE TRIGGER update_cast_video_styles_updated_at
  BEFORE UPDATE ON public.cast_video_styles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cast_ai_capabilities_updated_at
  BEFORE UPDATE ON public.cast_ai_capabilities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- Regional Content Cache for Dynamic Transcreation
-- Stores transcreated landing page content per region/sub-region
-- Same pipeline as ecosystem_messaging — uses ai-universal-processor

CREATE TABLE public.regional_content_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region_slug TEXT NOT NULL,
  sub_region_code TEXT,
  language_code TEXT NOT NULL DEFAULT 'en',
  content_type TEXT NOT NULL DEFAULT 'landing_page',
  content_key TEXT NOT NULL,
  english_source TEXT NOT NULL,
  transcreated_content TEXT NOT NULL,
  cultural_tone TEXT,
  emotional_register TEXT,
  dialect_variant TEXT,
  llm_provider TEXT,
  llm_model TEXT,
  generation_metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
  version INTEGER NOT NULL DEFAULT 1,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  refresh_cadence TEXT DEFAULT 'weekly' CHECK (refresh_cadence IN ('daily', 'weekly', 'monthly', 'manual', 'event_driven')),
  last_refreshed_at TIMESTAMPTZ DEFAULT now(),
  next_refresh_at TIMESTAMPTZ,
  ab_variant TEXT DEFAULT 'A',
  engagement_score NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(region_slug, sub_region_code, language_code, content_key, ab_variant, version)
);

-- Enable RLS
ALTER TABLE public.regional_content_cache ENABLE ROW LEVEL SECURITY;

-- Public read for landing pages (anonymous visitors need to see transcreated content)
CREATE POLICY "Anyone can read approved regional content"
  ON public.regional_content_cache
  FOR SELECT
  USING (status = 'approved');

-- Authenticated users can manage content
CREATE POLICY "Authenticated users can insert regional content"
  ON public.regional_content_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update regional content"
  ON public.regional_content_cache
  FOR UPDATE
  TO authenticated
  USING (true);

-- Indexes for fast lookup
CREATE INDEX idx_regional_content_region ON public.regional_content_cache(region_slug, language_code, status);
CREATE INDEX idx_regional_content_key ON public.regional_content_cache(content_key, region_slug);
CREATE INDEX idx_regional_content_refresh ON public.regional_content_cache(next_refresh_at) WHERE status = 'approved';

-- Auto-update timestamp trigger
CREATE TRIGGER update_regional_content_cache_updated_at
  BEFORE UPDATE ON public.regional_content_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

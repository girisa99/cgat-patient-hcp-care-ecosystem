
-- ========================================
-- 1. Add thumbnail_url to cast_style_characters
-- ========================================
ALTER TABLE public.cast_style_characters
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS costume_variants JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.cast_style_characters.thumbnail_url IS 'CDN URL to character avatar/thumbnail image';
COMMENT ON COLUMN public.cast_style_characters.costume_variants IS 'Holiday/seasonal costume overlays [{holiday_id, costume_url, label}]';

-- ========================================
-- 2. Create cast_regional_holidays table
--    AI-generated + cached holiday suggestions
-- ========================================
CREATE TABLE IF NOT EXISTS public.cast_regional_holidays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  local_name TEXT,
  region_code TEXT NOT NULL,
  sub_region_code TEXT,
  holiday_date DATE NOT NULL,
  holiday_type TEXT NOT NULL DEFAULT 'cultural',
  description TEXT,
  color_palette JSONB DEFAULT '[]'::jsonb,
  style_keywords TEXT[] DEFAULT '{}',
  greeting_templates JSONB DEFAULT '[]'::jsonb,
  suggested_capabilities TEXT[] DEFAULT '{}',
  suggested_style_ids UUID[] DEFAULT '{}',
  music_mood TEXT,
  is_recurring BOOLEAN DEFAULT true,
  recurrence_rule TEXT,
  source TEXT DEFAULT 'ai_generated',
  confidence_score NUMERIC(3,2) DEFAULT 0.80,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_holiday_type CHECK (holiday_type IN ('religious', 'cultural', 'national', 'seasonal', 'commercial', 'awareness'))
);

-- Enable RLS
ALTER TABLE public.cast_regional_holidays ENABLE ROW LEVEL SECURITY;

-- Public read for all authenticated users
CREATE POLICY "Holidays are readable by authenticated users"
  ON public.cast_regional_holidays FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only service role can insert/update (AI-generated)
CREATE POLICY "Service role manages holidays"
  ON public.cast_regional_holidays FOR ALL
  USING (auth.role() = 'service_role');

-- Allow anon read for public-facing suggestions
CREATE POLICY "Holidays readable by anon"
  ON public.cast_regional_holidays FOR SELECT
  USING (is_active = true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_holidays_region_date ON public.cast_regional_holidays(region_code, holiday_date);
CREATE INDEX IF NOT EXISTS idx_holidays_date_range ON public.cast_regional_holidays(holiday_date) WHERE is_active = true;

-- ========================================
-- 3. Holiday-style preset linking table
-- ========================================
CREATE TABLE IF NOT EXISTS public.cast_holiday_style_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  holiday_id UUID NOT NULL REFERENCES public.cast_regional_holidays(id) ON DELETE CASCADE,
  style_id UUID NOT NULL REFERENCES public.cast_visual_styles(id) ON DELETE CASCADE,
  color_overrides JSONB DEFAULT '{}'::jsonb,
  template_prompt TEXT,
  greeting_script TEXT,
  is_auto_generated BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(holiday_id, style_id)
);

ALTER TABLE public.cast_holiday_style_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Holiday presets readable by authenticated"
  ON public.cast_holiday_style_presets FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Holiday presets readable by anon"
  ON public.cast_holiday_style_presets FOR SELECT
  USING (true);

-- ========================================
-- 4. Add estimated fields to visual styles if missing
-- ========================================
ALTER TABLE public.cast_visual_styles
  ADD COLUMN IF NOT EXISTS seasonal_tags TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.cast_visual_styles.seasonal_tags IS 'Seasonal/holiday tags for style matching (e.g., christmas, diwali, eid)';

-- Timestamp trigger for holidays
CREATE TRIGGER update_cast_regional_holidays_updated_at
  BEFORE UPDATE ON public.cast_regional_holidays
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

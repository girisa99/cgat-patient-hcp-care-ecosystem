
-- Add framework metadata to video_blueprints for audience-framework-tagged templates
ALTER TABLE public.video_blueprints 
  ADD COLUMN IF NOT EXISTS framework_primary TEXT DEFAULT 'aida',
  ADD COLUMN IF NOT EXISTS framework_secondary TEXT,
  ADD COLUMN IF NOT EXISTS aida_scene_mapping JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS storybrand_mapping JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS jtbd_outcomes JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS blue_ocean_differentiators TEXT[],
  ADD COLUMN IF NOT EXISTS target_audience_segments TEXT[],
  ADD COLUMN IF NOT EXISTS messaging_tier TEXT DEFAULT 'product',
  ADD COLUMN IF NOT EXISTS powered_by_config JSONB DEFAULT '{}';

-- Create ecosystem_messaging table for audience-specific framework messaging
CREATE TABLE IF NOT EXISTS public.ecosystem_messaging (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audience_segment TEXT NOT NULL,
  framework_type TEXT NOT NULL DEFAULT 'storybrand',
  product_id TEXT,
  messaging_tier TEXT NOT NULL DEFAULT 'ecosystem',
  hero_narrative TEXT,
  guide_positioning TEXT,
  pain_points TEXT[],
  hooks TEXT[],
  ctas TEXT[],
  value_propositions TEXT[],
  differentiators TEXT[],
  aida_attention TEXT,
  aida_interest TEXT,
  aida_desire TEXT,
  aida_action TEXT,
  storybrand_character TEXT,
  storybrand_problem TEXT,
  storybrand_guide TEXT,
  storybrand_plan TEXT,
  storybrand_success TEXT,
  storybrand_failure TEXT,
  jtbd_job_statement TEXT,
  jtbd_outcome_metrics TEXT[],
  four_es_experience TEXT,
  four_es_evangelism TEXT,
  four_es_exchange TEXT,
  four_es_everyplace TEXT,
  language_code TEXT DEFAULT 'en',
  is_approved BOOLEAN DEFAULT false,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ecosystem_messaging ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read messaging
CREATE POLICY "Authenticated users can read ecosystem messaging"
ON public.ecosystem_messaging FOR SELECT
USING (true);

-- Allow authenticated users to manage messaging
CREATE POLICY "Authenticated users can manage ecosystem messaging"
ON public.ecosystem_messaging FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create product_chain_metadata table for tracking which products/models were used
CREATE TABLE IF NOT EXISTS public.product_chain_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id TEXT,
  blueprint_id UUID REFERENCES public.video_blueprints(id),
  products_used TEXT[] NOT NULL DEFAULT '{}',
  ai_models_used JSONB NOT NULL DEFAULT '{}',
  tts_provider TEXT,
  video_provider TEXT,
  image_provider TEXT,
  llm_provider TEXT,
  assembly_provider TEXT DEFAULT 'json2video',
  generation_time_seconds NUMERIC,
  total_credits_used NUMERIC DEFAULT 0,
  audience_segment TEXT,
  framework_used TEXT,
  messaging_tier TEXT,
  powered_by_display JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_chain_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read chain metadata"
ON public.product_chain_metadata FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage chain metadata"
ON public.product_chain_metadata FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_ecosystem_messaging_audience ON public.ecosystem_messaging(audience_segment, framework_type);
CREATE INDEX IF NOT EXISTS idx_ecosystem_messaging_product ON public.ecosystem_messaging(product_id, language_code);
CREATE INDEX IF NOT EXISTS idx_product_chain_video ON public.product_chain_metadata(video_id);
CREATE INDEX IF NOT EXISTS idx_product_chain_blueprint ON public.product_chain_metadata(blueprint_id);

-- Add updated_at trigger for ecosystem_messaging
CREATE TRIGGER update_ecosystem_messaging_updated_at
BEFORE UPDATE ON public.ecosystem_messaging
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

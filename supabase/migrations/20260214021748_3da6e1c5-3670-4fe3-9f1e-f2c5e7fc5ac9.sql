-- Add content_type to distinguish narration scripts from marketing messaging
-- Default 'narration' preserves backward compatibility for all existing rows
ALTER TABLE public.regional_narration_scripts 
ADD COLUMN IF NOT EXISTS content_type text NOT NULL DEFAULT 'narration';

-- Add messaging_data JSONB for extended marketing messaging fields
-- (headline, subHook, ctaSecondary, valueProposition, painPoints, benefits,
--  differentiators, openingLine, closingLine, transitionPhrases,
--  shortScript, mediumScript, longScript, hashtags, keywords, metaDescription, confidence)
ALTER TABLE public.regional_narration_scripts 
ADD COLUMN IF NOT EXISTS messaging_data jsonb DEFAULT NULL;

-- Add target_audience array for messaging audience linkage
ALTER TABLE public.regional_narration_scripts 
ADD COLUMN IF NOT EXISTS target_audiences text[] DEFAULT '{}';

-- Index for efficient filtering by content_type
CREATE INDEX IF NOT EXISTS idx_regional_narration_scripts_content_type 
ON public.regional_narration_scripts (content_type);

-- Composite index for messaging queries: content_type + product_id + region_code
CREATE INDEX IF NOT EXISTS idx_regional_narration_scripts_messaging_lookup 
ON public.regional_narration_scripts (content_type, product_id, region_code);

-- Comment for documentation
COMMENT ON COLUMN public.regional_narration_scripts.content_type IS 'narration = landing page hero scripts, marketing_messaging = AI-generated positioning/hooks/CTAs';
COMMENT ON COLUMN public.regional_narration_scripts.messaging_data IS 'Extended messaging fields: headline, subHook, ctaSecondary, valueProposition, painPoints[], benefits[], differentiators[], scripts (short/medium/long), SEO (hashtags, keywords, metaDescription)';
COMMENT ON COLUMN public.regional_narration_scripts.target_audiences IS 'Target audience segment IDs this messaging was generated for';
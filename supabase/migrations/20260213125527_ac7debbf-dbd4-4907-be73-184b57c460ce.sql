
-- Extend content_intents with structured intelligence columns
-- These complement the existing JSONB metadata with queryable fields

ALTER TABLE public.content_intents 
  ADD COLUMN IF NOT EXISTS content_type TEXT NOT NULL DEFAULT 'video',
  ADD COLUMN IF NOT EXISTS industry_tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS capability_requirements TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ai_analyzed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_analysis_data JSONB DEFAULT '{}';

-- Add check constraint for content_type  
ALTER TABLE public.content_intents 
  ADD CONSTRAINT valid_content_type CHECK (
    content_type IN ('video', 'infographic', 'animation', 'chart', 'whitepaper', 
    'statistics_card', 'customer_journey', 'process_flow', 'presentation', 'social_post', 'mixed')
  );

-- Index for content type and industry filtering
CREATE INDEX IF NOT EXISTS idx_content_intents_content_type ON public.content_intents(content_type);
CREATE INDEX IF NOT EXISTS idx_content_intents_industry ON public.content_intents USING GIN(industry_tags);
CREATE INDEX IF NOT EXISTS idx_content_intents_capabilities ON public.content_intents USING GIN(capability_requirements);


-- Add full generation context metadata to regional_narration_scripts
ALTER TABLE public.regional_narration_scripts
  ADD COLUMN IF NOT EXISTS llm_provider TEXT,
  ADD COLUMN IF NOT EXISTS llm_model TEXT,
  ADD COLUMN IF NOT EXISTS llm_temperature NUMERIC,
  ADD COLUMN IF NOT EXISTS llm_token_count INTEGER,
  ADD COLUMN IF NOT EXISTS llm_prompt_template TEXT,
  ADD COLUMN IF NOT EXISTS routing_decision TEXT,
  ADD COLUMN IF NOT EXISTS routing_confidence_score NUMERIC,
  ADD COLUMN IF NOT EXISTS routing_zone TEXT,
  ADD COLUMN IF NOT EXISTS generation_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_english_base BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS english_base_script_id UUID REFERENCES public.regional_narration_scripts(id) ON DELETE SET NULL;

-- Index for English base lookups
CREATE INDEX IF NOT EXISTS idx_narration_scripts_english_base 
  ON public.regional_narration_scripts(english_base_script_id) 
  WHERE english_base_script_id IS NOT NULL;

-- Index for generation context queries  
CREATE INDEX IF NOT EXISTS idx_narration_scripts_llm_provider
  ON public.regional_narration_scripts(llm_provider, llm_model);

COMMENT ON COLUMN public.regional_narration_scripts.llm_provider IS 'AI provider that generated this script (claude, openai, gemini, alibaba, deepseek)';
COMMENT ON COLUMN public.regional_narration_scripts.llm_model IS 'Specific model used (claude-4, gpt-4o, qwen-max, gemini-3-pro)';
COMMENT ON COLUMN public.regional_narration_scripts.llm_temperature IS 'Temperature setting used during generation';
COMMENT ON COLUMN public.regional_narration_scripts.llm_token_count IS 'Total tokens consumed during generation';
COMMENT ON COLUMN public.regional_narration_scripts.llm_prompt_template IS 'Prompt template identifier used';
COMMENT ON COLUMN public.regional_narration_scripts.routing_decision IS 'Why this provider was chosen for this region';
COMMENT ON COLUMN public.regional_narration_scripts.routing_confidence_score IS 'Confidence score (0-1) for the routing decision';
COMMENT ON COLUMN public.regional_narration_scripts.routing_zone IS 'Zone used for routing (western, cjk, mena, india, sea, africa, latam)';
COMMENT ON COLUMN public.regional_narration_scripts.generation_timestamp IS 'Exact timestamp of AI generation';
COMMENT ON COLUMN public.regional_narration_scripts.is_english_base IS 'True if this is the English source-of-truth version';
COMMENT ON COLUMN public.regional_narration_scripts.english_base_script_id IS 'FK to the English base script this was transcreated from';

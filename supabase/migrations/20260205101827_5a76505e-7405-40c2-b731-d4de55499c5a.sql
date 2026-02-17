-- Phase 1: Style Abstraction - Add style_intent and regional columns to video_blueprints

-- Add style_intent column for decoupling templates from providers
ALTER TABLE video_blueprints 
ADD COLUMN IF NOT EXISTS style_intent TEXT DEFAULT 'corporate';

-- Add target_regions array for regional routing
ALTER TABLE video_blueprints 
ADD COLUMN IF NOT EXISTS target_regions TEXT[] DEFAULT ARRAY['global'];

-- Add supported_dialects JSONB for granular dialect configuration
ALTER TABLE video_blueprints 
ADD COLUMN IF NOT EXISTS supported_dialects JSONB DEFAULT '{}';

-- Add tone_modifier for additional style context
ALTER TABLE video_blueprints 
ADD COLUMN IF NOT EXISTS tone_modifier TEXT DEFAULT 'professional';

-- Add aesthetic_keywords for style guidance
ALTER TABLE video_blueprints 
ADD COLUMN IF NOT EXISTS aesthetic_keywords TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create index for efficient style-based queries
CREATE INDEX IF NOT EXISTS idx_video_blueprints_style_intent 
ON video_blueprints(style_intent);

-- Create GIN index for target_regions array queries
CREATE INDEX IF NOT EXISTS idx_video_blueprints_target_regions 
ON video_blueprints USING GIN(target_regions);

-- Update existing templates with appropriate style_intent based on category
UPDATE video_blueprints 
SET style_intent = CASE 
  WHEN category = 'marketing' THEN 'product-hero'
  WHEN category = 'educational' THEN 'explainer'
  WHEN category = 'storytelling' THEN 'cinematic'
  WHEN category = 'healthcare' THEN 'corporate'
  WHEN category = 'entertainment' THEN 'lifestyle'
  WHEN category = 'corporate' THEN 'corporate'
  WHEN category = 'animation' THEN 'pixar-3d'
  WHEN category = '3d' THEN 'pixar-3d'
  WHEN category = 'avatar' THEN 'photorealistic'
  WHEN category = 'travel' THEN 'cinematic'
  ELSE 'corporate'
END
WHERE style_intent = 'corporate' OR style_intent IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN video_blueprints.style_intent IS 'Style abstraction layer - decouples templates from specific AI providers. Values: photorealistic, cinematic, anime, pixar-3d, watercolor, minimalist, corporate, editorial, product-hero, lifestyle, documentary, explainer, ugc-authentic, luxury-fashion, tech-startup';
COMMENT ON COLUMN video_blueprints.target_regions IS 'Array of target regions for 4-zone routing: global, western, europe, cjk, india, mena, sea, africa, latam';
COMMENT ON COLUMN video_blueprints.supported_dialects IS 'JSONB config for granular dialect support per region. Example: {"india": ["hi-IN-north", "ta-IN-south"], "mena": ["ar-SA-gulf", "ar-EG-egyptian"]}';
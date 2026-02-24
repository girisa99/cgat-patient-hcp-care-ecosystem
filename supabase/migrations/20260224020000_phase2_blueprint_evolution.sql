-- Phase 2: Blueprint Evolution + Regional Script Enhancement
-- Add format/category columns to video_blueprints, enhance regional_narration_scripts

-- ============================================================================
-- 2A. Add Format Linkage Columns to video_blueprints
-- ============================================================================
ALTER TABLE public.video_blueprints
  ADD COLUMN IF NOT EXISTS format_id uuid REFERENCES public.cast_content_formats(id),
  ADD COLUMN IF NOT EXISTS sub_format_id uuid REFERENCES public.cast_content_sub_formats(id),
  ADD COLUMN IF NOT EXISTS supported_formats uuid[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.cast_content_categories(id);

-- Indexes for format-based blueprint queries
CREATE INDEX IF NOT EXISTS idx_video_blueprints_format ON public.video_blueprints (format_id) WHERE format_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_video_blueprints_category_id ON public.video_blueprints (category_id) WHERE category_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_video_blueprints_sub_format ON public.video_blueprints (sub_format_id) WHERE sub_format_id IS NOT NULL;

-- ============================================================================
-- 2B. Backfill blueprints: category_id from freetext category column
-- Map the 18+ freetext category values to cast_content_categories IDs
-- ============================================================================
UPDATE public.video_blueprints bp SET category_id = cc.id
FROM public.cast_content_categories cc
WHERE bp.category_id IS NULL AND (
  (bp.category = 'marketing'     AND cc.name = 'retail') OR
  (bp.category = 'educational'   AND cc.name = 'education') OR
  (bp.category = 'healthcare'    AND cc.name = 'healthcare') OR
  (bp.category = 'corporate'     AND cc.name = 'professional_services') OR
  (bp.category = 'entertainment' AND cc.name = 'entertainment') OR
  (bp.category = 'animation'     AND cc.name = 'entertainment') OR
  (bp.category = '3d'            AND cc.name = 'technology') OR
  (bp.category = 'interactive'   AND cc.name = 'technology') OR
  (bp.category = 'storytelling'  AND cc.name = 'entertainment') OR
  (bp.category = 'announcement'  AND cc.name = 'retail') OR
  (bp.category = 'travel'        AND cc.name = 'travel') OR
  (bp.category = 'seasonal'      AND cc.name = 'retail') OR
  (bp.category = 'avatar'        AND cc.name = 'technology') OR
  (bp.category = 'ppt'           AND cc.name = 'professional_services') OR
  (bp.category = 'smb'           AND cc.name = 'retail') OR
  (bp.category = 'oil_gas'       AND cc.name = 'manufacturing') OR
  (bp.category = 'image_to_video' AND cc.name = 'entertainment') OR
  (bp.category = 'other'         AND cc.name = 'technology')
);

-- Backfill format_id: most blueprints are video, ppt→presentation
UPDATE public.video_blueprints SET format_id = (SELECT id FROM cast_content_formats WHERE name = 'video')
WHERE format_id IS NULL AND category NOT IN ('ppt');

UPDATE public.video_blueprints SET format_id = (SELECT id FROM cast_content_formats WHERE name = 'presentation')
WHERE format_id IS NULL AND category = 'ppt';

-- Default region and language for English base set
UPDATE public.video_blueprints SET region_code = 'NAM_US' WHERE region_code IS NULL;
UPDATE public.video_blueprints SET language_code = 'en-US' WHERE language_code IS NULL;

-- ============================================================================
-- 2C. Enhance regional_narration_scripts with product + English base tracking
-- ============================================================================
ALTER TABLE public.regional_narration_scripts
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.marketing_products(id),
  ADD COLUMN IF NOT EXISTS is_english_base boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS english_base_script_id uuid REFERENCES public.regional_narration_scripts(id);

-- Index for product-region lookup
CREATE INDEX IF NOT EXISTS idx_regional_scripts_product ON public.regional_narration_scripts (product_id) WHERE product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_regional_scripts_english_base ON public.regional_narration_scripts (english_base_script_id) WHERE english_base_script_id IS NOT NULL;

-- Mark existing English scripts as base scripts
UPDATE public.regional_narration_scripts SET is_english_base = true WHERE language_code = 'en';

-- ============================================================================
-- 2D. Add product_id backfill: link existing 8 system products to blueprints
-- Map by category -> product association
-- ============================================================================
-- Genie Cast (marketing/retail blueprints)
UPDATE public.video_blueprints bp SET product_id = mp.id
FROM public.marketing_products mp
WHERE bp.product_id IS NULL
  AND mp.name = 'Genie Cast'
  AND mp.is_system_default = true
  AND bp.category IN ('marketing', 'announcement', 'seasonal', 'smb', 'commercial');

-- Genie Vibe (entertainment/animation/storytelling)
UPDATE public.video_blueprints bp SET product_id = mp.id
FROM public.marketing_products mp
WHERE bp.product_id IS NULL
  AND mp.name = 'Genie Vibe'
  AND mp.is_system_default = true
  AND bp.category IN ('entertainment', 'animation', 'storytelling', 'image_to_video', '3d');

-- Genie Deck (presentation/ppt)
UPDATE public.video_blueprints bp SET product_id = mp.id
FROM public.marketing_products mp
WHERE bp.product_id IS NULL
  AND mp.name = 'Genie Deck'
  AND mp.is_system_default = true
  AND bp.category IN ('ppt', 'corporate');

-- Genie Mind (healthcare/educational)
UPDATE public.video_blueprints bp SET product_id = mp.id
FROM public.marketing_products mp
WHERE bp.product_id IS NULL
  AND mp.name = 'Genie Mind'
  AND mp.is_system_default = true
  AND bp.category IN ('healthcare', 'educational');

-- Genie Spark (remaining: technology, travel, oil_gas, interactive, avatar, other)
UPDATE public.video_blueprints bp SET product_id = mp.id
FROM public.marketing_products mp
WHERE bp.product_id IS NULL
  AND mp.name = 'Genie Spark'
  AND mp.is_system_default = true;

COMMENT ON COLUMN public.video_blueprints.format_id IS 'Primary output format for this blueprint';
COMMENT ON COLUMN public.video_blueprints.sub_format_id IS 'Specific sub-format (leaf node)';
COMMENT ON COLUMN public.video_blueprints.supported_formats IS 'Array of format IDs this blueprint supports (multi-format)';
COMMENT ON COLUMN public.video_blueprints.category_id IS 'Industry category from cast_content_categories';
COMMENT ON COLUMN public.regional_narration_scripts.product_id IS 'Marketing product this script belongs to';
COMMENT ON COLUMN public.regional_narration_scripts.is_english_base IS 'True if this is the English source script';
COMMENT ON COLUMN public.regional_narration_scripts.english_base_script_id IS 'FK to the English original for transcreated scripts';

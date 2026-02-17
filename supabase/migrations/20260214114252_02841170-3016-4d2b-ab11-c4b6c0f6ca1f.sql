
-- ============================================================
-- UNIFIED PARENT→CHILD REGIONAL HIERARCHY MIGRATION
-- Aligns: Messaging, Templates (Blueprints), Assets, Videos
-- Pattern: region_code, is_english_base, parent_*_id, status, routing_zone
-- ============================================================

-- 1. ECOSYSTEM_MESSAGING — Add regional hierarchy columns
ALTER TABLE public.ecosystem_messaging
  ADD COLUMN IF NOT EXISTS region_code text DEFAULT 'EN_US',
  ADD COLUMN IF NOT EXISTS is_english_base boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS parent_messaging_id uuid REFERENCES public.ecosystem_messaging(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS routing_zone text,
  ADD COLUMN IF NOT EXISTS sub_region_code text;

-- Index for parent→child lookups
CREATE INDEX IF NOT EXISTS idx_ecosystem_messaging_parent ON public.ecosystem_messaging(parent_messaging_id);
CREATE INDEX IF NOT EXISTS idx_ecosystem_messaging_region ON public.ecosystem_messaging(region_code);
CREATE INDEX IF NOT EXISTS idx_ecosystem_messaging_status ON public.ecosystem_messaging(status);

-- 2. VIDEO_BLUEPRINTS — Add regional hierarchy columns
ALTER TABLE public.video_blueprints
  ADD COLUMN IF NOT EXISTS region_code text DEFAULT 'EN_US',
  ADD COLUMN IF NOT EXISTS is_english_base boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS parent_blueprint_id uuid REFERENCES public.video_blueprints(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS routing_zone text,
  ADD COLUMN IF NOT EXISTS sub_region_code text,
  ADD COLUMN IF NOT EXISTS language_code text DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS product_id uuid;

CREATE INDEX IF NOT EXISTS idx_video_blueprints_parent ON public.video_blueprints(parent_blueprint_id);
CREATE INDEX IF NOT EXISTS idx_video_blueprints_region ON public.video_blueprints(region_code);
CREATE INDEX IF NOT EXISTS idx_video_blueprints_status ON public.video_blueprints(status);

-- 3. LANDING_PAGE_VIDEOS — Normalize region columns + add hierarchy
ALTER TABLE public.landing_page_videos
  ADD COLUMN IF NOT EXISTS region_code text,
  ADD COLUMN IF NOT EXISTS is_english_base boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS parent_video_id uuid REFERENCES public.landing_page_videos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sub_region_code text,
  ADD COLUMN IF NOT EXISTS routing_zone text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';

-- Backfill region_code from existing 'region' column
UPDATE public.landing_page_videos SET region_code = region WHERE region IS NOT NULL AND region_code IS NULL;

CREATE INDEX IF NOT EXISTS idx_landing_page_videos_parent ON public.landing_page_videos(parent_video_id);
CREATE INDEX IF NOT EXISTS idx_landing_page_videos_region ON public.landing_page_videos(region_code);

-- 4. MARKETING_BRAND_ASSETS — Add regional hierarchy columns
ALTER TABLE public.marketing_brand_assets
  ADD COLUMN IF NOT EXISTS region_code text DEFAULT 'EN_US',
  ADD COLUMN IF NOT EXISTS is_english_base boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS parent_asset_id uuid REFERENCES public.marketing_brand_assets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS routing_zone text,
  ADD COLUMN IF NOT EXISTS sub_region_code text,
  ADD COLUMN IF NOT EXISTS language_code text DEFAULT 'en';

CREATE INDEX IF NOT EXISTS idx_marketing_brand_assets_parent ON public.marketing_brand_assets(parent_asset_id);
CREATE INDEX IF NOT EXISTS idx_marketing_brand_assets_region ON public.marketing_brand_assets(region_code);

-- 5. MEDIA_ASSETS — Add regional hierarchy (already has parent_asset_id)
ALTER TABLE public.media_assets
  ADD COLUMN IF NOT EXISTS region_code text DEFAULT 'EN_US',
  ADD COLUMN IF NOT EXISTS is_english_base boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS routing_zone text,
  ADD COLUMN IF NOT EXISTS sub_region_code text,
  ADD COLUMN IF NOT EXISTS language_code text DEFAULT 'en';

CREATE INDEX IF NOT EXISTS idx_media_assets_region ON public.media_assets(region_code);
CREATE INDEX IF NOT EXISTS idx_media_assets_status ON public.media_assets(status);

-- 6. Create a COMMENT for documentation
COMMENT ON COLUMN public.ecosystem_messaging.parent_messaging_id IS 'FK to English master entry. NULL = this IS the English base.';
COMMENT ON COLUMN public.ecosystem_messaging.region_code IS 'Parent or sub-region code from regionHierarchy.ts (e.g., INDIA_NORTH, EU_DE)';
COMMENT ON COLUMN public.ecosystem_messaging.is_english_base IS 'true = English master, false = regional transcreation child';
COMMENT ON COLUMN public.ecosystem_messaging.routing_zone IS 'LLM/TTS routing zone (e.g., claude, alibaba, google)';
COMMENT ON COLUMN public.ecosystem_messaging.status IS 'Lifecycle: draft → pending → approved → active → archived';

COMMENT ON COLUMN public.video_blueprints.parent_blueprint_id IS 'FK to English master blueprint. NULL = this IS the English base.';
COMMENT ON COLUMN public.landing_page_videos.parent_video_id IS 'FK to English master video. NULL = this IS the English base.';
COMMENT ON COLUMN public.marketing_brand_assets.parent_asset_id IS 'FK to English master asset. NULL = this IS the English base.';

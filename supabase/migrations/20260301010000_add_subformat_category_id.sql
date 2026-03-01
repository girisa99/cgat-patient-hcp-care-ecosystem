-- Migration: Add category_id to cast_content_sub_formats
-- Purpose: Enable category-aware sub-format filtering so "Agriculture → Video"
-- only shows agriculture-relevant sub-formats, not all 123 sub-formats.
--
-- Also adds 3 missing format definitions that are referenced in sub-format seeds
-- but were never created as format rows.

-- 1. Add category_id column (nullable — null = universal/available to all categories)
ALTER TABLE cast_content_sub_formats
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES cast_content_categories(id) ON DELETE SET NULL;

-- 2. Add 3 missing format definitions
INSERT INTO cast_content_formats (name, label, icon, color, sort_order, is_active)
VALUES
  ('training', 'Training / E-Learning', 'GraduationCap', 'text-emerald-600', 9, true),
  ('infographic', 'Infographic', 'BarChart3', 'text-cyan-600', 10, true),
  ('live_streaming', 'Live Streaming', 'Radio', 'text-red-600', 11, true)
ON CONFLICT (name) DO NOTHING;

-- 3. Backfill existing sub-formats with their intended category_id
-- Healthcare sub-formats
UPDATE cast_content_sub_formats SET category_id = (SELECT id FROM cast_content_categories WHERE name='healthcare' LIMIT 1)
  WHERE name IN ('hcp_detailing','patient_education','surgical_procedure','clinical_trial','medical_roundtable','cme_module')
  AND category_id IS NULL;

-- Education sub-formats
UPDATE cast_content_sub_formats SET category_id = (SELECT id FROM cast_content_categories WHERE name='education' LIMIT 1)
  WHERE name IN ('edu_lecture','edu_explainer','edu_lab_demo','edu_curriculum','edu_assessment')
  AND category_id IS NULL;

-- Government sub-formats
UPDATE cast_content_sub_formats SET category_id = (SELECT id FROM cast_content_categories WHERE name='government' LIMIT 1)
  WHERE name IN ('gov_psa','gov_transparency','gov_policy','gov_townhall')
  AND category_id IS NULL;

-- Manufacturing sub-formats (was oil_gas, now manufacturing)
UPDATE cast_content_sub_formats SET category_id = (SELECT id FROM cast_content_categories WHERE name='manufacturing' LIMIT 1)
  WHERE name IN ('mfg_process','mfg_safety','mfg_quality')
  AND category_id IS NULL;

-- Travel sub-formats
UPDATE cast_content_sub_formats SET category_id = (SELECT id FROM cast_content_categories WHERE name='travel' LIMIT 1)
  WHERE name IN ('travel_destination','travel_review','travel_vlog','travel_itinerary')
  AND category_id IS NULL;

-- Retail/Marketing sub-formats (was commercial, now retail)
UPDATE cast_content_sub_formats SET category_id = (SELECT id FROM cast_content_categories WHERE name='retail' LIMIT 1)
  WHERE name IN ('mktg_brand_story','mktg_testimonial','mktg_product_launch','mktg_comparison','mktg_pitch_deck')
  AND category_id IS NULL;

-- Technology sub-formats
UPDATE cast_content_sub_formats SET category_id = (SELECT id FROM cast_content_categories WHERE name='technology' LIMIT 1)
  WHERE name IN ('tech_product_demo','tech_tutorial','tech_release_notes','tech_deep_dive','tech_architecture')
  AND category_id IS NULL;

-- Entertainment sub-formats (was media, now entertainment)
UPDATE cast_content_sub_formats SET category_id = (SELECT id FROM cast_content_categories WHERE name='entertainment' LIMIT 1)
  WHERE name IN ('media_trailer','media_bts','media_interview','media_commentary')
  AND category_id IS NULL;

-- Finance sub-formats
UPDATE cast_content_sub_formats SET category_id = (SELECT id FROM cast_content_categories WHERE name='finance' LIMIT 1)
  WHERE name IN ('fin_earnings','fin_compliance','fin_investor','fin_market_update')
  AND category_id IS NULL;

-- Real Estate sub-formats
UPDATE cast_content_sub_formats SET category_id = (SELECT id FROM cast_content_categories WHERE name='real_estate' LIMIT 1)
  WHERE name IN ('re_virtual_tour','re_listing','re_market_analysis','re_agent_brand')
  AND category_id IS NULL;

-- Automotive sub-formats
UPDATE cast_content_sub_formats SET category_id = (SELECT id FROM cast_content_categories WHERE name='automotive' LIMIT 1)
  WHERE name IN ('auto_launch','auto_test_drive','auto_dealership','auto_ev_campaign')
  AND category_id IS NULL;

-- Pharma & Biotech sub-formats
UPDATE cast_content_sub_formats SET category_id = (SELECT id FROM cast_content_categories WHERE name='pharma_biotech' LIMIT 1)
  WHERE name IN ('pharma_moa','pharma_clinical','pharma_detailing','pharma_safety')
  AND category_id IS NULL;

-- Agriculture sub-formats
UPDATE cast_content_sub_formats SET category_id = (SELECT id FROM cast_content_categories WHERE name='agriculture' LIMIT 1)
  WHERE name IN ('agri_crop_report','agri_tech_demo','agri_sustainability','agri_farm_story')
  AND category_id IS NULL;

-- Sports & Fitness sub-formats
UPDATE cast_content_sub_formats SET category_id = (SELECT id FROM cast_content_categories WHERE name='sports_fitness' LIMIT 1)
  WHERE name IN ('sports_highlights','sports_athlete','sports_fitness','sports_marketing')
  AND category_id IS NULL;

-- Fashion sub-formats
UPDATE cast_content_sub_formats SET category_id = (SELECT id FROM cast_content_categories WHERE name='fashion_apparel' LIMIT 1)
  WHERE name IN ('fashion_lookbook','fashion_runway','fashion_collection','fashion_styling')
  AND category_id IS NULL;

-- Beauty sub-formats
UPDATE cast_content_sub_formats SET category_id = (SELECT id FROM cast_content_categories WHERE name='beauty_cosmetics' LIMIT 1)
  WHERE name IN ('beauty_tutorial','beauty_product_demo','beauty_skincare','beauty_influencer')
  AND category_id IS NULL;

-- Gaming sub-formats
UPDATE cast_content_sub_formats SET category_id = (SELECT id FROM cast_content_categories WHERE name='gaming_esports' LIMIT 1)
  WHERE name IN ('gaming_trailer','gaming_esports','gaming_streamer','gaming_gameplay')
  AND category_id IS NULL;

-- Cybersecurity sub-formats
UPDATE cast_content_sub_formats SET category_id = (SELECT id FROM cast_content_categories WHERE name='cybersecurity' LIMIT 1)
  WHERE name IN ('cyber_briefing','cyber_awareness','cyber_product_demo','cyber_incident')
  AND category_id IS NULL;

-- Celebrations sub-formats
UPDATE cast_content_sub_formats SET category_id = (SELECT id FROM cast_content_categories WHERE name='celebrations' LIMIT 1)
  WHERE name IN ('celebration_wedding','celebration_festival','celebration_religious','celebration_milestone','celebration_corporate','celebration_sports')
  AND category_id IS NULL;

-- 4. Fix stale category names (seed-DB drift)
-- Rename 'media' → 'entertainment' if both exist
UPDATE cast_content_categories SET is_active = false
  WHERE name = 'media' AND EXISTS (SELECT 1 FROM cast_content_categories WHERE name = 'entertainment');

-- Rename 'commercial' → 'retail' if both exist
UPDATE cast_content_categories SET is_active = false
  WHERE name = 'commercial' AND EXISTS (SELECT 1 FROM cast_content_categories WHERE name = 'retail');

-- Rename 'oil_gas' → 'manufacturing' if both exist
UPDATE cast_content_categories SET is_active = false
  WHERE name = 'oil_gas' AND EXISTS (SELECT 1 FROM cast_content_categories WHERE name = 'manufacturing');

-- Deactivate fintech (merged into finance)
UPDATE cast_content_categories SET is_active = false WHERE name = 'fintech';

-- 5. Create index for faster category-aware sub-format lookups
CREATE INDEX IF NOT EXISTS idx_sub_formats_category_id ON cast_content_sub_formats(category_id);
CREATE INDEX IF NOT EXISTS idx_sub_formats_format_category ON cast_content_sub_formats(format_id, category_id);

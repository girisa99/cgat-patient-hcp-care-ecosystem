
-- ============================================================
-- 1. SEED SUB-FORMATS for all 8 formats
-- ============================================================

-- Podcast sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ('de8a383b-4241-4a55-a7e1-df7c1d97b44b', 'expert_interview', 'Expert Interview', 'UserCheck', 'One-on-one expert discussion', '{youtube,linkedin,podcast_video}', '{"tone":"authoritative","structure":"qa"}', 1),
  ('de8a383b-4241-4a55-a7e1-df7c1d97b44b', 'panel_discussion', 'Panel Discussion', 'Users', 'Multi-speaker roundtable', '{youtube,linkedin,podcast_video}', '{"tone":"collaborative","structure":"panel"}', 2),
  ('de8a383b-4241-4a55-a7e1-df7c1d97b44b', 'solo_narrative', 'Solo Narrative', 'Mic', 'Single host storytelling', '{youtube,tiktok,instagram_reels}', '{"tone":"personal","structure":"monologue"}', 3),
  ('de8a383b-4241-4a55-a7e1-df7c1d97b44b', 'case_study_audio', 'Case Study Audio', 'FileAudio', 'Deep-dive case analysis', '{linkedin,youtube}', '{"tone":"analytical","structure":"narrative"}', 4),
  ('de8a383b-4241-4a55-a7e1-df7c1d97b44b', 'news_briefing', 'News Briefing', 'Newspaper', 'Quick industry news recap', '{twitter,linkedin}', '{"tone":"urgent","structure":"bulletin"}', 5);

-- Webcast sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ('a33f5bb0-1b91-4b08-bfbd-9d56957b8e61', 'live_webinar', 'Live Webinar', 'Radio', 'Interactive live session', '{webinar,youtube,linkedin}', '{"tone":"educational","structure":"presentation_qa"}', 1),
  ('a33f5bb0-1b91-4b08-bfbd-9d56957b8e61', 'product_demo', 'Product Demo', 'Package', 'Live product walkthrough', '{webinar,youtube,product_page}', '{"tone":"persuasive","structure":"demo_flow"}', 2),
  ('a33f5bb0-1b91-4b08-bfbd-9d56957b8e61', 'training_session', 'Training Session', 'GraduationCap', 'Educational training broadcast', '{webinar,help_center}', '{"tone":"instructional","structure":"curriculum"}', 3),
  ('a33f5bb0-1b91-4b08-bfbd-9d56957b8e61', 'town_hall', 'Town Hall / AMA', 'Building2', 'Company-wide or community Q&A', '{webinar,youtube}', '{"tone":"transparent","structure":"open_qa"}', 4);

-- Video sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ('ca2e316e-d4a3-4a38-8c82-09cb08490a3c', 'explainer_video', 'Explainer Video', 'PlayCircle', 'Concept or product explainer', '{youtube,landing_page,product_page}', '{"tone":"clear","structure":"problem_solution"}', 1),
  ('ca2e316e-d4a3-4a38-8c82-09cb08490a3c', 'social_short', 'Social Short', 'Smartphone', 'Short-form vertical video', '{tiktok,instagram_reels,youtube_shorts}', '{"tone":"energetic","structure":"hook_value_cta"}', 2),
  ('ca2e316e-d4a3-4a38-8c82-09cb08490a3c', 'testimonial', 'Testimonial / Case Study', 'Quote', 'Customer success story', '{youtube,linkedin,landing_page}', '{"tone":"authentic","structure":"story_arc"}', 3),
  ('ca2e316e-d4a3-4a38-8c82-09cb08490a3c', 'brand_anthem', 'Brand Anthem', 'Flag', 'Emotional brand film', '{youtube,landing_page,ott_ctv}', '{"tone":"inspirational","structure":"cinematic"}', 4),
  ('ca2e316e-d4a3-4a38-8c82-09cb08490a3c', 'tutorial_howto', 'Tutorial / How-To', 'BookOpen', 'Step-by-step instructional', '{youtube,help_center}', '{"tone":"helpful","structure":"step_by_step"}', 5),
  ('ca2e316e-d4a3-4a38-8c82-09cb08490a3c', 'ad_commercial', 'Ad / Commercial', 'Megaphone', 'Promotional advertisement', '{facebook,instagram_post,ott_ctv,digital_signage}', '{"tone":"persuasive","structure":"aida"}', 6);

-- Presentation sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ('d843b120-b04b-4ec6-954c-31e6276cd337', 'sales_deck', 'Sales Deck', 'Briefcase', 'Revenue-driving pitch deck', '{sales_deck,presentation_slides}', '{"tone":"persuasive","structure":"pain_solution_roi"}', 1),
  ('d843b120-b04b-4ec6-954c-31e6276cd337', 'investor_pitch', 'Investor Pitch', 'TrendingUp', 'Fundraising presentation', '{presentation_slides}', '{"tone":"confident","structure":"problem_market_traction"}', 2),
  ('d843b120-b04b-4ec6-954c-31e6276cd337', 'training_deck', 'Training Deck', 'GraduationCap', 'Educational slide course', '{presentation_slides,help_center}', '{"tone":"instructional","structure":"module_based"}', 3),
  ('d843b120-b04b-4ec6-954c-31e6276cd337', 'report_summary', 'Report Summary', 'BarChart3', 'Data-driven report slides', '{presentation_slides,linkedin}', '{"tone":"analytical","structure":"data_narrative"}', 4),
  ('d843b120-b04b-4ec6-954c-31e6276cd337', 'conference_keynote', 'Conference Keynote', 'Award', 'Stage presentation', '{presentation_slides}', '{"tone":"visionary","structure":"story_insight_action"}', 5);

-- Script sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ('10ed613f-d0cc-4f31-842d-698857c2f954', 'blog_article', 'Blog / Article', 'FileText', 'Long-form written content', '{marketing_blog,linkedin}', '{"tone":"informative","structure":"intro_body_conclusion"}', 1),
  ('10ed613f-d0cc-4f31-842d-698857c2f954', 'social_post', 'Social Post Script', 'MessageSquare', 'Platform-specific copy', '{linkedin,twitter,facebook,instagram_post}', '{"tone":"conversational","structure":"hook_value_cta"}', 2),
  ('10ed613f-d0cc-4f31-842d-698857c2f954', 'email_sequence', 'Email Sequence', 'Mail', 'Multi-email campaign scripts', '{email_campaign}', '{"tone":"personal","structure":"drip_sequence"}', 3),
  ('10ed613f-d0cc-4f31-842d-698857c2f954', 'press_release', 'Press Release', 'Newspaper', 'Official announcement', '{marketing_blog,linkedin}', '{"tone":"formal","structure":"inverted_pyramid"}', 4),
  ('10ed613f-d0cc-4f31-842d-698857c2f954', 'whitepaper', 'Whitepaper', 'BookMarked', 'In-depth research document', '{landing_page,linkedin}', '{"tone":"authoritative","structure":"research_based"}', 5);

-- TTS sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ('a1ea0c76-9083-4c7f-9bf8-8ef6103a139b', 'ivr_phone_tree', 'IVR / Phone Tree', 'Phone', 'Automated phone system prompts', '{}', '{"tone":"professional","structure":"menu_based"}', 1),
  ('a1ea0c76-9083-4c7f-9bf8-8ef6103a139b', 'audiobook_narration', 'Audiobook Narration', 'BookOpen', 'Long-form audio reading', '{youtube}', '{"tone":"immersive","structure":"chapter_based"}', 2),
  ('a1ea0c76-9083-4c7f-9bf8-8ef6103a139b', 'announcement', 'Announcement / Alert', 'Bell', 'Short notification audio', '{whatsapp_status,sms_mms}', '{"tone":"clear","structure":"direct"}', 3),
  ('a1ea0c76-9083-4c7f-9bf8-8ef6103a139b', 'meditation_wellness', 'Meditation / Wellness', 'Heart', 'Guided relaxation audio', '{youtube}', '{"tone":"calm","structure":"guided"}', 4);

-- Voice/Voiceover sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ('65245e11-bad2-467f-a3d9-cbe5eedd18d8', 'commercial_vo', 'Commercial Voiceover', 'Megaphone', 'Ad/promo voice track', '{ott_ctv,digital_signage,facebook}', '{"tone":"energetic","structure":"scripted"}', 1),
  ('65245e11-bad2-467f-a3d9-cbe5eedd18d8', 'documentary_narration', 'Documentary Narration', 'Film', 'Long-form narration track', '{youtube}', '{"tone":"storytelling","structure":"narrative"}', 2),
  ('65245e11-bad2-467f-a3d9-cbe5eedd18d8', 'elearning_vo', 'E-Learning Voiceover', 'GraduationCap', 'Educational module narration', '{help_center}', '{"tone":"instructional","structure":"module_based"}', 3);

-- UGC sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ('d240b559-d789-4789-84a0-b5f418569973', 'unboxing_review', 'Unboxing / Review', 'Package', 'Product unboxing style', '{tiktok,instagram_reels,youtube_shorts}', '{"tone":"authentic","structure":"reveal"}', 1),
  ('d240b559-d789-4789-84a0-b5f418569973', 'day_in_life', 'Day in the Life', 'Sun', 'Lifestyle content format', '{tiktok,instagram_reels}', '{"tone":"relatable","structure":"vlog"}', 2),
  ('d240b559-d789-4789-84a0-b5f418569973', 'challenge_trend', 'Challenge / Trend', 'Flame', 'Viral challenge format', '{tiktok,instagram_reels,youtube_shorts}', '{"tone":"fun","structure":"trend_based"}', 3),
  ('d240b559-d789-4789-84a0-b5f418569973', 'before_after', 'Before & After', 'ArrowRightLeft', 'Transformation showcase', '{instagram_post,tiktok}', '{"tone":"dramatic","structure":"contrast"}', 4);

-- ============================================================
-- 2. WIRE FORMAT ↔ CAPABILITIES
-- ============================================================

-- Podcast → capabilities
INSERT INTO public.cast_format_capabilities (format_id, capability_id, is_default) VALUES
  ('de8a383b-4241-4a55-a7e1-df7c1d97b44b', 'fed73ca5-89dd-4783-87bf-cebfd94cfa69', true),  -- full_voiceover (default)
  ('de8a383b-4241-4a55-a7e1-df7c1d97b44b', 'e36708e7-107b-41e3-bb81-e306aaa8f5fa', false), -- scene_voiceover
  ('de8a383b-4241-4a55-a7e1-df7c1d97b44b', '05dd3261-4c72-4774-86f9-2f9d7295cd92', false), -- dubbing
  ('de8a383b-4241-4a55-a7e1-df7c1d97b44b', '9ed9fc86-b83a-4146-9b22-4beb73964205', false); -- text_to_image (cover art)

-- Webcast → capabilities
INSERT INTO public.cast_format_capabilities (format_id, capability_id, is_default) VALUES
  ('a33f5bb0-1b91-4b08-bfbd-9d56957b8e61', 'e36708e7-107b-41e3-bb81-e306aaa8f5fa', true),  -- scene_voiceover
  ('a33f5bb0-1b91-4b08-bfbd-9d56957b8e61', '926ca2f1-dfc5-4837-9dba-b5aa53f54f9c', true),  -- avatar_talking_head
  ('a33f5bb0-1b91-4b08-bfbd-9d56957b8e61', 'c3159239-cc80-411d-a44a-22e207219044', false), -- lip_sync
  ('a33f5bb0-1b91-4b08-bfbd-9d56957b8e61', '05dd3261-4c72-4774-86f9-2f9d7295cd92', false), -- dubbing
  ('a33f5bb0-1b91-4b08-bfbd-9d56957b8e61', '870d5824-8279-4c62-917f-0b9d3ccc52a6', false), -- text_to_video
  ('a33f5bb0-1b91-4b08-bfbd-9d56957b8e61', '8395276e-afb5-482a-bf79-a9a14e6b2f88', false), -- screen_recording
  ('a33f5bb0-1b91-4b08-bfbd-9d56957b8e61', 'f54d14ba-adec-4f29-9462-588f52acd3ca', false); -- live_streaming

-- Video → capabilities
INSERT INTO public.cast_format_capabilities (format_id, capability_id, is_default) VALUES
  ('ca2e316e-d4a3-4a38-8c82-09cb08490a3c', 'e36708e7-107b-41e3-bb81-e306aaa8f5fa', true),  -- scene_voiceover
  ('ca2e316e-d4a3-4a38-8c82-09cb08490a3c', '870d5824-8279-4c62-917f-0b9d3ccc52a6', true),  -- text_to_video
  ('ca2e316e-d4a3-4a38-8c82-09cb08490a3c', '9ed9fc86-b83a-4146-9b22-4beb73964205', true),  -- text_to_image
  ('ca2e316e-d4a3-4a38-8c82-09cb08490a3c', '926ca2f1-dfc5-4837-9dba-b5aa53f54f9c', false), -- avatar_talking_head
  ('ca2e316e-d4a3-4a38-8c82-09cb08490a3c', '593874d1-3e06-42a7-9226-ddb143af459c', false), -- avatar_full_body
  ('ca2e316e-d4a3-4a38-8c82-09cb08490a3c', 'c3159239-cc80-411d-a44a-22e207219044', false), -- lip_sync
  ('ca2e316e-d4a3-4a38-8c82-09cb08490a3c', '05dd3261-4c72-4774-86f9-2f9d7295cd92', false), -- dubbing
  ('ca2e316e-d4a3-4a38-8c82-09cb08490a3c', '9e90ad0f-3a7f-408e-a39b-f24ea131e475', false), -- diff_animate
  ('ca2e316e-d4a3-4a38-8c82-09cb08490a3c', '8a6e453d-b4b3-4492-ba39-bd5cbde8bc56', false), -- image_to_image
  ('ca2e316e-d4a3-4a38-8c82-09cb08490a3c', 'bd36611f-05c7-4bcd-b26a-cffa2f94fc0e', false), -- pixar_3d
  ('ca2e316e-d4a3-4a38-8c82-09cb08490a3c', '1a078f17-c0a6-488d-ad48-ae9cbeccab03', false), -- cartoon_animation
  ('ca2e316e-d4a3-4a38-8c82-09cb08490a3c', 'd6840890-1957-42e9-9856-9dd29198f3f6', false); -- vr_ar_immersive

-- Presentation → capabilities
INSERT INTO public.cast_format_capabilities (format_id, capability_id, is_default) VALUES
  ('d843b120-b04b-4ec6-954c-31e6276cd337', '760dd949-6a38-4934-ac80-b7e85b66c9bb', true),  -- slide_voiceover
  ('d843b120-b04b-4ec6-954c-31e6276cd337', '9ed9fc86-b83a-4146-9b22-4beb73964205', true),  -- text_to_image
  ('d843b120-b04b-4ec6-954c-31e6276cd337', '05dd3261-4c72-4774-86f9-2f9d7295cd92', false), -- dubbing
  ('d843b120-b04b-4ec6-954c-31e6276cd337', '9e90ad0f-3a7f-408e-a39b-f24ea131e475', false), -- diff_animate
  ('d843b120-b04b-4ec6-954c-31e6276cd337', '8a6e453d-b4b3-4492-ba39-bd5cbde8bc56', false); -- image_to_image

-- Script → capabilities
INSERT INTO public.cast_format_capabilities (format_id, capability_id, is_default) VALUES
  ('10ed613f-d0cc-4f31-842d-698857c2f954', '9ed9fc86-b83a-4146-9b22-4beb73964205', false), -- text_to_image (illustrations)
  ('10ed613f-d0cc-4f31-842d-698857c2f954', '05dd3261-4c72-4774-86f9-2f9d7295cd92', false); -- dubbing (multi-lang)

-- TTS → capabilities
INSERT INTO public.cast_format_capabilities (format_id, capability_id, is_default) VALUES
  ('a1ea0c76-9083-4c7f-9bf8-8ef6103a139b', 'fed73ca5-89dd-4783-87bf-cebfd94cfa69', true),  -- full_voiceover
  ('a1ea0c76-9083-4c7f-9bf8-8ef6103a139b', '05dd3261-4c72-4774-86f9-2f9d7295cd92', false); -- dubbing

-- Voice → capabilities
INSERT INTO public.cast_format_capabilities (format_id, capability_id, is_default) VALUES
  ('65245e11-bad2-467f-a3d9-cbe5eedd18d8', 'fed73ca5-89dd-4783-87bf-cebfd94cfa69', true),  -- full_voiceover
  ('65245e11-bad2-467f-a3d9-cbe5eedd18d8', 'c3159239-cc80-411d-a44a-22e207219044', false), -- lip_sync
  ('65245e11-bad2-467f-a3d9-cbe5eedd18d8', '05dd3261-4c72-4774-86f9-2f9d7295cd92', false); -- dubbing

-- UGC → capabilities
INSERT INTO public.cast_format_capabilities (format_id, capability_id, is_default) VALUES
  ('d240b559-d789-4789-84a0-b5f418569973', 'e36708e7-107b-41e3-bb81-e306aaa8f5fa', true),  -- scene_voiceover
  ('d240b559-d789-4789-84a0-b5f418569973', '926ca2f1-dfc5-4837-9dba-b5aa53f54f9c', true),  -- avatar_talking_head
  ('d240b559-d789-4789-84a0-b5f418569973', 'c3159239-cc80-411d-a44a-22e207219044', false), -- lip_sync
  ('d240b559-d789-4789-84a0-b5f418569973', '870d5824-8279-4c62-917f-0b9d3ccc52a6', false), -- text_to_video
  ('d240b559-d789-4789-84a0-b5f418569973', '9e90ad0f-3a7f-408e-a39b-f24ea131e475', false); -- diff_animate

-- ============================================================
-- 3. TEMPLATE GALLERY
-- ============================================================
CREATE TABLE public.cast_template_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_format_id uuid REFERENCES public.cast_content_sub_formats(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.cast_content_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  label text NOT NULL,
  description text,
  thumbnail_url text,
  preview_url text,
  -- Template structure
  scene_count integer NOT NULL DEFAULT 1,
  estimated_duration_seconds integer,
  template_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  enrichment_preset jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Tags for discovery
  tags text[] NOT NULL DEFAULT '{}',
  industry_tags text[] NOT NULL DEFAULT '{}',
  -- Metrics
  usage_count integer NOT NULL DEFAULT 0,
  avg_rating numeric(3,2) DEFAULT 0,
  -- Metadata
  is_featured boolean NOT NULL DEFAULT false,
  is_premium boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. MUSIC & SFX LIBRARY
-- ============================================================
CREATE TABLE public.cast_music_sfx_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  label text NOT NULL,
  type text NOT NULL DEFAULT 'music',  -- 'music', 'sfx', 'ambient', 'jingle'
  -- Categorization
  genre text,
  mood text,
  tempo text,  -- 'slow', 'medium', 'fast', 'variable'
  tags text[] NOT NULL DEFAULT '{}',
  -- Audio metadata
  duration_seconds numeric(8,2),
  bpm integer,
  key_signature text,
  audio_url text,
  preview_url text,
  waveform_data jsonb,
  -- Source & licensing
  source text NOT NULL DEFAULT 'generated',  -- 'generated', 'licensed', 'uploaded', 'elevenlabs'
  license_type text NOT NULL DEFAULT 'royalty_free',
  attribution_required boolean NOT NULL DEFAULT false,
  attribution_text text,
  -- Generation config (if AI-generated)
  generation_prompt text,
  generation_provider text,
  -- Metrics
  usage_count integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. A/B VARIANT GENERATION
-- ============================================================
CREATE TABLE public.cast_project_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.cast_projects(id) ON DELETE CASCADE,
  variant_label text NOT NULL DEFAULT 'A',  -- A, B, C...
  variant_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Diff from parent
  tone_override text,
  style_override text,
  cta_override text,
  audience_override text,
  -- Output
  output_url text,
  thumbnail_url text,
  -- Performance (post-publish)
  performance_metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_winner boolean NOT NULL DEFAULT false,
  -- Status
  status text NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. ACCESSIBILITY CONFIG
-- ============================================================
CREATE TABLE public.cast_accessibility_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.cast_projects(id) ON DELETE CASCADE,
  -- Captions & Subtitles
  auto_captions boolean NOT NULL DEFAULT true,
  caption_languages text[] NOT NULL DEFAULT '{en}',
  caption_style jsonb NOT NULL DEFAULT '{"fontSize":16,"position":"bottom","background":"semi-transparent"}'::jsonb,
  -- Alt text
  auto_alt_text boolean NOT NULL DEFAULT true,
  -- Audio descriptions
  audio_descriptions boolean NOT NULL DEFAULT false,
  audio_description_voice text,
  -- Transcript
  auto_transcript boolean NOT NULL DEFAULT true,
  -- Color/contrast
  high_contrast_mode boolean NOT NULL DEFAULT false,
  -- Sign language
  sign_language_overlay boolean NOT NULL DEFAULT false,
  sign_language_region text,
  -- Metadata
  wcag_level text NOT NULL DEFAULT 'AA',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id)
);

-- ============================================================
-- RLS for all new tables
-- ============================================================
ALTER TABLE public.cast_template_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_music_sfx_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_project_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_accessibility_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active templates" ON public.cast_template_gallery FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated can manage templates" ON public.cast_template_gallery FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can read active music" ON public.cast_music_sfx_library FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated can manage music" ON public.cast_music_sfx_library FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can read own variants" ON public.cast_project_variants FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.cast_projects cp WHERE cp.id = project_id AND cp.user_id = auth.uid())
);
CREATE POLICY "Users can manage own variants" ON public.cast_project_variants FOR ALL USING (
  EXISTS (SELECT 1 FROM public.cast_projects cp WHERE cp.id = project_id AND cp.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.cast_projects cp WHERE cp.id = project_id AND cp.user_id = auth.uid())
);

CREATE POLICY "Users can read own accessibility" ON public.cast_accessibility_config FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.cast_projects cp WHERE cp.id = project_id AND cp.user_id = auth.uid())
);
CREATE POLICY "Users can manage own accessibility" ON public.cast_accessibility_config FOR ALL USING (
  EXISTS (SELECT 1 FROM public.cast_projects cp WHERE cp.id = project_id AND cp.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.cast_projects cp WHERE cp.id = project_id AND cp.user_id = auth.uid())
);

-- Triggers
CREATE TRIGGER update_cast_template_gallery_updated_at BEFORE UPDATE ON public.cast_template_gallery FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cast_music_sfx_library_updated_at BEFORE UPDATE ON public.cast_music_sfx_library FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cast_project_variants_updated_at BEFORE UPDATE ON public.cast_project_variants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cast_accessibility_config_updated_at BEFORE UPDATE ON public.cast_accessibility_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Phase 1: Registry Reconciliation — Expand formats, sub-formats, category-format links
-- Gemini Cast Pipeline Reconciliation Plan

-- ============================================================================
-- 1A. Expand Media Formats (8 → 16)
-- ============================================================================
INSERT INTO public.cast_content_formats (name, label, icon, color, description, requires_messaging, requires_tts, requires_video, sort_order) VALUES
  ('website',              'Website / Landing Page',    'Globe',         'text-blue-500',   'Website and landing page content',                       true,  false, false, 9),
  ('infographic',          'Infographic / Data Viz',    'BarChart3',     'text-emerald-600','Data visualizations and infographics',                   false, false, false, 10),
  ('training',             'Training / E-Learning',     'BookOpen',      'text-amber-600',  'Training modules and e-learning courses',                true,  true,  true,  11),
  ('meeting_intelligence', 'Meeting Intelligence',      'Users',         'text-slate-600',  'Meeting recaps, architecture diagrams, business flows',  false, false, false, 12),
  ('email_campaign',       'Email / Newsletter',        'Mail',          'text-rose-600',   'Email campaigns and newsletters',                        true,  false, false, 13),
  ('kids_education',       'Kids / Animation',          'Smile',         'text-yellow-500', 'Kids educational and animated content',                  true,  true,  true,  14),
  ('event_content',        'Event / Recap',             'Calendar',      'text-violet-600', 'Event recaps and highlight reels',                       true,  false, true,  15),
  ('document',             'Whitepaper / Case Study',   'FileText',      'text-gray-600',   'Whitepapers, case studies, and long-form documents',     true,  false, false, 16)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 1B. Expand Sub-Formats (~25 new entries for new + existing parent formats)
-- ============================================================================

-- Video: additional sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'long_form',         'Long-Form Video',         'Film',        'text-red-700',    'Full-length video content (5+ min)',     ARRAY['youtube','vimeo'],                     '{"tone":"comprehensive","structure":"chapters","narrative":"documentary"}', 7),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'cinematic',         'Cinematic Film',          'Clapperboard','text-amber-700',  'Cinematic-quality video production',     ARRAY['youtube','vimeo'],                     '{"tone":"cinematic","structure":"narrative_arc","narrative":"dramatic"}', 8),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'animated',          'Animated Video',          'Wand2',       'text-purple-600', 'Fully animated explainer or story',      ARRAY['youtube','tiktok','instagram_reels'],  '{"tone":"playful","structure":"storyboard","narrative":"character-driven"}', 9),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'slide_deck_video',  'Slide Deck Video',        'Presentation','text-orange-500', 'Slides with video narration overlay',    ARRAY['youtube','linkedin'],                  '{"tone":"professional","structure":"slides","narrative":"educational"}', 10),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'event_recap_video', 'Event Recap Video',       'Calendar',    'text-violet-500', 'Highlights from events and conferences', ARRAY['youtube','linkedin','twitter'],         '{"tone":"energetic","structure":"highlights","narrative":"recap"}', 11)
ON CONFLICT (format_id, name) DO NOTHING;

-- Podcast: additional sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='podcast'), 'audio_drama',  'Audio Drama',        'Drama',    'text-red-500',    'Scripted audio drama with voice actors',   ARRAY['spotify','apple_podcasts'],  '{"tone":"dramatic","structure":"acts","narrative":"scripted"}', 6),
  ((SELECT id FROM cast_content_formats WHERE name='podcast'), 'roundtable',   'Roundtable',         'Users',    'text-blue-500',   'Multi-host discussion format',             ARRAY['spotify','youtube','apple_podcasts'], '{"tone":"conversational","structure":"topics","narrative":"discussion"}', 7),
  ((SELECT id FROM cast_content_formats WHERE name='podcast'), 'q_and_a',      'Q&A Session',        'HelpCircle','text-green-500', 'Audience question and answer format',      ARRAY['spotify','youtube','apple_podcasts'], '{"tone":"helpful","structure":"questions","narrative":"responsive"}', 8)
ON CONFLICT (format_id, name) DO NOTHING;

-- Presentation: additional sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='presentation'), 'product_demo_deck',     'Product Demo Deck',     'Monitor',    'text-blue-600',  'Interactive product demonstration slides',  ARRAY['linkedin','website'],       '{"tone":"demo","structure":"feature_walkthrough","narrative":"product-led"}', 6),
  ((SELECT id FROM cast_content_formats WHERE name='presentation'), 'competitive_analysis',  'Competitive Analysis',  'Target',     'text-red-500',   'Market competitive analysis deck',          ARRAY['linkedin','website'],       '{"tone":"analytical","structure":"comparison","narrative":"data-driven"}', 7),
  ((SELECT id FROM cast_content_formats WHERE name='presentation'), 'onboarding_deck',       'Onboarding Deck',       'UserPlus',   'text-green-600', 'New customer/employee onboarding slides',   ARRAY['website','slack'],          '{"tone":"welcoming","structure":"sequential","narrative":"guided"}', 8)
ON CONFLICT (format_id, name) DO NOTHING;

-- Website: new parent format sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='website'), 'landing_page',     'Landing Page',        'FileText',   'text-blue-500',   'Conversion-optimized landing page',          ARRAY['website'],           '{"tone":"persuasive","structure":"hero_features_cta","narrative":"conversion"}', 1),
  ((SELECT id FROM cast_content_formats WHERE name='website'), 'product_page',     'Product Page',        'Package',    'text-purple-500', 'Detailed product information page',           ARRAY['website'],           '{"tone":"informative","structure":"specs_benefits","narrative":"product-led"}', 2),
  ((SELECT id FROM cast_content_formats WHERE name='website'), 'microsite',        'Microsite',           'Layout',     'text-teal-500',   'Campaign-specific standalone microsite',      ARRAY['website'],           '{"tone":"campaign","structure":"multi_section","narrative":"story"}', 3),
  ((SELECT id FROM cast_content_formats WHERE name='website'), 'hero_banner',      'Hero Banner',         'Image',      'text-amber-500',  'Hero section with visual and CTA',            ARRAY['website'],           '{"tone":"bold","structure":"visual_cta","narrative":"hook"}', 4),
  ((SELECT id FROM cast_content_formats WHERE name='website'), 'interactive_demo', 'Interactive Demo',    'MousePointer','text-green-500', 'Interactive product walkthrough on web',      ARRAY['website'],           '{"tone":"engaging","structure":"steps","narrative":"guided_tour"}', 5)
ON CONFLICT (format_id, name) DO NOTHING;

-- Training: new parent format sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='training'), 'training_manual',   'Training Manual',     'Book',       'text-amber-600',  'Comprehensive training documentation',        ARRAY['website','lms'],     '{"tone":"instructional","structure":"chapters","narrative":"step_by_step"}', 1),
  ((SELECT id FROM cast_content_formats WHERE name='training'), 'course_series',     'Course Series',       'Library',    'text-blue-600',   'Multi-part educational course',               ARRAY['youtube','lms'],     '{"tone":"educational","structure":"modules","narrative":"progressive"}', 2),
  ((SELECT id FROM cast_content_formats WHERE name='training'), 'elearning_module',  'E-Learning Module',   'Monitor',    'text-green-600',  'Interactive e-learning with quizzes',          ARRAY['lms','website'],     '{"tone":"engaging","structure":"lesson_quiz","narrative":"interactive"}', 3),
  ((SELECT id FROM cast_content_formats WHERE name='training'), 'tutorial_series',   'Tutorial Series',     'PlayCircle', 'text-purple-600', 'Step-by-step tutorial video series',          ARRAY['youtube','lms'],     '{"tone":"helpful","structure":"steps","narrative":"hands_on"}', 4)
ON CONFLICT (format_id, name) DO NOTHING;

-- Meeting Intelligence: sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='meeting_intelligence'), 'meeting_recap',        'Meeting Recap',         'FileText',   'text-slate-600', 'AI-generated meeting summary and actions',    ARRAY['slack','email','website'],   '{"tone":"concise","structure":"summary_actions","narrative":"factual"}', 1),
  ((SELECT id FROM cast_content_formats WHERE name='meeting_intelligence'), 'architecture_diagram', 'Architecture Diagram',  'GitBranch',  'text-blue-600',  'System architecture visualization',           ARRAY['website','confluence'],      '{"tone":"technical","structure":"diagram","narrative":"system_flow"}', 2),
  ((SELECT id FROM cast_content_formats WHERE name='meeting_intelligence'), 'business_flow',        'Business Flow',         'Workflow',   'text-green-600', 'Business process workflow documentation',      ARRAY['website','confluence'],      '{"tone":"operational","structure":"flowchart","narrative":"process"}', 3)
ON CONFLICT (format_id, name) DO NOTHING;

-- Email Campaign: sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='email_campaign'), 'drip_campaign',     'Drip Campaign',       'Repeat',    'text-rose-600',  'Automated multi-email nurture sequence',       ARRAY['email'],               '{"tone":"nurturing","structure":"sequence","narrative":"progressive"}', 1),
  ((SELECT id FROM cast_content_formats WHERE name='email_campaign'), 'newsletter',        'Newsletter',          'Newspaper', 'text-blue-500',  'Recurring newsletter for subscribers',          ARRAY['email'],               '{"tone":"informative","structure":"sections","narrative":"curated"}', 2),
  ((SELECT id FROM cast_content_formats WHERE name='email_campaign'), 'welcome_sequence',  'Welcome Sequence',    'UserPlus',  'text-green-500', 'New subscriber/customer onboarding emails',    ARRAY['email'],               '{"tone":"welcoming","structure":"onboarding","narrative":"guided"}', 3)
ON CONFLICT (format_id, name) DO NOTHING;

-- Kids Education: sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='kids_education'), 'animated_story',    'Animated Story',      'BookOpen',  'text-yellow-500', 'Animated educational storytelling',              ARRAY['youtube','lms'],       '{"tone":"playful","structure":"story_arc","narrative":"character_driven"}', 1),
  ((SELECT id FROM cast_content_formats WHERE name='kids_education'), 'interactive_quiz',  'Interactive Quiz',    'HelpCircle','text-green-500', 'Interactive quiz-based learning content',        ARRAY['website','lms'],       '{"tone":"fun","structure":"question_answer","narrative":"gamified"}', 2),
  ((SELECT id FROM cast_content_formats WHERE name='kids_education'), 'sing_along',        'Sing-Along',          'Music',     'text-pink-500',  'Musical educational content for children',       ARRAY['youtube','spotify'],   '{"tone":"musical","structure":"verse_chorus","narrative":"participatory"}', 3)
ON CONFLICT (format_id, name) DO NOTHING;

-- Event Content: sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='event_content'), 'event_highlight',   'Event Highlight Reel', 'Sparkles',  'text-violet-600', 'Best moments compilation from events',          ARRAY['youtube','linkedin','instagram'],   '{"tone":"energetic","structure":"highlights","narrative":"showcase"}', 1),
  ((SELECT id FROM cast_content_formats WHERE name='event_content'), 'speaker_spotlight', 'Speaker Spotlight',    'Mic2',      'text-blue-600',  'Featured speaker clips and interviews',          ARRAY['youtube','linkedin'],               '{"tone":"professional","structure":"interview","narrative":"expert"}', 2),
  ((SELECT id FROM cast_content_formats WHERE name='event_content'), 'post_event_recap',  'Post-Event Recap',     'ClipboardCheck','text-green-600','Comprehensive event summary and takeaways',   ARRAY['youtube','linkedin','email'],        '{"tone":"summary","structure":"recap","narrative":"takeaway"}', 3)
ON CONFLICT (format_id, name) DO NOTHING;

-- Document: sub-formats
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='document'), 'whitepaper_report',  'Whitepaper / Report',  'FileText',  'text-gray-600',  'In-depth research or industry report',            ARRAY['website','linkedin'],      '{"tone":"authoritative","structure":"sections","narrative":"research"}', 1),
  ((SELECT id FROM cast_content_formats WHERE name='document'), 'case_study_doc',     'Case Study',           'Award',     'text-green-600', 'Customer success case study document',             ARRAY['website','linkedin'],      '{"tone":"proof","structure":"problem_solution_result","narrative":"story"}', 2),
  ((SELECT id FROM cast_content_formats WHERE name='document'), 'proposal_doc',       'Proposal / RFP',       'FileCheck', 'text-blue-600',  'Business proposal or RFP response',               ARRAY['website','email'],         '{"tone":"professional","structure":"executive_summary_detail","narrative":"persuasive"}', 3)
ON CONFLICT (format_id, name) DO NOTHING;

-- ============================================================================
-- 1C. Populate Category-Format Links
-- Only insert meaningful combinations (not all 288). This enables the hook's
-- "if links exist, filter by them" logic to restrict format options per industry.
-- For now, insert all combos (every industry can produce any format).
-- Specific restrictions can be added later by removing rows.
-- ============================================================================
INSERT INTO public.cast_category_formats (category_id, format_id, is_active)
SELECT c.id, f.id, true
FROM public.cast_content_categories c
CROSS JOIN public.cast_content_formats f
WHERE c.is_active = true AND f.is_active = true
ON CONFLICT (category_id, format_id) DO NOTHING;

-- ============================================================================
-- 1D. Comments update (pipeline count reference updated in code, not SQL)
-- ============================================================================

-- Add food_beverage and finance categories if they somehow don't exist yet
INSERT INTO public.cast_content_categories (name, label, description, icon, color, sort_order) VALUES
  ('food_beverage', 'Food & Beverages', 'Food and beverage industry content', 'UtensilsCrossed', 'text-orange-500', 20)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.cast_content_categories (name, label, description, icon, color, sort_order) VALUES
  ('finance', 'Finance & Banking', 'Financial services and banking content', 'DollarSign', 'text-emerald-600', 9)
ON CONFLICT (name) DO NOTHING;

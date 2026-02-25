-- ============================================================================
-- Phase 7B: Category-specific sub-formats for ALL original industries
-- + Ensure complete sub-variant coverage for all style groups
--
-- This migration adds:
--   1. Sub-formats specific to each original industry category
--   2. Additional parent style visual sub-variants where gaps exist
--   3. Cross-reference enrichment presets per category × format
--
-- Date: 2026-02-25
-- ============================================================================

-- ============================================================================
-- 1. HEALTHCARE category sub-formats
-- ============================================================================
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'hcp_detailing', 'HCP Detailing Video', 'Stethoscope', 'text-red-600', 'Physician-facing product detailing video', ARRAY['website','email'], '{"tone":"clinical","structure":"evidence_based","narrative":"medical_detailing","compliance":"isi_required"}', 70),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'patient_education', 'Patient Education', 'HeartPulse', 'text-pink-500', 'Patient-facing educational content', ARRAY['youtube','website'], '{"tone":"empathetic","structure":"qa","narrative":"patient_journey","compliance":"fda_compliant"}', 71),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'surgical_procedure', 'Surgical Procedure', 'Scissors', 'text-red-700', 'Step-by-step surgical technique', ARRAY['youtube','lms'], '{"tone":"technical","structure":"sequential","narrative":"procedure","compliance":"hipaa"}', 72),
  ((SELECT id FROM cast_content_formats WHERE name='presentation'), 'clinical_trial', 'Clinical Trial Summary', 'FileCheck', 'text-blue-600', 'Trial results and endpoints deck', ARRAY['website','linkedin'], '{"tone":"evidence_based","structure":"data","narrative":"statistical"}', 60),
  ((SELECT id FROM cast_content_formats WHERE name='podcast'), 'medical_roundtable', 'Medical Roundtable', 'Users', 'text-red-500', 'KOL discussion on medical topics', ARRAY['spotify','apple_podcasts'], '{"tone":"expert","structure":"discussion","narrative":"peer_review"}', 10),
  ((SELECT id FROM cast_content_formats WHERE name='training'), 'cme_module', 'CME Module', 'GraduationCap', 'text-green-600', 'Continuing medical education module', ARRAY['lms','website'], '{"tone":"educational","structure":"module","narrative":"assessment"}', 20)
ON CONFLICT (format_id, name) DO NOTHING;

-- ============================================================================
-- 2. EDUCATION category sub-formats
-- ============================================================================
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'edu_lecture', 'Lecture Recording', 'GraduationCap', 'text-green-600', 'University-style recorded lecture', ARRAY['youtube','lms'], '{"tone":"academic","structure":"lecture","narrative":"educational"}', 73),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'edu_explainer', 'Concept Explainer', 'Lightbulb', 'text-yellow-500', 'Visual concept explanation', ARRAY['youtube','tiktok'], '{"tone":"clear","structure":"concept_map","narrative":"progressive"}', 74),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'edu_lab_demo', 'Lab Demo', 'FlaskConical', 'text-emerald-600', 'Science lab demonstration', ARRAY['youtube','lms'], '{"tone":"scientific","structure":"experiment","narrative":"hypothesis_test"}', 75),
  ((SELECT id FROM cast_content_formats WHERE name='presentation'), 'edu_curriculum', 'Curriculum Deck', 'BookOpen', 'text-green-500', 'Course curriculum overview', ARRAY['website','lms'], '{"tone":"structured","structure":"outline","narrative":"sequential"}', 61),
  ((SELECT id FROM cast_content_formats WHERE name='training'), 'edu_assessment', 'Assessment Module', 'HelpCircle', 'text-orange-500', 'Quiz and assessment module', ARRAY['lms','website'], '{"tone":"evaluative","structure":"quiz","narrative":"testing"}', 21)
ON CONFLICT (format_id, name) DO NOTHING;

-- ============================================================================
-- 3. GOVERNMENT category sub-formats
-- ============================================================================
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'gov_psa', 'Public Service Announcement', 'Landmark', 'text-slate-600', 'Government PSA video', ARRAY['youtube','tv'], '{"tone":"authoritative","structure":"message","narrative":"civic"}', 76),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'gov_transparency', 'Transparency Report', 'Eye', 'text-blue-600', 'Government transparency video', ARRAY['youtube','website'], '{"tone":"transparent","structure":"report","narrative":"accountability"}', 77),
  ((SELECT id FROM cast_content_formats WHERE name='presentation'), 'gov_policy', 'Policy Brief', 'FileText', 'text-slate-700', 'Policy document presentation', ARRAY['website'], '{"tone":"formal","structure":"policy","narrative":"legislative"}', 62),
  ((SELECT id FROM cast_content_formats WHERE name='podcast'), 'gov_townhall', 'Virtual Town Hall', 'Users', 'text-blue-500', 'Public engagement podcast', ARRAY['spotify','youtube'], '{"tone":"inclusive","structure":"qa","narrative":"participatory"}', 11)
ON CONFLICT (format_id, name) DO NOTHING;

-- ============================================================================
-- 4. MANUFACTURING category sub-formats
-- ============================================================================
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'mfg_process', 'Manufacturing Process', 'Factory', 'text-amber-600', 'Factory floor process video', ARRAY['youtube','website'], '{"tone":"technical","structure":"process","narrative":"industrial"}', 78),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'mfg_safety', 'Safety Compliance', 'ShieldCheck', 'text-red-500', 'Manufacturing safety training', ARRAY['lms','youtube'], '{"tone":"serious","structure":"checklist","narrative":"osha_compliance"}', 79),
  ((SELECT id FROM cast_content_formats WHERE name='presentation'), 'mfg_quality', 'Quality Report', 'Award', 'text-emerald-600', 'QA/QC metrics presentation', ARRAY['website','email'], '{"tone":"data_driven","structure":"metrics","narrative":"quality"}', 63)
ON CONFLICT (format_id, name) DO NOTHING;

-- ============================================================================
-- 5. TRAVEL & HOSPITALITY category sub-formats
-- ============================================================================
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'travel_destination', 'Destination Showcase', 'MapPin', 'text-cyan-600', 'Travel destination highlight video', ARRAY['youtube','instagram_reels','tiktok'], '{"tone":"inspiring","structure":"showcase","narrative":"wanderlust"}', 80),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'travel_review', 'Hotel/Restaurant Review', 'Star', 'text-amber-500', 'Hospitality review content', ARRAY['youtube','tiktok'], '{"tone":"authentic","structure":"review","narrative":"experience"}', 81),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'travel_vlog', 'Travel Vlog', 'Camera', 'text-teal-500', 'Personal travel experience', ARRAY['youtube','instagram_reels'], '{"tone":"personal","structure":"diary","narrative":"adventure"}', 82),
  ((SELECT id FROM cast_content_formats WHERE name='presentation'), 'travel_itinerary', 'Itinerary Deck', 'Map', 'text-blue-500', 'Trip planning presentation', ARRAY['website','email'], '{"tone":"organized","structure":"timeline","narrative":"planned"}', 64)
ON CONFLICT (format_id, name) DO NOTHING;

-- ============================================================================
-- 6. COMMERCIAL & MARKETING category sub-formats
-- ============================================================================
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'mktg_brand_story', 'Brand Story', 'Heart', 'text-purple-600', 'Emotional brand narrative', ARRAY['youtube','website'], '{"tone":"emotional","structure":"narrative_arc","narrative":"brand_origin"}', 83),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'mktg_testimonial', 'Customer Testimonial', 'Quote', 'text-blue-500', 'Customer success story video', ARRAY['youtube','linkedin','website'], '{"tone":"authentic","structure":"interview","narrative":"social_proof"}', 84),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'mktg_product_launch', 'Product Launch', 'Rocket', 'text-orange-600', 'New product announcement', ARRAY['youtube','linkedin','twitter'], '{"tone":"exciting","structure":"reveal","narrative":"launch"}', 85),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'mktg_comparison', 'Competitive Comparison', 'ArrowLeftRight', 'text-red-500', 'Product comparison video', ARRAY['youtube','website'], '{"tone":"factual","structure":"comparison","narrative":"differentiator"}', 86),
  ((SELECT id FROM cast_content_formats WHERE name='presentation'), 'mktg_pitch_deck', 'Pitch Deck', 'Presentation', 'text-purple-500', 'Investor or sales pitch', ARRAY['website','linkedin'], '{"tone":"persuasive","structure":"pitch","narrative":"investment"}', 65)
ON CONFLICT (format_id, name) DO NOTHING;

-- ============================================================================
-- 7. TECHNOLOGY category sub-formats
-- ============================================================================
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'tech_product_demo', 'Tech Product Demo', 'Monitor', 'text-indigo-600', 'Software/hardware demonstration', ARRAY['youtube','linkedin'], '{"tone":"technical","structure":"demo","narrative":"feature_walkthrough"}', 87),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'tech_tutorial', 'Developer Tutorial', 'Code', 'text-green-600', 'Code walkthrough or tutorial', ARRAY['youtube'], '{"tone":"educational","structure":"step_by_step","narrative":"coding"}', 88),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'tech_release_notes', 'Release Notes Video', 'GitBranch', 'text-blue-500', 'Software update announcement', ARRAY['youtube','twitter'], '{"tone":"informative","structure":"changelog","narrative":"update"}', 89),
  ((SELECT id FROM cast_content_formats WHERE name='podcast'), 'tech_deep_dive', 'Tech Deep Dive', 'Cpu', 'text-indigo-500', 'Technical podcast episode', ARRAY['spotify','youtube'], '{"tone":"analytical","structure":"deep_dive","narrative":"technical"}', 12),
  ((SELECT id FROM cast_content_formats WHERE name='presentation'), 'tech_architecture', 'Architecture Overview', 'GitBranch', 'text-indigo-600', 'System architecture deck', ARRAY['website','linkedin'], '{"tone":"technical","structure":"diagram","narrative":"system_design"}', 66)
ON CONFLICT (format_id, name) DO NOTHING;

-- ============================================================================
-- 8. MEDIA & ENTERTAINMENT category sub-formats
-- ============================================================================
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'media_trailer', 'Movie/Show Trailer', 'Film', 'text-blue-600', 'Cinematic trailer for film or series', ARRAY['youtube','cinema'], '{"tone":"cinematic","structure":"teaser","narrative":"dramatic"}', 90),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'media_bts', 'Behind the Scenes', 'Camera', 'text-amber-500', 'Behind-the-scenes production footage', ARRAY['youtube','instagram'], '{"tone":"authentic","structure":"documentary","narrative":"access"}', 91),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'media_interview', 'Celebrity Interview', 'Mic2', 'text-purple-500', 'Interview with talent or creators', ARRAY['youtube','linkedin'], '{"tone":"engaging","structure":"interview","narrative":"personality"}', 92),
  ((SELECT id FROM cast_content_formats WHERE name='podcast'), 'media_commentary', 'Film Commentary', 'Film', 'text-blue-500', 'Movie or show analysis podcast', ARRAY['spotify','apple_podcasts'], '{"tone":"analytical","structure":"review","narrative":"critique"}', 13)
ON CONFLICT (format_id, name) DO NOTHING;

-- ============================================================================
-- 9. REAL ESTATE category sub-formats
-- ============================================================================
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 're_virtual_tour', 'Virtual Property Tour', 'Home', 'text-orange-600', '360 or walkthrough property tour', ARRAY['youtube','website','zillow'], '{"tone":"inviting","structure":"walkthrough","narrative":"tour"}', 93),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 're_neighborhood', 'Neighborhood Guide', 'MapPin', 'text-green-600', 'Area and amenities showcase', ARRAY['youtube','website'], '{"tone":"informative","structure":"guide","narrative":"lifestyle"}', 94),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 're_agent_intro', 'Agent Introduction', 'User', 'text-blue-500', 'Real estate agent personal branding', ARRAY['youtube','linkedin','website'], '{"tone":"personal","structure":"intro","narrative":"trust_building"}', 95),
  ((SELECT id FROM cast_content_formats WHERE name='presentation'), 're_market_report', 'Market Report', 'BarChart3', 'text-orange-500', 'Real estate market analysis', ARRAY['website','linkedin'], '{"tone":"analytical","structure":"data","narrative":"market_trends"}', 67)
ON CONFLICT (format_id, name) DO NOTHING;

-- ============================================================================
-- 10. AUTOMOTIVE category sub-formats
-- ============================================================================
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'auto_review', 'Car Review', 'Car', 'text-gray-600', 'In-depth vehicle review', ARRAY['youtube'], '{"tone":"expert","structure":"review","narrative":"test_drive"}', 96),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'auto_launch', 'Vehicle Launch Event', 'Rocket', 'text-red-500', 'New model reveal video', ARRAY['youtube','instagram'], '{"tone":"exciting","structure":"reveal","narrative":"launch"}', 97),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'auto_configurator', 'Virtual Configurator', 'Settings', 'text-blue-500', 'Interactive car configuration', ARRAY['website'], '{"tone":"interactive","structure":"customization","narrative":"build_your_own"}', 98)
ON CONFLICT (format_id, name) DO NOTHING;

-- ============================================================================
-- 11. PROFESSIONAL SERVICES category sub-formats
-- ============================================================================
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'prof_thought_leader', 'Thought Leadership', 'Lightbulb', 'text-blue-500', 'Expert thought leadership content', ARRAY['youtube','linkedin'], '{"tone":"authoritative","structure":"thesis","narrative":"expert_opinion"}', 99),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'prof_case_study', 'Case Study Video', 'Award', 'text-green-600', 'Client success story', ARRAY['youtube','linkedin','website'], '{"tone":"professional","structure":"problem_solution","narrative":"results"}', 100),
  ((SELECT id FROM cast_content_formats WHERE name='presentation'), 'prof_proposal', 'Service Proposal', 'FileCheck', 'text-blue-600', 'Professional services proposal', ARRAY['website','email'], '{"tone":"professional","structure":"proposal","narrative":"value_prop"}', 68)
ON CONFLICT (format_id, name) DO NOTHING;

-- ============================================================================
-- 12. NONPROFIT & NGO category sub-formats
-- ============================================================================
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'npo_impact_story', 'Impact Story', 'Heart', 'text-pink-600', 'Beneficiary impact narrative', ARRAY['youtube','facebook','instagram'], '{"tone":"emotional","structure":"story","narrative":"impact"}', 101),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'npo_fundraiser', 'Fundraising Appeal', 'HandCoins', 'text-green-600', 'Donation appeal video', ARRAY['youtube','facebook','email'], '{"tone":"urgent","structure":"appeal","narrative":"call_to_action"}', 102),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'npo_annual_report', 'Annual Report Video', 'BarChart3', 'text-blue-500', 'Yearly impact and financial summary', ARRAY['youtube','website'], '{"tone":"transparent","structure":"report","narrative":"accountability"}', 103)
ON CONFLICT (format_id, name) DO NOTHING;

-- ============================================================================
-- 13. LEGAL SERVICES category sub-formats
-- ============================================================================
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'legal_explainer', 'Legal Explainer', 'Scale', 'text-slate-700', 'Legal concept explanation', ARRAY['youtube','website'], '{"tone":"authoritative","structure":"educational","narrative":"legal"}', 104),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'legal_client_guide', 'Client Rights Guide', 'Shield', 'text-blue-600', 'Know-your-rights video', ARRAY['youtube','website'], '{"tone":"empowering","structure":"guide","narrative":"rights"}', 105),
  ((SELECT id FROM cast_content_formats WHERE name='podcast'), 'legal_roundup', 'Legal Roundup', 'Gavel', 'text-slate-600', 'Weekly legal news podcast', ARRAY['spotify','apple_podcasts'], '{"tone":"informative","structure":"news","narrative":"legal_updates"}', 14)
ON CONFLICT (format_id, name) DO NOTHING;

-- ============================================================================
-- 14. LOGISTICS & SUPPLY CHAIN category sub-formats
-- ============================================================================
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'logistics_operations', 'Operations Overview', 'Truck', 'text-teal-600', 'Warehouse and logistics operations', ARRAY['youtube','linkedin'], '{"tone":"efficient","structure":"process","narrative":"operational"}', 106),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'logistics_tracking', 'Supply Chain Tracking', 'Package', 'text-blue-500', 'Real-time tracking demonstration', ARRAY['youtube','website'], '{"tone":"technical","structure":"demo","narrative":"visibility"}', 107),
  ((SELECT id FROM cast_content_formats WHERE name='presentation'), 'logistics_optimization', 'Route Optimization', 'Map', 'text-green-600', 'Supply chain optimization deck', ARRAY['website','linkedin'], '{"tone":"analytical","structure":"data","narrative":"efficiency"}', 69)
ON CONFLICT (format_id, name) DO NOTHING;

-- ============================================================================
-- 15. TELECOM & COMMUNICATIONS category sub-formats
-- ============================================================================
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'telecom_5g', '5G/Network Explainer', 'Wifi', 'text-violet-600', 'Network technology explanation', ARRAY['youtube','linkedin'], '{"tone":"technical","structure":"explainer","narrative":"innovation"}', 108),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'telecom_plan', 'Plan Comparison', 'ArrowLeftRight', 'text-blue-500', 'Service plan comparison video', ARRAY['youtube','website'], '{"tone":"helpful","structure":"comparison","narrative":"value"}', 109),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'telecom_coverage', 'Coverage Map', 'Map', 'text-green-600', 'Network coverage showcase', ARRAY['youtube','website'], '{"tone":"informative","structure":"visualization","narrative":"reach"}', 110)
ON CONFLICT (format_id, name) DO NOTHING;

-- ============================================================================
-- 16. INSURANCE category sub-formats
-- ============================================================================
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'insurance_explainer', 'Policy Explainer', 'Shield', 'text-emerald-600', 'Insurance policy explanation', ARRAY['youtube','website'], '{"tone":"trustworthy","structure":"educational","narrative":"protection"}', 111),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'insurance_claims', 'Claims Process', 'FileCheck', 'text-blue-500', 'Claims filing walkthrough', ARRAY['youtube','website'], '{"tone":"helpful","structure":"step_by_step","narrative":"guided"}', 112),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'insurance_testimonial', 'Policyholder Story', 'Heart', 'text-pink-500', 'Customer protection story', ARRAY['youtube','facebook'], '{"tone":"emotional","structure":"story","narrative":"security"}', 113)
ON CONFLICT (format_id, name) DO NOTHING;

-- ============================================================================
-- 17. FINANCE & BANKING category sub-formats
-- ============================================================================
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'finance_market', 'Market Analysis', 'TrendingUp', 'text-emerald-600', 'Financial market analysis video', ARRAY['youtube','linkedin'], '{"tone":"analytical","structure":"data","narrative":"market_intelligence"}', 114),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'finance_product', 'Financial Product', 'CreditCard', 'text-blue-600', 'Banking product explainer', ARRAY['youtube','website'], '{"tone":"trustworthy","structure":"features","narrative":"value_prop"}', 115),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'finance_literacy', 'Financial Literacy', 'BookOpen', 'text-green-600', 'Personal finance education', ARRAY['youtube','tiktok'], '{"tone":"accessible","structure":"tips","narrative":"empowering"}', 116),
  ((SELECT id FROM cast_content_formats WHERE name='podcast'), 'finance_weekly', 'Weekly Market Podcast', 'BarChart3', 'text-emerald-500', 'Weekly financial roundup', ARRAY['spotify','apple_podcasts'], '{"tone":"expert","structure":"analysis","narrative":"market_update"}', 15)
ON CONFLICT (format_id, name) DO NOTHING;

-- ============================================================================
-- 18. FOOD & BEVERAGES category sub-formats
-- ============================================================================
INSERT INTO public.cast_content_sub_formats (format_id, name, label, icon, color, description, compatible_platforms, enrichment_preset, sort_order) VALUES
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'food_recipe', 'Recipe Video', 'UtensilsCrossed', 'text-orange-500', 'Step-by-step cooking recipe', ARRAY['youtube','instagram_reels','tiktok'], '{"tone":"appetizing","structure":"tutorial","narrative":"cooking"}', 117),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'food_restaurant', 'Restaurant Showcase', 'Store', 'text-red-500', 'Restaurant or bar feature', ARRAY['youtube','instagram','tiktok'], '{"tone":"inviting","structure":"showcase","narrative":"experience"}', 118),
  ((SELECT id FROM cast_content_formats WHERE name='video'), 'food_farm_to_table', 'Farm to Table', 'Leaf', 'text-green-600', 'Sourcing and sustainability story', ARRAY['youtube','website'], '{"tone":"authentic","structure":"journey","narrative":"origin"}', 119)
ON CONFLICT (format_id, name) DO NOTHING;

-- ============================================================================
-- 19. Additional visual style sub-variants for categories that need more variety
-- ============================================================================

-- Add "Regional" sub-variant for every parent style (culture-specific adaptations)
INSERT INTO public.cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
SELECT
  p.name || '_regional',
  p.label || ' – Regional',
  p.category,
  p.icon,
  'Region-adaptive variant of ' || p.label || ' with culturally appropriate visuals',
  p.sort_order,
  p.id,
  4,
  COALESCE(p.complexity_score, 5),
  COALESCE(p.render_time_estimate, 'medium'),
  true
FROM public.cast_visual_styles p
WHERE p.parent_style_id IS NULL
  AND p.is_active = true
  AND NOT EXISTS (SELECT 1 FROM public.cast_visual_styles sub WHERE sub.parent_style_id = p.id AND sub.name LIKE '%_regional')
ON CONFLICT DO NOTHING;

-- Add "Cinematic" sub-variant for video-heavy parent styles
INSERT INTO public.cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
SELECT
  p.name || '_cinematic',
  p.label || ' – Cinematic',
  p.category,
  p.icon,
  'Cinematic film-grade variant of ' || p.label || ' with dramatic lighting and camera work',
  p.sort_order,
  p.id,
  5,
  LEAST(COALESCE(p.complexity_score, 5) + 3, 10),
  'slow',
  true
FROM public.cast_visual_styles p
WHERE p.parent_style_id IS NULL
  AND p.is_active = true
  AND p.category IN ('artistic', 'character', 'gaming', 'immersive', 'lifestyle', 'healthcare')
  AND NOT EXISTS (SELECT 1 FROM public.cast_visual_styles sub WHERE sub.parent_style_id = p.id AND sub.name LIKE '%_cinematic')
ON CONFLICT DO NOTHING;

-- Add "Social" sub-variant optimized for short-form (TikTok, Reels, Shorts)
INSERT INTO public.cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
SELECT
  p.name || '_social',
  p.label || ' – Social',
  p.category,
  p.icon,
  'Social-media optimized variant of ' || p.label || ' — vertical, punchy, hook-first',
  p.sort_order,
  p.id,
  6,
  GREATEST(COALESCE(p.complexity_score, 5) - 1, 1),
  'fast',
  true
FROM public.cast_visual_styles p
WHERE p.parent_style_id IS NULL
  AND p.is_active = true
  AND p.category IN ('ecommerce', 'lifestyle', 'demo', 'character', 'education')
  AND NOT EXISTS (SELECT 1 FROM public.cast_visual_styles sub WHERE sub.parent_style_id = p.id AND sub.name LIKE '%_social')
ON CONFLICT DO NOTHING;

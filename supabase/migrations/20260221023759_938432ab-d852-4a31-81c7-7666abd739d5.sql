
-- Fix: use "descr" instead of reserved "desc" keyword

-- ══ CUSTOMER JOURNEY SUB-STYLES ══
INSERT INTO cast_visual_styles (name, label, category, icon, color, description, allows_photorealistic, requires_face_consent, style_config, provider_routing, sort_order, is_active, parent_style_id, sub_sort_order, estimated_size_mb, complexity_score, render_time_estimate)
SELECT v.vname, v.vlabel, 'framework', 'GitBranch', '#8B5CF6', v.vdesc, false, false, '{"engine":"diagram"}', '{"primary":"canvas"}', 110, true, p.id, v.vsrt, 15, 3, 'low'
FROM cast_visual_styles p,
(VALUES
  ('cj_awareness', 'Awareness → Purchase', 'Full funnel journey map', 1),
  ('cj_onboarding', 'Onboarding Flow', 'New user onboarding journey', 2),
  ('cj_retention', 'Retention Loop', 'Retention and engagement cycle', 3),
  ('cj_support', 'Support Escalation', 'Customer support escalation flow', 4)
) AS v(vname, vlabel, vdesc, vsrt)
WHERE p.name = 'customer_journey'
ON CONFLICT (name) DO NOTHING;

-- ══ FRAMEWORK SUB-STYLES ══
INSERT INTO cast_visual_styles (name, label, category, icon, color, description, allows_photorealistic, requires_face_consent, style_config, provider_routing, sort_order, is_active, parent_style_id, sub_sort_order, estimated_size_mb, complexity_score, render_time_estimate)
SELECT v.vname, v.vlabel, 'framework', 'Grid3X3', '#6366F1', v.vdesc, false, false, '{"engine":"diagram"}', '{"primary":"canvas"}', 111, true, p.id, v.vsrt, 12, 3, 'low'
FROM cast_visual_styles p,
(VALUES
  ('fw_swot', 'SWOT Analysis', 'Strengths, Weaknesses, Opportunities, Threats', 1),
  ('fw_porter', 'Porter Five Forces', 'Competitive analysis framework', 2),
  ('fw_bmc', 'Business Model Canvas', '9-block business model canvas', 3),
  ('fw_okr', 'OKR / KPI Dashboard', 'Objectives and key results tracker', 4),
  ('fw_design_thinking', 'Design Thinking', '5-stage design thinking process', 5)
) AS v(vname, vlabel, vdesc, vsrt)
WHERE p.name = 'framework_diagram'
ON CONFLICT (name) DO NOTHING;

-- ══ CHARACTERS (using vdesc alias to avoid reserved word) ══

INSERT INTO cast_style_characters (style_id, name, label, character_type, icon, description, sort_order, is_active, thumbnail_url)
SELECT p.id, v.vname, v.vlabel, v.ctype, v.vicon, v.vdesc, v.vsrt, true, v.thumb
FROM cast_visual_styles p,
(VALUES
  ('crayon_narrator', 'Narrator Kid', 'narrator', '👧', 'Friendly child narrator drawn in crayon', 1, 'https://api.dicebear.com/9.x/adventurer/svg?seed=crayon-kid'),
  ('crayon_teacher', 'Teacher Guide', 'mentor', '👩‍🏫', 'Warm teacher character in sketch style', 2, 'https://api.dicebear.com/9.x/adventurer/svg?seed=crayon-teacher'),
  ('crayon_mascot', 'Crayon Mascot', 'mascot', '🖍️', 'Animated crayon character mascot', 3, 'https://api.dicebear.com/9.x/bottts/svg?seed=crayon-mascot')
) AS v(vname, vlabel, ctype, vicon, vdesc, vsrt, thumb)
WHERE p.name = 'crayon_sketch'
ON CONFLICT DO NOTHING;

INSERT INTO cast_style_characters (style_id, name, label, character_type, icon, description, sort_order, is_active, thumbnail_url)
SELECT p.id, v.vname, v.vlabel, v.ctype, v.vicon, v.vdesc, v.vsrt, true, v.thumb
FROM cast_visual_styles p,
(VALUES
  ('wall_street_artist', 'Street Artist', 'hero', '🎨', 'Graffiti artist character', 1, 'https://api.dicebear.com/9.x/adventurer/svg?seed=street-artist'),
  ('wall_mural_guide', 'Mural Guide', 'narrator', '🧑‍🎨', 'Art tour guide character', 2, 'https://api.dicebear.com/9.x/adventurer/svg?seed=mural-guide')
) AS v(vname, vlabel, ctype, vicon, vdesc, vsrt, thumb)
WHERE p.name = 'wall_art'
ON CONFLICT DO NOTHING;

INSERT INTO cast_style_characters (style_id, name, label, character_type, icon, description, sort_order, is_active, thumbnail_url)
SELECT p.id, v.vname, v.vlabel, v.ctype, v.vicon, v.vdesc, v.vsrt, true, v.thumb
FROM cast_visual_styles p,
(VALUES
  ('pod_host', 'Podcast Host', 'hero', '🎙️', 'Main podcast host avatar', 1, 'https://api.dicebear.com/9.x/avataaars/svg?seed=pod-host'),
  ('pod_cohost', 'Co-Host', 'sidekick', '🎧', 'Co-host commentator', 2, 'https://api.dicebear.com/9.x/avataaars/svg?seed=pod-cohost'),
  ('pod_guest', 'Guest Speaker', 'guest', '👤', 'Interview guest', 3, 'https://api.dicebear.com/9.x/avataaars/svg?seed=pod-guest')
) AS v(vname, vlabel, ctype, vicon, vdesc, vsrt, thumb)
WHERE p.name = 'podcast_visual'
ON CONFLICT DO NOTHING;

INSERT INTO cast_style_characters (style_id, name, label, character_type, icon, description, sort_order, is_active, thumbnail_url)
SELECT p.id, v.vname, v.vlabel, v.ctype, v.vicon, v.vdesc, v.vsrt, true, v.thumb
FROM cast_visual_styles p,
(VALUES
  ('demo_presenter', 'Product Expert', 'hero', '👨‍💼', 'Professional product demonstrator', 1, 'https://api.dicebear.com/9.x/avataaars/svg?seed=demo-expert'),
  ('demo_user', 'End User', 'user', '👩‍💻', 'Target user persona', 2, 'https://api.dicebear.com/9.x/avataaars/svg?seed=demo-user'),
  ('demo_mascot', 'Brand Mascot', 'mascot', '🤖', 'Animated brand mascot guide', 3, 'https://api.dicebear.com/9.x/bottts/svg?seed=demo-mascot')
) AS v(vname, vlabel, ctype, vicon, vdesc, vsrt, thumb)
WHERE p.name = 'product_demo'
ON CONFLICT DO NOTHING;

INSERT INTO cast_style_characters (style_id, name, label, character_type, icon, description, sort_order, is_active, thumbnail_url)
SELECT p.id, v.vname, v.vlabel, v.ctype, v.vicon, v.vdesc, v.vsrt, true, v.thumb
FROM cast_visual_styles p,
(VALUES
  ('holiday_santa', 'Santa / Gift Giver', 'hero', '🎅', 'Festive gift-giving character', 1, 'https://api.dicebear.com/9.x/adventurer/svg?seed=santa'),
  ('holiday_elf', 'Helper Elf', 'sidekick', '🧝', 'Cheerful holiday helper', 2, 'https://api.dicebear.com/9.x/adventurer/svg?seed=elf'),
  ('holiday_mascot', 'Festival Mascot', 'mascot', '🎊', 'Celebration mascot character', 3, 'https://api.dicebear.com/9.x/bottts/svg?seed=festival')
) AS v(vname, vlabel, ctype, vicon, vdesc, vsrt, thumb)
WHERE p.name = 'holiday_festive'
ON CONFLICT DO NOTHING;

INSERT INTO cast_style_characters (style_id, name, label, character_type, icon, description, sort_order, is_active, thumbnail_url)
SELECT p.id, v.vname, v.vlabel, v.ctype, v.vicon, v.vdesc, v.vsrt, true, v.thumb
FROM cast_visual_styles p,
(VALUES
  ('school_teacher', 'Friendly Teacher', 'mentor', '👩‍🏫', 'Kind and patient school teacher', 1, 'https://api.dicebear.com/9.x/adventurer/svg?seed=teacher'),
  ('school_student', 'Curious Student', 'hero', '🧒', 'Eager learning student', 2, 'https://api.dicebear.com/9.x/adventurer/svg?seed=student'),
  ('school_owl', 'Wise Owl', 'mascot', '🦉', 'Owl mascot for knowledge', 3, 'https://api.dicebear.com/9.x/bottts/svg?seed=owl-mascot'),
  ('school_robot', 'Learning Robot', 'sidekick', '🤖', 'Friendly AI learning companion', 4, 'https://api.dicebear.com/9.x/bottts/svg?seed=learn-bot')
) AS v(vname, vlabel, ctype, vicon, vdesc, vsrt, thumb)
WHERE p.name = 'school_kids'
ON CONFLICT DO NOTHING;

INSERT INTO cast_style_characters (style_id, name, label, character_type, icon, description, sort_order, is_active, thumbnail_url)
SELECT p.id, v.vname, v.vlabel, v.ctype, v.vicon, v.vdesc, v.vsrt, true, v.thumb
FROM cast_visual_styles p,
(VALUES
  ('game_hero', 'Game Hero', 'hero', '⚔️', 'Main playable character', 1, 'https://api.dicebear.com/9.x/adventurer/svg?seed=game-hero'),
  ('game_villain', 'Boss / Villain', 'villain', '👾', 'Antagonist or boss character', 2, 'https://api.dicebear.com/9.x/adventurer/svg?seed=game-villain'),
  ('game_npc', 'NPC Guide', 'mentor', '🧙', 'Non-player character guide', 3, 'https://api.dicebear.com/9.x/adventurer/svg?seed=game-npc')
) AS v(vname, vlabel, ctype, vicon, vdesc, vsrt, thumb)
WHERE p.name = 'gaming_trailer'
ON CONFLICT DO NOTHING;

INSERT INTO cast_style_characters (style_id, name, label, character_type, icon, description, sort_order, is_active, thumbnail_url)
SELECT p.id, v.vname, v.vlabel, v.ctype, v.vicon, v.vdesc, v.vsrt, true, v.thumb
FROM cast_visual_styles p,
(VALUES
  ('travel_explorer', 'Explorer', 'hero', '🧳', 'Adventure traveler character', 1, 'https://api.dicebear.com/9.x/adventurer/svg?seed=explorer'),
  ('travel_local', 'Local Guide', 'mentor', '🗺️', 'Local culture guide', 2, 'https://api.dicebear.com/9.x/adventurer/svg?seed=local-guide'),
  ('travel_foodie', 'Foodie', 'sidekick', '🍜', 'Food and culture enthusiast', 3, 'https://api.dicebear.com/9.x/adventurer/svg?seed=foodie')
) AS v(vname, vlabel, ctype, vicon, vdesc, vsrt, thumb)
WHERE p.name = 'travel_vlog'
ON CONFLICT DO NOTHING;

INSERT INTO cast_style_characters (style_id, name, label, character_type, icon, description, sort_order, is_active, thumbnail_url)
SELECT p.id, v.vname, v.vlabel, v.ctype, v.vicon, v.vdesc, v.vsrt, true, v.thumb
FROM cast_visual_styles p,
(VALUES
  ('train_instructor', 'Instructor', 'mentor', '👨‍🏫', 'Professional corporate trainer', 1, 'https://api.dicebear.com/9.x/avataaars/svg?seed=instructor'),
  ('train_employee', 'New Employee', 'hero', '👩‍💼', 'Onboarding employee learner', 2, 'https://api.dicebear.com/9.x/avataaars/svg?seed=employee'),
  ('train_bot', 'Training Bot', 'mascot', '🤖', 'AI training assistant', 3, 'https://api.dicebear.com/9.x/bottts/svg?seed=train-bot')
) AS v(vname, vlabel, ctype, vicon, vdesc, vsrt, thumb)
WHERE p.name = 'training_corporate'
ON CONFLICT DO NOTHING;

INSERT INTO cast_style_characters (style_id, name, label, character_type, icon, description, sort_order, is_active, thumbnail_url)
SELECT p.id, v.vname, v.vlabel, v.ctype, v.vicon, v.vdesc, v.vsrt, true, v.thumb
FROM cast_visual_styles p,
(VALUES
  ('med_doctor', 'Doctor', 'hero', '👩‍⚕️', 'Medical professional explainer', 1, 'https://api.dicebear.com/9.x/avataaars/svg?seed=doctor'),
  ('med_patient', 'Patient', 'user', '🤒', 'Patient persona for education', 2, 'https://api.dicebear.com/9.x/avataaars/svg?seed=patient'),
  ('med_nurse', 'Nurse', 'sidekick', '👨‍⚕️', 'Supporting healthcare pro', 3, 'https://api.dicebear.com/9.x/avataaars/svg?seed=nurse')
) AS v(vname, vlabel, ctype, vicon, vdesc, vsrt, thumb)
WHERE p.name = 'medical_explainer'
ON CONFLICT DO NOTHING;

-- Flat Illustration chars
INSERT INTO cast_style_characters (style_id, name, label, character_type, icon, description, sort_order, is_active, thumbnail_url)
SELECT p.id, v.vname, v.vlabel, v.ctype, v.vicon, v.vdesc, v.vsrt, true, v.thumb
FROM cast_visual_styles p,
(VALUES
  ('flat_presenter', 'Flat Presenter', 'hero', '🧑', 'Clean flat-style presenter', 1, 'https://api.dicebear.com/9.x/adventurer/svg?seed=flat-presenter'),
  ('flat_team', 'Team Member', 'sidekick', '👥', 'Diverse team member characters', 2, 'https://api.dicebear.com/9.x/adventurer/svg?seed=flat-team'),
  ('flat_mascot', 'Brand Mascot', 'mascot', '🎯', 'Friendly brand mascot', 3, 'https://api.dicebear.com/9.x/bottts/svg?seed=flat-mascot')
) AS v(vname, vlabel, ctype, vicon, vdesc, vsrt, thumb)
WHERE p.name = 'flat_illustration'
ON CONFLICT DO NOTHING;

-- Whiteboard chars
INSERT INTO cast_style_characters (style_id, name, label, character_type, icon, description, sort_order, is_active, thumbnail_url)
SELECT p.id, v.vname, v.vlabel, v.ctype, v.vicon, v.vdesc, v.vsrt, true, v.thumb
FROM cast_visual_styles p,
(VALUES
  ('wb_hand', 'Drawing Hand', 'narrator', '✋', 'The hand that draws on whiteboard', 1, 'https://api.dicebear.com/9.x/adventurer/svg?seed=wb-hand'),
  ('wb_stickman', 'Stick Figure', 'hero', '🏃', 'Simple stick figure character', 2, 'https://api.dicebear.com/9.x/adventurer/svg?seed=wb-stick')
) AS v(vname, vlabel, ctype, vicon, vdesc, vsrt, thumb)
WHERE p.name = 'whiteboard'
ON CONFLICT DO NOTHING;

-- Cinematic chars
INSERT INTO cast_style_characters (style_id, name, label, character_type, icon, description, sort_order, is_active, thumbnail_url)
SELECT p.id, v.vname, v.vlabel, v.ctype, v.vicon, v.vdesc, v.vsrt, true, v.thumb
FROM cast_visual_styles p,
(VALUES
  ('cine_protagonist', 'Protagonist', 'hero', '🎬', 'Main cinematic character', 1, 'https://api.dicebear.com/9.x/avataaars/svg?seed=cine-hero'),
  ('cine_narrator', 'Narrator', 'narrator', '🎤', 'Voiceover narrator', 2, 'https://api.dicebear.com/9.x/avataaars/svg?seed=cine-narrator'),
  ('cine_sidekick', 'Supporting Cast', 'sidekick', '🎭', 'Supporting character ensemble', 3, 'https://api.dicebear.com/9.x/avataaars/svg?seed=cine-sidekick')
) AS v(vname, vlabel, ctype, vicon, vdesc, vsrt, thumb)
WHERE p.name = 'cinematic'
ON CONFLICT DO NOTHING;

-- Realistic Stylized chars
INSERT INTO cast_style_characters (style_id, name, label, character_type, icon, description, sort_order, is_active, thumbnail_url)
SELECT p.id, v.vname, v.vlabel, v.ctype, v.vicon, v.vdesc, v.vsrt, true, v.thumb
FROM cast_visual_styles p,
(VALUES
  ('real_avatar', 'AI Avatar', 'hero', '🧑‍💼', 'Photorealistic AI avatar presenter', 1, 'https://api.dicebear.com/9.x/avataaars/svg?seed=real-avatar'),
  ('real_influencer', 'Influencer', 'hero', '📸', 'Social media influencer style', 2, 'https://api.dicebear.com/9.x/avataaars/svg?seed=real-influencer')
) AS v(vname, vlabel, ctype, vicon, vdesc, vsrt, thumb)
WHERE p.name = 'realistic_stylized'
ON CONFLICT DO NOTHING;

-- Isometric 3D chars
INSERT INTO cast_style_characters (style_id, name, label, character_type, icon, description, sort_order, is_active, thumbnail_url)
SELECT p.id, v.vname, v.vlabel, v.ctype, v.vicon, v.vdesc, v.vsrt, true, v.thumb
FROM cast_visual_styles p,
(VALUES
  ('iso_worker', 'Isometric Worker', 'hero', '👷', 'Tiny isometric person', 1, 'https://api.dicebear.com/9.x/adventurer/svg?seed=iso-worker'),
  ('iso_robot', 'Iso Robot', 'mascot', '🤖', 'Isometric robot assistant', 2, 'https://api.dicebear.com/9.x/bottts/svg?seed=iso-robot')
) AS v(vname, vlabel, ctype, vicon, vdesc, vsrt, thumb)
WHERE p.name = 'isometric_3d'
ON CONFLICT DO NOTHING;

-- Infographic chars
INSERT INTO cast_style_characters (style_id, name, label, character_type, icon, description, sort_order, is_active, thumbnail_url)
SELECT p.id, v.vname, v.vlabel, v.ctype, v.vicon, v.vdesc, v.vsrt, true, v.thumb
FROM cast_visual_styles p,
(VALUES
  ('info_presenter', 'Data Presenter', 'narrator', '📊', 'Character presenting data insights', 1, 'https://api.dicebear.com/9.x/avataaars/svg?seed=info-presenter'),
  ('info_icon_person', 'Icon Person', 'hero', '🧑', 'Simplified icon-style person', 2, 'https://api.dicebear.com/9.x/adventurer/svg?seed=info-person')
) AS v(vname, vlabel, ctype, vicon, vdesc, vsrt, thumb)
WHERE p.name = 'infographic'
ON CONFLICT DO NOTHING;

-- Minimalist chars
INSERT INTO cast_style_characters (style_id, name, label, character_type, icon, description, sort_order, is_active, thumbnail_url)
SELECT p.id, v.vname, v.vlabel, v.ctype, v.vicon, v.vdesc, v.vsrt, true, v.thumb
FROM cast_visual_styles p,
(VALUES
  ('min_silhouette', 'Silhouette Figure', 'hero', '🕴️', 'Minimalist silhouette character', 1, 'https://api.dicebear.com/9.x/adventurer/svg?seed=silhouette'),
  ('min_geometric', 'Geometric Person', 'narrator', '🔷', 'Abstract geometric character', 2, 'https://api.dicebear.com/9.x/shapes/svg?seed=geo-person')
) AS v(vname, vlabel, ctype, vicon, vdesc, vsrt, thumb)
WHERE p.name = 'minimalist'
ON CONFLICT DO NOTHING;

-- E-Commerce chars
INSERT INTO cast_style_characters (style_id, name, label, character_type, icon, description, sort_order, is_active, thumbnail_url)
SELECT p.id, v.vname, v.vlabel, v.ctype, v.vicon, v.vdesc, v.vsrt, true, v.thumb
FROM cast_visual_styles p,
(VALUES
  ('ecom_shopper', 'Happy Shopper', 'hero', '🛒', 'Satisfied customer character', 1, 'https://api.dicebear.com/9.x/avataaars/svg?seed=shopper'),
  ('ecom_brand_rep', 'Brand Rep', 'mentor', '👩‍💼', 'Brand representative', 2, 'https://api.dicebear.com/9.x/avataaars/svg?seed=brand-rep')
) AS v(vname, vlabel, ctype, vicon, vdesc, vsrt, thumb)
WHERE p.name = 'ecommerce_showcase'
ON CONFLICT DO NOTHING;

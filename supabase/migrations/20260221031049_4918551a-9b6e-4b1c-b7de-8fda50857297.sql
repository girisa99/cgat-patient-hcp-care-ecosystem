
-- Add preview_image_url column
ALTER TABLE public.cast_visual_styles ADD COLUMN IF NOT EXISTS preview_image_url TEXT;

-- ARTISTIC: Collage and Mixed Media (95b9a504)
INSERT INTO cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
VALUES
  ('collage_paper', 'Paper Collage', 'artistic', 'Scissors', 'Cut-paper layered composition', 10, '95b9a504-6935-470a-8a97-9f92a1a6d4e8', 1, 4, 'fast', true),
  ('collage_digital', 'Digital Collage', 'artistic', 'Layers', 'Digital mixed-media mashup', 11, '95b9a504-6935-470a-8a97-9f92a1a6d4e8', 2, 5, 'medium', true),
  ('collage_vintage', 'Vintage Scrapbook', 'artistic', 'BookOpen', 'Retro scrapbook aesthetic', 12, '95b9a504-6935-470a-8a97-9f92a1a6d4e8', 3, 4, 'fast', true);

-- ARTISTIC: Crayon and Sketch (f8d69940)
INSERT INTO cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
VALUES
  ('crayon_colored', 'Colored Crayon', 'artistic', 'Palette', 'Vibrant wax crayon look', 10, 'f8d69940-b4c2-43ab-be79-5d685c84fe55', 1, 3, 'fast', true),
  ('sketch_pencil', 'Pencil Sketch', 'artistic', 'Pencil', 'Graphite pencil drawing style', 11, 'f8d69940-b4c2-43ab-be79-5d685c84fe55', 2, 3, 'fast', true),
  ('sketch_charcoal', 'Charcoal Drawing', 'artistic', 'Pencil', 'Bold charcoal strokes', 12, 'f8d69940-b4c2-43ab-be79-5d685c84fe55', 3, 4, 'fast', true),
  ('crayon_pastel', 'Pastel Soft', 'artistic', 'Palette', 'Soft pastel blending', 13, 'f8d69940-b4c2-43ab-be79-5d685c84fe55', 4, 3, 'fast', true);

-- ARTISTIC: Oil Painting (1e4ae32c)
INSERT INTO cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
VALUES
  ('oil_impressionist', 'Impressionist', 'artistic', 'Palette', 'Monet-style light and color', 10, '1e4ae32c-b6a8-43a3-9751-2c560c67eae0', 1, 6, 'medium', true),
  ('oil_renaissance', 'Renaissance', 'artistic', 'Palette', 'Classical realism with dramatic lighting', 11, '1e4ae32c-b6a8-43a3-9751-2c560c67eae0', 2, 7, 'slow', true),
  ('oil_abstract', 'Abstract Expressionist', 'artistic', 'Palette', 'Bold abstract brushwork', 12, '1e4ae32c-b6a8-43a3-9751-2c560c67eae0', 3, 5, 'medium', true),
  ('oil_modern', 'Modern Oil', 'artistic', 'Palette', 'Contemporary oil painting', 13, '1e4ae32c-b6a8-43a3-9751-2c560c67eae0', 4, 5, 'medium', true);

-- ARTISTIC: Paper Cut (814910be)
INSERT INTO cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
VALUES
  ('paper_origami', 'Origami 3D', 'artistic', 'Box', 'Folded paper 3D forms', 10, '814910be-1dbc-48ff-8d10-902c83bb1b39', 1, 5, 'medium', true),
  ('paper_kirigami', 'Kirigami Pop-up', 'artistic', 'Scissors', 'Cut and fold pop-up scenes', 11, '814910be-1dbc-48ff-8d10-902c83bb1b39', 2, 6, 'medium', true),
  ('paper_silhouette', 'Paper Silhouette', 'artistic', 'Scissors', 'Shadow puppet paper cut', 12, '814910be-1dbc-48ff-8d10-902c83bb1b39', 3, 4, 'fast', true);

-- ARTISTIC: Wall Art (bdc16e71)
INSERT INTO cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
VALUES
  ('wall_graffiti', 'Street Graffiti', 'artistic', 'Palette', 'Urban spray-paint graffiti', 10, 'bdc16e71-437e-4d0b-ac46-7d37c224f7ab', 1, 5, 'medium', true),
  ('wall_mosaic', 'Mosaic Tile', 'artistic', 'Grid3X3', 'Tiled mosaic art patterns', 11, 'bdc16e71-437e-4d0b-ac46-7d37c224f7ab', 2, 6, 'medium', true),
  ('wall_mural', 'Large-Scale Mural', 'artistic', 'Palette', 'Building-sized painted murals', 12, 'bdc16e71-437e-4d0b-ac46-7d37c224f7ab', 3, 7, 'slow', true);

-- CHARACTER: Comic Book (f362ede1)
INSERT INTO cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
VALUES
  ('comic_superhero', 'Superhero Action', 'character', 'Zap', 'Dynamic superhero panel style', 10, 'f362ede1-dde5-47ec-a75a-5954e1f1cbe8', 1, 6, 'medium', true),
  ('comic_manga_panel', 'Manga Panel', 'character', 'BookOpen', 'Japanese manga panels', 11, 'f362ede1-dde5-47ec-a75a-5954e1f1cbe8', 2, 5, 'medium', true),
  ('comic_euro', 'European BD', 'character', 'BookOpen', 'Franco-Belgian bande dessinée', 12, 'f362ede1-dde5-47ec-a75a-5954e1f1cbe8', 3, 5, 'medium', true),
  ('comic_noir', 'Noir Detective', 'character', 'Moon', 'Dark noir comic style', 13, 'f362ede1-dde5-47ec-a75a-5954e1f1cbe8', 4, 6, 'medium', true);

-- DEMO: Product Demo (e23ed937)
INSERT INTO cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
VALUES
  ('demo_screencast', 'Screencast Tutorial', 'demo', 'Monitor', 'Screen recording with annotations', 10, 'e23ed937-ca7d-470b-9dce-3e35751127bb', 1, 3, 'fast', true),
  ('demo_explainer', 'Animated Explainer', 'demo', 'Play', 'Motion graphics walkthrough', 11, 'e23ed937-ca7d-470b-9dce-3e35751127bb', 2, 5, 'medium', true),
  ('demo_compare', 'Before/After Compare', 'demo', 'ArrowLeftRight', 'Side-by-side comparison', 12, 'e23ed937-ca7d-470b-9dce-3e35751127bb', 3, 4, 'fast', true);

-- DEMO: Mobile App Preview (c91d4e73)
INSERT INTO cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
VALUES
  ('app_ios_mockup', 'iOS Device Mockup', 'demo', 'Smartphone', 'iPhone frame with app screens', 10, 'c91d4e73-137a-4be1-bb13-86c999247869', 1, 3, 'fast', true),
  ('app_android_mockup', 'Android Mockup', 'demo', 'Smartphone', 'Android device frame', 11, 'c91d4e73-137a-4be1-bb13-86c999247869', 2, 3, 'fast', true),
  ('app_multi_device', 'Multi-Device', 'demo', 'Monitor', 'Phone + tablet + desktop', 12, 'c91d4e73-137a-4be1-bb13-86c999247869', 3, 4, 'medium', true);

-- DEMO: SaaS Walkthrough (81ed4162)
INSERT INTO cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
VALUES
  ('saas_feature', 'Feature Highlight', 'demo', 'Star', 'Single feature deep-dive', 10, '81ed4162-29d8-45e2-9463-f5e3e6b864ae', 1, 4, 'fast', true),
  ('saas_onboarding', 'Onboarding Flow', 'demo', 'UserPlus', 'Step-by-step onboarding', 11, '81ed4162-29d8-45e2-9463-f5e3e6b864ae', 2, 4, 'fast', true),
  ('saas_dashboard', 'Dashboard Tour', 'demo', 'LayoutDashboard', 'Dashboard walkthrough', 12, '81ed4162-29d8-45e2-9463-f5e3e6b864ae', 3, 5, 'medium', true);

-- DEMO: Unboxing (7ed4e414)
INSERT INTO cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
VALUES
  ('unbox_premium', 'Premium Unboxing', 'demo', 'Gift', 'Luxury product reveal', 10, '7ed4e414-7bb6-4cf0-975f-e8459e0d5227', 1, 5, 'medium', true),
  ('unbox_tech', 'Tech Review', 'demo', 'Cpu', 'Technical gadget review', 11, '7ed4e414-7bb6-4cf0-975f-e8459e0d5227', 2, 4, 'fast', true),
  ('unbox_asmr', 'ASMR Style', 'demo', 'Volume2', 'Slow tactile ASMR', 12, '7ed4e414-7bb6-4cf0-975f-e8459e0d5227', 3, 3, 'fast', true);

-- ECOMMERCE: Product Comparison (08363651)
INSERT INTO cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
VALUES
  ('compare_grid', 'Grid Comparison', 'ecommerce', 'Grid3X3', 'Side-by-side product grid', 10, '08363651-8964-4927-8b84-5e4fe89daf77', 1, 3, 'fast', true),
  ('compare_slider', 'Slider Compare', 'ecommerce', 'ArrowLeftRight', 'Before/after slider', 11, '08363651-8964-4927-8b84-5e4fe89daf77', 2, 4, 'fast', true),
  ('compare_360', '360° Product View', 'ecommerce', 'RotateCcw', 'Rotating product view', 12, '08363651-8964-4927-8b84-5e4fe89daf77', 3, 6, 'medium', true);

-- ECOMMERCE: E-Commerce Showcase (df676c95)
INSERT INTO cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
VALUES
  ('ecom_hero', 'Hero Product Shot', 'ecommerce', 'Camera', 'Dramatic single-product hero', 10, 'df676c95-1569-4293-9d65-61712f941255', 1, 5, 'medium', true),
  ('ecom_lifestyle', 'Lifestyle Context', 'ecommerce', 'Home', 'Product in real-life setting', 11, 'df676c95-1569-4293-9d65-61712f941255', 2, 6, 'medium', true),
  ('ecom_catalog', 'Catalog Grid', 'ecommerce', 'Grid3X3', 'Multi-product catalog', 12, 'df676c95-1569-4293-9d65-61712f941255', 3, 4, 'fast', true);

-- ECOMMERCE: Flash Sale (b5c6c314)
INSERT INTO cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
VALUES
  ('flash_countdown', 'Countdown Timer', 'ecommerce', 'Clock', 'Urgent countdown with price drops', 10, 'b5c6c314-b7fc-444c-a9b5-b32fe916e69f', 1, 3, 'fast', true),
  ('flash_banner', 'Sale Banner', 'ecommerce', 'Tag', 'Bold promotional banner', 11, 'b5c6c314-b7fc-444c-a9b5-b32fe916e69f', 2, 3, 'fast', true),
  ('flash_story', 'Story Ad', 'ecommerce', 'Smartphone', 'Vertical story-format ad', 12, 'b5c6c314-b7fc-444c-a9b5-b32fe916e69f', 3, 4, 'fast', true);

-- EDUCATION (5 parents)
INSERT INTO cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
VALUES
  ('elearn_quiz', 'Quiz Interactive', 'education', 'HelpCircle', 'Interactive quiz learning', 10, '55d5f89b-f889-4e0d-b8a6-a5b35c97ce2b', 1, 5, 'medium', true),
  ('elearn_simulation', 'Simulation Lab', 'education', 'FlaskConical', 'Virtual lab simulation', 11, '55d5f89b-f889-4e0d-b8a6-a5b35c97ce2b', 2, 7, 'slow', true),
  ('elearn_branching', 'Branching Scenario', 'education', 'GitBranch', 'Choose-your-path learning', 12, '55d5f89b-f889-4e0d-b8a6-a5b35c97ce2b', 3, 6, 'medium', true),
  ('lang_dialogue', 'Dialogue Practice', 'education', 'MessageCircle', 'Conversational dialogue', 10, '14e24724-d46d-4559-a38c-10ce891850d4', 1, 4, 'fast', true),
  ('lang_immersion', 'Cultural Immersion', 'education', 'Globe', 'Visual cultural context', 11, '14e24724-d46d-4559-a38c-10ce891850d4', 2, 5, 'medium', true),
  ('lang_vocab', 'Visual Vocabulary', 'education', 'BookOpen', 'Image-word association', 12, '14e24724-d46d-4559-a38c-10ce891850d4', 3, 3, 'fast', true),
  ('school_animated', 'Animated Story', 'education', 'Film', 'Fun animated educational', 10, '12fef653-8ba3-45bf-8d92-3b11e586bc7a', 1, 4, 'medium', true),
  ('school_coloring', 'Coloring Book', 'education', 'Palette', 'Interactive coloring', 11, '12fef653-8ba3-45bf-8d92-3b11e586bc7a', 2, 3, 'fast', true),
  ('school_puppet', 'Puppet Show', 'education', 'Hand', 'Hand puppet format', 12, '12fef653-8ba3-45bf-8d92-3b11e586bc7a', 3, 4, 'fast', true),
  ('train_compliance', 'Compliance Module', 'education', 'Shield', 'Regulatory training', 10, '5ac140af-b37d-4d71-8f87-194f9c17f8b5', 1, 4, 'fast', true),
  ('train_scenario', 'Scenario-Based', 'education', 'Users', 'Role-play scenarios', 11, '5ac140af-b37d-4d71-8f87-194f9c17f8b5', 2, 5, 'medium', true),
  ('train_microlearn', 'Microlearning', 'education', 'Clock', 'Bite-sized 2-min modules', 12, '5ac140af-b37d-4d71-8f87-194f9c17f8b5', 3, 3, 'fast', true),
  ('uni_lecture', 'Lecture Capture', 'education', 'GraduationCap', 'Professor-style lecture', 10, '489b96f0-ba4d-41fc-be4f-35da43125c8d', 1, 4, 'fast', true),
  ('uni_research', 'Research Presentation', 'education', 'FileSearch', 'Academic paper summary', 11, '489b96f0-ba4d-41fc-be4f-35da43125c8d', 2, 5, 'medium', true),
  ('uni_seminar', 'Seminar Discussion', 'education', 'Users', 'Panel discussion format', 12, '489b96f0-ba4d-41fc-be4f-35da43125c8d', 3, 4, 'fast', true);

-- FRAMEWORK
INSERT INTO cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
VALUES
  ('journey_funnel', 'Funnel Stages', 'framework', 'TrendingDown', 'Marketing funnel', 10, 'eb5ed9a1-124c-4121-a322-57e311c142a5', 1, 4, 'fast', true),
  ('journey_map', 'Journey Map', 'framework', 'Map', 'Touchpoint timeline', 11, 'eb5ed9a1-124c-4121-a322-57e311c142a5', 2, 5, 'medium', true),
  ('journey_persona', 'Persona Story', 'framework', 'User', 'Character-driven narrative', 12, 'eb5ed9a1-124c-4121-a322-57e311c142a5', 3, 5, 'medium', true),
  ('fw_swot', 'SWOT Analysis', 'framework', 'Grid3X3', 'Strengths/Weaknesses/Opportunities/Threats', 10, '3cab3829-d68f-416b-8b34-d533a9b59197', 1, 3, 'fast', true),
  ('fw_bmc', 'Business Model Canvas', 'framework', 'LayoutDashboard', '9-block business model', 11, '3cab3829-d68f-416b-8b34-d533a9b59197', 2, 4, 'fast', true),
  ('fw_okr', 'OKR Tracker', 'framework', 'Target', 'Objectives and Key Results', 12, '3cab3829-d68f-416b-8b34-d533a9b59197', 3, 3, 'fast', true);

-- GAMING
INSERT INTO cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
VALUES
  ('esports_hud', 'HUD Overlay', 'gaming', 'Monitor', 'In-game HUD overlay', 10, 'c416efd4-508b-4b18-8883-89d551a19787', 1, 5, 'medium', true),
  ('esports_highlight', 'Highlight Reel', 'gaming', 'Trophy', 'Best moments compilation', 11, 'c416efd4-508b-4b18-8883-89d551a19787', 2, 6, 'medium', true),
  ('esports_bracket', 'Tournament Bracket', 'gaming', 'GitBranch', 'Bracket animation', 12, 'c416efd4-508b-4b18-8883-89d551a19787', 3, 4, 'fast', true),
  ('game_cinematic', 'Cinematic Trailer', 'gaming', 'Film', 'Epic cinematic trailer', 10, '9d142522-222b-47ef-beb2-57b70e228a7e', 1, 8, 'slow', true),
  ('game_gameplay', 'Gameplay Montage', 'gaming', 'Gamepad', 'In-game footage montage', 11, '9d142522-222b-47ef-beb2-57b70e228a7e', 2, 6, 'medium', true),
  ('game_teaser', 'Teaser Reveal', 'gaming', 'Eye', 'Short mystery reveal', 12, '9d142522-222b-47ef-beb2-57b70e228a7e', 3, 5, 'medium', true),
  ('pixel_8bit', '8-bit Retro', 'gaming', 'Grid3X3', 'Classic 8-bit pixel art', 10, 'e60f80f6-ff77-4156-852d-d73e838397e8', 1, 3, 'fast', true),
  ('pixel_16bit', '16-bit Enhanced', 'gaming', 'Grid3X3', 'SNES-era 16-bit style', 11, 'e60f80f6-ff77-4156-852d-d73e838397e8', 2, 4, 'fast', true),
  ('pixel_modern', 'Modern Pixel', 'gaming', 'Grid3X3', 'High-res pixel art', 12, 'e60f80f6-ff77-4156-852d-d73e838397e8', 3, 5, 'medium', true),
  ('rpg_medieval', 'Medieval Fantasy', 'gaming', 'Sword', 'Classic medieval RPG', 10, '3c7724a7-4a5b-418e-a1b8-36a98eb2675f', 1, 7, 'slow', true),
  ('rpg_scifi', 'Sci-Fi RPG', 'gaming', 'Rocket', 'Space opera RPG', 11, '3c7724a7-4a5b-418e-a1b8-36a98eb2675f', 2, 7, 'slow', true),
  ('rpg_steampunk', 'Steampunk', 'gaming', 'Settings', 'Victorian-era tech fantasy', 12, '3c7724a7-4a5b-418e-a1b8-36a98eb2675f', 3, 6, 'medium', true);

-- HEALTHCARE
INSERT INTO cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
VALUES
  ('med_anatomy', 'Anatomy Diagram', 'healthcare', 'Heart', '3D anatomical visualization', 10, '021875c2-5ea4-4200-8b2d-d4152207e4b6', 1, 6, 'medium', true),
  ('med_procedure', 'Procedure Animation', 'healthcare', 'Stethoscope', 'Step-by-step procedure', 11, '021875c2-5ea4-4200-8b2d-d4152207e4b6', 2, 7, 'slow', true),
  ('med_infographic', 'Medical Infographic', 'healthcare', 'BarChart3', 'Data-driven medical stats', 12, '021875c2-5ea4-4200-8b2d-d4152207e4b6', 3, 4, 'fast', true),
  ('patient_animated', 'Friendly Animated', 'healthcare', 'Smile', 'Warm approachable animation', 10, 'bdb24f69-c00c-4580-95c0-56dadac7e17f', 1, 4, 'fast', true),
  ('patient_qa', 'Q&A Format', 'healthcare', 'HelpCircle', 'Question and answer style', 11, 'bdb24f69-c00c-4580-95c0-56dadac7e17f', 2, 3, 'fast', true),
  ('patient_journey', 'Treatment Journey', 'healthcare', 'Map', 'Patient pathway', 12, 'bdb24f69-c00c-4580-95c0-56dadac7e17f', 3, 5, 'medium', true),
  ('pharma_molecular', 'Molecular Animation', 'healthcare', 'Atom', '3D molecule interaction', 10, 'd7da20ff-89be-445d-b405-c730f2d25a4b', 1, 8, 'slow', true),
  ('pharma_pathway', 'Pathway Diagram', 'healthcare', 'GitBranch', 'Biological pathway', 11, 'd7da20ff-89be-445d-b405-c730f2d25a4b', 2, 7, 'slow', true),
  ('pharma_comparison', 'Drug Comparison', 'healthcare', 'ArrowLeftRight', 'Drug efficacy comparison', 12, 'd7da20ff-89be-445d-b405-c730f2d25a4b', 3, 5, 'medium', true);

-- ILLUSTRATION (missing ones)
INSERT INTO cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
VALUES
  ('flat_geometric', 'Geometric Flat', 'illustration', 'Hexagon', 'Sharp geometric shapes', 10, 'fdf4e2db-226a-44c1-a59c-ac3e556fc301', 1, 3, 'fast', true),
  ('flat_organic', 'Organic Flat', 'illustration', 'Leaf', 'Soft curves and natural shapes', 11, 'fdf4e2db-226a-44c1-a59c-ac3e556fc301', 2, 3, 'fast', true),
  ('flat_gradient', 'Gradient Flat', 'illustration', 'Palette', 'Flat with rich gradients', 12, 'fdf4e2db-226a-44c1-a59c-ac3e556fc301', 3, 4, 'fast', true),
  ('min_line', 'Line Art', 'illustration', 'Minus', 'Single-weight line drawings', 10, '9082c81c-f2f4-4d9a-b538-b83aca9abae9', 1, 2, 'fast', true),
  ('min_duotone', 'Duotone', 'illustration', 'Contrast', 'Two-color minimalist', 11, '9082c81c-f2f4-4d9a-b538-b83aca9abae9', 2, 3, 'fast', true),
  ('min_negative', 'Negative Space', 'illustration', 'Square', 'Clever negative space art', 12, '9082c81c-f2f4-4d9a-b538-b83aca9abae9', 3, 4, 'fast', true),
  ('wb_animated', 'Animated Draw', 'illustration', 'Pencil', 'Hand-drawing animation', 10, '8e470683-3c7c-4002-beee-c0ee93aa657e', 1, 4, 'medium', true),
  ('wb_doodle', 'Doodle Style', 'illustration', 'Pencil', 'Casual doodle sketches', 11, '8e470683-3c7c-4002-beee-c0ee93aa657e', 2, 3, 'fast', true),
  ('wb_technical', 'Technical Whiteboard', 'illustration', 'PenTool', 'Precise technical diagrams', 12, '8e470683-3c7c-4002-beee-c0ee93aa657e', 3, 5, 'medium', true);

-- IMMERSIVE
INSERT INTO cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
VALUES
  ('arch_exterior', 'Exterior Render', 'immersive', 'Building', 'Building exterior', 10, '93554159-8daa-47b6-8824-b8f8e236be6f', 1, 7, 'slow', true),
  ('arch_interior', 'Interior Design', 'immersive', 'Home', 'Room interior 3D render', 11, '93554159-8daa-47b6-8824-b8f8e236be6f', 2, 7, 'slow', true),
  ('arch_walkthrough', 'Virtual Walkthrough', 'immersive', 'Footprints', 'First-person building tour', 12, '93554159-8daa-47b6-8824-b8f8e236be6f', 3, 8, 'slow', true),
  ('ar_face', 'Face Filter', 'immersive', 'Smile', 'Face-tracking AR overlay', 10, 'b8b1dbe5-9e21-480d-81a4-0551e18a231d', 1, 6, 'medium', true),
  ('ar_world', 'World AR', 'immersive', 'Globe', 'Environment AR objects', 11, 'b8b1dbe5-9e21-480d-81a4-0551e18a231d', 2, 7, 'slow', true),
  ('ar_product', 'Product Try-On', 'immersive', 'ShoppingBag', 'AR product visualization', 12, 'b8b1dbe5-9e21-480d-81a4-0551e18a231d', 3, 6, 'medium', true),
  ('lowpoly_landscape', 'Low Poly Landscape', 'immersive', 'Mountain', 'Geometric terrain', 10, '23f935ec-0cbf-426f-afa9-66524e3018ab', 1, 5, 'medium', true),
  ('lowpoly_character', 'Low Poly Character', 'immersive', 'User', 'Faceted character models', 11, '23f935ec-0cbf-426f-afa9-66524e3018ab', 2, 5, 'medium', true),
  ('lowpoly_abstract', 'Abstract Low Poly', 'immersive', 'Hexagon', 'Abstract geometric', 12, '23f935ec-0cbf-426f-afa9-66524e3018ab', 3, 4, 'fast', true),
  ('vr_panorama', '360° Panorama', 'immersive', 'Globe', 'Full spherical panoramic', 10, '201a4dea-0b6e-405b-8064-ff9e003eabf0', 1, 8, 'slow', true),
  ('vr_interactive', 'Interactive VR', 'immersive', 'Hand', 'Clickable VR environment', 11, '201a4dea-0b6e-405b-8064-ff9e003eabf0', 2, 9, 'slow', true),
  ('vr_stereo', 'Stereoscopic 3D', 'immersive', 'Eye', 'Side-by-side 3D stereo', 12, '201a4dea-0b6e-405b-8064-ff9e003eabf0', 3, 8, 'slow', true);

-- LIFESTYLE
INSERT INTO cast_visual_styles (name, label, category, icon, description, sort_order, parent_style_id, sub_sort_order, complexity_score, render_time_estimate, is_active)
VALUES
  ('fashion_editorial', 'Editorial Shoot', 'lifestyle', 'Camera', 'High-fashion editorial', 10, '0a4de6a8-6dbc-4756-8c63-3a397606d665', 1, 6, 'medium', true),
  ('fashion_street', 'Street Style', 'lifestyle', 'MapPin', 'Urban streetwear', 11, '0a4de6a8-6dbc-4756-8c63-3a397606d665', 2, 5, 'medium', true),
  ('fashion_runway', 'Runway Show', 'lifestyle', 'Star', 'Catwalk presentation', 12, '0a4de6a8-6dbc-4756-8c63-3a397606d665', 3, 7, 'slow', true),
  ('fitness_workout', 'Workout Guide', 'lifestyle', 'Dumbbell', 'Exercise demonstration', 10, '6223564f-caf5-47f9-a981-28b6e6ff7800', 1, 4, 'fast', true),
  ('fitness_meditation', 'Meditation Visual', 'lifestyle', 'Sun', 'Calm mindfulness', 11, '6223564f-caf5-47f9-a981-28b6e6ff7800', 2, 3, 'fast', true),
  ('fitness_transform', 'Transformation', 'lifestyle', 'TrendingUp', 'Before/after journey', 12, '6223564f-caf5-47f9-a981-28b6e6ff7800', 3, 4, 'fast', true),
  ('food_recipe_card', 'Recipe Card', 'lifestyle', 'FileText', 'Step-by-step recipe', 10, '3f20f3e1-57cc-4cd2-a8ba-300276d3eb9d', 1, 3, 'fast', true),
  ('food_overhead', 'Overhead Flat Lay', 'lifestyle', 'Camera', 'Top-down food photography', 11, '3f20f3e1-57cc-4cd2-a8ba-300276d3eb9d', 2, 4, 'fast', true),
  ('food_cooking', 'Cooking Show', 'lifestyle', 'Flame', 'Chef-style cooking', 12, '3f20f3e1-57cc-4cd2-a8ba-300276d3eb9d', 3, 5, 'medium', true),
  ('realestate_flyover', 'Drone Flyover', 'lifestyle', 'Navigation', 'Aerial property tour', 10, '003bd3f3-4802-4d95-81da-8730e5388aaf', 1, 6, 'medium', true),
  ('realestate_interior', 'Interior Tour', 'lifestyle', 'Home', 'Room-by-room walkthrough', 11, '003bd3f3-4802-4d95-81da-8730e5388aaf', 2, 5, 'medium', true),
  ('realestate_staging', 'Virtual Staging', 'lifestyle', 'Sofa', 'AI-furnished empty rooms', 12, '003bd3f3-4802-4d95-81da-8730e5388aaf', 3, 6, 'medium', true);


-- ══ MASSIVE PARENT STYLE EXPANSION ══
INSERT INTO cast_visual_styles (name, label, category, icon, color, description, allows_photorealistic, requires_face_consent, style_config, provider_routing, sort_order, is_active, estimated_size_mb, complexity_score, render_time_estimate)
VALUES
('presentation_slides', 'PPT / Slides', 'presentation', 'FileText', '#3B82F6', 'PowerPoint and presentation deck styles', false, false, '{"engine":"pptx"}', '{"primary":"pptxgenjs"}', 100, true, 15, 2, 'low'),
('customer_journey', 'Customer Journey', 'framework', 'GitBranch', '#8B5CF6', 'Customer journey maps and flow diagrams', false, false, '{"engine":"diagram"}', '{"primary":"canvas"}', 110, true, 20, 3, 'low'),
('framework_diagram', 'Frameworks and Models', 'framework', 'Grid3X3', '#6366F1', 'Business frameworks, matrices, models', false, false, '{"engine":"diagram"}', '{"primary":"canvas"}', 111, true, 18, 3, 'low'),
('crayon_sketch', 'Crayon and Sketch', 'artistic', 'PenTool', '#F59E0B', 'Hand-drawn crayon and pencil sketch aesthetics', false, false, '{"engine":"image_gen"}', '{"primary":"flux"}', 120, true, 35, 4, 'medium'),
('wall_art', 'Wall Art and Mural', 'artistic', 'Palette', '#EC4899', 'Street art, graffiti, mural-style visuals', false, false, '{"engine":"image_gen"}', '{"primary":"flux"}', 121, true, 50, 5, 'medium'),
('oil_painting', 'Oil Painting', 'artistic', 'Palette', '#B45309', 'Classical oil painting style', false, false, '{"engine":"image_gen"}', '{"primary":"flux"}', 122, true, 55, 5, 'high'),
('paper_cut', 'Paper Cut and Origami', 'artistic', 'Palette', '#F472B6', 'Paper craft, origami, kirigami aesthetics', false, false, '{"engine":"image_gen"}', '{"primary":"flux"}', 123, true, 30, 4, 'medium'),
('collage_mixed', 'Collage and Mixed Media', 'artistic', 'Palette', '#D946EF', 'Mixed media collage, scrapbook style', false, false, '{"engine":"image_gen"}', '{"primary":"flux"}', 124, true, 40, 4, 'medium'),
('podcast_visual', 'Podcast', 'media', 'Volume2', '#EF4444', 'Audio-first with visual waveform and cover art', false, false, '{"engine":"audio_visual"}', '{"primary":"elevenlabs","fallback":"openai_tts"}', 200, true, 25, 3, 'low'),
('webcast_stream', 'Webcast and Live Stream', 'media', 'Film', '#3B82F6', 'Live broadcast-style overlays and layouts', false, false, '{"engine":"video_gen"}', '{"primary":"heygen","fallback":"d-id"}', 201, true, 60, 5, 'high'),
('interview_panel', 'Interview and Panel', 'media', 'MessageSquare', '#10B981', 'Multi-speaker interview layouts with name bars', false, false, '{"engine":"video_gen"}', '{"primary":"heygen"}', 202, true, 55, 5, 'high'),
('news_broadcast', 'News Broadcast', 'media', 'FileText', '#1E40AF', 'News anchor desk, lower thirds, breaking news', false, false, '{"engine":"video_gen"}', '{"primary":"heygen"}', 203, true, 65, 5, 'high'),
('documentary', 'Documentary', 'media', 'Film', '#78716C', 'Documentary narration with B-roll and Ken Burns', false, false, '{"engine":"video_gen"}', '{"primary":"runway","fallback":"pika"}', 204, true, 70, 6, 'high'),
('product_demo', 'Product Demo', 'demo', 'Camera', '#0EA5E9', 'Screen-recorded product walkthroughs with callouts', false, false, '{"engine":"screen_capture"}', '{"primary":"screen_studio"}', 300, true, 40, 4, 'medium'),
('saas_walkthrough', 'SaaS Walkthrough', 'demo', 'Camera', '#0284C7', 'Step-by-step SaaS feature tours', false, false, '{"engine":"screen_capture"}', '{"primary":"screen_studio"}', 301, true, 35, 3, 'medium'),
('app_preview', 'Mobile App Preview', 'demo', 'Camera', '#7C3AED', 'Mobile device mockup with animated interactions', false, false, '{"engine":"device_mockup"}', '{"primary":"rotato"}', 302, true, 30, 4, 'medium'),
('unboxing', 'Unboxing and Review', 'demo', 'Camera', '#F97316', 'Product unboxing and review format', false, false, '{"engine":"video_gen"}', '{"primary":"runway"}', 303, true, 45, 4, 'medium'),
('holiday_festive', 'Holiday and Festive', 'seasonal', 'Star', '#EF4444', 'Christmas, Diwali, Eid, New Year themes', false, false, '{"engine":"image_gen"}', '{"primary":"flux"}', 400, true, 40, 4, 'medium'),
('halloween_horror', 'Halloween and Horror', 'seasonal', 'Star', '#1C1917', 'Spooky, dark, horror-themed visuals', false, false, '{"engine":"image_gen"}', '{"primary":"flux"}', 401, true, 45, 4, 'medium'),
('valentines_romance', 'Valentines and Romance', 'seasonal', 'Star', '#F43F5E', 'Romantic, heart-themed, love stories', false, false, '{"engine":"image_gen"}', '{"primary":"flux"}', 402, true, 35, 3, 'medium'),
('spring_summer', 'Spring and Summer', 'seasonal', 'Star', '#84CC16', 'Bright, floral, nature-inspired seasonal', false, false, '{"engine":"image_gen"}', '{"primary":"flux"}', 403, true, 35, 3, 'low'),
('winter_cozy', 'Winter and Cozy', 'seasonal', 'Star', '#60A5FA', 'Warm, snowy, hygge winter aesthetics', false, false, '{"engine":"image_gen"}', '{"primary":"flux"}', 404, true, 35, 3, 'low'),
('training_corporate', 'Corporate Training', 'education', 'BookOpen', '#2563EB', 'Professional corporate e-learning modules', false, false, '{"engine":"pptx_video"}', '{"primary":"pptxgenjs","fallback":"heygen"}', 500, true, 30, 3, 'low'),
('school_kids', 'Schools and Kids', 'education', 'BookOpen', '#FBBF24', 'Colorful kid-friendly educational content', false, false, '{"engine":"image_gen"}', '{"primary":"flux"}', 501, true, 35, 3, 'low'),
('university_lecture', 'University and Academic', 'education', 'BookOpen', '#1E3A5F', 'Academic lecture-style with citations', false, false, '{"engine":"pptx_video"}', '{"primary":"pptxgenjs"}', 502, true, 25, 2, 'low'),
('elearning_interactive', 'Interactive eLearning', 'education', 'BookOpen', '#06B6D4', 'SCORM-ready interactive lessons with quizzes', false, false, '{"engine":"interactive"}', '{"primary":"canvas"}', 503, true, 40, 4, 'medium'),
('language_learning', 'Language Learning', 'education', 'BookOpen', '#A855F7', 'Multilingual language instruction', false, false, '{"engine":"audio_visual"}', '{"primary":"elevenlabs"}', 504, true, 30, 3, 'medium'),
('gaming_trailer', 'Gaming Trailer', 'gaming', 'Film', '#7C3AED', 'Game cinematic trailers and gameplay highlights', false, false, '{"engine":"video_gen"}', '{"primary":"runway","fallback":"pika"}', 600, true, 80, 7, 'high'),
('pixel_art', 'Pixel Art and Retro', 'gaming', 'Grid3X3', '#A3E635', '8-bit and 16-bit retro pixel art style', false, false, '{"engine":"image_gen"}', '{"primary":"flux"}', 601, true, 20, 3, 'low'),
('rpg_fantasy', 'RPG and Fantasy', 'gaming', 'Star', '#B45309', 'High fantasy RPG-style illustrations', false, false, '{"engine":"image_gen"}', '{"primary":"flux"}', 602, true, 55, 5, 'medium'),
('esports_overlay', 'Esports and Overlay', 'gaming', 'Film', '#22D3EE', 'Esports broadcast overlays, HUD elements', false, false, '{"engine":"motion_graphics"}', '{"primary":"canvas"}', 603, true, 25, 3, 'low'),
('travel_vlog', 'Travel Vlog', 'lifestyle', 'Camera', '#0EA5E9', 'Travel vlog with location cards and maps', false, false, '{"engine":"video_gen"}', '{"primary":"runway"}', 700, true, 50, 4, 'medium'),
('food_recipe', 'Food and Recipe', 'lifestyle', 'Camera', '#F97316', 'Overhead recipe videos, ingredient cards', false, false, '{"engine":"video_gen"}', '{"primary":"runway"}', 701, true, 45, 4, 'medium'),
('fitness_wellness', 'Fitness and Wellness', 'lifestyle', 'Camera', '#10B981', 'Exercise demos, yoga flows, wellness tips', false, false, '{"engine":"video_gen"}', '{"primary":"heygen"}', 702, true, 50, 4, 'medium'),
('real_estate_tour', 'Real Estate Tour', 'lifestyle', 'Camera', '#6366F1', 'Virtual property tours with floor plans', false, false, '{"engine":"video_gen"}', '{"primary":"runway"}', 703, true, 60, 5, 'high'),
('fashion_lookbook', 'Fashion Lookbook', 'lifestyle', 'Camera', '#EC4899', 'Fashion editorial, outfit showcases', false, false, '{"engine":"image_gen"}', '{"primary":"flux"}', 704, true, 45, 4, 'medium'),
('social_stories', 'Social Stories 9x16', 'social', 'Camera', '#E11D48', 'Vertical stories for IG TikTok Shorts', false, false, '{"engine":"video_gen","aspect":"9:16"}', '{"primary":"runway"}', 800, true, 25, 3, 'low'),
('social_carousel', 'Social Carousel', 'social', 'Grid3X3', '#8B5CF6', 'Multi-slide carousel for IG LinkedIn', false, false, '{"engine":"image_gen"}', '{"primary":"flux"}', 801, true, 15, 2, 'low'),
('mobile_ui_demo', 'Mobile UI Demo', 'social', 'Camera', '#7C3AED', 'Mobile app UI walkthrough with device frame', false, false, '{"engine":"device_mockup"}', '{"primary":"rotato"}', 802, true, 20, 3, 'low'),
('youtube_thumbnail', 'YouTube Thumbnail', 'social', 'Camera', '#DC2626', 'Click-worthy YouTube thumbnail designs', false, false, '{"engine":"image_gen"}', '{"primary":"flux"}', 803, true, 5, 1, 'low'),
('motion_kinetic', 'Kinetic Typography', 'motion', 'Film', '#F59E0B', 'Animated text and kinetic type videos', false, false, '{"engine":"motion_graphics"}', '{"primary":"canvas"}', 900, true, 20, 3, 'low'),
('logo_animation', 'Logo Animation', 'motion', 'Film', '#6366F1', 'Logo reveals, intros, outros, idents', false, false, '{"engine":"motion_graphics"}', '{"primary":"canvas"}', 901, true, 15, 2, 'low'),
('particle_effects', 'Particle and VFX', 'motion', 'Star', '#A855F7', 'Particle systems, fire, water, magic effects', false, false, '{"engine":"video_gen"}', '{"primary":"runway"}', 902, true, 50, 6, 'high'),
('data_visualization', 'Data Viz Animation', 'motion', 'BarChart3', '#10B981', 'Animated charts, graphs, data storytelling', false, false, '{"engine":"motion_graphics"}', '{"primary":"canvas"}', 903, true, 20, 3, 'low'),
('medical_explainer', 'Medical Explainer', 'healthcare', 'BookOpen', '#0891B2', 'Medical procedure and anatomy explainers', false, false, '{"engine":"image_gen"}', '{"primary":"flux"}', 1000, true, 35, 4, 'medium'),
('pharma_moa', 'Pharma MOA', 'healthcare', 'BookOpen', '#2563EB', 'Mechanism of action drug pathway animations', false, false, '{"engine":"motion_graphics"}', '{"primary":"canvas"}', 1001, true, 40, 5, 'medium'),
('patient_education', 'Patient Education', 'healthcare', 'BookOpen', '#059669', 'Accessible patient-facing health education', false, false, '{"engine":"image_gen"}', '{"primary":"flux"}', 1002, true, 30, 3, 'low'),
('ecommerce_showcase', 'E-Commerce Showcase', 'ecommerce', 'Camera', '#F97316', 'Product showcase with pricing overlays', false, false, '{"engine":"image_gen"}', '{"primary":"flux"}', 1100, true, 30, 3, 'low'),
('flash_sale', 'Flash Sale and Promo', 'ecommerce', 'Star', '#DC2626', 'Countdown timers, limited-offer urgency', false, false, '{"engine":"motion_graphics"}', '{"primary":"canvas"}', 1101, true, 15, 2, 'low'),
('comparison_table', 'Product Comparison', 'ecommerce', 'Grid3X3', '#3B82F6', 'Side-by-side product comparison visuals', false, false, '{"engine":"image_gen"}', '{"primary":"flux"}', 1102, true, 20, 2, 'low'),
('manga_webtoon', 'Manga and Webtoon', 'storytelling', 'BookOpen', '#1E293B', 'Japanese manga and Korean webtoon panels', false, false, '{"engine":"image_gen"}', '{"primary":"flux"}', 1200, true, 45, 5, 'medium'),
('folklore_mythology', 'Folklore and Mythology', 'storytelling', 'BookOpen', '#92400E', 'Ancient myths, legends, cultural tales', false, false, '{"engine":"image_gen"}', '{"primary":"flux"}', 1201, true, 50, 5, 'medium'),
('storyboard_previz', 'Storyboard and Pre-Viz', 'storytelling', 'Film', '#64748B', 'BW storyboard pre-visualization', false, false, '{"engine":"image_gen"}', '{"primary":"flux"}', 1202, true, 15, 2, 'low'),
('children_book', 'Childrens Book', 'storytelling', 'BookOpen', '#FBBF24', 'Illustrated childrens book pages', false, false, '{"engine":"image_gen"}', '{"primary":"flux"}', 1203, true, 35, 3, 'low'),
('vr_360', 'VR and 360', 'immersive', 'Camera', '#7C3AED', 'VR-ready 360 immersive content', false, false, '{"engine":"3d_gen"}', '{"primary":"blockade_labs"}', 1300, true, 80, 7, 'high'),
('ar_filter', 'AR Filter and Lens', 'immersive', 'Camera', '#EC4899', 'Augmented reality filters and lenses', false, false, '{"engine":"3d_gen"}', '{"primary":"spark_ar"}', 1301, true, 25, 4, 'medium'),
('architectural_viz', 'Architectural Viz', 'immersive', 'Camera', '#6B7280', '3D architectural visualization', false, false, '{"engine":"3d_gen"}', '{"primary":"blockade_labs"}', 1302, true, 70, 6, 'high'),
('low_poly_3d', 'Low Poly 3D', 'immersive', 'Box', '#10B981', 'Low polygon 3D art and environments', false, false, '{"engine":"3d_gen"}', '{"primary":"meshy"}', 1303, true, 30, 3, 'medium')
ON CONFLICT (name) DO NOTHING;

-- ══ PPT SUB-STYLES ══
INSERT INTO cast_visual_styles (name, label, category, icon, color, description, allows_photorealistic, requires_face_consent, style_config, provider_routing, sort_order, is_active, parent_style_id, sub_sort_order, estimated_size_mb, complexity_score, render_time_estimate)
SELECT 'ppt_corporate', 'Corporate Clean', 'presentation', 'FileText', '#3B82F6', 'Minimal corporate slide deck', false, false, '{"template":"corporate"}', '{"primary":"pptxgenjs"}', 100, true, id, 1, 10, 2, 'low'
FROM cast_visual_styles WHERE name = 'presentation_slides'
ON CONFLICT (name) DO NOTHING;

INSERT INTO cast_visual_styles (name, label, category, icon, color, description, allows_photorealistic, requires_face_consent, style_config, provider_routing, sort_order, is_active, parent_style_id, sub_sort_order, estimated_size_mb, complexity_score, render_time_estimate)
SELECT 'ppt_creative', 'Creative Bold', 'presentation', 'FileText', '#EC4899', 'Bold colorful creative decks', false, false, '{"template":"creative"}', '{"primary":"pptxgenjs"}', 100, true, id, 2, 12, 3, 'low'
FROM cast_visual_styles WHERE name = 'presentation_slides'
ON CONFLICT (name) DO NOTHING;

INSERT INTO cast_visual_styles (name, label, category, icon, color, description, allows_photorealistic, requires_face_consent, style_config, provider_routing, sort_order, is_active, parent_style_id, sub_sort_order, estimated_size_mb, complexity_score, render_time_estimate)
SELECT 'ppt_pitch_deck', 'Pitch Deck', 'presentation', 'FileText', '#F59E0B', 'Investor pitch deck format', false, false, '{"template":"pitch"}', '{"primary":"pptxgenjs"}', 100, true, id, 3, 8, 2, 'low'
FROM cast_visual_styles WHERE name = 'presentation_slides'
ON CONFLICT (name) DO NOTHING;

INSERT INTO cast_visual_styles (name, label, category, icon, color, description, allows_photorealistic, requires_face_consent, style_config, provider_routing, sort_order, is_active, parent_style_id, sub_sort_order, estimated_size_mb, complexity_score, render_time_estimate)
SELECT 'ppt_infographic', 'Infographic Deck', 'presentation', 'BarChart3', '#10B981', 'Data-heavy infographic slides', false, false, '{"template":"infographic"}', '{"primary":"pptxgenjs"}', 100, true, id, 4, 15, 3, 'low'
FROM cast_visual_styles WHERE name = 'presentation_slides'
ON CONFLICT (name) DO NOTHING;

INSERT INTO cast_visual_styles (name, label, category, icon, color, description, allows_photorealistic, requires_face_consent, style_config, provider_routing, sort_order, is_active, parent_style_id, sub_sort_order, estimated_size_mb, complexity_score, render_time_estimate)
SELECT 'ppt_educational', 'Educational Slides', 'presentation', 'BookOpen', '#6366F1', 'Teaching and training slides with diagrams', false, false, '{"template":"educational"}', '{"primary":"pptxgenjs"}', 100, true, id, 5, 12, 2, 'low'
FROM cast_visual_styles WHERE name = 'presentation_slides'
ON CONFLICT (name) DO NOTHING;

INSERT INTO cast_visual_styles (name, label, category, icon, color, description, allows_photorealistic, requires_face_consent, style_config, provider_routing, sort_order, is_active, parent_style_id, sub_sort_order, estimated_size_mb, complexity_score, render_time_estimate)
SELECT 'ppt_animated', 'Animated Video Deck', 'presentation', 'Film', '#A855F7', 'Slide deck with embedded animations', false, false, '{"template":"animated"}', '{"primary":"pptxgenjs"}', 100, true, id, 6, 25, 4, 'medium'
FROM cast_visual_styles WHERE name = 'presentation_slides'
ON CONFLICT (name) DO NOTHING;

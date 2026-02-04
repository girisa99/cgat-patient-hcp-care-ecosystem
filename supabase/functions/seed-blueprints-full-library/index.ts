/**
 * Seed Full Template Library
 * 100+ templates across ALL categories including:
 * - Animation, 3D, Interactive, Seasonal, Image-to-Video
 * - Regional variations for all zones
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================
// FULL TEMPLATE LIBRARY - ALL CATEGORIES
// ============================================

const FULL_LIBRARY_TEMPLATES = [
  // ==========================================
  // ANIMATION (15 templates)
  // ==========================================
  {
    name: 'Animated Logo Reveal',
    description: 'Dynamic logo animation with motion graphics',
    category: 'animation',
    estimated_duration_seconds: 10,
    target_platform: ['youtube', 'website', 'social'],
    industry_tags: ['branding', 'intro', 'motion_graphics'],
    style_preset: { visual_style: 'kinetic', avatar_style: 'none', color_scheme: 'brand', animation_type: 'logo_reveal' },
    scenes: [
      { scene_key: 'buildup', title: 'Particle Build', duration_seconds: 4, script_template: null },
      { scene_key: 'reveal', title: 'Logo Reveal', duration_seconds: 4, script_template: null },
      { scene_key: 'tagline', title: 'Tagline', duration_seconds: 2, script_template: '{{tagline}}' },
    ],
  },
  {
    name: 'Kinetic Typography',
    description: 'Text-driven animation with dynamic typography',
    category: 'animation',
    estimated_duration_seconds: 30,
    target_platform: ['youtube', 'instagram', 'tiktok'],
    industry_tags: ['text', 'motion', 'lyric_video'],
    style_preset: { visual_style: 'kinetic_text', avatar_style: 'none', color_scheme: 'bold', animation_type: 'typography' },
    scenes: [
      { scene_key: 'intro', title: 'Opening Text', duration_seconds: 5, script_template: '{{hook_text}}' },
      { scene_key: 'body', title: 'Main Message', duration_seconds: 20, script_template: '{{main_message}}' },
      { scene_key: 'cta', title: 'Call to Action', duration_seconds: 5, script_template: '{{cta_text}}' },
    ],
  },
  {
    name: 'Explainer Animation',
    description: 'Animated explainer with characters and scenes',
    category: 'animation',
    estimated_duration_seconds: 120,
    target_platform: ['youtube', 'website', 'lms'],
    industry_tags: ['explainer', '2d_animation', 'character'],
    style_preset: { visual_style: '2d_character', avatar_style: 'animated_character', color_scheme: 'friendly', animation_type: 'character_animation' },
    scenes: [
      { scene_key: 'hook', title: 'Opening Scene', duration_seconds: 10, script_template: 'Meet {{character_name}}, who struggles with {{problem}}.' },
      { scene_key: 'problem', title: 'The Problem', duration_seconds: 25, script_template: '{{problem_narrative}}' },
      { scene_key: 'solution', title: 'The Solution', duration_seconds: 35, script_template: 'With {{product_name}}, everything changes.' },
      { scene_key: 'benefits', title: 'Key Benefits', duration_seconds: 30, script_template: '{{benefit_1}}, {{benefit_2}}, {{benefit_3}}.' },
      { scene_key: 'cta', title: 'Get Started', duration_seconds: 20, script_template: 'Start your journey at {{website_url}}.' },
    ],
  },
  {
    name: 'Motion Infographic',
    description: 'Data visualization with animated charts and graphs',
    category: 'animation',
    estimated_duration_seconds: 60,
    target_platform: ['linkedin', 'youtube', 'presentation'],
    industry_tags: ['data', 'infographic', 'statistics'],
    style_preset: { visual_style: 'infographic', avatar_style: 'none', color_scheme: 'professional', animation_type: 'data_viz' },
    scenes: [
      { scene_key: 'intro', title: 'Topic Introduction', duration_seconds: 10, script_template: 'Let\'s look at {{topic}} by the numbers.' },
      { scene_key: 'stat_1', title: 'Key Statistic 1', duration_seconds: 15, script_template: '{{stat_1_value}} - {{stat_1_context}}' },
      { scene_key: 'stat_2', title: 'Key Statistic 2', duration_seconds: 15, script_template: '{{stat_2_value}} - {{stat_2_context}}' },
      { scene_key: 'stat_3', title: 'Key Statistic 3', duration_seconds: 15, script_template: '{{stat_3_value}} - {{stat_3_context}}' },
      { scene_key: 'conclusion', title: 'Takeaway', duration_seconds: 5, script_template: 'The data shows {{conclusion}}.' },
    ],
  },
  {
    name: 'Whiteboard Animation',
    description: 'Hand-drawn style educational animation',
    category: 'animation',
    estimated_duration_seconds: 180,
    target_platform: ['youtube', 'lms', 'website'],
    industry_tags: ['whiteboard', 'educational', 'hand_drawn'],
    style_preset: { visual_style: 'whiteboard', avatar_style: 'hand', color_scheme: 'minimal', animation_type: 'whiteboard' },
    scenes: [
      { scene_key: 'intro', title: 'Topic Setup', duration_seconds: 20, script_template: 'Today we explore {{topic}}.' },
      { scene_key: 'concept_1', title: 'First Concept', duration_seconds: 40, script_template: '{{concept_1_explanation}}' },
      { scene_key: 'concept_2', title: 'Second Concept', duration_seconds: 40, script_template: '{{concept_2_explanation}}' },
      { scene_key: 'concept_3', title: 'Third Concept', duration_seconds: 40, script_template: '{{concept_3_explanation}}' },
      { scene_key: 'summary', title: 'Summary', duration_seconds: 25, script_template: 'Remember: {{key_takeaways}}.' },
      { scene_key: 'cta', title: 'Next Steps', duration_seconds: 15, script_template: 'Learn more at {{resource_url}}.' },
    ],
  },
  {
    name: 'Social Media Promo - Animated',
    description: 'Eye-catching animated social content',
    category: 'animation',
    estimated_duration_seconds: 15,
    target_platform: ['instagram', 'tiktok', 'facebook'],
    industry_tags: ['social', 'promo', 'animated'],
    style_preset: { visual_style: 'dynamic', avatar_style: 'none', color_scheme: 'vibrant', animation_type: 'social_promo' },
    scenes: [
      { scene_key: 'hook', title: 'Visual Hook', duration_seconds: 3, script_template: null },
      { scene_key: 'message', title: 'Core Message', duration_seconds: 8, script_template: '{{promo_message}}' },
      { scene_key: 'cta', title: 'Action', duration_seconds: 4, script_template: '{{cta_text}}' },
    ],
  },
  {
    name: 'Animated Countdown',
    description: 'Event countdown with motion effects',
    category: 'animation',
    estimated_duration_seconds: 20,
    target_platform: ['instagram_stories', 'email', 'website'],
    industry_tags: ['countdown', 'event', 'urgency'],
    style_preset: { visual_style: 'countdown', avatar_style: 'none', color_scheme: 'urgent', animation_type: 'countdown' },
    scenes: [
      { scene_key: 'event', title: 'Event Intro', duration_seconds: 5, script_template: '{{event_name}} is coming!' },
      { scene_key: 'countdown', title: 'Countdown', duration_seconds: 10, script_template: '{{days_left}} days remaining!' },
      { scene_key: 'cta', title: 'Don\'t Miss Out', duration_seconds: 5, script_template: 'Register now: {{registration_url}}' },
    ],
  },
  {
    name: 'Transition Pack Demo',
    description: 'Showcase smooth transitions between scenes',
    category: 'animation',
    estimated_duration_seconds: 30,
    target_platform: ['youtube', 'portfolio'],
    industry_tags: ['transitions', 'demo_reel', 'motion'],
    style_preset: { visual_style: 'transition_showcase', avatar_style: 'none', color_scheme: 'gradient', animation_type: 'transitions' },
    scenes: [
      { scene_key: 'scene_1', title: 'Scene One', duration_seconds: 8, script_template: null },
      { scene_key: 'transition', title: 'Transition', duration_seconds: 2, script_template: null },
      { scene_key: 'scene_2', title: 'Scene Two', duration_seconds: 8, script_template: null },
      { scene_key: 'transition_2', title: 'Transition 2', duration_seconds: 2, script_template: null },
      { scene_key: 'scene_3', title: 'Scene Three', duration_seconds: 8, script_template: null },
      { scene_key: 'end', title: 'End Card', duration_seconds: 2, script_template: null },
    ],
  },

  // ==========================================
  // 3D & VR/AR (12 templates)
  // ==========================================
  {
    name: '3D Product Showcase',
    description: '360° rotating product visualization',
    category: '3d',
    estimated_duration_seconds: 45,
    target_platform: ['website', 'ecommerce', 'youtube'],
    industry_tags: ['product_3d', 'ecommerce', 'visualization'],
    style_preset: { visual_style: '3d_product', avatar_style: 'none', color_scheme: 'studio', render_type: '3d_rotation' },
    scenes: [
      { scene_key: 'intro', title: 'Product Intro', duration_seconds: 8, script_template: 'Introducing {{product_name}}.' },
      { scene_key: 'rotate', title: '360 View', duration_seconds: 15, script_template: 'Explore every angle of our design.' },
      { scene_key: 'features', title: 'Feature Highlights', duration_seconds: 15, script_template: '{{feature_callouts}}' },
      { scene_key: 'cta', title: 'Shop Now', duration_seconds: 7, script_template: 'Available at {{shop_url}}.' },
    ],
  },
  {
    name: '3D Architectural Walkthrough',
    description: 'Virtual tour of 3D rendered spaces',
    category: '3d',
    estimated_duration_seconds: 120,
    target_platform: ['website', 'vr_headset', 'youtube'],
    industry_tags: ['architecture', 'real_estate', 'interior'],
    style_preset: { visual_style: 'architectural', avatar_style: 'narrator', color_scheme: 'realistic', render_type: '3d_walkthrough' },
    scenes: [
      { scene_key: 'exterior', title: 'Exterior View', duration_seconds: 20, script_template: 'Welcome to {{property_name}}.' },
      { scene_key: 'entrance', title: 'Grand Entrance', duration_seconds: 20, script_template: 'Step inside the stunning entrance.' },
      { scene_key: 'living', title: 'Living Space', duration_seconds: 25, script_template: 'The open-concept living area features {{highlights}}.' },
      { scene_key: 'kitchen', title: 'Kitchen', duration_seconds: 20, script_template: 'A chef\'s kitchen with {{amenities}}.' },
      { scene_key: 'bedroom', title: 'Master Suite', duration_seconds: 20, script_template: 'The master suite offers {{features}}.' },
      { scene_key: 'outro', title: 'Contact', duration_seconds: 15, script_template: 'Schedule a viewing at {{contact_url}}.' },
    ],
  },
  {
    name: '3D Logo Animation',
    description: 'Photorealistic 3D logo with environment lighting',
    category: '3d',
    estimated_duration_seconds: 15,
    target_platform: ['youtube', 'website', 'broadcast'],
    industry_tags: ['logo', '3d_render', 'branding'],
    style_preset: { visual_style: '3d_cinematic', avatar_style: 'none', color_scheme: 'brand', render_type: '3d_logo' },
    scenes: [
      { scene_key: 'environment', title: 'Environment Setup', duration_seconds: 5, script_template: null },
      { scene_key: 'reveal', title: 'Logo Reveal', duration_seconds: 7, script_template: null },
      { scene_key: 'tagline', title: 'Tagline', duration_seconds: 3, script_template: '{{tagline}}' },
    ],
  },
  {
    name: 'Virtual Showroom',
    description: 'Interactive 3D product gallery experience',
    category: '3d',
    estimated_duration_seconds: 90,
    target_platform: ['website', 'vr_headset', 'trade_show'],
    industry_tags: ['showroom', 'virtual', 'interactive'],
    style_preset: { visual_style: 'showroom', avatar_style: 'guide', color_scheme: 'modern', render_type: '3d_showroom' },
    scenes: [
      { scene_key: 'welcome', title: 'Welcome', duration_seconds: 15, script_template: 'Welcome to our virtual showroom.' },
      { scene_key: 'product_1', title: 'Featured Product 1', duration_seconds: 20, script_template: 'Explore {{product_1}}.' },
      { scene_key: 'product_2', title: 'Featured Product 2', duration_seconds: 20, script_template: 'Discover {{product_2}}.' },
      { scene_key: 'product_3', title: 'Featured Product 3', duration_seconds: 20, script_template: 'Experience {{product_3}}.' },
      { scene_key: 'exit', title: 'Thank You', duration_seconds: 15, script_template: 'Thank you for visiting. Contact us at {{contact}}.' },
    ],
  },
  {
    name: 'AR Product Preview',
    description: 'Augmented reality product placement demo',
    category: '3d',
    estimated_duration_seconds: 30,
    target_platform: ['ar_app', 'instagram_ar', 'snapchat'],
    industry_tags: ['ar', 'try_before_buy', 'furniture'],
    style_preset: { visual_style: 'ar_overlay', avatar_style: 'none', color_scheme: 'transparent', render_type: 'ar' },
    scenes: [
      { scene_key: 'scan', title: 'Scan Surface', duration_seconds: 8, script_template: 'Point your camera at a flat surface.' },
      { scene_key: 'place', title: 'Place Product', duration_seconds: 12, script_template: 'Tap to place {{product_name}}.' },
      { scene_key: 'interact', title: 'Interact', duration_seconds: 10, script_template: 'Pinch to resize. Swipe to rotate.' },
    ],
  },
  {
    name: '3D Character Animation',
    description: '3D animated character for storytelling',
    category: '3d',
    estimated_duration_seconds: 60,
    target_platform: ['youtube', 'gaming', 'entertainment'],
    industry_tags: ['character', '3d_animation', 'storytelling'],
    style_preset: { visual_style: '3d_character', avatar_style: '3d_avatar', color_scheme: 'stylized', render_type: '3d_character' },
    scenes: [
      { scene_key: 'intro', title: 'Character Intro', duration_seconds: 15, script_template: 'Meet {{character_name}}.' },
      { scene_key: 'action', title: 'Character Action', duration_seconds: 30, script_template: '{{action_narrative}}' },
      { scene_key: 'outro', title: 'Character Outro', duration_seconds: 15, script_template: '{{closing_line}}' },
    ],
  },

  // ==========================================
  // INTERACTIVE & IMMERSIVE (10 templates)
  // ==========================================
  {
    name: 'Interactive Product Tour',
    description: 'Clickable hotspots for self-guided exploration',
    category: 'interactive',
    estimated_duration_seconds: 0, // Variable
    target_platform: ['website', 'app', 'sales_demo'],
    industry_tags: ['interactive', 'hotspot', 'tour'],
    style_preset: { visual_style: 'interactive', avatar_style: 'guide', color_scheme: 'brand', interaction_type: 'hotspots' },
    scenes: [
      { scene_key: 'overview', title: 'Product Overview', duration_seconds: 0, script_template: 'Click any feature to learn more.' },
      { scene_key: 'feature_1', title: 'Feature 1', duration_seconds: 0, script_template: '{{feature_1_description}}' },
      { scene_key: 'feature_2', title: 'Feature 2', duration_seconds: 0, script_template: '{{feature_2_description}}' },
      { scene_key: 'feature_3', title: 'Feature 3', duration_seconds: 0, script_template: '{{feature_3_description}}' },
    ],
  },
  {
    name: 'Choose Your Path',
    description: 'Branching narrative with viewer choices',
    category: 'interactive',
    estimated_duration_seconds: 0,
    target_platform: ['youtube', 'website', 'app'],
    industry_tags: ['branching', 'choice', 'gamified'],
    style_preset: { visual_style: 'branching', avatar_style: 'host', color_scheme: 'engaging', interaction_type: 'branching' },
    scenes: [
      { scene_key: 'intro', title: 'Setup', duration_seconds: 0, script_template: 'You are about to make a choice...' },
      { scene_key: 'choice_1', title: 'First Choice', duration_seconds: 0, script_template: 'Do you choose {{option_a}} or {{option_b}}?' },
      { scene_key: 'path_a', title: 'Path A', duration_seconds: 0, script_template: '{{path_a_narrative}}' },
      { scene_key: 'path_b', title: 'Path B', duration_seconds: 0, script_template: '{{path_b_narrative}}' },
    ],
  },
  {
    name: 'Quiz Video',
    description: 'Interactive quiz with clickable answers',
    category: 'interactive',
    estimated_duration_seconds: 120,
    target_platform: ['lms', 'youtube', 'website'],
    industry_tags: ['quiz', 'assessment', 'learning'],
    style_preset: { visual_style: 'quiz', avatar_style: 'instructor', color_scheme: 'educational', interaction_type: 'quiz' },
    scenes: [
      { scene_key: 'intro', title: 'Quiz Intro', duration_seconds: 15, script_template: 'Test your knowledge of {{topic}}!' },
      { scene_key: 'q1', title: 'Question 1', duration_seconds: 25, script_template: '{{question_1}}' },
      { scene_key: 'q2', title: 'Question 2', duration_seconds: 25, script_template: '{{question_2}}' },
      { scene_key: 'q3', title: 'Question 3', duration_seconds: 25, script_template: '{{question_3}}' },
      { scene_key: 'results', title: 'Your Results', duration_seconds: 30, script_template: 'You scored {{score}}!' },
    ],
  },
  {
    name: 'Shoppable Video',
    description: 'Click-to-buy product tags in video',
    category: 'interactive',
    estimated_duration_seconds: 60,
    target_platform: ['ecommerce', 'instagram_shopping', 'youtube'],
    industry_tags: ['shoppable', 'ecommerce', 'buy_now'],
    style_preset: { visual_style: 'shoppable', avatar_style: 'influencer', color_scheme: 'lifestyle', interaction_type: 'shoppable' },
    scenes: [
      { scene_key: 'intro', title: 'Style Introduction', duration_seconds: 10, script_template: 'Check out my favorite pieces from {{brand}}.' },
      { scene_key: 'look_1', title: 'Look 1', duration_seconds: 15, script_template: 'This {{item_1}} is perfect for {{occasion}}. Click to shop!' },
      { scene_key: 'look_2', title: 'Look 2', duration_seconds: 15, script_template: 'Loving this {{item_2}}. Tap to get yours!' },
      { scene_key: 'look_3', title: 'Look 3', duration_seconds: 15, script_template: 'Complete the look with {{item_3}}.' },
      { scene_key: 'cta', title: 'Shop All', duration_seconds: 5, script_template: 'Shop the entire collection now!' },
    ],
  },
  {
    name: '360° Experience',
    description: 'Immersive spherical video with drag navigation',
    category: 'interactive',
    estimated_duration_seconds: 90,
    target_platform: ['youtube_360', 'vr_headset', 'website'],
    industry_tags: ['360', 'immersive', 'vr'],
    style_preset: { visual_style: '360_spherical', avatar_style: 'narrator', color_scheme: 'realistic', interaction_type: '360' },
    scenes: [
      { scene_key: 'intro', title: 'Welcome', duration_seconds: 15, script_template: 'Look around! You\'re in {{location}}.' },
      { scene_key: 'explore_1', title: 'Area 1', duration_seconds: 25, script_template: 'To your left, you\'ll see {{highlight_1}}.' },
      { scene_key: 'explore_2', title: 'Area 2', duration_seconds: 25, script_template: 'Turn around to discover {{highlight_2}}.' },
      { scene_key: 'explore_3', title: 'Area 3', duration_seconds: 20, script_template: 'Above you is {{highlight_3}}.' },
      { scene_key: 'outro', title: 'Closing', duration_seconds: 5, script_template: 'Thanks for exploring with us!' },
    ],
  },

  // ==========================================
  // IMAGE-TO-VIDEO (10 templates)
  // ==========================================
  {
    name: 'Photo Slideshow - Cinematic',
    description: 'Ken Burns effect with cinematic transitions',
    category: 'image_to_video',
    estimated_duration_seconds: 60,
    target_platform: ['youtube', 'website', 'wedding'],
    industry_tags: ['slideshow', 'photo', 'memories'],
    style_preset: { visual_style: 'cinematic_slideshow', avatar_style: 'none', color_scheme: 'warm', generation_type: 'img2vid' },
    scenes: [
      { scene_key: 'image_1', title: 'Photo 1', duration_seconds: 8, script_template: null },
      { scene_key: 'image_2', title: 'Photo 2', duration_seconds: 8, script_template: null },
      { scene_key: 'image_3', title: 'Photo 3', duration_seconds: 8, script_template: null },
      { scene_key: 'image_4', title: 'Photo 4', duration_seconds: 8, script_template: null },
      { scene_key: 'image_5', title: 'Photo 5', duration_seconds: 8, script_template: null },
      { scene_key: 'image_6', title: 'Photo 6', duration_seconds: 8, script_template: null },
      { scene_key: 'image_7', title: 'Photo 7', duration_seconds: 8, script_template: null },
      { scene_key: 'end', title: 'End Card', duration_seconds: 4, script_template: '{{closing_text}}' },
    ],
  },
  {
    name: 'Product Image Animation',
    description: 'Bring static product photos to life',
    category: 'image_to_video',
    estimated_duration_seconds: 15,
    target_platform: ['ecommerce', 'social', 'ads'],
    industry_tags: ['product', 'animate_image', 'ecommerce'],
    style_preset: { visual_style: 'product_animation', avatar_style: 'none', color_scheme: 'studio', generation_type: 'img2vid' },
    scenes: [
      { scene_key: 'static', title: 'Product Image', duration_seconds: 3, script_template: null },
      { scene_key: 'animate', title: 'Animation', duration_seconds: 8, script_template: null },
      { scene_key: 'cta', title: 'Shop Now', duration_seconds: 4, script_template: '{{cta_text}}' },
    ],
  },
  {
    name: 'Before/After Reveal',
    description: 'Dramatic before/after image transformation',
    category: 'image_to_video',
    estimated_duration_seconds: 20,
    target_platform: ['instagram', 'youtube', 'website'],
    industry_tags: ['before_after', 'transformation', 'reveal'],
    style_preset: { visual_style: 'before_after', avatar_style: 'none', color_scheme: 'contrast', generation_type: 'img2vid' },
    scenes: [
      { scene_key: 'before', title: 'Before', duration_seconds: 6, script_template: 'Before: {{before_description}}' },
      { scene_key: 'transition', title: 'Reveal', duration_seconds: 4, script_template: null },
      { scene_key: 'after', title: 'After', duration_seconds: 6, script_template: 'After: {{after_description}}' },
      { scene_key: 'cta', title: 'Transform Yours', duration_seconds: 4, script_template: 'Get your transformation at {{url}}' },
    ],
  },
  {
    name: 'AI Image Animation',
    description: 'Use AI to animate any static image with motion',
    category: 'image_to_video',
    estimated_duration_seconds: 10,
    target_platform: ['social', 'website', 'nft'],
    industry_tags: ['ai_animation', 'stable_video', 'svd'],
    style_preset: { visual_style: 'ai_animate', avatar_style: 'none', color_scheme: 'original', generation_type: 'img2vid_ai', provider: 'svd' },
    scenes: [
      { scene_key: 'source', title: 'Source Image', duration_seconds: 2, script_template: null },
      { scene_key: 'animate', title: 'AI Animation', duration_seconds: 6, script_template: null },
      { scene_key: 'loop', title: 'Loop', duration_seconds: 2, script_template: null },
    ],
  },
  {
    name: 'Photo Parallax Effect',
    description: '2.5D parallax depth from single image',
    category: 'image_to_video',
    estimated_duration_seconds: 15,
    target_platform: ['youtube', 'documentary', 'presentation'],
    industry_tags: ['parallax', '2.5d', 'depth'],
    style_preset: { visual_style: 'parallax', avatar_style: 'none', color_scheme: 'cinematic', generation_type: 'img2vid' },
    scenes: [
      { scene_key: 'reveal', title: 'Depth Reveal', duration_seconds: 8, script_template: null },
      { scene_key: 'pan', title: 'Camera Pan', duration_seconds: 7, script_template: null },
    ],
  },
  {
    name: 'Cinemagraph',
    description: 'Photo with subtle looping motion elements',
    category: 'image_to_video',
    estimated_duration_seconds: 10,
    target_platform: ['website', 'email', 'ads'],
    industry_tags: ['cinemagraph', 'loop', 'subtle_motion'],
    style_preset: { visual_style: 'cinemagraph', avatar_style: 'none', color_scheme: 'original', generation_type: 'img2vid' },
    scenes: [
      { scene_key: 'loop', title: 'Looping Motion', duration_seconds: 10, script_template: null },
    ],
  },

  // ==========================================
  // SEASONAL & HOLIDAY (15 templates)
  // ==========================================
  {
    name: 'Holiday Sale Promo',
    description: 'Festive promotional video for holiday sales',
    category: 'seasonal',
    estimated_duration_seconds: 30,
    target_platform: ['social', 'email', 'ads'],
    industry_tags: ['holiday', 'sale', 'christmas', 'black_friday'],
    style_preset: { visual_style: 'festive', avatar_style: 'cheerful', color_scheme: 'holiday_red_green', season: 'winter_holiday' },
    scenes: [
      { scene_key: 'hook', title: 'Holiday Greeting', duration_seconds: 5, script_template: 'Happy Holidays from {{brand_name}}!' },
      { scene_key: 'offer', title: 'Sale Announcement', duration_seconds: 15, script_template: 'Save {{discount}}% on everything!' },
      { scene_key: 'cta', title: 'Shop Now', duration_seconds: 10, script_template: 'Shop now through {{end_date}}. {{website_url}}' },
    ],
  },
  {
    name: 'New Year Countdown',
    description: 'New Year celebration and countdown',
    category: 'seasonal',
    estimated_duration_seconds: 45,
    target_platform: ['social', 'youtube', 'email'],
    industry_tags: ['new_year', 'celebration', 'countdown'],
    style_preset: { visual_style: 'celebration', avatar_style: 'energetic', color_scheme: 'gold_black', season: 'new_year' },
    scenes: [
      { scene_key: 'reflection', title: 'Year in Review', duration_seconds: 15, script_template: 'What a year it has been at {{brand_name}}!' },
      { scene_key: 'thanks', title: 'Thank You', duration_seconds: 10, script_template: 'Thank you for being part of our journey.' },
      { scene_key: 'countdown', title: 'Countdown', duration_seconds: 10, script_template: '3... 2... 1... Happy New Year!' },
      { scene_key: 'wishes', title: 'New Year Wishes', duration_seconds: 10, script_template: 'Here\'s to an amazing {{new_year}}!' },
    ],
  },
  {
    name: 'Valentine\'s Day Campaign',
    description: 'Romantic themed promotional content',
    category: 'seasonal',
    estimated_duration_seconds: 30,
    target_platform: ['instagram', 'email', 'ads'],
    industry_tags: ['valentines', 'love', 'romance'],
    style_preset: { visual_style: 'romantic', avatar_style: 'warm', color_scheme: 'pink_red', season: 'valentines' },
    scenes: [
      { scene_key: 'intro', title: 'Love is in the Air', duration_seconds: 8, script_template: 'This Valentine\'s Day, show your love with {{brand_name}}.' },
      { scene_key: 'products', title: 'Gift Ideas', duration_seconds: 15, script_template: 'Perfect gifts starting at {{price}}.' },
      { scene_key: 'cta', title: 'Shop Love', duration_seconds: 7, script_template: 'Order by {{deadline}} for guaranteed delivery!' },
    ],
  },
  {
    name: 'Spring Launch',
    description: 'Fresh spring collection or product launch',
    category: 'seasonal',
    estimated_duration_seconds: 45,
    target_platform: ['youtube', 'instagram', 'website'],
    industry_tags: ['spring', 'fresh', 'new_collection'],
    style_preset: { visual_style: 'fresh', avatar_style: 'light', color_scheme: 'pastel', season: 'spring' },
    scenes: [
      { scene_key: 'intro', title: 'Spring Has Arrived', duration_seconds: 10, script_template: 'Spring into something new!' },
      { scene_key: 'showcase', title: 'New Collection', duration_seconds: 25, script_template: 'Introducing our {{collection_name}} collection.' },
      { scene_key: 'cta', title: 'Shop Spring', duration_seconds: 10, script_template: 'Explore the collection at {{website_url}}.' },
    ],
  },
  {
    name: 'Summer Campaign',
    description: 'Vibrant summer promotional content',
    category: 'seasonal',
    estimated_duration_seconds: 30,
    target_platform: ['instagram', 'tiktok', 'youtube'],
    industry_tags: ['summer', 'vacation', 'beach'],
    style_preset: { visual_style: 'sunny', avatar_style: 'casual', color_scheme: 'tropical', season: 'summer' },
    scenes: [
      { scene_key: 'vibe', title: 'Summer Vibes', duration_seconds: 8, script_template: 'Summer is calling!' },
      { scene_key: 'products', title: 'Summer Essentials', duration_seconds: 15, script_template: 'Get ready with {{summer_products}}.' },
      { scene_key: 'cta', title: 'Shop Summer', duration_seconds: 7, script_template: 'Shop the summer sale now!' },
    ],
  },
  {
    name: 'Back to School',
    description: 'Back to school campaign video',
    category: 'seasonal',
    estimated_duration_seconds: 30,
    target_platform: ['youtube', 'facebook', 'email'],
    industry_tags: ['back_to_school', 'education', 'fall'],
    style_preset: { visual_style: 'academic', avatar_style: 'friendly', color_scheme: 'autumn', season: 'back_to_school' },
    scenes: [
      { scene_key: 'intro', title: 'Back to School', duration_seconds: 8, script_template: 'Get ready for a great school year!' },
      { scene_key: 'products', title: 'School Essentials', duration_seconds: 15, script_template: 'Everything you need from {{brand_name}}.' },
      { scene_key: 'cta', title: 'Shop Now', duration_seconds: 7, script_template: 'Shop back to school at {{website_url}}.' },
    ],
  },
  {
    name: 'Halloween Special',
    description: 'Spooky Halloween themed content',
    category: 'seasonal',
    estimated_duration_seconds: 30,
    target_platform: ['instagram', 'tiktok', 'youtube'],
    industry_tags: ['halloween', 'spooky', 'costume'],
    style_preset: { visual_style: 'spooky', avatar_style: 'mysterious', color_scheme: 'orange_black', season: 'halloween' },
    scenes: [
      { scene_key: 'intro', title: 'Spooky Season', duration_seconds: 8, script_template: 'Something spooky is coming...' },
      { scene_key: 'reveal', title: 'The Reveal', duration_seconds: 15, script_template: 'Introducing our {{halloween_product}}!' },
      { scene_key: 'cta', title: 'Shop Halloween', duration_seconds: 7, script_template: 'Get yours before they vanish! 🎃' },
    ],
  },
  {
    name: 'Thanksgiving Gratitude',
    description: 'Thanksgiving appreciation message',
    category: 'seasonal',
    estimated_duration_seconds: 45,
    target_platform: ['email', 'social', 'website'],
    industry_tags: ['thanksgiving', 'gratitude', 'fall'],
    style_preset: { visual_style: 'warm', avatar_style: 'genuine', color_scheme: 'autumn_warm', season: 'thanksgiving' },
    scenes: [
      { scene_key: 'greeting', title: 'Thanksgiving Greeting', duration_seconds: 10, script_template: 'Happy Thanksgiving from {{brand_name}}!' },
      { scene_key: 'thanks', title: 'Our Gratitude', duration_seconds: 20, script_template: 'We are grateful for {{gratitude_message}}.' },
      { scene_key: 'wishes', title: 'Warm Wishes', duration_seconds: 15, script_template: 'Wishing you and your family a wonderful holiday.' },
    ],
  },
  {
    name: 'Diwali Celebration',
    description: 'Festival of Lights celebration content',
    category: 'seasonal',
    estimated_duration_seconds: 45,
    target_platform: ['youtube', 'instagram', 'whatsapp'],
    industry_tags: ['diwali', 'india', 'festival', 'lights'],
    style_preset: { visual_style: 'festive_indian', avatar_style: 'traditional', color_scheme: 'gold_maroon', season: 'diwali', region: 'sea' },
    scenes: [
      { scene_key: 'greeting', title: 'Diwali Greeting', duration_seconds: 10, script_template: 'शुभ दीपावली! Happy Diwali from {{brand_name}}!' },
      { scene_key: 'celebration', title: 'Festival Joy', duration_seconds: 20, script_template: 'May this festival of lights bring you joy and prosperity.' },
      { scene_key: 'offer', title: 'Festive Offer', duration_seconds: 15, script_template: 'Celebrate with {{discount}}% off everything!' },
    ],
  },
  {
    name: 'Lunar New Year',
    description: 'Chinese New Year celebration video',
    category: 'seasonal',
    estimated_duration_seconds: 45,
    target_platform: ['wechat', 'youtube', 'instagram'],
    industry_tags: ['lunar_new_year', 'chinese', 'spring_festival'],
    style_preset: { visual_style: 'chinese_festive', avatar_style: 'traditional', color_scheme: 'red_gold', season: 'lunar_new_year', region: 'cjk' },
    scenes: [
      { scene_key: 'greeting', title: 'New Year Greeting', duration_seconds: 10, script_template: '新年快乐! Happy Lunar New Year!' },
      { scene_key: 'wishes', title: 'Prosperity Wishes', duration_seconds: 20, script_template: 'Wishing you health, wealth, and happiness in the Year of the {{zodiac}}.' },
      { scene_key: 'celebration', title: 'Celebrate', duration_seconds: 15, script_template: 'Celebrate with {{brand_name}}!' },
    ],
  },
  {
    name: 'Eid Mubarak',
    description: 'Eid celebration and greeting video',
    category: 'seasonal',
    estimated_duration_seconds: 45,
    target_platform: ['youtube', 'instagram', 'whatsapp'],
    industry_tags: ['eid', 'ramadan', 'islamic', 'celebration'],
    style_preset: { visual_style: 'islamic_elegant', avatar_style: 'respectful', color_scheme: 'gold_green', season: 'eid', region: 'mena' },
    scenes: [
      { scene_key: 'greeting', title: 'Eid Greeting', duration_seconds: 12, script_template: 'عيد مبارك! Eid Mubarak from {{brand_name}}!' },
      { scene_key: 'wishes', title: 'Blessings', duration_seconds: 20, script_template: 'May this Eid bring you peace, happiness, and prosperity.' },
      { scene_key: 'celebration', title: 'Celebrate Together', duration_seconds: 13, script_template: 'Celebrate with your loved ones.' },
    ],
  },
  {
    name: 'Black Friday / Cyber Monday',
    description: 'Major shopping event promotional video',
    category: 'seasonal',
    estimated_duration_seconds: 20,
    target_platform: ['social', 'email', 'ads'],
    industry_tags: ['black_friday', 'cyber_monday', 'sale', 'deals'],
    style_preset: { visual_style: 'urgent', avatar_style: 'energetic', color_scheme: 'black_gold', season: 'black_friday' },
    scenes: [
      { scene_key: 'hook', title: 'Big Sale', duration_seconds: 4, script_template: 'BLACK FRIDAY IS HERE!' },
      { scene_key: 'deals', title: 'Deals', duration_seconds: 10, script_template: 'Up to {{discount}}% off EVERYTHING!' },
      { scene_key: 'urgency', title: 'Urgency', duration_seconds: 6, script_template: 'Ends {{end_date}}. Shop now: {{website_url}}' },
    ],
  },

  // ==========================================
  // REGIONAL ADDITIONS
  // ==========================================
  {
    name: 'Anime Style Explainer',
    description: 'Anime-inspired animated explainer',
    category: 'animation',
    estimated_duration_seconds: 90,
    target_platform: ['youtube', 'website', 'social'],
    industry_tags: ['anime', 'japan', 'stylized'],
    style_preset: { visual_style: 'anime', avatar_style: 'anime_character', color_scheme: 'vibrant', animation_type: 'anime', region: 'cjk' },
    scenes: [
      { scene_key: 'intro', title: 'Opening', duration_seconds: 15, script_template: '{{anime_intro}}' },
      { scene_key: 'story', title: 'The Story', duration_seconds: 45, script_template: '{{story_narrative}}' },
      { scene_key: 'action', title: 'Action Sequence', duration_seconds: 20, script_template: null },
      { scene_key: 'outro', title: 'Closing', duration_seconds: 10, script_template: '{{closing}}' },
    ],
  },
  {
    name: 'Bollywood Style Promo',
    description: 'Colorful, energetic Bollywood-inspired content',
    category: 'entertainment',
    estimated_duration_seconds: 60,
    target_platform: ['youtube', 'instagram', 'hotstar'],
    industry_tags: ['bollywood', 'india', 'entertainment'],
    style_preset: { visual_style: 'bollywood', avatar_style: 'dramatic', color_scheme: 'vibrant_indian', region: 'sea' },
    scenes: [
      { scene_key: 'intro', title: 'Dramatic Intro', duration_seconds: 15, script_template: '{{dramatic_opening}}' },
      { scene_key: 'showcase', title: 'The Showcase', duration_seconds: 30, script_template: '{{showcase_content}}' },
      { scene_key: 'finale', title: 'Grand Finale', duration_seconds: 15, script_template: '{{grand_finale}}' },
    ],
  },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`🌱 Seeding ${FULL_LIBRARY_TEMPLATES.length} full library templates...`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const template of FULL_LIBRARY_TEMPLATES) {
      const { scenes, ...blueprintData } = template;

      // Check if template already exists
      const { data: existing } = await supabase
        .from('video_blueprints')
        .select('id')
        .eq('name', blueprintData.name)
        .single();

      if (existing) {
        console.log(`⏭️ Skipping existing: ${blueprintData.name}`);
        skipped++;
        continue;
      }

      // Insert blueprint
      const { data: blueprint, error: bpError } = await supabase
        .from('video_blueprints')
        .insert({
          ...blueprintData,
          is_system_default: true,
          is_active: true,
          is_public: true,
        })
        .select()
        .single();

      if (bpError) {
        console.error(`❌ Error inserting ${blueprintData.name}:`, bpError);
        errors++;
        continue;
      }

      // Insert scenes
      if (scenes && scenes.length > 0) {
        const scenesToInsert = scenes.map((scene: any, index: number) => ({
          blueprint_id: blueprint.id,
          scene_key: scene.scene_key,
          title: scene.title,
          description: null,
          order_index: index,
          scene_type: 'content',
          script_template: scene.script_template,
          duration_seconds: scene.duration_seconds,
          min_duration_seconds: Math.max(1, scene.duration_seconds - 5),
          max_duration_seconds: scene.duration_seconds + 10,
        }));

        const { error: sceneError } = await supabase
          .from('blueprint_scenes')
          .insert(scenesToInsert);

        if (sceneError) {
          console.error(`⚠️ Error inserting scenes for ${blueprintData.name}:`, sceneError);
        }
      }

      console.log(`✅ Created: ${blueprintData.name} (${scenes?.length || 0} scenes)`);
      created++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        created,
        skipped,
        errors,
        total: FULL_LIBRARY_TEMPLATES.length,
        message: `Added ${created} new templates. ${skipped} already existed. ${errors} errors.`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Seeding error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

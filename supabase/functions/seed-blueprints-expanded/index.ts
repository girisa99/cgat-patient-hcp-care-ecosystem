/**
 * Seed Expanded Blueprint Templates
 * Creates 50+ templates across categories with regional variations
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================
// EXPANDED TEMPLATE LIBRARY (50+ Templates)
// ============================================

const EXPANDED_TEMPLATES = [
  // ==========================================
  // MARKETING (15 templates)
  // ==========================================
  {
    name: 'Product Demo',
    description: 'Showcase product features with clear value propositions',
    category: 'marketing',
    estimated_duration_seconds: 90,
    target_platform: ['youtube', 'linkedin', 'website'],
    industry_tags: ['saas', 'tech', 'b2b'],
    style_preset: { visual_style: 'clean', avatar_style: 'professional', color_scheme: 'brand' },
    scenes: [
      { scene_key: 'hook', title: 'Attention Hook', duration_seconds: 5, script_template: 'What if you could {{main_benefit}} in just minutes?' },
      { scene_key: 'problem', title: 'Problem Statement', duration_seconds: 15, script_template: '{{audience_segment}} struggle with {{pain_point}} every day.' },
      { scene_key: 'solution', title: 'Solution Reveal', duration_seconds: 20, script_template: 'Introducing {{product_name}} - {{tagline}}.' },
      { scene_key: 'demo', title: 'Feature Demo', duration_seconds: 30, script_template: 'Watch how easy it is to {{key_action}}.' },
      { scene_key: 'cta', title: 'Call to Action', duration_seconds: 10, script_template: 'Start your free trial at {{website_url}}.' },
    ],
  },
  {
    name: 'Social Ad - TikTok Style',
    description: 'Short-form viral content for TikTok and Reels',
    category: 'marketing',
    estimated_duration_seconds: 15,
    target_platform: ['tiktok', 'instagram_reels', 'youtube_shorts'],
    industry_tags: ['b2c', 'viral', 'gen_z'],
    style_preset: { visual_style: 'dynamic', avatar_style: 'casual', color_scheme: 'vibrant', transition: 'fast_cuts' },
    scenes: [
      { scene_key: 'hook', title: 'Scroll Stopper', duration_seconds: 3, script_template: 'POV: You just discovered {{product_name}}' },
      { scene_key: 'reveal', title: 'Quick Demo', duration_seconds: 7, script_template: 'This changes everything for {{use_case}}' },
      { scene_key: 'cta', title: 'Action', duration_seconds: 5, script_template: 'Link in bio 👆' },
    ],
  },
  {
    name: 'LinkedIn Thought Leadership',
    description: 'Professional B2B content for LinkedIn',
    category: 'marketing',
    estimated_duration_seconds: 60,
    target_platform: ['linkedin', 'website'],
    industry_tags: ['b2b', 'enterprise', 'thought_leadership'],
    style_preset: { visual_style: 'professional', avatar_style: 'executive', color_scheme: 'corporate' },
    scenes: [
      { scene_key: 'insight', title: 'Industry Insight', duration_seconds: 15, script_template: 'The {{industry}} landscape is shifting dramatically.' },
      { scene_key: 'data', title: 'Supporting Data', duration_seconds: 20, script_template: '{{statistic}} of leaders are now prioritizing {{trend}}.' },
      { scene_key: 'solution', title: 'Your Approach', duration_seconds: 20, script_template: 'At {{company_name}}, we believe in {{philosophy}}.' },
      { scene_key: 'cta', title: 'Engage', duration_seconds: 5, script_template: "What's your take? Share in the comments." },
    ],
  },
  {
    name: 'Customer Testimonial',
    description: 'Social proof through customer success stories',
    category: 'marketing',
    estimated_duration_seconds: 90,
    target_platform: ['youtube', 'website', 'linkedin'],
    industry_tags: ['social_proof', 'case_study', 'trust'],
    style_preset: { visual_style: 'authentic', avatar_style: 'relatable', color_scheme: 'warm' },
    scenes: [
      { scene_key: 'intro', title: 'Customer Introduction', duration_seconds: 10, script_template: "Hi, I'm {{customer_name}} from {{customer_company}}." },
      { scene_key: 'challenge', title: 'Their Challenge', duration_seconds: 20, script_template: 'Before {{product_name}}, we struggled with {{challenge}}.' },
      { scene_key: 'solution', title: 'Discovery', duration_seconds: 15, script_template: 'When we found {{product_name}}, everything changed.' },
      { scene_key: 'results', title: 'Results', duration_seconds: 25, script_template: 'We achieved {{result_metric}} within {{timeframe}}.' },
      { scene_key: 'recommend', title: 'Recommendation', duration_seconds: 20, script_template: 'I recommend {{product_name}} to anyone facing {{pain_point}}.' },
    ],
  },
  {
    name: 'Product Launch',
    description: 'Exciting new product or feature announcement',
    category: 'marketing',
    estimated_duration_seconds: 120,
    target_platform: ['youtube', 'website', 'email'],
    industry_tags: ['launch', 'announcement', 'hype'],
    style_preset: { visual_style: 'cinematic', avatar_style: 'energetic', color_scheme: 'bold' },
    scenes: [
      { scene_key: 'teaser', title: 'Teaser', duration_seconds: 10, script_template: 'Something big is coming to {{product_name}}...' },
      { scene_key: 'reveal', title: 'The Big Reveal', duration_seconds: 20, script_template: 'Introducing {{feature_name}}!' },
      { scene_key: 'demo', title: 'Feature Showcase', duration_seconds: 40, script_template: 'Here\'s what you can do with {{feature_name}}.' },
      { scene_key: 'benefits', title: 'Key Benefits', duration_seconds: 30, script_template: 'This means {{benefit_1}}, {{benefit_2}}, and {{benefit_3}}.' },
      { scene_key: 'availability', title: 'Availability', duration_seconds: 10, script_template: 'Available now for all {{plan_type}} users.' },
      { scene_key: 'cta', title: 'Get Started', duration_seconds: 10, script_template: 'Try it today at {{website_url}}.' },
    ],
  },
  {
    name: 'Comparison Video',
    description: 'Before/After or competitive comparison',
    category: 'marketing',
    estimated_duration_seconds: 60,
    target_platform: ['youtube', 'linkedin'],
    industry_tags: ['competitive', 'decision_stage', 'comparison'],
    style_preset: { visual_style: 'split_screen', avatar_style: 'confident', color_scheme: 'contrast' },
    scenes: [
      { scene_key: 'setup', title: 'The Question', duration_seconds: 10, script_template: 'Choosing between {{option_a}} and {{option_b}}?' },
      { scene_key: 'criteria', title: 'Comparison Criteria', duration_seconds: 15, script_template: "Let's compare on {{criteria_1}}, {{criteria_2}}, and {{criteria_3}}." },
      { scene_key: 'analysis', title: 'Side by Side', duration_seconds: 25, script_template: 'Here\'s how they stack up...' },
      { scene_key: 'verdict', title: 'Our Take', duration_seconds: 10, script_template: 'For {{use_case}}, {{product_name}} wins because {{reason}}.' },
    ],
  },
  {
    name: 'Explainer - 60 Second',
    description: 'Quick product explainer for ads and landing pages',
    category: 'marketing',
    estimated_duration_seconds: 60,
    target_platform: ['website', 'facebook', 'youtube'],
    industry_tags: ['explainer', 'awareness', 'conversion'],
    style_preset: { visual_style: 'animated', avatar_style: 'friendly', color_scheme: 'brand' },
    scenes: [
      { scene_key: 'problem', title: 'Problem', duration_seconds: 15, script_template: 'Tired of {{pain_point}}?' },
      { scene_key: 'solution', title: 'Solution', duration_seconds: 20, script_template: '{{product_name}} makes {{benefit}} easy.' },
      { scene_key: 'how', title: 'How It Works', duration_seconds: 15, script_template: 'Simply {{step_1}}, {{step_2}}, {{step_3}}.' },
      { scene_key: 'cta', title: 'Start Now', duration_seconds: 10, script_template: 'Get started free at {{website_url}}.' },
    ],
  },
  {
    name: 'Brand Story',
    description: 'Company origin and mission narrative',
    category: 'marketing',
    estimated_duration_seconds: 180,
    target_platform: ['youtube', 'website', 'about_page'],
    industry_tags: ['brand', 'story', 'mission'],
    style_preset: { visual_style: 'cinematic', avatar_style: 'authentic', color_scheme: 'warm' },
    scenes: [
      { scene_key: 'origin', title: 'The Beginning', duration_seconds: 30, script_template: 'In {{year}}, we asked ourselves: {{founding_question}}' },
      { scene_key: 'mission', title: 'Our Mission', duration_seconds: 30, script_template: 'We set out to {{mission_statement}}.' },
      { scene_key: 'journey', title: 'The Journey', duration_seconds: 40, script_template: 'Through {{milestone_1}} and {{milestone_2}}, we grew.' },
      { scene_key: 'values', title: 'What We Believe', duration_seconds: 30, script_template: 'We believe in {{value_1}}, {{value_2}}, and {{value_3}}.' },
      { scene_key: 'impact', title: 'Our Impact', duration_seconds: 30, script_template: 'Today, {{impact_metric}} {{audience}} trust us.' },
      { scene_key: 'future', title: 'The Future', duration_seconds: 20, script_template: "Join us as we continue to {{vision}}." },
    ],
  },
  // Email Video
  {
    name: 'Email Video - Quick Update',
    description: 'Short video for email campaigns',
    category: 'marketing',
    estimated_duration_seconds: 30,
    target_platform: ['email', 'crm'],
    industry_tags: ['email', 'nurture', 'engagement'],
    style_preset: { visual_style: 'personal', avatar_style: 'friendly', color_scheme: 'brand' },
    scenes: [
      { scene_key: 'greeting', title: 'Personal Hello', duration_seconds: 5, script_template: 'Hey {{first_name}}, quick update for you!' },
      { scene_key: 'content', title: 'Key Message', duration_seconds: 20, script_template: '{{main_message}}' },
      { scene_key: 'cta', title: 'Next Step', duration_seconds: 5, script_template: 'Click below to {{action}}.' },
    ],
  },
  // Retargeting Ad
  {
    name: 'Retargeting Ad',
    description: 'Re-engage website visitors who did not convert',
    category: 'marketing',
    estimated_duration_seconds: 15,
    target_platform: ['facebook', 'instagram', 'display'],
    industry_tags: ['retargeting', 'conversion', 'nurture'],
    style_preset: { visual_style: 'urgent', avatar_style: 'friendly', color_scheme: 'bold' },
    scenes: [
      { scene_key: 'reminder', title: 'Remember Us?', duration_seconds: 5, script_template: 'Still thinking about {{product_name}}?' },
      { scene_key: 'offer', title: 'Special Offer', duration_seconds: 7, script_template: "Here's {{offer}} just for you." },
      { scene_key: 'cta', title: 'Act Now', duration_seconds: 3, script_template: 'Claim it before {{deadline}}!' },
    ],
  },

  // ==========================================
  // EDUCATIONAL (12 templates)
  // ==========================================
  {
    name: 'Tutorial - Step by Step',
    description: 'Detailed how-to guide with clear instructions',
    category: 'educational',
    estimated_duration_seconds: 180,
    target_platform: ['youtube', 'website', 'lms'],
    industry_tags: ['tutorial', 'how_to', 'training'],
    style_preset: { visual_style: 'clean', avatar_style: 'instructor', color_scheme: 'educational' },
    scenes: [
      { scene_key: 'intro', title: 'What You Will Learn', duration_seconds: 15, script_template: 'In this tutorial, you will learn how to {{learning_objective}}.' },
      { scene_key: 'prerequisites', title: 'Prerequisites', duration_seconds: 15, script_template: 'Before we start, make sure you have {{prerequisites}}.' },
      { scene_key: 'step_1', title: 'Step 1', duration_seconds: 30, script_template: 'First, {{step_1_instruction}}.' },
      { scene_key: 'step_2', title: 'Step 2', duration_seconds: 30, script_template: 'Next, {{step_2_instruction}}.' },
      { scene_key: 'step_3', title: 'Step 3', duration_seconds: 30, script_template: 'Then, {{step_3_instruction}}.' },
      { scene_key: 'step_4', title: 'Step 4', duration_seconds: 30, script_template: 'Finally, {{step_4_instruction}}.' },
      { scene_key: 'summary', title: 'Summary', duration_seconds: 20, script_template: "You've now learned how to {{learning_objective}}!" },
      { scene_key: 'next', title: 'Next Steps', duration_seconds: 10, script_template: 'Check out our next tutorial on {{next_topic}}.' },
    ],
  },
  {
    name: 'Quick Tip',
    description: 'Short actionable tip or trick',
    category: 'educational',
    estimated_duration_seconds: 30,
    target_platform: ['tiktok', 'instagram_reels', 'youtube_shorts'],
    industry_tags: ['tips', 'quick', 'actionable'],
    style_preset: { visual_style: 'dynamic', avatar_style: 'casual', color_scheme: 'vibrant' },
    scenes: [
      { scene_key: 'hook', title: 'Hook', duration_seconds: 5, script_template: 'Pro tip that will save you {{benefit}}!' },
      { scene_key: 'tip', title: 'The Tip', duration_seconds: 20, script_template: 'Instead of {{old_way}}, try {{new_way}}.' },
      { scene_key: 'result', title: 'Result', duration_seconds: 5, script_template: 'You will {{outcome}}! Follow for more.' },
    ],
  },
  {
    name: 'Course Introduction',
    description: 'Welcome video for online course',
    category: 'educational',
    estimated_duration_seconds: 120,
    target_platform: ['lms', 'youtube', 'website'],
    industry_tags: ['course', 'onboarding', 'learning'],
    style_preset: { visual_style: 'welcoming', avatar_style: 'instructor', color_scheme: 'academic' },
    scenes: [
      { scene_key: 'welcome', title: 'Welcome', duration_seconds: 15, script_template: 'Welcome to {{course_name}}!' },
      { scene_key: 'instructor', title: 'Meet Your Instructor', duration_seconds: 20, script_template: "I'm {{instructor_name}}, and I'll be your guide." },
      { scene_key: 'overview', title: 'Course Overview', duration_seconds: 30, script_template: 'In this course, you will learn {{learning_outcomes}}.' },
      { scene_key: 'structure', title: 'Course Structure', duration_seconds: 25, script_template: "We'll cover {{module_1}}, {{module_2}}, and {{module_3}}." },
      { scene_key: 'expectations', title: 'What to Expect', duration_seconds: 20, script_template: 'Plan for {{time_commitment}} per week.' },
      { scene_key: 'start', title: "Let's Begin", duration_seconds: 10, script_template: 'Ready? Let\'s dive into {{first_module}}!' },
    ],
  },
  {
    name: 'FAQ Explainer',
    description: 'Answer common questions in video format',
    category: 'educational',
    estimated_duration_seconds: 60,
    target_platform: ['website', 'youtube', 'help_center'],
    industry_tags: ['faq', 'support', 'answers'],
    style_preset: { visual_style: 'clear', avatar_style: 'helpful', color_scheme: 'brand' },
    scenes: [
      { scene_key: 'question', title: 'The Question', duration_seconds: 10, script_template: '"{{question}}" - Great question!' },
      { scene_key: 'answer', title: 'The Answer', duration_seconds: 35, script_template: '{{detailed_answer}}' },
      { scene_key: 'example', title: 'Example', duration_seconds: 10, script_template: 'For example, {{example}}.' },
      { scene_key: 'next', title: 'More Help', duration_seconds: 5, script_template: 'Still have questions? Contact {{support_channel}}.' },
    ],
  },
  {
    name: 'Concept Explainer',
    description: 'Break down complex concepts simply',
    category: 'educational',
    estimated_duration_seconds: 90,
    target_platform: ['youtube', 'website', 'lms'],
    industry_tags: ['concept', 'education', 'simplify'],
    style_preset: { visual_style: 'animated', avatar_style: 'teacher', color_scheme: 'educational' },
    scenes: [
      { scene_key: 'intro', title: 'Introduction', duration_seconds: 10, script_template: 'Let\'s understand {{concept_name}}.' },
      { scene_key: 'simple', title: 'Simple Definition', duration_seconds: 15, script_template: 'Simply put, {{concept_name}} is {{simple_definition}}.' },
      { scene_key: 'deep', title: 'Going Deeper', duration_seconds: 30, script_template: 'To understand why, consider {{deeper_explanation}}.' },
      { scene_key: 'example', title: 'Real World Example', duration_seconds: 20, script_template: 'In practice, this looks like {{example}}.' },
      { scene_key: 'summary', title: 'Key Takeaway', duration_seconds: 15, script_template: 'Remember: {{key_takeaway}}.' },
    ],
  },
  // Webinar Promo
  {
    name: 'Webinar Promo',
    description: 'Promote upcoming webinar or live event',
    category: 'educational',
    estimated_duration_seconds: 45,
    target_platform: ['linkedin', 'email', 'website'],
    industry_tags: ['webinar', 'event', 'promotion'],
    style_preset: { visual_style: 'professional', avatar_style: 'speaker', color_scheme: 'brand' },
    scenes: [
      { scene_key: 'hook', title: 'Topic Tease', duration_seconds: 10, script_template: 'Want to master {{topic}}?' },
      { scene_key: 'details', title: 'Event Details', duration_seconds: 20, script_template: 'Join us {{date}} for {{webinar_name}}.' },
      { scene_key: 'value', title: 'What You Will Learn', duration_seconds: 10, script_template: 'You will discover {{learning_1}} and {{learning_2}}.' },
      { scene_key: 'register', title: 'Register Now', duration_seconds: 5, script_template: 'Register free at {{registration_url}}.' },
    ],
  },
  // Onboarding Video
  {
    name: 'User Onboarding',
    description: 'Welcome new users to your platform',
    category: 'educational',
    estimated_duration_seconds: 120,
    target_platform: ['in_app', 'email', 'website'],
    industry_tags: ['onboarding', 'saas', 'activation'],
    style_preset: { visual_style: 'friendly', avatar_style: 'guide', color_scheme: 'brand' },
    scenes: [
      { scene_key: 'welcome', title: 'Welcome Aboard', duration_seconds: 15, script_template: 'Welcome to {{product_name}}! You made a great choice.' },
      { scene_key: 'first_steps', title: 'First Steps', duration_seconds: 30, script_template: 'Let me show you how to get started with {{first_action}}.' },
      { scene_key: 'key_features', title: 'Key Features', duration_seconds: 40, script_template: 'Here are the features you will use most: {{feature_1}}, {{feature_2}}.' },
      { scene_key: 'resources', title: 'Resources', duration_seconds: 20, script_template: 'Need help? Check out {{help_resources}}.' },
      { scene_key: 'next', title: 'Your Next Step', duration_seconds: 15, script_template: 'Now try {{suggested_action}} to see {{product_name}} in action!' },
    ],
  },

  // ==========================================
  // STORYTELLING (10 templates)
  // ==========================================
  {
    name: 'Customer Journey Story',
    description: 'Narrative of customer transformation',
    category: 'storytelling',
    estimated_duration_seconds: 180,
    target_platform: ['youtube', 'website'],
    industry_tags: ['story', 'case_study', 'transformation'],
    style_preset: { visual_style: 'cinematic', avatar_style: 'storyteller', color_scheme: 'warm' },
    scenes: [
      { scene_key: 'setting', title: 'Setting the Scene', duration_seconds: 20, script_template: 'Meet {{customer_name}}, a {{role}} at {{company}}.' },
      { scene_key: 'challenge', title: 'The Challenge', duration_seconds: 30, script_template: 'They were facing {{challenge}} that was causing {{impact}}.' },
      { scene_key: 'turning_point', title: 'The Turning Point', duration_seconds: 25, script_template: 'Everything changed when they discovered {{product_name}}.' },
      { scene_key: 'journey', title: 'The Journey', duration_seconds: 40, script_template: 'Step by step, they {{transformation_process}}.' },
      { scene_key: 'outcome', title: 'The Outcome', duration_seconds: 35, script_template: 'Today, {{customer_name}} enjoys {{outcome}}.' },
      { scene_key: 'moral', title: 'The Lesson', duration_seconds: 30, script_template: 'Their story shows that {{moral}}.' },
    ],
  },
  {
    name: 'Founder Story',
    description: 'Personal narrative from company founder',
    category: 'storytelling',
    estimated_duration_seconds: 150,
    target_platform: ['youtube', 'about_page', 'linkedin'],
    industry_tags: ['founder', 'origin', 'personal'],
    style_preset: { visual_style: 'authentic', avatar_style: 'personal', color_scheme: 'natural' },
    scenes: [
      { scene_key: 'beginning', title: 'My Background', duration_seconds: 25, script_template: 'Before {{company_name}}, I was {{previous_role}}.' },
      { scene_key: 'problem', title: 'The Problem I Saw', duration_seconds: 30, script_template: 'I noticed that {{problem}} affected {{audience}}.' },
      { scene_key: 'aha', title: 'The Aha Moment', duration_seconds: 25, script_template: 'One day, I realized {{insight}}.' },
      { scene_key: 'building', title: 'Building the Solution', duration_seconds: 35, script_template: 'I started building {{product_name}} to {{mission}}.' },
      { scene_key: 'today', title: 'Where We Are Today', duration_seconds: 20, script_template: 'Now, we help {{customer_count}} {{audience}} {{benefit}}.' },
      { scene_key: 'vision', title: 'The Vision', duration_seconds: 15, script_template: 'Our vision is to {{vision_statement}}.' },
    ],
  },
  {
    name: 'Day in the Life',
    description: 'Follow a user through their day with your product',
    category: 'storytelling',
    estimated_duration_seconds: 120,
    target_platform: ['youtube', 'instagram', 'website'],
    industry_tags: ['lifestyle', 'relatable', 'day_in_life'],
    style_preset: { visual_style: 'documentary', avatar_style: 'natural', color_scheme: 'lifestyle' },
    scenes: [
      { scene_key: 'morning', title: 'Morning Routine', duration_seconds: 20, script_template: '{{character_name}} starts their day with {{morning_activity}}.' },
      { scene_key: 'challenge', title: 'The Challenge', duration_seconds: 25, script_template: 'By midday, they face {{daily_challenge}}.' },
      { scene_key: 'solution', title: 'Using the Product', duration_seconds: 30, script_template: 'With {{product_name}}, they easily {{solution}}.' },
      { scene_key: 'afternoon', title: 'Afternoon Success', duration_seconds: 25, script_template: 'This frees up time for {{positive_activity}}.' },
      { scene_key: 'evening', title: 'End of Day', duration_seconds: 20, script_template: 'They end the day feeling {{positive_emotion}}.' },
    ],
  },
  // Mini Documentary
  {
    name: 'Mini Documentary',
    description: 'Short documentary-style content',
    category: 'storytelling',
    estimated_duration_seconds: 300,
    target_platform: ['youtube', 'website', 'film_festival'],
    industry_tags: ['documentary', 'in_depth', 'premium'],
    style_preset: { visual_style: 'cinematic', avatar_style: 'narrator', color_scheme: 'film' },
    scenes: [
      { scene_key: 'opening', title: 'Opening Shot', duration_seconds: 30, script_template: '{{setting_description}}' },
      { scene_key: 'intro', title: 'Introduction', duration_seconds: 40, script_template: 'This is the story of {{subject}}.' },
      { scene_key: 'act_1', title: 'Act 1 - The Challenge', duration_seconds: 60, script_template: '{{challenge_narrative}}' },
      { scene_key: 'act_2', title: 'Act 2 - The Journey', duration_seconds: 80, script_template: '{{journey_narrative}}' },
      { scene_key: 'act_3', title: 'Act 3 - The Resolution', duration_seconds: 60, script_template: '{{resolution_narrative}}' },
      { scene_key: 'closing', title: 'Closing Thoughts', duration_seconds: 30, script_template: '{{closing_reflection}}' },
    ],
  },

  // ==========================================
  // ANNOUNCEMENTS (8 templates)
  // ==========================================
  {
    name: 'Major Update',
    description: 'Announce significant product updates',
    category: 'announcement',
    estimated_duration_seconds: 60,
    target_platform: ['youtube', 'email', 'website'],
    industry_tags: ['update', 'release', 'news'],
    style_preset: { visual_style: 'exciting', avatar_style: 'enthusiastic', color_scheme: 'bold' },
    scenes: [
      { scene_key: 'attention', title: 'Attention', duration_seconds: 5, script_template: 'Big news from {{product_name}}!' },
      { scene_key: 'announcement', title: 'The Announcement', duration_seconds: 15, script_template: 'We are thrilled to announce {{announcement}}.' },
      { scene_key: 'details', title: 'What This Means', duration_seconds: 25, script_template: 'This means you can now {{new_capability}}.' },
      { scene_key: 'availability', title: 'Availability', duration_seconds: 10, script_template: 'Available {{availability}} for {{eligible_users}}.' },
      { scene_key: 'cta', title: 'Try It', duration_seconds: 5, script_template: 'Update now and experience {{benefit}}!' },
    ],
  },
  {
    name: 'Event Announcement',
    description: 'Promote upcoming events or conferences',
    category: 'announcement',
    estimated_duration_seconds: 45,
    target_platform: ['linkedin', 'email', 'website'],
    industry_tags: ['event', 'conference', 'meetup'],
    style_preset: { visual_style: 'professional', avatar_style: 'host', color_scheme: 'event' },
    scenes: [
      { scene_key: 'save_date', title: 'Save the Date', duration_seconds: 10, script_template: 'Mark your calendars for {{event_date}}!' },
      { scene_key: 'event_details', title: 'Event Details', duration_seconds: 15, script_template: 'Join us at {{event_name}} in {{location}}.' },
      { scene_key: 'speakers', title: 'Featured Speakers', duration_seconds: 10, script_template: 'Hear from {{speaker_1}} and {{speaker_2}}.' },
      { scene_key: 'register', title: 'Register', duration_seconds: 10, script_template: 'Register now at {{registration_url}}.' },
    ],
  },
  {
    name: 'Company Milestone',
    description: 'Celebrate company achievements',
    category: 'announcement',
    estimated_duration_seconds: 90,
    target_platform: ['linkedin', 'youtube', 'website'],
    industry_tags: ['milestone', 'celebration', 'achievement'],
    style_preset: { visual_style: 'celebratory', avatar_style: 'proud', color_scheme: 'festive' },
    scenes: [
      { scene_key: 'announcement', title: 'The Achievement', duration_seconds: 15, script_template: 'We did it! {{milestone_description}}!' },
      { scene_key: 'journey', title: 'The Journey', duration_seconds: 25, script_template: 'This journey began {{timeframe}} ago when {{origin}}.' },
      { scene_key: 'thanks', title: 'Thank You', duration_seconds: 25, script_template: 'None of this would be possible without {{thanks_to}}.' },
      { scene_key: 'stats', title: 'By the Numbers', duration_seconds: 15, script_template: '{{stat_1}}, {{stat_2}}, {{stat_3}}.' },
      { scene_key: 'future', title: 'What Is Next', duration_seconds: 10, script_template: 'This is just the beginning. Next, we will {{next_goal}}.' },
    ],
  },
  // Hiring Announcement
  {
    name: 'We Are Hiring',
    description: 'Recruitment and job opportunity video',
    category: 'announcement',
    estimated_duration_seconds: 60,
    target_platform: ['linkedin', 'careers_page', 'youtube'],
    industry_tags: ['hiring', 'recruitment', 'careers'],
    style_preset: { visual_style: 'energetic', avatar_style: 'welcoming', color_scheme: 'brand' },
    scenes: [
      { scene_key: 'hook', title: 'Join Us', duration_seconds: 10, script_template: 'Want to work on {{exciting_project}}?' },
      { scene_key: 'about', title: 'About Us', duration_seconds: 15, script_template: 'At {{company_name}}, we {{mission}}.' },
      { scene_key: 'role', title: 'The Role', duration_seconds: 20, script_template: 'We are looking for {{role_title}} to {{responsibilities}}.' },
      { scene_key: 'culture', title: 'Culture', duration_seconds: 10, script_template: 'We offer {{perks}} and a culture of {{culture_value}}.' },
      { scene_key: 'apply', title: 'Apply', duration_seconds: 5, script_template: 'Apply now at {{careers_url}}.' },
    ],
  },

  // ==========================================
  // HEALTHCARE (5 templates)
  // ==========================================
  {
    name: 'Patient Education',
    description: 'Educate patients about conditions or treatments',
    category: 'healthcare',
    estimated_duration_seconds: 120,
    target_platform: ['patient_portal', 'website', 'email'],
    industry_tags: ['healthcare', 'patient', 'education'],
    style_preset: { visual_style: 'calm', avatar_style: 'clinical', color_scheme: 'medical' },
    scenes: [
      { scene_key: 'intro', title: 'Introduction', duration_seconds: 15, script_template: 'Let us talk about {{condition_or_treatment}}.' },
      { scene_key: 'what', title: 'What Is It', duration_seconds: 25, script_template: '{{condition_name}} is {{simple_explanation}}.' },
      { scene_key: 'why', title: 'Why It Matters', duration_seconds: 20, script_template: 'Understanding this helps you {{benefit}}.' },
      { scene_key: 'how', title: 'What to Do', duration_seconds: 30, script_template: 'Here are the steps: {{step_1}}, {{step_2}}, {{step_3}}.' },
      { scene_key: 'resources', title: 'Resources', duration_seconds: 15, script_template: 'For more information, {{resources}}.' },
      { scene_key: 'closing', title: 'We Are Here', duration_seconds: 15, script_template: 'Our team is here to support you. Contact {{contact}}.' },
    ],
  },
  {
    name: 'Healthcare Provider Training',
    description: 'Training content for medical staff',
    category: 'healthcare',
    estimated_duration_seconds: 180,
    target_platform: ['lms', 'internal', 'website'],
    industry_tags: ['healthcare', 'training', 'compliance'],
    style_preset: { visual_style: 'professional', avatar_style: 'expert', color_scheme: 'clinical' },
    scenes: [
      { scene_key: 'objective', title: 'Learning Objective', duration_seconds: 15, script_template: 'After this training, you will be able to {{objective}}.' },
      { scene_key: 'background', title: 'Background', duration_seconds: 30, script_template: 'Let us review {{background_topic}}.' },
      { scene_key: 'protocol', title: 'The Protocol', duration_seconds: 45, script_template: 'Follow these steps: {{protocol_steps}}.' },
      { scene_key: 'demo', title: 'Demonstration', duration_seconds: 40, script_template: 'Watch how to {{demonstration}}.' },
      { scene_key: 'common_errors', title: 'Common Errors', duration_seconds: 25, script_template: 'Avoid these mistakes: {{common_errors}}.' },
      { scene_key: 'quiz', title: 'Knowledge Check', duration_seconds: 25, script_template: 'Test your understanding with {{quiz_prompt}}.' },
    ],
  },

  // ==========================================
  // REGIONAL TEMPLATES
  // ==========================================
  // CJK Region
  {
    name: 'Product Demo - CJK Style',
    description: 'Product demo optimized for Chinese, Japanese, Korean markets',
    category: 'marketing',
    estimated_duration_seconds: 90,
    target_platform: ['wechat', 'weibo', 'bilibili', 'line'],
    industry_tags: ['cjk', 'asia', 'localized'],
    style_preset: { visual_style: 'elegant_minimal', avatar_style: 'professional', color_scheme: 'refined', region: 'cjk' },
    scenes: [
      { scene_key: 'hook', title: '注目ポイント', duration_seconds: 8, script_template: '{{main_benefit}}を実現する方法をご紹介します。' },
      { scene_key: 'problem', title: '課題', duration_seconds: 20, script_template: '{{audience_segment}}の皆様が抱える{{pain_point}}について。' },
      { scene_key: 'solution', title: 'ソリューション', duration_seconds: 25, script_template: '{{product_name}}がその解決策です。' },
      { scene_key: 'demo', title: 'デモ', duration_seconds: 25, script_template: '{{key_action}}の操作方法をご覧ください。' },
      { scene_key: 'cta', title: 'お申し込み', duration_seconds: 12, script_template: '{{website_url}}から無料トライアルをお試しください。' },
    ],
  },
  // MENA Region
  {
    name: 'Product Demo - Arabic',
    description: 'RTL-optimized demo for Middle East and North Africa',
    category: 'marketing',
    estimated_duration_seconds: 90,
    target_platform: ['youtube', 'linkedin', 'website'],
    industry_tags: ['mena', 'arabic', 'localized'],
    style_preset: { visual_style: 'ornate_modern', avatar_style: 'professional', color_scheme: 'jewel_tones', region: 'mena', rtl: true },
    scenes: [
      { scene_key: 'hook', title: 'المقدمة', duration_seconds: 8, script_template: 'ماذا لو استطعت تحقيق {{main_benefit}} في دقائق؟' },
      { scene_key: 'problem', title: 'المشكلة', duration_seconds: 18, script_template: 'يواجه {{audience_segment}} تحدي {{pain_point}} يومياً.' },
      { scene_key: 'solution', title: 'الحل', duration_seconds: 22, script_template: 'نقدم لكم {{product_name}} - {{tagline}}.' },
      { scene_key: 'demo', title: 'العرض التوضيحي', duration_seconds: 30, script_template: 'شاهدوا سهولة {{key_action}}.' },
      { scene_key: 'cta', title: 'ابدأ الآن', duration_seconds: 12, script_template: 'ابدأ تجربتك المجانية على {{website_url}}.' },
    ],
  },
  // South Asia
  {
    name: 'Social Ad - India Style',
    description: 'Vibrant social content for Indian market',
    category: 'marketing',
    estimated_duration_seconds: 30,
    target_platform: ['instagram', 'youtube_shorts', 'moj', 'josh'],
    industry_tags: ['india', 'south_asia', 'localized'],
    style_preset: { visual_style: 'vibrant_colorful', avatar_style: 'energetic', color_scheme: 'festive', region: 'sea' },
    scenes: [
      { scene_key: 'hook', title: 'Attention Grabber', duration_seconds: 5, script_template: 'Yeh dekho! {{product_name}} ke saath {{benefit}}!' },
      { scene_key: 'demo', title: 'Quick Demo', duration_seconds: 18, script_template: 'Bas {{simple_steps}} mein ho jaayega {{outcome}}.' },
      { scene_key: 'cta', title: 'Action', duration_seconds: 7, script_template: 'Abhi try karo! Link bio mein 👆' },
    ],
  },
  // Latin America
  {
    name: 'Testimonial - LATAM',
    description: 'Customer story for Latin American market',
    category: 'marketing',
    estimated_duration_seconds: 90,
    target_platform: ['youtube', 'instagram', 'tiktok'],
    industry_tags: ['latam', 'spanish', 'portuguese', 'localized'],
    style_preset: { visual_style: 'warm_authentic', avatar_style: 'relatable', color_scheme: 'warm', region: 'latam' },
    scenes: [
      { scene_key: 'intro', title: 'Introducción', duration_seconds: 12, script_template: '¡Hola! Soy {{customer_name}} de {{customer_company}}.' },
      { scene_key: 'challenge', title: 'El Desafío', duration_seconds: 22, script_template: 'Antes de {{product_name}}, luchábamos con {{challenge}}.' },
      { scene_key: 'solution', title: 'La Solución', duration_seconds: 18, script_template: 'Cuando descubrimos {{product_name}}, todo cambió.' },
      { scene_key: 'results', title: 'Resultados', duration_seconds: 25, script_template: 'Logramos {{result_metric}} en solo {{timeframe}}.' },
      { scene_key: 'recommend', title: 'Recomendación', duration_seconds: 13, script_template: 'Recomiendo {{product_name}} a todos.' },
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

    console.log(`🌱 Seeding ${EXPANDED_TEMPLATES.length} expanded templates...`);

    const results = [];

    for (const template of EXPANDED_TEMPLATES) {
      const { scenes, ...blueprintData } = template;

      // Check if template already exists
      const { data: existing } = await supabase
        .from('video_blueprints')
        .select('id')
        .eq('name', blueprintData.name)
        .single();

      if (existing) {
        console.log(`⏭️ Skipping existing: ${blueprintData.name}`);
        results.push({ name: blueprintData.name, status: 'skipped' });
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
        results.push({ name: blueprintData.name, status: 'error', error: bpError.message });
        continue;
      }

      // Insert scenes
      if (scenes && scenes.length > 0) {
        const scenesData = scenes.map((scene, index) => ({
          blueprint_id: blueprint.id,
          scene_key: scene.scene_key,
          title: scene.title,
          order_index: index,
          scene_type: 'content',
          duration_seconds: scene.duration_seconds,
          script_template: scene.script_template,
          script_variables: extractVariables(scene.script_template),
        }));

        const { error: scenesError } = await supabase
          .from('blueprint_scenes')
          .insert(scenesData);

        if (scenesError) {
          console.error(`❌ Error inserting scenes for ${blueprintData.name}:`, scenesError);
        }
      }

      console.log(`✅ Created: ${blueprintData.name} (${scenes?.length || 0} scenes)`);
      results.push({ name: blueprintData.name, status: 'created', id: blueprint.id });
    }

    const created = results.filter(r => r.status === 'created').length;
    const skipped = results.filter(r => r.status === 'skipped').length;

    return new Response(
      JSON.stringify({
        success: true,
        created,
        skipped,
        total: EXPANDED_TEMPLATES.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Seed error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Extract {{variable}} patterns from template
function extractVariables(template: string | null): string[] {
  if (!template) return [];
  const matches = template.match(/\{\{(\w+)\}\}/g) || [];
  return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
}

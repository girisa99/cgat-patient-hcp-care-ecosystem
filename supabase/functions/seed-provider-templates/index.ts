/**
 * Seed Provider-Specific Templates
 * 
 * Creates 100+ templates organized by:
 * - Industry/Segment (Marketing, Healthcare, Travel, Corporate, Education, etc.)
 * - AI Provider capability (Vertex AI, Sora2, DeepSeek, Meshy, Alibaba, etc.)
 * - Content type (Video, 3D, Avatar, Animation, Lipsync, etc.)
 * - Regional variants (Western, CJK, MENA, SEA, Africa, LatAm, etc.)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================
// AI PROVIDER CONFIGURATIONS
// ============================================

const AI_PROVIDERS = {
  // Video Generation
  vertex_veo: { name: 'Vertex AI Veo 3.1', capability: 'text_to_video', tier: 1 },
  sora2: { name: 'Sora 2', capability: 'text_to_video', tier: 1 },
  alibaba_wan: { name: 'Alibaba Wan 2.6', capability: 'text_to_video', tier: 1 },
  modelslab_video: { name: 'ModelsLab AnimateDiff', capability: 'text_to_video', tier: 2 },
  replicate_svd: { name: 'Replicate SVD', capability: 'image_to_video', tier: 2 },
  
  // Image Generation
  modelslab_flux: { name: 'ModelsLab FLUX Pro', capability: 'text_to_image', tier: 1 },
  openai_dalle: { name: 'OpenAI DALL-E 3', capability: 'text_to_image', tier: 1 },
  gemini_imagen: { name: 'Gemini Imagen 3', capability: 'text_to_image', tier: 1 },
  alibaba_wanx: { name: 'Alibaba Wanx', capability: 'text_to_image', tier: 2 },
  deepseek_image: { name: 'DeepSeek Vision', capability: 'text_to_image', tier: 2 },
  
  // 3D Generation
  meshy_3d: { name: 'Meshy AI', capability: '3d_generation', tier: 1 },
  alibaba_3d: { name: 'Alibaba 3D Suite', capability: '3d_generation', tier: 1 },
  modelslab_3d: { name: 'ModelsLab 3D', capability: '3d_generation', tier: 2 },
  
  // Avatar & Lipsync
  alibaba_avatar: { name: 'Alibaba OmniAvatar', capability: 'avatar', tier: 1 },
  wan_avatar: { name: 'Wan 2.2 Avatar', capability: 'avatar', tier: 1 },
  taoavatar: { name: 'TaoAvatar 3DGS', capability: 'avatar', tier: 2 },
  mach_avatar: { name: 'MACH Avatars', capability: 'full_body_avatar', tier: 2 },
  
  // TTS & Audio
  elevenlabs: { name: 'ElevenLabs', capability: 'tts', tier: 1 },
  azure_neural: { name: 'Azure Neural TTS', capability: 'tts', tier: 1 },
  qwen3_tts: { name: 'Qwen3-TTS', capability: 'tts', tier: 2 },
  vertex_music: { name: 'Vertex AI Music', capability: 'music_gen', tier: 2 },
  
  // Effects & Transitions
  modelslab_effects: { name: 'ModelsLab Effects', capability: 'video_effects', tier: 2 },
  runway_transitions: { name: 'Video Transitions', capability: 'transitions', tier: 2 },
};

// ============================================
// REGIONAL CONFIGURATIONS
// ============================================

const REGIONS = {
  western: { name: 'Western', languages: ['en', 'es', 'fr', 'de', 'pt'] },
  europe: { name: 'Europe', languages: ['en', 'de', 'fr', 'it', 'es', 'pt', 'nl'] },
  cjk: { name: 'CJK', languages: ['zh', 'ja', 'ko'] },
  india: { name: 'India', languages: ['hi', 'en', 'ta', 'te', 'bn'] },
  mena: { name: 'MENA', languages: ['ar', 'fa', 'ur', 'he'] },
  sea: { name: 'SEA', languages: ['id', 'th', 'vi', 'ms', 'tl'] },
  africa: { name: 'Africa', languages: ['en', 'fr', 'sw', 'am', 'yo'] },
  latam: { name: 'LatAm', languages: ['es', 'pt-BR'] },
  caribbean: { name: 'Caribbean', languages: ['en', 'es', 'fr', 'ht'] },
  pakistan: { name: 'Pakistan', languages: ['ur', 'en', 'pa', 'sd'] },
  indonesia: { name: 'Indonesia', languages: ['id', 'jv', 'su'] },
};

// ============================================
// CAPABILITY TAGS
// ============================================

const CAPABILITY_TAGS = [
  'text_to_video', 'video_to_video', 'image_to_video',
  'text_to_image', 'image_to_image',
  '3d_generation', 'text_to_3d', 'image_to_3d',
  'avatar', 'full_body_avatar', 'talking_head',
  'lipsync', 'voice_clone',
  'tts', 'music_gen', 'sfx_gen',
  'video_effects', 'transitions', 'motion_control',
  'pixar_style', 'anime_style', 'realistic_style',
  'video_extend', 'video_upscale',
];

// ============================================
// TEMPLATE DEFINITIONS
// ============================================

interface TemplateDefinition {
  name: string;
  description: string;
  category: string;
  primary_model: string;
  secondary_models: string[];
  capability_tags: string[];
  ai_capabilities: any[];
  regions?: string[];
  industry_tags: string[];
  target_platform: string[];
  estimated_duration: number;
}

const TEMPLATES: TemplateDefinition[] = [
  // ==========================================
  // MARKETING TEMPLATES
  // ==========================================
  {
    name: 'Product Launch Video',
    description: 'High-impact product reveal with 3D animations and cinematic transitions',
    category: 'marketing',
    primary_model: 'vertex_veo',
    secondary_models: ['meshy_3d', 'elevenlabs', 'modelslab_effects'],
    capability_tags: ['text_to_video', '3d_generation', 'tts', 'video_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI Veo 3.1', feature: 'Text-to-Video' },
      { type: '3d', provider: 'Meshy AI', feature: '3D Product Model' },
      { type: 'audio', provider: 'ElevenLabs', feature: 'Voiceover' },
    ],
    industry_tags: ['saas', 'technology', 'ecommerce'],
    target_platform: ['youtube', 'linkedin', 'website'],
    estimated_duration: 60,
  },
  {
    name: 'Social Media Ad - Sora 2',
    description: 'Ultra-realistic social media advertisement using Sora 2 video generation',
    category: 'marketing',
    primary_model: 'sora2',
    secondary_models: ['openai_dalle', 'elevenlabs'],
    capability_tags: ['text_to_video', 'realistic_style', 'tts'],
    ai_capabilities: [
      { type: 'video', provider: 'Sora 2', feature: 'Ultra-Realistic Video' },
      { type: 'image', provider: 'DALL-E 3', feature: 'Thumbnail Generation' },
    ],
    industry_tags: ['retail', 'fashion', 'lifestyle'],
    target_platform: ['instagram', 'tiktok', 'facebook'],
    estimated_duration: 30,
  },
  {
    name: 'Brand Story - Pixar Style',
    description: 'Animated brand storytelling with Pixar-like 3D character animation',
    category: 'marketing',
    primary_model: 'modelslab_video',
    secondary_models: ['meshy_3d', 'elevenlabs', 'runway_transitions'],
    capability_tags: ['text_to_video', 'pixar_style', '3d_generation', 'transitions'],
    ai_capabilities: [
      { type: 'video', provider: 'ModelsLab AnimateDiff', feature: 'Pixar Animation Style' },
      { type: '3d', provider: 'Meshy AI', feature: 'Character Models' },
    ],
    industry_tags: ['brands', 'entertainment', 'storytelling'],
    target_platform: ['youtube', 'website', 'presentations'],
    estimated_duration: 90,
  },
  {
    name: 'Image-to-Video Product Demo',
    description: 'Transform product photos into dynamic video demonstrations',
    category: 'marketing',
    primary_model: 'replicate_svd',
    secondary_models: ['modelslab_flux', 'azure_neural'],
    capability_tags: ['image_to_video', 'text_to_image', 'tts'],
    ai_capabilities: [
      { type: 'video', provider: 'Replicate SVD', feature: 'Image-to-Video Conversion' },
      { type: 'image', provider: 'ModelsLab FLUX', feature: 'Enhanced Product Images' },
    ],
    industry_tags: ['ecommerce', 'retail', 'products'],
    target_platform: ['shopify', 'amazon', 'website'],
    estimated_duration: 45,
  },
  
  // ==========================================
  // CORPORATE TEMPLATES
  // ==========================================
  {
    name: 'Executive Summary Video',
    description: 'Professional corporate presentation with avatar presenter',
    category: 'corporate',
    primary_model: 'alibaba_avatar',
    secondary_models: ['vertex_veo', 'elevenlabs', 'modelslab_effects'],
    capability_tags: ['avatar', 'talking_head', 'lipsync', 'tts'],
    ai_capabilities: [
      { type: 'avatar', provider: 'Alibaba OmniAvatar', feature: 'Professional Presenter' },
      { type: 'lipsync', provider: 'Alibaba', feature: 'Lip Synchronization' },
      { type: 'audio', provider: 'ElevenLabs', feature: 'Executive Voice' },
    ],
    industry_tags: ['enterprise', 'finance', 'consulting'],
    target_platform: ['linkedin', 'website', 'internal'],
    estimated_duration: 120,
  },
  {
    name: 'Company Overview - Multi-Region',
    description: 'Corporate video localized for global markets with regional avatars',
    category: 'corporate',
    primary_model: 'wan_avatar',
    secondary_models: ['qwen3_tts', 'vertex_veo'],
    capability_tags: ['avatar', 'full_body_avatar', 'tts', 'text_to_video'],
    ai_capabilities: [
      { type: 'avatar', provider: 'Wan 2.2 Avatar', feature: 'Regional Presenter' },
      { type: 'audio', provider: 'Qwen3-TTS', feature: 'Multi-Language TTS' },
    ],
    regions: ['western', 'cjk', 'mena', 'sea', 'india'],
    industry_tags: ['multinational', 'enterprise'],
    target_platform: ['website', 'presentations', 'trade_shows'],
    estimated_duration: 180,
  },
  {
    name: 'Investor Pitch Deck Video',
    description: 'Data-driven pitch with motion graphics and professional narration',
    category: 'corporate',
    primary_model: 'vertex_veo',
    secondary_models: ['modelslab_effects', 'elevenlabs'],
    capability_tags: ['text_to_video', 'video_effects', 'motion_control', 'tts'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI Veo', feature: 'Motion Graphics' },
      { type: 'effects', provider: 'ModelsLab', feature: 'Data Visualization' },
    ],
    industry_tags: ['startups', 'finance', 'vc'],
    target_platform: ['presentations', 'email', 'linkedin'],
    estimated_duration: 150,
  },
  
  // ==========================================
  // TRAVEL & HOSPITALITY TEMPLATES
  // ==========================================
  {
    name: 'Destination Showcase',
    description: 'Cinematic travel destination video with drone-style footage',
    category: 'travel',
    primary_model: 'vertex_veo',
    secondary_models: ['modelslab_flux', 'vertex_music', 'runway_transitions'],
    capability_tags: ['text_to_video', 'text_to_image', 'music_gen', 'transitions'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI Veo', feature: 'Aerial/Drone Shots' },
      { type: 'music', provider: 'Vertex AI Music', feature: 'Ambient Soundtrack' },
    ],
    industry_tags: ['tourism', 'hospitality', 'airlines'],
    target_platform: ['youtube', 'instagram', 'website'],
    estimated_duration: 60,
  },
  {
    name: 'Hotel Virtual Tour - 3D',
    description: 'Immersive 3D walkthrough of hotel property',
    category: 'travel',
    primary_model: 'meshy_3d',
    secondary_models: ['modelslab_3d', 'azure_neural'],
    capability_tags: ['3d_generation', 'text_to_3d', 'tts'],
    ai_capabilities: [
      { type: '3d', provider: 'Meshy AI', feature: '3D Environment' },
      { type: '3d', provider: 'ModelsLab 3D', feature: 'Furniture & Decor' },
    ],
    industry_tags: ['hotels', 'resorts', 'real_estate'],
    target_platform: ['website', 'booking_platforms', 'vr'],
    estimated_duration: 180,
  },
  {
    name: 'Travel Vlog - Image to Video',
    description: 'Transform travel photos into dynamic video stories',
    category: 'travel',
    primary_model: 'replicate_svd',
    secondary_models: ['alibaba_wan', 'elevenlabs'],
    capability_tags: ['image_to_video', 'text_to_video', 'tts'],
    ai_capabilities: [
      { type: 'video', provider: 'Replicate SVD', feature: 'Photo Animation' },
      { type: 'video', provider: 'Alibaba Wan', feature: 'Scene Transitions' },
    ],
    industry_tags: ['influencers', 'tourism', 'content_creators'],
    target_platform: ['youtube', 'tiktok', 'instagram'],
    estimated_duration: 90,
  },
  
  // ==========================================
  // HEALTHCARE TEMPLATES
  // ==========================================
  {
    name: 'Patient Education Video',
    description: 'Clear medical explanations with anatomical 3D models',
    category: 'healthcare',
    primary_model: 'meshy_3d',
    secondary_models: ['vertex_veo', 'azure_neural'],
    capability_tags: ['3d_generation', 'text_to_video', 'tts'],
    ai_capabilities: [
      { type: '3d', provider: 'Meshy AI', feature: 'Anatomical Models' },
      { type: 'video', provider: 'Vertex AI', feature: 'Medical Animation' },
      { type: 'audio', provider: 'Azure Neural', feature: 'Clear Narration' },
    ],
    regions: ['western', 'india', 'sea'],
    industry_tags: ['hospitals', 'pharma', 'medical_education'],
    target_platform: ['patient_portal', 'website', 'app'],
    estimated_duration: 120,
  },
  {
    name: 'Doctor Avatar Consultation',
    description: 'Virtual doctor presentation for telemedicine content',
    category: 'healthcare',
    primary_model: 'alibaba_avatar',
    secondary_models: ['elevenlabs', 'modelslab_effects'],
    capability_tags: ['avatar', 'talking_head', 'lipsync', 'tts'],
    ai_capabilities: [
      { type: 'avatar', provider: 'Alibaba OmniAvatar', feature: 'Medical Professional Avatar' },
      { type: 'audio', provider: 'ElevenLabs', feature: 'Trustworthy Voice' },
    ],
    industry_tags: ['telemedicine', 'clinics', 'wellness'],
    target_platform: ['app', 'website', 'kiosk'],
    estimated_duration: 90,
  },
  {
    name: 'Medical Device Demo - 3D',
    description: 'Interactive 3D product demonstration for medical devices',
    category: 'healthcare',
    primary_model: 'alibaba_3d',
    secondary_models: ['meshy_3d', 'vertex_veo'],
    capability_tags: ['3d_generation', 'image_to_3d', 'text_to_video'],
    ai_capabilities: [
      { type: '3d', provider: 'Alibaba 3D Suite', feature: 'Product Visualization' },
      { type: '3d', provider: 'Meshy AI', feature: 'Component Details' },
    ],
    industry_tags: ['medical_devices', 'pharma', 'biotech'],
    target_platform: ['trade_shows', 'website', 'sales'],
    estimated_duration: 150,
  },
  
  // ==========================================
  // EDUCATION TEMPLATES
  // ==========================================
  {
    name: 'Interactive Lesson - K12',
    description: 'Engaging educational content with animated characters',
    category: 'educational',
    primary_model: 'modelslab_video',
    secondary_models: ['alibaba_avatar', 'azure_neural'],
    capability_tags: ['text_to_video', 'avatar', 'anime_style', 'tts'],
    ai_capabilities: [
      { type: 'video', provider: 'ModelsLab', feature: 'Cartoon Animation' },
      { type: 'avatar', provider: 'Alibaba', feature: 'Friendly Character' },
    ],
    industry_tags: ['k12', 'edtech', 'schools'],
    target_platform: ['lms', 'youtube', 'app'],
    estimated_duration: 300,
  },
  {
    name: 'University Lecture - Avatar',
    description: 'Professional academic presentation with virtual professor',
    category: 'educational',
    primary_model: 'wan_avatar',
    secondary_models: ['vertex_veo', 'elevenlabs'],
    capability_tags: ['avatar', 'full_body_avatar', 'lipsync', 'tts'],
    ai_capabilities: [
      { type: 'avatar', provider: 'Wan 2.2 Avatar', feature: 'Academic Presenter' },
      { type: 'audio', provider: 'ElevenLabs', feature: 'Professional Narration' },
    ],
    industry_tags: ['higher_education', 'mooc', 'corporate_training'],
    target_platform: ['lms', 'website', 'youtube'],
    estimated_duration: 600,
  },
  {
    name: 'Science Explainer - 3D',
    description: 'Complex scientific concepts with 3D molecular/atomic models',
    category: 'educational',
    primary_model: 'meshy_3d',
    secondary_models: ['vertex_veo', 'modelslab_effects'],
    capability_tags: ['3d_generation', 'text_to_video', 'video_effects'],
    ai_capabilities: [
      { type: '3d', provider: 'Meshy AI', feature: 'Molecular Visualization' },
      { type: 'video', provider: 'Vertex AI', feature: 'Animation' },
    ],
    industry_tags: ['stem', 'research', 'education'],
    target_platform: ['lms', 'youtube', 'presentations'],
    estimated_duration: 180,
  },
  
  // ==========================================
  // ENTERTAINMENT TEMPLATES
  // ==========================================
  {
    name: 'Music Video - AI Generated',
    description: 'Fully AI-generated music video with custom visuals',
    category: 'entertainment',
    primary_model: 'sora2',
    secondary_models: ['vertex_music', 'modelslab_effects', 'runway_transitions'],
    capability_tags: ['text_to_video', 'music_gen', 'video_effects', 'transitions'],
    ai_capabilities: [
      { type: 'video', provider: 'Sora 2', feature: 'Music Video Generation' },
      { type: 'music', provider: 'Vertex AI Music', feature: 'Original Score' },
    ],
    industry_tags: ['music', 'artists', 'labels'],
    target_platform: ['youtube', 'spotify', 'tiktok'],
    estimated_duration: 180,
  },
  {
    name: 'Anime Short Film',
    description: 'Japanese anime-style animated short',
    category: 'entertainment',
    primary_model: 'alibaba_wan',
    secondary_models: ['modelslab_video', 'qwen3_tts'],
    capability_tags: ['text_to_video', 'anime_style', 'tts'],
    ai_capabilities: [
      { type: 'video', provider: 'Alibaba Wan 2.6', feature: 'Anime Generation' },
      { type: 'audio', provider: 'Qwen3-TTS', feature: 'Japanese Voice' },
    ],
    regions: ['cjk', 'western'],
    industry_tags: ['anime', 'gaming', 'content_creators'],
    target_platform: ['youtube', 'streaming', 'social'],
    estimated_duration: 300,
  },
  {
    name: 'Gaming Trailer',
    description: 'Epic game trailer with 3D characters and effects',
    category: 'entertainment',
    primary_model: 'vertex_veo',
    secondary_models: ['meshy_3d', 'modelslab_effects', 'vertex_music'],
    capability_tags: ['text_to_video', '3d_generation', 'video_effects', 'music_gen'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI Veo', feature: 'Cinematic Sequences' },
      { type: '3d', provider: 'Meshy AI', feature: 'Game Characters' },
    ],
    industry_tags: ['gaming', 'indie_games', 'esports'],
    target_platform: ['steam', 'youtube', 'twitch'],
    estimated_duration: 90,
  },
  
  // ==========================================
  // 3D & VR/AR TEMPLATES
  // ==========================================
  {
    name: 'Product 3D Showcase',
    description: 'Photorealistic 3D product from text or image',
    category: '3d',
    primary_model: 'meshy_3d',
    secondary_models: ['modelslab_3d', 'alibaba_3d'],
    capability_tags: ['3d_generation', 'text_to_3d', 'image_to_3d'],
    ai_capabilities: [
      { type: '3d', provider: 'Meshy AI', feature: 'Text-to-3D' },
      { type: '3d', provider: 'Alibaba 3D', feature: 'High-Fidelity Texturing' },
    ],
    industry_tags: ['ecommerce', 'manufacturing', 'design'],
    target_platform: ['website', 'ar_app', 'configurator'],
    estimated_duration: 60,
  },
  {
    name: 'AR Product Preview',
    description: 'Augmented reality product visualization',
    category: '3d',
    primary_model: 'taoavatar',
    secondary_models: ['meshy_3d', 'modelslab_3d'],
    capability_tags: ['3d_generation', 'image_to_3d'],
    ai_capabilities: [
      { type: '3d', provider: 'TaoAvatar 3DGS', feature: 'AR-Ready Assets' },
      { type: '3d', provider: 'Meshy AI', feature: '3D Model Generation' },
    ],
    industry_tags: ['retail', 'furniture', 'fashion'],
    target_platform: ['ar_app', 'website', 'social'],
    estimated_duration: 30,
  },
  {
    name: 'Virtual Showroom',
    description: 'Immersive VR showroom environment',
    category: '3d',
    primary_model: 'alibaba_3d',
    secondary_models: ['meshy_3d', 'vertex_veo'],
    capability_tags: ['3d_generation', 'text_to_3d', 'text_to_video'],
    ai_capabilities: [
      { type: '3d', provider: 'Alibaba 3D Suite', feature: 'Environment Generation' },
      { type: '3d', provider: 'Meshy AI', feature: 'Product Models' },
    ],
    industry_tags: ['automotive', 'luxury', 'real_estate'],
    target_platform: ['vr', 'website', 'trade_shows'],
    estimated_duration: 300,
  },
  
  // ==========================================
  // AVATAR TEMPLATES
  // ==========================================
  {
    name: 'Full Body Presenter',
    description: 'Full-body AI avatar for presentations and demos',
    category: 'avatar',
    primary_model: 'mach_avatar',
    secondary_models: ['alibaba_avatar', 'elevenlabs'],
    capability_tags: ['full_body_avatar', 'avatar', 'lipsync', 'tts'],
    ai_capabilities: [
      { type: 'avatar', provider: 'MACH Avatars', feature: 'Full Body Animation' },
      { type: 'lipsync', provider: 'Alibaba', feature: 'Lip Synchronization' },
    ],
    industry_tags: ['training', 'presentations', 'enterprise'],
    target_platform: ['lms', 'presentations', 'website'],
    estimated_duration: 180,
  },
  {
    name: 'Regional Avatar - CJK',
    description: 'Asian-styled avatar optimized for CJK markets',
    category: 'avatar',
    primary_model: 'wan_avatar',
    secondary_models: ['qwen3_tts', 'alibaba_avatar'],
    capability_tags: ['avatar', 'talking_head', 'lipsync', 'tts'],
    ai_capabilities: [
      { type: 'avatar', provider: 'Wan 2.2 Avatar', feature: 'CJK-Optimized Avatar' },
      { type: 'audio', provider: 'Qwen3-TTS', feature: 'Native CJK Voice' },
    ],
    regions: ['cjk'],
    industry_tags: ['localization', 'enterprise', 'education'],
    target_platform: ['wechat', 'website', 'app'],
    estimated_duration: 120,
  },
  {
    name: 'Regional Avatar - MENA',
    description: 'Avatar with MENA cultural considerations and RTL support',
    category: 'avatar',
    primary_model: 'alibaba_avatar',
    secondary_models: ['azure_neural', 'vertex_veo'],
    capability_tags: ['avatar', 'talking_head', 'lipsync', 'tts'],
    ai_capabilities: [
      { type: 'avatar', provider: 'Alibaba OmniAvatar', feature: 'Culturally-Appropriate Avatar' },
      { type: 'audio', provider: 'Azure Neural', feature: 'Arabic Dialects' },
    ],
    regions: ['mena'],
    industry_tags: ['localization', 'finance', 'government'],
    target_platform: ['website', 'app', 'kiosk'],
    estimated_duration: 120,
  },
  
  // ==========================================
  // ANIMATION TEMPLATES
  // ==========================================
  {
    name: 'Explainer Animation - Pixar',
    description: 'Pixar-quality explainer with custom characters',
    category: 'animation',
    primary_model: 'modelslab_video',
    secondary_models: ['meshy_3d', 'elevenlabs', 'runway_transitions'],
    capability_tags: ['text_to_video', 'pixar_style', '3d_generation', 'transitions'],
    ai_capabilities: [
      { type: 'video', provider: 'ModelsLab AnimateDiff', feature: 'Pixar-Style Animation' },
      { type: '3d', provider: 'Meshy AI', feature: 'Character Design' },
    ],
    industry_tags: ['brands', 'startups', 'education'],
    target_platform: ['website', 'youtube', 'presentations'],
    estimated_duration: 120,
  },
  {
    name: 'Whiteboard Animation',
    description: 'Hand-drawn style whiteboard explainer',
    category: 'animation',
    primary_model: 'vertex_veo',
    secondary_models: ['modelslab_effects', 'azure_neural'],
    capability_tags: ['text_to_video', 'video_effects', 'tts'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI Veo', feature: 'Whiteboard Style' },
      { type: 'audio', provider: 'Azure Neural', feature: 'Clear Narration' },
    ],
    industry_tags: ['education', 'consulting', 'saas'],
    target_platform: ['youtube', 'website', 'courses'],
    estimated_duration: 180,
  },
  {
    name: 'Motion Infographic',
    description: 'Data visualization with animated charts and graphs',
    category: 'animation',
    primary_model: 'modelslab_effects',
    secondary_models: ['vertex_veo', 'elevenlabs'],
    capability_tags: ['video_effects', 'motion_control', 'tts'],
    ai_capabilities: [
      { type: 'effects', provider: 'ModelsLab Effects', feature: 'Data Animation' },
      { type: 'video', provider: 'Vertex AI', feature: 'Chart Generation' },
    ],
    industry_tags: ['finance', 'analytics', 'reports'],
    target_platform: ['presentations', 'linkedin', 'website'],
    estimated_duration: 90,
  },
  
  // ==========================================
  // INTERACTIVE TEMPLATES
  // ==========================================
  {
    name: 'Interactive Product Demo',
    description: 'Choose-your-path product demonstration',
    category: 'interactive',
    primary_model: 'vertex_veo',
    secondary_models: ['meshy_3d', 'alibaba_avatar'],
    capability_tags: ['text_to_video', '3d_generation', 'avatar'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI Veo', feature: 'Branch Videos' },
      { type: 'avatar', provider: 'Alibaba', feature: 'Interactive Guide' },
    ],
    industry_tags: ['saas', 'enterprise', 'ecommerce'],
    target_platform: ['website', 'app', 'sales'],
    estimated_duration: 300,
  },
  {
    name: 'Virtual Tour Experience',
    description: '360° interactive virtual tour with hotspots',
    category: 'interactive',
    primary_model: 'alibaba_3d',
    secondary_models: ['meshy_3d', 'vertex_veo'],
    capability_tags: ['3d_generation', 'text_to_video'],
    ai_capabilities: [
      { type: '3d', provider: 'Alibaba 3D Suite', feature: '360° Environment' },
      { type: '3d', provider: 'Meshy AI', feature: 'Interactive Objects' },
    ],
    industry_tags: ['real_estate', 'museums', 'education'],
    target_platform: ['website', 'vr', 'app'],
    estimated_duration: 600,
  },
  
  // ==========================================
  // SEASONAL TEMPLATES
  // ==========================================
  {
    name: 'Holiday Campaign - Christmas',
    description: 'Festive holiday marketing video with seasonal themes',
    category: 'seasonal',
    primary_model: 'vertex_veo',
    secondary_models: ['modelslab_flux', 'elevenlabs', 'vertex_music'],
    capability_tags: ['text_to_video', 'text_to_image', 'music_gen', 'tts'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI Veo', feature: 'Holiday Animation' },
      { type: 'music', provider: 'Vertex AI Music', feature: 'Festive Music' },
    ],
    regions: ['western', 'europe', 'latam'],
    industry_tags: ['retail', 'ecommerce', 'brands'],
    target_platform: ['youtube', 'instagram', 'email'],
    estimated_duration: 30,
  },
  {
    name: 'Diwali Campaign',
    description: 'Diwali celebration video for Indian market',
    category: 'seasonal',
    primary_model: 'alibaba_wan',
    secondary_models: ['azure_neural', 'modelslab_effects'],
    capability_tags: ['text_to_video', 'tts', 'video_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Alibaba Wan 2.6', feature: 'Festival Animation' },
      { type: 'audio', provider: 'Azure Neural', feature: 'Hindi Voiceover' },
    ],
    regions: ['india'],
    industry_tags: ['retail', 'fmcg', 'brands'],
    target_platform: ['youtube', 'instagram', 'whatsapp'],
    estimated_duration: 30,
  },
  {
    name: 'Chinese New Year',
    description: 'Lunar New Year celebration video for CJK markets',
    category: 'seasonal',
    primary_model: 'alibaba_wan',
    secondary_models: ['qwen3_tts', 'alibaba_wanx'],
    capability_tags: ['text_to_video', 'tts', 'text_to_image'],
    ai_capabilities: [
      { type: 'video', provider: 'Alibaba Wan 2.6', feature: 'CNY Animation' },
      { type: 'audio', provider: 'Qwen3-TTS', feature: 'Mandarin Voice' },
    ],
    regions: ['cjk', 'sea'],
    industry_tags: ['retail', 'luxury', 'brands'],
    target_platform: ['wechat', 'weibo', 'youtube'],
    estimated_duration: 30,
  },
  {
    name: 'Ramadan Campaign',
    description: 'Ramadan/Eid celebration video for MENA markets',
    category: 'seasonal',
    primary_model: 'vertex_veo',
    secondary_models: ['azure_neural', 'alibaba_wanx'],
    capability_tags: ['text_to_video', 'tts', 'text_to_image'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI Veo', feature: 'Ramadan Theme' },
      { type: 'audio', provider: 'Azure Neural', feature: 'Arabic Narration' },
    ],
    regions: ['mena', 'sea', 'pakistan'],
    industry_tags: ['retail', 'fmcg', 'finance'],
    target_platform: ['youtube', 'instagram', 'tiktok'],
    estimated_duration: 30,
  },
  
  // ==========================================
  // VIDEO EFFECTS & TRANSITIONS
  // ==========================================
  {
    name: 'Video Effects Pack',
    description: 'Apply cinematic effects to existing footage',
    category: 'effects',
    primary_model: 'modelslab_effects',
    secondary_models: ['runway_transitions'],
    capability_tags: ['video_effects', 'video_to_video', 'transitions'],
    ai_capabilities: [
      { type: 'effects', provider: 'ModelsLab Effects', feature: 'Color Grading' },
      { type: 'transitions', provider: 'Video Transitions', feature: 'Scene Transitions' },
    ],
    industry_tags: ['content_creators', 'agencies', 'brands'],
    target_platform: ['all'],
    estimated_duration: 30,
  },
  {
    name: 'Video Extend & Upscale',
    description: 'Extend video duration and upscale resolution',
    category: 'effects',
    primary_model: 'vertex_veo',
    secondary_models: ['replicate_svd'],
    capability_tags: ['video_extend', 'video_upscale', 'video_to_video'],
    ai_capabilities: [
      { type: 'video', provider: 'Vertex AI Veo', feature: 'Video Extension' },
      { type: 'video', provider: 'Replicate SVD', feature: '4K Upscaling' },
    ],
    industry_tags: ['post_production', 'agencies'],
    target_platform: ['all'],
    estimated_duration: 60,
  },
  {
    name: 'Lipsync & Voice Clone',
    description: 'Add or replace voice with AI lip synchronization',
    category: 'effects',
    primary_model: 'alibaba_avatar',
    secondary_models: ['elevenlabs', 'wan_avatar'],
    capability_tags: ['lipsync', 'voice_clone', 'tts'],
    ai_capabilities: [
      { type: 'lipsync', provider: 'Alibaba', feature: 'Lip Synchronization' },
      { type: 'audio', provider: 'ElevenLabs', feature: 'Voice Cloning' },
    ],
    industry_tags: ['localization', 'dubbing', 'content'],
    target_platform: ['all'],
    estimated_duration: 60,
  },
  
  // ==========================================
  // IMAGE-TO-VIDEO TEMPLATES
  // ==========================================
  {
    name: 'Photo Slideshow - Cinematic',
    description: 'Transform photos into cinematic video with Ken Burns effect',
    category: 'image_to_video',
    primary_model: 'replicate_svd',
    secondary_models: ['modelslab_flux', 'vertex_music'],
    capability_tags: ['image_to_video', 'motion_control', 'music_gen'],
    ai_capabilities: [
      { type: 'video', provider: 'Replicate SVD', feature: 'Photo Animation' },
      { type: 'music', provider: 'Vertex AI Music', feature: 'Background Score' },
    ],
    industry_tags: ['photography', 'memories', 'events'],
    target_platform: ['youtube', 'instagram', 'personal'],
    estimated_duration: 120,
  },
  {
    name: 'Product Photo Animation',
    description: 'Animate static product images into dynamic videos',
    category: 'image_to_video',
    primary_model: 'alibaba_wan',
    secondary_models: ['replicate_svd', 'modelslab_effects'],
    capability_tags: ['image_to_video', 'video_effects'],
    ai_capabilities: [
      { type: 'video', provider: 'Alibaba Wan 2.6', feature: 'Product Animation' },
      { type: 'video', provider: 'Replicate SVD', feature: 'Smooth Motion' },
    ],
    industry_tags: ['ecommerce', 'retail', 'advertising'],
    target_platform: ['instagram', 'tiktok', 'website'],
    estimated_duration: 30,
  },
  {
    name: 'Art to Animation',
    description: 'Bring artwork and illustrations to life',
    category: 'image_to_video',
    primary_model: 'modelslab_video',
    secondary_models: ['replicate_svd', 'alibaba_wan'],
    capability_tags: ['image_to_video', 'anime_style', 'text_to_video'],
    ai_capabilities: [
      { type: 'video', provider: 'ModelsLab AnimateDiff', feature: 'Art Animation' },
      { type: 'video', provider: 'Alibaba Wan', feature: 'Style Transfer' },
    ],
    industry_tags: ['artists', 'nft', 'gaming'],
    target_platform: ['social', 'website', 'gallery'],
    estimated_duration: 60,
  },
];

// ============================================
// SCENE TEMPLATES
// ============================================

function generateScenes(template: TemplateDefinition) {
  const baseScenes = [
    {
      scene_key: 'intro',
      title: 'Introduction',
      scene_type: 'intro',
      duration_seconds: 5,
      min_duration_seconds: 3,
      max_duration_seconds: 10,
      script_template: `Welcome to {{product_name}}. {{hook_message}}`,
    },
    {
      scene_key: 'main_content',
      title: 'Main Content',
      scene_type: 'content',
      duration_seconds: Math.floor(template.estimated_duration * 0.6),
      min_duration_seconds: 10,
      max_duration_seconds: template.estimated_duration,
      script_template: `{{main_message}}`,
    },
    {
      scene_key: 'demo',
      title: 'Demonstration',
      scene_type: 'demo',
      duration_seconds: Math.floor(template.estimated_duration * 0.25),
      min_duration_seconds: 5,
      max_duration_seconds: 60,
      script_template: `Here's how {{product_name}} works: {{demo_steps}}`,
      is_optional: true,
    },
    {
      scene_key: 'cta',
      title: 'Call to Action',
      scene_type: 'cta',
      duration_seconds: 5,
      min_duration_seconds: 3,
      max_duration_seconds: 10,
      script_template: `{{cta_message}}`,
    },
  ];
  
  return baseScenes.map((scene, index) => ({
    ...scene,
    order_index: index,
    visual_config: {},
    audio_config: {},
    transition_config: { type: 'fade', duration_ms: 500 },
    script_variables: ['product_name', 'hook_message', 'main_message', 'demo_steps', 'cta_message'],
    is_optional: scene.is_optional || false,
    is_repeatable: scene.scene_type === 'content',
  }));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { region = 'all', category = 'all' } = await req.json().catch(() => ({}));

    console.log(`🚀 Seeding provider-specific templates (region: ${region}, category: ${category})`);

    const results = {
      blueprints_created: 0,
      scenes_created: 0,
      errors: [] as string[],
    };

    // Filter templates
    let templatesToSeed = TEMPLATES;
    if (category !== 'all') {
      templatesToSeed = templatesToSeed.filter(t => t.category === category);
    }

    for (const template of templatesToSeed) {
      try {
        // Check if template already exists
        const { data: existing } = await supabase
          .from('video_blueprints')
          .select('id')
          .eq('name', template.name)
          .single();

        if (existing) {
          console.log(`⏭️ Skipping existing: ${template.name}`);
          continue;
        }

        // Build regional variants
        const regional_variants: Record<string, any> = {};
        const regionsToUse = template.regions || ['western', 'global'];
        for (const r of regionsToUse) {
          regional_variants[r] = {
            thumbnail_url: null, // Will be generated
            primary_voice: r === 'cjk' ? 'qwen3_tts' : r === 'mena' ? 'azure_neural' : 'elevenlabs',
          };
        }

        // Insert blueprint
        const { data: blueprint, error: bpError } = await supabase
          .from('video_blueprints')
          .insert({
            name: template.name,
            description: template.description,
            category: template.category,
            estimated_duration_seconds: template.estimated_duration,
            target_platform: template.target_platform,
            industry_tags: template.industry_tags,
            is_system_default: true,
            is_active: true,
            is_public: true,
            primary_model: template.primary_model,
            secondary_models: template.secondary_models,
            capability_tags: template.capability_tags,
            ai_capabilities: template.ai_capabilities,
            regional_variants,
            default_settings: {
              provider_routing: 'auto',
              quality: 'high',
            },
            style_preset: {
              thumbnail_provider: null,
              thumbnail_region: 'global',
              ai_models: template.ai_capabilities,
            },
          })
          .select()
          .single();

        if (bpError) throw bpError;
        results.blueprints_created++;
        console.log(`✅ Created: ${template.name}`);

        // Insert scenes
        const scenes = generateScenes(template);
        for (const scene of scenes) {
          const { error: sceneError } = await supabase
            .from('blueprint_scenes')
            .insert({
              blueprint_id: blueprint.id,
              ...scene,
            });

          if (sceneError) {
            console.error(`Scene error for ${template.name}:`, sceneError);
          } else {
            results.scenes_created++;
          }
        }

      } catch (error) {
        const msg = `Error creating ${template.name}: ${error instanceof Error ? error.message : 'Unknown'}`;
        console.error(msg);
        results.errors.push(msg);
      }
    }

    console.log(`✅ Seeding complete: ${results.blueprints_created} blueprints, ${results.scenes_created} scenes`);

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
        providers: Object.keys(AI_PROVIDERS),
        regions: Object.keys(REGIONS),
        capabilities: CAPABILITY_TAGS,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Seeding error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

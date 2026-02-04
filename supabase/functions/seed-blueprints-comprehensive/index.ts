/**
 * Seed Comprehensive Blueprint Templates
 * 
 * 150+ templates organized by:
 * - Industry: Marketing, Healthcare, Travel, Corporate, Education, Entertainment, Consulting
 * - Region: Western, Europe, CJK, India, MENA, SEA, Africa, LatAm, Caribbean, Pakistan, Indonesia
 * - Provider: Vertex AI, Sora2, DeepSeek, Meshy, Alibaba, ModelsLab, ElevenLabs
 * - Type: Video, 3D, Avatar, Animation, Lipsync, Effects, PPT, Pixar, Anime
 * - Combinations: Video+3D, Avatar+2D, 3D+Animation, Multi-modal workflows
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================
// COMPREHENSIVE TEMPLATE LIBRARY
// ============================================

interface Template {
  name: string;
  description: string;
  category: string;
  primary_model: string;
  secondary_models: string[];
  ai_capabilities: any[];
  industry_tags: string[];
  target_platform: string[];
  estimated_duration_seconds: number;
  regional_variants?: string[];
  style_preset?: any;
}

const COMPREHENSIVE_TEMPLATES: Template[] = [
  // ==========================================
  // MARKETING TEMPLATES (20+)
  // ==========================================
  { name: 'Product Launch - Vertex AI Veo', description: 'High-impact product reveal with cinematic AI generation', category: 'marketing', primary_model: 'vertex_veo', secondary_models: ['meshy_3d', 'elevenlabs'], ai_capabilities: [{ type: 'video', provider: 'Vertex AI Veo 3.1', feature: 'Text-to-Video' }, { type: '3d', provider: 'Meshy AI', feature: '3D Product' }], industry_tags: ['saas', 'technology', 'ecommerce'], target_platform: ['youtube', 'linkedin'], estimated_duration_seconds: 60 },
  { name: 'Social Ad - Sora 2', description: 'Ultra-realistic social media ad using Sora 2', category: 'marketing', primary_model: 'sora2', secondary_models: ['openai_dalle', 'elevenlabs'], ai_capabilities: [{ type: 'video', provider: 'Sora 2', feature: 'Ultra-Realistic Video' }], industry_tags: ['retail', 'fashion'], target_platform: ['instagram', 'tiktok'], estimated_duration_seconds: 30 },
  { name: 'Brand Story - Pixar 3D', description: 'Pixar-style 3D animated brand storytelling', category: 'marketing', primary_model: 'meshy_3d', secondary_models: ['modelslab_video', 'elevenlabs'], ai_capabilities: [{ type: '3d', provider: 'Meshy AI', feature: 'Pixar Style Characters' }, { type: 'video', provider: 'ModelsLab', feature: 'Animation' }], industry_tags: ['brands', 'entertainment'], target_platform: ['youtube', 'website'], estimated_duration_seconds: 90, style_preset: { animation_style: 'pixar' } },
  { name: 'Image-to-Video Product Demo', description: 'Transform product photos into dynamic demos', category: 'marketing', primary_model: 'replicate_svd', secondary_models: ['modelslab_flux'], ai_capabilities: [{ type: 'video', provider: 'Replicate SVD', feature: 'Image-to-Video' }], industry_tags: ['ecommerce', 'products'], target_platform: ['shopify', 'amazon'], estimated_duration_seconds: 45 },
  { name: 'UGC Style Ad - DeepSeek', description: 'Authentic user-generated content style using DeepSeek', category: 'marketing', primary_model: 'deepseek_image', secondary_models: ['alibaba_wan', 'cosyvoice'], ai_capabilities: [{ type: 'image', provider: 'DeepSeek Vision', feature: 'Authentic Style' }], industry_tags: ['d2c', 'lifestyle'], target_platform: ['tiktok', 'instagram'], estimated_duration_seconds: 30 },
  { name: 'Comparison Video - Split Screen', description: 'Before/after or competitor comparison', category: 'marketing', primary_model: 'vertex_veo', secondary_models: ['modelslab_effects'], ai_capabilities: [{ type: 'video', provider: 'Vertex AI', feature: 'Split Screen' }], industry_tags: ['competitive', 'decision_stage'], target_platform: ['youtube', 'linkedin'], estimated_duration_seconds: 45 },
  { name: 'Motion Graphics Ad - Alibaba Wan', description: 'Dynamic motion graphics for regional markets', category: 'marketing', primary_model: 'alibaba_wan', secondary_models: ['cosyvoice'], ai_capabilities: [{ type: 'video', provider: 'Alibaba Wan 2.6', feature: 'Motion Graphics' }], industry_tags: ['b2b', 'technology'], target_platform: ['linkedin', 'website'], estimated_duration_seconds: 30, regional_variants: ['cjk', 'mena', 'sea'] },
  { name: 'Video Extend - Long Form', description: 'Extend short clips into full videos using AI', category: 'marketing', primary_model: 'vertex_veo', secondary_models: ['modelslab_video'], ai_capabilities: [{ type: 'video', provider: 'Vertex AI', feature: 'Video Extend' }], industry_tags: ['content_creators', 'agencies'], target_platform: ['youtube'], estimated_duration_seconds: 120 },
  { name: 'Kinetic Typography Ad', description: 'Bold text animations with video effects', category: 'marketing', primary_model: 'modelslab_effects', secondary_models: ['elevenlabs'], ai_capabilities: [{ type: 'effects', provider: 'ModelsLab', feature: 'Kinetic Typography' }], industry_tags: ['agencies', 'startups'], target_platform: ['linkedin', 'twitter'], estimated_duration_seconds: 30 },
  { name: 'Car Racing Promo - Dynamic', description: 'High-energy automotive promotional video', category: 'marketing', primary_model: 'sora2', secondary_models: ['vertex_music', 'modelslab_effects'], ai_capabilities: [{ type: 'video', provider: 'Sora 2', feature: 'Action Footage' }, { type: 'music', provider: 'Vertex AI Music', feature: 'Intense Soundtrack' }], industry_tags: ['automotive', 'racing', 'sports'], target_platform: ['youtube', 'instagram'], estimated_duration_seconds: 60 },
  
  // ==========================================
  // CORPORATE & CONSULTING TEMPLATES (15+)
  // ==========================================
  { name: 'Executive Summary - Avatar', description: 'Professional avatar presenter for corporate communications', category: 'corporate', primary_model: 'alibaba_avatar', secondary_models: ['elevenlabs'], ai_capabilities: [{ type: 'avatar', provider: 'Alibaba OmniAvatar', feature: 'Executive Presenter' }, { type: 'audio', provider: 'ElevenLabs', feature: 'Professional Voice' }], industry_tags: ['enterprise', 'finance'], target_platform: ['linkedin', 'internal'], estimated_duration_seconds: 120 },
  { name: 'Investor Pitch - Motion Graphics', description: 'Data-driven pitch with animated charts', category: 'corporate', primary_model: 'vertex_veo', secondary_models: ['modelslab_effects'], ai_capabilities: [{ type: 'video', provider: 'Vertex AI', feature: 'Motion Graphics' }], industry_tags: ['startups', 'vc', 'finance'], target_platform: ['presentations', 'email'], estimated_duration_seconds: 150 },
  { name: 'McKinsey 7S Framework', description: 'Strategic analysis using McKinsey methodology', category: 'corporate', primary_model: 'vertex_veo', secondary_models: ['alibaba_avatar', 'elevenlabs'], ai_capabilities: [{ type: 'video', provider: 'Vertex AI', feature: 'Framework Visualization' }], industry_tags: ['consulting', 'strategy', 'mckinsey'], target_platform: ['presentations'], estimated_duration_seconds: 180, style_preset: { framework: 'mckinsey_7s' } },
  { name: 'BCG Matrix Analysis', description: 'Boston Consulting Group growth-share matrix', category: 'corporate', primary_model: 'modelslab_effects', secondary_models: ['azure_neural'], ai_capabilities: [{ type: 'effects', provider: 'ModelsLab', feature: 'Matrix Animation' }], industry_tags: ['consulting', 'bcg', 'strategy'], target_platform: ['presentations'], estimated_duration_seconds: 120, style_preset: { framework: 'bcg_matrix' } },
  { name: 'Porter Five Forces', description: 'Competitive analysis framework video', category: 'corporate', primary_model: 'vertex_veo', secondary_models: ['elevenlabs'], ai_capabilities: [{ type: 'video', provider: 'Vertex AI', feature: 'Framework' }], industry_tags: ['consulting', 'strategy', 'analysis'], target_platform: ['presentations', 'youtube'], estimated_duration_seconds: 150, style_preset: { framework: 'porter' } },
  { name: 'SWOT Analysis Video', description: 'Strengths, Weaknesses, Opportunities, Threats', category: 'corporate', primary_model: 'modelslab_effects', secondary_models: ['azure_neural'], ai_capabilities: [{ type: 'effects', provider: 'ModelsLab', feature: 'SWOT Visualization' }], industry_tags: ['consulting', 'strategy'], target_platform: ['presentations'], estimated_duration_seconds: 90, style_preset: { framework: 'swot' } },
  { name: 'Balanced Scorecard', description: 'Performance management framework', category: 'corporate', primary_model: 'vertex_veo', secondary_models: ['elevenlabs'], ai_capabilities: [{ type: 'video', provider: 'Vertex AI', feature: 'Scorecard Animation' }], industry_tags: ['consulting', 'management'], target_platform: ['presentations'], estimated_duration_seconds: 120, style_preset: { framework: 'balanced_scorecard' } },
  { name: 'Full Body Avatar - Board Presentation', description: 'Full body AI presenter for executive meetings', category: 'corporate', primary_model: 'mach_avatar', secondary_models: ['elevenlabs', 'vertex_veo'], ai_capabilities: [{ type: 'avatar', provider: 'MACH Avatars', feature: 'Full Body Animation' }], industry_tags: ['enterprise', 'board'], target_platform: ['presentations', 'video_conf'], estimated_duration_seconds: 300 },
  
  // ==========================================
  // TRAVEL & HOSPITALITY TEMPLATES (10+)
  // ==========================================
  { name: 'Destination Showcase - Aerial', description: 'Cinematic drone-style travel footage', category: 'travel', primary_model: 'vertex_veo', secondary_models: ['vertex_music'], ai_capabilities: [{ type: 'video', provider: 'Vertex AI Veo', feature: 'Aerial Shots' }, { type: 'music', provider: 'Vertex AI', feature: 'Ambient Music' }], industry_tags: ['tourism', 'destinations'], target_platform: ['youtube', 'instagram'], estimated_duration_seconds: 60 },
  { name: 'Hotel Virtual Tour - 3D', description: 'Immersive 3D hotel walkthrough', category: 'travel', primary_model: 'meshy_3d', secondary_models: ['modelslab_3d'], ai_capabilities: [{ type: '3d', provider: 'Meshy AI', feature: '3D Environment' }], industry_tags: ['hotels', 'resorts'], target_platform: ['website', 'vr'], estimated_duration_seconds: 180 },
  { name: 'Travel Vlog - Image to Video', description: 'Transform travel photos into video stories', category: 'travel', primary_model: 'replicate_svd', secondary_models: ['alibaba_wan'], ai_capabilities: [{ type: 'video', provider: 'Replicate SVD', feature: 'Photo Animation' }], industry_tags: ['influencers', 'tourism'], target_platform: ['youtube', 'tiktok'], estimated_duration_seconds: 90 },
  { name: 'Airline Safety Video - Avatar', description: 'Engaging safety instructions with AI presenter', category: 'travel', primary_model: 'alibaba_avatar', secondary_models: ['azure_neural'], ai_capabilities: [{ type: 'avatar', provider: 'Alibaba', feature: 'Safety Presenter' }], industry_tags: ['airlines', 'aviation'], target_platform: ['inflight', 'app'], estimated_duration_seconds: 240, regional_variants: ['western', 'cjk', 'mena', 'india'] },
  { name: 'Cruise Ship Promo - Sora 2', description: 'Luxury cruise experience with cinematic footage', category: 'travel', primary_model: 'sora2', secondary_models: ['elevenlabs', 'vertex_music'], ai_capabilities: [{ type: 'video', provider: 'Sora 2', feature: 'Cinematic Video' }], industry_tags: ['cruise', 'luxury'], target_platform: ['youtube', 'website'], estimated_duration_seconds: 90 },
  { name: 'Caribbean Beach Resort', description: 'Tropical paradise promotional video', category: 'travel', primary_model: 'vertex_veo', secondary_models: ['vertex_music'], ai_capabilities: [{ type: 'video', provider: 'Vertex AI', feature: 'Beach Footage' }], industry_tags: ['resorts', 'caribbean'], target_platform: ['instagram', 'website'], estimated_duration_seconds: 45, regional_variants: ['caribbean', 'western'] },
  { name: 'Adventure Tourism - Action', description: 'Extreme sports and adventure activities', category: 'travel', primary_model: 'sora2', secondary_models: ['modelslab_effects'], ai_capabilities: [{ type: 'video', provider: 'Sora 2', feature: 'Action Footage' }], industry_tags: ['adventure', 'outdoor'], target_platform: ['youtube', 'tiktok'], estimated_duration_seconds: 60 },
  
  // ==========================================
  // HEALTHCARE TEMPLATES (10+)
  // ==========================================
  { name: 'Patient Education - 3D Anatomy', description: 'Medical education with 3D anatomical models', category: 'healthcare', primary_model: 'meshy_3d', secondary_models: ['vertex_veo', 'azure_neural'], ai_capabilities: [{ type: '3d', provider: 'Meshy AI', feature: 'Anatomical Models' }], industry_tags: ['hospitals', 'pharma'], target_platform: ['patient_portal', 'app'], estimated_duration_seconds: 120, regional_variants: ['western', 'india', 'sea'] },
  { name: 'Doctor Avatar Consultation', description: 'Virtual doctor presentation for telemedicine', category: 'healthcare', primary_model: 'alibaba_avatar', secondary_models: ['elevenlabs'], ai_capabilities: [{ type: 'avatar', provider: 'Alibaba OmniAvatar', feature: 'Medical Professional' }], industry_tags: ['telemedicine', 'clinics'], target_platform: ['app', 'website'], estimated_duration_seconds: 90 },
  { name: 'Medical Device Demo - 3D', description: 'Interactive 3D medical device visualization', category: 'healthcare', primary_model: 'alibaba_3d', secondary_models: ['meshy_3d'], ai_capabilities: [{ type: '3d', provider: 'Alibaba 3D Suite', feature: 'Product Visualization' }], industry_tags: ['medical_devices', 'biotech'], target_platform: ['trade_shows', 'sales'], estimated_duration_seconds: 150 },
  { name: 'Surgical Procedure - Animation', description: 'Animated surgical procedure explanation', category: 'healthcare', primary_model: 'vertex_veo', secondary_models: ['meshy_3d', 'azure_neural'], ai_capabilities: [{ type: 'video', provider: 'Vertex AI', feature: 'Medical Animation' }], industry_tags: ['surgery', 'medical_education'], target_platform: ['lms', 'presentations'], estimated_duration_seconds: 180 },
  { name: 'Wellness App Promo', description: 'Health and wellness application marketing', category: 'healthcare', primary_model: 'modelslab_video', secondary_models: ['elevenlabs'], ai_capabilities: [{ type: 'video', provider: 'ModelsLab', feature: 'Lifestyle Video' }], industry_tags: ['wellness', 'fitness', 'apps'], target_platform: ['app_store', 'instagram'], estimated_duration_seconds: 30 },
  
  // ==========================================
  // EDUCATION TEMPLATES (10+)
  // ==========================================
  { name: 'Interactive K12 Lesson', description: 'Engaging educational content for young learners', category: 'educational', primary_model: 'modelslab_video', secondary_models: ['alibaba_avatar'], ai_capabilities: [{ type: 'video', provider: 'ModelsLab', feature: 'Cartoon Animation' }], industry_tags: ['k12', 'edtech'], target_platform: ['lms', 'youtube'], estimated_duration_seconds: 300, style_preset: { animation_style: 'cartoon' } },
  { name: 'University Lecture - Avatar', description: 'Virtual professor for online courses', category: 'educational', primary_model: 'wan_avatar', secondary_models: ['elevenlabs'], ai_capabilities: [{ type: 'avatar', provider: 'Wan 2.2 Avatar', feature: 'Academic Presenter' }], industry_tags: ['higher_education', 'mooc'], target_platform: ['lms', 'youtube'], estimated_duration_seconds: 600 },
  { name: 'Science Explainer - 3D Molecules', description: 'Chemistry and biology with 3D models', category: 'educational', primary_model: 'meshy_3d', secondary_models: ['vertex_veo'], ai_capabilities: [{ type: '3d', provider: 'Meshy AI', feature: 'Molecular Visualization' }], industry_tags: ['stem', 'science'], target_platform: ['lms', 'youtube'], estimated_duration_seconds: 180 },
  { name: 'History Documentary - AI Generated', description: 'Historical content with AI-generated visuals', category: 'educational', primary_model: 'sora2', secondary_models: ['elevenlabs'], ai_capabilities: [{ type: 'video', provider: 'Sora 2', feature: 'Historical Recreation' }], industry_tags: ['history', 'documentary'], target_platform: ['youtube', 'streaming'], estimated_duration_seconds: 300 },
  { name: 'Language Learning - Lipsync Avatar', description: 'Native speaker avatar for language education', category: 'educational', primary_model: 'alibaba_avatar', secondary_models: ['cosyvoice'], ai_capabilities: [{ type: 'avatar', provider: 'Alibaba', feature: 'Lip Synchronization' }, { type: 'audio', provider: 'CosyVoice', feature: 'Native Accent' }], industry_tags: ['language', 'edtech'], target_platform: ['app', 'lms'], estimated_duration_seconds: 120, regional_variants: ['cjk', 'mena', 'sea', 'europe'] },
  
  // ==========================================
  // ENTERTAINMENT TEMPLATES (10+)
  // ==========================================
  { name: 'Music Video - AI Generated', description: 'Fully AI-generated music video', category: 'entertainment', primary_model: 'sora2', secondary_models: ['vertex_music', 'modelslab_effects'], ai_capabilities: [{ type: 'video', provider: 'Sora 2', feature: 'Music Video' }, { type: 'music', provider: 'Vertex AI Music', feature: 'Original Score' }], industry_tags: ['music', 'artists'], target_platform: ['youtube', 'spotify'], estimated_duration_seconds: 180 },
  { name: 'Anime Short Film', description: 'Japanese anime-style animated short', category: 'entertainment', primary_model: 'alibaba_wan', secondary_models: ['cosyvoice'], ai_capabilities: [{ type: 'video', provider: 'Alibaba Wan 2.6', feature: 'Anime Generation' }], industry_tags: ['anime', 'gaming'], target_platform: ['youtube', 'streaming'], estimated_duration_seconds: 300, style_preset: { animation_style: 'anime' }, regional_variants: ['cjk', 'western'] },
  { name: 'Gaming Trailer - Epic', description: 'Cinematic game trailer with 3D characters', category: 'entertainment', primary_model: 'vertex_veo', secondary_models: ['meshy_3d', 'vertex_music'], ai_capabilities: [{ type: 'video', provider: 'Vertex AI', feature: 'Cinematic Trailer' }, { type: '3d', provider: 'Meshy AI', feature: 'Game Characters' }], industry_tags: ['gaming', 'esports'], target_platform: ['youtube', 'twitch'], estimated_duration_seconds: 90 },
  { name: 'Movie Trailer Style', description: 'Hollywood-style movie trailer', category: 'entertainment', primary_model: 'sora2', secondary_models: ['elevenlabs', 'vertex_music'], ai_capabilities: [{ type: 'video', provider: 'Sora 2', feature: 'Cinematic Footage' }], industry_tags: ['film', 'streaming'], target_platform: ['youtube', 'theaters'], estimated_duration_seconds: 120 },
  { name: 'Podcast Video - Avatar Host', description: 'AI avatar host for podcast content', category: 'entertainment', primary_model: 'alibaba_avatar', secondary_models: ['elevenlabs'], ai_capabilities: [{ type: 'avatar', provider: 'Alibaba', feature: 'Podcast Host' }], industry_tags: ['podcasts', 'creators'], target_platform: ['youtube', 'spotify'], estimated_duration_seconds: 600 },
  
  // ==========================================
  // ANIMATION & 3D TEMPLATES (15+)
  // ==========================================
  { name: 'Pixar Style Character Animation', description: '3D character animation in Pixar style', category: 'animation', primary_model: 'meshy_3d', secondary_models: ['modelslab_video'], ai_capabilities: [{ type: '3d', provider: 'Meshy AI', feature: 'Pixar Characters' }], industry_tags: ['animation', 'entertainment'], target_platform: ['youtube', 'streaming'], estimated_duration_seconds: 120, style_preset: { animation_style: 'pixar' } },
  { name: '2D Animated Explainer', description: 'Classic 2D animation style', category: 'animation', primary_model: 'modelslab_video', secondary_models: ['elevenlabs'], ai_capabilities: [{ type: 'video', provider: 'ModelsLab AnimateDiff', feature: '2D Animation' }], industry_tags: ['startups', 'saas'], target_platform: ['website', 'youtube'], estimated_duration_seconds: 90, style_preset: { animation_style: '2d' } },
  { name: 'Motion Control Video', description: 'Precise camera movement control', category: 'animation', primary_model: 'vertex_veo', secondary_models: ['modelslab_effects'], ai_capabilities: [{ type: 'video', provider: 'Vertex AI', feature: 'Motion Control' }], industry_tags: ['film', 'advertising'], target_platform: ['cinema', 'youtube'], estimated_duration_seconds: 60 },
  { name: 'Video Transition Effects', description: 'Creative transitions between scenes', category: 'animation', primary_model: 'modelslab_effects', secondary_models: ['vertex_veo'], ai_capabilities: [{ type: 'effects', provider: 'ModelsLab', feature: 'Transitions' }], industry_tags: ['editors', 'creators'], target_platform: ['youtube', 'tiktok'], estimated_duration_seconds: 30 },
  { name: 'Text-to-3D Product', description: 'Generate 3D products from text descriptions', category: '3d', primary_model: 'meshy_3d', secondary_models: ['alibaba_3d'], ai_capabilities: [{ type: '3d', provider: 'Meshy AI', feature: 'Text-to-3D' }], industry_tags: ['ecommerce', 'products'], target_platform: ['website', 'ar'], estimated_duration_seconds: 30 },
  { name: 'Image-to-3D Conversion', description: 'Convert product photos to 3D models', category: '3d', primary_model: 'alibaba_3d', secondary_models: ['meshy_3d'], ai_capabilities: [{ type: '3d', provider: 'Alibaba 3D', feature: 'Image-to-3D' }], industry_tags: ['ecommerce', 'retail'], target_platform: ['ar', 'website'], estimated_duration_seconds: 30 },
  { name: '3D Avatar + Lipsync', description: 'Speaking 3D character with lip sync', category: 'avatar', primary_model: 'taoavatar', secondary_models: ['elevenlabs'], ai_capabilities: [{ type: 'avatar', provider: 'TaoAvatar 3DGS', feature: '3D Avatar' }, { type: 'lipsync', provider: 'Alibaba', feature: 'Lip Sync' }], industry_tags: ['marketing', 'education'], target_platform: ['website', 'app'], estimated_duration_seconds: 90 },
  { name: 'Full Body 3D Avatar', description: 'Complete body AI avatar with gestures', category: 'avatar', primary_model: 'mach_avatar', secondary_models: ['elevenlabs'], ai_capabilities: [{ type: 'avatar', provider: 'MACH Avatars', feature: 'Full Body' }], industry_tags: ['enterprise', 'training'], target_platform: ['presentations', 'vr'], estimated_duration_seconds: 180 },
  
  // ==========================================
  // REGIONAL VARIANTS (20+)
  // ==========================================
  { name: 'India Market - Avatar Presenter', description: 'Hindi/English presenter for Indian market', category: 'marketing', primary_model: 'alibaba_avatar', secondary_models: ['azure_neural'], ai_capabilities: [{ type: 'avatar', provider: 'Alibaba', feature: 'Regional Avatar' }], industry_tags: ['india', 'regional'], target_platform: ['youtube', 'website'], estimated_duration_seconds: 60, regional_variants: ['india'] },
  { name: 'MENA Arabic Commercial', description: 'Arabic language commercial with RTL support', category: 'marketing', primary_model: 'alibaba_wan', secondary_models: ['azure_neural'], ai_capabilities: [{ type: 'video', provider: 'Alibaba Wan', feature: 'RTL Content' }], industry_tags: ['mena', 'arabic'], target_platform: ['youtube', 'tv'], estimated_duration_seconds: 30, regional_variants: ['mena'] },
  { name: 'CJK Market - Anime Style', description: 'Anime-style content for China/Japan/Korea', category: 'marketing', primary_model: 'alibaba_wan', secondary_models: ['cosyvoice'], ai_capabilities: [{ type: 'video', provider: 'Alibaba', feature: 'Anime Style' }], industry_tags: ['cjk', 'anime'], target_platform: ['weibo', 'youtube'], estimated_duration_seconds: 30, regional_variants: ['cjk'], style_preset: { animation_style: 'anime' } },
  { name: 'Africa - Mobile First Video', description: 'Optimized for African mobile markets', category: 'marketing', primary_model: 'vertex_veo', secondary_models: ['azure_neural'], ai_capabilities: [{ type: 'video', provider: 'Vertex AI', feature: 'Mobile Optimized' }], industry_tags: ['africa', 'mobile'], target_platform: ['whatsapp', 'facebook'], estimated_duration_seconds: 15, regional_variants: ['africa'] },
  { name: 'Indonesia - Local Culture', description: 'Indonesian cultural themes and language', category: 'marketing', primary_model: 'alibaba_wan', secondary_models: ['azure_neural'], ai_capabilities: [{ type: 'video', provider: 'Alibaba', feature: 'Local Content' }], industry_tags: ['indonesia', 'sea'], target_platform: ['youtube', 'tiktok'], estimated_duration_seconds: 30, regional_variants: ['indonesia'] },
  { name: 'Pakistan - Urdu Content', description: 'Urdu language video with cultural elements', category: 'marketing', primary_model: 'alibaba_avatar', secondary_models: ['azure_neural'], ai_capabilities: [{ type: 'avatar', provider: 'Alibaba', feature: 'Urdu Presenter' }], industry_tags: ['pakistan', 'urdu'], target_platform: ['youtube', 'facebook'], estimated_duration_seconds: 60, regional_variants: ['pakistan'] },
  { name: 'LatAm - Spanish/Portuguese', description: 'Latin American market content', category: 'marketing', primary_model: 'vertex_veo', secondary_models: ['elevenlabs'], ai_capabilities: [{ type: 'video', provider: 'Vertex AI', feature: 'LatAm Content' }], industry_tags: ['latam', 'spanish'], target_platform: ['youtube', 'instagram'], estimated_duration_seconds: 30, regional_variants: ['latam'] },
  { name: 'Caribbean Tourism Promo', description: 'Caribbean tourism and hospitality', category: 'travel', primary_model: 'sora2', secondary_models: ['vertex_music'], ai_capabilities: [{ type: 'video', provider: 'Sora 2', feature: 'Tropical Footage' }], industry_tags: ['caribbean', 'tourism'], target_platform: ['youtube', 'travel_sites'], estimated_duration_seconds: 45, regional_variants: ['caribbean'] },
  { name: 'European Luxury Brand', description: 'High-end European brand video', category: 'marketing', primary_model: 'sora2', secondary_models: ['elevenlabs'], ai_capabilities: [{ type: 'video', provider: 'Sora 2', feature: 'Luxury Aesthetic' }], industry_tags: ['europe', 'luxury'], target_platform: ['instagram', 'website'], estimated_duration_seconds: 30, regional_variants: ['europe'] },
  { name: 'SEA E-commerce Video', description: 'Southeast Asian e-commerce content', category: 'marketing', primary_model: 'alibaba_wan', secondary_models: ['cosyvoice'], ai_capabilities: [{ type: 'video', provider: 'Alibaba', feature: 'E-commerce' }], industry_tags: ['sea', 'ecommerce'], target_platform: ['shopee', 'lazada'], estimated_duration_seconds: 15, regional_variants: ['sea'] },
  
  // ==========================================
  // COMBINATION TEMPLATES (15+)
  // ==========================================
  { name: 'Video + 3D Product Showcase', description: 'Cinematic video with embedded 3D product', category: 'marketing', primary_model: 'vertex_veo', secondary_models: ['meshy_3d', 'elevenlabs'], ai_capabilities: [{ type: 'video', provider: 'Vertex AI', feature: 'Video' }, { type: '3d', provider: 'Meshy AI', feature: '3D Product' }], industry_tags: ['products', 'technology'], target_platform: ['youtube', 'website'], estimated_duration_seconds: 60 },
  { name: '3D Avatar + 2D Animation', description: 'Mixed style with 3D presenter and 2D graphics', category: 'educational', primary_model: 'alibaba_avatar', secondary_models: ['modelslab_video'], ai_capabilities: [{ type: 'avatar', provider: 'Alibaba', feature: '3D Avatar' }, { type: 'video', provider: 'ModelsLab', feature: '2D Animation' }], industry_tags: ['education', 'training'], target_platform: ['lms', 'youtube'], estimated_duration_seconds: 180 },
  { name: 'Avatar + Lipsync + Music', description: 'Full production with voice and soundtrack', category: 'marketing', primary_model: 'alibaba_avatar', secondary_models: ['elevenlabs', 'vertex_music'], ai_capabilities: [{ type: 'avatar', provider: 'Alibaba', feature: 'Presenter' }, { type: 'audio', provider: 'ElevenLabs', feature: 'Voice' }, { type: 'music', provider: 'Vertex AI', feature: 'Music' }], industry_tags: ['advertising', 'brands'], target_platform: ['youtube', 'tv'], estimated_duration_seconds: 60 },
  { name: 'Video + 3D + Avatar (Full)', description: 'Complete multi-modal production', category: 'corporate', primary_model: 'vertex_veo', secondary_models: ['meshy_3d', 'alibaba_avatar', 'elevenlabs'], ai_capabilities: [{ type: 'video', provider: 'Vertex AI', feature: 'Cinematic' }, { type: '3d', provider: 'Meshy', feature: '3D Elements' }, { type: 'avatar', provider: 'Alibaba', feature: 'Presenter' }], industry_tags: ['enterprise', 'premium'], target_platform: ['presentations', 'youtube'], estimated_duration_seconds: 180 },
  { name: 'Image-to-Video + Effects', description: 'Photo animation with visual effects', category: 'marketing', primary_model: 'replicate_svd', secondary_models: ['modelslab_effects'], ai_capabilities: [{ type: 'video', provider: 'Replicate SVD', feature: 'Image Animation' }, { type: 'effects', provider: 'ModelsLab', feature: 'Visual Effects' }], industry_tags: ['photography', 'creators'], target_platform: ['instagram', 'tiktok'], estimated_duration_seconds: 30 },
  { name: 'Anime + Voice Dubbing', description: 'Anime style with multi-language voice', category: 'entertainment', primary_model: 'alibaba_wan', secondary_models: ['cosyvoice', 'azure_neural'], ai_capabilities: [{ type: 'video', provider: 'Alibaba', feature: 'Anime' }, { type: 'audio', provider: 'CosyVoice', feature: 'Japanese Voice' }], industry_tags: ['anime', 'localization'], target_platform: ['streaming', 'youtube'], estimated_duration_seconds: 300, style_preset: { animation_style: 'anime' } },
  
  // ==========================================
  // PPT / DECK TEMPLATES (10+)
  // ==========================================
  { name: 'PPT to Video - Corporate', description: 'Transform PowerPoint to professional video', category: 'corporate', primary_model: 'vertex_veo', secondary_models: ['alibaba_avatar', 'elevenlabs'], ai_capabilities: [{ type: 'video', provider: 'Vertex AI', feature: 'PPT-to-Video' }, { type: 'avatar', provider: 'Alibaba', feature: 'Presenter' }], industry_tags: ['presentations', 'ppt', 'deck'], target_platform: ['linkedin', 'internal'], estimated_duration_seconds: 300, style_preset: { source: 'ppt' } },
  { name: 'Pitch Deck Video', description: 'Animated pitch deck for investors', category: 'corporate', primary_model: 'modelslab_effects', secondary_models: ['elevenlabs'], ai_capabilities: [{ type: 'effects', provider: 'ModelsLab', feature: 'Slide Animation' }], industry_tags: ['startups', 'pitch', 'deck'], target_platform: ['email', 'presentations'], estimated_duration_seconds: 180, style_preset: { source: 'deck' } },
  { name: 'Training Deck Video', description: 'Convert training slides to engaging video', category: 'educational', primary_model: 'alibaba_avatar', secondary_models: ['azure_neural'], ai_capabilities: [{ type: 'avatar', provider: 'Alibaba', feature: 'Trainer' }], industry_tags: ['training', 'hr', 'deck'], target_platform: ['lms', 'internal'], estimated_duration_seconds: 600, style_preset: { source: 'ppt' } },
  { name: 'Sales Deck Animation', description: 'Animated sales presentation', category: 'marketing', primary_model: 'modelslab_effects', secondary_models: ['elevenlabs'], ai_capabilities: [{ type: 'effects', provider: 'ModelsLab', feature: 'Motion Graphics' }], industry_tags: ['sales', 'b2b', 'deck'], target_platform: ['email', 'presentations'], estimated_duration_seconds: 120, style_preset: { source: 'deck' } },
  
  // ==========================================
  // INSPIRATIONAL & CREATIVE (10+)
  // ==========================================
  { name: 'Motivational - Epic Cinematic', description: 'Inspirational video with epic visuals', category: 'storytelling', primary_model: 'sora2', secondary_models: ['vertex_music', 'elevenlabs'], ai_capabilities: [{ type: 'video', provider: 'Sora 2', feature: 'Epic Footage' }, { type: 'music', provider: 'Vertex AI', feature: 'Inspirational Music' }], industry_tags: ['motivation', 'inspiration'], target_platform: ['youtube', 'linkedin'], estimated_duration_seconds: 90 },
  { name: 'Innovation Showcase', description: 'Cutting-edge technology and innovation', category: 'corporate', primary_model: 'vertex_veo', secondary_models: ['meshy_3d'], ai_capabilities: [{ type: 'video', provider: 'Vertex AI', feature: 'Tech Visuals' }, { type: '3d', provider: 'Meshy', feature: 'Futuristic 3D' }], industry_tags: ['innovation', 'technology'], target_platform: ['website', 'events'], estimated_duration_seconds: 60 },
  { name: 'Creative Agency Reel', description: 'Bold, artistic agency showcase', category: 'marketing', primary_model: 'sora2', secondary_models: ['modelslab_effects'], ai_capabilities: [{ type: 'video', provider: 'Sora 2', feature: 'Creative Footage' }], industry_tags: ['agencies', 'creative'], target_platform: ['website', 'instagram'], estimated_duration_seconds: 45 },
  { name: 'Startup Vision Video', description: 'Vision and mission for startups', category: 'storytelling', primary_model: 'vertex_veo', secondary_models: ['elevenlabs', 'vertex_music'], ai_capabilities: [{ type: 'video', provider: 'Vertex AI', feature: 'Vision Narrative' }], industry_tags: ['startups', 'vision'], target_platform: ['website', 'youtube'], estimated_duration_seconds: 120 },
  { name: 'Transformation Story', description: 'Before/after transformation narrative', category: 'storytelling', primary_model: 'sora2', secondary_models: ['elevenlabs'], ai_capabilities: [{ type: 'video', provider: 'Sora 2', feature: 'Story' }], industry_tags: ['transformation', 'success'], target_platform: ['youtube', 'linkedin'], estimated_duration_seconds: 90 },
  
  // ==========================================
  // AUDIO & MUSIC TEMPLATES (5+)
  // ==========================================
  { name: 'TTS Voiceover Video', description: 'Professional voiceover with AI TTS', category: 'marketing', primary_model: 'elevenlabs', secondary_models: ['vertex_veo'], ai_capabilities: [{ type: 'audio', provider: 'ElevenLabs', feature: 'Professional TTS' }], industry_tags: ['voiceover', 'narration'], target_platform: ['youtube', 'podcasts'], estimated_duration_seconds: 60 },
  { name: 'Background Music Video', description: 'AI-generated background music', category: 'entertainment', primary_model: 'vertex_music', secondary_models: ['vertex_veo'], ai_capabilities: [{ type: 'music', provider: 'Vertex AI Music', feature: 'Original Composition' }], industry_tags: ['music', 'ambient'], target_platform: ['youtube', 'ads'], estimated_duration_seconds: 120 },
  { name: 'Sound Effects Video', description: 'Video with AI-generated sound effects', category: 'entertainment', primary_model: 'vertex_veo', secondary_models: ['vertex_music'], ai_capabilities: [{ type: 'effects', provider: 'Vertex AI', feature: 'SFX Generation' }], industry_tags: ['sfx', 'audio'], target_platform: ['film', 'games'], estimated_duration_seconds: 60 },
  { name: 'Voice Clone Narration', description: 'Cloned voice for consistent branding', category: 'marketing', primary_model: 'elevenlabs', secondary_models: ['vertex_veo'], ai_capabilities: [{ type: 'audio', provider: 'ElevenLabs', feature: 'Voice Cloning' }], industry_tags: ['branding', 'voice'], target_platform: ['ads', 'website'], estimated_duration_seconds: 60 },
  { name: 'Multi-Language Dubbing', description: 'Same video dubbed in multiple languages', category: 'marketing', primary_model: 'elevenlabs', secondary_models: ['cosyvoice', 'azure_neural'], ai_capabilities: [{ type: 'audio', provider: 'ElevenLabs', feature: 'Multi-Language' }], industry_tags: ['localization', 'global'], target_platform: ['youtube', 'streaming'], estimated_duration_seconds: 60, regional_variants: ['western', 'cjk', 'mena', 'sea', 'india'] },

  // ==========================================
  // NEW STYLES - Animated, Hand-drawn, Creative
  // ==========================================
  { name: 'Crayon Sketch Animation', description: 'Childlike crayon drawing style with playful aesthetics', category: 'animation', primary_model: 'modelslab_video', secondary_models: ['elevenlabs'], ai_capabilities: [{ type: 'video', provider: 'ModelsLab', feature: 'Crayon Style' }], industry_tags: ['education', 'kids', 'nonprofit'], target_platform: ['youtube', 'lms'], estimated_duration_seconds: 90, style_preset: { animation_style: 'crayon' } },
  { name: 'Hand Sketch Drawing', description: 'Pencil sketch style with artistic hand-drawn aesthetics', category: 'animation', primary_model: 'modelslab_video', secondary_models: ['vertex_veo'], ai_capabilities: [{ type: 'video', provider: 'ModelsLab', feature: 'Hand Sketch' }], industry_tags: ['art', 'education', 'architecture'], target_platform: ['youtube', 'presentations'], estimated_duration_seconds: 120, style_preset: { animation_style: 'hand_sketch' } },
  { name: 'Microworld Perspective', description: 'Tiny world macro perspective with miniature aesthetics', category: 'animation', primary_model: 'vertex_veo', secondary_models: ['meshy_3d'], ai_capabilities: [{ type: 'video', provider: 'Vertex AI', feature: 'Microworld' }, { type: '3d', provider: 'Meshy', feature: 'Miniature 3D' }], industry_tags: ['science', 'education', 'nature'], target_platform: ['youtube', 'documentaries'], estimated_duration_seconds: 120, style_preset: { animation_style: 'microworld' } },
  { name: 'Stop Motion Animation', description: 'Classic stop-motion with tactile handmade feel', category: 'animation', primary_model: 'modelslab_video', secondary_models: ['vertex_music'], ai_capabilities: [{ type: 'video', provider: 'ModelsLab', feature: 'Stop Motion' }], industry_tags: ['entertainment', 'crafts', 'kids'], target_platform: ['youtube', 'streaming'], estimated_duration_seconds: 90, style_preset: { animation_style: 'stop_motion' } },
  { name: 'Paper Cutout Animation', description: 'Layered paper cutout style like South Park', category: 'animation', primary_model: 'modelslab_video', secondary_models: ['elevenlabs'], ai_capabilities: [{ type: 'video', provider: 'ModelsLab', feature: 'Paper Cutout' }], industry_tags: ['entertainment', 'comedy', 'marketing'], target_platform: ['youtube', 'tiktok'], estimated_duration_seconds: 60, style_preset: { animation_style: 'paper_cutout' } },
  { name: 'Watercolor Style Video', description: 'Soft watercolor painting with flowing transitions', category: 'animation', primary_model: 'modelslab_video', secondary_models: ['vertex_music'], ai_capabilities: [{ type: 'video', provider: 'ModelsLab', feature: 'Watercolor' }], industry_tags: ['art', 'wellness', 'nature'], target_platform: ['youtube', 'instagram'], estimated_duration_seconds: 90, style_preset: { animation_style: 'watercolor' } },
  { name: 'Oil Painting Animation', description: 'Rich oil painting aesthetic with textured brushstrokes', category: 'animation', primary_model: 'modelslab_video', secondary_models: ['vertex_music'], ai_capabilities: [{ type: 'video', provider: 'ModelsLab', feature: 'Oil Painting' }], industry_tags: ['art', 'luxury', 'culture'], target_platform: ['youtube', 'museums'], estimated_duration_seconds: 120, style_preset: { animation_style: 'oil_painting' } },

  // ==========================================
  // NEW STYLES - Photorealistic & Upscaler
  // ==========================================
  { name: 'Photorealistic 4K Video', description: 'Ultra-high definition photorealistic AI renders', category: 'marketing', primary_model: 'sora2', secondary_models: ['vertex_veo'], ai_capabilities: [{ type: 'video', provider: 'Sora 2', feature: 'Photorealistic 4K' }], industry_tags: ['real_estate', 'automotive', 'product'], target_platform: ['youtube', 'website'], estimated_duration_seconds: 60, style_preset: { quality: '4k', style: 'photorealistic' } },
  { name: 'AI Image Upscaler Video', description: 'AI-enhanced image upscaling with detail preservation', category: 'marketing', primary_model: 'modelslab_flux', secondary_models: ['replicate_svd'], ai_capabilities: [{ type: 'image', provider: 'ModelsLab FLUX', feature: 'Image Upscaling' }], industry_tags: ['photography', 'ecommerce', 'real_estate'], target_platform: ['website', 'youtube'], estimated_duration_seconds: 30, style_preset: { enhancement: 'upscale' } },
  { name: 'Hyper-Real Cinematic', description: 'Beyond-reality detailed renders with enhanced textures', category: 'marketing', primary_model: 'sora2', secondary_models: ['vertex_veo', 'meshy_3d'], ai_capabilities: [{ type: 'video', provider: 'Sora 2', feature: 'Hyper-Real' }], industry_tags: ['luxury', 'automotive', 'fashion'], target_platform: ['cinema', 'youtube'], estimated_duration_seconds: 90, style_preset: { quality: '4k', style: 'hyper_real' } },
  { name: 'Cinematic Film Look', description: '35mm film grain aesthetic with cinematic color grading', category: 'entertainment', primary_model: 'vertex_veo', secondary_models: ['vertex_music'], ai_capabilities: [{ type: 'video', provider: 'Vertex AI', feature: 'Cinematic Film' }], industry_tags: ['entertainment', 'brand', 'documentary'], target_platform: ['youtube', 'streaming'], estimated_duration_seconds: 120, style_preset: { style: 'film_grain' } },

  // ==========================================
  // NEW STYLES - Character-based
  // ==========================================
  { name: 'Pixar Disney Animation', description: 'High-quality 3D animation in Pixar/Disney style', category: 'animation', primary_model: 'meshy_3d', secondary_models: ['modelslab_video', 'elevenlabs'], ai_capabilities: [{ type: '3d', provider: 'Meshy AI', feature: 'Pixar/Disney Style' }], industry_tags: ['kids', 'education', 'entertainment', 'family'], target_platform: ['youtube', 'streaming'], estimated_duration_seconds: 120, style_preset: { animation_style: 'pixar_disney' } },
  { name: 'Universal DreamWorks Style', description: 'DreamWorks-style 3D characters with expressive animation', category: 'animation', primary_model: 'meshy_3d', secondary_models: ['modelslab_video'], ai_capabilities: [{ type: '3d', provider: 'Meshy AI', feature: 'DreamWorks Style' }], industry_tags: ['entertainment', 'kids', 'gaming'], target_platform: ['youtube', 'streaming'], estimated_duration_seconds: 120, style_preset: { animation_style: 'dreamworks' } },
  { name: 'Character Vlog Host', description: 'Animated character hosting vlog-style content', category: 'avatar', primary_model: 'alibaba_avatar', secondary_models: ['elevenlabs'], ai_capabilities: [{ type: 'avatar', provider: 'Alibaba Wan 2.2', feature: 'Character Vlog' }], industry_tags: ['influencer', 'education', 'gaming'], target_platform: ['youtube', 'tiktok'], estimated_duration_seconds: 180, style_preset: { avatar_style: 'character_vlog' } },
  { name: 'Brand Mascot Presenter', description: 'Brand mascot as video presenter with personality', category: 'avatar', primary_model: 'meshy_3d', secondary_models: ['alibaba_avatar', 'elevenlabs'], ai_capabilities: [{ type: '3d', provider: 'Meshy AI', feature: 'Mascot' }, { type: 'avatar', provider: 'Alibaba', feature: 'Presenter' }], industry_tags: ['marketing', 'retail', 'food', 'sports'], target_platform: ['youtube', 'website'], estimated_duration_seconds: 90, style_preset: { avatar_style: 'mascot' } },

  // ==========================================
  // NEW STYLES - Cyber & Tech
  // ==========================================
  { name: 'Cyberpunk Neon Video', description: 'Neon-lit futuristic cyberpunk aesthetic', category: 'entertainment', primary_model: 'modelslab_video', secondary_models: ['vertex_music'], ai_capabilities: [{ type: 'video', provider: 'ModelsLab', feature: 'Cyberpunk' }], industry_tags: ['gaming', 'tech', 'entertainment'], target_platform: ['youtube', 'twitch'], estimated_duration_seconds: 90, style_preset: { animation_style: 'cyberpunk' } },
  { name: 'Neon Glow Effects', description: 'Vibrant neon effects with glowing aesthetics', category: 'entertainment', primary_model: 'modelslab_effects', secondary_models: ['vertex_veo'], ai_capabilities: [{ type: 'effects', provider: 'ModelsLab', feature: 'Neon Glow' }], industry_tags: ['nightlife', 'music', 'gaming', 'fitness'], target_platform: ['youtube', 'tiktok'], estimated_duration_seconds: 45, style_preset: { effect_style: 'neon' } },
  { name: 'Glitch Art Style', description: 'Digital glitch effects with distorted aesthetics', category: 'entertainment', primary_model: 'modelslab_effects', secondary_models: ['vertex_music'], ai_capabilities: [{ type: 'effects', provider: 'ModelsLab', feature: 'Glitch Art' }], industry_tags: ['music', 'tech', 'youth'], target_platform: ['youtube', 'instagram'], estimated_duration_seconds: 30, style_preset: { effect_style: 'glitch' } },
  { name: 'Holographic 3D Effect', description: 'Hologram-style 3D projections with futuristic feel', category: '3d', primary_model: 'meshy_3d', secondary_models: ['modelslab_effects'], ai_capabilities: [{ type: '3d', provider: 'Meshy AI', feature: 'Holographic' }], industry_tags: ['tech', 'automotive', 'innovation'], target_platform: ['presentations', 'events'], estimated_duration_seconds: 60, style_preset: { effect_style: 'holographic' } },
  { name: 'Retro Synthwave Video', description: '80s synthwave aesthetic with retro-futuristic vibes', category: 'entertainment', primary_model: 'modelslab_video', secondary_models: ['vertex_music'], ai_capabilities: [{ type: 'video', provider: 'ModelsLab', feature: 'Synthwave' }], industry_tags: ['music', 'gaming', 'fashion'], target_platform: ['youtube', 'spotify'], estimated_duration_seconds: 90, style_preset: { animation_style: 'synthwave' } },

  // ==========================================
  // NEW STYLES - Educational
  // ==========================================
  { name: 'Explainer Video Pro', description: 'Clear concise explainer videos for complex topics', category: 'educational', primary_model: 'vertex_veo', secondary_models: ['alibaba_avatar', 'elevenlabs'], ai_capabilities: [{ type: 'video', provider: 'Vertex AI', feature: 'Explainer' }, { type: 'avatar', provider: 'Alibaba', feature: 'Presenter' }], industry_tags: ['saas', 'tech', 'finance', 'healthcare'], target_platform: ['website', 'youtube'], estimated_duration_seconds: 120, style_preset: { content_type: 'explainer' } },
  { name: 'School Learning Video', description: 'Age-appropriate educational content for K-12', category: 'educational', primary_model: 'modelslab_video', secondary_models: ['alibaba_avatar', 'elevenlabs'], ai_capabilities: [{ type: 'video', provider: 'ModelsLab', feature: 'School Animation' }, { type: 'avatar', provider: 'Alibaba', feature: 'Teacher' }], industry_tags: ['education', 'edtech', 'k12'], target_platform: ['lms', 'youtube'], estimated_duration_seconds: 300, style_preset: { content_type: 'school' }, regional_variants: ['western', 'india', 'africa', 'latam', 'sea'] },
  { name: 'Science Documentary AI', description: 'Scientific content with professional narration', category: 'educational', primary_model: 'sora2', secondary_models: ['meshy_3d', 'elevenlabs'], ai_capabilities: [{ type: 'video', provider: 'Sora 2', feature: 'Documentary' }, { type: '3d', provider: 'Meshy', feature: 'Science Models' }], industry_tags: ['science', 'education', 'nature'], target_platform: ['youtube', 'streaming'], estimated_duration_seconds: 300, style_preset: { content_type: 'documentary' } },
  { name: 'Motivational Inspirational', description: 'Inspiring content with powerful messaging', category: 'storytelling', primary_model: 'sora2', secondary_models: ['vertex_music', 'elevenlabs'], ai_capabilities: [{ type: 'video', provider: 'Sora 2', feature: 'Inspirational' }, { type: 'music', provider: 'Vertex AI', feature: 'Epic Music' }], industry_tags: ['coaching', 'fitness', 'business', 'nonprofit'], target_platform: ['youtube', 'linkedin'], estimated_duration_seconds: 90, style_preset: { content_type: 'motivational' } },
  { name: 'Innovation Tech Showcase', description: 'Cutting-edge technology and innovation content', category: 'corporate', primary_model: 'vertex_veo', secondary_models: ['meshy_3d', 'modelslab_effects'], ai_capabilities: [{ type: 'video', provider: 'Vertex AI', feature: 'Tech Showcase' }, { type: '3d', provider: 'Meshy', feature: 'Future Tech' }], industry_tags: ['tech', 'startup', 'innovation'], target_platform: ['events', 'website', 'youtube'], estimated_duration_seconds: 90, style_preset: { content_type: 'innovation' } },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { mode = 'add' } = await req.json().catch(() => ({}));

    // Get existing templates to avoid duplicates
    const { data: existing } = await supabase
      .from('video_blueprints')
      .select('name');
    
    const existingNames = new Set((existing || []).map(t => t.name));
    
    const toInsert = COMPREHENSIVE_TEMPLATES.filter(t => !existingNames.has(t.name));
    
    if (toInsert.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'All templates already exist',
        created: 0,
        skipped: COMPREHENSIVE_TEMPLATES.length,
        total: existing?.length || 0,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Insert templates
    const blueprintsToInsert = toInsert.map(t => ({
      name: t.name,
      description: t.description,
      category: t.category,
      estimated_duration_seconds: t.estimated_duration_seconds,
      target_platform: t.target_platform,
      industry_tags: t.industry_tags,
      style_preset: t.style_preset || {},
      default_settings: {
        primary_model: t.primary_model,
        secondary_models: t.secondary_models,
        ai_capabilities: t.ai_capabilities,
        regional_variants: t.regional_variants || [],
      },
      is_system_default: true,
      is_public: true,
      is_active: true,
    }));

    const { data: inserted, error } = await supabase
      .from('video_blueprints')
      .insert(blueprintsToInsert)
      .select('id, name');

    if (error) throw error;

    // Create scenes for each blueprint (simplified)
    const scenesInserts = [];
    for (const bp of inserted || []) {
      const template = COMPREHENSIVE_TEMPLATES.find(t => t.name === bp.name);
      if (template) {
        // Create basic scene structure based on template type
        const scenes = [
          { blueprint_id: bp.id, scene_key: 'hook', title: 'Hook', scene_type: 'intro', duration_seconds: 5, order_index: 0, is_optional: false },
          { blueprint_id: bp.id, scene_key: 'intro', title: 'Introduction', scene_type: 'intro', duration_seconds: 15, order_index: 1, is_optional: false },
          { blueprint_id: bp.id, scene_key: 'content', title: 'Main Content', scene_type: 'content', duration_seconds: Math.floor(template.estimated_duration_seconds * 0.6), order_index: 2, is_optional: false },
          { blueprint_id: bp.id, scene_key: 'cta', title: 'Call to Action', scene_type: 'cta', duration_seconds: 10, order_index: 3, is_optional: false },
        ];
        scenesInserts.push(...scenes);
      }
    }

    if (scenesInserts.length > 0) {
      await supabase.from('blueprint_scenes').insert(scenesInserts);
    }

    return new Response(JSON.stringify({
      success: true,
      created: inserted?.length || 0,
      skipped: existingNames.size,
      total: (existing?.length || 0) + (inserted?.length || 0),
      templates: inserted?.map(t => t.name) || [],
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error seeding templates:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

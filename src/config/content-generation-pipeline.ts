/**
 * CONTENT GENERATION PIPELINE CONFIG
 * 
 * EXTENDS the existing ecosystemRegistry.ts (206 pipelines, 21 categories, 7 products)
 * DO NOT duplicate pipeline definitions - use CATEGORY_REGISTRY and PIPELINE_CATEGORY_MAPPING
 * 
 * This file defines:
 * - Output format combinations (Avatar + PPT, 3D + Voice, Full Production, etc.)
 * - Industry-specific templates that USE the 206 pipelines
 * - Regional detection configs for IP-based content delivery
 * - 6-zone TTS routing integration
 * 
 * CONNECTS TO:
 * - Composition Studio (create, view, publish workflow)
 * - Landing page sections via TemplateLandingMapper
 * - IP-based regional content delivery
 */

import { CATEGORY_REGISTRY, type CategoryId } from '@/constants/ecosystemRegistry';
import { GenieProduct } from '@/constants/genie-products';

// Output format types - combinations of our 206 pipelines
export type OutputFormat = 
  | 'avatar_ppt'           // Avatar presenter over PPT slides (uses: avatar-lipsync + presentation)
  | '3d_showcase_voice'    // 3D models with voiceover (uses: 3d-immersive + tts-generation)
  | 'full_production'      // Combined Avatar + 3D + PPT (uses: multiple pipeline categories)
  | 'interactive_demo'     // Step-by-step clickable (uses: video-editing + screen capture)
  | 'screen_recording'     // Screen capture with voice (uses: video-editing + tts-generation)
  | 'pure_video'           // AI-generated video only (uses: video-generation)
  | 'avatar_only';         // Avatar talking head only (uses: avatar-lipsync)

// Maps output formats to the pipeline categories they use from ecosystemRegistry
export const OUTPUT_FORMAT_PIPELINE_MAPPING: Record<OutputFormat, CategoryId[]> = {
  avatar_ppt: ['avatar-lipsync', 'presentation', 'tts-generation'],
  '3d_showcase_voice': ['3d-immersive', 'tts-generation', 'video-generation'],
  full_production: ['avatar-lipsync', '3d-immersive', 'presentation', 'video-generation', 'audio-production'],
  interactive_demo: ['video-editing', 'tts-generation'],
  screen_recording: ['video-editing', 'tts-generation'],
  pure_video: ['video-generation', 'audio-production'],
  avatar_only: ['avatar-lipsync', 'tts-generation'],
};

// Industry categories - aligned with the 25 industries in registry
export type IndustryCategory = 
  | 'technology'
  | 'healthcare'
  | 'finance'
  | 'government'
  | 'education'
  | 'tourism'
  | 'retail'
  | 'manufacturing'
  | 'real_estate'
  | 'energy'
  | 'media'
  | 'transportation'
  | 'aerospace'
  | 'telecommunications'
  | 'agriculture'
  | 'legal'
  | 'hospitality';

export type RegionalZone = 
  | 'mena'           // Middle East & North Africa
  | 'gcc'            // Gulf Cooperation Council
  | 'south_asia'     // India, Pakistan, Bangladesh
  | 'sea'            // Southeast Asia
  | 'cjk'            // China, Japan, Korea
  | 'europe'         // Western Europe
  | 'latam'          // Latin America
  | 'africa'         // Sub-Saharan Africa
  | 'north_america'  // US, Canada
  | 'oceania'        // Australia, NZ
  | 'turkey'         // Turkey
  | 'caribbean'      // English & French Caribbean
  | 'eastern_europe' // Ukraine, Balkans
  | 'central_asia';  // Kazakhstan, Uzbekistan, Caucasus

export interface OutputFormatConfig {
  id: OutputFormat;
  label: string;
  description: string;
  visualTypes: ('avatar' | '3d' | 'video' | 'animation' | 'screen_recording' | 'static')[];
  hasVoiceover: boolean;
  hasPPTSlides: boolean;
  tierRequired: 'free' | 'starter' | 'creator' | 'pro' | 'business' | 'enterprise';
  estimatedDuration: { min: number; max: number }; // seconds
  providers: {
    visual: string[];
    voice: string[];
    music?: string[];
  };
}

export const OUTPUT_FORMAT_CONFIGS: OutputFormatConfig[] = [
  {
    id: 'avatar_ppt',
    label: 'Avatar + PPT Slides',
    description: 'AI avatar narrates over presentation slides with voice',
    visualTypes: ['avatar', 'static'],
    hasVoiceover: true,
    hasPPTSlides: true,
    tierRequired: 'creator',
    estimatedDuration: { min: 60, max: 300 },
    providers: {
      visual: ['Alibaba Wan2.2-S2V', 'Alibaba OmniAvatar'],
      voice: ['ElevenLabs', 'Azure Neural', 'Qwen3-TTS'],
    },
  },
  {
    id: '3d_showcase_voice',
    label: '3D Product Showcase + Voice',
    description: '3D models with professional voiceover explanation',
    visualTypes: ['3d', 'animation'],
    hasVoiceover: true,
    hasPPTSlides: false,
    tierRequired: 'pro',
    estimatedDuration: { min: 30, max: 180 },
    providers: {
      visual: ['Meshy AI', 'ModelsLab 3D'],
      voice: ['ElevenLabs', 'Azure Neural'],
    },
  },
  {
    id: 'full_production',
    label: 'Full Production Video',
    description: 'Combined Avatar + 3D + PPT in cinematic video',
    visualTypes: ['avatar', '3d', 'video', 'animation', 'static'],
    hasVoiceover: true,
    hasPPTSlides: true,
    tierRequired: 'business',
    estimatedDuration: { min: 120, max: 600 },
    providers: {
      visual: ['Alibaba Wan2.2', 'Meshy AI', 'ModelsLab'],
      voice: ['ElevenLabs', 'Qwen3-TTS', 'Azure Neural'],
      music: ['ElevenLabs Music', 'Alibaba FunAudio'],
    },
  },
  {
    id: 'interactive_demo',
    label: 'Interactive Step-by-Step',
    description: 'Clickable demo users navigate through',
    visualTypes: ['screen_recording', 'avatar', 'static'],
    hasVoiceover: true,
    hasPPTSlides: false,
    tierRequired: 'creator',
    estimatedDuration: { min: 60, max: 300 },
    providers: {
      visual: ['Native Screen Capture', 'Alibaba Wan2.2-S2V'],
      voice: ['ElevenLabs', 'Azure Neural'],
    },
  },
  {
    id: 'screen_recording',
    label: 'Screen Recording + Voice',
    description: 'Screen capture with AI voiceover narration',
    visualTypes: ['screen_recording'],
    hasVoiceover: true,
    hasPPTSlides: false,
    tierRequired: 'starter',
    estimatedDuration: { min: 30, max: 600 },
    providers: {
      visual: ['Native Screen Capture'],
      voice: ['ElevenLabs', 'Azure Neural', 'Google TTS'],
    },
  },
  {
    id: 'pure_video',
    label: 'AI Generated Video',
    description: 'Pure AI-generated video content',
    visualTypes: ['video', 'animation'],
    hasVoiceover: true,
    hasPPTSlides: false,
    tierRequired: 'creator',
    estimatedDuration: { min: 15, max: 120 },
    providers: {
      visual: ['ModelsLab', 'Alibaba Wan2.2'],
      voice: ['ElevenLabs', 'Azure Neural'],
    },
  },
  {
    id: 'avatar_only',
    label: 'Avatar Talking Head',
    description: 'AI avatar presenter with lip-sync',
    visualTypes: ['avatar'],
    hasVoiceover: true,
    hasPPTSlides: false,
    tierRequired: 'creator',
    estimatedDuration: { min: 30, max: 180 },
    providers: {
      visual: ['Alibaba Wan2.2-S2V', 'Alibaba OmniAvatar'],
      voice: ['ElevenLabs', 'Qwen3-TTS', 'Azure Neural'],
    },
  },
];

// Industry-specific templates with regional context
export interface IndustryTemplateConfig {
  id: string;
  industry: IndustryCategory;
  region: RegionalZone;
  title: string;
  description: string;
  narrative: string; // The story/transformation to tell
  outputFormats: OutputFormat[];
  defaultFormat: OutputFormat;
  chapters: {
    title: string;
    type: 'avatar' | '3d' | 'video' | 'animation' | 'static';
    scriptPrompt: string;
    duration: number;
  }[];
  languages: string[];
  tags: string[];
}

export const INDUSTRY_TEMPLATES: IndustryTemplateConfig[] = [
  // === MENA / GCC REGION ===
  {
    id: 'saudi_transformation',
    industry: 'government',
    region: 'gcc',
    title: 'Saudi Vision 2030 Transformation',
    description: 'How Saudi Arabia is transforming from oil dependency to tourism & AI',
    narrative: 'From black gold to digital gold - Saudi Arabia\'s journey from oil & gas dominance to becoming a global tourism and AI innovation hub',
    outputFormats: ['full_production', 'avatar_ppt', '3d_showcase_voice'],
    defaultFormat: 'full_production',
    chapters: [
      {
        title: 'The Vision',
        type: 'animation',
        scriptPrompt: 'Cinematic reveal of Saudi Vision 2030 with futuristic cityscapes',
        duration: 20,
      },
      {
        title: 'From Oil to Innovation',
        type: '3d',
        scriptPrompt: '3D transformation showing oil rigs morphing into tech hubs and NEOM',
        duration: 30,
      },
      {
        title: 'Tourism Renaissance',
        type: 'video',
        scriptPrompt: 'Showcase of AlUla, Red Sea Project, and heritage sites',
        duration: 35,
      },
      {
        title: 'AI Leadership',
        type: 'avatar',
        scriptPrompt: 'Regional avatar explains Saudi AI investments and SDAIA',
        duration: 25,
      },
      {
        title: 'The Future Awaits',
        type: 'animation',
        scriptPrompt: 'Call to action with partnership opportunities',
        duration: 15,
      },
    ],
    languages: ['ar', 'en', 'fr', 'zh', 'ja'],
    tags: ['government', 'transformation', 'vision2030', 'tourism', 'ai'],
  },
  {
    id: 'uae_smart_city',
    industry: 'government',
    region: 'gcc',
    title: 'UAE Smart City Initiative',
    description: 'Dubai and Abu Dhabi\'s smart city transformation',
    narrative: 'Building the cities of tomorrow today - UAE\'s leadership in smart urban development',
    outputFormats: ['full_production', '3d_showcase_voice', 'avatar_ppt'],
    defaultFormat: 'full_production',
    chapters: [
      {
        title: 'Smart Nation Vision',
        type: 'animation',
        scriptPrompt: 'Futuristic animation of connected cities',
        duration: 20,
      },
      {
        title: 'Digital Infrastructure',
        type: '3d',
        scriptPrompt: '3D visualization of IoT networks and data centers',
        duration: 30,
      },
      {
        title: 'Citizen Experience',
        type: 'avatar',
        scriptPrompt: 'Avatar demonstrates e-government services',
        duration: 30,
      },
      {
        title: 'Partner With Us',
        type: 'video',
        scriptPrompt: 'Investment and partnership opportunities',
        duration: 20,
      },
    ],
    languages: ['ar', 'en', 'hi', 'ur', 'zh'],
    tags: ['government', 'smart-city', 'digital', 'infrastructure'],
  },

  // === SOUTH ASIA ===
  {
    id: 'india_digital_india',
    industry: 'government',
    region: 'south_asia',
    title: 'Digital India Transformation',
    description: 'India\'s journey to becoming a digital-first economy',
    narrative: 'A billion connections - How Digital India is revolutionizing governance and commerce',
    outputFormats: ['avatar_ppt', 'full_production', 'interactive_demo'],
    defaultFormat: 'avatar_ppt',
    chapters: [
      {
        title: 'Digital India Vision',
        type: 'animation',
        scriptPrompt: 'Map of India lighting up with digital connections',
        duration: 20,
      },
      {
        title: 'UPI Revolution',
        type: 'video',
        scriptPrompt: 'Showcase of UPI payments transforming commerce',
        duration: 30,
      },
      {
        title: 'Aadhaar Impact',
        type: 'avatar',
        scriptPrompt: 'Avatar explains digital identity reaching 1.4B people',
        duration: 30,
      },
      {
        title: 'AI & Startup Ecosystem',
        type: '3d',
        scriptPrompt: '3D visualization of India\'s tech hubs',
        duration: 25,
      },
    ],
    languages: ['hi', 'en', 'ta', 'te', 'bn', 'mr', 'gu'],
    tags: ['government', 'digital', 'fintech', 'startup'],
  },

  // === CJK ===
  {
    id: 'japan_manufacturing_4',
    industry: 'manufacturing',
    region: 'cjk',
    title: 'Japan Industry 4.0',
    description: 'Japanese manufacturing excellence meets AI automation',
    narrative: 'The marriage of Monozukuri and AI - Japan\'s manufacturing renaissance',
    outputFormats: ['3d_showcase_voice', 'full_production', 'avatar_ppt'],
    defaultFormat: '3d_showcase_voice',
    chapters: [
      {
        title: 'Monozukuri Legacy',
        type: 'video',
        scriptPrompt: 'Heritage of Japanese craftsmanship',
        duration: 20,
      },
      {
        title: 'Smart Factory',
        type: '3d',
        scriptPrompt: '3D tour of AI-powered factory floor',
        duration: 35,
      },
      {
        title: 'Robotics Integration',
        type: 'video',
        scriptPrompt: 'Cobots working alongside humans',
        duration: 25,
      },
      {
        title: 'Future Manufacturing',
        type: 'avatar',
        scriptPrompt: 'Japanese avatar explains partnership opportunities',
        duration: 20,
      },
    ],
    languages: ['ja', 'en', 'zh', 'ko'],
    tags: ['manufacturing', 'robotics', 'industry4', 'automation'],
  },

  // === HEALTHCARE ===
  {
    id: 'healthcare_ai_diagnostics',
    industry: 'healthcare',
    region: 'north_america',
    title: 'AI in Medical Diagnostics',
    description: 'How AI is transforming patient diagnosis and care',
    narrative: 'From symptoms to solutions in seconds - AI-powered healthcare revolution',
    outputFormats: ['avatar_ppt', 'full_production', '3d_showcase_voice'],
    defaultFormat: 'avatar_ppt',
    chapters: [
      {
        title: 'The Challenge',
        type: 'video',
        scriptPrompt: 'Modern healthcare challenges and diagnostic delays',
        duration: 20,
      },
      {
        title: 'AI Diagnostics',
        type: '3d',
        scriptPrompt: '3D visualization of AI analyzing medical images',
        duration: 30,
      },
      {
        title: 'Patient Stories',
        type: 'avatar',
        scriptPrompt: 'Medical professional avatar shares success stories',
        duration: 30,
      },
      {
        title: 'Implementation',
        type: 'static',
        scriptPrompt: 'Integration steps and compliance',
        duration: 20,
      },
    ],
    languages: ['en', 'es', 'pt', 'fr', 'de'],
    tags: ['healthcare', 'ai', 'diagnostics', 'medical'],
  },

  // === EDUCATION ===
  {
    id: 'edtech_personalized_learning',
    industry: 'education',
    region: 'europe',
    title: 'AI-Powered Personalized Learning',
    description: 'How AI adapts education to each student\'s needs',
    narrative: 'Every student is unique - AI tutors that understand and adapt',
    outputFormats: ['interactive_demo', 'avatar_ppt', 'full_production'],
    defaultFormat: 'interactive_demo',
    chapters: [
      {
        title: 'One-Size Doesn\'t Fit All',
        type: 'animation',
        scriptPrompt: 'Animation showing diverse learning styles',
        duration: 20,
      },
      {
        title: 'Adaptive AI Tutor',
        type: 'avatar',
        scriptPrompt: 'AI tutor avatar demonstrates personalization',
        duration: 35,
      },
      {
        title: 'Real Results',
        type: 'video',
        scriptPrompt: 'Student testimonials and outcome data',
        duration: 25,
      },
      {
        title: 'Get Started',
        type: 'static',
        scriptPrompt: 'Implementation and pricing',
        duration: 15,
      },
    ],
    languages: ['en', 'de', 'fr', 'es', 'it', 'nl'],
    tags: ['education', 'edtech', 'personalization', 'ai-tutor'],
  },

  // === FINANCE ===
  {
    id: 'fintech_inclusive_banking',
    industry: 'finance',
    region: 'africa',
    title: 'Inclusive Banking for Africa',
    description: 'Mobile-first financial services reaching the unbanked',
    narrative: 'Banking the unbanked - How mobile technology is transforming African finance',
    outputFormats: ['avatar_ppt', 'pure_video', 'full_production'],
    defaultFormat: 'avatar_ppt',
    chapters: [
      {
        title: 'The Opportunity',
        type: 'animation',
        scriptPrompt: 'Map of Africa with mobile penetration stats',
        duration: 20,
      },
      {
        title: 'Mobile Money',
        type: 'video',
        scriptPrompt: 'People using mobile banking in daily life',
        duration: 30,
      },
      {
        title: 'AI Credit Scoring',
        type: '3d',
        scriptPrompt: '3D visualization of alternative data analysis',
        duration: 25,
      },
      {
        title: 'Partner With Us',
        type: 'avatar',
        scriptPrompt: 'African avatar explains partnership model',
        duration: 20,
      },
    ],
    languages: ['en', 'sw', 'fr', 'ar', 'ha', 'yo'],
    tags: ['finance', 'fintech', 'mobile-banking', 'inclusion'],
  },
];

// IP-based regional detection config
export interface RegionalDetectionConfig {
  zone: RegionalZone;
  countries: string[]; // ISO 2-letter codes
  defaultLanguage: string;
  defaultIndustries: IndustryCategory[];
  voiceProvider: 'elevenlabs' | 'azure' | 'alibaba' | 'google';
  avatarStyle: string;
}

export const REGIONAL_DETECTION_CONFIGS: RegionalDetectionConfig[] = [
  {
    zone: 'gcc',
    countries: ['SA', 'AE', 'KW', 'QA', 'BH', 'OM'],
    defaultLanguage: 'ar',
    defaultIndustries: ['government', 'energy', 'tourism', 'real_estate'],
    voiceProvider: 'azure',
    avatarStyle: 'professional_mena',
  },
  {
    zone: 'mena',
    countries: ['EG', 'JO', 'LB', 'SY', 'IQ', 'MA', 'DZ', 'TN', 'LY'],
    defaultLanguage: 'ar',
    defaultIndustries: ['government', 'education', 'tourism'],
    voiceProvider: 'azure',
    avatarStyle: 'professional_mena',
  },
  {
    zone: 'south_asia',
    countries: ['IN', 'PK', 'BD', 'LK', 'NP'],
    defaultLanguage: 'hi',
    defaultIndustries: ['technology', 'education', 'healthcare', 'finance'],
    voiceProvider: 'azure',
    avatarStyle: 'professional_south_asian',
  },
  {
    zone: 'sea',
    countries: ['ID', 'TH', 'VN', 'MY', 'PH', 'SG', 'MM', 'KH', 'LA'],
    defaultLanguage: 'en',
    defaultIndustries: ['technology', 'tourism', 'manufacturing'],
    voiceProvider: 'azure',
    avatarStyle: 'professional_cjk',
  },
  {
    zone: 'cjk',
    countries: ['CN', 'JP', 'KR', 'TW', 'HK'],
    defaultLanguage: 'zh',
    defaultIndustries: ['technology', 'manufacturing', 'retail'],
    voiceProvider: 'alibaba',
    avatarStyle: 'professional_cjk',
  },
  {
    zone: 'europe',
    countries: ['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'PT', 'PL', 'SE', 'NO', 'DK', 'FI', 'AT', 'CH'],
    defaultLanguage: 'en',
    defaultIndustries: ['technology', 'finance', 'healthcare', 'education'],
    voiceProvider: 'elevenlabs',
    avatarStyle: 'professional_western',
  },
  {
    zone: 'north_america',
    countries: ['US', 'CA'],
    defaultLanguage: 'en',
    defaultIndustries: ['technology', 'healthcare', 'finance', 'education'],
    voiceProvider: 'elevenlabs',
    avatarStyle: 'professional_western',
  },
  {
    zone: 'latam',
    countries: ['BR', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC'],
    defaultLanguage: 'es',
    defaultIndustries: ['government', 'finance', 'education', 'retail'],
    voiceProvider: 'azure',
    avatarStyle: 'professional_latam',
  },
  {
    zone: 'africa',
    countries: ['NG', 'KE', 'ZA', 'GH', 'ET', 'TZ', 'UG', 'RW'],
    defaultLanguage: 'en',
    defaultIndustries: ['finance', 'education', 'healthcare', 'government'],
    voiceProvider: 'azure',
    avatarStyle: 'professional_western',
  },
  {
    zone: 'oceania',
    countries: ['AU', 'NZ'],
    defaultLanguage: 'en',
    defaultIndustries: ['technology', 'healthcare', 'education'],
    voiceProvider: 'elevenlabs',
    avatarStyle: 'professional_western',
  },
  // P0: Turkey
  {
    zone: 'turkey',
    countries: ['TR'],
    defaultLanguage: 'tr',
    defaultIndustries: ['technology', 'manufacturing', 'tourism'],
    voiceProvider: 'azure',
    avatarStyle: 'professional_western',
  },
  // P1: Caribbean
  {
    zone: 'caribbean',
    countries: ['JM', 'TT', 'BS', 'HT', 'BB', 'GY'],
    defaultLanguage: 'en',
    defaultIndustries: ['tourism', 'finance', 'education'],
    voiceProvider: 'azure',
    avatarStyle: 'professional_western',
  },
  // P1: Eastern Europe
  {
    zone: 'eastern_europe',
    countries: ['UA', 'RS', 'BG', 'HR', 'BA', 'ME', 'MK', 'AL'],
    defaultLanguage: 'en',
    defaultIndustries: ['technology', 'education', 'manufacturing'],
    voiceProvider: 'azure',
    avatarStyle: 'professional_western',
  },
  // P1: Central Asia & Caucasus
  {
    zone: 'central_asia',
    countries: ['KZ', 'UZ', 'AZ', 'GE', 'AM', 'TM', 'KG', 'TJ'],
    defaultLanguage: 'en',
    defaultIndustries: ['energy', 'government', 'technology'],
    voiceProvider: 'azure',
    avatarStyle: 'professional_western',
  },
];

// Helper functions
export const getOutputFormatConfig = (formatId: OutputFormat): OutputFormatConfig | undefined => {
  return OUTPUT_FORMAT_CONFIGS.find(f => f.id === formatId);
};

export const getIndustryTemplatesForRegion = (region: RegionalZone): IndustryTemplateConfig[] => {
  return INDUSTRY_TEMPLATES.filter(t => t.region === region);
};

export const getIndustryTemplatesForCategory = (industry: IndustryCategory): IndustryTemplateConfig[] => {
  return INDUSTRY_TEMPLATES.filter(t => t.industry === industry);
};

export const getRegionalConfigByCountry = (countryCode: string): RegionalDetectionConfig | undefined => {
  return REGIONAL_DETECTION_CONFIGS.find(r => r.countries.includes(countryCode.toUpperCase()));
};

export const getDefaultTemplateForRegion = (region: RegionalZone): IndustryTemplateConfig | undefined => {
  const templates = getIndustryTemplatesForRegion(region);
  return templates[0]; // Return first matching template
};

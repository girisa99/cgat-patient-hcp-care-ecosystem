/**
 * GENIE CAST INTEGRATION CONFIG
 * "Make It. Show It. Scale It."
 * Maps landing page sections to internal AI generation pipelines
 * 
 * Genie Cast is the 7th core product - the global distribution and marketing engine
 */

export type GenieCastFeatureType = 
  | 'daily_showcase'
  | 'avatar_presenter'
  | '3d_hero'
  | 'video_testimonials'
  | 'interactive_demo'
  | 'product_demo_video'
  | 'feature_showcase'
  | 'pipeline_showcase'
  | 'use_case_selector'
  | 'mini_generation'
  | 'limited_generation'
  | 'preview_output'
  | 'regional_content'
  | 'platform_distribution';

export interface GenieCastPipelineMapping {
  feature: GenieCastFeatureType;
  pipelines: string[];
  providers: string[];
  refreshInterval?: number; // in hours
  regionalVariants: boolean;
  platforms?: string[];
  description: string;
}

/**
 * GENIE CAST FEATURE MAPPINGS
 * "Make It. Show It. Scale It."
 * Maps each visual element to the generation pipeline that powers it
 */
export const GENIE_CAST_PIPELINE_MAPPINGS: GenieCastPipelineMapping[] = [
  {
    feature: 'daily_showcase',
    pipelines: ['text-to-video', 'script-to-avatar', 'ppt-to-video'],
    providers: ['ModelsLab', 'ElevenLabs', 'Alibaba'],
    refreshInterval: 24, // Daily rotation
    regionalVariants: true,
    platforms: ['YouTube', 'LinkedIn', 'TikTok', 'Instagram', 'Twitter', 'Blog'],
    description: 'Hero section rotating showcase of daily AI-generated content',
  },
  {
    feature: 'avatar_presenter',
    pipelines: ['text-to-avatar', 'script-to-avatar', 'voice-to-lipsync'],
    providers: ['Alibaba OmniAvatar', 'Alibaba WAN 2.2', 'Azure Visemes'],
    refreshInterval: 168, // Weekly refresh
    regionalVariants: true,
    description: 'Regional AI avatar presenters for guided tours',
  },
  {
    feature: '3d_hero',
    pipelines: ['text-to-3d', 'image-to-3d'],
    providers: ['Meshy AI', 'Tripo3D'],
    refreshInterval: 48, // Every 2 days
    regionalVariants: false,
    description: 'Interactive 3D product showcase scenes',
  },
  {
    feature: 'video_testimonials',
    pipelines: ['video_avatar', 'text-to-video'],
    providers: ['ElevenLabs', 'Alibaba Wan2.2'],
    refreshInterval: 72, // Every 3 days
    regionalVariants: true,
    description: 'AI-generated customer testimonial avatars',
  },
  {
    feature: 'product_demo_video',
    pipelines: ['screen-to-video', 'ppt-to-video', 'script-to-video'],
    providers: ['ModelsLab', 'Azure'],
    refreshInterval: 168, // Weekly
    regionalVariants: true,
    description: 'Product-specific demo videos in user language',
  },
  {
    feature: 'interactive_demo',
    pipelines: ['text-to-presentation', 'text-to-video', 'voice-clone'],
    providers: ['OpenAI', 'ElevenLabs', 'ModelsLab'],
    refreshInterval: 0, // On-demand
    regionalVariants: true,
    description: 'Live mini-generation for visitor preview',
  },
];

/**
 * REGIONAL AVATAR CONFIGURATION
 * Defines the AI presenter avatar for each region
 */
export const REGIONAL_AVATAR_CONFIG: Record<string, {
  avatarStyle: string;
  voiceProvider: string;
  voiceId: string;
  greetingKey: string;
}> = {
  en: {
    avatarStyle: 'professional_western',
    voiceProvider: 'ElevenLabs',
    voiceId: 'rachel',
    greetingKey: 'welcome_en',
  },
  ar: {
    avatarStyle: 'professional_mena',
    voiceProvider: 'Azure',
    voiceId: 'ar-SA-HamedNeural',
    greetingKey: 'welcome_ar',
  },
  zh: {
    avatarStyle: 'professional_cjk',
    voiceProvider: 'Alibaba',
    voiceId: 'zhixiaobai',
    greetingKey: 'welcome_zh',
  },
  hi: {
    avatarStyle: 'professional_south_asian',
    voiceProvider: 'Azure',
    voiceId: 'hi-IN-MadhurNeural',
    greetingKey: 'welcome_hi',
  },
  ja: {
    avatarStyle: 'professional_cjk',
    voiceProvider: 'Alibaba',
    voiceId: 'sicheng',
    greetingKey: 'welcome_ja',
  },
  ko: {
    avatarStyle: 'professional_cjk',
    voiceProvider: 'Azure',
    voiceId: 'ko-KR-InJoonNeural',
    greetingKey: 'welcome_ko',
  },
  es: {
    avatarStyle: 'professional_western',
    voiceProvider: 'ElevenLabs',
    voiceId: 'matilda',
    greetingKey: 'welcome_es',
  },
  fr: {
    avatarStyle: 'professional_western',
    voiceProvider: 'ElevenLabs',
    voiceId: 'charlotte',
    greetingKey: 'welcome_fr',
  },
  de: {
    avatarStyle: 'professional_western',
    voiceProvider: 'Azure',
    voiceId: 'de-DE-ConradNeural',
    greetingKey: 'welcome_de',
  },
  pt: {
    avatarStyle: 'professional_latam',
    voiceProvider: 'Azure',
    voiceId: 'pt-BR-AntonioNeural',
    greetingKey: 'welcome_pt',
  },
};

/**
 * 3D SCENE CONFIGURATION
 * Defines the immersive 3D elements for the landing page
 */
export const LANDING_3D_SCENES = {
  hero: {
    sceneType: 'product_showcase',
    meshyPrompt: 'Futuristic holographic AI assistant interface, floating geometric shapes, soft gradients, tech aesthetic',
    interactivity: ['rotate', 'zoom', 'hover_highlight'],
    fallback: 'gradient_animation',
  },
  productCards: {
    sceneType: 'product_icons',
    meshyPrompts: {
      mind: 'Glowing brain neural network 3D icon, blue and purple gradients',
      spark: 'Electric spark lightning bolt 3D icon, yellow and orange energy',
      vibe: 'Sound wave visualization 3D icon, audio frequencies, green tones',
      deck: 'Floating presentation slides 3D icon, stacked layers, modern',
      arc: 'Orbital rings production hub 3D icon, interconnected nodes',
      studio: 'Complete creative suite 3D icon, all elements combined',
    },
    interactivity: ['hover_float', 'click_expand'],
  },
};

/**
 * Get Genie Cast mapping for a specific feature
 */
export const getGenieCastMapping = (feature: GenieCastFeatureType): GenieCastPipelineMapping | undefined => {
  return GENIE_CAST_PIPELINE_MAPPINGS.find(m => m.feature === feature);
};

/**
 * Get regional avatar config
 */
export const getRegionalAvatar = (regionCode: string) => {
  return REGIONAL_AVATAR_CONFIG[regionCode] || REGIONAL_AVATAR_CONFIG.en;
};

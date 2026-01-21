/**
 * Video Generation Provider Configuration
 * 
 * Centralized configuration for all video generation providers
 * Includes AnimateDiff, SVD, Avatar, and Lip-Sync capabilities
 * Multi-provider support: ModelsLab, Alibaba, Azure, DeepSeek, Google, Replicate
 */

import type { MediaProviderConfig, VideoGenProvider, MediaCapability } from './types';

// ============================================
// VIDEO GENERATION PROVIDERS - MULTI-PROVIDER MATRIX
// ============================================

export const VIDEO_GEN_PROVIDERS: Record<VideoGenProvider, MediaProviderConfig> = {
  // ==========================================
  // ANIMATEDIFF - MULTI-PROVIDER
  // ==========================================
  modelslab_animatediff: {
    id: 'modelslab_animatediff',
    name: 'ModelsLab AnimateDiff',
    capabilities: ['video_gen', 'text_to_video', 'image_to_video', 'animatediff'],
    secretKey: 'MODELSLAB_API_KEY',
    isConfigured: true,
    priority: 1, // PRIMARY for AnimateDiff
    costPerUnit: 0.02,
    qualityScore: 88,
    speedScore: 75,
    strengths: ['Text-to-video', 'Image-to-video', 'Multiple styles', 'Async processing', 'ControlNet support'],
    weaknesses: ['Short duration (3-10s)'],
  },
  alibaba_animatediff: {
    id: 'alibaba_animatediff',
    name: 'Alibaba AnimateDiff',
    capabilities: ['video_gen', 'text_to_video', 'image_to_video', 'animatediff'],
    secretKey: 'ALIBABA_API_KEY',
    isConfigured: true,
    priority: 2,
    costPerUnit: 0.012,
    qualityScore: 82,
    speedScore: 85,
    supportedLanguages: ['zh', 'en', 'ja', 'ko'],
    strengths: ['CJK optimized', 'Low cost', 'Fast processing', 'WAN 2.2 integration'],
    weaknesses: ['Lower resolution options'],
  },
  azure_animatediff: {
    id: 'azure_animatediff',
    name: 'Azure AnimateDiff',
    capabilities: ['video_gen', 'text_to_video', 'animatediff'],
    secretKey: 'AZURE_COGNITIVE_KEY',
    isConfigured: true,
    priority: 3,
    costPerUnit: 0.025,
    qualityScore: 90,
    speedScore: 65,
    strengths: ['Enterprise-grade', 'HIPAA compliant', 'Content moderation', 'Viseme integration'],
    weaknesses: ['Higher cost', 'Slower processing'],
  },
  deepseek_animatediff: {
    id: 'deepseek_animatediff',
    name: 'DeepSeek AnimateDiff',
    capabilities: ['video_gen', 'text_to_video', 'image_to_video', 'animatediff'],
    secretKey: 'DEEPSEEK_API_KEY',
    isConfigured: true,
    priority: 4,
    costPerUnit: 0.008,
    qualityScore: 80,
    speedScore: 80,
    supportedLanguages: ['zh', 'en', 'ja', 'ko'],
    strengths: ['Ultra low cost', 'CJK optimized', 'Technical content', 'Vision understanding'],
    weaknesses: ['Newer model'],
  },
  google_animatediff: {
    id: 'google_animatediff',
    name: 'Google Veo AnimateDiff',
    capabilities: ['video_gen', 'text_to_video', 'animatediff'],
    secretKey: 'GEMINI_API_KEY',
    isConfigured: true,
    priority: 5,
    costPerUnit: 0.03,
    qualityScore: 92,
    speedScore: 60,
    strengths: ['High quality', 'Long duration', 'Veo 2 integration'],
    weaknesses: ['Limited availability', 'Higher cost'],
  },
  replicate_animatediff: {
    id: 'replicate_animatediff',
    name: 'Replicate AnimateDiff',
    capabilities: ['video_gen', 'text_to_video', 'image_to_video', 'animatediff'],
    secretKey: 'REPLICATE_API_TOKEN',
    isConfigured: true,
    priority: 6,
    costPerUnit: 0.015,
    qualityScore: 85,
    speedScore: 70,
    strengths: ['Multiple models', 'Custom configs', 'Pay-per-use'],
    weaknesses: ['Cold start delays'],
  },

  // ==========================================
  // STABLE VIDEO DIFFUSION (SVD) - MULTI-PROVIDER
  // ==========================================
  modelslab_svd: {
    id: 'modelslab_svd',
    name: 'ModelsLab SVD',
    capabilities: ['video_gen', 'image_to_video', 'svd'],
    secretKey: 'MODELSLAB_API_KEY',
    isConfigured: true,
    priority: 1, // PRIMARY for SVD
    costPerUnit: 0.03,
    qualityScore: 90,
    speedScore: 70,
    strengths: ['Higher quality', 'Smooth motion', 'Image-to-video'],
    weaknesses: ['Slower processing', 'Requires reference image'],
  },
  alibaba_svd: {
    id: 'alibaba_svd',
    name: 'Alibaba WAN SVD',
    capabilities: ['video_gen', 'image_to_video', 'svd', 'character_animation'],
    secretKey: 'ALIBABA_API_KEY',
    isConfigured: true,
    priority: 2,
    costPerUnit: 0.015,
    qualityScore: 85,
    speedScore: 80,
    supportedLanguages: ['zh', 'en', 'ja', 'ko'],
    strengths: ['WAN 2.2 integration', 'Character animation', 'Low cost', 'CJK optimized'],
    weaknesses: ['Regional availability'],
  },
  azure_svd: {
    id: 'azure_svd',
    name: 'Azure Video AI SVD',
    capabilities: ['video_gen', 'image_to_video', 'svd'],
    secretKey: 'AZURE_COGNITIVE_KEY',
    isConfigured: true,
    priority: 3,
    costPerUnit: 0.035,
    qualityScore: 88,
    speedScore: 60,
    strengths: ['Enterprise compliance', 'Viseme sync', 'Neural TTS integration'],
    weaknesses: ['Higher cost', 'Complex setup'],
  },
  deepseek_svd: {
    id: 'deepseek_svd',
    name: 'DeepSeek SVD',
    capabilities: ['video_gen', 'image_to_video', 'svd'],
    secretKey: 'DEEPSEEK_API_KEY',
    isConfigured: true,
    priority: 4,
    costPerUnit: 0.01,
    qualityScore: 78,
    speedScore: 82,
    supportedLanguages: ['zh', 'en', 'ja', 'ko'],
    strengths: ['Lowest cost', 'CJK content', 'Technical diagrams'],
    weaknesses: ['Lower quality ceiling'],
  },
  google_svd: {
    id: 'google_svd',
    name: 'Google Veo SVD',
    capabilities: ['video_gen', 'image_to_video', 'svd'],
    secretKey: 'GEMINI_API_KEY',
    isConfigured: true,
    priority: 5,
    costPerUnit: 0.04,
    qualityScore: 94,
    speedScore: 55,
    strengths: ['Highest quality', 'Veo 2 architecture', 'Long clips'],
    weaknesses: ['Premium pricing', 'Rate limits'],
  },
  replicate_svd: {
    id: 'replicate_svd',
    name: 'Replicate SVD',
    capabilities: ['video_gen', 'image_to_video', 'svd'],
    secretKey: 'REPLICATE_API_TOKEN',
    isConfigured: true,
    priority: 6,
    costPerUnit: 0.025,
    qualityScore: 88,
    speedScore: 65,
    strengths: ['SVD-XT support', 'Custom configs', 'Community models'],
    weaknesses: ['Cold start delays'],
  },

  // ==========================================
  // AVATAR & LIP-SYNC PROVIDERS
  // ==========================================
  alibaba_wan_animate: {
    id: 'alibaba_wan_animate',
    name: 'Alibaba WAN 2.2 Animate',
    capabilities: ['video_gen', 'avatar', 'lipsync', 'character_animation'],
    secretKey: 'ALIBABA_API_KEY',
    isConfigured: true,
    priority: 1, // PRIMARY for Avatar/Lipsync
    costPerUnit: 0.01,
    qualityScore: 88,
    speedScore: 80,
    supportedLanguages: ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de'],
    strengths: ['Free/open-source', 'Realistic animations', 'Motion transfer', 'Lip-sync', 'CJK optimized'],
    weaknesses: ['Requires image input'],
  },
  azure_video: {
    id: 'azure_video',
    name: 'Azure Video AI',
    capabilities: ['video_gen', 'avatar', 'lipsync'],
    secretKey: 'AZURE_SPEECH_KEY',
    isConfigured: true,
    priority: 2,
    costPerUnit: 0.03,
    qualityScore: 92,
    speedScore: 65,
    strengths: ['Enterprise-grade', 'Viseme lip-sync', 'Neural TTS integration', 'HIPAA compliant'],
    weaknesses: ['Requires Azure subscription', 'Higher cost'],
  },
  deepseek_video: {
    id: 'deepseek_video',
    name: 'DeepSeek Video',
    capabilities: ['video_gen', 'avatar'],
    secretKey: 'DEEPSEEK_API_KEY',
    isConfigured: true,
    priority: 3,
    costPerUnit: 0.01,
    qualityScore: 80,
    speedScore: 78,
    supportedLanguages: ['zh', 'en', 'ja', 'ko'],
    strengths: ['Low cost', 'CJK optimized', 'Technical content', 'Vision understanding'],
    weaknesses: ['Newer model', 'Limited avatar styles'],
  },

  // ==========================================
  // PREMIUM VIDEO PROVIDERS
  // ==========================================
  gemini_veo: {
    id: 'gemini_veo',
    name: 'Google Gemini Veo',
    capabilities: ['video_gen', 'text_to_video'],
    secretKey: 'GEMINI_API_KEY',
    isConfigured: true,
    priority: 2,
    costPerUnit: 0.05,
    qualityScore: 94,
    speedScore: 60,
    strengths: ['High quality', 'Longer duration', 'Veo 2 architecture'],
    weaknesses: ['Limited availability', 'Premium pricing'],
  },
  openai_sora: {
    id: 'openai_sora',
    name: 'OpenAI Sora',
    capabilities: ['video_gen', 'text_to_video'],
    secretKey: 'OPENAI_API_KEY',
    isConfigured: false, // Limited availability
    priority: 1,
    costPerUnit: 0.10,
    qualityScore: 98,
    speedScore: 40,
    strengths: ['Best quality', '4K output', '20s clips', 'Complex scenes'],
    weaknesses: ['Limited access', 'Expensive', 'Slow'],
  },
  runway_gen3: {
    id: 'runway_gen3',
    name: 'Runway Gen-3 Alpha',
    capabilities: ['video_gen', 'text_to_video', 'image_to_video'],
    secretKey: 'RUNWAY_API_KEY',
    isConfigured: false,
    priority: 3,
    costPerUnit: 0.08,
    qualityScore: 96,
    speedScore: 50,
    strengths: ['Excellent quality', 'Motion control', 'Text rendering'],
    weaknesses: ['Premium pricing', 'API waitlist'],
  },
  pika_labs: {
    id: 'pika_labs',
    name: 'Pika Labs',
    capabilities: ['video_gen', 'text_to_video', 'image_to_video'],
    secretKey: 'PIKA_API_KEY',
    isConfigured: false,
    priority: 4,
    costPerUnit: 0.06,
    qualityScore: 92,
    speedScore: 65,
    strengths: ['Good quality', 'Creative styles', 'Fast'],
    weaknesses: ['4s max duration', 'Limited API'],
  },

  // ==========================================
  // BUDGET/REGIONAL PROVIDERS
  // ==========================================
  alibaba_wanx_video: {
    id: 'alibaba_wanx_video',
    name: 'Alibaba Wanx Video',
    capabilities: ['video_gen', 'text_to_video'],
    secretKey: 'ALIBABA_API_KEY',
    isConfigured: true,
    priority: 5,
    costPerUnit: 0.02,
    qualityScore: 82,
    speedScore: 75,
    supportedLanguages: ['zh', 'en', 'ja', 'ko'],
    strengths: ['Low cost', 'Good for CJK content', 'Fast'],
    weaknesses: ['Lower resolution'],
  },
  replicate: {
    id: 'replicate',
    name: 'Replicate Video',
    capabilities: ['video_gen', 'text_to_video', 'image_to_video'],
    secretKey: 'REPLICATE_API_TOKEN',
    isConfigured: true,
    priority: 6,
    costPerUnit: 0.04,
    qualityScore: 85,
    speedScore: 65,
    strengths: ['Many models', 'Custom configs', 'Pay-per-use'],
    weaknesses: ['Cold start delays', 'Variable quality'],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getVideoProvider(providerId: VideoGenProvider): MediaProviderConfig | undefined {
  return VIDEO_GEN_PROVIDERS[providerId];
}

export function getConfiguredVideoProviders(): MediaProviderConfig[] {
  return Object.values(VIDEO_GEN_PROVIDERS)
    .filter(p => p.isConfigured)
    .sort((a, b) => a.priority - b.priority);
}

export function getVideoProvidersByCapability(capability: MediaCapability): MediaProviderConfig[] {
  return Object.values(VIDEO_GEN_PROVIDERS)
    .filter(p => p.capabilities.includes(capability) && p.isConfigured)
    .sort((a, b) => a.priority - b.priority);
}

// Get AnimateDiff providers (all providers supporting animatediff)
export function getAnimateDiffProviders(): MediaProviderConfig[] {
  return getVideoProvidersByCapability('animatediff');
}

// Get SVD providers (all providers supporting SVD)
export function getSVDProviders(): MediaProviderConfig[] {
  return getVideoProvidersByCapability('svd');
}

// Get Avatar/Lipsync providers
export function getAvatarProviders(): MediaProviderConfig[] {
  return getVideoProvidersByCapability('avatar');
}

export function getLipsyncProviders(): MediaProviderConfig[] {
  return getVideoProvidersByCapability('lipsync');
}

// Get best provider for language context
export function getVideoProviderForLanguage(language: string, capability: string = 'video_gen'): MediaProviderConfig | undefined {
  const providers = getVideoProvidersByCapability(capability);
  const cjkLanguages = ['zh', 'ja', 'ko', 'zh-CN', 'zh-TW'];
  
  if (cjkLanguages.some(l => language.startsWith(l))) {
    // Prioritize Alibaba/DeepSeek for CJK
    return providers.find(p => p.id.includes('alibaba') || p.id.includes('deepseek')) || providers[0];
  }
  
  return providers[0]; // Return highest priority configured provider
}

// Provider tier mapping for UI display
export const VIDEO_PROVIDER_TIERS = {
  // AnimateDiff tiers
  animatediff: {
    tier1: ['modelslab_animatediff'] as VideoGenProvider[],
    tier2: ['alibaba_animatediff', 'azure_animatediff', 'google_animatediff', 'replicate_animatediff'] as VideoGenProvider[],
    tier3: ['deepseek_animatediff'] as VideoGenProvider[],
  },
  // SVD tiers
  svd: {
    tier1: ['modelslab_svd', 'google_svd'] as VideoGenProvider[],
    tier2: ['alibaba_svd', 'azure_svd', 'replicate_svd'] as VideoGenProvider[],
    tier3: ['deepseek_svd'] as VideoGenProvider[],
  },
  // Avatar/Lipsync tiers
  avatar: {
    tier1: ['alibaba_wan_animate'] as VideoGenProvider[],
    tier2: ['azure_video'] as VideoGenProvider[],
    tier3: ['deepseek_video'] as VideoGenProvider[],
  },
  // Premium video
  premium: {
    tier1: ['openai_sora', 'gemini_veo'] as VideoGenProvider[],
    tier2: ['runway_gen3', 'pika_labs'] as VideoGenProvider[],
    tier3: ['alibaba_wanx_video', 'replicate'] as VideoGenProvider[],
  },
};

// Scoring weights for recommendation engine
export const VIDEO_SCORING_WEIGHTS = {
  quality: { quality: 0.5, speed: 0.2, cost: 0.3 },
  speed: { quality: 0.2, speed: 0.5, cost: 0.3 },
  budget: { quality: 0.2, speed: 0.3, cost: 0.5 },
  balanced: { quality: 0.34, speed: 0.33, cost: 0.33 },
};

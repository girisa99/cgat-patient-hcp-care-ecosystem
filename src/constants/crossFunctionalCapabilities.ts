/**
 * Cross-Functional Capability Registry
 * 
 * Single source of truth for capabilities that span multiple products.
 * Each capability maps to compatible products, providers, and tier requirements.
 * 
 * Architecture: Unified Capability Registry Pattern
 * - Add capability once, auto-propagate to all compatible products
 * - Products query their compatible capabilities dynamically
 * - No duplication across product definitions
 */

import { GenieProduct } from './genie-products';

export type CapabilityCategory = 
  | 'avatar'
  | 'immersive'
  | 'audio'
  | 'video'
  | 'localization'
  | 'collaboration'
  | 'distribution';

export type CapabilityTier = 'free' | 'pro' | 'enterprise';

export interface CrossFunctionalCapability {
  id: string;
  name: string;
  description: string;
  category: CapabilityCategory;
  tier: CapabilityTier;
  compatibleProducts: GenieProduct[];
  primaryProviders: string[];
  fallbackProviders: string[];
  pipelineIds: string[];
  editorType: 'canvas' | 'timeline' | 'hybrid' | 'none';
  wizardSteps: number[]; // Which wizard steps can use this capability
  creditMultiplier: number; // 1x = standard, 2x-5x for premium
}

/**
 * UNIFIED CAPABILITY REGISTRY
 * All cross-functional capabilities that work across multiple products
 */
export const CROSS_FUNCTIONAL_CAPABILITIES: CrossFunctionalCapability[] = [
  // ============================================
  // AVATAR CAPABILITIES
  // ============================================
  {
    id: 'ai-avatar',
    name: 'AI Avatar',
    description: 'AI-generated talking head avatars for video narration',
    category: 'avatar',
    tier: 'pro',
    compatibleProducts: ['vibe', 'deck', 'cast'],
    primaryProviders: ['Alibaba Wan2.2'],
    fallbackProviders: ['Replicate', 'ModelsLab'],
    pipelineIds: ['text-to-avatar', 'script-to-avatar', 'image-to-avatar'],
    editorType: 'timeline',
    wizardSteps: [5, 6, 7],
    creditMultiplier: 3.0,
  },
  {
    id: 'full-body-avatar',
    name: 'Full-Body Avatar',
    description: 'Full-body AI avatar with gestures and movement',
    category: 'avatar',
    tier: 'enterprise',
    compatibleProducts: ['vibe', 'cast'],
    primaryProviders: ['Alibaba OmniAvatar'],
    fallbackProviders: [],
    pipelineIds: ['full-body-avatar', 'presenter-avatar'],
    editorType: 'timeline',
    wizardSteps: [5, 6, 7],
    creditMultiplier: 5.0,
  },
  {
    id: 'lip-sync',
    name: 'Lip-Sync',
    description: 'Synchronize audio to video with realistic lip movements',
    category: 'avatar',
    tier: 'pro',
    compatibleProducts: ['vibe', 'cast'],
    primaryProviders: ['Azure Visemes', 'Alibaba Wan2.2'],
    fallbackProviders: ['Replicate'],
    pipelineIds: ['audio-to-lipsync', 'voice-to-lipsync', 'dub-lipsync'],
    editorType: 'timeline',
    wizardSteps: [5, 6, 7],
    creditMultiplier: 2.5,
  },
  
  // ============================================
  // 3D & IMMERSIVE CAPABILITIES
  // ============================================
  {
    id: '3d-models',
    name: '3D Model Generation',
    description: 'Generate 3D models from text or images',
    category: 'immersive',
    tier: 'enterprise',
    compatibleProducts: ['deck', 'vibe', 'cast'],
    primaryProviders: ['Meshy AI', 'ModelsLab 3D'],
    fallbackProviders: ['Tripo3D'],
    pipelineIds: ['text-to-3d', 'image-to-3d', 'product-to-3d'],
    editorType: 'canvas',
    wizardSteps: [4, 5, 7],
    creditMultiplier: 4.0,
  },
  {
    id: '3d-scenes',
    name: '3D Scene Composition',
    description: 'Create interactive 3D scenes and environments',
    category: 'immersive',
    tier: 'enterprise',
    compatibleProducts: ['deck', 'vibe'],
    primaryProviders: ['Three.js', 'Babylon.js'],
    fallbackProviders: [],
    pipelineIds: ['3d-scene-composition', '3d-environment'],
    editorType: 'canvas',
    wizardSteps: [4, 5, 7],
    creditMultiplier: 4.0,
  },
  {
    id: 'ar-experience',
    name: 'AR Experience',
    description: 'Augmented reality overlays and interactions',
    category: 'immersive',
    tier: 'enterprise',
    compatibleProducts: ['deck', 'vibe', 'cast'],
    primaryProviders: ['A-Frame', 'Three.js'],
    fallbackProviders: [],
    pipelineIds: ['ar-overlay', 'ar-product-demo'],
    editorType: 'canvas',
    wizardSteps: [4, 5, 7],
    creditMultiplier: 4.5,
  },
  {
    id: 'vr-experience',
    name: 'VR Experience',
    description: 'Immersive virtual reality presentations',
    category: 'immersive',
    tier: 'enterprise',
    compatibleProducts: ['deck', 'vibe'],
    primaryProviders: ['A-Frame', 'Three.js'],
    fallbackProviders: [],
    pipelineIds: ['vr-presentation', 'vr-tour', 'vr-training'],
    editorType: 'canvas',
    wizardSteps: [4, 5, 7],
    creditMultiplier: 5.0,
  },
  
  // ============================================
  // ANIMATION CAPABILITIES
  // ============================================
  {
    id: 'motion-graphics',
    name: 'Motion Graphics',
    description: 'Animated graphics, titles, and transitions',
    category: 'immersive',
    tier: 'pro',
    compatibleProducts: ['deck', 'vibe', 'cast'],
    primaryProviders: ['Framer Motion', 'GSAP'],
    fallbackProviders: [],
    pipelineIds: ['kinetic-typography', 'animated-infographic', 'motion-logo'],
    editorType: 'timeline',
    wizardSteps: [4, 5, 7],
    creditMultiplier: 2.0,
  },
  {
    id: 'animated-charts',
    name: 'Animated Data Visualization',
    description: 'Dynamic charts and data animations',
    category: 'immersive',
    tier: 'pro',
    compatibleProducts: ['deck', 'vibe'],
    primaryProviders: ['D3.js', 'Recharts'],
    fallbackProviders: [],
    pipelineIds: ['animated-chart', 'data-animation', 'timeline-viz'],
    editorType: 'canvas',
    wizardSteps: [4, 5, 7],
    creditMultiplier: 1.5,
  },
  
  // ============================================
  // AUDIO CAPABILITIES
  // ============================================
  {
    id: 'tts',
    name: 'Text-to-Speech',
    description: 'AI voiceover generation in 70+ languages',
    category: 'audio',
    tier: 'free',
    compatibleProducts: ['mind', 'vibe', 'deck', 'cast'],
    primaryProviders: ['ElevenLabs', 'Azure', 'Alibaba Qwen3-TTS'],
    fallbackProviders: ['Google TTS', 'Amazon Polly'],
    pipelineIds: ['text-to-speech', 'script-to-voiceover', 'multilingual-tts'],
    editorType: 'timeline',
    wizardSteps: [5, 6],
    creditMultiplier: 1.0,
  },
  {
    id: 'voice-cloning',
    name: 'Voice Cloning',
    description: 'Clone voices for consistent narration',
    category: 'audio',
    tier: 'pro',
    compatibleProducts: ['mind', 'vibe', 'cast'],
    primaryProviders: ['ElevenLabs'],
    fallbackProviders: ['Azure Custom Voice'],
    pipelineIds: ['voice-clone', 'custom-voice', 'voice-profile'],
    editorType: 'timeline',
    wizardSteps: [5, 6],
    creditMultiplier: 2.5,
  },
  {
    id: 'music-generation',
    name: 'AI Music Generation',
    description: 'Generate background music and soundtracks',
    category: 'audio',
    tier: 'pro',
    compatibleProducts: ['mind', 'vibe', 'deck'],
    primaryProviders: ['ElevenLabs', 'ModelsLab Audio'],
    fallbackProviders: ['Alibaba'],
    pipelineIds: ['text-to-music', 'mood-to-music', 'background-score'],
    editorType: 'timeline',
    wizardSteps: [5, 6],
    creditMultiplier: 2.0,
  },
  {
    id: 'sfx',
    name: 'Sound Effects',
    description: 'AI-generated sound effects and foley',
    category: 'audio',
    tier: 'pro',
    compatibleProducts: ['vibe', 'deck'],
    primaryProviders: ['ElevenLabs', 'ModelsLab'],
    fallbackProviders: [],
    pipelineIds: ['text-to-sfx', 'scene-sfx'],
    editorType: 'timeline',
    wizardSteps: [5, 6],
    creditMultiplier: 1.5,
  },
  {
    id: 'stt',
    name: 'Speech-to-Text',
    description: 'Transcription and captioning',
    category: 'audio',
    tier: 'free',
    compatibleProducts: ['spark', 'vibe', 'cast'],
    primaryProviders: ['Deepgram', 'Azure STT', 'Google STT'],
    fallbackProviders: ['OpenAI Whisper', 'Alibaba Paraformer'],
    pipelineIds: ['speech-to-text', 'auto-caption', 'transcription'],
    editorType: 'none',
    wizardSteps: [0, 7],
    creditMultiplier: 1.0,
  },
  
  // ============================================
  // VIDEO CAPABILITIES
  // ============================================
  {
    id: 'video-generation',
    name: 'AI Video Generation',
    description: 'Generate video from text, image, or script',
    category: 'video',
    tier: 'pro',
    compatibleProducts: ['vibe', 'deck', 'cast'],
    primaryProviders: ['Sora2API', 'ModelsLab', 'Alibaba Wan2.2'],
    fallbackProviders: ['Replicate', 'Gemini Veo'],
    pipelineIds: ['text-to-video', 'image-to-video', 'script-to-video'],
    editorType: 'timeline',
    wizardSteps: [6, 7],
    creditMultiplier: 3.0,
  },
  {
    id: 'video-editing',
    name: 'Video Editing',
    description: 'Trim, crop, stitch, and enhance video',
    category: 'video',
    tier: 'free',
    compatibleProducts: ['vibe'],
    primaryProviders: ['FFmpeg'],
    fallbackProviders: [],
    pipelineIds: ['video-trim', 'video-crop', 'video-stitch', 'video-enhance'],
    editorType: 'timeline',
    wizardSteps: [7],
    creditMultiplier: 1.0,
  },
  {
    id: 'podcast',
    name: 'Podcast Production',
    description: 'Record, edit, and produce podcasts',
    category: 'video',
    tier: 'pro',
    compatibleProducts: ['vibe', 'cast'],
    primaryProviders: ['FFmpeg', 'ElevenLabs'],
    fallbackProviders: [],
    pipelineIds: ['podcast-record', 'podcast-edit', 'podcast-enhance', 'podcast-publish'],
    editorType: 'timeline',
    wizardSteps: [0, 5, 6, 7],
    creditMultiplier: 1.5,
  },
  {
    id: 'webcast',
    name: 'Webcast Production',
    description: 'Live streaming and webinar production',
    category: 'video',
    tier: 'enterprise',
    compatibleProducts: ['vibe', 'arc', 'cast'],
    primaryProviders: ['FFmpeg', 'Custom'],
    fallbackProviders: [],
    pipelineIds: ['webcast-setup', 'webcast-stream', 'webcast-record'],
    editorType: 'timeline',
    wizardSteps: [6, 7],
    creditMultiplier: 2.0,
  },
  
  // ============================================
  // LOCALIZATION CAPABILITIES
  // ============================================
  {
    id: 'dubbing',
    name: 'Multi-Language Dubbing',
    description: 'Dub videos into 70+ languages with voice sync',
    category: 'localization',
    tier: 'pro',
    compatibleProducts: ['vibe', 'cast'],
    primaryProviders: ['ElevenLabs', 'Azure', 'Alibaba Qwen3-TTS'],
    fallbackProviders: [],
    pipelineIds: ['dub-video', 'multilingual-dub', 'voice-replacement'],
    editorType: 'timeline',
    wizardSteps: [1, 5, 6, 7],
    creditMultiplier: 2.5,
  },
  {
    id: 'translation',
    name: 'Content Translation',
    description: 'Translate text, scripts, and captions',
    category: 'localization',
    tier: 'free',
    compatibleProducts: ['spark', 'mind', 'deck', 'cast'],
    primaryProviders: ['DeepL', 'Google Translate', 'Alibaba Qwen-MT'],
    fallbackProviders: ['Azure Translator'],
    pipelineIds: ['text-translation', 'script-translation', 'caption-translation'],
    editorType: 'none',
    wizardSteps: [1, 7],
    creditMultiplier: 1.0,
  },
  {
    id: 'regional-localization',
    name: 'Regional Localization',
    description: 'Adapt content for 14 regional markets',
    category: 'localization',
    tier: 'enterprise',
    compatibleProducts: ['cast'],
    primaryProviders: ['Multi-provider'],
    fallbackProviders: [],
    pipelineIds: ['regional-adaptation', 'cultural-localization', 'market-optimization'],
    editorType: 'none',
    wizardSteps: [1, 8],
    creditMultiplier: 2.0,
  },
  
  // ============================================
  // DISTRIBUTION CAPABILITIES
  // ============================================
  {
    id: 'social-publishing',
    name: 'Multi-Platform Publishing',
    description: 'Publish to YouTube, LinkedIn, TikTok, Instagram, X',
    category: 'distribution',
    tier: 'pro',
    compatibleProducts: ['cast'],
    primaryProviders: ['Platform APIs'],
    fallbackProviders: [],
    pipelineIds: ['youtube-publish', 'linkedin-publish', 'tiktok-publish', 'instagram-publish', 'x-publish'],
    editorType: 'none',
    wizardSteps: [8],
    creditMultiplier: 1.0,
  },
  {
    id: 'scheduled-distribution',
    name: 'Scheduled Distribution',
    description: 'Automated content scheduling across platforms',
    category: 'distribution',
    tier: 'pro',
    compatibleProducts: ['cast', 'arc'],
    primaryProviders: ['Internal Scheduler'],
    fallbackProviders: [],
    pipelineIds: ['schedule-post', 'content-calendar', 'auto-publish'],
    editorType: 'none',
    wizardSteps: [8],
    creditMultiplier: 1.0,
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get capabilities by product
 */
export const getCapabilitiesByProduct = (product: GenieProduct): CrossFunctionalCapability[] => {
  return CROSS_FUNCTIONAL_CAPABILITIES.filter(c => c.compatibleProducts.includes(product));
};

/**
 * Get capabilities by category
 */
export const getCapabilitiesByCategory = (category: CapabilityCategory): CrossFunctionalCapability[] => {
  return CROSS_FUNCTIONAL_CAPABILITIES.filter(c => c.category === category);
};

/**
 * Get capabilities by tier
 */
export const getCapabilitiesByTier = (tier: CapabilityTier): CrossFunctionalCapability[] => {
  const tierOrder: CapabilityTier[] = ['free', 'pro', 'enterprise'];
  const tierIndex = tierOrder.indexOf(tier);
  return CROSS_FUNCTIONAL_CAPABILITIES.filter(c => tierOrder.indexOf(c.tier) <= tierIndex);
};

/**
 * Get capabilities available at wizard step
 */
export const getCapabilitiesByWizardStep = (step: number): CrossFunctionalCapability[] => {
  return CROSS_FUNCTIONAL_CAPABILITIES.filter(c => c.wizardSteps.includes(step));
};

/**
 * Get capability by ID
 */
export const getCapabilityById = (id: string): CrossFunctionalCapability | undefined => {
  return CROSS_FUNCTIONAL_CAPABILITIES.find(c => c.id === id);
};

/**
 * Get products that support a specific capability
 */
export const getProductsForCapability = (capabilityId: string): GenieProduct[] => {
  const capability = getCapabilityById(capabilityId);
  return capability?.compatibleProducts || [];
};

/**
 * Check if product supports capability
 */
export const productSupportsCapability = (product: GenieProduct, capabilityId: string): boolean => {
  const capability = getCapabilityById(capabilityId);
  return capability?.compatibleProducts.includes(product) || false;
};

/**
 * Get editor type for capability
 */
export const getEditorTypeForCapability = (capabilityId: string): 'canvas' | 'timeline' | 'hybrid' | 'none' => {
  const capability = getCapabilityById(capabilityId);
  return capability?.editorType || 'none';
};

/**
 * Calculate credit cost for capability usage
 */
export const getCapabilityCreditCost = (capabilityId: string, baseCost: number): number => {
  const capability = getCapabilityById(capabilityId);
  return baseCost * (capability?.creditMultiplier || 1.0);
};

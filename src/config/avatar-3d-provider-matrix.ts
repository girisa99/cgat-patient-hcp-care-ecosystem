/**
 * AVATAR & 3D PROVIDER MATRIX
 * 
 * Comprehensive mapping of all avatar, animation, and 3D generation providers
 * across Alibaba, Meshy, ModelsLab, and DeepSeek
 */

// ================================
// ALIBABA AVATAR & ANIMATION MODELS
// ================================
export interface AlibabaAvatarModel {
  id: string;
  name: string;
  type: 'avatar' | 'animation' | '3d' | 'video' | 'speech-to-video';
  description: string;
  capabilities: string[];
  inputTypes: string[];
  outputFormats: string[];
  fps?: number;
  latency: 'realtime' | 'fast' | 'medium' | 'slow';
  tier: 'standard' | 'premium' | 'enterprise';
}

export const ALIBABA_AVATAR_MODELS: AlibabaAvatarModel[] = [
  // Wan2.2 Series
  {
    id: 'wan2.2-animate',
    name: 'Wan2.2-Animate',
    type: 'animation',
    description: 'Digital Human Video Generation - Premier open-source model for character animation',
    capabilities: [
      'Character replacement in videos',
      'Motion transfer from reference video',
      'Expression preservation',
      'Lighting adaptation',
      'Realistic motion generation'
    ],
    inputTypes: ['image', 'video_reference'],
    outputFormats: ['mp4', 'webm'],
    latency: 'medium',
    tier: 'premium'
  },
  {
    id: 'wan2.2-s2v',
    name: 'Wan2.2-S2V (Speech-to-Video)',
    type: 'speech-to-video',
    description: 'Film-quality avatars capable of speaking, singing, and performing',
    capabilities: [
      'Portrait perspective',
      'Bust perspective',
      'Full-body perspective',
      'Audio-driven lip-sync',
      'Singing capability',
      'Performance animation'
    ],
    inputTypes: ['portrait_image', 'audio'],
    outputFormats: ['mp4', 'webm'],
    latency: 'medium',
    tier: 'premium'
  },
  
  // TaoAvatar
  {
    id: 'taoavatar',
    name: 'TaoAvatar',
    type: '3d',
    description: 'High-performance 3D full-body avatars for AR using 3D Gaussian Splatting',
    capabilities: [
      '90 FPS rendering',
      'Real-time interaction',
      'Apple Vision Pro support',
      '3D Gaussian Splatting',
      'Full-body avatar',
      'AR integration'
    ],
    inputTypes: ['image', 'scan'],
    outputFormats: ['glb', 'gltf', 'usdz'],
    fps: 90,
    latency: 'realtime',
    tier: 'enterprise'
  },
  
  // Make-A-Character (MACH)
  {
    id: 'mach',
    name: 'Make-A-Character (MACH)',
    type: '3d',
    description: 'Text-to-3D model for generating detailed 3D avatars from text descriptions',
    capabilities: [
      'Text-to-3D generation',
      'Detailed avatar creation',
      'Low barrier entry',
      'Virtual human generation'
    ],
    inputTypes: ['text'],
    outputFormats: ['glb', 'gltf', 'fbx'],
    latency: 'medium',
    tier: 'standard'
  },
  
  // 3D Animate Hub
  {
    id: '3d-animate-hub',
    name: '3D Animate Hub',
    type: 'avatar',
    description: 'Photo to 3D character conversion with animation options for social media',
    capabilities: [
      'Photo to 3D conversion',
      'Character animation',
      'Social media optimization',
      'Multiple animation styles'
    ],
    inputTypes: ['photo'],
    outputFormats: ['mp4', 'gif', 'webm'],
    latency: 'fast',
    tier: 'standard'
  },
  
  // Animate3D
  {
    id: 'animate3d',
    name: 'Animate3D',
    type: 'animation',
    description: 'Framework for animating static 3D models using multi-view video diffusion',
    capabilities: [
      'Static 3D model animation',
      'Multi-view video diffusion',
      'Gaming integration',
      'Film production',
      'VR scene animation'
    ],
    inputTypes: ['3d_model', 'video_reference'],
    outputFormats: ['fbx', 'glb', 'mp4'],
    latency: 'slow',
    tier: 'premium'
  },
  
  // Richdreamer
  {
    id: 'richdreamer',
    name: 'Richdreamer',
    type: '3d',
    description: '2D-to-3D generation using normal-depth diffusion',
    capabilities: [
      '2D to 3D conversion',
      'Normal-depth diffusion',
      'High-quality mesh generation',
      'Texture generation'
    ],
    inputTypes: ['image'],
    outputFormats: ['glb', 'obj', 'fbx'],
    latency: 'medium',
    tier: 'standard'
  },
  
  // OmniAvatar (Existing)
  {
    id: 'omni-avatar',
    name: 'OmniAvatar',
    type: 'avatar',
    description: 'Real-time audio-driven avatar with live streaming capability',
    capabilities: [
      'Audio-driven animation',
      'Real-time interaction',
      'Live streaming support',
      'Emotional expression',
      'Multi-language support'
    ],
    inputTypes: ['audio', 'text'],
    outputFormats: ['webrtc', 'mp4'],
    latency: 'realtime',
    tier: 'premium'
  },
];

// ================================
// MESHY 3D MODELS
// ================================
export interface Meshy3DModel {
  id: string;
  name: string;
  type: 'text-to-3d' | 'image-to-3d' | 'texture';
  description: string;
  capabilities: string[];
  latency: 'fast' | 'medium' | 'slow';
  tier: 'standard' | 'premium';
}

export const MESHY_3D_MODELS: Meshy3DModel[] = [
  {
    id: 'meshy-text-to-3d',
    name: 'Meshy Text-to-3D',
    type: 'text-to-3d',
    description: 'Generate 3D models from text descriptions',
    capabilities: [
      'Text prompt to 3D',
      'Multiple styles',
      'PBR textures',
      'Animation-ready output'
    ],
    latency: 'medium',
    tier: 'standard'
  },
  {
    id: 'meshy-image-to-3d',
    name: 'Meshy Image-to-3D',
    type: 'image-to-3d',
    description: 'Convert 2D images to 3D models',
    capabilities: [
      'Single image to 3D',
      'Multi-view synthesis',
      'Texture mapping',
      'Normal map generation'
    ],
    latency: 'medium',
    tier: 'standard'
  },
  {
    id: 'meshy-texture',
    name: 'Meshy AI Texturing',
    type: 'texture',
    description: 'Generate and apply AI textures to 3D models',
    capabilities: [
      'AI texture generation',
      'PBR material creation',
      'Style transfer',
      'Seamless textures'
    ],
    latency: 'fast',
    tier: 'standard'
  }
];

// ================================
// MODELSLAB VIDEO/ANIMATION
// ================================
export interface ModelsLabModel {
  id: string;
  name: string;
  type: 'text-to-video' | 'image-to-video' | 'animation' | '3d';
  description: string;
  capabilities: string[];
  latency: 'fast' | 'medium' | 'slow';
  tier: 'standard' | 'premium';
}

export const MODELSLAB_MODELS: ModelsLabModel[] = [
  {
    id: 'animatediff',
    name: 'AnimateDiff',
    type: 'animation',
    description: 'Animate static images with AI-driven motion',
    capabilities: [
      'Image animation',
      'Motion modules',
      'Style consistency',
      'Smooth transitions'
    ],
    latency: 'medium',
    tier: 'standard'
  },
  {
    id: 'svd',
    name: 'Stable Video Diffusion',
    type: 'image-to-video',
    description: 'Generate videos from static images',
    capabilities: [
      'Image to video',
      'Motion prediction',
      'High quality output',
      '14-25 frame generation'
    ],
    latency: 'medium',
    tier: 'premium'
  },
  {
    id: 'modelslab-text2video',
    name: 'ModelsLab Text-to-Video',
    type: 'text-to-video',
    description: 'Generate videos from text prompts',
    capabilities: [
      'Text to video',
      'Multiple styles',
      'Motion control',
      'Scene generation'
    ],
    latency: 'slow',
    tier: 'premium'
  },
  {
    id: 'modelslab-3d',
    name: 'ModelsLab 3D Mesh',
    type: '3d',
    description: 'Generate 3D meshes from text',
    capabilities: [
      'Text to 3D mesh',
      'OBJ/GLB export',
      'Texture generation'
    ],
    latency: 'medium',
    tier: 'standard'
  }
];

// ================================
// DEEPSEEK INTEGRATION
// ================================
export interface DeepSeekCapability {
  id: string;
  name: string;
  type: 'vision' | 'reasoning' | 'code' | 'multimodal';
  description: string;
  useCase: string[];
}

export const DEEPSEEK_CAPABILITIES: DeepSeekCapability[] = [
  {
    id: 'deepseek-v3',
    name: 'DeepSeek-V3',
    type: 'reasoning',
    description: 'Advanced reasoning for complex avatar/animation decisions',
    useCase: [
      'Script analysis for avatar selection',
      'Scene composition planning',
      'Motion sequence generation',
      'Style recommendation'
    ]
  },
  {
    id: 'deepseek-vision',
    name: 'DeepSeek Vision',
    type: 'vision',
    description: 'Visual understanding for avatar/scene analysis',
    useCase: [
      'Reference image analysis',
      'Style extraction',
      'Scene understanding',
      'Character pose analysis'
    ]
  }
];

// ================================
// UNIFIED PROVIDER ROUTING
// ================================
export type AvatarGenerationType = 
  | 'talking_head'
  | 'full_body'
  | 'speech_to_video'
  | '3d_avatar'
  | 'ar_avatar'
  | 'animated_character'
  | 'photo_to_3d';

export type AnimationType =
  | 'lip_sync'
  | 'motion_transfer'
  | 'image_animation'
  | 'video_diffusion'
  | '3d_animation';

export type ThreeDGenerationType =
  | 'text_to_3d'
  | 'image_to_3d'
  | 'mesh_generation'
  | 'texture_generation';

export interface ProviderRecommendation {
  primary: string;
  fallback: string;
  models: string[];
  latency: string;
  quality: 'standard' | 'high' | 'premium';
  cost: 'low' | 'medium' | 'high';
}

export const AVATAR_PROVIDER_ROUTING: Record<AvatarGenerationType, ProviderRecommendation> = {
  talking_head: {
    primary: 'alibaba',
    fallback: 'modelslab',
    models: ['omni-avatar', 'wan2.2-s2v'],
    latency: '5-15s',
    quality: 'premium',
    cost: 'medium'
  },
  full_body: {
    primary: 'alibaba',
    fallback: 'meshy',
    models: ['taoavatar', '3d-animate-hub'],
    latency: '30-60s',
    quality: 'premium',
    cost: 'high'
  },
  speech_to_video: {
    primary: 'alibaba',
    fallback: 'modelslab',
    models: ['wan2.2-s2v'],
    latency: '45-120s',
    quality: 'premium',
    cost: 'high'
  },
  '3d_avatar': {
    primary: 'alibaba',
    fallback: 'meshy',
    models: ['mach', 'meshy-text-to-3d'],
    latency: '30-90s',
    quality: 'high',
    cost: 'medium'
  },
  ar_avatar: {
    primary: 'alibaba',
    fallback: 'meshy',
    models: ['taoavatar'],
    latency: 'realtime',
    quality: 'premium',
    cost: 'high'
  },
  animated_character: {
    primary: 'alibaba',
    fallback: 'modelslab',
    models: ['wan2.2-animate', 'animate3d'],
    latency: '60-180s',
    quality: 'premium',
    cost: 'high'
  },
  photo_to_3d: {
    primary: 'alibaba',
    fallback: 'meshy',
    models: ['3d-animate-hub', 'meshy-image-to-3d'],
    latency: '20-45s',
    quality: 'high',
    cost: 'medium'
  }
};

export const ANIMATION_PROVIDER_ROUTING: Record<AnimationType, ProviderRecommendation> = {
  lip_sync: {
    primary: 'alibaba',
    fallback: 'azure',
    models: ['omni-avatar', 'wan2.2-s2v'],
    latency: '5-10s',
    quality: 'premium',
    cost: 'medium'
  },
  motion_transfer: {
    primary: 'alibaba',
    fallback: 'modelslab',
    models: ['wan2.2-animate'],
    latency: '30-90s',
    quality: 'premium',
    cost: 'high'
  },
  image_animation: {
    primary: 'modelslab',
    fallback: 'alibaba',
    models: ['animatediff', 'svd'],
    latency: '15-45s',
    quality: 'high',
    cost: 'medium'
  },
  video_diffusion: {
    primary: 'modelslab',
    fallback: 'alibaba',
    models: ['svd', 'wan2.2-animate'],
    latency: '30-90s',
    quality: 'premium',
    cost: 'high'
  },
  '3d_animation': {
    primary: 'alibaba',
    fallback: 'meshy',
    models: ['animate3d'],
    latency: '60-180s',
    quality: 'premium',
    cost: 'high'
  }
};

export const THREED_PROVIDER_ROUTING: Record<ThreeDGenerationType, ProviderRecommendation> = {
  text_to_3d: {
    primary: 'meshy',
    fallback: 'modelslab',
    models: ['meshy-text-to-3d', 'modelslab-3d', 'mach'],
    latency: '30-90s',
    quality: 'high',
    cost: 'medium'
  },
  image_to_3d: {
    primary: 'meshy',
    fallback: 'alibaba',
    models: ['meshy-image-to-3d', 'richdreamer'],
    latency: '30-60s',
    quality: 'high',
    cost: 'medium'
  },
  mesh_generation: {
    primary: 'modelslab',
    fallback: 'meshy',
    models: ['modelslab-3d', 'meshy-text-to-3d'],
    latency: '45-120s',
    quality: 'high',
    cost: 'medium'
  },
  texture_generation: {
    primary: 'meshy',
    fallback: 'modelslab',
    models: ['meshy-texture'],
    latency: '10-30s',
    quality: 'high',
    cost: 'low'
  }
};

// ================================
// HELPER FUNCTIONS
// ================================
export function getAvatarProvider(type: AvatarGenerationType): ProviderRecommendation {
  return AVATAR_PROVIDER_ROUTING[type];
}

export function getAnimationProvider(type: AnimationType): ProviderRecommendation {
  return ANIMATION_PROVIDER_ROUTING[type];
}

export function get3DProvider(type: ThreeDGenerationType): ProviderRecommendation {
  return THREED_PROVIDER_ROUTING[type];
}

export function getAllAlibabaModels(): AlibabaAvatarModel[] {
  return ALIBABA_AVATAR_MODELS;
}

export function getAllMeshyModels(): Meshy3DModel[] {
  return MESHY_3D_MODELS;
}

export function getAllModelsLabModels(): ModelsLabModel[] {
  return MODELSLAB_MODELS;
}

export function getDeepSeekCapabilities(): DeepSeekCapability[] {
  return DEEPSEEK_CAPABILITIES;
}

// Get all capabilities for a specific provider
export function getProviderCapabilities(provider: 'alibaba' | 'meshy' | 'modelslab' | 'deepseek'): string[] {
  switch (provider) {
    case 'alibaba':
      return ALIBABA_AVATAR_MODELS.flatMap(m => m.capabilities);
    case 'meshy':
      return MESHY_3D_MODELS.flatMap(m => m.capabilities);
    case 'modelslab':
      return MODELSLAB_MODELS.flatMap(m => m.capabilities);
    case 'deepseek':
      return DEEPSEEK_CAPABILITIES.flatMap(m => m.useCase);
    default:
      return [];
  }
}

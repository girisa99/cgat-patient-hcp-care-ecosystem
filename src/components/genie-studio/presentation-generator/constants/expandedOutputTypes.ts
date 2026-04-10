/**
 * Expanded Output Types with Clear Tiering
 * Separate categories for different media types and export formats
 */

import { IMAGE_MODELS, VIDEO_MODELS, MESH_3D_MODELS, VOICE_MODELS, getTierLabel, getTierColor } from './modelCategories';

// ==========================================
// OUTPUT TYPE DEFINITIONS - EXPANDED
// ==========================================

export type ExpandedOutputType = 
  // Standard Tier (Tier 1)
  | 'pdf-export'           // PDF document export
  | 'pptx-export'          // PowerPoint export
  | '2d-static'            // Static slides (PNG/SVG)
  | 'print-ready'          // High-res print format
  
  // Advanced Tier (Tier 2)
  | '2d-animated'          // Animated slides (CSS/Framer)
  | 'video-short'          // 5-15s video clips
  | '3d-static'            // Static 3D scenes
  | 'web-embed'            // Embeddable web widget
  | 'social-media'         // Social-optimized formats
  
  // Premium Tier (Tier 3)
  | 'video-full'           // Full video presentation
  | '3d-animated'          // Animated 3D scenes
  | 'interactive'          // Interactive web app
  | 'vr-experience'        // VR-ready content
  | 'ar-overlay'           // AR overlay content
  | 'mixed-reality';       // Mixed media output

export interface ExpandedOutputConfig {
  id: ExpandedOutputType;
  name: string;
  description: string;
  tier: 1 | 2 | 3;
  icon: string;
  category: 'document' | 'static' | 'animated' | 'video' | '3d' | 'interactive' | 'immersive';
  
  // Model providers for this output type
  imageModels: string[];
  videoModels: string[];
  mesh3dModels: string[];
  voiceModels: string[];
  
  // Capabilities and features
  capabilities: string[];
  exportFormats: string[];
  
  // Cost and time estimates
  costMultiplier: number;
  estimatedTimeMinutes: { min: number; max: number };
  
  // Requirements
  requiresVoice?: boolean;
  requires3D?: boolean;
  requiresVideo?: boolean;
}

export const EXPANDED_OUTPUT_CONFIGS: ExpandedOutputConfig[] = [
  // ==========================================
  // TIER 1 - STANDARD (Fast, Cost-effective)
  // ==========================================
  {
    id: 'pdf-export',
    name: 'PDF Document',
    description: 'Professional PDF export with vector graphics',
    tier: 1,
    icon: 'FileText',
    category: 'document',
    imageModels: ['gemini-image', 'modelslab-realvision', 'stability-core'],
    videoModels: [],
    mesh3dModels: [],
    voiceModels: [],
    capabilities: ['Vector graphics', 'Print-ready', 'Hyperlinks', 'Accessibility'],
    exportFormats: ['pdf', 'pdf/a'],
    costMultiplier: 1.0,
    estimatedTimeMinutes: { min: 1, max: 3 }
  },
  {
    id: 'pptx-export',
    name: 'PowerPoint',
    description: 'Editable PowerPoint presentation',
    tier: 1,
    icon: 'Presentation',
    category: 'document',
    imageModels: ['gemini-image', 'modelslab-realvision', 'gpt-image-1'],
    videoModels: [],
    mesh3dModels: [],
    voiceModels: [],
    capabilities: ['Editable slides', 'Animations', 'Speaker notes', 'Templates'],
    exportFormats: ['pptx', 'ppt', 'odp'],
    costMultiplier: 1.0,
    estimatedTimeMinutes: { min: 1, max: 3 }
  },
  {
    id: '2d-static',
    name: '2D Static Slides',
    description: 'High-quality static slides with AI images',
    tier: 1,
    icon: 'Image',
    category: 'static',
    imageModels: ['gemini-image', 'modelslab-realvision', 'stability-core', 'gpt-image-1', 'flux-pro'],
    videoModels: [],
    mesh3dModels: [],
    voiceModels: [],
    capabilities: ['PNG export', 'SVG overlay', 'Print-ready', 'Text rendering'],
    exportFormats: ['png', 'svg', 'webp', 'jpg'],
    costMultiplier: 1.0,
    estimatedTimeMinutes: { min: 2, max: 5 }
  },
  {
    id: 'print-ready',
    name: 'Print Ready',
    description: 'High-resolution print-optimized output',
    tier: 1,
    icon: 'Printer',
    category: 'static',
    imageModels: ['flux-pro', 'midjourney-v6', 'gpt-image-1'],
    videoModels: [],
    mesh3dModels: [],
    voiceModels: [],
    capabilities: ['300 DPI', 'CMYK', 'Bleed margins', 'Crop marks'],
    exportFormats: ['pdf', 'tiff', 'eps'],
    costMultiplier: 1.2,
    estimatedTimeMinutes: { min: 3, max: 7 }
  },

  // ==========================================
  // TIER 2 - ADVANCED (Balanced Quality/Speed)
  // ==========================================
  {
    id: '2d-animated',
    name: '2D Animated',
    description: 'Animated slides with motion effects',
    tier: 2,
    icon: 'Sparkles',
    category: 'animated',
    imageModels: ['modelslab-flux', 'flux-pro', 'civitai-sd-xl'],
    videoModels: ['modelslab-animatediff'],
    mesh3dModels: [],
    voiceModels: [],
    capabilities: ['Entry animations', 'Hover effects', 'Scroll triggers', 'Transitions'],
    exportFormats: ['html', 'gif', 'webm', 'lottie'],
    costMultiplier: 1.5,
    estimatedTimeMinutes: { min: 5, max: 12 }
  },
  {
    id: 'video-short',
    name: 'Short Video',
    description: '5-15 second video clips and intros',
    tier: 2,
    icon: 'Video',
    category: 'video',
    imageModels: ['flux-pro', 'modelslab-flux'],
    videoModels: ['modelslab-animatediff', 'modelslab-svd', 'pika-labs', 'kling-ai'],
    mesh3dModels: [],
    voiceModels: ['google-tts', 'openai-tts', 'elevenlabs'],
    capabilities: ['Motion graphics', 'Logo reveals', 'Intros/outros', 'Captions'],
    exportFormats: ['mp4', 'webm', 'mov'],
    costMultiplier: 2.0,
    estimatedTimeMinutes: { min: 5, max: 15 },
    requiresVideo: true
  },
  {
    id: '3d-static',
    name: '3D Static Scenes',
    description: 'Rendered 3D scenes and models',
    tier: 2,
    icon: 'Box',
    category: '3d',
    imageModels: ['modelslab-flux'],
    videoModels: [],
    mesh3dModels: ['modelslab-3d', 'meshy-ai', 'triposr', 'shap-e'],
    voiceModels: [],
    capabilities: ['3D models', 'Scene composition', 'Lighting', 'Camera angles'],
    exportFormats: ['glb', 'gltf', 'obj', 'fbx', 'png'],
    costMultiplier: 2.0,
    estimatedTimeMinutes: { min: 8, max: 20 },
    requires3D: true
  },
  {
    id: 'web-embed',
    name: 'Web Embed',
    description: 'Embeddable web widget for websites',
    tier: 2,
    icon: 'Code',
    category: 'interactive',
    imageModels: ['gemini-image', 'flux-pro'],
    videoModels: [],
    mesh3dModels: [],
    voiceModels: [],
    capabilities: ['Responsive', 'Iframe embed', 'API access', 'Analytics'],
    exportFormats: ['html', 'js', 'iframe'],
    costMultiplier: 1.5,
    estimatedTimeMinutes: { min: 4, max: 10 }
  },
  {
    id: 'social-media',
    name: 'Social Media Pack',
    description: 'Optimized formats for social platforms',
    tier: 2,
    icon: 'Share2',
    category: 'static',
    imageModels: ['flux-pro', 'modelslab-flux', 'gpt-image-1'],
    videoModels: ['modelslab-animatediff'],
    mesh3dModels: [],
    voiceModels: [],
    capabilities: ['Multi-format', 'Platform optimized', 'Stories', 'Carousels'],
    exportFormats: ['png', 'jpg', 'mp4', 'gif'],
    costMultiplier: 1.5,
    estimatedTimeMinutes: { min: 5, max: 12 }
  },

  // ==========================================
  // TIER 3 - PREMIUM (Highest Quality)
  // ==========================================
  {
    id: 'video-full',
    name: 'Full Video',
    description: 'Complete video with voiceover and music',
    tier: 3,
    icon: 'Film',
    category: 'video',
    imageModels: ['flux-pro', 'midjourney-v6', 'alibaba-wanx'],
    videoModels: ['openai-sora', 'runway-gen3', 'luma-dream-machine', 'gemini-veo'],
    mesh3dModels: [],
    voiceModels: ['elevenlabs', 'elevenlabs-ultra', 'azure-neural', 'alibaba-qwen3-tts'],
    capabilities: ['Full narration', 'Scene transitions', 'Background music', 'Multi-language', 'Voice cloning'],
    exportFormats: ['mp4', 'mov', 'webm', 'prores'],
    costMultiplier: 4.0,
    estimatedTimeMinutes: { min: 15, max: 45 },
    requiresVoice: true,
    requiresVideo: true
  },
  {
    id: '3d-animated',
    name: '3D Animated',
    description: 'Full 3D animations with physics',
    tier: 3,
    icon: 'Orbit',
    category: '3d',
    imageModels: ['flux-pro'],
    videoModels: ['runway-gen3'],
    mesh3dModels: ['rodin-gen1', 'luma-genie', 'csm-3d', 'meshy-ai'],
    voiceModels: ['elevenlabs'],
    capabilities: ['Physics simulation', 'Particle effects', '3D transitions', 'Character animation'],
    exportFormats: ['glb', 'gltf', 'mp4', 'webm'],
    costMultiplier: 4.0,
    estimatedTimeMinutes: { min: 20, max: 60 },
    requires3D: true,
    requiresVideo: true
  },
  {
    id: 'interactive',
    name: 'Interactive App',
    description: 'Full interactive web application',
    tier: 3,
    icon: 'MousePointerClick',
    category: 'interactive',
    imageModels: ['flux-pro', 'gpt-image-1'],
    videoModels: ['modelslab-animatediff'],
    mesh3dModels: ['modelslab-3d'],
    voiceModels: ['elevenlabs'],
    capabilities: ['Clickable elements', 'Form inputs', 'Data visualization', 'Real-time updates', 'Gamification'],
    exportFormats: ['html', 'react', 'vue'],
    costMultiplier: 3.5,
    estimatedTimeMinutes: { min: 15, max: 40 }
  },
  {
    id: 'vr-experience',
    name: 'VR Experience',
    description: 'Virtual reality ready content',
    tier: 3,
    icon: 'Glasses',
    category: 'immersive',
    imageModels: ['midjourney-v6', 'flux-pro'],
    videoModels: ['openai-sora'],
    mesh3dModels: ['rodin-gen1', 'csm-3d', 'luma-genie'],
    voiceModels: ['elevenlabs-ultra'],
    capabilities: ['360° content', 'Spatial audio', 'Hand tracking', 'Teleportation'],
    exportFormats: ['glb', 'usdz', 'mp4-360'],
    costMultiplier: 5.0,
    estimatedTimeMinutes: { min: 30, max: 90 },
    requires3D: true,
    requiresVoice: true
  },
  {
    id: 'ar-overlay',
    name: 'AR Overlay',
    description: 'Augmented reality overlay content',
    tier: 3,
    icon: 'Smartphone',
    category: 'immersive',
    imageModels: ['flux-pro'],
    videoModels: ['runway-gen3'],
    mesh3dModels: ['meshy-ai', 'triposr'],
    voiceModels: ['elevenlabs'],
    capabilities: ['Marker-based AR', 'Markerless AR', 'Face filters', 'Product visualization'],
    exportFormats: ['usdz', 'glb', 'reality'],
    costMultiplier: 4.5,
    estimatedTimeMinutes: { min: 20, max: 50 },
    requires3D: true
  },
  {
    id: 'mixed-reality',
    name: 'Mixed Reality',
    description: 'Combination of static, video, 3D, and interactive',
    tier: 3,
    icon: 'Layers',
    category: 'immersive',
    imageModels: ['midjourney-v6', 'flux-pro', 'alibaba-wanx'],
    videoModels: ['openai-sora', 'runway-gen3', 'luma-dream-machine'],
    mesh3dModels: ['rodin-gen1', 'csm-3d'],
    voiceModels: ['elevenlabs-ultra', 'alibaba-qwen3-tts'],
    capabilities: ['Per-slide customization', 'Best-of-breed selection', 'Adaptive quality', 'Multi-format export'],
    exportFormats: ['all'],
    costMultiplier: 5.0,
    estimatedTimeMinutes: { min: 25, max: 75 },
    requires3D: true,
    requiresVoice: true,
    requiresVideo: true
  }
];

// ==========================================
// NEW: AUDIO-ONLY OUTPUTS
// ==========================================

export const AUDIO_OUTPUT_CONFIGS: ExpandedOutputConfig[] = [
  {
    id: 'podcast-mp3' as ExpandedOutputType,
    name: 'Podcast MP3',
    description: 'High-quality podcast audio export',
    tier: 2,
    icon: 'Podcast',
    category: 'audio' as any,
    imageModels: [],
    videoModels: [],
    mesh3dModels: [],
    voiceModels: ['elevenlabs', 'azure-neural', 'google-tts'],
    capabilities: ['Multi-voice', 'Background music', 'Sound effects', 'Chapters'],
    exportFormats: ['mp3', 'wav', 'aac'],
    costMultiplier: 1.5,
    estimatedTimeMinutes: { min: 5, max: 15 },
    requiresVoice: true
  },
  {
    id: 'audiobook' as ExpandedOutputType,
    name: 'Audiobook',
    description: 'Long-form narrated audio content',
    tier: 3,
    icon: 'BookOpen',
    category: 'audio' as any,
    imageModels: [],
    videoModels: [],
    mesh3dModels: [],
    voiceModels: ['elevenlabs-ultra', 'azure-neural', 'alibaba-qwen3-tts'],
    capabilities: ['Voice cloning', 'Chapters', 'Multi-narrator', 'Background score'],
    exportFormats: ['mp3', 'm4b', 'wav'],
    costMultiplier: 3.0,
    estimatedTimeMinutes: { min: 20, max: 60 },
    requiresVoice: true
  },
  {
    id: 'voice-memo' as ExpandedOutputType,
    name: 'Voice Memo',
    description: 'Quick audio summary or note',
    tier: 1,
    icon: 'Mic',
    category: 'audio' as any,
    imageModels: [],
    videoModels: [],
    mesh3dModels: [],
    voiceModels: ['google-tts', 'openai-tts'],
    capabilities: ['Quick export', 'Single voice', 'Compact file'],
    exportFormats: ['mp3', 'wav'],
    costMultiplier: 0.5,
    estimatedTimeMinutes: { min: 1, max: 3 },
    requiresVoice: true
  },
  {
    id: 'sound-design' as ExpandedOutputType,
    name: 'Sound Design',
    description: 'Custom sound effects and audio design',
    tier: 3,
    icon: 'AudioLines',
    category: 'audio' as any,
    imageModels: [],
    videoModels: [],
    mesh3dModels: [],
    voiceModels: ['elevenlabs', 'azure-neural'],
    capabilities: ['SFX', 'Ambient sounds', 'Foley', 'Music beds'],
    exportFormats: ['mp3', 'wav', 'flac'],
    costMultiplier: 2.5,
    estimatedTimeMinutes: { min: 10, max: 30 },
    requiresVoice: false
  }
];

// ==========================================
// NEW: DOCUMENT OUTPUTS
// ==========================================

export const DOCUMENT_OUTPUT_CONFIGS: ExpandedOutputConfig[] = [
  {
    id: 'markdown' as ExpandedOutputType,
    name: 'Markdown',
    description: 'Clean markdown for documentation',
    tier: 1,
    icon: 'FileCode',
    category: 'document',
    imageModels: ['gemini-image'],
    videoModels: [],
    mesh3dModels: [],
    voiceModels: [],
    capabilities: ['GitHub compatible', 'Code blocks', 'Tables', 'Images'],
    exportFormats: ['md', 'mdx'],
    costMultiplier: 0.5,
    estimatedTimeMinutes: { min: 1, max: 2 }
  },
  {
    id: 'latex' as ExpandedOutputType,
    name: 'LaTeX',
    description: 'Academic-quality typeset documents',
    tier: 2,
    icon: 'FileType',
    category: 'document',
    imageModels: ['gemini-image'],
    videoModels: [],
    mesh3dModels: [],
    voiceModels: [],
    capabilities: ['Math equations', 'Citations', 'Figures', 'Tables'],
    exportFormats: ['tex', 'pdf'],
    costMultiplier: 1.2,
    estimatedTimeMinutes: { min: 2, max: 5 }
  },
  {
    id: 'ebook-epub' as ExpandedOutputType,
    name: 'eBook (EPUB)',
    description: 'Digital book format for readers',
    tier: 2,
    icon: 'BookOpen',
    category: 'document',
    imageModels: ['flux-pro', 'modelslab-flux'],
    videoModels: [],
    mesh3dModels: [],
    voiceModels: [],
    capabilities: ['Chapters', 'TOC', 'Reflowable text', 'Cover image'],
    exportFormats: ['epub', 'mobi'],
    costMultiplier: 1.5,
    estimatedTimeMinutes: { min: 5, max: 12 }
  },
  {
    id: 'report-bundle' as ExpandedOutputType,
    name: 'Report Bundle',
    description: 'Complete report package with appendices',
    tier: 2,
    icon: 'FolderArchive',
    category: 'document',
    imageModels: ['flux-pro', 'gemini-image'],
    videoModels: [],
    mesh3dModels: [],
    voiceModels: [],
    capabilities: ['Executive summary', 'Appendices', 'Data tables', 'Charts'],
    exportFormats: ['pdf', 'docx', 'zip'],
    costMultiplier: 2.0,
    estimatedTimeMinutes: { min: 5, max: 15 }
  }
];

// Combined all output configs
export const ALL_OUTPUT_CONFIGS = [
  ...EXPANDED_OUTPUT_CONFIGS,
  ...AUDIO_OUTPUT_CONFIGS,
  ...DOCUMENT_OUTPUT_CONFIGS
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export function getOutputsByTier(tier: 1 | 2 | 3): ExpandedOutputConfig[] {
  return ALL_OUTPUT_CONFIGS.filter(c => c.tier === tier);
}

export function getOutputsByCategory(category: ExpandedOutputConfig['category'] | 'audio'): ExpandedOutputConfig[] {
  return ALL_OUTPUT_CONFIGS.filter(c => c.category === category);
}

export function getOutputById(id: ExpandedOutputType | string): ExpandedOutputConfig | undefined {
  return ALL_OUTPUT_CONFIGS.find(c => c.id === id);
}

export function getRecommendedOutput(hasVoice: boolean, has3D: boolean, hasVideo: boolean): ExpandedOutputConfig[] {
  return ALL_OUTPUT_CONFIGS.filter(c => {
    if (c.requiresVoice && !hasVoice) return false;
    if (c.requires3D && !has3D) return false;
    if (c.requiresVideo && !hasVideo) return false;
    return true;
  });
}

// Group outputs by tier for display
export const OUTPUT_TIERS = {
  standard: getOutputsByTier(1),
  advanced: getOutputsByTier(2),
  premium: getOutputsByTier(3)
};

// Group outputs by category for display
export const OUTPUT_CATEGORIES = {
  document: getOutputsByCategory('document'),
  static: getOutputsByCategory('static'),
  animated: getOutputsByCategory('animated'),
  video: getOutputsByCategory('video'),
  audio: getOutputsByCategory('audio'),
  threeD: getOutputsByCategory('3d'),
  interactive: getOutputsByCategory('interactive'),
  immersive: getOutputsByCategory('immersive')
};

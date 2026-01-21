/**
 * Output Compatibility Service
 * Filters visual features and providers by output type compatibility
 * 
 * Ensures data tables don't appear in video outputs,
 * and 3D meshes only show for compatible output types
 */

import { GlobalTier } from './tierAudioProviderService';

export type OutputCategory = 'document' | 'static' | 'video' | 'immersive' | 'interactive';

export interface OutputTypeConfig {
  id: string;
  name: string;
  category: OutputCategory;
  tier: GlobalTier;
  description: string;
  supportedVisualTypes: VisualType[];
  requiredCapabilities: string[];
  excludedVisualTypes: VisualType[];
  audioRequired: boolean;
  recommendedProviders: {
    image?: string[];
    video?: string[];
    mesh3d?: string[];
    voice?: string[];
  };
}

export type VisualType = 
  | 'chart'
  | 'diagram'
  | 'infographic'
  | 'data-table'
  | 'timeline'
  | 'flowchart'
  | 'hierarchy'
  | 'matrix'
  | 'map'
  | 'icon-grid'
  | 'photo'
  | 'illustration'
  | 'animation-2d'
  | 'animation-3d'
  | 'video-clip'
  | 'mesh-3d'
  | 'particle-effect'
  | 'ar-object';

// Output type configurations with visual compatibility
export const OUTPUT_TYPE_CONFIGS: OutputTypeConfig[] = [
  // ==========================================
  // DOCUMENT OUTPUTS (Tier 1)
  // ==========================================
  {
    id: 'pdf-report',
    name: 'PDF Report',
    category: 'document',
    tier: 1,
    description: 'Static PDF document with charts and tables',
    supportedVisualTypes: ['chart', 'diagram', 'infographic', 'data-table', 'timeline', 'flowchart', 'hierarchy', 'matrix', 'icon-grid', 'photo', 'illustration'],
    excludedVisualTypes: ['animation-2d', 'animation-3d', 'video-clip', 'mesh-3d', 'particle-effect', 'ar-object'],
    requiredCapabilities: ['static-render'],
    audioRequired: false,
    recommendedProviders: {
      image: ['gemini-image', 'stability-core'],
    },
  },
  {
    id: 'pptx-standard',
    name: 'PowerPoint Standard',
    category: 'document',
    tier: 1,
    description: 'Standard PowerPoint presentation',
    supportedVisualTypes: ['chart', 'diagram', 'infographic', 'data-table', 'timeline', 'flowchart', 'hierarchy', 'matrix', 'map', 'icon-grid', 'photo', 'illustration'],
    excludedVisualTypes: ['animation-3d', 'video-clip', 'mesh-3d', 'particle-effect', 'ar-object'],
    requiredCapabilities: ['static-render'],
    audioRequired: false,
    recommendedProviders: {
      image: ['gemini-image', 'modelslab-realvision'],
    },
  },

  // ==========================================
  // STATIC OUTPUTS (Tier 1-2)
  // ==========================================
  {
    id: 'static-slides',
    name: 'Static Slides',
    category: 'static',
    tier: 1,
    description: 'High-quality static slide images',
    supportedVisualTypes: ['chart', 'diagram', 'infographic', 'data-table', 'timeline', 'flowchart', 'hierarchy', 'matrix', 'map', 'icon-grid', 'photo', 'illustration'],
    excludedVisualTypes: ['animation-2d', 'animation-3d', 'video-clip', 'mesh-3d', 'particle-effect', 'ar-object'],
    requiredCapabilities: ['high-res-image'],
    audioRequired: false,
    recommendedProviders: {
      image: ['flux-pro', 'dall-e-3'],
    },
  },
  {
    id: 'infographic-poster',
    name: 'Infographic Poster',
    category: 'static',
    tier: 2,
    description: 'Single-page infographic with data visualization',
    supportedVisualTypes: ['chart', 'diagram', 'infographic', 'data-table', 'timeline', 'flowchart', 'hierarchy', 'matrix', 'icon-grid', 'illustration'],
    excludedVisualTypes: ['animation-2d', 'animation-3d', 'video-clip', 'mesh-3d', 'particle-effect', 'ar-object', 'photo'],
    requiredCapabilities: ['high-res-image', 'text-rendering'],
    audioRequired: false,
    recommendedProviders: {
      image: ['ideogram-v2', 'flux-pro'],
    },
  },

  // ==========================================
  // VIDEO OUTPUTS (Tier 2-3)
  // ==========================================
  {
    id: 'video-intro',
    name: 'Video Intro',
    category: 'video',
    tier: 2,
    description: '30-60 second animated intro',
    supportedVisualTypes: ['chart', 'diagram', 'infographic', 'timeline', 'flowchart', 'icon-grid', 'photo', 'illustration', 'animation-2d'],
    excludedVisualTypes: ['data-table', 'matrix', 'mesh-3d', 'ar-object'], // No data tables in video!
    requiredCapabilities: ['video-render', 'audio-sync'],
    audioRequired: true,
    recommendedProviders: {
      image: ['flux-pro', 'dall-e-3'],
      video: ['modelslab-animatediff', 'pika-labs'],
      voice: ['elevenlabs', 'azure-neural'],
    },
  },
  {
    id: 'video-full',
    name: 'Full Video Presentation',
    category: 'video',
    tier: 3,
    description: 'Complete narrated video with animations',
    supportedVisualTypes: ['chart', 'diagram', 'infographic', 'timeline', 'flowchart', 'icon-grid', 'photo', 'illustration', 'animation-2d', 'animation-3d', 'video-clip'],
    excludedVisualTypes: ['data-table', 'matrix', 'hierarchy', 'ar-object'], // Complex static visuals excluded
    requiredCapabilities: ['video-render', 'audio-sync', 'voiceover', 'music'],
    audioRequired: true,
    recommendedProviders: {
      image: ['midjourney-v6', 'flux-pro'],
      video: ['openai-sora', 'runway-gen3'],
      voice: ['elevenlabs', 'azure-neural-hd'],
    },
  },
  {
    id: '2d-animated',
    name: '2D Animated Slides',
    category: 'video',
    tier: 2,
    description: 'Slides with 2D motion graphics',
    supportedVisualTypes: ['chart', 'diagram', 'infographic', 'timeline', 'flowchart', 'icon-grid', 'illustration', 'animation-2d'],
    excludedVisualTypes: ['data-table', 'matrix', 'mesh-3d', 'particle-effect', 'ar-object', 'photo'],
    requiredCapabilities: ['motion-graphics', 'audio-sync'],
    audioRequired: true,
    recommendedProviders: {
      image: ['dall-e-3', 'flux-pro'],
      video: ['modelslab-animatediff'],
      voice: ['openai-tts', 'azure-neural'],
    },
  },

  // ==========================================
  // IMMERSIVE OUTPUTS (Tier 3)
  // ==========================================
  {
    id: '3d-animated',
    name: '3D Animated Presentation',
    category: 'immersive',
    tier: 3,
    description: '3D animated presentation with spatial design',
    supportedVisualTypes: ['chart', 'diagram', 'infographic', 'flowchart', 'illustration', 'animation-2d', 'animation-3d', 'mesh-3d', 'particle-effect'],
    excludedVisualTypes: ['data-table', 'matrix', 'hierarchy', 'map', 'photo', 'ar-object'],
    requiredCapabilities: ['3d-render', 'audio-sync', 'spatial-audio'],
    audioRequired: true,
    recommendedProviders: {
      image: ['midjourney-v6', 'alibaba-wanx'],
      video: ['runway-gen3', 'luma-dream-machine'],
      mesh3d: ['modelslab-3d', 'rodin-gen1'],
      voice: ['elevenlabs', 'azure-neural-hd'],
    },
  },
  {
    id: 'ar-experience',
    name: 'AR Experience',
    category: 'immersive',
    tier: 3,
    description: 'Augmented reality presentation',
    supportedVisualTypes: ['diagram', 'infographic', 'flowchart', 'illustration', 'animation-3d', 'mesh-3d', 'ar-object'],
    excludedVisualTypes: ['data-table', 'matrix', 'hierarchy', 'timeline', 'map', 'photo', 'chart'],
    requiredCapabilities: ['ar-render', '3d-tracking', 'spatial-audio'],
    audioRequired: true,
    recommendedProviders: {
      mesh3d: ['luma-genie', 'csm-3d', 'rodin-gen1'],
      voice: ['elevenlabs'],
    },
  },

  // ==========================================
  // INTERACTIVE OUTPUTS (Tier 2-3)
  // ==========================================
  {
    id: 'interactive-web',
    name: 'Interactive Web',
    category: 'interactive',
    tier: 2,
    description: 'Web-based interactive presentation',
    supportedVisualTypes: ['chart', 'diagram', 'infographic', 'data-table', 'timeline', 'flowchart', 'hierarchy', 'matrix', 'map', 'icon-grid', 'photo', 'illustration', 'animation-2d'],
    excludedVisualTypes: ['animation-3d', 'mesh-3d', 'particle-effect', 'ar-object', 'video-clip'],
    requiredCapabilities: ['web-render', 'interactivity'],
    audioRequired: false,
    recommendedProviders: {
      image: ['dall-e-3', 'flux-pro'],
    },
  },
];

// Get output type config
export function getOutputTypeConfig(outputTypeId: string): OutputTypeConfig | null {
  return OUTPUT_TYPE_CONFIGS.find(o => o.id === outputTypeId) || null;
}

// Filter visual types by output compatibility
export function filterVisualsByOutput(
  visuals: VisualType[],
  outputTypeId: string
): { supported: VisualType[]; excluded: VisualType[]; reason: Partial<Record<VisualType, string>> } {
  const config = getOutputTypeConfig(outputTypeId);
  
  if (!config) {
    return { supported: visuals, excluded: [], reason: {} };
  }
  
  const supported: VisualType[] = [];
  const excluded: VisualType[] = [];
  const reason: Partial<Record<VisualType, string>> = {};
  
  for (const visual of visuals) {
    if (config.excludedVisualTypes.includes(visual)) {
      excluded.push(visual);
      reason[visual] = `Not compatible with ${config.name} output`;
    } else if (config.supportedVisualTypes.includes(visual)) {
      supported.push(visual);
    } else {
      excluded.push(visual);
      reason[visual] = `Not in supported list for ${config.name}`;
    }
  }
  
  return { supported, excluded, reason };
}

// Get outputs by tier
export function getOutputsByTier(maxTier: GlobalTier): OutputTypeConfig[] {
  return OUTPUT_TYPE_CONFIGS.filter(o => o.tier <= maxTier);
}

// Get outputs by category
export function getOutputsByCategory(category: OutputCategory): OutputTypeConfig[] {
  return OUTPUT_TYPE_CONFIGS.filter(o => o.category === category);
}

// Check if output requires specific capability
export function outputRequiresCapability(
  outputTypeId: string,
  capability: string
): boolean {
  const config = getOutputTypeConfig(outputTypeId);
  return config?.requiredCapabilities.includes(capability) || false;
}

// Get recommended providers for output type
export function getRecommendedProvidersForOutput(
  outputTypeId: string,
  mediaType: 'image' | 'video' | 'mesh3d' | 'voice'
): string[] {
  const config = getOutputTypeConfig(outputTypeId);
  if (!config) return [];
  return config.recommendedProviders[mediaType] || [];
}

// Validate visual selection against output
export function validateVisualsForOutput(
  selectedVisuals: VisualType[],
  outputTypeId: string
): { valid: boolean; warnings: string[]; suggestions: string[] } {
  const { excluded, reason } = filterVisualsByOutput(selectedVisuals, outputTypeId);
  const config = getOutputTypeConfig(outputTypeId);
  
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  if (excluded.length > 0) {
    warnings.push(`${excluded.length} visual type(s) not compatible with ${config?.name || outputTypeId}`);
    for (const visual of excluded) {
      warnings.push(`• ${visual}: ${reason[visual]}`);
    }
  }
  
  // Suggest alternatives
  if (excluded.includes('data-table') && config?.category === 'video') {
    suggestions.push('Consider using animated charts instead of data tables for video output');
  }
  
  if (excluded.includes('mesh-3d') && config?.tier && config.tier < 3) {
    suggestions.push('Upgrade to Premium tier for 3D mesh support');
  }
  
  return {
    valid: excluded.length === 0,
    warnings,
    suggestions,
  };
}

// Get visual type display info
export function getVisualTypeInfo(visual: VisualType): { 
  name: string; 
  icon: string; 
  category: string;
  minTier: GlobalTier;
} {
  const visualInfo: Record<VisualType, { name: string; icon: string; category: string; minTier: GlobalTier }> = {
    'chart': { name: 'Chart', icon: '📊', category: 'Data', minTier: 1 },
    'diagram': { name: 'Diagram', icon: '📐', category: 'Structure', minTier: 1 },
    'infographic': { name: 'Infographic', icon: '📈', category: 'Data', minTier: 1 },
    'data-table': { name: 'Data Table', icon: '📋', category: 'Data', minTier: 1 },
    'timeline': { name: 'Timeline', icon: '⏱️', category: 'Structure', minTier: 1 },
    'flowchart': { name: 'Flowchart', icon: '🔀', category: 'Structure', minTier: 1 },
    'hierarchy': { name: 'Hierarchy', icon: '🏛️', category: 'Structure', minTier: 1 },
    'matrix': { name: 'Matrix', icon: '🔲', category: 'Data', minTier: 1 },
    'map': { name: 'Map', icon: '🗺️', category: 'Geo', minTier: 1 },
    'icon-grid': { name: 'Icon Grid', icon: '🎨', category: 'Visual', minTier: 1 },
    'photo': { name: 'Photo', icon: '📷', category: 'Image', minTier: 1 },
    'illustration': { name: 'Illustration', icon: '🖼️', category: 'Image', minTier: 1 },
    'animation-2d': { name: '2D Animation', icon: '🎬', category: 'Motion', minTier: 2 },
    'animation-3d': { name: '3D Animation', icon: '🎥', category: 'Motion', minTier: 3 },
    'video-clip': { name: 'Video Clip', icon: '📹', category: 'Motion', minTier: 2 },
    'mesh-3d': { name: '3D Mesh', icon: '🧊', category: '3D', minTier: 3 },
    'particle-effect': { name: 'Particle Effect', icon: '✨', category: '3D', minTier: 3 },
    'ar-object': { name: 'AR Object', icon: '👓', category: 'Immersive', minTier: 3 },
  };
  
  return visualInfo[visual] || { name: visual, icon: '❓', category: 'Other', minTier: 1 };
}

// Service export
export const outputCompatibilityService = {
  getOutputTypeConfig,
  filterVisualsByOutput,
  getOutputsByTier,
  getOutputsByCategory,
  outputRequiresCapability,
  getRecommendedProvidersForOutput,
  validateVisualsForOutput,
  getVisualTypeInfo,
  OUTPUT_TYPE_CONFIGS,
};

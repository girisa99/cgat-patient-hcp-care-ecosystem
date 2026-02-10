/**
 * Output Model Selection Service
 * Primary + Override + Multi-Select Pattern
 * 
 * Architecture:
 * - AI picks primary model based on context
 * - User can override with dropdown
 * - User can multi-select for fallback/comparison
 */

import { 
  IMAGE_MODELS, 
  VIDEO_MODELS, 
  MESH_3D_MODELS, 
  VOICE_MODELS,
  getModelsByTier,
  getTierLabel,
  getTierColor,
  type ModelConfig
} from '../constants/modelCategories';

// ==========================================
// TYPES
// ==========================================

export type ModelCategory = 'image' | 'video' | '3d' | 'voice' | 'text';

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  tier: 1 | 2 | 3;
  description?: string;
  capabilities?: string[];
  costMultiplier: number;
  qualityScore: number; // 1-100
  speedScore: number; // 1-100
  isAvailable: boolean;
  requiredSecretKey?: string;
}

export interface ModelSelectionState {
  primary: ModelOption | null;
  overrides: ModelOption[];
  fallbacks: ModelOption[];
}

export interface OutputModelConfig {
  outputId: string;
  category: ModelCategory;
  primaryModel: ModelOption | null;
  primaryReason?: string;
  alternativeModels: ModelOption[];
  selectedOverrides: string[]; // Model IDs selected by user
  selectionMode: 'ai-auto' | 'user-override' | 'multi-select';
}

export interface ModelRecommendation {
  modelId: string;
  score: number; // 0-100
  reason: string;
  isPrimary: boolean;
  isRecommended: boolean;
}

// ==========================================
// MODEL CATALOGS BY CATEGORY
// ==========================================

const IMAGE_MODEL_OPTIONS: ModelOption[] = [
  // Tier 1 - Standard
  { id: 'gemini-image', name: 'Gemini Image', provider: 'Google', tier: 1, costMultiplier: 1.0, qualityScore: 75, speedScore: 95, isAvailable: true, requiredSecretKey: 'GEMINI_API_KEY', capabilities: ['general', 'illustrations'] },
  { id: 'modelslab-realvision', name: 'RealVision XL', provider: 'ModelsLab', tier: 1, costMultiplier: 1.0, qualityScore: 80, speedScore: 85, isAvailable: true, requiredSecretKey: 'MODELSLAB_API_KEY', capabilities: ['photorealistic', 'portraits'] },
  { id: 'stability-core', name: 'Stability Core', provider: 'Stability AI', tier: 1, costMultiplier: 1.2, qualityScore: 78, speedScore: 90, isAvailable: true, requiredSecretKey: 'STABILITY_API_KEY', capabilities: ['general', 'creative'] },
  
  // Tier 2 - Advanced
  { id: 'flux-pro', name: 'Flux Pro', provider: 'Black Forest Labs', tier: 2, costMultiplier: 2.0, qualityScore: 88, speedScore: 75, isAvailable: true, requiredSecretKey: 'FLUX_API_KEY', capabilities: ['photorealistic', 'text-rendering', 'composition'] },
  { id: 'dall-e-3', name: 'DALL-E 3', provider: 'OpenAI', tier: 2, costMultiplier: 2.5, qualityScore: 90, speedScore: 70, isAvailable: true, requiredSecretKey: 'OPENAI_API_KEY', capabilities: ['creative', 'text-in-image', 'composition'] },
  { id: 'modelslab-flux', name: 'ModelsLab Flux', provider: 'ModelsLab', tier: 2, costMultiplier: 1.8, qualityScore: 85, speedScore: 80, isAvailable: true, requiredSecretKey: 'MODELSLAB_API_KEY', capabilities: ['artistic', 'styles'] },
  { id: 'ideogram-v2', name: 'Ideogram v2', provider: 'Ideogram', tier: 2, costMultiplier: 2.0, qualityScore: 92, speedScore: 65, isAvailable: true, requiredSecretKey: 'IDEOGRAM_API_KEY', capabilities: ['text-rendering', 'typography', 'logos'] },
  
  // Tier 3 - Premium
  { id: 'midjourney-v6', name: 'Midjourney v6', provider: 'Midjourney', tier: 3, costMultiplier: 3.5, qualityScore: 98, speedScore: 50, isAvailable: true, requiredSecretKey: 'MIDJOURNEY_API_KEY', capabilities: ['artistic', 'cinematic', 'premium-quality'] },
  { id: 'alibaba-wanx', name: 'Alibaba WanX', provider: 'Alibaba', tier: 3, costMultiplier: 3.0, qualityScore: 95, speedScore: 55, isAvailable: true, requiredSecretKey: 'ALIBABA_API_KEY', capabilities: ['photorealistic', 'cjk-text', 'enterprise'] },
];

const VIDEO_MODEL_OPTIONS: ModelOption[] = [
  // Tier 2 - Advanced
  { id: 'modelslab-animatediff', name: 'AnimateDiff', provider: 'ModelsLab', tier: 2, costMultiplier: 2.0, qualityScore: 75, speedScore: 80, isAvailable: true, requiredSecretKey: 'MODELSLAB_API_KEY', capabilities: ['image-to-video', 'motion'] },
  { id: 'modelslab-svd', name: 'Stable Video Diffusion', provider: 'ModelsLab', tier: 2, costMultiplier: 2.5, qualityScore: 80, speedScore: 70, isAvailable: true, requiredSecretKey: 'MODELSLAB_API_KEY', capabilities: ['image-to-video', 'cinematic'] },
  { id: 'pika-labs', name: 'Pika Labs', provider: 'Pika', tier: 2, costMultiplier: 2.5, qualityScore: 82, speedScore: 75, isAvailable: true, requiredSecretKey: 'PIKA_API_KEY', capabilities: ['text-to-video', 'editing'] },
  { id: 'kling-ai', name: 'Kling AI', provider: 'Kuaishou', tier: 2, costMultiplier: 2.0, qualityScore: 78, speedScore: 85, isAvailable: true, requiredSecretKey: 'KLING_API_KEY', capabilities: ['text-to-video', 'motion-control'] },
  
  // Tier 3 - Premium
  { id: 'openai-sora', name: 'Sora', provider: 'OpenAI', tier: 3, costMultiplier: 5.0, qualityScore: 98, speedScore: 40, isAvailable: true, requiredSecretKey: 'OPENAI_API_KEY', capabilities: ['text-to-video', 'cinematic', 'physics'] },
  { id: 'runway-gen3', name: 'Runway Gen-3', provider: 'Runway', tier: 3, costMultiplier: 4.0, qualityScore: 95, speedScore: 50, isAvailable: true, requiredSecretKey: 'RUNWAY_API_KEY', capabilities: ['text-to-video', 'image-to-video', 'editing'] },
  { id: 'luma-dream-machine', name: 'Luma Dream Machine', provider: 'Luma AI', tier: 3, costMultiplier: 4.0, qualityScore: 92, speedScore: 55, isAvailable: true, requiredSecretKey: 'LUMA_API_KEY', capabilities: ['text-to-video', 'smooth-motion'] },
  { id: 'gemini-veo', name: 'Gemini Veo', provider: 'Google', tier: 3, costMultiplier: 4.5, qualityScore: 94, speedScore: 45, isAvailable: true, requiredSecretKey: 'GEMINI_API_KEY', capabilities: ['text-to-video', 'long-form'] },
];

const MESH_3D_MODEL_OPTIONS: ModelOption[] = [
  // Tier 2 - Advanced
  { id: 'modelslab-3d', name: 'ModelsLab 3D', provider: 'ModelsLab', tier: 2, costMultiplier: 2.5, qualityScore: 75, speedScore: 70, isAvailable: true, requiredSecretKey: 'MODELSLAB_API_KEY', capabilities: ['text-to-3d', 'image-to-3d'] },
  { id: 'meshy-ai', name: 'Meshy AI', provider: 'Meshy', tier: 2, costMultiplier: 2.0, qualityScore: 78, speedScore: 75, isAvailable: true, requiredSecretKey: 'MESHY_API_KEY', capabilities: ['text-to-3d', 'texturing'] },
  { id: 'triposr', name: 'TripoSR', provider: 'StabilityAI', tier: 2, costMultiplier: 2.0, qualityScore: 80, speedScore: 80, isAvailable: true, requiredSecretKey: 'STABILITY_API_KEY', capabilities: ['image-to-3d', 'fast-generation'] },
  { id: 'shap-e', name: 'Shap-E', provider: 'OpenAI', tier: 2, costMultiplier: 2.5, qualityScore: 72, speedScore: 85, isAvailable: true, requiredSecretKey: 'OPENAI_API_KEY', capabilities: ['text-to-3d', 'simple-models'] },
  
  // Tier 3 - Premium
  { id: 'rodin-gen1', name: 'Rodin Gen-1', provider: 'Rodin', tier: 3, costMultiplier: 4.0, qualityScore: 95, speedScore: 50, isAvailable: true, requiredSecretKey: 'RODIN_API_KEY', capabilities: ['text-to-3d', 'high-quality', 'animation-ready'] },
  { id: 'luma-genie', name: 'Luma Genie', provider: 'Luma AI', tier: 3, costMultiplier: 4.5, qualityScore: 92, speedScore: 55, isAvailable: true, requiredSecretKey: 'LUMA_API_KEY', capabilities: ['image-to-3d', 'multi-view', 'texturing'] },
  { id: 'csm-3d', name: 'CSM 3D', provider: 'Common Sense Machines', tier: 3, costMultiplier: 4.0, qualityScore: 90, speedScore: 60, isAvailable: true, requiredSecretKey: 'CSM_API_KEY', capabilities: ['text-to-3d', 'photorealistic'] },
];

const VOICE_MODEL_OPTIONS: ModelOption[] = [
  // Tier 1 - Standard
  { id: 'google-tts', name: 'Google TTS', provider: 'Google', tier: 1, costMultiplier: 0.5, qualityScore: 70, speedScore: 95, isAvailable: true, requiredSecretKey: 'GOOGLE_API_KEY', capabilities: ['multi-language', 'fast'] },
  { id: 'openai-tts', name: 'OpenAI TTS', provider: 'OpenAI', tier: 1, costMultiplier: 1.0, qualityScore: 80, speedScore: 90, isAvailable: true, requiredSecretKey: 'OPENAI_API_KEY', capabilities: ['natural', 'multi-language'] },
  
  // Tier 2 - Advanced
  { id: 'elevenlabs', name: 'ElevenLabs', provider: 'ElevenLabs', tier: 2, costMultiplier: 2.0, qualityScore: 92, speedScore: 80, isAvailable: true, requiredSecretKey: 'ELEVENLABS_API_KEY', capabilities: ['natural', 'emotion', 'voice-library'] },
  { id: 'azure-neural', name: 'Azure Neural TTS', provider: 'Microsoft', tier: 2, costMultiplier: 1.5, qualityScore: 88, speedScore: 85, isAvailable: true, requiredSecretKey: 'AZURE_TTS_KEY', capabilities: ['multi-language', 'visemes', 'ssml'] },
  
  // Tier 3 - Premium
  { id: 'elevenlabs-ultra', name: 'ElevenLabs Ultra', provider: 'ElevenLabs', tier: 3, costMultiplier: 4.0, qualityScore: 98, speedScore: 70, isAvailable: true, requiredSecretKey: 'ELEVENLABS_API_KEY', capabilities: ['voice-cloning', 'emotion-control', 'ultra-natural'] },
  { id: 'alibaba-qwen3-tts', name: 'Alibaba Qwen3-TTS', provider: 'Alibaba', tier: 3, costMultiplier: 3.5, qualityScore: 95, speedScore: 65, isAvailable: true, requiredSecretKey: 'ALIBABA_API_KEY', capabilities: ['cjk-languages', 'emotion', 'voice-cloning'] },
];

// ==========================================
// MODEL CATALOGS LOOKUP
// ==========================================

export const MODEL_CATALOGS: Record<ModelCategory, ModelOption[]> = {
  image: IMAGE_MODEL_OPTIONS,
  video: VIDEO_MODEL_OPTIONS,
  '3d': MESH_3D_MODEL_OPTIONS,
  voice: VOICE_MODEL_OPTIONS,
  text: [], // Text models handled separately via LLM routing
};

// ==========================================
// CORE FUNCTIONS
// ==========================================

/**
 * Get all models for a category, filtered by tier
 */
export function getModelsForCategory(
  category: ModelCategory,
  globalTier: 1 | 2 | 3 = 3
): ModelOption[] {
  return MODEL_CATALOGS[category]
    .filter(model => model.tier <= globalTier)
    .sort((a, b) => {
      // Sort by tier, then by quality score
      if (a.tier !== b.tier) return a.tier - b.tier;
      return b.qualityScore - a.qualityScore;
    });
}

/**
 * Get AI-recommended primary model based on context
 */
export function getRecommendedPrimaryModel(
  category: ModelCategory,
  context: {
    outputType?: string;
    industry?: string;
    contentType?: string;
    globalTier: 1 | 2 | 3;
    preferSpeed?: boolean;
    preferQuality?: boolean;
    languageCode?: string;
  }
): ModelRecommendation | null {
  const availableModels = getModelsForCategory(category, context.globalTier);
  if (availableModels.length === 0) return null;
  
  let scoredModels = availableModels.map(model => {
    let score = 50; // Base score
    
    // Quality preference
    if (context.preferQuality) {
      score += model.qualityScore * 0.4;
    } else if (context.preferSpeed) {
      score += model.speedScore * 0.4;
    } else {
      // Balanced
      score += (model.qualityScore * 0.2) + (model.speedScore * 0.2);
    }
    
    // Industry-specific bonuses
    if (context.industry) {
      if (context.industry.includes('healthcare') || context.industry.includes('medical')) {
        if (model.capabilities?.includes('photorealistic')) score += 10;
      }
      if (context.industry.includes('finance') || context.industry.includes('consulting')) {
        if (model.capabilities?.includes('text-rendering')) score += 10;
        if (model.capabilities?.includes('composition')) score += 10;
      }
      if (context.industry.includes('creative') || context.industry.includes('entertainment')) {
        if (model.capabilities?.includes('artistic')) score += 10;
        if (model.capabilities?.includes('cinematic')) score += 10;
      }
    }
    
    // Language-specific bonuses
    if (context.languageCode) {
      const cjkLanguages = ['zh', 'ja', 'ko', 'zh-cn', 'zh-tw', 'ja-jp', 'ko-kr'];
      if (cjkLanguages.includes(context.languageCode.toLowerCase())) {
        if (model.capabilities?.includes('cjk-text') || model.capabilities?.includes('cjk-languages')) {
          score += 20;
        }
        if (model.provider === 'Alibaba') {
          score += 15;
        }
      }
    }
    
    // Tier bonus (higher tier = slight bonus for premium outputs)
    if (context.outputType?.includes('video-full') || context.outputType?.includes('vr') || context.outputType?.includes('ar')) {
      score += (model.tier - 1) * 5;
    }
    
    return { model, score };
  });
  
  // Sort by score descending
  scoredModels.sort((a, b) => b.score - a.score);
  
  const bestModel = scoredModels[0];
  
  return {
    modelId: bestModel.model.id,
    score: Math.round(bestModel.score),
    reason: generateReasonText(bestModel.model, context),
    isPrimary: true,
    isRecommended: true
  };
}

function generateReasonText(model: ModelOption, context: any): string {
  const parts: string[] = [];
  
  if (context.preferQuality) {
    parts.push(`High quality score (${model.qualityScore}/100)`);
  } else if (context.preferSpeed) {
    parts.push(`Fast generation (${model.speedScore}/100 speed)`);
  }
  
  if (model.capabilities?.includes('photorealistic')) {
    parts.push('photorealistic output');
  }
  if (model.capabilities?.includes('text-rendering')) {
    parts.push('excellent text rendering');
  }
  if (model.capabilities?.includes('cjk-text') || model.capabilities?.includes('cjk-languages')) {
    parts.push('CJK language support');
  }
  
  if (parts.length === 0) {
    parts.push(`balanced quality and speed for Tier ${model.tier}`);
  }
  
  return `Selected for ${parts.slice(0, 2).join(' and ')}`;
}

/**
 * Get alternative models for user override
 */
export function getAlternativeModels(
  category: ModelCategory,
  primaryModelId: string,
  globalTier: 1 | 2 | 3 = 3
): ModelOption[] {
  return getModelsForCategory(category, globalTier)
    .filter(model => model.id !== primaryModelId);
}

/**
 * Build complete model selection config for an output type
 */
export function buildOutputModelConfig(
  outputId: string,
  category: ModelCategory,
  context: {
    globalTier: 1 | 2 | 3;
    industry?: string;
    contentType?: string;
    languageCode?: string;
    preferSpeed?: boolean;
    preferQuality?: boolean;
  }
): OutputModelConfig {
  const recommendation = getRecommendedPrimaryModel(category, {
    outputType: outputId,
    ...context
  });
  
  const allModels = getModelsForCategory(category, context.globalTier);
  const primaryModel = recommendation 
    ? allModels.find(m => m.id === recommendation.modelId) || null
    : null;
  
  const alternativeModels = primaryModel 
    ? allModels.filter(m => m.id !== primaryModel.id)
    : allModels;
  
  return {
    outputId,
    category,
    primaryModel,
    primaryReason: recommendation?.reason,
    alternativeModels,
    selectedOverrides: [],
    selectionMode: 'ai-auto'
  };
}

/**
 * Calculate combined cost multiplier for selected models
 */
export function calculateCostMultiplier(selectedModels: ModelOption[]): number {
  if (selectedModels.length === 0) return 1.0;
  
  // Use highest cost model as base, add 20% for each additional model
  const sortedByCost = [...selectedModels].sort((a, b) => b.costMultiplier - a.costMultiplier);
  const baseCost = sortedByCost[0].costMultiplier;
  const additionalCost = sortedByCost.slice(1).reduce((sum, m) => sum + (m.costMultiplier * 0.2), 0);
  
  return baseCost + additionalCost;
}

/**
 * Get estimated generation time for selected models
 */
export function estimateGenerationTime(
  selectedModels: ModelOption[],
  baseTimeMinutes: number = 5
): { min: number; max: number } {
  if (selectedModels.length === 0) {
    return { min: baseTimeMinutes, max: baseTimeMinutes * 2 };
  }
  
  // Slowest model determines min time
  const slowestModel = [...selectedModels].sort((a, b) => a.speedScore - b.speedScore)[0];
  const speedFactor = 100 / slowestModel.speedScore;
  
  return {
    min: Math.round(baseTimeMinutes * speedFactor * 0.8),
    max: Math.round(baseTimeMinutes * speedFactor * 1.5)
  };
}

// ==========================================
// UI HELPER EXPORTS
// ==========================================

export const TierBadgeColors: Record<1 | 2 | 3, string> = {
  1: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  2: 'bg-blue-100 text-blue-700 border-blue-200',
  3: 'bg-purple-100 text-purple-700 border-purple-200'
};

export const TierLabels: Record<1 | 2 | 3, string> = {
  1: 'Standard',
  2: 'Advanced',
  3: 'Premium'
};

export function getModelById(category: ModelCategory, modelId: string): ModelOption | undefined {
  return MODEL_CATALOGS[category].find(m => m.id === modelId);
}

export function isModelAvailable(model: ModelOption): boolean {
  // In production, check if required API key is configured
  // For now, return true for all
  return model.isAvailable;
}

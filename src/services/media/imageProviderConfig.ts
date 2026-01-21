/**
 * Image Generation Provider Configuration
 * 
 * Centralized configuration for all image generation providers
 * Separated from video/audio for maintainability
 */

import type { MediaProviderConfig, ImageGenProvider, MediaCapability } from './types';

// ============================================
// IMAGE GENERATION PROVIDERS
// ============================================

export const IMAGE_GEN_PROVIDERS: Record<ImageGenProvider, MediaProviderConfig> = {
  // ==========================================
  // PRIMARY: ModelsLab (FLUX, SDXL, Realistic)
  // ==========================================
  modelslab_flux: {
    id: 'modelslab_flux',
    name: 'ModelsLab FLUX Pro',
    capabilities: ['image_gen'],
    secretKey: 'MODELSLAB_API_KEY',
    isConfigured: true,
    priority: 1, // PRIMARY
    costPerUnit: 0.003,
    strengths: ['Ultra-high quality', 'FLUX Pro/Dev models', 'Fast', 'Photorealistic', 'CivitAI models'],
    weaknesses: ['Async for complex generations'],
  },
  modelslab_sdxl: {
    id: 'modelslab_sdxl',
    name: 'ModelsLab SDXL',
    capabilities: ['image_gen'],
    secretKey: 'MODELSLAB_API_KEY',
    isConfigured: true,
    priority: 2,
    costPerUnit: 0.002,
    strengths: ['Stable Diffusion XL', 'ControlNet', 'Inpainting', 'Wide style range'],
    weaknesses: ['Slower than FLUX'],
  },
  modelslab_realistic: {
    id: 'modelslab_realistic',
    name: 'ModelsLab Realistic Vision',
    capabilities: ['image_gen'],
    secretKey: 'MODELSLAB_API_KEY',
    isConfigured: true,
    priority: 3,
    costPerUnit: 0.002,
    strengths: ['Photorealistic focus', 'Product shots', 'Portraits'],
    weaknesses: ['Limited artistic styles'],
  },

  // ==========================================
  // TIER 2: Premium Providers
  // ==========================================
  gemini_nano_banana: {
    id: 'gemini_nano_banana',
    name: 'Gemini 2.5 Flash Image',
    capabilities: ['image_gen'],
    secretKey: 'LOVABLE_API_KEY',
    isConfigured: true,
    priority: 4,
    costPerUnit: 0.002,
    strengths: ['Fast', 'Good quality', 'Edit capability', 'Via Lovable AI'],
    weaknesses: ['Base64 output (large)'],
  },
  gemini_3_pro: {
    id: 'gemini_3_pro',
    name: 'Gemini 3 Pro Image',
    capabilities: ['image_gen'],
    secretKey: 'LOVABLE_API_KEY',
    isConfigured: true,
    priority: 5,
    costPerUnit: 0.004,
    strengths: ['Highest quality', 'Complex scenes', 'Via Lovable AI'],
    weaknesses: ['Slower', 'Higher cost'],
  },
  openai_dalle: {
    id: 'openai_dalle',
    name: 'OpenAI DALL-E 3',
    capabilities: ['image_gen'],
    secretKey: 'OPENAI_API_KEY',
    isConfigured: true,
    priority: 6,
    costPerUnit: 0.04,
    strengths: ['Excellent text rendering', 'High quality', 'Prompt refinement'],
    weaknesses: ['Expensive', 'No editing'],
  },

  // ==========================================
  // TIER 3: Regional & Budget Providers
  // ==========================================
  alibaba_wanx: {
    id: 'alibaba_wanx',
    name: 'Alibaba Wanx',
    capabilities: ['image_gen'],
    secretKey: 'ALIBABA_API_KEY',
    isConfigured: true,
    priority: 7,
    costPerUnit: 0.005,
    supportedLanguages: ['zh', 'en', 'ja', 'ko'],
    strengths: ['Low cost', 'Good for Asian aesthetics', 'Multiple styles', 'CJK text rendering'],
    weaknesses: ['Newer service'],
  },
  deepseek_image: {
    id: 'deepseek_image',
    name: 'DeepSeek Image',
    capabilities: ['image_gen'],
    secretKey: 'DEEPSEEK_API_KEY',
    isConfigured: true,
    priority: 8,
    costPerUnit: 0.001,
    supportedLanguages: ['zh', 'en', 'ja', 'ko'],
    strengths: ['Ultra low cost', 'CJK optimized', 'Vision understanding', 'Technical diagrams'],
    weaknesses: ['Newer model', 'Lower resolution options'],
  },
  azure_image: {
    id: 'azure_image',
    name: 'Azure DALL-E',
    capabilities: ['image_gen'],
    secretKey: 'AZURE_OPENAI_API_KEY',
    isConfigured: true,
    priority: 9,
    costPerUnit: 0.04,
    strengths: ['Enterprise-grade', 'HIPAA compliant', 'Content moderation'],
    weaknesses: ['Same as DALL-E pricing'],
  },
  huggingface: {
    id: 'huggingface',
    name: 'HuggingFace FLUX',
    capabilities: ['image_gen'],
    secretKey: 'HUGGING_FACE_ACCESS_TOKEN',
    isConfigured: true,
    priority: 10,
    costPerUnit: 0.001,
    strengths: ['Open models', 'Customizable', 'Low cost'],
    weaknesses: ['Variable quality', 'Rate limits'],
  },
  replicate: {
    id: 'replicate',
    name: 'Replicate',
    capabilities: ['image_gen'],
    secretKey: 'REPLICATE_API_TOKEN',
    isConfigured: true,
    priority: 11,
    costPerUnit: 0.002,
    strengths: ['Many models', 'Video capable', 'Pay-per-use'],
    weaknesses: ['Cold start delays'],
  },

  // ==========================================
  // LOW PRIORITY / DEPRECATED
  // ==========================================
  stability: {
    id: 'stability',
    name: 'Stability AI SDXL',
    capabilities: ['image_gen'],
    secretKey: 'STABILITY_API_KEY',
    isConfigured: false, // Use ModelsLab instead
    priority: 90,
    costPerUnit: 0.002,
    strengths: ['Fine control', 'Inpainting', 'ControlNet'],
    weaknesses: ['Use ModelsLab instead - same models, lower cost'],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getImageProvider(providerId: ImageGenProvider): MediaProviderConfig | undefined {
  return IMAGE_GEN_PROVIDERS[providerId];
}

export function getConfiguredImageProviders(): MediaProviderConfig[] {
  return Object.values(IMAGE_GEN_PROVIDERS)
    .filter(p => p.isConfigured)
    .sort((a, b) => a.priority - b.priority);
}

export function getImageProvidersByCapability(capability: MediaCapability): MediaProviderConfig[] {
  return Object.values(IMAGE_GEN_PROVIDERS)
    .filter(p => p.capabilities.includes(capability) && p.isConfigured)
    .sort((a, b) => a.priority - b.priority);
}

export function getImageProviderForLanguage(language: string): MediaProviderConfig | undefined {
  // CJK languages → prioritize Alibaba/DeepSeek
  const cjkLanguages = ['zh', 'ja', 'ko', 'zh-CN', 'zh-TW'];
  if (cjkLanguages.some(l => language.startsWith(l))) {
    return IMAGE_GEN_PROVIDERS.alibaba_wanx || IMAGE_GEN_PROVIDERS.deepseek_image;
  // Default to ModelsLab FLUX
  return IMAGE_GEN_PROVIDERS.modelslab_flux;
}

// Provider tier mapping for UI display
export const IMAGE_PROVIDER_TIERS = {
  tier1: ['modelslab_flux', 'modelslab_sdxl', 'modelslab_realistic'] as ImageGenProvider[],
  tier2: ['gemini_nano_banana', 'gemini_3_pro', 'openai_dalle', 'azure_image'] as ImageGenProvider[],
  tier3: ['alibaba_wanx', 'deepseek_image', 'huggingface', 'replicate'] as ImageGenProvider[],
};

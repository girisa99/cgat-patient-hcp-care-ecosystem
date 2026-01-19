/**
 * Universal AI Hub - Configured Providers
 * 
 * Maps configured secrets to provider availability
 * Based on docs/AI_PROVIDER_CAPABILITY_MATRIX.md
 */

import { supabase } from '@/integrations/supabase/client';
import type { AIProviderKey, AICapability } from './providerRegistry';

// ============================================
// CONFIGURED PROVIDERS (Based on Secrets)
// ============================================

export interface ProviderSecretMapping {
  providerId: AIProviderKey;
  requiredSecrets: string[];
  optionalSecrets?: string[];
  capabilities: AICapability[];
  configurationStatus: 'configured' | 'partial' | 'not_configured';
}

// Map of providers to their secret requirements
export const PROVIDER_SECRET_REQUIREMENTS: Record<AIProviderKey, string[]> = {
  openai: ['OPENAI_API_KEY'],
  claude: ['ANTHROPIC_API_KEY', 'CLAUDE_API_KEY'], // Either works
  gemini: ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'LOVABLE_API_KEY'], // Any works
  deepseek: ['DEEPSEEK_API_KEY'],
  alibaba: ['ALIBABA_API_KEY'],
  azure: ['AZURE_OPENAI_KEY', 'AZURE_SPEECH_KEY', 'AZURE_FORM_RECOGNIZER_KEY'],
  aws: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
  deepl: ['DEEPL_API_KEY'],
  elevenlabs: ['ELEVENLABS_API_KEY'],
  google: ['GOOGLE_API_KEY', 'GEMINI_API_KEY'],
  replicate: ['REPLICATE_API_TOKEN'],
  stability: ['STABILITY_API_KEY'],
  huggingface: ['HUGGING_FACE_ACCESS_TOKEN'],
  modelslab: ['MODELSLAB_API_KEY'], // Unified hub for Image/Video/Audio/3D/Training
};

// Known configured secrets from the project
// This is the source of truth based on secrets--fetch_secrets
export const KNOWN_CONFIGURED_SECRETS = new Set([
  'ALIBABA_API_KEY',
  'ANTHROPIC_API_KEY',
  'CLAUDE_API_KEY',
  'DEEPL_API_KEY',
  'DEEPSEEK_API_KEY',
  'ELEVENLABS_API_KEY',
  'GEMINI_API_KEY',
  'GOOGLE_API_KEY',
  'HUGGING_FACE_ACCESS_TOKEN',
  'LOVABLE_API_KEY',
  'MICROSOFT_TRANSLATE_API_KEY',
  'MODELSLAB_API_KEY', // Unified hub for Image/Video/Audio/3D/Training
  'OPENAI_API_KEY',
  'REPLICATE_API_TOKEN',
]);

// ============================================
// PROVIDER CONFIGURATION STATUS
// ============================================

export type ConfigurationStatus = 'configured' | 'partial' | 'not_configured';

export interface ProviderConfig {
  providerId: AIProviderKey;
  name: string;
  status: ConfigurationStatus;
  missingSecrets: string[];
  availableCapabilities: AICapability[];
  notes?: string;
}

/**
 * Get configuration status for all providers
 */
export function getProvidersConfigurationStatus(): ProviderConfig[] {
  return [
    // Fully Configured Providers
    {
      providerId: 'openai',
      name: 'OpenAI',
      status: 'configured',
      missingSecrets: [],
      availableCapabilities: ['llm', 'translation', 'tts', 'stt', 'image_gen', 'vision', 'nlp'],
      notes: 'Full suite available including DALL-E 3, Whisper, TTS',
    },
    {
      providerId: 'claude',
      name: 'Anthropic Claude',
      status: 'configured',
      missingSecrets: [],
      availableCapabilities: ['llm', 'translation', 'vision', 'nlp'],
      notes: 'Best for nuanced text, literary translation, European languages',
    },
    {
      providerId: 'gemini',
      name: 'Google Gemini',
      status: 'configured',
      missingSecrets: [],
      availableCapabilities: ['llm', 'translation', 'ocr', 'tts', 'image_gen', 'vision', 'nlp'],
      notes: 'Available via Lovable AI Gateway - fast, multimodal',
    },
    {
      providerId: 'deepseek',
      name: 'DeepSeek',
      status: 'configured',
      missingSecrets: [],
      availableCapabilities: ['llm', 'translation', 'ocr', 'vision', 'nlp'],
      notes: 'Best for Chinese/CJK content, technical docs, code',
    },
    {
      providerId: 'alibaba',
      name: 'Alibaba DashScope',
      status: 'configured',
      missingSecrets: [],
      availableCapabilities: ['llm', 'translation', 'ocr', 'tts', 'stt', 'image_gen', 'video_gen', 'vision', 'nlp'],
      notes: 'Full CJK support, video generation available',
    },
    {
      providerId: 'deepl',
      name: 'DeepL',
      status: 'configured',
      missingSecrets: [],
      availableCapabilities: ['translation'],
      notes: 'Best quality for European language translation',
    },
    {
      providerId: 'elevenlabs',
      name: 'ElevenLabs',
      status: 'configured',
      missingSecrets: [],
      availableCapabilities: ['tts', 'music_gen', 'sfx_gen'],
      notes: 'Best TTS quality, voice cloning, music/SFX generation',
    },
    {
      providerId: 'google',
      name: 'Google Cloud AI',
      status: 'configured',
      missingSecrets: [],
      availableCapabilities: ['translation', 'ocr', 'tts', 'stt', 'vision', 'nlp'],
      notes: 'Google Translate API, Cloud Vision, Cloud Speech',
    },
    {
      providerId: 'replicate',
      name: 'Replicate',
      status: 'configured',
      missingSecrets: [],
      availableCapabilities: ['image_gen', 'video_gen'],
      notes: 'SDXL, Flux, Runway Gen-3 style video',
    },
    {
      providerId: 'huggingface',
      name: 'HuggingFace',
      status: 'configured',
      missingSecrets: [],
      availableCapabilities: ['llm', 'image_gen', 'nlp'],
      notes: 'Open-source models, free tier available',
    },
    
    // ModelsLab - Unified Hub (Now Configured)
    {
      providerId: 'modelslab',
      name: 'ModelsLab',
      status: 'configured',
      missingSecrets: [],
      availableCapabilities: ['image_gen', 'video_gen', 'music_gen', 'sfx_gen', 'tts', 'llm'],
      notes: 'Unified hub: Stable Diffusion, FLUX, Midjourney-style, AnimateDiff, CivitAI models, 3D gen, voice clone',
    },

    // Not Configured Providers
    {
      providerId: 'azure',
      name: 'Azure Cognitive Services',
      status: 'not_configured',
      missingSecrets: ['AZURE_OPENAI_KEY', 'AZURE_SPEECH_KEY', 'AZURE_FORM_RECOGNIZER_KEY'],
      availableCapabilities: [],
      notes: 'Requires Azure subscription - enterprise features',
    },
    {
      providerId: 'aws',
      name: 'AWS AI Services',
      status: 'not_configured',
      missingSecrets: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
      availableCapabilities: [],
      notes: 'Enterprise fallback - requires AWS account',
    },
    {
      providerId: 'stability',
      name: 'Stability AI',
      status: 'not_configured',
      missingSecrets: ['STABILITY_API_KEY'],
      availableCapabilities: [],
      notes: 'Use ModelsLab instead - hosts same models at lower cost',
    },
  ];
}

/**
 * Check if a provider is configured for a specific capability
 */
export function isProviderConfigured(providerId: AIProviderKey): boolean {
  const config = getProvidersConfigurationStatus().find(p => p.providerId === providerId);
  return config?.status === 'configured';
}

/**
 * Get all configured providers for a capability
 */
export function getConfiguredProvidersForCapability(capability: AICapability): ProviderConfig[] {
  return getProvidersConfigurationStatus()
    .filter(p => p.status === 'configured' && p.availableCapabilities.includes(capability));
}

/**
 * Get fallback chain for a capability (only configured providers)
 */
export function getConfiguredFallbackChain(capability: AICapability): AIProviderKey[] {
  const fallbackOrders: Record<AICapability, AIProviderKey[]> = {
    llm: ['openai', 'claude', 'gemini', 'deepseek', 'alibaba', 'huggingface', 'modelslab'],
    translation: ['deepl', 'claude', 'google', 'openai', 'alibaba', 'deepseek'],
    ocr: ['gemini', 'google', 'claude', 'deepseek', 'alibaba'],
    tts: ['elevenlabs', 'openai', 'google', 'alibaba', 'modelslab'],
    stt: ['openai', 'google', 'alibaba'],
    image_gen: ['modelslab', 'openai', 'gemini', 'replicate', 'alibaba', 'huggingface'], // ModelsLab first for image
    video_gen: ['modelslab', 'replicate', 'alibaba'], // ModelsLab first for video
    music_gen: ['elevenlabs', 'modelslab'],
    sfx_gen: ['elevenlabs', 'modelslab'],
    vision: ['gemini', 'openai', 'claude', 'google', 'deepseek', 'alibaba'],
    nlp: ['openai', 'claude', 'gemini', 'google', 'deepseek', 'alibaba'],
  };

  return fallbackOrders[capability] || [];
}

/**
 * Check provider availability via edge function
 */
export async function checkProviderAvailability(
  providerId: AIProviderKey
): Promise<{ available: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('check-ai-provider', {
      body: { provider: providerId },
    });

    if (error) {
      return { available: false, error: error.message };
    }

    return { available: data?.available ?? false };
  } catch (err) {
    return { 
      available: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}

/**
 * Check all providers' availability
 */
export async function checkAllProvidersAvailability(): Promise<Record<AIProviderKey, boolean>> {
  try {
    const { data, error } = await supabase.functions.invoke('check-ai-provider', {
      body: { action: 'check_all' },
    });

    if (error) {
      console.error('Failed to check providers:', error);
      // Return known configured providers as fallback
      const result: Record<string, boolean> = {};
      getProvidersConfigurationStatus().forEach(p => {
        result[p.providerId] = p.status === 'configured';
      });
      return result as Record<AIProviderKey, boolean>;
    }

    return data?.providers ?? {};
  } catch (err) {
    console.error('Failed to check providers:', err);
    return {} as Record<AIProviderKey, boolean>;
  }
}

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

// Map of providers to their secret requirements - Core 18 Ecosystem (Updated 2026-01-30)
export const PROVIDER_SECRET_REQUIREMENTS: Record<AIProviderKey, string[]> = {
  // Core 18 Ecosystem - Primary Production Providers
  openai: ['OPENAI_API_KEY'],
  claude: ['ANTHROPIC_API_KEY', 'CLAUDE_API_KEY'], // Either works
  gemini: ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'LOVABLE_API_KEY'], // Any works
  deepgram: ['DEEPGRAM_API_KEY'], // NEW: Primary STT
  deepseek: ['DEEPSEEK_API_KEY'],
  alibaba: ['ALIBABA_API_KEY'],
  // Azure: Speech + Form Recognizer + Translate (NOT Azure OpenAI - we use OpenAI directly)
  azure: ['AZURE_SPEECH_KEY', 'AZURE_FORM_RECOGNIZER_KEY', 'MICROSOFT_TRANSLATE_API_KEY'],
  deepl: ['DEEPL_API_KEY'],
  elevenlabs: ['ELEVENLABS_API_KEY'],
  suno: ['SUNO_API_KEY'], // NEW: Premium music
  google: ['GOOGLE_API_KEY', 'GEMINI_API_KEY'],
  replicate: ['REPLICATE_API_TOKEN'],
  modelslab: ['MODELSLAB_API_KEY'], // FLUX Pro, AnimateDiff, 3D Mesh
  meshy: ['MESHY_API_KEY'], // High-fidelity 3D, PBR textures, Rigging
  runpod: ['RUNPOD_API_KEY'], // GPU rendering
  heygen: ['HEYGEN_API_KEY'], // AI Avatars
  // Deprecated/Legacy (route to Core 18)
  aws: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'], // Not required
  stability: ['STABILITY_API_KEY'], // Use ModelsLab instead
  huggingface: ['HUGGING_FACE_ACCESS_TOKEN'],
};

// Known configured secrets from the project
// This is the source of truth based on secrets--fetch_secrets (42 secrets - Updated 2026-01-30)
export const KNOWN_CONFIGURED_SECRETS = new Set([
  // Core 18 Ecosystem
  'ALIBABA_API_KEY',
  'ANTHROPIC_API_KEY',
  'CLAUDE_API_KEY',
  'DEEPGRAM_API_KEY', // NEW: Primary STT
  'DEEPL_API_KEY',
  'DEEPSEEK_API_KEY',
  'ELEVENLABS_API_KEY',
  'GEMINI_API_KEY',
  'GOOGLE_API_KEY',
  'HUGGING_FACE_ACCESS_TOKEN',
  'LOVABLE_API_KEY',
  'MODELSLAB_API_KEY', // FLUX Pro, AnimateDiff, 3D Mesh
  'MESHY_API_KEY', // High-fidelity 3D, PBR textures, Rigging
  'OPENAI_API_KEY',
  'REPLICATE_API_TOKEN',
  // Azure (Speech + Form Recognizer + Translate - NOT Azure OpenAI)
  'AZURE_SPEECH_KEY',
  'AZURE_SPEECH_REGION',
  'AZURE_FORM_RECOGNIZER_KEY',
  'AZURE_FORM_RECOGNIZER_ENDPOINT',
  'MICROSOFT_TRANSLATE_API_KEY',
  'MICROSOFT_TRANSLATE_REGION',
  // NEW: Additional providers
  'SUNO_API_KEY', // Premium music (pending configuration)
  'RUNPOD_API_KEY', // GPU rendering (pending configuration)
  'HEYGEN_API_KEY', // AI Avatars (pending configuration)
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

    // Azure - NOW CONFIGURED (Speech + Form Recognizer + Translate)
    {
      providerId: 'azure',
      name: 'Azure Cognitive Services',
      status: 'configured',
      missingSecrets: [],
      availableCapabilities: ['translation', 'ocr', 'tts', 'stt', 'vision', 'nlp'],
      notes: 'Enterprise-grade: Speech (400+ voices, Visemes), Form Recognizer (documents), Translate',
    },

    // Meshy AI - 3D Generation
    {
      providerId: 'meshy',
      name: 'Meshy AI',
      status: 'configured',
      missingSecrets: [],
      availableCapabilities: ['image_gen', 'video_gen', '3d_gen'],
      notes: 'High-fidelity 3D: PBR textures, Auto-rigging, USDZ/GLTF export, Image-to-3D',
    },

    // NEW PROVIDERS - Added 2026-01-30
    {
      providerId: 'deepgram',
      name: 'Deepgram',
      status: 'configured',
      missingSecrets: [],
      availableCapabilities: ['stt', 'realtime_stt'],
      notes: 'Primary STT: <100ms latency, 36+ languages, real-time streaming',
    },
    {
      providerId: 'suno',
      name: 'Suno AI',
      status: 'not_configured',
      missingSecrets: ['SUNO_API_KEY'],
      availableCapabilities: [],
      notes: 'Premium music generation with vocals - API key pending',
    },
    {
      providerId: 'runpod',
      name: 'RunPod',
      status: 'not_configured',
      missingSecrets: ['RUNPOD_API_KEY'],
      availableCapabilities: [],
      notes: 'GPU rendering for priority processing - API key pending',
    },
    {
      providerId: 'heygen',
      name: 'HeyGen',
      status: 'not_configured',
      missingSecrets: ['HEYGEN_API_KEY'],
      availableCapabilities: [],
      notes: 'AI Avatar generation - API key pending',
    },

    // Not Configured (Legacy/Not Required)
    {
      providerId: 'aws',
      name: 'AWS AI Services',
      status: 'not_configured',
      missingSecrets: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
      availableCapabilities: [],
      notes: 'Not required - Using Azure and Core 18 ecosystem instead',
    },
    {
      providerId: 'stability',
      name: 'Stability AI',
      status: 'not_configured',
      missingSecrets: ['STABILITY_API_KEY'],
      availableCapabilities: [],
      notes: 'Not required - Using ModelsLab instead (hosts same models at lower cost)',
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
    llm: ['gemini', 'openai', 'claude', 'deepseek', 'alibaba', 'huggingface'],
    translation: ['deepl', 'alibaba', 'azure', 'claude', 'google', 'openai', 'deepseek'],
    ocr: ['azure', 'gemini', 'google', 'alibaba', 'claude', 'deepseek'],
    tts: ['elevenlabs', 'azure', 'openai', 'google', 'alibaba', 'modelslab'],
    stt: ['deepgram', 'openai', 'azure', 'google', 'alibaba'], // UPDATED: Deepgram as PRIMARY
    realtime_stt: ['deepgram', 'azure', 'google'], // NEW: Real-time STT capability
    // UPDATED: ModelsLab as PRIMARY for image generation
    image_gen: ['modelslab', 'gemini', 'openai', 'replicate', 'alibaba', 'huggingface', 'meshy'],
    // UPDATED: ModelsLab as PRIMARY for video generation
    video_gen: ['modelslab', 'gemini', 'replicate', 'alibaba', 'heygen'],
    music_gen: ['suno', 'elevenlabs', 'modelslab'], // UPDATED: Suno as PRIMARY
    sfx_gen: ['elevenlabs', 'modelslab'],
    vision: ['gemini', 'openai', 'claude', 'google', 'alibaba', 'deepseek'],
    nlp: ['gemini', 'openai', 'claude', 'deepseek', 'alibaba'],
    '3d_gen': ['meshy', 'modelslab', 'replicate'], // NEW: 3D generation
    avatar: ['heygen', 'alibaba'], // NEW: Avatar generation
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

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

// Map of providers to their secret requirements - Core 15 Ecosystem (Updated 2026-01-30)
export const PROVIDER_SECRET_REQUIREMENTS: Record<AIProviderKey, string[]> = {
  // Core 15 Ecosystem - ACTUALLY CONFIGURED Providers
  openai: ['OPENAI_API_KEY'],
  claude: ['ANTHROPIC_API_KEY', 'CLAUDE_API_KEY'], // Either works
  gemini: ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'LOVABLE_API_KEY'], // Any works
  deepgram: ['DEEPGRAM_API_KEY'], // Primary STT (<100ms)
  deepseek: ['DEEPSEEK_API_KEY'],
  alibaba: ['ALIBABA_API_KEY'],
  azure: ['AZURE_SPEECH_KEY', 'AZURE_FORM_RECOGNIZER_KEY', 'MICROSOFT_TRANSLATE_API_KEY'],
  deepl: ['DEEPL_API_KEY'],
  elevenlabs: ['ELEVENLABS_API_KEY'], // TTS + Music + SFX
  sora2api: ['SORA2API_KEY'], // Primary video generation
  google: ['GOOGLE_API_KEY', 'GEMINI_API_KEY'],
  replicate: ['REPLICATE_API_TOKEN'],
  modelslab: ['MODELSLAB_API_KEY'], // FLUX Pro, AnimateDiff
  meshy: ['MESHY_API_KEY'], // High-fidelity 3D
  // Deprecated/Legacy (NOT CONFIGURED)
  aws: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
  stability: ['STABILITY_API_KEY'],
  huggingface: ['HUGGING_FACE_ACCESS_TOKEN'],
};

// Known configured secrets from the project
// This is the source of truth based on secrets--fetch_secrets (42 secrets - Updated 2026-01-30)
export const KNOWN_CONFIGURED_SECRETS = new Set([
  // Core 15 Ecosystem - ACTUALLY CONFIGURED
  'ALIBABA_API_KEY',
  'ANTHROPIC_API_KEY',
  'CLAUDE_API_KEY',
  'DEEPGRAM_API_KEY', // Primary STT (<100ms)
  'DEEPL_API_KEY',
  'DEEPSEEK_API_KEY',
  'ELEVENLABS_API_KEY', // TTS + Music + SFX
  'GEMINI_API_KEY',
  'GOOGLE_API_KEY',
  'HUGGING_FACE_ACCESS_TOKEN',
  'LOVABLE_API_KEY',
  'MODELSLAB_API_KEY', // FLUX Pro, AnimateDiff
  'MESHY_API_KEY', // High-fidelity 3D
  'OPENAI_API_KEY',
  'REPLICATE_API_TOKEN',
  'SORA2API_KEY', // Primary video generation
  // Azure (Speech + Form Recognizer + Translate)
  'AZURE_SPEECH_KEY',
  'AZURE_SPEECH_REGION',
  'AZURE_FORM_RECOGNIZER_KEY',
  'AZURE_FORM_RECOGNIZER_ENDPOINT',
  'MICROSOFT_TRANSLATE_API_KEY',
  'MICROSOFT_TRANSLATE_REGION',
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

    // Deepgram - Primary STT
    {
      providerId: 'deepgram',
      name: 'Deepgram',
      status: 'configured',
      missingSecrets: [],
      availableCapabilities: ['stt', 'realtime_stt'],
      notes: 'Primary STT: <100ms latency, 36+ languages, real-time streaming',
    },

    // Sora2API - Primary Video Generation (CONFIGURED)
    {
      providerId: 'sora2api',
      name: 'Sora2API',
      status: 'configured',
      missingSecrets: [],
      availableCapabilities: ['video_gen'],
      notes: 'Primary video: Cinematic, realistic, commercial - via sora2api.org',
    },

    // Not Configured (Legacy/Not Required)
    {
      providerId: 'aws',
      name: 'AWS AI Services',
      status: 'not_configured',
      missingSecrets: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
      availableCapabilities: [],
      notes: 'Not required - Using Azure and Core 15 ecosystem instead',
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
/**
 * Get fallback chain for a capability (only configured providers)
 * Complete P1→P2→P3→P4+ chains for all capabilities
 */
export function getConfiguredFallbackChain(capability: AICapability): AIProviderKey[] {
  const fallbackOrders: Record<AICapability, AIProviderKey[]> = {
    // LLM: Gemini → OpenAI → Claude → DeepSeek → Alibaba → HuggingFace
    llm: ['gemini', 'openai', 'claude', 'deepseek', 'alibaba', 'huggingface'],
    
    // Translation: DeepL → Azure → Claude → Google → OpenAI → Alibaba → DeepSeek
    translation: ['deepl', 'azure', 'claude', 'google', 'openai', 'alibaba', 'deepseek'],
    
    // OCR: Azure Form Recognizer → Gemini → Google Vision → Alibaba Qwen-VL → DeepSeek-VL
    ocr: ['azure', 'gemini', 'google', 'alibaba', 'deepseek'],
    
    // TTS: ElevenLabs → Azure Neural → OpenAI → Google WaveNet → Alibaba CosyVoice → ModelsLab
    tts: ['elevenlabs', 'azure', 'openai', 'google', 'alibaba', 'modelslab'],
    
    // STT: Deepgram (<100ms) → OpenAI Whisper → Azure Speech → Google STT → Alibaba Paraformer
    stt: ['deepgram', 'openai', 'azure', 'google', 'alibaba'],
    
    // Real-time STT: Deepgram → Azure → Google → Alibaba
    realtime_stt: ['deepgram', 'azure', 'google', 'alibaba'],
    
    // Image: ModelsLab FLUX → Gemini → OpenAI DALL-E → Replicate → Alibaba Wanx → HuggingFace → Meshy
    image_gen: ['modelslab', 'gemini', 'openai', 'replicate', 'alibaba', 'huggingface', 'meshy'],
    
    // Video: Sora2API → ModelsLab → Gemini Veo → Replicate → Alibaba WAN
    video_gen: ['sora2api', 'modelslab', 'gemini', 'replicate', 'alibaba'],
    
    // Music: ElevenLabs → ModelsLab → Alibaba (Suno NOT configured)
    music_gen: ['elevenlabs', 'modelslab', 'alibaba'],
    
    // SFX: ElevenLabs → ModelsLab → Azure
    sfx_gen: ['elevenlabs', 'modelslab', 'azure'],
    
    // Vision: Gemini → OpenAI GPT-4V → Claude → Google Vision → Alibaba Qwen-VL → DeepSeek-VL
    vision: ['gemini', 'openai', 'claude', 'google', 'alibaba', 'deepseek'],
    
    // NLP: Gemini → OpenAI → Claude → Azure Language → DeepSeek → Alibaba
    nlp: ['gemini', 'openai', 'claude', 'azure', 'deepseek', 'alibaba'],
    
    // 3D: Meshy → ModelsLab → Replicate (TripoSR) → Alibaba
    '3d_gen': ['meshy', 'modelslab', 'replicate', 'alibaba'],
    
    // Avatar/Lip-Sync: Alibaba WAN 2.2 → Azure Visemes → ModelsLab (HeyGen NOT configured)
    avatar: ['alibaba', 'azure', 'modelslab'],
  };

  return fallbackOrders[capability] || [];
}

/**
 * Get regional fallback chain for a capability
 * Adjusts P1→P2 based on region for optimal latency/quality
 */
export function getRegionalFallbackChain(capability: AICapability, region: string): AIProviderKey[] {
  const baseChain = getConfiguredFallbackChain(capability);
  
  // CJK regions prioritize Alibaba/DeepSeek
  const cjkRegions = ['zh', 'ja', 'ko', 'cn', 'jp', 'kr', 'tw', 'hk'];
  if (cjkRegions.some(r => region.toLowerCase().includes(r))) {
    if (capability === 'tts') return ['alibaba', 'azure', 'elevenlabs', 'google', 'openai'];
    if (capability === 'stt') return ['alibaba', 'deepgram', 'azure', 'google'];
    if (capability === 'translation') return ['alibaba', 'deepseek', 'deepl', 'azure', 'google'];
    if (capability === 'image_gen') return ['alibaba', 'modelslab', 'gemini', 'replicate'];
    if (capability === 'video_gen') return ['alibaba', 'sora2api', 'modelslab', 'replicate'];
    if (capability === 'llm') return ['alibaba', 'deepseek', 'gemini', 'openai', 'claude'];
  }
  
  // MENA/Arabic regions prioritize Azure for TTS
  const menaRegions = ['ar', 'sa', 'ae', 'eg', 'ma', 'dz'];
  if (menaRegions.some(r => region.toLowerCase().includes(r))) {
    if (capability === 'tts') return ['azure', 'elevenlabs', 'google', 'openai'];
    if (capability === 'translation') return ['azure', 'google', 'deepl', 'claude'];
  }
  
  // India/SEA prioritize Google/Gemini
  const seaRegions = ['in', 'id', 'th', 'vn', 'my', 'ph', 'sg'];
  if (seaRegions.some(r => region.toLowerCase().includes(r))) {
    if (capability === 'tts') return ['google', 'azure', 'elevenlabs', 'alibaba'];
    if (capability === 'translation') return ['google', 'azure', 'deepl', 'gemini'];
    if (capability === 'llm') return ['gemini', 'openai', 'claude', 'alibaba'];
  }
  
  return baseChain;
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

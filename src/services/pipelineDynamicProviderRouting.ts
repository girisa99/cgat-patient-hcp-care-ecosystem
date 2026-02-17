/**
 * Pipeline Dynamic Provider Routing Service
 * 
 * Routes ALL 110+ pipelines through the existing 12 providers using:
 * - 4-Zone LLM Routing (Claude, Alibaba, Gemini, Fallback)
 * - Context-aware provider selection based on content type
 * - Regional language optimization
 * 
 * CORE 12 PROVIDERS:
 * 1. OpenAI (GPT-4o, DALL-E, Whisper, Sora)
 * 2. Claude (Anthropic)
 * 3. Gemini (Google)
 * 4. DeepSeek (CJK optimized)
 * 5. Alibaba (Qwen, Qwen3-TTS, WAN 2.2)
 * 6. Azure (Neural TTS, Form Recognizer, Visemes)
 * 7. ModelsLab (FLUX, AnimateDiff, 3D)
 * 8. Replicate (Open-source models, 3D)
 * 9. ElevenLabs (Premium TTS, Voice Clone, SFX)
 * 10. DeepL (European translation)
 * 11. Supabase (Auth, Database, Edge Functions)
 * 12. Stripe (Payments)
 * 
 * DEPRECATED PROVIDERS REMAPPED:
 * - stability → modelslab (SDXL, image gen)
 * - assemblyai → azure/openai (STT with Whisper)
 * - runway → modelslab/alibaba (video gen)
 * - suno/udio → elevenlabs (music/SFX)
 * - pika → modelslab/alibaba (video gen)
 * - cohere → openai/gemini (embeddings)
 * - huggingface → modelslab/replicate (open models)
 */

import type { LLMZone } from './llmRoutingStrategy';
import type { ProviderId } from '@/components/ai-hub/provider-matrix/types';

// ============================================================================
// CORE 12 PROVIDER IDs
// ============================================================================

export const CORE_PROVIDERS: ProviderId[] = [
  'openai',
  'claude', 
  'gemini',
  'deepseek',
  'alibaba',
  'azure',
  'modelslab',
  'replicate',
  'elevenlabs',
  'deepl',
  'supabase',
  'stripe',
];

// ============================================================================
// DEPRECATED → CORE PROVIDER MAPPING
// ============================================================================

export const DEPRECATED_TO_CORE_MAP: Record<string, { primary: ProviderId; fallback: ProviderId; reason: string }> = {
  stability: { primary: 'modelslab', fallback: 'replicate', reason: 'ModelsLab provides SDXL/FLUX with lower cost' },
  assemblyai: { primary: 'azure', fallback: 'openai', reason: 'Azure STT + OpenAI Whisper as fallback' },
  runway: { primary: 'modelslab', fallback: 'alibaba', reason: 'ModelsLab AnimateDiff + Alibaba WAN 2.2' },
  suno: { primary: 'elevenlabs', fallback: 'elevenlabs', reason: 'ElevenLabs Music/SFX generation' },
  udio: { primary: 'elevenlabs', fallback: 'elevenlabs', reason: 'ElevenLabs Music/SFX generation' },
  pika: { primary: 'alibaba', fallback: 'modelslab', reason: 'Alibaba WAN 2.2 for fast video' },
  cohere: { primary: 'openai', fallback: 'gemini', reason: 'OpenAI/Gemini embeddings' },
  huggingface: { primary: 'modelslab', fallback: 'replicate', reason: 'ModelsLab/Replicate for open models' },
};

// ============================================================================
// CAPABILITY-TO-PROVIDER ROUTING (Dynamic based on context)
// ============================================================================

export type PipelineCapability = 
  | 'llm' | 'script_gen' | 'summarization' | 'translation'
  | 'tts' | 'stt' | 'voice_clone' | 'music_gen' | 'sfx_gen'
  | 'image_gen' | 'video_gen' | 'avatar' | 'lip_sync' | '3d_gen'
  | 'ocr' | 'vision' | 'data_viz'
  | 'auth' | 'storage' | 'payments';

export interface DynamicProviderRoute {
  primary: ProviderId;
  fallback: ProviderId;
  zone: LLMZone;
  quality: number;
  reason: string;
}

// ============================================================================
// 4-ZONE ROUTING BY CAPABILITY
// ============================================================================

const CAPABILITY_ZONE_ROUTING: Record<LLMZone, Record<PipelineCapability, DynamicProviderRoute>> = {
  claude: {
    llm: { primary: 'claude', fallback: 'openai', zone: 'claude', quality: 5, reason: 'Claude 3.5 Sonnet primary' },
    script_gen: { primary: 'claude', fallback: 'openai', zone: 'claude', quality: 5, reason: 'Best narrative writing' },
    summarization: { primary: 'claude', fallback: 'openai', zone: 'claude', quality: 5, reason: 'Long context handling' },
    translation: { primary: 'deepl', fallback: 'openai', zone: 'claude', quality: 5, reason: 'DeepL for European languages' },
    tts: { primary: 'elevenlabs', fallback: 'azure', zone: 'claude', quality: 5, reason: 'Premium ElevenLabs voices' },
    stt: { primary: 'openai', fallback: 'azure', zone: 'claude', quality: 5, reason: 'Whisper for accuracy' },
    voice_clone: { primary: 'elevenlabs', fallback: 'azure', zone: 'claude', quality: 5, reason: 'ElevenLabs voice cloning' },
    music_gen: { primary: 'elevenlabs', fallback: 'elevenlabs', zone: 'claude', quality: 4, reason: 'ElevenLabs music gen' },
    sfx_gen: { primary: 'elevenlabs', fallback: 'elevenlabs', zone: 'claude', quality: 4, reason: 'ElevenLabs SFX' },
    image_gen: { primary: 'modelslab', fallback: 'openai', zone: 'claude', quality: 5, reason: 'FLUX Pro via ModelsLab' },
    video_gen: { primary: 'modelslab', fallback: 'replicate', zone: 'claude', quality: 5, reason: 'AnimateDiff via ModelsLab' },
    avatar: { primary: 'alibaba', fallback: 'replicate', zone: 'claude', quality: 5, reason: 'Alibaba WAN 2.2 global' },
    lip_sync: { primary: 'azure', fallback: 'alibaba', zone: 'claude', quality: 5, reason: 'Azure Visemes' },
    '3d_gen': { primary: 'modelslab', fallback: 'replicate', zone: 'claude', quality: 4, reason: 'ModelsLab 3D mesh' },
    ocr: { primary: 'azure', fallback: 'gemini', zone: 'claude', quality: 5, reason: 'Azure Form Recognizer' },
    vision: { primary: 'openai', fallback: 'gemini', zone: 'claude', quality: 5, reason: 'GPT-4o Vision' },
    data_viz: { primary: 'openai', fallback: 'gemini', zone: 'claude', quality: 5, reason: 'GPT-4o code gen' },
    auth: { primary: 'supabase', fallback: 'supabase', zone: 'claude', quality: 5, reason: 'Supabase Auth' },
    storage: { primary: 'supabase', fallback: 'supabase', zone: 'claude', quality: 5, reason: 'Supabase Storage' },
    payments: { primary: 'stripe', fallback: 'stripe', zone: 'claude', quality: 5, reason: 'Stripe Payments' },
  },
  alibaba: {
    // NOTE: This zone is now CJK-ONLY (NOT Arabic - GPT-4o handles Arabic better)
    llm: { primary: 'alibaba', fallback: 'openai', zone: 'alibaba', quality: 5, reason: 'Qwen-Max for CJK (CN/JP/KR/TW/HK/SG)' },
    script_gen: { primary: 'alibaba', fallback: 'openai', zone: 'alibaba', quality: 5, reason: 'Native CJK generation' },
    summarization: { primary: 'alibaba', fallback: 'deepseek', zone: 'alibaba', quality: 5, reason: 'CJK summarization' },
    translation: { primary: 'alibaba', fallback: 'deepseek', zone: 'alibaba', quality: 5, reason: 'Qwen-MT for CJK pairs' },
    tts: { primary: 'alibaba', fallback: 'azure', zone: 'alibaba', quality: 5, reason: 'Qwen3-TTS native prosody (MOS 4.5+)' },
    stt: { primary: 'alibaba', fallback: 'openai', zone: 'alibaba', quality: 5, reason: 'Paraformer for CJK audio' },
    voice_clone: { primary: 'alibaba', fallback: 'elevenlabs', zone: 'alibaba', quality: 4, reason: 'Alibaba voice clone for CJK' },
    music_gen: { primary: 'elevenlabs', fallback: 'alibaba', zone: 'alibaba', quality: 4, reason: 'ElevenLabs music' },
    sfx_gen: { primary: 'elevenlabs', fallback: 'alibaba', zone: 'alibaba', quality: 4, reason: 'ElevenLabs SFX' },
    image_gen: { primary: 'alibaba', fallback: 'modelslab', zone: 'alibaba', quality: 5, reason: 'Alibaba Wanx for CJK aesthetics' },
    video_gen: { primary: 'alibaba', fallback: 'modelslab', zone: 'alibaba', quality: 5, reason: 'WAN 2.2 for CJK video' },
    avatar: { primary: 'alibaba', fallback: 'replicate', zone: 'alibaba', quality: 5, reason: 'Alibaba WAN 2.2 avatars' },
    lip_sync: { primary: 'alibaba', fallback: 'azure', zone: 'alibaba', quality: 5, reason: 'Alibaba native lip-sync' },
    '3d_gen': { primary: 'modelslab', fallback: 'replicate', zone: 'alibaba', quality: 4, reason: 'ModelsLab 3D' },
    ocr: { primary: 'deepseek', fallback: 'azure', zone: 'alibaba', quality: 5, reason: 'DeepSeek-VL for CJK docs' },
    vision: { primary: 'alibaba', fallback: 'openai', zone: 'alibaba', quality: 5, reason: 'Qwen-VL vision' },
    data_viz: { primary: 'alibaba', fallback: 'gemini', zone: 'alibaba', quality: 4, reason: 'Qwen for data' },
    auth: { primary: 'supabase', fallback: 'supabase', zone: 'alibaba', quality: 5, reason: 'Supabase Auth' },
    storage: { primary: 'supabase', fallback: 'supabase', zone: 'alibaba', quality: 5, reason: 'Supabase Storage' },
    payments: { primary: 'stripe', fallback: 'stripe', zone: 'alibaba', quality: 5, reason: 'Stripe Payments' },
  },
  // NEW: Arabic/MENA zone uses GPT-4o (NOT Qwen - per quality benchmarks)
  arabic: {
    llm: { primary: 'openai', fallback: 'claude', zone: 'fallback', quality: 5, reason: 'GPT-4o best for Arabic (AraBench validated)' },
    script_gen: { primary: 'openai', fallback: 'claude', zone: 'fallback', quality: 5, reason: 'GPT-4o Arabic narrative' },
    summarization: { primary: 'openai', fallback: 'claude', zone: 'fallback', quality: 5, reason: 'GPT-4o Arabic summarization' },
    translation: { primary: 'azure', fallback: 'deepl', zone: 'fallback', quality: 5, reason: 'Azure best for Arabic dialects' },
    tts: { primary: 'azure', fallback: 'openai', zone: 'fallback', quality: 5, reason: 'Azure Neural Arabic (Gulf/Egyptian dialects)' },
    stt: { primary: 'openai', fallback: 'azure', zone: 'fallback', quality: 5, reason: 'Whisper for Arabic STT' },
    voice_clone: { primary: 'elevenlabs', fallback: 'azure', zone: 'fallback', quality: 4, reason: 'ElevenLabs Arabic clone' },
    music_gen: { primary: 'elevenlabs', fallback: 'elevenlabs', zone: 'fallback', quality: 4, reason: 'ElevenLabs music' },
    sfx_gen: { primary: 'elevenlabs', fallback: 'elevenlabs', zone: 'fallback', quality: 4, reason: 'ElevenLabs SFX' },
    image_gen: { primary: 'modelslab', fallback: 'openai', zone: 'fallback', quality: 5, reason: 'FLUX for Arabic content' },
    video_gen: { primary: 'modelslab', fallback: 'alibaba', zone: 'fallback', quality: 5, reason: 'ModelsLab video gen' },
    avatar: { primary: 'alibaba', fallback: 'replicate', zone: 'fallback', quality: 5, reason: 'Alibaba WAN 2.2 global' },
    lip_sync: { primary: 'azure', fallback: 'alibaba', zone: 'fallback', quality: 5, reason: 'Azure Visemes' },
    '3d_gen': { primary: 'modelslab', fallback: 'replicate', zone: 'fallback', quality: 4, reason: 'ModelsLab 3D' },
    ocr: { primary: 'azure', fallback: 'openai', zone: 'fallback', quality: 5, reason: 'Azure Form Recognizer for Arabic docs' },
    vision: { primary: 'openai', fallback: 'gemini', zone: 'fallback', quality: 5, reason: 'GPT-4o Vision' },
    data_viz: { primary: 'openai', fallback: 'gemini', zone: 'fallback', quality: 5, reason: 'GPT-4o code gen' },
    auth: { primary: 'supabase', fallback: 'supabase', zone: 'fallback', quality: 5, reason: 'Supabase Auth' },
    storage: { primary: 'supabase', fallback: 'supabase', zone: 'fallback', quality: 5, reason: 'Supabase Storage' },
    payments: { primary: 'stripe', fallback: 'stripe', zone: 'fallback', quality: 5, reason: 'Stripe Payments' },
  },
  gemini: {
    llm: { primary: 'gemini', fallback: 'openai', zone: 'gemini', quality: 5, reason: 'Gemini Pro for India/SEA/Africa' },
    script_gen: { primary: 'gemini', fallback: 'openai', zone: 'gemini', quality: 5, reason: 'Gemini for multilingual' },
    summarization: { primary: 'gemini', fallback: 'openai', zone: 'gemini', quality: 5, reason: '1M context window' },
    translation: { primary: 'gemini', fallback: 'deepl', zone: 'gemini', quality: 5, reason: 'Google Translate for Indian langs' },
    tts: { primary: 'azure', fallback: 'gemini', zone: 'gemini', quality: 5, reason: 'Azure Neural for India/Africa' },
    stt: { primary: 'openai', fallback: 'azure', zone: 'gemini', quality: 5, reason: 'Whisper multilingual' },
    voice_clone: { primary: 'elevenlabs', fallback: 'azure', zone: 'gemini', quality: 4, reason: 'ElevenLabs clone' },
    music_gen: { primary: 'elevenlabs', fallback: 'elevenlabs', zone: 'gemini', quality: 4, reason: 'ElevenLabs music' },
    sfx_gen: { primary: 'elevenlabs', fallback: 'elevenlabs', zone: 'gemini', quality: 4, reason: 'ElevenLabs SFX' },
    image_gen: { primary: 'gemini', fallback: 'modelslab', zone: 'gemini', quality: 5, reason: 'Gemini Image/Imagen' },
    video_gen: { primary: 'modelslab', fallback: 'alibaba', zone: 'gemini', quality: 5, reason: 'ModelsLab video' },
    avatar: { primary: 'alibaba', fallback: 'replicate', zone: 'gemini', quality: 5, reason: 'Alibaba WAN 2.2 global' },
    lip_sync: { primary: 'azure', fallback: 'alibaba', zone: 'gemini', quality: 5, reason: 'Azure Visemes' },
    '3d_gen': { primary: 'replicate', fallback: 'modelslab', zone: 'gemini', quality: 4, reason: 'Replicate 3D models' },
    ocr: { primary: 'gemini', fallback: 'azure', zone: 'gemini', quality: 5, reason: 'Gemini Vision for docs' },
    vision: { primary: 'gemini', fallback: 'openai', zone: 'gemini', quality: 5, reason: 'Gemini 1M context vision' },
    data_viz: { primary: 'gemini', fallback: 'openai', zone: 'gemini', quality: 5, reason: 'Gemini code gen' },
    auth: { primary: 'supabase', fallback: 'supabase', zone: 'gemini', quality: 5, reason: 'Supabase Auth' },
    storage: { primary: 'supabase', fallback: 'supabase', zone: 'gemini', quality: 5, reason: 'Supabase Storage' },
    payments: { primary: 'stripe', fallback: 'stripe', zone: 'gemini', quality: 5, reason: 'Stripe Payments' },
  },
  fallback: {
    llm: { primary: 'openai', fallback: 'gemini', zone: 'fallback', quality: 5, reason: 'GPT-4o universal fallback' },
    script_gen: { primary: 'openai', fallback: 'claude', zone: 'fallback', quality: 5, reason: 'GPT-4o writing' },
    summarization: { primary: 'openai', fallback: 'gemini', zone: 'fallback', quality: 5, reason: 'GPT-4o summarization' },
    translation: { primary: 'deepl', fallback: 'gemini', zone: 'fallback', quality: 5, reason: 'DeepL + Google backup' },
    tts: { primary: 'openai', fallback: 'azure', zone: 'fallback', quality: 5, reason: 'OpenAI TTS' },
    stt: { primary: 'openai', fallback: 'azure', zone: 'fallback', quality: 5, reason: 'Whisper STT' },
    voice_clone: { primary: 'elevenlabs', fallback: 'azure', zone: 'fallback', quality: 5, reason: 'ElevenLabs clone' },
    music_gen: { primary: 'elevenlabs', fallback: 'elevenlabs', zone: 'fallback', quality: 4, reason: 'ElevenLabs music' },
    sfx_gen: { primary: 'elevenlabs', fallback: 'elevenlabs', zone: 'fallback', quality: 4, reason: 'ElevenLabs SFX' },
    image_gen: { primary: 'modelslab', fallback: 'openai', zone: 'fallback', quality: 5, reason: 'ModelsLab FLUX' },
    video_gen: { primary: 'modelslab', fallback: 'replicate', zone: 'fallback', quality: 5, reason: 'ModelsLab video' },
    avatar: { primary: 'alibaba', fallback: 'replicate', zone: 'fallback', quality: 5, reason: 'Alibaba WAN 2.2' },
    lip_sync: { primary: 'azure', fallback: 'alibaba', zone: 'fallback', quality: 5, reason: 'Azure Visemes' },
    '3d_gen': { primary: 'modelslab', fallback: 'replicate', zone: 'fallback', quality: 4, reason: 'ModelsLab 3D' },
    ocr: { primary: 'azure', fallback: 'openai', zone: 'fallback', quality: 5, reason: 'Azure Form Recognizer' },
    vision: { primary: 'openai', fallback: 'gemini', zone: 'fallback', quality: 5, reason: 'GPT-4o Vision' },
    data_viz: { primary: 'openai', fallback: 'gemini', zone: 'fallback', quality: 5, reason: 'GPT-4o code gen' },
    auth: { primary: 'supabase', fallback: 'supabase', zone: 'fallback', quality: 5, reason: 'Supabase Auth' },
    storage: { primary: 'supabase', fallback: 'supabase', zone: 'fallback', quality: 5, reason: 'Supabase Storage' },
    payments: { primary: 'stripe', fallback: 'stripe', zone: 'fallback', quality: 5, reason: 'Stripe Payments' },
  },
};

// ============================================================================
// PIPELINE CATEGORY → CAPABILITY MAPPING
// ============================================================================

export type PipelineCategoryType = 
  | 'presentation' | 'video_production' | 'content_repurposing' 
  | 'training_ld' | 'marketing_advertising' | 'social_media'
  | 'sales_enablement' | 'customer_education' | 'localization'
  | 'data_analytics' | 'internal_comms' | 'live_realtime'
  | 'immersive_3d' | 'audio_sfx';

const CATEGORY_CAPABILITY_MAP: Record<PipelineCategoryType, PipelineCapability[]> = {
  presentation: ['llm', 'script_gen', 'image_gen', 'data_viz'],
  video_production: ['video_gen', 'avatar', 'lip_sync', 'tts', 'music_gen'],
  content_repurposing: ['llm', 'summarization', 'stt', 'video_gen'],
  training_ld: ['llm', 'script_gen', 'tts', 'avatar', 'image_gen'],
  marketing_advertising: ['llm', 'image_gen', 'video_gen', 'tts', 'music_gen'],
  social_media: ['video_gen', 'image_gen', 'tts', 'music_gen'],
  sales_enablement: ['llm', 'script_gen', 'avatar', 'tts', 'data_viz'],
  customer_education: ['llm', 'script_gen', 'avatar', 'tts', 'image_gen'],
  localization: ['translation', 'tts', 'voice_clone', 'stt'],
  data_analytics: ['llm', 'data_viz', 'ocr', 'vision'],
  internal_comms: ['llm', 'tts', 'avatar', 'video_gen'],
  live_realtime: ['llm', 'stt', 'tts', 'avatar'],
  immersive_3d: ['3d_gen', 'image_gen', 'video_gen'],
  audio_sfx: ['tts', 'music_gen', 'sfx_gen', 'voice_clone'],
};

// ============================================================================
// DYNAMIC PROVIDER RESOLVER
// ============================================================================

export interface PipelineProviderContext {
  zone: LLMZone;
  languageCode?: string;
  contentType?: string;
  industry?: string;
  tier?: 'standard' | 'advanced' | 'premium';
}

export interface ResolvedPipelineProviders {
  pipelineId: string;
  category: PipelineCategoryType;
  primaryProviders: ProviderId[];
  fallbackProviders: ProviderId[];
  routes: Record<PipelineCapability, DynamicProviderRoute>;
  qualityScore: number;
  confidence: number;
}

/**
 * Remap deprecated provider to core 12 providers
 */
export function remapToCore(providerId: string): ProviderId {
  if (CORE_PROVIDERS.includes(providerId as ProviderId)) {
    return providerId as ProviderId;
  }
  const mapping = DEPRECATED_TO_CORE_MAP[providerId];
  return mapping?.primary || 'openai';
}

/**
 * Get dynamic provider routing for a specific capability
 */
export function getProviderForCapability(
  capability: PipelineCapability,
  zone: LLMZone = 'fallback'
): DynamicProviderRoute {
  return CAPABILITY_ZONE_ROUTING[zone][capability];
}

/**
 * Resolve providers for a complete pipeline based on category and context
 */
export function resolvePipelineProviders(
  pipelineId: string,
  category: PipelineCategoryType,
  context: PipelineProviderContext
): ResolvedPipelineProviders {
  const { zone } = context;
  const capabilities = CATEGORY_CAPABILITY_MAP[category];
  
  const routes: Record<string, DynamicProviderRoute> = {};
  const primarySet = new Set<ProviderId>();
  const fallbackSet = new Set<ProviderId>();
  let totalQuality = 0;
  
  for (const capability of capabilities) {
    const route = CAPABILITY_ZONE_ROUTING[zone][capability];
    routes[capability] = route;
    primarySet.add(route.primary);
    fallbackSet.add(route.fallback);
    totalQuality += route.quality;
  }
  
  // Remove primary providers from fallback set
  for (const primary of primarySet) {
    fallbackSet.delete(primary);
  }
  
  const avgQuality = capabilities.length > 0 ? totalQuality / capabilities.length : 3;
  
  return {
    pipelineId,
    category,
    primaryProviders: Array.from(primarySet),
    fallbackProviders: Array.from(fallbackSet),
    routes: routes as Record<PipelineCapability, DynamicProviderRoute>,
    qualityScore: Math.round((avgQuality / 5) * 100),
    confidence: Math.round((avgQuality / 5) * 100),
  };
}

/**
 * Resolve providers for multiple pipelines
 */
export function resolveBatchPipelineProviders(
  pipelines: Array<{ pipelineId: string; category: PipelineCategoryType }>,
  context: PipelineProviderContext
): ResolvedPipelineProviders[] {
  return pipelines.map(p => resolvePipelineProviders(p.pipelineId, p.category, context));
}

/**
 * Get optimal providers for a category based on zone
 */
export function getCategoryOptimalProviders(
  category: PipelineCategoryType,
  zone: LLMZone = 'fallback'
): { primary: ProviderId[]; fallback: ProviderId[] } {
  const capabilities = CATEGORY_CAPABILITY_MAP[category];
  const primarySet = new Set<ProviderId>();
  const fallbackSet = new Set<ProviderId>();
  
  for (const capability of capabilities) {
    const route = CAPABILITY_ZONE_ROUTING[zone][capability];
    primarySet.add(route.primary);
    fallbackSet.add(route.fallback);
  }
  
  return {
    primary: Array.from(primarySet),
    fallback: Array.from(fallbackSet).filter(f => !primarySet.has(f)),
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const pipelineDynamicProviderRouting = {
  CORE_PROVIDERS,
  DEPRECATED_TO_CORE_MAP,
  CAPABILITY_ZONE_ROUTING,
  CATEGORY_CAPABILITY_MAP,
  remapToCore,
  getProviderForCapability,
  resolvePipelineProviders,
  resolveBatchPipelineProviders,
  getCategoryOptimalProviders,
};

export default pipelineDynamicProviderRouting;

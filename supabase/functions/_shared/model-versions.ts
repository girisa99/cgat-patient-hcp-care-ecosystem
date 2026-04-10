/**
 * SERVER-SIDE MODEL VERSION REGISTRY
 *
 * Hardcoded fallback for model versions used in edge functions.
 * DB-driven resolution via dynamic-model-resolver.ts is the PRIMARY source.
 * These values are used ONLY when the DB is unreachable.
 *
 * To update models: UPDATE ai_model_registry in the database.
 * These hardcoded values should be periodically synced with DB state.
 *
 * Imported by: style-intent-routing.ts, image-providers.ts, video-providers.ts
 */

import { resolveModel, getActiveModelFromDB, warmModelCache } from './dynamic-model-resolver.ts';

// Re-export resolver functions for consumers
export { resolveModel, getActiveModelFromDB, warmModelCache };

// ─── ACTIVE MODEL IDS (hardcoded fallback) ─────────────────────────────────

export const ACTIVE_MODELS = {
  // Image generation
  image: {
    alibaba:     'wan2.6-t2i',
    gemini:      'gemini-2.5-flash-image',
    vertexImagen:'imagen-3.0-generate-002',
    openai:      'gpt-image-1',
    openaiDalle: 'gpt-image-1',
    flux:        'flux',
    fluxSchnell: 'black-forest-labs/FLUX.1-schnell',
    replicateFlux: 'black-forest-labs/flux-schnell',
  },

  // Video generation
  video: {
    alibabaT2V:  'wan2.6-t2v',
    alibabaI2V:  'wan2.6-i2v',
    alibabaS2V:  'wan2.2-s2v',
    veo:         'veo-3.1-generate',
    sora:        'sora-2.0-turbo',
    animateDiff: 'animatediff',
  },

  // TTS
  tts: {
    cosyvoiceFlash: 'cosyvoice-v3-flash',
    cosyvoicePlus:  'cosyvoice-v3-plus',
    qwenTTS:        'qwen3-tts',
    elevenlabsV2:   'eleven_multilingual_v2',
    elevenlabsTurbo:'eleven_turbo_v2_5',
    openaiTTS:      'tts-1-hd',
  },

  // STT
  stt: {
    whisper:     'whisper-1',
    paraformer:  'paraformer',
  },

  // 3D generation
  threeD: {
    meshy:       'meshy-6',
    meshyT2D:    'meshy-text-to-3d',
    meshyI2D:    'meshy-image-to-3d',
    taoAvatar:   'tao-avatar',
    mach:        'mach',
    triposr:     'triposr',
  },

  // Lipsync
  lipsync: {
    alibabaWan:  'alibaba-wan2.2',
    omniAvatar:  'alibaba-omniavatar',
    sadTalker:   'sadtalker',
    wav2lip:     'wav2lip',
  },

  // LLM
  llm: {
    geminiPro:   'gemini-2.5-pro',
    geminiFlash: 'gemini-2.5-flash',
    gpt4o:       'gpt-4o',
    gpt4oMini:   'gpt-4o-mini',
    qwenMax:     'qwen-max',
  },
} as const;

// ─── HELPERS ───────────────────────────────────────────────────────────────

/**
 * Get the default image model for a provider.
 */
export function getDefaultImageModelFromRegistry(provider: string): string {
  switch (provider) {
    case 'gemini':        return ACTIVE_MODELS.image.gemini;
    case 'vertex-imagen': return ACTIVE_MODELS.image.vertexImagen;
    case 'openai':        return ACTIVE_MODELS.image.openai;
    case 'alibaba':       return ACTIVE_MODELS.image.alibaba;
    case 'modelslab':     return ACTIVE_MODELS.image.flux;
    case 'huggingface':   return ACTIVE_MODELS.image.fluxSchnell;
    case 'replicate':     return ACTIVE_MODELS.image.replicateFlux;
    default:              return ACTIVE_MODELS.image.openai;
  }
}

/**
 * Get the default video model for a provider.
 */
export function getDefaultVideoModelFromRegistry(provider: string): string {
  switch (provider) {
    case 'alibaba-wan':      return ACTIVE_MODELS.video.alibabaT2V;
    case 'vertex-veo':       return ACTIVE_MODELS.video.veo;
    case 'sora-2':           return ACTIVE_MODELS.video.sora;
    case 'modelslab-animate': return ACTIVE_MODELS.video.animateDiff;
    default:                 return ACTIVE_MODELS.video.alibabaT2V;
  }
}

// ─── DB-DRIVEN HELPERS ────────────────────────────────────────────────────

/**
 * Get the default image model for a provider — DB-driven with hardcoded fallback.
 */
export async function getImageModelDynamic(provider: string): Promise<string> {
  const dbModel = await getActiveModelFromDB(provider, 'text-to-image');
  if (dbModel) return dbModel;
  return getDefaultImageModelFromRegistry(provider);
}

/**
 * Get the default video model for a provider — DB-driven with hardcoded fallback.
 */
export async function getVideoModelDynamic(provider: string): Promise<string> {
  const dbModel = await getActiveModelFromDB(provider, 'text-to-video');
  if (dbModel) return dbModel;
  return getDefaultVideoModelFromRegistry(provider);
}

/**
 * Get the default LLM model for a provider — DB-driven with hardcoded fallback.
 */
export async function getLLMModelDynamic(provider: string): Promise<string> {
  const dbModel = await getActiveModelFromDB(provider, 'llm');
  if (dbModel) return dbModel;
  // Hardcoded fallback
  switch (provider) {
    case 'anthropic': return 'claude-sonnet-4-6';
    case 'openai':    return ACTIVE_MODELS.llm.gpt4o;
    case 'gemini':    return ACTIVE_MODELS.llm.geminiPro;
    case 'alibaba':   return ACTIVE_MODELS.llm.qwenMax;
    case 'deepseek':  return 'deepseek-chat';
    default:          return ACTIVE_MODELS.llm.gpt4o;
  }
}

/**
 * Get the default TTS model for a provider — DB-driven with hardcoded fallback.
 */
export async function getTTSModelDynamic(provider: string): Promise<string> {
  const dbModel = await getActiveModelFromDB(provider, 'tts');
  if (dbModel) return dbModel;
  switch (provider) {
    case 'elevenlabs': return ACTIVE_MODELS.tts.elevenlabsV2;
    case 'alibaba':    return ACTIVE_MODELS.tts.cosyvoiceFlash;
    case 'openai':     return ACTIVE_MODELS.tts.openaiTTS;
    default:           return ACTIVE_MODELS.tts.elevenlabsV2;
  }
}

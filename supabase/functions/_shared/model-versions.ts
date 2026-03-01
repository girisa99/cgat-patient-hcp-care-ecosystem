/**
 * SERVER-SIDE MODEL VERSION REGISTRY
 *
 * Single source of truth for model versions used in edge functions.
 * Mirrors the active models from the client-side provider-version-registry.ts
 * so that model updates happen in ONE place per environment.
 *
 * When a model is updated:
 *   1. Update the client-side registry: src/config/provider-version-registry.ts
 *   2. Update this file to match
 *
 * Imported by: style-intent-routing.ts, image-providers.ts, video-providers.ts
 */

// ─── ACTIVE MODEL IDS ─────────────────────────────────────────────────────

export const ACTIVE_MODELS = {
  // Image generation
  image: {
    alibaba:     'wan2.6-t2i',
    gemini:      'gemini-2.5-flash-preview-image-generation',
    vertexImagen:'imagen-3.0-generate-002',
    openai:      'gpt-image-1',
    openaiDalle: 'dall-e-3',
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

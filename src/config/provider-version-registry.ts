/**
 * PROVIDER VERSION REGISTRY
 *
 * Single source of truth for ALL provider model versions.
 * Every other file imports from here — model updates happen in ONE place.
 *
 * When a provider launches a new model:
 *   1. Call registerNewRelease() with the new model info
 *   2. Old model auto-deprecated, sunset date set
 *   3. All consumers calling getActiveModel() automatically get the new version
 *
 * @example
 *   // Get current active model for a capability
 *   getActiveModel('meshy', 'text-to-3d')    // → 'meshy-6'
 *   getActiveModel('alibaba', 'text-to-video') // → 'wan2.6-t2v'
 *
 *   // Check for upcoming migrations
 *   getSunsetWarnings()  // → [{ modelId: 'meshy-4', sunsetDate: '2026-03-20', ... }]
 */

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type ProviderModelStatus = 'active' | 'deprecated' | 'sunset' | 'preview';

export interface ProviderModelVersion {
  /** Provider identifier (meshy, alibaba, gemini, elevenlabs, openai, etc.) */
  providerId: string;
  /** Canonical model ID used across the codebase */
  modelId: string;
  /** Semantic version string */
  version: string;
  /** Lifecycle status */
  status: ProviderModelStatus;
  /** ISO date when this version stops working (sunset models) */
  sunsetDate?: string;
  /** Model ID of the replacement (for deprecated/sunset models) */
  replacedBy?: string;
  /** What this model can do */
  capabilities: string[];
  /** Edge function that handles this model */
  apiEndpoint?: string;
  /** Additional metadata (latency tier, quality tier, etc.) */
  meta?: Record<string, unknown>;
}

// ─── MASTER REGISTRY ─────────────────────────────────────────────────────────

export const PROVIDER_VERSIONS: Record<string, ProviderModelVersion[]> = {

  // ── Meshy (3D Generation) ──────────────────────────────────────────────────
  meshy: [
    {
      providerId: 'meshy', modelId: 'meshy-6', version: '6.0', status: 'active',
      capabilities: ['text-to-3d', 'image-to-3d', 'texture'],
      apiEndpoint: 'alibaba-3d-generator',
    },
    {
      providerId: 'meshy', modelId: 'meshy-4', version: '4.0', status: 'sunset',
      sunsetDate: '2026-03-20', replacedBy: 'meshy-6',
      capabilities: ['text-to-3d', 'image-to-3d', 'texture'],
      apiEndpoint: 'alibaba-3d-generator',
    },
    {
      providerId: 'meshy', modelId: 'meshy-text-to-3d', version: '6.0', status: 'active',
      capabilities: ['text-to-3d'],
      apiEndpoint: 'alibaba-3d-generator',
    },
    {
      providerId: 'meshy', modelId: 'meshy-image-to-3d', version: '6.0', status: 'active',
      capabilities: ['image-to-3d'],
      apiEndpoint: 'alibaba-3d-generator',
    },
    {
      providerId: 'meshy', modelId: 'meshy-texture', version: '6.0', status: 'active',
      capabilities: ['texture'],
      apiEndpoint: 'alibaba-3d-generator',
    },
  ],

  // ── Alibaba (Video, Image, TTS, STT) ──────────────────────────────────────
  alibaba: [
    // Video generation
    {
      providerId: 'alibaba', modelId: 'wan2.6-t2v', version: '2.6', status: 'active',
      capabilities: ['text-to-video'],
      apiEndpoint: 'alibaba-video-generator',
    },
    {
      providerId: 'alibaba', modelId: 'wan2.6-i2v', version: '2.6', status: 'active',
      capabilities: ['image-to-video'],
      apiEndpoint: 'alibaba-video-generator',
    },
    {
      providerId: 'alibaba', modelId: 'wan2.2-s2v', version: '2.2', status: 'active',
      capabilities: ['speech-to-video'],
      apiEndpoint: 'alibaba-video-generator',
    },
    {
      providerId: 'alibaba', modelId: 'wan2.2-animate', version: '2.2', status: 'active',
      capabilities: ['animation'],
      apiEndpoint: 'alibaba-video-generator',
    },
    {
      providerId: 'alibaba', modelId: 'wan2.1-t2v', version: '2.1', status: 'deprecated',
      replacedBy: 'wan2.6-t2v',
      capabilities: ['text-to-video'],
      apiEndpoint: 'alibaba-video-generator',
    },
    {
      providerId: 'alibaba', modelId: 'wan2.1-i2v', version: '2.1', status: 'deprecated',
      replacedBy: 'wan2.6-i2v',
      capabilities: ['image-to-video'],
      apiEndpoint: 'alibaba-video-generator',
    },
    // Image generation
    {
      providerId: 'alibaba', modelId: 'wan2.6-t2i', version: '2.6', status: 'active',
      capabilities: ['text-to-image'],
      apiEndpoint: 'ai-image-generator',
    },
    {
      providerId: 'alibaba', modelId: 'wanx-v2.1', version: '2.1', status: 'active',
      capabilities: ['text-to-image'],
      apiEndpoint: 'ai-image-generator',
    },
    {
      providerId: 'alibaba', modelId: 'flux-merged', version: '1.0', status: 'active',
      capabilities: ['text-to-image'],
      apiEndpoint: 'ai-image-generator',
    },
    {
      providerId: 'alibaba', modelId: 'qwen-image-max', version: '1.0', status: 'active',
      capabilities: ['text-to-image', 'image-editing'],
      apiEndpoint: 'ai-image-generator',
    },
    // TTS
    {
      providerId: 'alibaba', modelId: 'cosyvoice-v3-flash', version: '3.0', status: 'active',
      capabilities: ['tts'],
      apiEndpoint: 'multi-provider-tts',
    },
    {
      providerId: 'alibaba', modelId: 'cosyvoice-v3-plus', version: '3.0', status: 'active',
      capabilities: ['tts-premium'],
      apiEndpoint: 'multi-provider-tts',
    },
    {
      providerId: 'alibaba', modelId: 'qwen3-tts', version: '3.0', status: 'active',
      capabilities: ['tts'],
      apiEndpoint: 'multi-provider-tts',
    },
    // STT
    {
      providerId: 'alibaba', modelId: 'paraformer', version: '1.0', status: 'active',
      capabilities: ['stt', 'speech-recognition'],
      apiEndpoint: 'ai-universal-processor',
    },
    // LLM
    {
      providerId: 'alibaba', modelId: 'qwen-max', version: '2.5', status: 'active',
      capabilities: ['llm', 'text-generation'],
    },
    {
      providerId: 'alibaba', modelId: 'qwen-2.5-72b', version: '2.5', status: 'active',
      capabilities: ['llm', 'text-generation'],
    },
    // Avatar / 3D
    {
      providerId: 'alibaba', modelId: 'tao-avatar', version: '1.0', status: 'active',
      capabilities: ['avatar-3d', 'full-body-ar'],
      apiEndpoint: 'alibaba-3d-generator',
    },
    {
      providerId: 'alibaba', modelId: 'mach', version: '1.0', status: 'active',
      capabilities: ['text-to-3d-character'],
      apiEndpoint: 'alibaba-3d-generator',
    },
    // Lipsync
    {
      providerId: 'alibaba', modelId: 'alibaba-wan2.2', version: '2.2', status: 'active',
      capabilities: ['lipsync'],
      apiEndpoint: 'ai-video-generator',
    },
    {
      providerId: 'alibaba', modelId: 'alibaba-omniavatar', version: '1.0', status: 'active',
      capabilities: ['lipsync', 'audio-driven-avatar'],
      apiEndpoint: 'ai-video-generator',
    },
  ],

  // ── Google / Gemini ────────────────────────────────────────────────────────
  gemini: [
    {
      providerId: 'gemini', modelId: 'gemini-2.5-pro', version: '2.5', status: 'active',
      capabilities: ['llm', 'vision', 'code-generation'],
    },
    {
      providerId: 'gemini', modelId: 'gemini-2.5-flash', version: '2.5', status: 'active',
      capabilities: ['llm', 'image-gen', 'vision'],
    },
    {
      providerId: 'gemini', modelId: 'veo-3.1-generate', version: '3.1', status: 'active',
      capabilities: ['text-to-video'],
      apiEndpoint: 'ai-video-generator',
    },
    {
      providerId: 'gemini', modelId: 'imagen-3.0-generate-002', version: '3.0', status: 'active',
      capabilities: ['text-to-image'],
      apiEndpoint: 'ai-image-generator',
    },
  ],

  // ── ElevenLabs ─────────────────────────────────────────────────────────────
  elevenlabs: [
    {
      providerId: 'elevenlabs', modelId: 'eleven_multilingual_v2', version: '2.0', status: 'active',
      capabilities: ['tts', 'multilingual-tts'],
      apiEndpoint: 'multi-provider-tts',
    },
    {
      providerId: 'elevenlabs', modelId: 'eleven_turbo_v2_5', version: '2.5', status: 'active',
      capabilities: ['tts', 'low-latency-tts'],
      apiEndpoint: 'multi-provider-tts',
    },
  ],

  // ── OpenAI ─────────────────────────────────────────────────────────────────
  openai: [
    {
      providerId: 'openai', modelId: 'gpt-4o', version: '4.0', status: 'active',
      capabilities: ['llm', 'vision', 'function-calling'],
    },
    {
      providerId: 'openai', modelId: 'gpt-4o-mini', version: '4.0', status: 'active',
      capabilities: ['llm', 'vision'],
    },
    {
      providerId: 'openai', modelId: 'o3', version: '3.0', status: 'active',
      capabilities: ['llm', 'reasoning'],
    },
    {
      providerId: 'openai', modelId: 'gpt-image-1', version: '1.0', status: 'active',
      capabilities: ['image-gen'],
      apiEndpoint: 'ai-image-generator',
    },
    {
      providerId: 'openai', modelId: 'whisper-1', version: '1.0', status: 'active',
      capabilities: ['stt', 'speech-recognition'],
      apiEndpoint: 'ai-universal-processor',
    },
    {
      providerId: 'openai', modelId: 'tts-1-hd', version: '1.0', status: 'active',
      capabilities: ['tts'],
      apiEndpoint: 'multi-provider-tts',
    },
    {
      providerId: 'openai', modelId: 'dall-e-3', version: '3.0', status: 'active',
      capabilities: ['text-to-image'],
      apiEndpoint: 'ai-image-generator',
    },
    {
      providerId: 'openai', modelId: 'sora-2.0-turbo', version: '2.0', status: 'active',
      capabilities: ['text-to-video'],
      apiEndpoint: 'ai-video-generator',
    },
  ],

  // ── FLUX ───────────────────────────────────────────────────────────────────
  flux: [
    {
      providerId: 'flux', modelId: 'flux-pro', version: '1.0', status: 'active',
      capabilities: ['text-to-image'],
      apiEndpoint: 'ai-image-generator',
    },
    {
      providerId: 'flux', modelId: 'flux-dev', version: '1.0', status: 'active',
      capabilities: ['text-to-image'],
      apiEndpoint: 'ai-image-generator',
    },
    {
      providerId: 'flux', modelId: 'flux-schnell', version: '1.0', status: 'active',
      capabilities: ['text-to-image', 'fast-image'],
      apiEndpoint: 'ai-image-generator',
    },
    {
      providerId: 'flux', modelId: 'flux-1.1-pro', version: '1.1', status: 'active',
      capabilities: ['text-to-image'],
      apiEndpoint: 'ai-image-generator',
    },
  ],

  // ── Replicate ──────────────────────────────────────────────────────────────
  replicate: [
    {
      providerId: 'replicate', modelId: 'sadtalker', version: '1.0', status: 'active',
      capabilities: ['lipsync', 'face-animation'],
      apiEndpoint: 'ai-video-generator',
    },
    {
      providerId: 'replicate', modelId: 'wav2lip', version: '1.0', status: 'active',
      capabilities: ['lipsync'],
      apiEndpoint: 'ai-video-generator',
    },
    {
      providerId: 'replicate', modelId: 'triposr', version: '1.0', status: 'active',
      capabilities: ['image-to-3d'],
      apiEndpoint: 'alibaba-3d-generator',
    },
  ],

  // ── ModelsLab ──────────────────────────────────────────────────────────────
  modelslab: [
    {
      providerId: 'modelslab', modelId: 'animatediff', version: '1.0', status: 'active',
      capabilities: ['text-to-video', 'animation'],
    },
    {
      providerId: 'modelslab', modelId: 'svd', version: '1.0', status: 'active',
      capabilities: ['image-to-video'],
    },
    {
      providerId: 'modelslab', modelId: 'modelslab-text2video', version: '1.0', status: 'active',
      capabilities: ['text-to-video'],
    },
    {
      providerId: 'modelslab', modelId: 'modelslab-3d', version: '1.0', status: 'active',
      capabilities: ['text-to-3d'],
    },
  ],
};

// ─── LOOKUP HELPERS ──────────────────────────────────────────────────────────

/**
 * Get the active model ID for a provider + capability.
 * Always returns the latest active version — no code changes needed on model updates.
 *
 * @example getActiveModel('meshy', 'text-to-3d') → 'meshy-6'
 * @example getActiveModel('alibaba', 'text-to-video') → 'wan2.6-t2v'
 */
export function getActiveModel(providerId: string, capability: string): string | undefined {
  const models = PROVIDER_VERSIONS[providerId];
  if (!models) return undefined;

  const active = models.find(
    m => m.status === 'active' && m.capabilities.includes(capability)
  );
  return active?.modelId;
}

/**
 * Get full model version info by model ID.
 */
export function getModelVersion(modelId: string): ProviderModelVersion | undefined {
  for (const models of Object.values(PROVIDER_VERSIONS)) {
    const found = models.find(m => m.modelId === modelId);
    if (found) return found;
  }
  return undefined;
}

/**
 * Get all models sunsetting within 30 days (or custom window).
 */
export function getSunsetWarnings(withinDays = 30): ProviderModelVersion[] {
  const now = Date.now();
  const windowMs = withinDays * 24 * 60 * 60 * 1000;
  const result: ProviderModelVersion[] = [];

  for (const models of Object.values(PROVIDER_VERSIONS)) {
    for (const m of models) {
      if (m.sunsetDate && (m.status === 'sunset' || m.status === 'deprecated')) {
        const sunsetMs = new Date(m.sunsetDate).getTime();
        if (sunsetMs - now <= windowMs && sunsetMs > now) {
          result.push(m);
        }
      }
    }
  }

  return result.sort((a, b) =>
    new Date(a.sunsetDate!).getTime() - new Date(b.sunsetDate!).getTime()
  );
}

/**
 * If a model is sunset/deprecated, returns its replacement. Otherwise returns the same ID.
 * Use this to auto-migrate old model references.
 *
 * @example migrateModelId('meshy-4') → 'meshy-6'
 * @example migrateModelId('wan2.1-t2v') → 'wan2.6-t2v'
 * @example migrateModelId('wan2.6-t2v') → 'wan2.6-t2v' (already active)
 */
export function migrateModelId(oldModelId: string): string {
  const model = getModelVersion(oldModelId);
  if (!model) return oldModelId;
  if (model.status === 'active' || model.status === 'preview') return oldModelId;
  if (model.replacedBy) {
    // Recursive migration in case of chained replacements (A→B→C)
    return migrateModelId(model.replacedBy);
  }
  return oldModelId;
}

/**
 * Register a new model release. The old model is auto-deprecated.
 *
 * @example registerNewRelease('meshy', 'meshy-7', '7.0', 'meshy-6', ['text-to-3d', 'image-to-3d'], '2026-06-01')
 */
export function registerNewRelease(
  providerId: string,
  newModelId: string,
  version: string,
  replaces: string,
  capabilities: string[],
  sunsetDate?: string,
  apiEndpoint?: string,
): void {
  const models = PROVIDER_VERSIONS[providerId];
  if (!models) {
    PROVIDER_VERSIONS[providerId] = [];
  }

  // Deprecate the old model
  const oldModel = PROVIDER_VERSIONS[providerId].find(m => m.modelId === replaces);
  if (oldModel) {
    oldModel.status = oldModel.status === 'active' ? 'deprecated' : oldModel.status;
    oldModel.replacedBy = newModelId;
    if (sunsetDate) oldModel.sunsetDate = sunsetDate;
  }

  // Add the new model
  PROVIDER_VERSIONS[providerId].push({
    providerId,
    modelId: newModelId,
    version,
    status: 'active',
    capabilities,
    apiEndpoint: apiEndpoint ?? oldModel?.apiEndpoint,
  });
}

/**
 * Get all models needing migration within N days.
 */
export function getUpcomingMigrations(withinDays = 60): ProviderModelVersion[] {
  return getSunsetWarnings(withinDays);
}

/**
 * Get all active models for a provider.
 */
export function getActiveModelsForProvider(providerId: string): ProviderModelVersion[] {
  const models = PROVIDER_VERSIONS[providerId];
  if (!models) return [];
  return models.filter(m => m.status === 'active');
}

/**
 * Get all models (any status) for a provider.
 */
export function getAllModelsForProvider(providerId: string): ProviderModelVersion[] {
  return PROVIDER_VERSIONS[providerId] ?? [];
}

/**
 * Get the API endpoint for a model.
 */
export function getModelEndpoint(modelId: string): string | undefined {
  return getModelVersion(modelId)?.apiEndpoint;
}

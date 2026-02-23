/**
 * useProductionEstimator — Production Time & Complexity Estimator
 *
 * Informs users BEFORE they start production about:
 *   1. Estimated total generation time
 *   2. Whether the content will be chunked & stitched
 *   3. Number of chunks, scenes, and provider calls
 *   4. Provider limits that affect their content
 *   5. Maximum supported duration per provider
 *   6. Recommendations for optimal results
 *
 * Critical UX: competitors fail to communicate this, causing user frustration
 * when long productions take 30-60+ minutes.
 *
 * Maximum production support:
 *   - Soft limit: 30 minutes (900 seconds) — recommended max
 *   - Hard limit: 90 minutes (5400 seconds) — technically possible with chunking
 *   - Beyond 90 min: warn user, suggest splitting into episodes
 */

import { useMemo } from 'react';

// ─── Provider Limits ───────────────────────────────────────────────────────

export interface ProviderLimit {
  providerId: string;
  name: string;
  maxChunkSec: number;       // Max seconds per generated clip
  avgGenerationTimeSec: number; // Average time to generate one chunk
  quality: 'preview' | 'hd' | '4k';
  supportsLipSync: boolean;
  region: string;
}

export const PROVIDER_LIMITS: ProviderLimit[] = [
  { providerId: 'vertex-veo', name: 'Veo3 (Google)', maxChunkSec: 16, avgGenerationTimeSec: 45, quality: '4k', supportsLipSync: false, region: 'global' },
  { providerId: 'sora2api', name: 'Sora 2 (OpenAI)', maxChunkSec: 20, avgGenerationTimeSec: 60, quality: '4k', supportsLipSync: false, region: 'global' },
  { providerId: 'alibaba-wan26', name: 'Wan 2.6 (Alibaba)', maxChunkSec: 10, avgGenerationTimeSec: 30, quality: 'hd', supportsLipSync: false, region: 'cjk' },
  { providerId: 'alibaba-wan22', name: 'Wan 2.2 Lip-Sync', maxChunkSec: 20, avgGenerationTimeSec: 40, quality: 'hd', supportsLipSync: true, region: 'global' },
  { providerId: 'modelslab', name: 'ModelsLab', maxChunkSec: 8, avgGenerationTimeSec: 25, quality: 'hd', supportsLipSync: false, region: 'global' },
  { providerId: 'replicate-svd', name: 'Replicate SVD', maxChunkSec: 4, avgGenerationTimeSec: 20, quality: 'hd', supportsLipSync: false, region: 'global' },
  { providerId: 'gemini-video', name: 'Gemini Video', maxChunkSec: 8, avgGenerationTimeSec: 35, quality: 'hd', supportsLipSync: false, region: 'global' },
];

// ─── TTS Provider Limits ───────────────────────────────────────────────────

export interface TTSProviderLimit {
  providerId: string;
  name: string;
  maxChunkChars: number;
  avgCharsPerSecond: number;
  avgGenerationTimeSec: number; // Time to generate TTS for one chunk
  supportsStitching: boolean;
}

export const TTS_PROVIDER_LIMITS: TTSProviderLimit[] = [
  { providerId: 'elevenlabs', name: 'ElevenLabs', maxChunkChars: 5000, avgCharsPerSecond: 14, avgGenerationTimeSec: 5, supportsStitching: true },
  { providerId: 'azure', name: 'Azure Neural', maxChunkChars: 10000, avgCharsPerSecond: 14, avgGenerationTimeSec: 3, supportsStitching: false },
  { providerId: 'alibaba', name: 'CosyVoice (Alibaba)', maxChunkChars: 252, avgCharsPerSecond: 14, avgGenerationTimeSec: 4, supportsStitching: false },
  { providerId: 'google', name: 'Google Cloud TTS', maxChunkChars: 5000, avgCharsPerSecond: 14, avgGenerationTimeSec: 3, supportsStitching: false },
];

// ─── Duration Tiers ────────────────────────────────────────────────────────

export type DurationTier =
  | 'micro'       // < 30s — single chunk, no stitching
  | 'short'       // 30s-2min — 2-8 chunks, minimal stitching
  | 'medium'      // 2-10min — 10-40 chunks, stitched
  | 'long'        // 10-30min — 40-120 chunks, heavily stitched
  | 'extended'    // 30-60min — 120-250 chunks, episode-length
  | 'marathon';   // 60-90min — 250-375 chunks, max supported

export interface ProductionEstimate {
  // Content analysis
  durationTier: DurationTier;
  totalDurationSec: number;
  totalChunks: number;
  totalScenes: number;
  chunksPerScene: number;

  // Provider selection
  videoProvider: ProviderLimit;
  ttsProvider: TTSProviderLimit;
  chunkDurationSec: number; // Actual chunk size based on provider

  // Time estimates
  ttsGenerationTimeSec: number;
  videoGenerationTimeSec: number;
  assemblyTimeSec: number;
  qualityCheckTimeSec: number;
  totalEstimatedTimeSec: number;
  totalEstimatedTimeFormatted: string;

  // Stitching info
  willBeStitched: boolean;
  stitchingExplanation: string;

  // Warnings & recommendations
  warnings: string[];
  recommendations: string[];

  // Limits
  isWithinSoftLimit: boolean;  // < 30 min content
  isWithinHardLimit: boolean;  // < 90 min content
  maxSupportedDurationSec: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const SOFT_LIMIT_SEC = 1800;    // 30 minutes
const HARD_LIMIT_SEC = 5400;    // 90 minutes
const ASSEMBLY_PER_SCENE_SEC = 3; // Assembly overhead per scene
const QUALITY_CHECK_SEC = 10;     // Quality gate per production
const CHARS_PER_SECOND = 14;      // Average speaking rate

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useProductionEstimator(options: {
  scriptText?: string;
  targetDurationSec?: number;
  sceneCount?: number;
  videoProviderId?: string;
  ttsProviderId?: string;
  includeAvatar?: boolean;
  includeMusic?: boolean;
  includeBRoll?: boolean;
}) {
  const {
    scriptText = '',
    targetDurationSec,
    sceneCount = 1,
    videoProviderId = 'vertex-veo',
    ttsProviderId = 'elevenlabs',
    includeAvatar = false,
    includeMusic = false,
    includeBRoll = false,
  } = options;

  const estimate = useMemo((): ProductionEstimate => {
    // Determine content duration
    const scriptDurationSec = scriptText.length > 0
      ? scriptText.length / CHARS_PER_SECOND
      : 0;
    const totalDurationSec = targetDurationSec || scriptDurationSec || 30;

    // Resolve providers
    const videoProvider = PROVIDER_LIMITS.find(p => p.providerId === videoProviderId)
      || PROVIDER_LIMITS[0];
    const ttsProvider = TTS_PROVIDER_LIMITS.find(p => p.providerId === ttsProviderId)
      || TTS_PROVIDER_LIMITS[0];

    // For avatar lip-sync, use WAN 2.2 limits
    const effectiveVideoProvider = includeAvatar
      ? (PROVIDER_LIMITS.find(p => p.providerId === 'alibaba-wan22') || videoProvider)
      : videoProvider;

    // Calculate chunks
    const chunkDurationSec = effectiveVideoProvider.maxChunkSec - 2; // 2s safety margin
    const totalChunks = Math.ceil(totalDurationSec / chunkDurationSec);
    const effectiveScenes = Math.max(sceneCount, Math.ceil(totalChunks / 5)); // ~5 chunks per scene
    const chunksPerScene = Math.ceil(totalChunks / effectiveScenes);

    // Duration tier
    let durationTier: DurationTier;
    if (totalDurationSec < 30) durationTier = 'micro';
    else if (totalDurationSec < 120) durationTier = 'short';
    else if (totalDurationSec < 600) durationTier = 'medium';
    else if (totalDurationSec < 1800) durationTier = 'long';
    else if (totalDurationSec < 3600) durationTier = 'extended';
    else durationTier = 'marathon';

    // Time estimates
    const ttsTime = totalChunks * ttsProvider.avgGenerationTimeSec;
    // Video gen happens after TTS (sequential dependency), but scenes can be parallelized
    // Assume ~3 concurrent scene renders
    const concurrency = Math.min(3, effectiveScenes);
    const videoTime = (totalChunks * effectiveVideoProvider.avgGenerationTimeSec) / concurrency;
    const assemblyTime = effectiveScenes * ASSEMBLY_PER_SCENE_SEC;
    const qualityTime = QUALITY_CHECK_SEC;

    // Music and B-roll add parallel time (overlaps with video gen)
    const musicTime = includeMusic ? 15 : 0;
    const brollTime = includeBRoll ? effectiveScenes * 5 : 0;

    // Total: TTS runs first, then video + music in parallel, then assembly + quality
    const totalTime = ttsTime + Math.max(videoTime, musicTime, brollTime) + assemblyTime + qualityTime;

    // Stitching info
    const willBeStitched = totalChunks > 1;
    const stitchingExplanation = willBeStitched
      ? `Your ${formatDuration(totalDurationSec)} video will be produced in ${totalChunks} segments (max ${chunkDurationSec}s each from ${effectiveVideoProvider.name}), then seamlessly stitched together with ${effectiveScenes > 1 ? 'cross-fade transitions between scenes' : 'smooth transitions'}.`
      : `Your ${formatDuration(totalDurationSec)} video fits within ${effectiveVideoProvider.name}'s ${effectiveVideoProvider.maxChunkSec}s limit — no stitching needed.`;

    // Warnings
    const warnings: string[] = [];
    if (totalDurationSec > HARD_LIMIT_SEC) {
      warnings.push(`Content exceeds 90-minute maximum. Consider splitting into episodes.`);
    } else if (totalDurationSec > SOFT_LIMIT_SEC) {
      warnings.push(`Content over 30 minutes — production may take ${formatDuration(totalTime)}+. Consider splitting into shorter segments for faster iteration.`);
    }
    if (totalChunks > 100) {
      warnings.push(`${totalChunks} segments to generate — expect longer production time.`);
    }
    if (includeAvatar && totalDurationSec > 600) {
      warnings.push(`Avatar lip-sync for ${formatDuration(totalDurationSec)} requires ${totalChunks} lip-sync renders — consider using cinematic style for long-form.`);
    }

    // Recommendations
    const recommendations: string[] = [];
    if (totalTime > 600) {
      recommendations.push('You can continue working while production runs in the background.');
    }
    if (totalChunks > 20) {
      recommendations.push('For faster results, start with a preview quality render, then upgrade to production quality.');
    }
    if (durationTier === 'long' || durationTier === 'extended') {
      recommendations.push('Add chapter markers to organize your content — makes editing easier after generation.');
    }
    if (!includeAvatar && totalDurationSec > 120) {
      recommendations.push('Consider adding a voiceover track to complement the visual content.');
    }

    return {
      durationTier,
      totalDurationSec,
      totalChunks,
      totalScenes: effectiveScenes,
      chunksPerScene,
      videoProvider: effectiveVideoProvider,
      ttsProvider,
      chunkDurationSec,
      ttsGenerationTimeSec: ttsTime,
      videoGenerationTimeSec: videoTime,
      assemblyTimeSec: assemblyTime,
      qualityCheckTimeSec: qualityTime,
      totalEstimatedTimeSec: totalTime,
      totalEstimatedTimeFormatted: formatDuration(totalTime),
      willBeStitched,
      stitchingExplanation,
      warnings,
      recommendations,
      isWithinSoftLimit: totalDurationSec <= SOFT_LIMIT_SEC,
      isWithinHardLimit: totalDurationSec <= HARD_LIMIT_SEC,
      maxSupportedDurationSec: HARD_LIMIT_SEC,
    };
  }, [scriptText, targetDurationSec, sceneCount, videoProviderId, ttsProviderId, includeAvatar, includeMusic, includeBRoll]);

  return estimate;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatDuration(totalSec: number): string {
  if (totalSec < 60) return `${Math.round(totalSec)}s`;
  const mins = Math.floor(totalSec / 60);
  const secs = Math.round(totalSec % 60);
  if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hrs}h ${remainMins}m`;
}

export type ProductionEstimatorHook = ReturnType<typeof useProductionEstimator>;

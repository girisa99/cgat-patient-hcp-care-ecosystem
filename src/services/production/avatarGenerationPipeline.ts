/**
 * Avatar Generation Pipeline — Phase 6C (B-014)
 *
 * Per-chunk avatar video generation with audio-driven lip sync.
 * Orchestrates: TTS audio → avatar video → FFmpeg stitch.
 *
 * Provider routing:
 *   Western → D-ID / HeyGen (photorealistic talking heads)
 *   CJK → Alibaba WAN 2.2 avatar (native face synthesis)
 *   All → ModelsLab/Replicate as fallback
 *
 * Pipeline per chunk:
 *   1. Take TTS audio blob from ttsProviderLock
 *   2. Send audio + source image to avatar provider
 *   3. Get back video with lip-synced face
 *   4. Upload to cast-assets storage
 *   5. Return AvatarGenerationResult
 *
 * Final assembly:
 *   Stitch all chunk videos into scene video
 *   Scene videos assembled in Phase 6D (B-017)
 */

import { supabase } from '@/integrations/supabase/client';
import type { AvatarGenerationResult, SceneRenderStatus } from '@/utils/audioSplitStitch';
import type { TTSLockResult } from '@/utils/audioSplitStitch';

// ─── Types ──────────────────────────────────────────────────────────────────

export type AvatarProvider = 'did' | 'heygen' | 'alibaba' | 'modelslab';

export interface AvatarConfig {
  sourceImageUrl: string;
  provider?: AvatarProvider;
  style?: 'photorealistic' | '3d_animated' | 'cartoon' | 'anime';
  background?: 'transparent' | 'studio' | 'custom';
  backgroundUrl?: string;
  cropToHead?: boolean;
  framePercent?: number; // 10-100, from B-012
}

export interface ChunkVideoRequest {
  chunkIndex: number;
  sceneId: string;
  audioUrl: string;
  audioDuration: number;
  text: string;
  config: AvatarConfig;
  regionCode: string;
}

export interface SceneVideoResult {
  sceneId: string;
  videoUrl: string;
  duration: number;
  chunkResults: AvatarGenerationResult[];
  storagePath: string;
}

// ─── Provider Selection ─────────────────────────────────────────────────────

function selectAvatarProvider(regionCode: string, style: AvatarConfig['style'] = 'photorealistic'): AvatarProvider {
  if (regionCode.startsWith('CJK')) return 'alibaba';
  if (style === 'photorealistic') return 'did';
  if (style === '3d_animated' || style === 'cartoon') return 'modelslab';
  return 'did';
}

// ─── Single Chunk Avatar Generation ─────────────────────────────────────────

/**
 * Generate avatar video for a single TTS chunk.
 */
export async function generateChunkAvatar(
  request: ChunkVideoRequest,
  onProgress?: (result: Partial<AvatarGenerationResult>) => void,
): Promise<AvatarGenerationResult> {
  const provider = request.config.provider || selectAvatarProvider(request.regionCode, request.config.style);
  const startTime = Date.now();

  const baseResult: AvatarGenerationResult = {
    success: false,
    chunkIndex: request.chunkIndex,
    sceneId: request.sceneId,
    provider,
    model: provider === 'did' ? 'd-id-talks' : provider === 'alibaba' ? 'wan-2.2-avatar' : provider === 'heygen' ? 'heygen-v2' : 'modelslab-avatar',
    sourceImageUrl: request.config.sourceImageUrl,
    status: 'processing',
    progress: 10,
    generatedAt: new Date().toISOString(),
  };

  onProgress?.(baseResult);

  try {
    // Call avatar generation edge function
    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        action: 'generate_video',
        provider,
        sourceImageUrl: request.config.sourceImageUrl,
        audioUrl: request.audioUrl,
        duration: request.audioDuration,
        text: request.text,
        style: request.config.style || 'photorealistic',
        background: request.config.background || 'studio',
        backgroundUrl: request.config.backgroundUrl,
        cropToHead: request.config.cropToHead ?? true,
        framePercent: request.config.framePercent || 50,
        regionCode: request.regionCode,
      },
    });

    if (error) throw error;

    baseResult.progress = 70;
    baseResult.status = 'uploading';
    onProgress?.(baseResult);

    // Upload result to cast-assets storage
    const videoUrl = data?.videoUrl || data?.url || '';
    let storagePath = '';

    if (videoUrl && videoUrl.startsWith('data:') || videoUrl.startsWith('blob:')) {
      // Upload blob to storage
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const path = `avatars/${request.sceneId}/chunk-${request.chunkIndex}.mp4`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cast-assets')
        .upload(path, blob, { upsert: true, contentType: 'video/mp4' });

      if (!uploadError && uploadData) {
        storagePath = uploadData.path;
        const { data: urlData } = supabase.storage.from('cast-assets').getPublicUrl(path);
        baseResult.videoUrl = urlData?.publicUrl || videoUrl;
      } else {
        baseResult.videoUrl = videoUrl;
      }
    } else {
      baseResult.videoUrl = videoUrl;
    }

    baseResult.success = true;
    baseResult.videoDuration = data?.duration || request.audioDuration;
    baseResult.storagePath = storagePath;
    baseResult.status = 'complete';
    baseResult.progress = 100;
    baseResult.visemeData = data?.visemeData || undefined;

  } catch (err: any) {
    baseResult.success = false;
    baseResult.status = 'failed';
    baseResult.error = err.message || 'Avatar generation failed';
    baseResult.progress = 0;
  }

  onProgress?.(baseResult);
  return baseResult;
}

// ─── Scene-Level Pipeline ───────────────────────────────────────────────────

/**
 * Generate avatar videos for all chunks in a scene, then stitch.
 * This is the main B-014 pipeline.
 */
export async function generateSceneAvatarVideo(params: {
  sceneId: string;
  productionId: string;
  chunks: Array<{
    index: number;
    text: string;
    audioUrl: string;
    audioDuration: number;
  }>;
  config: AvatarConfig;
  regionCode: string;
  onSceneStatus?: (status: SceneRenderStatus) => void;
}): Promise<SceneVideoResult | null> {
  const { sceneId, productionId, chunks, config, regionCode, onSceneStatus } = params;

  const emitStatus = (phase: SceneRenderStatus['phase'], progress: number, artifacts: SceneRenderStatus['artifacts'] = []) => {
    onSceneStatus?.({
      productionId,
      sceneId,
      sceneNumber: parseInt(sceneId.replace('scene-', ''), 10) || 1,
      phase,
      phaseProgress: progress,
      overallProgress: progress,
      artifacts,
      updatedAt: new Date().toISOString(),
    });
  };

  emitStatus('avatar', 0);

  // Generate avatar video for each chunk
  const chunkResults: AvatarGenerationResult[] = [];
  const chunkVideoUrls: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const progress = Math.round(((i + 1) / chunks.length) * 80);

    const result = await generateChunkAvatar(
      {
        chunkIndex: chunk.index,
        sceneId,
        audioUrl: chunk.audioUrl,
        audioDuration: chunk.audioDuration,
        text: chunk.text,
        config,
        regionCode,
      },
      (partial) => emitStatus('avatar', progress),
    );

    chunkResults.push(result);

    if (result.success && result.videoUrl) {
      chunkVideoUrls.push(result.videoUrl);
    }
  }

  // Check if any chunks failed
  const failedChunks = chunkResults.filter(r => !r.success);
  if (failedChunks.length === chunkResults.length) {
    emitStatus('error', 0);
    return null;
  }

  // Stitch chunk videos into scene video
  emitStatus('stitching', 85);

  let finalVideoUrl = '';
  let finalDuration = 0;
  let storagePath = '';

  if (chunkVideoUrls.length === 1) {
    // Single chunk — no stitching needed
    finalVideoUrl = chunkVideoUrls[0];
    finalDuration = chunkResults[0].videoDuration || 0;
  } else if (chunkVideoUrls.length > 1) {
    // Multiple chunks — call server-side FFmpeg stitch
    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'stitch_videos',
          videoUrls: chunkVideoUrls,
          outputFormat: 'mp4',
          sceneId,
        },
      });

      if (error) throw error;

      finalVideoUrl = data?.videoUrl || chunkVideoUrls[0];
      finalDuration = data?.duration || chunkResults.reduce((sum, r) => sum + (r.videoDuration || 0), 0);

      // Upload stitched result
      const path = `scenes/${productionId}/${sceneId}/final.mp4`;
      if (data?.videoBlob) {
        const { data: uploadData } = await supabase.storage
          .from('cast-assets')
          .upload(path, data.videoBlob, { upsert: true, contentType: 'video/mp4' });
        if (uploadData) storagePath = uploadData.path;
      }
    } catch {
      // Fallback: use first chunk
      finalVideoUrl = chunkVideoUrls[0];
      finalDuration = chunkResults.reduce((sum, r) => sum + (r.videoDuration || 0), 0);
    }
  }

  emitStatus('complete', 100, [{
    type: 'final_scene',
    url: finalVideoUrl,
    duration: finalDuration,
  }]);

  return {
    sceneId,
    videoUrl: finalVideoUrl,
    duration: finalDuration,
    chunkResults,
    storagePath,
  };
}

// ─── Azure Viseme Data (B-015) ──────────────────────────────────────────────

/**
 * Request Azure viseme data for a text chunk.
 * Visemes are mouth shapes timed to audio for canvas overlay rendering.
 */
export async function requestAzureVisemes(params: {
  text: string;
  voiceId: string;
  language: string;
}): Promise<Array<{ offset: number; visemeId: number }>> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        action: 'tts',
        provider: 'azure',
        text: params.text,
        voice: params.voiceId,
        language: params.language,
        outputFormat: 'viseme',
        includeVisemeData: true,
      },
    });

    if (error) throw error;
    return data?.visemeData || [];
  } catch {
    return [];
  }
}

/**
 * Map viseme IDs to mouth shape names for canvas rendering.
 * Standard Azure viseme IDs (0-21).
 */
export const VISEME_SHAPES: Record<number, string> = {
  0: 'silence',
  1: 'ae_ax_ah',      // "hat", "but"
  2: 'aa',            // "hot"
  3: 'ao',            // "caught"
  4: 'ey_eh_uh',      // "say", "red"
  5: 'er',            // "bird"
  6: 'y_iy_ih_ix',    // "yet", "feel"
  7: 'w_uw',          // "wit", "boot"
  8: 'ow',            // "go"
  9: 'aw',            // "cow"
  10: 'oy',           // "boy"
  11: 'ay',           // "bite"
  12: 'h',            // "hat"
  13: 'r',            // "red"
  14: 'l',            // "lid"
  15: 's_z',          // "sit", "zip"
  16: 'sh_ch_jh_zh',  // "she", "chin"
  17: 'th_dh',        // "thin", "then"
  18: 'f_v',          // "fan", "van"
  19: 'p_b_m',        // "pit", "bit", "mit"
  20: 't_d_n',        // "tip", "dip", "nip"
  21: 'k_g_ng',       // "kit", "get", "sing"
};

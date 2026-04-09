/**
 * useVisualGeneration
 *
 * Generic visual asset generation hook for Cast production.
 * Handles image/video/avatar/lipsync generation per scene.
 * Works with any scene pipeline from DB (not hardcoded EP04 pipelines).
 *
 * EP04 Learnings Encoded:
 * L1  — Filter data: URIs before any edge function call (38MB → OOM)
 * L2  — Measure payload before sending (edge fn body limit ~6MB)
 * L4-L6 — Re-upload ALL external CDN URLs to Supabase Storage (DashScope/Replicate/ModelsLab expire)
 * L7  — Re-upload via edge function (service role key) or client-side for public buckets
 * L8  — URL domain checklist: aliyuncs.com ✓ replicate.delivery ✓ modelslab.com ✓ supabase.co ✗
 * L9  — cast-assets is PRIVATE — use signed URLs for external access
 * L14 — Edge fn timeout 60-150s; lipsync 6-18min → poll from client
 * L17 — Alibaba lipsync polling: edge fn returns alibabaTaskId, client polls 60×10s via China endpoint
 * L34 — Smart regeneration: skip permanent Supabase URLs, regen expired CDN URLs
 * L35 — Rate limiting: 1s generic, 3s before avatar-3d, 2s between scenes
 * L36 — Avatar source must be accessible to provider — re-upload first
 * L42 — Retry 3× with exponential backoff (0s, 5s, 15s) + gpt-image-1 last resort
 */

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCastProjectPersistence } from '@/hooks/useCastProjectPersistence';
import { needsCdnReUpload, isSupabaseStorageUrl, isBase64DataUri } from '@/constants/castCdnProviders';
import { CAST_STORAGE } from '@/config/castProductionConfig';
import type { GeneratedAudio } from './useTtsGeneration';

// ─── Types ──────────────────────────────────────────────────────────────────

export type AssetStatus = 'idle' | 'generating' | 'done' | 'error';

export interface SceneProductionStatus {
  visual: AssetStatus;
  music: AssetStatus;
  sfx: AssetStatus;
  assembled: AssetStatus;
  videoUrls: Record<string, string>;
  imageUrls: Record<string, string>;
  avatarUrls: Record<string, string>;
  lipsyncUrls: Record<string, string>;
  musicUrl: string | null;
  sfxUrls: string[];
  assembledClipUrl: string | null;
}

export interface ScenePipelineStep {
  type: string;
  prompt?: string;
  character?: string;
  scriptKey?: string;
  screenIds?: string[];
  duration?: number;
  style?: string;
  model?: string;
  [key: string]: unknown;
}

export interface VisualGenerationConfig {
  sceneKey: string;
  sceneTitle: string;
  pipeline: ScenePipelineStep[];
  backgroundUrl?: string;
}

function defaultSceneStatus(): SceneProductionStatus {
  return {
    visual: 'idle', music: 'idle', sfx: 'idle', assembled: 'idle',
    videoUrls: {}, imageUrls: {}, avatarUrls: {}, lipsyncUrls: {},
    musicUrl: null, sfxUrls: [], assembledClipUrl: null,
  };
}

// ─── URL Safety Utilities (L1, L4-L8) ───────────────────────────────────────
// Imported from @/constants/castCdnProviders: needsCdnReUpload, isSupabaseStorageUrl, isBase64DataUri

/** L1: Strip all base64 data URIs from a URL record */
function filterDataUris(urls: Record<string, string>): Record<string, string> {
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(urls)) {
    if (v && !isBase64DataUri(v)) {
      clean[k] = v;
    } else if (v && isBase64DataUri(v)) {
      console.warn(`[Visual] Stripped base64 from key "${k}" (${v.length} chars)`);
    }
  }
  return clean;
}

/**
 * L4-L7: Re-upload an external CDN URL to Supabase Storage for permanence.
 * Uses client-side fetch + upload (works for public buckets or with RLS bypass).
 * For private buckets, the edge function handles re-upload server-side.
 */
async function ensureStorageUrl(
  projectId: string,
  key: string,
  url: string,
  contentType: 'image' | 'video' | 'audio' = 'image',
): Promise<string> {
  // Already permanent — nothing to do
  if (isSupabaseStorageUrl(url)) return url;

  // Base64 data URI — decode and upload
  if (isBase64DataUri(url)) {
    console.warn(`[Visual] ensureStorageUrl got data URI for "${key}" — should have been filtered`);
    return url; // Don't upload data URIs here — they should be filtered upstream
  }

  // Not an expiring CDN URL — keep as-is
  if (!needsCdnReUpload(url)) return url;

  try {
    // Determine extension and mime
    let ext: string, mime: string;
    if (contentType === 'video') {
      ext = 'mp4'; mime = 'video/mp4';
    } else if (contentType === 'audio') {
      ext = url.match(/\.(mp3|wav|ogg|aac|m4a|flac)/i)?.[1] || 'mp3';
      mime = ext === 'wav' ? 'audio/wav' : ext === 'ogg' ? 'audio/ogg' : 'audio/mpeg';
    } else {
      ext = url.match(/\.(png|jpg|jpeg|webp|gif)/i)?.[1] || 'png';
      mime = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    }

    const safeName = key.replace(/[^a-zA-Z0-9_-]/g, '_');
    const storagePath = `${projectId}/${contentType}s/${safeName}.${ext}`;

    // Fetch the external URL
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
    const blob = await resp.blob();

    // Upload to Supabase Storage
    const { error } = await supabase.storage.from(CAST_STORAGE.ASSETS_BUCKET).upload(storagePath, blob, {
      contentType: mime,
      upsert: true,
    });

    if (error) {
      // L11: Client-side upload may fail on private buckets (anon key lacks INSERT)
      // Fall through and return original URL — edge function will handle re-upload later
      console.warn(`[Visual] Storage upload failed for "${key}":`, error.message);
      return url;
    }

    const { data: { publicUrl } } = supabase.storage.from(CAST_STORAGE.ASSETS_BUCKET).getPublicUrl(storagePath);
    console.log(`[Visual] Re-uploaded ${contentType} "${key}" to Storage`);
    return publicUrl;
  } catch (err) {
    console.warn(`[Visual] ensureStorageUrl failed for "${key}":`, err);
    return url; // Keep original URL as fallback
  }
}

/** L2: Measure payload size and warn if approaching edge function limit */
function measurePayload(body: unknown): number {
  const size = new Blob([JSON.stringify(body)]).size;
  if (size > 5_000_000) {
    console.error(`[Visual] PAYLOAD TOO LARGE: ${(size / 1_000_000).toFixed(1)}MB (limit ~6MB)`);
  } else if (size > 3_000_000) {
    console.warn(`[Visual] Large payload: ${(size / 1_000_000).toFixed(1)}MB`);
  }
  return size;
}

// ─── Polling helpers (L14-L17) ──────────────────────────────────────────────

/** L15: Generic polling for video task completion */
async function pollVideoTaskResult(
  taskId: string,
  maxPolls = 30,
  intervalMs = 10000,
  isLipsync = false,
): Promise<string | null> {
  for (let i = 0; i < maxPolls; i++) {
    await new Promise(r => setTimeout(r, intervalMs));
    try {
      const { data } = await supabase.functions.invoke('ai-video-generator', {
        body: { action: 'poll_task', taskId, isLipsync },
      });
      if (data?.url || data?.videoUrl) return data.url || data.videoUrl;
      if (data?.status === 'SUCCEEDED' && data?.videoUrl) return data.videoUrl;
      if (data?.status === 'FAILED' || data?.status === 'failed') {
        console.warn(`[Visual] Poll failed:`, data?.message);
        return null;
      }
    } catch { /* retry polling */ }
  }
  console.warn(`[Visual] Poll timed out after ${maxPolls} polls`);
  return null;
}

/** L15: Replicate-specific polling (longer timeout — lipsync can take 10+ min) */
async function pollReplicateResult(
  predictionId: string,
  maxPolls = 60,
  intervalMs = 10000,
): Promise<string | null> {
  for (let i = 0; i < maxPolls; i++) {
    await new Promise(r => setTimeout(r, intervalMs));
    try {
      const { data } = await supabase.functions.invoke('ai-video-generator', {
        body: { action: 'poll_replicate', predictionId },
      });
      if (data?.url) return data.url;
      if (data?.status === 'failed' || data?.status === 'canceled') return null;
    } catch { /* retry polling */ }
  }
  return null;
}

// ─── Retry with Exponential Backoff (L42) ───────────────────────────────────

interface EdgeCallResult {
  data: Record<string, unknown> | null;
  error: { message: string } | null;
}

/**
 * L42: Invoke an edge function with 3× retry and exponential backoff.
 * Backoff schedule: 0s, 5s, 15s.
 * Handles edge fn 200 with success:false (DashScope errors).
 */
async function invokeWithRetry(
  edgeFn: string,
  body: Record<string, unknown>,
  stepLabel: string,
  maxAttempts = 3,
  timeoutMs = 60000,
): Promise<EdgeCallResult> {
  let data: Record<string, unknown> | null = null;
  let error: { message: string } | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      const backoffMs = attempt === 1 ? 5000 : 15000;
      console.log(`[Visual] ${stepLabel}: retry ${attempt}/${maxAttempts - 1} after ${backoffMs / 1000}s`);
      toast.info(`${stepLabel}: retrying (attempt ${attempt + 1}/${maxAttempts})...`);
      await new Promise(r => setTimeout(r, backoffMs));
    }

    // L2: Measure payload before sending
    measurePayload(body);

    // Per-step timeout guard — prevents hanging on stuck edge functions
    const invokePromise = supabase.functions.invoke(edgeFn, { body });
    const timeoutPromise = new Promise<{ data: null; error: { message: string } }>(resolve =>
      setTimeout(() => resolve({ data: null, error: { message: `Timed out after ${timeoutMs / 1000}s` } }), timeoutMs)
    );
    const result = await Promise.race([invokePromise, timeoutPromise]);
    data = result.data as Record<string, unknown> | null;
    error = result.error as { message: string } | null;

    // Handle edge function 200 with success:false (DashScope/provider errors)
    if (!error && data && data.success === false && !data.asyncGeneration) {
      const bodyError = (data.error || data.message || 'Edge function returned success:false') as string;
      console.warn(`[Visual] ${stepLabel}: edge fn success=false: ${bodyError}`);
      error = { message: bodyError };
    }

    if (!error) break;
    console.warn(`[Visual] ${stepLabel}: attempt ${attempt + 1} failed: ${error.message}`);
  }

  return { data, error };
}

/**
 * Image generation with last-resort gpt-image-1 fallback.
 * The edge function already tries a 4-provider chain (alibaba → gemini → modelslab → openai).
 * 3 client retries × 4 providers = 12 attempts. If ALL fail, try gpt-image-1 directly.
 */
async function generateImageWithFallback(
  body: Record<string, unknown>,
  stepLabel: string,
): Promise<EdgeCallResult> {
  const result = await invokeWithRetry('ai-universal-processor', body, stepLabel);

  if (result.error) {
    console.warn(`[Visual] ${stepLabel}: 4-provider chain failed 3× — last resort gpt-image-1`);
    toast.info(`${stepLabel}: trying last-resort OpenAI gpt-image-1...`);

    const fbResult = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        action: 'image_generation',
        prompt: (body.prompt as string) || '',
        provider: 'openai',
        model: 'gpt-image-1',
        size: '1536x1024',
        quality: 'medium',
      },
    });

    if (!fbResult.error && fbResult.data && (fbResult.data as Record<string, unknown>).success !== false) {
      console.log(`[Visual] ${stepLabel}: gpt-image-1 fallback succeeded`);
      toast.success(`${stepLabel}: gpt-image-1 fallback succeeded`);
      return { data: fbResult.data as Record<string, unknown>, error: null };
    }
  }

  return result;
}

// ─── Step types to skip in visual generation ────────────────────────────────

const SKIP_IN_VISUAL = new Set(['tts', 'music', 'sfx', 'transition']);

// ─── Hook ───────────────────────────────────────────────────────────────────

export interface VisualGenerationResult {
  sceneProduction: Record<string, SceneProductionStatus>;
  startSceneVisualProduction: (config: VisualGenerationConfig, audioMap: Record<string, GeneratedAudio>, forceRegenAll?: boolean) => Promise<void>;
  startAllVisualProduction: (configs: VisualGenerationConfig[], audioMap: Record<string, GeneratedAudio>) => Promise<void>;
  startAllLipsyncProduction: (configs: VisualGenerationConfig[], audioMap: Record<string, GeneratedAudio>) => Promise<void>;
  setSceneProduction: React.Dispatch<React.SetStateAction<Record<string, SceneProductionStatus>>>;
  getDefaultSceneStatus: () => SceneProductionStatus;
  visualProgress: { current: number; total: number } | null;
  cancelProduction: () => void;
}

export function useVisualGeneration(
  projectId: string | null,
  scriptLinesByScene: Record<string, Array<{ key: string; characterKey: string; durationEst: number }>>,
): VisualGenerationResult {
  const [sceneProduction, setSceneProduction] = useState<Record<string, SceneProductionStatus>>({});
  const [visualProgress, setVisualProgress] = useState<{ current: number; total: number } | null>(null);
  const abortRef = useRef(false);

  const { updateSceneArtifacts, trackGenerationJob, completeGenerationJob } = useCastProjectPersistence();

  // ─── Process a single visual step (L42: retry + L1/L2: safety) ──────────

  const processVisualStep = useCallback(async (
    step: ScenePipelineStep,
    sceneKey: string,
    audioMap: Record<string, GeneratedAudio>,
    existingResults: Record<string, string>,
  ): Promise<{ key: string; url: string } | null> => {
    if (SKIP_IN_VISUAL.has(step.type)) return null;

    const counter = String(
      Object.keys(existingResults).filter(k => k.startsWith(step.type)).length
    ).padStart(3, '0');
    const stepKey = `${step.type}-${sceneKey}-${counter}`;
    const stepLabel = `${sceneKey}/${step.type}`;

    // L34: Smart regeneration — only skip permanent Supabase URLs
    if (existingResults[stepKey] && isSupabaseStorageUrl(existingResults[stepKey])) {
      console.log(`[Visual] ${stepLabel}: skipping — permanent URL exists`);
      return { key: stepKey, url: existingResults[stepKey] };
    }

    // Track generation job for cost accounting
    let jobId: string | null = null;
    if (projectId) {
      jobId = await trackGenerationJob({
        projectId, jobType: step.type.includes('video') || step.type.includes('lipsync') ? 'video' : 'image',
        sceneKey, provider: (step.model as string) || 'alibaba', estimatedTokens: 1,
      });
    }

    try {
      let url: string | null = null;

      switch (step.type) {
        // ── Screen Capture (pre-existing screenshots) ──
        case 'screen-capture': {
          if (step.screenIds?.length) {
            const firstScreen = step.screenIds[0];
            const { data } = await supabase.storage.from('product-screenshots').getPublicUrl(firstScreen);
            if (data?.publicUrl) url = data.publicUrl;
          }
          break;
        }

        // ── AI Screen Enhance (reference image → video) ──
        case 'ai-screen-enhance': {
          const refImage = existingResults[`screen-capture-${step.screenIds?.[0]}`];
          if (!refImage) break;
          const body = {
            type: 'video', prompt: step.prompt || 'Enhance this screenshot',
            referenceImage: refImage, model: step.model || 'wan2.6-i2v', duration: step.duration || 3,
          };
          const { data, error } = await invokeWithRetry('ai-video-generator', body, stepLabel, 3, 90000);
          if (!error && data) {
            if (data.url) url = data.url as string;
            else if (data.alibabaTaskId) url = await pollVideoTaskResult(data.alibabaTaskId as string);
          }
          break;
        }

        // ── Avatar 3D Generation ──
        case 'avatar-3d': {
          // L35: Extra delay before avatar-3d (DashScope rate limit)
          await new Promise(r => setTimeout(r, 2000));
          const body = { type: 'avatar', character: step.character, prompt: step.prompt };
          const { data, error } = await invokeWithRetry('ai-video-generator', body, stepLabel, 3, 90000);
          if (!error && data) {
            if (data.url) url = data.url as string;
            else if (data.alibabaTaskId) url = await pollVideoTaskResult(data.alibabaTaskId as string);
          }
          break;
        }

        // ── Avatar Lipsync (L17, L29-L33) ──
        case 'avatar-lipsync': {
          const character = step.character || 'host';

          // L31: First-wins TTS selection — use shortest audio per character
          // L1: MUST filter data URIs — base64 audio bloats lipsync payload
          const sceneLines = scriptLinesByScene[sceneKey] || [];
          let ttsAudioUrl: string | null = null;
          for (const line of sceneLines) {
            const audio = audioMap[line.key]?.audioUrl;
            if (line.characterKey === character && audio && !isBase64DataUri(audio) && audio.startsWith('http')) {
              ttsAudioUrl = audio;
              break; // First wins — shorter audio = cheaper lipsync
            }
          }
          if (!ttsAudioUrl) {
            console.warn(`[Visual] ${stepLabel}: no TTS audio for "${character}" — skipping lipsync`);
            toast.warning(`${stepLabel}: no TTS for "${character}"`);
            break;
          }

          // Get avatar source (from existing results or step prompt)
          let sourceImage = existingResults[`avatar-3d-${character}`] ||
                           existingResults[`avatar-3d-${sceneKey}-000`] ||
                           step.prompt;
          if (!sourceImage) {
            console.warn(`[Visual] ${stepLabel}: no avatar source for "${character}"`);
            break;
          }

          // L36: Re-upload avatar to Storage so provider can access it
          if (projectId && !isSupabaseStorageUrl(sourceImage)) {
            try {
              sourceImage = await ensureStorageUrl(projectId, `lipsync-source-${character}`, sourceImage);
            } catch (err) {
              console.warn(`[Visual] ${stepLabel}: avatar re-upload failed`, err);
            }
          }

          const body = {
            type: 'avatar-lipsync',
            avatar_image: sourceImage,
            audio: ttsAudioUrl,
            character,
            model: 'alibaba-lipsync',
          };
          const { data, error } = await invokeWithRetry('ai-video-generator', body, stepLabel, 3, 120000);

          if (!error && data) {
            if (data.url || data.videoUrl) {
              url = (data.url || data.videoUrl) as string;
            }
            // L17: Alibaba lipsync async — poll with extended timeout (60×10s = 10min)
            else if (data.alibabaTaskId) {
              console.log(`[Visual] ${stepLabel}: lipsync "${character}" async on Alibaba — polling...`);
              toast.info(`${stepLabel}: lipsync rendering — polling up to 10min...`);
              url = await pollVideoTaskResult(
                data.alibabaTaskId as string,
                60,    // 60 polls
                10000, // 10s interval = 10min max
                true,  // isLipsync flag → uses China endpoint
              );
            }
            // Replicate fallback (L32: audio too large for Alibaba)
            else if (data.replicatePredictionId) {
              console.log(`[Visual] ${stepLabel}: lipsync "${character}" via Replicate — polling...`);
              url = await pollReplicateResult(data.replicatePredictionId as string, 60, 10000);
            }
          }

          // Override step key with character + scriptKey for multi-segment lipsync
          if (url) {
            const lsKey = step.scriptKey
              ? `avatar-lipsync-${character}-${step.scriptKey}`
              : `avatar-lipsync-${character}`;
            // Re-upload lipsync video to Storage
            if (projectId && needsCdnReUpload(url)) {
              try { url = await ensureStorageUrl(projectId, lsKey, url, 'video'); } catch { /* keep original */ }
            }
            if (jobId && projectId) {
              await completeGenerationJob(jobId, 1, url);
            }
            return { key: lsKey, url };
          }
          break;
        }

        // ── Character Interaction (group shots) ──
        case 'character-interaction': {
          const body = {
            type: 'scene', action: 'generate_video',
            prompt: step.prompt, style: step.style || 'group-shot',
          };
          const { data, error } = await invokeWithRetry('ai-video-generator', body, stepLabel);
          if (!error && data) {
            if (data.url) url = data.url as string;
            else if (data.alibabaTaskId) url = await pollVideoTaskResult(data.alibabaTaskId as string);
          }
          break;
        }

        // ── Narrator Scroll / Kinetic Text ──
        case 'narrator-scroll':
        case 'kinetic-text':
        case 'motion-graphics': {
          const body = { action: 'generate_video', prompt: step.prompt, duration: step.duration || 4 };
          const { data, error } = await invokeWithRetry('ai-universal-processor', body, stepLabel);
          if (!error && data) {
            if (data.url) url = data.url as string;
            else if (data.taskId) url = await pollVideoTaskResult(data.taskId as string);
          }
          break;
        }

        // ── Generic Video ──
        case 'video':
        case 'alibaba-video': {
          const body = {
            type: 'video', prompt: step.prompt,
            duration: step.duration || 3, model: step.model,
          };
          const { data, error } = await invokeWithRetry('ai-video-generator', body, stepLabel);
          if (!error && data) {
            if (data.url) url = data.url as string;
            else if (data.alibabaTaskId) url = await pollVideoTaskResult(data.alibabaTaskId as string);
            else if (data.asyncGeneration && data.taskId) url = await pollVideoTaskResult(data.taskId as string);
          }
          break;
        }

        // ── Image / Storybook Frame (with gpt-image-1 last-resort fallback) ──
        case 'image':
        case 'storybook-frame':
        case 'alibaba-image': {
          const body = { action: 'generate_image', prompt: step.prompt, style: step.style };
          const { data, error } = await generateImageWithFallback(body, stepLabel);
          if (!error && data) {
            url = (data.url || data.imageUrl) as string | null;
          }
          break;
        }

        default:
          console.warn(`[Visual] Unknown step type: ${step.type}`);
      }

      // L1: Never store data URIs
      if (url && isBase64DataUri(url)) {
        console.warn(`[Visual] ${stepLabel}: got data URI result — filtering out`);
        url = null;
      }

      // L4-L6: Re-upload external CDN URLs to Supabase Storage
      if (url && projectId && needsCdnReUpload(url)) {
        const contentType = (step.type.includes('video') || step.type.includes('lipsync') ||
          step.type.includes('interaction') || step.type.includes('scroll'))
          ? 'video' as const : 'image' as const;
        try {
          url = await ensureStorageUrl(projectId, stepKey, url, contentType);
        } catch { /* keep original URL */ }
      }

      if (url) {
        if (jobId && projectId) {
          await completeGenerationJob(jobId, 1, url);
        }
        return { key: stepKey, url };
      }
    } catch (err) {
      console.error(`[Visual] Step ${stepKey} failed:`, err);
      toast.error(`${stepLabel} failed: ${(err as Error).message}`);
    }

    return null;
  }, [projectId, scriptLinesByScene, trackGenerationJob, completeGenerationJob]);

  // ─── Generate all visuals for a single scene ─────────────────────────────

  const startSceneVisualProduction = useCallback(async (
    config: VisualGenerationConfig,
    audioMap: Record<string, GeneratedAudio>,
    forceRegenAll = false,
  ) => {
    const { sceneKey, pipeline } = config;
    setSceneProduction(prev => ({
      ...prev,
      [sceneKey]: { ...(prev[sceneKey] || defaultSceneStatus()), visual: 'generating' },
    }));

    const existingStatus = sceneProduction[sceneKey] || defaultSceneStatus();

    // L34: Carry forward existing permanent assets (or wipe if forceRegenAll)
    const existingResults: Record<string, string> = forceRegenAll ? {} : {
      ...existingStatus.videoUrls,
      ...existingStatus.imageUrls,
      ...existingStatus.avatarUrls,
      ...existingStatus.lipsyncUrls,
    };

    const results: Record<string, string> = { ...existingResults };

    // Process pipeline steps sequentially with rate limiting
    for (let i = 0; i < pipeline.length; i++) {
      if (abortRef.current) break;

      const step = pipeline[i];
      const result = await processVisualStep(step, sceneKey, audioMap, results);
      if (result) results[result.key] = result.url;

      // L35: Rate limiting between steps
      if (i < pipeline.length - 1) {
        const nextType = pipeline[i + 1]?.type;
        const delay = nextType === 'avatar-3d' ? 3000 : // 3s before avatar (DashScope)
                      step.type === 'avatar-3d' ? 2000 : // 2s after avatar
                      1000; // 1s generic
        await new Promise(r => setTimeout(r, delay));
      }
    }

    // L1: Filter data URIs before categorizing
    const cleanResults = filterDataUris(results);

    // Categorize results into typed buckets
    const videoUrls: Record<string, string> = {};
    const imageUrls: Record<string, string> = {};
    const avatarUrls: Record<string, string> = {};
    const lipsyncUrls: Record<string, string> = {};

    for (const [key, url] of Object.entries(cleanResults)) {
      if (key.includes('lipsync')) {
        lipsyncUrls[key] = url;
      } else if (key.includes('avatar-3d')) {
        avatarUrls[key] = url;
      } else if (
        key.includes('video') || key.includes('character-interaction') ||
        key.includes('narrator-scroll') || key.includes('scene-transition') ||
        key.includes('alibaba-video')
      ) {
        videoUrls[key] = url;
      } else {
        imageUrls[key] = url;
      }
    }

    // Persist to DB (serialized per-scene to prevent connection pool exhaustion)
    if (projectId) {
      const saved = await updateSceneArtifacts(projectId, sceneKey, {
        videoUrls, imageUrls, avatarUrls, lipsyncUrls,
      });
      if (saved) {
        console.log(`[Visual] ${sceneKey}: DB save confirmed`);
      } else {
        console.error(`[Visual] ${sceneKey}: DB SAVE FAILED`);
        toast.error(`Failed to save ${sceneKey} artifacts to DB`);
      }
    }

    setSceneProduction(prev => ({
      ...prev,
      [sceneKey]: {
        ...(prev[sceneKey] || defaultSceneStatus()),
        visual: 'done',
        videoUrls, imageUrls, avatarUrls, lipsyncUrls,
      },
    }));
  }, [projectId, sceneProduction, processVisualStep, updateSceneArtifacts]);

  // ─── Generate visuals for all scenes sequentially ─────────────────────────

  const startAllVisualProduction = useCallback(async (
    configs: VisualGenerationConfig[],
    audioMap: Record<string, GeneratedAudio>,
  ) => {
    abortRef.current = false;

    // M2: Resume-from-checkpoint — skip scenes already completed successfully
    const pendingConfigs = configs.filter(c => {
      const status = sceneProduction[c.sceneKey];
      if (status?.visual === 'done') {
        console.log(`[Visual] Skipping ${c.sceneKey} — already done (resume-from-checkpoint)`);
        return false;
      }
      return true;
    });

    if (pendingConfigs.length < configs.length) {
      const skipped = configs.length - pendingConfigs.length;
      toast.info(`Resuming: ${skipped} scene${skipped > 1 ? 's' : ''} already complete, ${pendingConfigs.length} remaining`);
    }

    setVisualProgress({ current: 0, total: pendingConfigs.length });

    for (let i = 0; i < pendingConfigs.length; i++) {
      if (abortRef.current) break;
      setVisualProgress({ current: i + 1, total: pendingConfigs.length });
      await startSceneVisualProduction(pendingConfigs[i], audioMap);
      // L35: 2s delay between scenes to prevent connection pool exhaustion
      if (i < pendingConfigs.length - 1) await new Promise(r => setTimeout(r, 2000));
    }

    setVisualProgress(null);
    if (!abortRef.current) {
      toast.success('All visual production complete');
    }
  }, [startSceneVisualProduction]);

  // ─── Lipsync-only batch (regenerate just lipsync across all scenes) ───────

  const startAllLipsyncProduction = useCallback(async (
    configs: VisualGenerationConfig[],
    audioMap: Record<string, GeneratedAudio>,
  ) => {
    abortRef.current = false;
    setVisualProgress({ current: 0, total: configs.length });

    // Clear only lipsync data so those steps regenerate
    setSceneProduction(prev => {
      const next = { ...prev };
      for (const cfg of configs) {
        next[cfg.sceneKey] = { ...(next[cfg.sceneKey] || defaultSceneStatus()), lipsyncUrls: {} };
      }
      return next;
    });

    // Filter each scene's pipeline to only lipsync steps
    for (let i = 0; i < configs.length; i++) {
      if (abortRef.current) break;
      setVisualProgress({ current: i + 1, total: configs.length });

      const lipsyncConfig = {
        ...configs[i],
        pipeline: configs[i].pipeline.filter(s => s.type === 'avatar-lipsync'),
      };
      if (lipsyncConfig.pipeline.length > 0) {
        await startSceneVisualProduction(lipsyncConfig, audioMap);
      }
      if (i < configs.length - 1) await new Promise(r => setTimeout(r, 2000));
    }

    setVisualProgress(null);
    toast.success('All lipsync production complete');
  }, [startSceneVisualProduction]);

  const cancelProduction = useCallback(() => {
    abortRef.current = true;
    setVisualProgress(null);
    toast.info('Visual production cancelled');
  }, []);

  return {
    sceneProduction,
    startSceneVisualProduction,
    startAllVisualProduction,
    startAllLipsyncProduction,
    setSceneProduction,
    getDefaultSceneStatus: defaultSceneStatus,
    visualProgress,
    cancelProduction,
  };
}

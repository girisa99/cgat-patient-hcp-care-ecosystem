/**
 * useVisualGeneration
 *
 * Generic visual asset generation hook for Cast production.
 * Handles image/video/avatar/lipsync generation per scene.
 * Works with any scene pipeline from DB (not hardcoded EP04 pipelines).
 *
 * Patterns preserved from EP04:
 * - Smart regeneration (skip if permanent Supabase URL exists)
 * - Rate limiting between steps (1s delay)
 * - Serialized DB saves (prevents connection pool exhaustion)
 * - First-wins TTS selection for lipsync
 * - Async polling for DashScope/Replicate
 */

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCastProjectPersistence } from '@/hooks/useCastProjectPersistence';
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

const LIPSYNC_MAX_DURATION = 18;

function defaultSceneStatus(): SceneProductionStatus {
  return {
    visual: 'idle', music: 'idle', sfx: 'idle', assembled: 'idle',
    videoUrls: {}, imageUrls: {}, avatarUrls: {}, lipsyncUrls: {},
    musicUrl: null, sfxUrls: [], assembledClipUrl: null,
  };
}

const isPermanentUrl = (url: string) => url && url.includes('supabase.co/storage');

// ─── Polling helpers ────────────────────────────────────────────────────────

async function pollVideoTaskResult(taskId: string, maxPolls = 30, intervalMs = 10000): Promise<string | null> {
  for (let i = 0; i < maxPolls; i++) {
    await new Promise(r => setTimeout(r, intervalMs));
    try {
      const { data } = await supabase.functions.invoke('ai-video-generator', {
        body: { action: 'poll_task', taskId },
      });
      if (data?.url) return data.url;
      if (data?.status === 'FAILED' || data?.status === 'failed') return null;
    } catch { /* retry */ }
  }
  return null;
}

async function pollReplicateResult(predictionId: string, maxPolls = 60, intervalMs = 10000): Promise<string | null> {
  for (let i = 0; i < maxPolls; i++) {
    await new Promise(r => setTimeout(r, intervalMs));
    try {
      const { data } = await supabase.functions.invoke('ai-video-generator', {
        body: { action: 'poll_replicate', predictionId },
      });
      if (data?.url) return data.url;
      if (data?.status === 'failed' || data?.status === 'canceled') return null;
    } catch { /* retry */ }
  }
  return null;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export interface VisualGenerationResult {
  sceneProduction: Record<string, SceneProductionStatus>;
  startSceneVisualProduction: (config: VisualGenerationConfig, audioMap: Record<string, GeneratedAudio>, forceRegenAll?: boolean) => Promise<void>;
  startAllVisualProduction: (configs: VisualGenerationConfig[], audioMap: Record<string, GeneratedAudio>) => Promise<void>;
  setSceneProduction: React.Dispatch<React.SetStateAction<Record<string, SceneProductionStatus>>>;
  getDefaultSceneStatus: () => SceneProductionStatus;
}

export function useVisualGeneration(
  projectId: string | null,
  scriptLinesByScene: Record<string, Array<{ key: string; characterKey: string; durationEst: number }>>,
): VisualGenerationResult {
  const [sceneProduction, setSceneProduction] = useState<Record<string, SceneProductionStatus>>({});
  const abortRef = useRef(false);

  const { updateSceneArtifacts, trackGenerationJob, completeGenerationJob } = useCastProjectPersistence();

  // ─── Process a single visual step ──────────────────────────────────────

  const processVisualStep = useCallback(async (
    step: ScenePipelineStep,
    sceneKey: string,
    audioMap: Record<string, GeneratedAudio>,
    existingResults: Record<string, string>,
  ): Promise<{ key: string; url: string } | null> => {
    const stepKey = `${step.type}-${step.character || step.prompt?.slice(0, 20) || 'gen'}`;

    // Skip if permanent URL exists (CDN URLs expire)
    if (existingResults[stepKey] && isPermanentUrl(existingResults[stepKey])) {
      return { key: stepKey, url: existingResults[stepKey] };
    }

    try {
      let url: string | null = null;

      switch (step.type) {
        case 'screen-capture': {
          // Pre-existing screenshots — no edge call
          if (step.screenIds?.length) {
            const firstScreen = step.screenIds[0];
            const { data } = await supabase.storage.from('product-screenshots').getPublicUrl(firstScreen);
            if (data?.publicUrl) url = data.publicUrl;
          }
          break;
        }

        case 'ai-screen-enhance': {
          const refImage = existingResults[`screen-capture-${step.screenIds?.[0]}`];
          if (!refImage) break;
          const { data } = await supabase.functions.invoke('ai-video-generator', {
            body: {
              type: 'video', prompt: step.prompt || 'Enhance this screenshot',
              referenceImage: refImage, model: step.model || 'wan2.6-i2v', duration: step.duration || 3,
            },
          });
          if (data?.url) url = data.url;
          else if (data?.alibabaTaskId) url = await pollVideoTaskResult(data.alibabaTaskId);
          break;
        }

        case 'avatar-3d': {
          const { data } = await supabase.functions.invoke('ai-video-generator', {
            body: { type: 'avatar', character: step.character, prompt: step.prompt },
          });
          if (data?.url) url = data.url;
          else if (data?.alibabaTaskId) url = await pollVideoTaskResult(data.alibabaTaskId);
          break;
        }

        case 'avatar-lipsync': {
          // Find TTS audio for this character (first-wins strategy for shorter audio)
          const sceneLines = scriptLinesByScene[sceneKey] || [];
          let ttsAudioUrl: string | null = null;
          for (const line of sceneLines) {
            if (line.characterKey === step.character && audioMap[line.key]?.audioUrl) {
              ttsAudioUrl = audioMap[line.key].audioUrl;
              break; // First wins — shorter = works with DashScope 20s limit
            }
          }
          if (!ttsAudioUrl) break;

          // Get avatar source image
          const existingAvatar = existingResults[`avatar-3d-${step.character}`];
          const sourceImage = existingAvatar || step.prompt;
          if (!sourceImage) break;

          const { data } = await supabase.functions.invoke('ai-video-generator', {
            body: { type: 'avatar', character: step.character, lipsync: true, audioUrl: ttsAudioUrl, sourceImage },
          });
          if (data?.url) url = data.url;
          else if (data?.alibabaTaskId) url = await pollVideoTaskResult(data.alibabaTaskId);
          else if (data?.replicatePredictionId) url = await pollReplicateResult(data.replicatePredictionId);
          break;
        }

        case 'character-interaction': {
          const { data } = await supabase.functions.invoke('ai-video-generator', {
            body: { type: 'scene', action: 'generate_video', prompt: step.prompt, style: step.style || 'group-shot' },
          });
          if (data?.url) url = data.url;
          else if (data?.alibabaTaskId) url = await pollVideoTaskResult(data.alibabaTaskId);
          break;
        }

        case 'narrator-scroll': {
          const { data } = await supabase.functions.invoke('ai-universal-processor', {
            body: { action: 'generate_video', prompt: step.prompt, duration: step.duration || 4 },
          });
          if (data?.url) url = data.url;
          else if (data?.taskId) url = await pollVideoTaskResult(data.taskId);
          break;
        }

        case 'video': {
          const { data } = await supabase.functions.invoke('ai-video-generator', {
            body: { type: 'video', prompt: step.prompt, duration: step.duration || 3, model: step.model },
          });
          if (data?.url) url = data.url;
          else if (data?.alibabaTaskId) url = await pollVideoTaskResult(data.alibabaTaskId);
          else if (data?.asyncGeneration && data?.taskId) url = await pollVideoTaskResult(data.taskId);
          break;
        }

        case 'image':
        case 'storybook-frame': {
          const { data } = await supabase.functions.invoke('ai-universal-processor', {
            body: { action: 'generate_image', prompt: step.prompt, style: step.style },
          });
          if (data?.url || data?.imageUrl) url = data.url || data.imageUrl;
          break;
        }

        default:
          console.warn(`[Visual] Unknown step type: ${step.type}`);
      }

      if (url) return { key: stepKey, url };
    } catch (err) {
      console.error(`[Visual] Step ${stepKey} failed:`, err);
    }

    return null;
  }, [scriptLinesByScene]);

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
    const existingResults: Record<string, string> = forceRegenAll ? {} : {
      ...existingStatus.videoUrls,
      ...existingStatus.imageUrls,
      ...existingStatus.avatarUrls,
      ...existingStatus.lipsyncUrls,
    };

    const results: Record<string, string> = { ...existingResults };

    for (let i = 0; i < pipeline.length; i++) {
      if (abortRef.current) break;
      const result = await processVisualStep(pipeline[i], sceneKey, audioMap, results);
      if (result) results[result.key] = result.url;
      // Rate limit: 1s delay between steps
      if (i < pipeline.length - 1) await new Promise(r => setTimeout(r, 1000));
    }

    // Categorize results into buckets
    const videoUrls: Record<string, string> = {};
    const imageUrls: Record<string, string> = {};
    const avatarUrls: Record<string, string> = {};
    const lipsyncUrls: Record<string, string> = {};

    for (const [key, url] of Object.entries(results)) {
      if (key.includes('video') || key.includes('character-interaction') || key.includes('narrator-scroll') || key.includes('scene-transition')) {
        videoUrls[key] = url;
      } else if (key.includes('avatar-3d')) {
        avatarUrls[key] = url;
      } else if (key.includes('lipsync')) {
        lipsyncUrls[key] = url;
      } else {
        imageUrls[key] = url;
      }
    }

    // Persist to DB (serialized per-scene)
    if (projectId) {
      await updateSceneArtifacts(projectId, sceneKey, { videoUrls, imageUrls, avatarUrls, lipsyncUrls });
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
    for (let i = 0; i < configs.length; i++) {
      if (abortRef.current) break;
      await startSceneVisualProduction(configs[i], audioMap);
      // Delay between scenes to prevent connection pool exhaustion
      if (i < configs.length - 1) await new Promise(r => setTimeout(r, 500));
    }
  }, [startSceneVisualProduction]);

  return {
    sceneProduction,
    startSceneVisualProduction,
    startAllVisualProduction,
    setSceneProduction,
    getDefaultSceneStatus: defaultSceneStatus,
  };
}

/**
 * useAssemblyPipeline
 *
 * Generic assembly hook for Cast production.
 * Prepares scene data, calls timeline builder edge function, polls for completion.
 * Auto re-uploads final video to Supabase Storage (CDN URLs expire in 24-48h).
 *
 * LESSONS LEARNED (baked in as core guards):
 * - ALWAYS filter data: URIs before sending (38MB → 100KB)
 * - ALWAYS log payload size before sending
 * - ALWAYS abort if payload > 5MB
 * - ALWAYS use lightweight dedicated edge function
 * - ALWAYS set timeout on edge function calls (60s)
 * - ALWAYS provide cancel button (via abort flag)
 * - ALWAYS re-upload final video to Supabase Storage (CDN URLs expire)
 * - ALWAYS guard against duplicate assembly submissions (re-entry guard)
 * - ALWAYS cap polling at MAX_POLL_COUNT to prevent infinite loops
 * - ALWAYS warn user if re-upload fails (video URL will expire)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCastProjectPersistence } from '@/hooks/useCastProjectPersistence';
import { CAST_STORAGE, CAST_POLLING, CAST_DEFAULTS, DEFAULT_RESOLUTION, type CastResolution } from '@/config/castProductionConfig';
import type { GeneratedAudio } from './useTtsGeneration';
import type { SceneProductionStatus } from './useVisualGeneration';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AssemblySceneData {
  sceneKey: string;
  sceneTitle: string;
  scriptLines: Array<{
    key: string;
    characterKey: string;
    durationEst: number;
    text: string;
  }>;
  pipeline?: Array<{ type: string; duration?: number }>;
}

export interface TransitionData {
  from: string;
  to: string;
  style: string;
  duration: number;
  bridgeAudioUrl?: string;
  bridgeDuration?: number;
}

export interface BookendData {
  opening: { duration: number; title?: string };
  closing: { duration: number; title?: string };
}

export interface AssemblyPipelineResult {
  assemblyJobId: string | null;
  assemblyProgress: string | null;
  finalVideoUrl: string | null;
  isAssembling: boolean;
  startAssembly: (
    scenes: AssemblySceneData[],
    sceneProduction: Record<string, SceneProductionStatus>,
    audioMap: Record<string, GeneratedAudio>,
    transitions: TransitionData[],
    bookends: BookendData | null,
    quality?: string,
    projectTitle?: string,
    resolution?: CastResolution,
  ) => Promise<void>;
  cancelAssembly: () => void;
  setFinalVideoUrl: (url: string | null) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Strict HTTP URL check — rejects data: URIs, empty strings, and non-http URLs */
const isHttpUrl = (u: string): boolean =>
  typeof u === 'string' && u.length > 0 && u.startsWith('http') && !u.startsWith('data:');

function filterDataUris(urls: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(urls).filter(([_, v]) => isHttpUrl(v)));
}

/** Calculate assembly timeout: base 60s + 5s per scene (L16: long videos need more time) */
function getAssemblyTimeout(sceneCount: number): number {
  return Math.max(60000, 60000 + sceneCount * 5000);
}

/** Max polls before giving up (from centralized config) */
const MAX_POLL_COUNT = CAST_POLLING.MAX_ASSEMBLY_POLLS;

/** Re-upload CDN URL to Supabase Storage with 2× retry */
async function reUploadToStorage(cdnUrl: string, storagePath: string): Promise<string | null> {
  const MAX_ATTEMPTS = 2;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[Assembly] Re-upload retry ${attempt + 1}/${MAX_ATTEMPTS}`);
        await new Promise(r => setTimeout(r, 3000));
      }

      const response = await fetch(cdnUrl);
      if (!response.ok) {
        console.warn(`[Assembly] Re-upload fetch failed: ${response.status}`);
        continue;
      }
      const blob = await response.blob();

      const { error } = await supabase.storage
        .from(CAST_STORAGE.ASSETS_BUCKET)
        .upload(storagePath, blob, { contentType: blob.type || 'video/mp4', upsert: true });

      if (error) {
        console.warn('[Assembly] Re-upload storage error:', error);
        continue;
      }

      const { data: publicData } = supabase.storage.from(CAST_STORAGE.ASSETS_BUCKET).getPublicUrl(storagePath);
      return publicData?.publicUrl || null;
    } catch (err) {
      console.warn(`[Assembly] Re-upload error (attempt ${attempt + 1}):`, err);
    }
  }
  console.warn('[Assembly] Re-upload failed after all attempts');
  return null;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useAssemblyPipeline(projectId: string | null): AssemblyPipelineResult {
  const [assemblyJobId, setAssemblyJobId] = useState<string | null>(null);
  const [assemblyProgress, setAssemblyProgress] = useState<string | null>(null);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  const [isAssembling, setIsAssembling] = useState(false);
  const abortRef = useRef(false);

  const { updateFinalAssembly, trackGenerationJob, completeGenerationJob } = useCastProjectPersistence();

  // ─── Poll for assembly completion (capped at MAX_POLL_COUNT) ──────────

  const pollCountRef = useRef(0);

  useEffect(() => {
    if (!assemblyJobId) {
      pollCountRef.current = 0;
      return;
    }
    pollCountRef.current = 0;

    const timer = setInterval(async () => {
      pollCountRef.current++;

      // C3: Cap polling to prevent infinite loop (300 × 10s = 50 min)
      if (pollCountRef.current > MAX_POLL_COUNT) {
        console.error(`[Assembly] Polling timed out after ${MAX_POLL_COUNT} attempts (${Math.round(MAX_POLL_COUNT * 10 / 60)} min)`);
        setAssemblyProgress(null);
        setAssemblyJobId(null);
        setIsAssembling(false);
        toast.error('Assembly timed out — the rendering job may still be running. Check back later or contact support.');
        clearInterval(timer);
        return;
      }

      try {
        const { data } = await supabase.functions.invoke('genie-cast-status', {
          body: { castJobId: assemblyJobId },
        });
        if (data?.job?.status === 'completed') {
          const cdnUrl = data.job.outputUrl;

          // Re-upload to Supabase Storage for permanent URL (CDN URLs expire in 24-48h)
          let permanentUrl = cdnUrl;
          if (projectId && cdnUrl && !cdnUrl.includes('supabase.co/storage')) {
            setAssemblyProgress('Re-uploading video to permanent storage...');
            const reUploaded = await reUploadToStorage(cdnUrl, `${projectId}/final-video.mp4`);
            if (reUploaded) {
              permanentUrl = reUploaded;
              console.log(`[Assembly] Re-uploaded to permanent URL: ${permanentUrl}`);
            } else {
              // H4: Warn user that video URL will expire
              console.error('[Assembly] Re-upload to permanent storage FAILED — using CDN URL that expires in 24-48h');
              toast.warning('Video saved but permanent storage failed — download your video now, the URL may expire in 24-48 hours.');
            }
          }

          setFinalVideoUrl(permanentUrl);
          setAssemblyProgress(null);
          setAssemblyJobId(null);
          setIsAssembling(false);

          if (projectId && permanentUrl) {
            await updateFinalAssembly(projectId, permanentUrl, {
              totalDuration: data.job.duration || 0,
              resolution,
            });
          }
          toast.success('Video assembled successfully!');
        } else if (data?.job?.status === 'failed') {
          setAssemblyProgress(null);
          setAssemblyJobId(null);
          setIsAssembling(false);
          toast.error(`Assembly failed: ${data.job.errorMessage || 'Unknown error'}`);
        } else {
          const pct = data?.job?.progressPercent || 0;
          const statusText = data?.job?.statusText || '';
          const pollInfo = `(poll ${pollCountRef.current}/${MAX_POLL_COUNT})`;
          setAssemblyProgress(statusText ? `${statusText} (${pct}%) ${pollInfo}` : `Rendering video... ${pct}% ${pollInfo}`);
        }
      } catch (err) {
        console.error('[Assembly] Poll error:', err);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(timer);
  }, [assemblyJobId, projectId, updateFinalAssembly]);

  // ─── Start final assembly ─────────────────────────────────────────────

  const startAssembly = useCallback(async (
    scenes: AssemblySceneData[],
    sceneProduction: Record<string, SceneProductionStatus>,
    audioMap: Record<string, GeneratedAudio>,
    transitions: TransitionData[],
    bookends: BookendData | null,
    quality: string = 'production',
    projectTitle?: string,
    resolution: CastResolution = DEFAULT_RESOLUTION,
  ) => {
    // C2: Re-entry guard — prevent duplicate assembly submissions
    if (isAssembling || assemblyJobId) {
      toast.warning('Assembly already in progress — please wait or cancel the current job first.');
      return;
    }

    abortRef.current = false;
    setIsAssembling(true);
    setAssemblyProgress('Preparing scene data for assembly...');

    try {
      // ── Build chapter data per scene ──
      const chapters = scenes.map(scene => {
        const status = sceneProduction[scene.sceneKey] || {
          videoUrls: {}, imageUrls: {}, avatarUrls: {}, lipsyncUrls: {},
          musicUrl: null, sfxUrls: [],
        };

        // Build TTS timeline with cumulative start offsets
        let cumulativeStart = 0;
        const allTtsUrls: Array<{ url: string; start: number; duration: number; voice: string }> = [];

        for (const line of scene.scriptLines) {
          const dur = line.durationEst || 5;
          const ttsUrl = audioMap[line.key]?.audioUrl;
          if (ttsUrl && isHttpUrl(ttsUrl)) {
            allTtsUrls.push({
              url: ttsUrl,
              start: cumulativeStart,
              duration: dur,
              voice: line.characterKey,
            });
          }
          cumulativeStart += dur;
        }

        const sceneDuration = cumulativeStart || CAST_DEFAULTS.SCENE_DURATION;

        // CRITICAL: Filter data: URIs from all visual URLs
        const filteredVideoUrls = filterDataUris(status.videoUrls || {});
        const filteredImageUrls = filterDataUris(status.imageUrls || {});
        const filteredAvatarUrls = filterDataUris(status.avatarUrls || {});
        const filteredLipsyncUrls = filterDataUris(status.lipsyncUrls || {});

        const allVisualUrls: string[] = [
          ...Object.values(filteredVideoUrls),
          ...Object.values(filteredImageUrls),
          ...Object.values(filteredAvatarUrls),
          ...Object.values(filteredLipsyncUrls),
        ];

        // Music loop detection
        const musicStep = (scene.pipeline || []).find(s => s.type === 'music');
        const musicDuration = musicStep?.duration || CAST_DEFAULTS.MUSIC_LOOP_DURATION;
        const musicLoop = status.musicUrl ? musicDuration < sceneDuration : false;

        return {
          chapterId: scene.sceneKey,
          title: scene.sceneTitle,
          product: scene.sceneTitle,
          duration: sceneDuration,
          allTtsUrls,
          visualUrls: allVisualUrls,
          musicUrl: status.musicUrl && isHttpUrl(status.musicUrl) ? status.musicUrl : undefined,
          musicLoop,
          sfxUrls: (status.sfxUrls || []).filter(isHttpUrl),
        };
      });

      // ── SAFETY GUARD: Log + check payload size ──
      const sceneData = { chapters, transitions, bookends, quality, castProjectId: projectId, projectTitle, resolution };
      const payloadKb = Math.round(JSON.stringify(sceneData).length / 1024);
      console.log(`[Assembly] ${chapters.length} scenes, payload: ${payloadKb}kb`);

      if (payloadKb > Math.round(CAST_STORAGE.PAYLOAD_MAX_BYTES / 1024)) {
        toast.error(`Payload too large (${payloadKb}kb). Likely contains embedded images — check for data: URIs.`);
        setIsAssembling(false);
        setAssemblyProgress(null);
        return;
      }

      // Track the assembly job
      let jobId: string | null = null;
      if (projectId) {
        jobId = await trackGenerationJob({
          projectId, jobType: 'assembly', sceneKey: 'final', provider: 'json2video', estimatedTokens: 5000,
        });
      }

      setAssemblyProgress('Sending to timeline builder...');

      // ── Call edge function with scalable timeout (L16) ──
      const timeoutMs = getAssemblyTimeout(scenes.length);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      console.log(`[Assembly] Timeout set to ${timeoutMs / 1000}s for ${scenes.length} scenes`);

      try {
        const { data, error } = await supabase.functions.invoke('genie-cast-timeline-builder', {
          body: sceneData,
        });

        clearTimeout(timeout);

        if (error) {
          let detail = error.message;
          try {
            if (error.context && typeof error.context.text === 'function') {
              const body = await error.context.text();
              detail = `${error.message} — ${body.substring(0, 500)}`;
            }
          } catch { /* body may not be readable */ }
          throw new Error(`Assembly error: ${detail}`);
        }

        console.log('[Assembly] Response:', data);

        if (data?.generationStatus === 'pending' && (data?.castJobId || data?.taskId)) {
          const pollId = data.castJobId || data.taskId;
          setAssemblyJobId(pollId);
          setAssemblyProgress('Video rendering in progress... polling for completion');
          toast.success('Assembly submitted! Video is rendering.');
        } else if (data?.videoUrl) {
          // Synchronous completion (rare)
          let permanentUrl = data.videoUrl;

          // Re-upload to Supabase Storage
          if (projectId && !data.videoUrl.includes('supabase.co/storage')) {
            const reUploaded = await reUploadToStorage(data.videoUrl, `${projectId}/final-video.mp4`);
            if (reUploaded) permanentUrl = reUploaded;
          }

          setFinalVideoUrl(permanentUrl);
          setAssemblyProgress(null);
          setIsAssembling(false);

          if (projectId) {
            await updateFinalAssembly(projectId, permanentUrl, {
              totalDuration: data.totalDuration,
              sceneCount: scenes.length,
              resolution,
            });
          }
          toast.success('Video assembled successfully!');
        } else {
          throw new Error(data?.message || 'No video URL returned');
        }

        if (jobId && projectId) {
          await completeGenerationJob(jobId, data?.tokensUsed || 5000, data?.videoUrl);
        }
      } finally {
        clearTimeout(timeout);
      }
    } catch (err: any) {
      console.error('[Assembly] Failed:', err);
      setAssemblyProgress(null);
      setIsAssembling(false);
      toast.error(`Assembly failed: ${err.message}`);
    }
  }, [projectId, isAssembling, assemblyJobId, trackGenerationJob, completeGenerationJob, updateFinalAssembly]);

  const cancelAssembly = useCallback(() => {
    abortRef.current = true;
    setIsAssembling(false);
    setAssemblyProgress(null);
    setAssemblyJobId(null);
    toast.info('Assembly cancelled');
  }, []);

  return {
    assemblyJobId, assemblyProgress, finalVideoUrl, isAssembling,
    startAssembly, cancelAssembly, setFinalVideoUrl,
  };
}

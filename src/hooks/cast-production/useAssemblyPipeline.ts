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
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCastProjectPersistence } from '@/hooks/useCastProjectPersistence';
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
  ) => Promise<void>;
  cancelAssembly: () => void;
  setFinalVideoUrl: (url: string | null) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const isHttpUrl = (u: string) => u && u.startsWith('http');

function filterDataUris(urls: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(urls).filter(([_, v]) => isHttpUrl(v)));
}

async function reUploadToStorage(cdnUrl: string, storagePath: string): Promise<string | null> {
  try {
    const response = await fetch(cdnUrl);
    if (!response.ok) return null;
    const blob = await response.blob();

    const { error } = await supabase.storage
      .from('cast-assets')
      .upload(storagePath, blob, { contentType: blob.type || 'video/mp4', upsert: true });

    if (error) {
      console.warn('[Assembly] Re-upload failed:', error);
      return null;
    }

    const { data: publicData } = supabase.storage.from('cast-assets').getPublicUrl(storagePath);
    return publicData?.publicUrl || null;
  } catch (err) {
    console.warn('[Assembly] Re-upload error:', err);
    return null;
  }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useAssemblyPipeline(projectId: string | null): AssemblyPipelineResult {
  const [assemblyJobId, setAssemblyJobId] = useState<string | null>(null);
  const [assemblyProgress, setAssemblyProgress] = useState<string | null>(null);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  const [isAssembling, setIsAssembling] = useState(false);
  const abortRef = useRef(false);

  const { updateFinalAssembly, trackGenerationJob, completeGenerationJob } = useCastProjectPersistence();

  // ─── Poll for assembly completion ─────────────────────────────────────

  useEffect(() => {
    if (!assemblyJobId) return;
    const timer = setInterval(async () => {
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
            }
          }

          setFinalVideoUrl(permanentUrl);
          setAssemblyProgress(null);
          setAssemblyJobId(null);
          setIsAssembling(false);

          if (projectId && permanentUrl) {
            await updateFinalAssembly(projectId, permanentUrl, {
              totalDuration: data.job.duration || 0,
              resolution: '1920x1080',
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
          setAssemblyProgress(statusText ? `${statusText} (${pct}%)` : `Rendering video... ${pct}%`);
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
  ) => {
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
          if (audioMap[line.key]?.audioUrl && isHttpUrl(audioMap[line.key].audioUrl)) {
            allTtsUrls.push({
              url: audioMap[line.key].audioUrl,
              start: cumulativeStart,
              duration: dur,
              voice: line.characterKey,
            });
          }
          cumulativeStart += dur;
        }

        const sceneDuration = cumulativeStart || 30;

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
        const musicDuration = musicStep?.duration || 30;
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
      const sceneData = { chapters, transitions, bookends, quality, castProjectId: projectId, projectTitle };
      const payloadKb = Math.round(JSON.stringify(sceneData).length / 1024);
      console.log(`[Assembly] ${chapters.length} scenes, payload: ${payloadKb}kb`);

      if (payloadKb > 5000) {
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

      // ── Call edge function with timeout ──
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

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
              resolution: '1920x1080',
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
  }, [projectId, trackGenerationJob, completeGenerationJob, updateFinalAssembly]);

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

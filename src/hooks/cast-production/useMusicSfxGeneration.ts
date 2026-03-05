/**
 * useMusicSfxGeneration
 *
 * Generic music + SFX generation hook for Cast production.
 * Handles per-scene background music and sound effects.
 * Works with any project type (video, podcast, educational, UGC).
 */

import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCastProjectPersistence } from '@/hooks/useCastProjectPersistence';
import type { SceneProductionStatus } from './useVisualGeneration';

export interface MusicSfxConfig {
  sceneKey: string;
  sceneTitle: string;
  musicPrompt?: string;
  musicDuration?: number;
  instrumental?: boolean;
  sfxList?: Array<{ prompt: string; duration?: number }>;
}

export interface MusicSfxResult {
  startSceneMusicProduction: (
    config: MusicSfxConfig,
    setSceneProduction: React.Dispatch<React.SetStateAction<Record<string, SceneProductionStatus>>>,
  ) => Promise<void>;
  startAllMusicProduction: (
    configs: MusicSfxConfig[],
    setSceneProduction: React.Dispatch<React.SetStateAction<Record<string, SceneProductionStatus>>>,
  ) => Promise<void>;
}

export function useMusicSfxGeneration(projectId: string | null): MusicSfxResult {
  const { updateSceneMusic, trackGenerationJob, completeGenerationJob } = useCastProjectPersistence();

  const startSceneMusicProduction = useCallback(async (
    config: MusicSfxConfig,
    setSceneProduction: React.Dispatch<React.SetStateAction<Record<string, SceneProductionStatus>>>,
  ) => {
    const { sceneKey, sceneTitle, musicPrompt, musicDuration = 30, instrumental = true, sfxList = [] } = config;

    setSceneProduction(prev => ({
      ...prev,
      [sceneKey]: { ...(prev[sceneKey] || {} as SceneProductionStatus), music: 'generating' },
    }));

    let musicUrl: string | null = null;
    const sfxUrls: string[] = [];

    try {
      // ── Generate background music ──
      const prompt = musicPrompt || `Cinematic instrumental background music for: "${sceneTitle}". Emotional, orchestral, professional production quality.`;

      let musicJobId: string | null = null;
      if (projectId) {
        musicJobId = await trackGenerationJob({
          projectId, jobType: 'music', sceneKey, provider: 'suno', estimatedTokens: 200,
        });
      }

      const { data, error } = await supabase.functions.invoke('multi-provider-music', {
        body: { prompt, duration: musicDuration, instrumental },
      });

      if (error) {
        console.error(`[Music] Edge function error for ${sceneKey}:`, error);
        toast.error(`Music generation failed for ${sceneTitle}`);
      } else if (data?.audioUrl) {
        musicUrl = data.audioUrl;
        if (data.isSilentPlaceholder) {
          console.warn(`[Music] Silent placeholder for ${sceneKey} — all providers failed`);
        }
        if (musicJobId && projectId) {
          await completeGenerationJob(musicJobId, data.tokensUsed || 200, musicUrl);
        }
      }

      // ── Generate SFX clips ──
      for (const sfx of sfxList) {
        try {
          const { data: sfxData } = await supabase.functions.invoke('ai-universal-processor', {
            body: { action: 'generate_sfx', prompt: sfx.prompt, duration: sfx.duration || 3 },
          });
          if (sfxData?.audioUrl) {
            sfxUrls.push(sfxData.audioUrl);
          }
          // Rate limit between SFX calls
          await new Promise(r => setTimeout(r, 500));
        } catch (err) {
          console.warn(`[SFX] Failed for ${sceneKey}:`, err);
        }
      }

      // Persist to DB
      if (projectId) {
        await updateSceneMusic(projectId, sceneKey, musicUrl, sfxUrls);
      }

      setSceneProduction(prev => ({
        ...prev,
        [sceneKey]: {
          ...(prev[sceneKey] || {} as SceneProductionStatus),
          music: 'done',
          musicUrl,
          sfxUrls,
        },
      }));

      toast.success(`Music generated for ${sceneTitle}`);
    } catch (err: any) {
      console.error(`[Music] Error for ${sceneKey}:`, err);
      setSceneProduction(prev => ({
        ...prev,
        [sceneKey]: { ...(prev[sceneKey] || {} as SceneProductionStatus), music: 'error' },
      }));
      toast.error(`Music failed for ${sceneTitle}: ${err.message}`);
    }
  }, [projectId, trackGenerationJob, completeGenerationJob, updateSceneMusic]);

  const startAllMusicProduction = useCallback(async (
    configs: MusicSfxConfig[],
    setSceneProduction: React.Dispatch<React.SetStateAction<Record<string, SceneProductionStatus>>>,
  ) => {
    for (let i = 0; i < configs.length; i++) {
      await startSceneMusicProduction(configs[i], setSceneProduction);
      // Delay between scenes
      if (i < configs.length - 1) await new Promise(r => setTimeout(r, 500));
    }
  }, [startSceneMusicProduction]);

  return { startSceneMusicProduction, startAllMusicProduction };
}

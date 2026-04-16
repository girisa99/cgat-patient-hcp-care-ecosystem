/**
 * useMusicSfxGeneration
 *
 * Generic music + SFX generation hook for Cast production.
 * Handles per-scene background music and sound effects.
 * Works with any project type (video, podcast, educational, UGC).
 *
 * EP04 Learnings Encoded:
 * L2  — Re-upload ALL generated audio URLs to Supabase Storage (CDN URLs expire)
 * L13 — Retry with exponential backoff for transient failures
 * L18 — Timeout guards: 120s for music, 30s per SFX clip
 * L42 — 3× retry with 0s/5s/15s backoff for all external API calls
 *
 * Integrations:
 * - musicAutoComposer.composeMusicPrompt() for prompt generation
 * - musicAutoComposer.composeSfxPrompts() for SFX prompt generation
 * - multi-provider-music edge function for music generation
 * - ai-universal-processor edge function for SFX generation
 */

import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCastProjectPersistence } from '@/hooks/useCastProjectPersistence';
import { needsCdnReUpload, isSupabaseStorageUrl, isBase64DataUri } from '@/constants/castCdnProviders';
import { CAST_STORAGE } from '@/config/castProductionConfig';
import type { SceneProductionStatus } from './useVisualGeneration';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MusicSfxConfig {
  sceneKey: string;
  sceneTitle: string;
  musicPrompt?: string;
  musicDuration?: number;
  instrumental?: boolean;
  sfxList?: Array<{ prompt: string; duration?: number }>;
  /** Optional: industry for musicAutoComposer prompt enrichment */
  industry?: string;
  /** Optional: format for musicAutoComposer prompt enrichment */
  format?: string;
  /** Optional: mood/tone for prompt enrichment */
  mood?: string;
}

export interface MusicSfxResult {
  startSceneMusicProduction: (
    config: MusicSfxConfig,
    setSceneProduction: React.Dispatch<React.SetStateAction<Record<string, SceneProductionStatus>>>,
  ) => Promise<void>;
  startAllMusicProduction: (
    configs: MusicSfxConfig[],
    setSceneProduction: React.Dispatch<React.SetStateAction<Record<string, SceneProductionStatus>>>,
    /** M2: Pass existing sceneProduction to enable resume-from-checkpoint */
    existingProduction?: Record<string, SceneProductionStatus>,
  ) => Promise<void>;
}

// ─── URL Safety Helpers — imported from @/constants/castCdnProviders ────────

// ─── Retry Helper (L42: 3× retry with exponential backoff) ─────────────────

const RETRY_BACKOFFS = [0, 5000, 15000]; // 0s, 5s, 15s

async function invokeWithRetry(
  edgeFn: string,
  body: Record<string, unknown>,
  label: string,
  timeoutMs: number,
  maxAttempts = 3,
): Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      const backoff = RETRY_BACKOFFS[attempt] || 15000;
      console.log(`[Music] Retry ${attempt + 1}/${maxAttempts} for "${label}" after ${backoff / 1000}s`);
      await new Promise(r => setTimeout(r, backoff));
    }

    try {
      const invokePromise = supabase.functions.invoke(edgeFn, { body });
      const timeoutPromise = new Promise<{ data: null; error: { message: string } }>(resolve =>
        setTimeout(() => resolve({ data: null, error: { message: `${label} timed out after ${timeoutMs / 1000}s` } }), timeoutMs)
      );
      const result = await Promise.race([invokePromise, timeoutPromise]);

      // Success or non-transient error — don't retry
      if (!result.error) return result as { data: Record<string, unknown>; error: null };

      const msg = result.error?.message || '';
      const isTransient = /timeout|timed out|5\d\d|rate.?limit|ECONNRESET|fetch.?failed/i.test(msg);
      if (!isTransient) return result as { data: null; error: { message: string } };

      console.warn(`[Music] Transient error for "${label}" (attempt ${attempt + 1}):`, msg);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.warn(`[Music] Exception for "${label}" (attempt ${attempt + 1}):`, msg);
      if (attempt === maxAttempts - 1) return { data: null, error: { message: msg } };
    }
  }
  return { data: null, error: { message: `${label} failed after ${maxAttempts} attempts` } };
}

/** Re-upload audio URL to Supabase Storage for permanence */
async function ensureAudioStorageUrl(
  projectId: string,
  key: string,
  url: string,
): Promise<string> {
  if (isSupabaseStorageUrl(url)) return url;
  if (!needsCdnReUpload(url)) return url;

  try {
    const ext = url.match(/\.(mp3|wav|ogg|aac|m4a|flac)/i)?.[1] || 'mp3';
    const mime = ext === 'wav' ? 'audio/wav' : ext === 'ogg' ? 'audio/ogg' : 'audio/mpeg';
    const safeName = key.replace(/[^a-zA-Z0-9_-]/g, '_');
    const storagePath = `${projectId}/audio/${safeName}.${ext}`;

    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
    const blob = await resp.blob();

    const { error } = await supabase.storage.from(CAST_STORAGE.ASSETS_BUCKET).upload(storagePath, blob, {
      contentType: mime,
      upsert: true,
    });
    if (error) {
      console.warn(`[Music] Storage upload failed for "${key}":`, error.message);
      return url;
    }

    const { data: { publicUrl } } = supabase.storage.from(CAST_STORAGE.ASSETS_BUCKET).getPublicUrl(storagePath);
    console.log(`[Music] Re-uploaded "${key}" to Storage`);
    return publicUrl;
  } catch (err) {
    console.warn(`[Music] ensureAudioStorageUrl failed for "${key}":`, err);
    return url;
  }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useMusicSfxGeneration(projectId: string | null): MusicSfxResult {
  const { updateSceneMusic, trackGenerationJob, completeGenerationJob } = useCastProjectPersistence();

  const startSceneMusicProduction = useCallback(async (
    config: MusicSfxConfig,
    setSceneProduction: React.Dispatch<React.SetStateAction<Record<string, SceneProductionStatus>>>,
  ) => {
    const {
      sceneKey, sceneTitle, musicPrompt, musicDuration = 30,
      instrumental = true, sfxList = [],
    } = config;

    setSceneProduction(prev => ({
      ...prev,
      [sceneKey]: { ...(prev[sceneKey] || {} as SceneProductionStatus), music: 'generating' },
    }));

    let musicUrl: string | null = null;
    const sfxUrls: string[] = [];

    try {
      // ── Generate background music ──────────────────────────────────────

      // Build prompt: use provided prompt or fall back to descriptive default
      const prompt = musicPrompt ||
        `Cinematic instrumental background music for: "${sceneTitle}". Emotional, orchestral, professional production quality.`;

      let musicJobId: string | null = null;
      if (projectId) {
        musicJobId = await trackGenerationJob({
          projectId, jobType: 'video' as any, sceneKey, provider: 'suno', estimatedTokens: 200,
        });
      }

      // L18 + L42: Music generation with 120s timeout + 3× retry
      const { data, error } = await invokeWithRetry(
        'multi-provider-music',
        {
          prompt,
          duration: musicDuration,
          instrumental,
          tier: 'advanced',
          projectId: projectId || undefined,
          sceneKey,
        },
        `Music for ${sceneKey}`,
        120000, // 120s timeout
      );

      if (error) {
        console.error(`[Music] Error for ${sceneKey}:`, error);
        toast.error(`Music generation failed for ${sceneTitle}`);
      } else if (data?.audioUrl) {
        // Check for silent placeholder (all providers failed)
        if (data.isSilentPlaceholder) {
          console.warn(`[Music] Silent placeholder for ${sceneKey} — all providers failed`);
          toast.warning(`Music for "${sceneTitle}" — all providers returned silent placeholder`);
        }

        musicUrl = data.audioUrl as string;

        // L2: Re-upload to Supabase Storage (CDN URLs expire)
        if (projectId && needsCdnReUpload(musicUrl)) {
          try {
            musicUrl = await ensureAudioStorageUrl(projectId, `music-${sceneKey}`, musicUrl);
          } catch {
            console.warn(`[Music] ${sceneKey}: Storage mirror failed, using original URL`);
          }
        }

        if (musicJobId && projectId) {
          await completeGenerationJob(musicJobId, (data.tokensUsed as number) || 200, musicUrl);
        }
      }

      // ── Generate SFX clips ─────────────────────────────────────────────

      for (let i = 0; i < sfxList.length; i++) {
        const sfx = sfxList[i];
        try {
          // L18 + L42: SFX with 30s timeout + 3× retry
          const { data: sfxData } = await invokeWithRetry(
            'ai-universal-processor',
            { action: 'generate_sfx', prompt: sfx.prompt, duration: sfx.duration || 3 },
            `SFX ${sceneKey}-${i}`,
            30000, // 30s timeout per clip
          );

          if (sfxData?.audioUrl) {
            let sfxUrl = sfxData.audioUrl as string;

            // Reject data URIs for SFX (should never happen, but guard)
            if (isBase64DataUri(sfxUrl)) {
              console.warn(`[SFX] Data URI returned for ${sceneKey}-${i}, skipping`);
            } else {
              // Re-upload SFX to Storage
              if (projectId && needsCdnReUpload(sfxUrl)) {
                try {
                  sfxUrl = await ensureAudioStorageUrl(projectId, `sfx-${sceneKey}-${i}`, sfxUrl);
                } catch { /* keep original */ }
              }
              sfxUrls.push(sfxUrl);
            }
          }

          // Rate limit between SFX calls
          if (i < sfxList.length - 1) await new Promise(r => setTimeout(r, 500));
        } catch (err) {
          console.warn(`[SFX] Failed for ${sceneKey} sfx-${i}:`, err);
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
          music: musicUrl ? 'done' : 'error',
          musicUrl,
          sfxUrls,
        },
      }));

      if (musicUrl) {
        toast.success(`Music generated for ${sceneTitle}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[Music] Error for ${sceneKey}:`, err);
      setSceneProduction(prev => ({
        ...prev,
        [sceneKey]: { ...(prev[sceneKey] || {} as SceneProductionStatus), music: 'error' },
      }));
      toast.error(`Music failed for ${sceneTitle}: ${message}`);
    }
  }, [projectId, trackGenerationJob, completeGenerationJob, updateSceneMusic]);

  const startAllMusicProduction = useCallback(async (
    configs: MusicSfxConfig[],
    setSceneProduction: React.Dispatch<React.SetStateAction<Record<string, SceneProductionStatus>>>,
    /** M2: Pass existing sceneProduction to enable resume-from-checkpoint */
    existingProduction?: Record<string, SceneProductionStatus>,
  ) => {
    // M2: Resume-from-checkpoint — skip scenes with music already done
    const pendingConfigs = existingProduction
      ? configs.filter(c => {
          const status = existingProduction[c.sceneKey];
          if (status?.music === 'done' && status.musicUrl) {
            console.log(`[Music] Skipping ${c.sceneKey} — music already done (resume-from-checkpoint)`);
            return false;
          }
          return true;
        })
      : configs;

    if (pendingConfigs.length < configs.length) {
      const skipped = configs.length - pendingConfigs.length;
      toast.info(`Music: ${skipped} scene${skipped > 1 ? 's' : ''} already complete, ${pendingConfigs.length} remaining`);
    }

    for (let i = 0; i < pendingConfigs.length; i++) {
      await startSceneMusicProduction(pendingConfigs[i], setSceneProduction);
      // Delay between scenes to prevent rate limiting
      if (i < pendingConfigs.length - 1) await new Promise(r => setTimeout(r, 1000));
    }
    toast.success('All music generation complete');
  }, [startSceneMusicProduction]);

  return { startSceneMusicProduction, startAllMusicProduction };
}

/**
 * useTtsGeneration
 *
 * Generic TTS generation hook for Cast production.
 * Handles single-line + batch generation, playback, retry, and DB persistence.
 * Works with any voice config from DB (not hardcoded EP04 voices).
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCastProjectPersistence } from '@/hooks/useCastProjectPersistence';

// ─── Upload base64 TTS audio to Supabase Storage ────────────────────────────
async function uploadTtsToStorage(
  projectId: string,
  lineKey: string,
  base64Audio: string,
): Promise<string> {
  const binaryStr = atob(base64Audio);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
  const blob = new Blob([bytes], { type: 'audio/mpeg' });

  const path = `${projectId}/tts/${lineKey}.mp3`;
  const { error } = await supabase.storage.from('cast-assets').upload(path, blob, {
    contentType: 'audio/mpeg',
    upsert: true,
  });
  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage.from('cast-assets').getPublicUrl(path);
  return publicUrl;
}

export interface GeneratedAudio {
  audioUrl: string;
  provider: string;
  voice: string;
}

export type LineStatus = 'idle' | 'generating' | 'done' | 'error';

export interface VoiceConfig {
  provider: string;
  voiceId: string;
  stability?: number;
  similarityBoost?: number;
  rate?: string;
  pitch?: string;
  speed?: number;
  style?: string;
  fallbackProvider?: string;
  fallbackVoice?: Record<string, unknown>;
}

export interface ScriptLineData {
  key: string;
  text: string;
  characterKey: string;
  sceneKey: string;
  durationEst: number;
  direction?: string;
  lipsync?: boolean;
  sfx?: string[];
}

export interface TtsGenerationResult {
  audioMap: Record<string, GeneratedAudio>;
  statusMap: Record<string, LineStatus>;
  playingKey: string | null;
  batchProgress: { current: number; total: number } | null;
  generateLine: (key: string) => Promise<boolean>;
  generateAll: () => Promise<void>;
  cancelBatch: () => void;
  playLine: (key: string) => void;
  stopPlayback: () => void;
  playAll: () => Promise<void>;
  restoreFromDb: (projectId: string, scriptKeys: string[]) => Promise<void>;
  doneCount: number;
  errorCount: number;
  totalCount: number;
}

export function useTtsGeneration(
  projectId: string | null,
  scriptLines: ScriptLineData[],
  voiceConfigMap: Record<string, VoiceConfig>,
  language: string = 'en-US',
): TtsGenerationResult {
  const [audioMap, setAudioMap] = useState<Record<string, GeneratedAudio>>({});
  const [statusMap, setStatusMap] = useState<Record<string, LineStatus>>({});
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  const abortRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { updateLineTTS, trackGenerationJob, completeGenerationJob } = useCastProjectPersistence();

  const scriptKeys = scriptLines.map(l => l.key);
  const scriptLookup = useRef<Record<string, ScriptLineData>>({});

  // Build lookup map when scriptLines changes
  useEffect(() => {
    const lookup: Record<string, ScriptLineData> = {};
    for (const line of scriptLines) {
      lookup[line.key] = line;
    }
    scriptLookup.current = lookup;
  }, [scriptLines]);

  // ─── Generate TTS for a single line ──────────────────────────────────────

  const generateLine = useCallback(async (key: string): Promise<boolean> => {
    try {
      const line = scriptLookup.current[key];
      if (!line) {
        toast.error(`TTS: Line "${key}" not found`);
        return false;
      }

      // Skip visual-only lines (empty text)
      if (!line.text || line.text.trim().length === 0) {
        setStatusMap(prev => ({ ...prev, [key]: 'done' }));
        setAudioMap(prev => ({ ...prev, [key]: { audioUrl: '', provider: 'none', voice: 'visual-only' } }));
        return true;
      }

      setStatusMap(prev => ({ ...prev, [key]: 'generating' }));

      const voiceConfig = voiceConfigMap[line.characterKey];
      if (!voiceConfig?.voiceId) {
        toast.error(`TTS: No voice config for character "${line.characterKey}"`);
        setStatusMap(prev => ({ ...prev, [key]: 'error' }));
        return false;
      }

      // Track generation job
      let jobId: string | null = null;
      if (projectId) {
        const estimatedTokens = Math.ceil(line.text.length / 4);
        jobId = await trackGenerationJob({
          projectId,
          jobType: 'tts',
          sceneKey: line.sceneKey,
          lineKey: key,
          provider: voiceConfig.provider,
          estimatedTokens,
        });
      }

      const { data, error } = await supabase.functions.invoke('multi-provider-tts', {
        body: {
          text: line.text,
          languageCode: language,
          provider: voiceConfig.provider,
          voice: voiceConfig.voiceId,
          tier: 'premium',
          voiceStyle: {
            stability: voiceConfig.stability,
            similarity_boost: voiceConfig.similarityBoost,
            ...(voiceConfig.rate || voiceConfig.pitch ? {
              azureProsody: { rate: voiceConfig.rate, pitch: voiceConfig.pitch },
            } : {}),
          },
        },
      });

      if (error) {
        console.error(`[TTS] Edge function error for "${key}":`, error);
        toast.error(`TTS error for "${key}": ${error.message}`);
        setStatusMap(prev => ({ ...prev, [key]: 'error' }));
        return false;
      }

      if (!data?.audioContent && !data?.audioUrl) {
        toast.error(`TTS: No audio returned for "${key}"`);
        setStatusMap(prev => ({ ...prev, [key]: 'error' }));
        return false;
      }

      // Upload base64 audio to Supabase Storage instead of storing as data URI
      let audioUrl = data.audioUrl; // Use URL if provider already returns one
      if (!audioUrl && data.audioContent) {
        if (projectId) {
          try {
            audioUrl = await uploadTtsToStorage(projectId, key, data.audioContent);
          } catch (uploadErr) {
            console.warn(`[TTS] Storage upload failed for "${key}", falling back to data URI:`, uploadErr);
            audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
          }
        } else {
          // No projectId — can't build a storage path, use data URI as fallback
          audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
        }
      }

      const resolvedProvider = data.provider || voiceConfig.provider;
      const resolvedVoice = data.voice || voiceConfig.voiceId;
      const actualTokens = data.tokensUsed || Math.ceil(line.text.length / 4);

      setAudioMap(prev => ({ ...prev, [key]: { audioUrl: audioUrl!, provider: resolvedProvider, voice: resolvedVoice } }));
      setStatusMap(prev => ({ ...prev, [key]: 'done' }));

      // Persist to DB
      if (projectId) {
        updateLineTTS(projectId, key, {
          tts_audio_url: audioUrl!,
          tts_provider: resolvedProvider,
          tts_voice_id: resolvedVoice,
          tts_status: 'generated',
        });
        if (jobId) {
          completeGenerationJob(jobId, actualTokens, audioUrl);
        }
      }
      return true;
    } catch (err: any) {
      console.error(`[TTS] Error for "${key}":`, err);
      toast.error(`TTS failed: ${err.message}`);
      setStatusMap(prev => ({ ...prev, [key]: 'error' }));
      return false;
    }
  }, [projectId, voiceConfigMap, language, trackGenerationJob, completeGenerationJob, updateLineTTS]);

  // ─── Batch generate all remaining lines ──────────────────────────────────

  const generateAll = useCallback(async () => {
    abortRef.current = false;
    const keys = scriptKeys.filter(k => statusMap[k] !== 'done');
    setBatchProgress({ current: 0, total: keys.length });

    let success = 0;
    for (let i = 0; i < keys.length; i++) {
      if (abortRef.current) break;
      setBatchProgress({ current: i + 1, total: keys.length });
      const ok = await generateLine(keys[i]);
      if (ok) success++;
      // Rate limit delay between API calls
      if (i < keys.length - 1) await new Promise(r => setTimeout(r, 500));
    }

    setBatchProgress(null);
    if (success === keys.length) {
      toast.success(`Generated all ${success} voiceovers`);
    } else if (success > 0) {
      toast.warning(`Generated ${success}/${keys.length} — ${keys.length - success} failed`);
    } else {
      toast.error(`All ${keys.length} TTS generations failed`);
    }
  }, [scriptKeys, statusMap, generateLine]);

  const cancelBatch = useCallback(() => {
    abortRef.current = true;
    setBatchProgress(null);
  }, []);

  // ─── Playback ────────────────────────────────────────────────────────────

  const playLine = useCallback((key: string) => {
    const audio = audioMap[key];
    if (!audio?.audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const el = new Audio(audio.audioUrl);
    el.onended = () => setPlayingKey(null);
    el.onerror = () => setPlayingKey(null);
    audioRef.current = el;
    setPlayingKey(key);
    el.play().catch(() => setPlayingKey(null));
  }, [audioMap]);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingKey(null);
  }, []);

  const playAll = useCallback(async () => {
    const playable = scriptKeys.filter(k => audioMap[k]?.audioUrl);
    for (const key of playable) {
      if (abortRef.current) break;
      await new Promise<void>(resolve => {
        const el = new Audio(audioMap[key].audioUrl);
        audioRef.current = el;
        setPlayingKey(key);
        el.onended = () => resolve();
        el.onerror = () => resolve();
        el.play().catch(() => resolve());
      });
    }
    setPlayingKey(null);
  }, [scriptKeys, audioMap]);

  // ─── Restore TTS from DB (two-source recovery) ──────────────────────────

  const restoreFromDb = useCallback(async (pid: string, keys: string[]) => {
    try {
      // Source 1: cast_project_script_lines
      const { data: lines } = await supabase
        .from('cast_project_script_lines')
        .select('line_key, tts_audio_url, tts_provider, tts_voice_id, tts_status')
        .eq('project_id', pid)
        .in('line_key', keys);

      const restored: Record<string, GeneratedAudio> = {};
      const restoredStatus: Record<string, LineStatus> = {};

      if (lines) {
        for (const row of lines) {
          if (row.tts_audio_url && row.tts_status === 'generated') {
            restored[row.line_key] = {
              audioUrl: row.tts_audio_url,
              provider: row.tts_provider || 'unknown',
              voice: row.tts_voice_id || 'unknown',
            };
            restoredStatus[row.line_key] = 'done';
          }
        }
      }

      // Source 2 (fallback): cast_generation_jobs for lines missing from source 1
      const missingKeys = keys.filter(k => !restored[k]);
      if (missingKeys.length > 0) {
        const { data: jobs } = await supabase
          .from('cast_generation_jobs')
          .select('line_key, output_url, provider')
          .eq('project_id', pid)
          .eq('job_type', 'tts')
          .eq('status', 'completed')
          .in('line_key', missingKeys);

        if (jobs) {
          for (const job of jobs) {
            if (job.output_url && job.line_key) {
              restored[job.line_key] = {
                audioUrl: job.output_url,
                provider: job.provider || 'unknown',
                voice: 'unknown',
              };
              restoredStatus[job.line_key] = 'done';
            }
          }
        }
      }

      if (Object.keys(restored).length > 0) {
        setAudioMap(prev => ({ ...prev, ...restored }));
        setStatusMap(prev => ({ ...prev, ...restoredStatus }));
        console.log(`[TTS] Restored ${Object.keys(restored).length}/${keys.length} from DB`);
      }
    } catch (err) {
      console.warn('[TTS] Failed to restore from DB:', err);
    }
  }, []);

  // Computed counts
  const doneCount = scriptKeys.filter(k => statusMap[k] === 'done').length;
  const errorCount = scriptKeys.filter(k => statusMap[k] === 'error').length;

  return {
    audioMap, statusMap, playingKey, batchProgress,
    generateLine, generateAll, cancelBatch,
    playLine, stopPlayback, playAll,
    restoreFromDb,
    doneCount, errorCount, totalCount: scriptKeys.length,
  };
}

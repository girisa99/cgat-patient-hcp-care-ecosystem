/**
 * useEP04DataRestore — React Query hooks replacing EP04Production's monolithic useEffect.
 *
 * Three composable hooks with proper caching:
 * 1. useEP04ProjectLookup  — finds/creates the EP04 project row
 * 2. useRestoredTts         — merges primary TTS + fallback generation_jobs
 * 3. useRestoredSceneProduction — loads scene artifacts + infers production phase
 *
 * Cache strategy:
 * - TTS URLs are immutable once generated → staleTime: 15 min
 * - Scene artifacts change on generation → staleTime: 10 min
 * - Project ID never changes within session → staleTime: 30 min
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { castKeys } from './castQueryKeys';
import {
  fetchTtsLines,
  fetchTtsJobsFallback,
  fetchSceneArtifactsAll,
  fetchVisualJobsFallback,
  fetchProjectStatus,
  lookupOrCreateProject,
} from '@/services/castProjectQueries';

// ── localStorage persistence layer ─────────────────────────────────────────
// Survives hard refresh (F5) — zero DB queries within maxAge window.

const PERSIST_PREFIX = 'rq-cast-';
const PERSIST_MAX_AGE = 15 * 60 * 1000; // 15 minutes

function persistToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${PERSIST_PREFIX}${key}`, JSON.stringify({ ts: Date.now(), data }));
  } catch { /* quota exceeded — silent fail */ }
}

function readFromStorage<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(`${PERSIST_PREFIX}${key}`);
    if (!raw) return undefined;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > PERSIST_MAX_AGE) {
      localStorage.removeItem(`${PERSIST_PREFIX}${key}`);
      return undefined;
    }
    return data as T;
  } catch {
    return undefined;
  }
}

// ── Types (matching EP04Production's internal types) ────────────────────────

export interface GeneratedAudio {
  audioUrl: string;
  provider: string;
  voice: string;
  audioDuration?: number;
}

export type LineStatus = 'idle' | 'generating' | 'done' | 'error';

export type ProductionPhase = 'tts' | 'tts_approved' | 'visual' | 'music' | 'assembly' | 'complete';

export interface SceneProductionStatus {
  visual: 'idle' | 'generating' | 'done' | 'error';
  music: 'idle' | 'generating' | 'done' | 'error';
  sfx: 'idle' | 'generating' | 'done' | 'error';
  assembled: 'idle' | 'generating' | 'done' | 'error';
  videoUrls: Record<string, string>;
  imageUrls: Record<string, string>;
  avatarUrls: Record<string, string>;
  lipsyncUrls: Record<string, string>;
  musicUrl: string | null;
  sfxUrls: string[];
  assembledClipUrl: string | null;
}

// ── Helpers (extracted from EP04Production) ─────────────────────────────────

const isBase64DataUri = (url: string): boolean =>
  typeof url === 'string' && url.startsWith('data:');

const isExpiredCdnUrl = (url: string): boolean =>
  !!url && !url.includes('supabase.co/storage') && (
    url.includes('oss-cn-beijing') || url.includes('replicate.delivery') || url.includes('dashscope')
  );

const filterPlaceholders = (urls: Record<string, string>): Record<string, string> => {
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(urls)) {
    if (v && !v.includes('placehold.co') && !isBase64DataUri(v)) {
      clean[k] = v;
    }
  }
  return clean;
};

const dedupBucket = (bucket: Record<string, string>): Record<string, string> => {
  const seenUrls = new Set<string>();
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(bucket)) {
    if (!v || seenUrls.has(v)) continue;
    seenUrls.add(v);
    clean[k] = v;
  }
  return clean;
};

// ── Auth helper ─────────────────────────────────────────────────────────────

async function getAuthUserId(): Promise<string | null> {
  // Fast path: local session
  try {
    const sessionResult = await Promise.race([
      supabase.auth.getSession(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
    ]) as any;
    const user = sessionResult?.data?.session?.user;
    if (user?.id) return user.id;
  } catch { /* fall through */ }

  // Slow path: network validation
  try {
    const authResult = await Promise.race([
      supabase.auth.getUser(),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Auth check timed out')), 8000)
      ),
    ]) as any;
    if (authResult?.data?.user?.id) return authResult.data.user.id;
  } catch { /* fall through */ }

  // Retry once
  try {
    await new Promise(r => setTimeout(r, 1000));
    const retryResult = await Promise.race([
      supabase.auth.getSession(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
    ]) as any;
    return retryResult?.data?.session?.user?.id || null;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. useEP04ProjectLookup
// ═══════════════════════════════════════════════════════════════════════════

interface ProjectLookupResult {
  projectId: string | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Finds or creates the EP04 project row.
 * Only runs when no explicit projectId is provided (URL param).
 */
export function useEP04ProjectLookup(
  urlProjectId: string | null,
  styleIntent: string = 'ep04-sprint-documentary',
): ProjectLookupResult {
  const query = useQuery({
    queryKey: castKeys.projectLookup('current-user', styleIntent),
    queryFn: async () => {
      const userId = await getAuthUserId();
      if (!userId) throw new Error('Not authenticated — please sign in and refresh');

      const result = await lookupOrCreateProject(userId, styleIntent);
      if (result.error) throw new Error(result.error);
      if (!result.projectId) throw new Error('Failed to create project');

      console.log('[EP04 RQ] Project lookup resolved:', result.projectId);
      return result.projectId;
    },
    enabled: !urlProjectId,
    staleTime: 30 * 60 * 1000, // 30 min — project ID never changes
    gcTime: 60 * 60 * 1000,    // keep in cache for 1 hour
    retry: 2,
    retryDelay: 2000,
  });

  return {
    projectId: urlProjectId || query.data || null,
    isLoading: !urlProjectId && query.isLoading,
    error: query.error?.message || null,
    retry: () => query.refetch(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. useRestoredTts
// ═══════════════════════════════════════════════════════════════════════════

interface RestoredTtsResult {
  audioMap: Record<string, GeneratedAudio>;
  statusMap: Record<string, LineStatus>;
  isLoading: boolean;
}

/**
 * Merges primary TTS (script_lines) + fallback (generation_jobs).
 * Auto-marks visual-only lines (empty text) as done.
 */
export function useRestoredTts(
  projectId: string | null | undefined,
  scriptContentKeys?: Record<string, { text?: string }>,
): RestoredTtsResult {
  const storageKey = projectId ? `tts-${projectId}` : '';
  const query = useQuery({
    queryKey: projectId ? castKeys.project(projectId).ttsLines : ['cast', 'noop-tts'],
    queryFn: async () => {
      if (!projectId) return { audio: {}, status: {} };

      const restoredAudio: Record<string, GeneratedAudio> = {};
      const restoredStatus: Record<string, LineStatus> = {};

      // Source 1: cast_project_script_lines (primary)
      const ttsLines = await fetchTtsLines(projectId);
      for (const line of ttsLines) {
        restoredAudio[line.line_key] = {
          audioUrl: line.tts_audio_url,
          provider: line.tts_provider || 'unknown',
          voice: line.tts_voice_id || 'unknown',
        };
        restoredStatus[line.line_key] = 'done';
      }

      // Source 2: cast_generation_jobs (fallback — fills gaps)
      const jobs = await fetchTtsJobsFallback(projectId);
      for (const job of jobs) {
        if (!restoredAudio[job.line_key]) {
          restoredAudio[job.line_key] = {
            audioUrl: job.output_url,
            provider: job.provider || 'unknown',
            voice: 'unknown',
          };
          restoredStatus[job.line_key] = 'done';
        }
      }

      // Auto-mark visual-only lines as done
      if (scriptContentKeys) {
        for (const [key, line] of Object.entries(scriptContentKeys)) {
          if (!line.text || line.text.trim().length === 0) {
            restoredAudio[key] = { audioUrl: '', provider: 'none', voice: 'visual-only' };
            restoredStatus[key] = 'done';
          }
        }
      }

      console.log(`[EP04 RQ] TTS restored: ${Object.keys(restoredAudio).length} entries`);
      const result = { audio: restoredAudio, status: restoredStatus };
      persistToStorage(storageKey, result);
      return result;
    },
    enabled: !!projectId,
    staleTime: 15 * 60 * 1000, // 15 min — TTS URLs are immutable
    gcTime: 30 * 60 * 1000,
    initialData: () => readFromStorage<{ audio: Record<string, GeneratedAudio>; status: Record<string, LineStatus> }>(storageKey),
    initialDataUpdatedAt: () => {
      // Tell RQ when the persisted data was saved so it can calculate staleness
      try {
        const raw = localStorage.getItem(`${PERSIST_PREFIX}${storageKey}`);
        if (raw) return JSON.parse(raw).ts;
      } catch { /* ignore */ }
      return 0;
    },
  });

  return {
    audioMap: query.data?.audio || {},
    statusMap: query.data?.status || {},
    isLoading: query.isLoading && !query.data, // not loading if we have initialData
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. useRestoredSceneProduction
// ═══════════════════════════════════════════════════════════════════════════

interface RestoredSceneProductionResult {
  sceneProduction: Record<string, SceneProductionStatus>;
  productionPhase: ProductionPhase;
  expiredMusicCount: number;
  restoredVideoUrl: string | null;
  isLoading: boolean;
}

/**
 * Loads scene artifacts from DB, applies cleanup (filter placeholders,
 * dedup URLs, detect expired CDN), and infers the production phase.
 */
export function useRestoredSceneProduction(
  projectId: string | null | undefined,
  sceneTitleKeys: string[],
): RestoredSceneProductionResult {
  const sceneStorageKey = projectId ? `scenes-${projectId}` : '';
  type SceneQueryResult = { scenes: Record<string, SceneProductionStatus>; phase: ProductionPhase; expiredMusicCount: number; videoUrl: string | null };
  const query = useQuery({
    queryKey: projectId ? castKeys.project(projectId).sceneSummaries : ['cast', 'noop-scenes'],
    queryFn: async (): Promise<SceneQueryResult> => {
      if (!projectId) {
        return { scenes: {}, phase: 'tts' as ProductionPhase, expiredMusicCount: 0, videoUrl: null };
      }

      const restored: Record<string, SceneProductionStatus> = {};

      // Source 1: cast_project_scenes — scene_config JSONB
      const dbScenes = await fetchSceneArtifactsAll(projectId);
      console.log(`[EP04 RQ] Found ${dbScenes.length} scene rows in DB`);

      for (const row of dbScenes) {
        const cfg = row.scene_config || {};
        const artifacts = cfg.artifacts as Record<string, Record<string, string>> | undefined;
        const gm = cfg.generatedMusic as { url?: string; sfxUrls?: string[] } | undefined;

        const hasArtifacts = artifacts && (
          Object.keys(artifacts.videoUrls || {}).length > 0 ||
          Object.keys(artifacts.imageUrls || {}).length > 0 ||
          Object.keys(artifacts.avatarUrls || {}).length > 0 ||
          Object.keys(artifacts.lipsyncUrls || {}).length > 0
        );
        const hasMusic = !!(gm?.url);
        const hasSfx = !!(gm?.sfxUrls && gm.sfxUrls.length > 0);
        const hasAssembly = !!cfg.assembledClipUrl;

        if (!hasArtifacts && !hasMusic && !hasSfx && !hasAssembly) continue;

        restored[row.scene_key] = {
          visual: hasArtifacts ? 'done' : 'idle',
          music: hasMusic ? 'done' : 'idle',
          sfx: hasSfx ? 'done' : 'idle',
          assembled: hasAssembly ? 'done' : 'idle',
          videoUrls: artifacts?.videoUrls || {},
          imageUrls: artifacts?.imageUrls || {},
          avatarUrls: artifacts?.avatarUrls || {},
          lipsyncUrls: artifacts?.lipsyncUrls || {},
          musicUrl: gm?.url || null,
          sfxUrls: gm?.sfxUrls || [],
          assembledClipUrl: cfg.assembledClipUrl || null,
        };
      }

      const source1SceneKeys = new Set(Object.keys(restored));

      // Source 2: cast_generation_jobs (gap-fill for scenes not in Source 1)
      const visualJobs = await fetchVisualJobsFallback(projectId);
      const seen = new Set<string>();
      for (const job of visualJobs) {
        const sk = job.scene_key;
        if (!sk || !job.output_url) continue;
        const dedupeKey = `${sk}::${job.job_type}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);
        if (source1SceneKeys.has(sk)) continue;

        if (!restored[sk]) {
          restored[sk] = {
            visual: 'done', music: 'idle', sfx: 'idle', assembled: 'idle',
            videoUrls: {}, imageUrls: {}, avatarUrls: {}, lipsyncUrls: {},
            musicUrl: null, sfxUrls: [], assembledClipUrl: null,
          };
        }
        const jt = job.job_type;
        const url = job.output_url;
        const isImageUrl = /\.(png|jpg|jpeg|webp|gif)(\?|$)/i.test(url);
        const urlKey = `${jt}-${sk}`;
        const alreadyHasUrl = (bucket: Record<string, string>) =>
          Object.values(bucket).includes(url);

        if (jt === 'avatar') {
          if (!alreadyHasUrl(restored[sk].avatarUrls)) restored[sk].avatarUrls[urlKey] = url;
        } else if (jt === 'lipsync') {
          if (!alreadyHasUrl(restored[sk].lipsyncUrls)) restored[sk].lipsyncUrls[urlKey] = url;
        } else if (jt === 'image' || isImageUrl) {
          if (!alreadyHasUrl(restored[sk].imageUrls)) restored[sk].imageUrls[urlKey] = url;
        } else {
          if (!alreadyHasUrl(restored[sk].videoUrls)) restored[sk].videoUrls[urlKey] = url;
        }
      }

      // Cleanup: filter placeholders + dedup + detect expired CDN
      for (const sk of Object.keys(restored)) {
        restored[sk].videoUrls = dedupBucket(filterPlaceholders(restored[sk].videoUrls));
        restored[sk].imageUrls = dedupBucket(filterPlaceholders(restored[sk].imageUrls));
        restored[sk].avatarUrls = dedupBucket(filterPlaceholders(restored[sk].avatarUrls));
        restored[sk].lipsyncUrls = dedupBucket(filterPlaceholders(restored[sk].lipsyncUrls));

        const totalUrls = Object.keys(restored[sk].videoUrls).length
          + Object.keys(restored[sk].imageUrls).length
          + Object.keys(restored[sk].avatarUrls).length
          + Object.keys(restored[sk].lipsyncUrls).length;

        if (totalUrls === 0 && !restored[sk].musicUrl
          && restored[sk].sfxUrls.length === 0 && !restored[sk].assembledClipUrl) {
          restored[sk].visual = 'idle';
        }
      }

      // Detect expired music URLs
      let expiredMusicCount = 0;
      for (const sk of Object.keys(restored)) {
        if (restored[sk].musicUrl && isExpiredCdnUrl(restored[sk].musicUrl!)) {
          expiredMusicCount++;
          restored[sk].music = 'done'; // UI will detect expired URL
        }
      }

      // Infer production phase
      const totalSceneCount = sceneTitleKeys.length;
      const restoredVisualCount = Object.keys(restored).filter(sk => restored[sk].visual === 'done').length;
      const musicCount = Object.values(restored).filter(s => s.music === 'done').length;
      const assembledCount = Object.values(restored).filter(s => s.assembled === 'done').length;

      let phase: ProductionPhase = 'tts';
      if (assembledCount >= totalSceneCount) {
        phase = 'complete';
      } else if (musicCount >= totalSceneCount) {
        phase = 'assembly';
      } else if (restoredVisualCount >= totalSceneCount) {
        phase = 'music';
      } else if (restoredVisualCount > 0) {
        phase = 'tts_approved';
      }

      // Check project status + final video URL from DB
      const projStatus = await fetchProjectStatus(projectId);
      const videoUrl = projStatus?.final_video_url || null;

      if (restoredVisualCount === 0) {
        if (projStatus?.status === 'visual_production' || projStatus?.status === 'complete') {
          phase = phase === 'tts' ? 'tts_approved' : phase;
        }
      }

      console.log(`[EP04 RQ] Scene restore: ${Object.keys(restored).length} scenes, ` +
        `${restoredVisualCount} visuals, ${musicCount} music, ${assembledCount} assembled → phase=${phase}` +
        `${videoUrl ? `, videoUrl=${videoUrl.substring(0, 60)}...` : ''}`);

      const result: SceneQueryResult = { scenes: restored, phase, expiredMusicCount, videoUrl };
      persistToStorage(sceneStorageKey, result);
      return result;
    },
    enabled: !!projectId,
    staleTime: 10 * 60 * 1000, // 10 min
    gcTime: 30 * 60 * 1000,
    initialData: () => readFromStorage<SceneQueryResult>(sceneStorageKey),
    initialDataUpdatedAt: () => {
      try {
        const raw = localStorage.getItem(`${PERSIST_PREFIX}${sceneStorageKey}`);
        if (raw) return JSON.parse(raw).ts;
      } catch { /* ignore */ }
      return 0;
    },
  });

  return {
    sceneProduction: query.data?.scenes || {},
    productionPhase: query.data?.phase || 'tts',
    expiredMusicCount: query.data?.expiredMusicCount || 0,
    restoredVideoUrl: query.data?.videoUrl || null,
    isLoading: query.isLoading && !query.data, // not loading if we have initialData
  };
}

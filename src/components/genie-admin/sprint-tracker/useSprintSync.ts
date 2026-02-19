/**
 * Sprint Sync — Real-time Supabase state for sprint tracking
 *
 * PROBLEM: Sprint data was hardcoded in source files.
 *   - Claude updates only appear after commit+push+merge
 *   - Lovable syncs instantly via their platform
 *   - PO/SM sees stale data until merge
 *
 * SOLUTION: Store task statuses, effort data, and standups in Supabase
 *   - Both developers write to `universal_save_sessions` in real-time
 *   - One shared row per sprint (channel_type = 'sprint-tracker')
 *   - Supabase real-time subscription for instant updates
 *   - Hardcoded data in data-config.ts / data-effort.ts serves as seed/fallback
 *
 * Usage:
 *   const { liveState, syncTaskStatus, syncEffort, syncStandup, isOnline } = useSprintSync();
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type {
  TaskStatus, Developer, StandupEntry, TaskOverride, TaskEffort,
  DisciplineEffort, Discipline,
} from './types';
import { DEFAULT_TASK_OVERRIDES, DEFAULT_STANDUPS } from './data-config';
import { ALL_EFFORT } from './data-effort';

// ── Types ──────────────────────────────────────────────────────────

/** Shape of the sprint state stored in Supabase form_data column */
export interface LiveSprintState {
  /** Task statuses from both developers, keyed by taskId */
  taskOverrides: Record<string, TaskOverride>;
  /** Standup entries from both developers */
  standups: StandupEntry[];
  /** Effort entries from both developers */
  efforts: TaskEffort[];
  /** Last update metadata */
  lastUpdatedBy: Developer | 'system';
  lastUpdatedAt: string;
  /** Version counter for conflict detection */
  version: number;
}

const SESSION_TYPE = 'sprint_tracker_live';
const CHANNEL_TYPE = 'sprint-tracker';
const SPRINT_ID = 'genie-sprint-feb17-21-2026';

// ── Merge Logic ────────────────────────────────────────────────────

/** Merge remote state with local seed data. Remote always wins for conflicts. */
function mergeState(remote: Partial<LiveSprintState> | null): LiveSprintState {
  // Start with seed data from hardcoded files
  const seedOverrides = { ...DEFAULT_TASK_OVERRIDES };
  const seedStandups = [...DEFAULT_STANDUPS];
  const seedEfforts = [...ALL_EFFORT];

  if (!remote) {
    return {
      taskOverrides: seedOverrides,
      standups: seedStandups,
      efforts: seedEfforts,
      lastUpdatedBy: 'system',
      lastUpdatedAt: new Date().toISOString(),
      version: 0,
    };
  }

  // Merge overrides: remote wins for any task that exists in both
  const mergedOverrides = { ...seedOverrides };
  if (remote.taskOverrides) {
    for (const [taskId, override] of Object.entries(remote.taskOverrides)) {
      const seed = seedOverrides[taskId];
      // Remote wins if it's newer or seed doesn't exist
      if (!seed || (override.updatedAt && seed.updatedAt && override.updatedAt > seed.updatedAt)) {
        mergedOverrides[taskId] = override;
      } else if (!seed) {
        mergedOverrides[taskId] = override;
      }
    }
  }

  // Merge standups: deduplicate by (day, developer, createdAt)
  const standupKey = (s: StandupEntry) => `${s.day}-${s.developer}-${s.createdAt}`;
  const standupMap = new Map<string, StandupEntry>();
  for (const s of seedStandups) standupMap.set(standupKey(s), s);
  if (remote.standups) {
    for (const s of remote.standups) standupMap.set(standupKey(s), s);
  }
  const mergedStandups = Array.from(standupMap.values())
    .sort((a, b) => a.day - b.day || a.createdAt.localeCompare(b.createdAt));

  // Merge efforts: deduplicate by taskId (remote wins)
  const effortMap = new Map<string, TaskEffort>();
  for (const e of seedEfforts) effortMap.set(e.taskId, e);
  if (remote.efforts) {
    for (const e of remote.efforts) effortMap.set(e.taskId, e); // remote overwrites seed
  }
  const mergedEfforts = Array.from(effortMap.values())
    .sort((a, b) => a.day - b.day || a.taskId.localeCompare(b.taskId));

  return {
    taskOverrides: mergedOverrides,
    standups: mergedStandups,
    efforts: mergedEfforts,
    lastUpdatedBy: remote.lastUpdatedBy || 'system',
    lastUpdatedAt: remote.lastUpdatedAt || new Date().toISOString(),
    version: remote.version || 0,
  };
}

// ── Hook ───────────────────────────────────────────────────────────

export function useSprintSync() {
  const [liveState, setLiveState] = useState<LiveSprintState>(() => mergeState(null));
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const versionRef = useRef(0);

  // ── Load from Supabase on mount ─────────────────────────────────
  useEffect(() => {
    loadRemoteState();
    const sub = subscribeToChanges();
    return () => { sub?.then(s => s?.unsubscribe()); };
  }, []);

  // ── Load remote state ───────────────────────────────────────────
  const loadRemoteState = useCallback(async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('universal_save_sessions')
        .select('id, form_data, metadata, updated_at')
        .eq('channel_type', CHANNEL_TYPE)
        .eq('current_step', SPRINT_ID)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        console.warn('[SprintSync] Load failed, using seed data:', error.message);
        setSyncError(error.message);
        return;
      }

      if (data && data.length > 0) {
        const row = data[0];
        setSessionId(row.id);
        const remote = row.form_data as Partial<LiveSprintState>;
        const merged = mergeState(remote);
        versionRef.current = merged.version;
        setLiveState(merged);
        setIsOnline(true);
        setLastSyncAt(new Date());
        setSyncError(null);
      } else {
        // No remote state yet — create initial
        await createInitialState();
      }
    } catch (e: any) {
      console.warn('[SprintSync] Failed to load:', e.message);
      setSyncError(e.message);
    }
  }, []);

  // ── Create initial state in Supabase ────────────────────────────
  const createInitialState = useCallback(async () => {
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      if (!userId) return; // Not authenticated — will use seed data only

      const initialState = mergeState(null);
      initialState.version = 1;

      const { data, error } = await (supabase as any)
        .from('universal_save_sessions')
        .insert({
          user_id: userId,
          session_type: SESSION_TYPE,
          channel_type: CHANNEL_TYPE,
          current_step: SPRINT_ID,
          form_data: initialState,
          progress_percentage: 0,
          metadata: {
            sprintStart: '2026-02-17',
            sprintEnd: '2026-02-21',
            developers: ['claude', 'lovable'],
          },
        })
        .select('id')
        .single();

      if (error) {
        console.warn('[SprintSync] Create failed:', error.message);
        return;
      }

      setSessionId(data.id);
      setLiveState(initialState);
      versionRef.current = 1;
      setIsOnline(true);
      setLastSyncAt(new Date());
    } catch (e: any) {
      console.warn('[SprintSync] Create failed:', e.message);
    }
  }, []);

  // ── Push state to Supabase ──────────────────────────────────────
  const pushState = useCallback(async (newState: LiveSprintState) => {
    if (!sessionId) return false;
    setIsSyncing(true);

    try {
      const { error } = await (supabase as any)
        .from('universal_save_sessions')
        .update({
          form_data: newState,
          progress_percentage: Math.round(
            (Object.values(newState.taskOverrides).filter(o => o.status === 'completed').length /
              Math.max(Object.keys(newState.taskOverrides).length, 1)) * 100
          ),
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) {
        console.error('[SprintSync] Push failed:', error.message);
        setSyncError(error.message);
        return false;
      }

      setLastSyncAt(new Date());
      setSyncError(null);
      return true;
    } catch (e: any) {
      console.error('[SprintSync] Push failed:', e.message);
      setSyncError(e.message);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [sessionId]);

  // ── Subscribe to real-time changes ──────────────────────────────
  const subscribeToChanges = useCallback(async () => {
    try {
      const channel = supabase
        .channel('sprint-tracker-live')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'universal_save_sessions',
            filter: `channel_type=eq.${CHANNEL_TYPE}`,
          },
          (payload: any) => {
            if (payload.new?.form_data) {
              const remote = payload.new.form_data as Partial<LiveSprintState>;
              // Only merge if remote is newer
              if ((remote.version || 0) > versionRef.current) {
                const merged = mergeState(remote);
                versionRef.current = merged.version;
                setLiveState(merged);
                setLastSyncAt(new Date());
              }
            }
          }
        )
        .subscribe((status: string) => {
          setIsOnline(status === 'SUBSCRIBED');
        });

      return channel;
    } catch (e) {
      console.warn('[SprintSync] Subscription failed — using local data');
      return null;
    }
  }, []);

  // ── Public mutation: Update task status ──────────────────────────
  const syncTaskStatus = useCallback(async (
    taskId: string,
    status: TaskStatus,
    developer: Developer,
    note?: string,
  ) => {
    const newState: LiveSprintState = {
      ...liveState,
      taskOverrides: {
        ...liveState.taskOverrides,
        [taskId]: {
          status,
          updatedAt: new Date().toISOString(),
          note,
        },
      },
      lastUpdatedBy: developer,
      lastUpdatedAt: new Date().toISOString(),
      version: versionRef.current + 1,
    };

    versionRef.current = newState.version;
    setLiveState(newState);
    await pushState(newState);
  }, [liveState, pushState]);

  // ── Public mutation: Add effort entry ───────────────────────────
  const syncEffort = useCallback(async (effort: TaskEffort) => {
    const existingIdx = liveState.efforts.findIndex(e => e.taskId === effort.taskId);
    const newEfforts = [...liveState.efforts];
    if (existingIdx >= 0) {
      newEfforts[existingIdx] = effort; // Update existing
    } else {
      newEfforts.push(effort); // Add new
    }

    const newState: LiveSprintState = {
      ...liveState,
      efforts: newEfforts,
      lastUpdatedBy: effort.developer,
      lastUpdatedAt: new Date().toISOString(),
      version: versionRef.current + 1,
    };

    versionRef.current = newState.version;
    setLiveState(newState);
    await pushState(newState);
  }, [liveState, pushState]);

  // ── Public mutation: Add standup ────────────────────────────────
  const syncStandup = useCallback(async (standup: StandupEntry) => {
    const newState: LiveSprintState = {
      ...liveState,
      standups: [...liveState.standups, standup],
      lastUpdatedBy: standup.developer,
      lastUpdatedAt: new Date().toISOString(),
      version: versionRef.current + 1,
    };

    versionRef.current = newState.version;
    setLiveState(newState);
    await pushState(newState);
  }, [liveState, pushState]);

  // ── Public: Force refresh from Supabase ─────────────────────────
  const forceRefresh = useCallback(async () => {
    await loadRemoteState();
  }, [loadRemoteState]);

  return {
    /** Merged sprint state (seed + remote) */
    liveState,
    /** Whether Supabase connection is active */
    isOnline,
    /** Whether a sync operation is in progress */
    isSyncing,
    /** Last successful sync timestamp */
    lastSyncAt,
    /** Last sync error message (null if OK) */
    syncError,
    /** Update a task's status — syncs to Supabase immediately */
    syncTaskStatus,
    /** Add or update an effort entry — syncs to Supabase immediately */
    syncEffort,
    /** Add a standup entry — syncs to Supabase immediately */
    syncStandup,
    /** Force reload from Supabase */
    forceRefresh,
  };
}

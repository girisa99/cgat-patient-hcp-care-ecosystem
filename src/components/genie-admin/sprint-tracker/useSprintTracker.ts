/**
 * Sprint Tracker — Hybrid State Management Hook
 *
 * Architecture:
 *   1. Hardcoded seed data (data-config.ts, data-effort.ts) — fallback + initial values
 *   2. localStorage — fast local cache for offline resilience
 *   3. Supabase real-time (useSprintSync) — live sync between Claude & Lovable
 *
 * Priority: Supabase > localStorage > seed data
 * Both developers see the same data in real-time without needing git merge.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  TaskStatus, Developer, SprintTrackerState, SprintMetrics,
  ActivityLogEntry, StandupEntry, EffortMetrics, TaskEffort,
} from './types';
import { SPRINT_TASKS } from './data-tasks';
import { DEFAULT_TASK_OVERRIDES, DEFAULT_STANDUPS, calculateCurrentDay } from './data-config';
import { ALL_EFFORT, computeEffortMetrics } from './data-effort';
import { useSprintSync } from './useSprintSync';

const STORAGE_KEY = 'genie_sprint_tracker_state_v3'; // v3: hybrid with Supabase sync

export function useSprintTracker() {
  // ── Supabase real-time sync ─────────────────────────────────────
  const {
    liveState,
    isOnline,
    isSyncing,
    lastSyncAt,
    syncError,
    syncTaskStatus,
    syncEffort,
    syncStandup,
    forceRefresh,
  } = useSprintSync();

  // ── Local state (localStorage fallback) ─────────────────────────
  const [localState, setLocalState] = useState<SprintTrackerState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          taskOverrides: parsed.taskOverrides ?? { ...DEFAULT_TASK_OVERRIDES },
          standups: parsed.standups ?? [...DEFAULT_STANDUPS],
          activityLog: parsed.activityLog ?? [],
          taskNotes: parsed.taskNotes ?? {},
        };
      }
    } catch (e) {
      console.error('[SprintTracker] Failed to load localStorage:', e);
    }
    return {
      taskOverrides: { ...DEFAULT_TASK_OVERRIDES },
      standups: [...DEFAULT_STANDUPS],
      activityLog: [],
      taskNotes: {},
    };
  });

  // ── Effective state: merge Supabase live + local ────────────────
  // Supabase data takes priority when online
  const effectiveOverrides = useMemo(() => {
    if (isOnline && liveState.taskOverrides) {
      // Merge: start with local, overlay with live (live wins on conflict)
      return { ...localState.taskOverrides, ...liveState.taskOverrides };
    }
    return localState.taskOverrides;
  }, [isOnline, liveState.taskOverrides, localState.taskOverrides]);

  const effectiveStandups = useMemo(() => {
    if (isOnline && liveState.standups.length > 0) {
      // Deduplicate by key
      const key = (s: StandupEntry) => `${s.day}-${s.developer}-${s.createdAt}`;
      const map = new Map<string, StandupEntry>();
      for (const s of localState.standups) map.set(key(s), s);
      for (const s of liveState.standups) map.set(key(s), s); // live wins
      return Array.from(map.values()).sort((a, b) => a.day - b.day || a.createdAt.localeCompare(b.createdAt));
    }
    return localState.standups;
  }, [isOnline, liveState.standups, localState.standups]);

  const effectiveEfforts = useMemo(() => {
    if (isOnline && liveState.efforts.length > 0) {
      const map = new Map<string, TaskEffort>();
      for (const e of ALL_EFFORT) map.set(e.taskId, e); // seed
      for (const e of liveState.efforts) map.set(e.taskId, e); // live wins
      return Array.from(map.values()).sort((a, b) => a.day - b.day || a.taskId.localeCompare(b.taskId));
    }
    return ALL_EFFORT;
  }, [isOnline, liveState.efforts]);

  // Build the effective combined state object
  const state: SprintTrackerState = useMemo(() => ({
    taskOverrides: effectiveOverrides,
    standups: effectiveStandups,
    activityLog: localState.activityLog,
    taskNotes: localState.taskNotes,
  }), [effectiveOverrides, effectiveStandups, localState.activityLog, localState.taskNotes]);

  // ── Persist to localStorage as backup ───────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        taskOverrides: effectiveOverrides,
        standups: effectiveStandups,
        activityLog: localState.activityLog,
        taskNotes: localState.taskNotes,
      }));
    } catch (e) {
      console.error('[SprintTracker] Failed to save localStorage:', e);
    }
  }, [effectiveOverrides, effectiveStandups, localState.activityLog, localState.taskNotes]);

  const currentDay = useMemo(() => calculateCurrentDay(), []);

  // ── Mutations: write to both local + Supabase ───────────────────

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus, note?: string) => {
    const task = SPRINT_TASKS.find(t => t.id === taskId);
    const developer = task?.developer ?? 'claude';

    // Local update (immediate)
    setLocalState(prev => ({
      ...prev,
      taskOverrides: {
        ...prev.taskOverrides,
        [taskId]: { status, updatedAt: new Date().toISOString(), note },
      },
      activityLog: [
        ...prev.activityLog,
        {
          timestamp: new Date().toISOString(),
          developer,
          action: `Changed ${taskId} to ${status}`,
          taskId,
          details: note,
        },
      ],
    }));

    // Supabase sync (async, non-blocking)
    syncTaskStatus(taskId, status, developer, note);
  }, [syncTaskStatus]);

  const addStandup = useCallback((entry: Omit<StandupEntry, 'createdAt'>) => {
    const fullEntry: StandupEntry = { ...entry, createdAt: new Date().toISOString() };

    // Local
    setLocalState(prev => ({
      ...prev,
      standups: [...prev.standups, fullEntry],
      activityLog: [
        ...prev.activityLog,
        {
          timestamp: new Date().toISOString(),
          developer: entry.developer,
          action: `Added Day ${entry.day} standup`,
        },
      ],
    }));

    // Supabase
    syncStandup(fullEntry);
  }, [syncStandup]);

  const addTaskNote = useCallback((taskId: string, note: string, developer: Developer) => {
    setLocalState(prev => ({
      ...prev,
      taskNotes: {
        ...prev.taskNotes,
        [taskId]: [...(prev.taskNotes[taskId] || []), `[${developer}] ${note}`],
      },
      activityLog: [
        ...prev.activityLog,
        {
          timestamp: new Date().toISOString(),
          developer,
          action: `Added note on ${taskId}`,
          taskId,
          details: note,
        },
      ],
    }));
  }, []);

  /** Add effort entry — syncs to Supabase immediately */
  const addEffort = useCallback((effort: TaskEffort) => {
    syncEffort(effort);
  }, [syncEffort]);

  const getTaskStatus = useCallback((taskId: string): TaskStatus => {
    return effectiveOverrides[taskId]?.status ?? 'pending';
  }, [effectiveOverrides]);

  // ── Computed metrics ────────────────────────────────────────────

  const metrics: SprintMetrics = useMemo(() => {
    const emptyDev = () => ({
      total: 0, completed: 0, inProgress: 0, blocked: 0,
      estimatedHours: 0, actualHours: 0,
      tokensUsed: 0, tokenCostCents: 0,
      byCategory: {} as Partial<Record<import('./types').WorkCategory, number>>,
    });
    const byDeveloper: SprintMetrics['byDeveloper'] = {
      lovable: emptyDev(),
      claude:  emptyDev(),
    };
    const byDay: SprintMetrics['byDay'] = {};
    let backlogCount = 0;
    let totalEstimatedHours = 0;
    let totalActualHours = 0;
    let totalTokensUsed = 0;
    let totalTokenCostCents = 0;
    const byCategory: SprintMetrics['byCategory'] = {};

    SPRINT_TASKS.forEach(task => {
      const status = effectiveOverrides[task.id]?.status ?? 'pending';
      const dev = byDeveloper[task.developer];
      const effort = task.effort;
      const isCompleted = status === 'completed';
      const isWIP = status === 'in-progress';

      dev.total++;
      dev.estimatedHours += task.estimatedHours;
      if (isCompleted) {
        dev.completed++;
        dev.actualHours += effort?.actualHours ?? task.estimatedHours;
        dev.tokensUsed += effort?.tokensUsed ?? 0;
        dev.tokenCostCents += effort?.tokenCostCents ?? 0;
      }
      if (isWIP) dev.inProgress++;

      // Category breakdown
      for (const cat of (effort?.workCategories ?? [])) {
        dev.byCategory[cat] = (dev.byCategory[cat] ?? 0) + 1;
        if (!byCategory[cat]) byCategory[cat] = { tasks: 0, estimatedHours: 0, actualHours: 0 };
        byCategory[cat]!.tasks++;
        byCategory[cat]!.estimatedHours += task.estimatedHours;
        if (isCompleted) byCategory[cat]!.actualHours += effort?.actualHours ?? task.estimatedHours;
      }

      // Day aggregates
      if (!byDay[task.day]) byDay[task.day] = { total: 0, completed: 0, estimatedHours: 0, actualHours: 0 };
      byDay[task.day].total++;
      byDay[task.day].estimatedHours += task.estimatedHours;
      if (isCompleted) {
        byDay[task.day].completed++;
        byDay[task.day].actualHours += effort?.actualHours ?? task.estimatedHours;
      }

      // Sprint totals
      totalEstimatedHours += task.estimatedHours;
      if (isCompleted) {
        totalActualHours += effort?.actualHours ?? task.estimatedHours;
        totalTokensUsed += effort?.tokensUsed ?? 0;
        totalTokenCostCents += effort?.tokenCostCents ?? 0;
      }

      if (task.day < currentDay && status !== 'completed' && status !== 'rejected') {
        backlogCount++;
      }
    });

    const total = SPRINT_TASKS.length;
    const completed = SPRINT_TASKS.filter(t =>
      (effectiveOverrides[t.id]?.status ?? 'pending') === 'completed'
    ).length;

    const velocityRatio = totalEstimatedHours > 0
      ? Math.round((totalActualHours / totalEstimatedHours) * 100) / 100
      : 1;

    return {
      byDeveloper, byDay, total, completed, backlogCount,
      totalEstimatedHours, totalActualHours, totalTokensUsed, totalTokenCostCents,
      velocityRatio, byCategory,
    };
  }, [effectiveOverrides, currentDay]);

  const boardColumns = useMemo(() => {
    const backlog: string[] = [];
    const todo: string[] = [];
    const inProgress: string[] = [];
    const done: string[] = [];

    SPRINT_TASKS.forEach(task => {
      const status = effectiveOverrides[task.id]?.status ?? 'pending';
      if (status === 'completed') {
        done.push(task.id);
      } else if (status === 'in-progress') {
        inProgress.push(task.id);
      } else if (status === 'rejected') {
        // skip
      } else if (task.day < currentDay) {
        backlog.push(task.id);
      } else {
        todo.push(task.id);
      }
    });

    return { backlog, todo, inProgress, done };
  }, [effectiveOverrides, currentDay]);

  const resetToDefaults = () => {
    // Clear all sprint-tracker localStorage keys so stale data doesn't bleed in
    const keysToRemove = [
      'genie_sprint_tracker_state_v2',
      'genie_sprint_tracker_state_v3',
      'genie_qa_signoff_v2',
      'genie_qa_signoff_v3',
      'genie_qa_signoff_notes_v2',
      'genie_qa_signoff_notes_v3',
      'genie_qa_carryover_v2',
      'genie_qa_carryover_v3',
      'genie_qa_sprint_signoff_v2',
      'genie_qa_sprint_signoff_v3',
      'genie_sprint_po_checklist',
      'genie_sprint_po_checklist_notes',
      'genie_sprint_po_notes',
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));
    setLocalState({
      taskOverrides: { ...DEFAULT_TASK_OVERRIDES },
      standups: [...DEFAULT_STANDUPS],
      activityLog: [],
      taskNotes: {},
    });
  };

  // Effort metrics — from live data (Supabase) or seed data (fallback)
  const effortMetrics: EffortMetrics = useMemo(
    () => computeEffortMetrics(effectiveEfforts),
    [effectiveEfforts]
  );

  // ── PO Checklist state (persisted to localStorage) ──────────────
  const PO_CHECKLIST_KEY = 'genie_sprint_po_checklist_v4';
  const [poChecklist, setPoChecklist] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(PO_CHECKLIST_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });

  const updatePoChecklist = useCallback((checklist: Record<string, boolean>) => {
    setPoChecklist(checklist);
    try { localStorage.setItem(PO_CHECKLIST_KEY, JSON.stringify(checklist)); } catch {}
  }, []);

  return {
    state,
    currentDay,
    metrics,
    effortMetrics,
    boardColumns,
    updateTaskStatus,
    addStandup,
    addTaskNote,
    addEffort,
    getTaskStatus,
    resetToDefaults,
    // PO Actions
    poChecklist,
    updatePoChecklist,
    // Sync status — for UI indicators
    isOnline,
    isSyncing,
    lastSyncAt,
    syncError,
    forceRefresh,
  };
}

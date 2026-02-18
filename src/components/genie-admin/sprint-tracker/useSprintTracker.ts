// Sprint Tracker — State Management Hook (localStorage persistence)
import { useState, useEffect, useMemo } from 'react';
import type { TaskStatus, Developer, SprintTrackerState, SprintMetrics, ActivityLogEntry, StandupEntry, EffortMetrics } from './types';
import { SPRINT_TASKS } from './data-tasks';
import { DEFAULT_TASK_OVERRIDES, DEFAULT_STANDUPS, calculateCurrentDay } from './data-config';
import { ALL_EFFORT, computeEffortMetrics } from './data-effort';

const STORAGE_KEY = 'genie_sprint_tracker_state_v3'; // v3: flush stale Days 3-5 sign-offs

export function useSprintTracker() {
  const [state, setState] = useState<SprintTrackerState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure all required fields exist (guards against stale cached state)
        return {
          taskOverrides: parsed.taskOverrides ?? { ...DEFAULT_TASK_OVERRIDES },
          standups: parsed.standups ?? [...DEFAULT_STANDUPS],
          activityLog: parsed.activityLog ?? [],
          taskNotes: parsed.taskNotes ?? {},
        };
      }
    } catch (e) {
      console.error('[SprintTracker] Failed to load state:', e);
    }
    return {
      taskOverrides: { ...DEFAULT_TASK_OVERRIDES },
      standups: [...DEFAULT_STANDUPS],
      activityLog: [],
      taskNotes: {},
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('[SprintTracker] Failed to save state:', e);
    }
  }, [state]);

  const currentDay = useMemo(() => calculateCurrentDay(), []);

  const updateTaskStatus = (taskId: string, status: TaskStatus, note?: string) => {
    const task = SPRINT_TASKS.find(t => t.id === taskId);
    setState(prev => ({
      ...prev,
      taskOverrides: {
        ...prev.taskOverrides,
        [taskId]: { status, updatedAt: new Date().toISOString(), note },
      },
      activityLog: [
        ...prev.activityLog,
        {
          timestamp: new Date().toISOString(),
          developer: task?.developer ?? 'claude',
          action: `Changed ${taskId} to ${status}`,
          taskId,
          details: note,
        },
      ],
    }));
  };

  const addStandup = (entry: Omit<StandupEntry, 'createdAt'>) => {
    setState(prev => ({
      ...prev,
      standups: [...prev.standups, { ...entry, createdAt: new Date().toISOString() }],
      activityLog: [
        ...prev.activityLog,
        {
          timestamp: new Date().toISOString(),
          developer: entry.developer,
          action: `Added Day ${entry.day} standup`,
        },
      ],
    }));
  };

  const addTaskNote = (taskId: string, note: string, developer: Developer) => {
    setState(prev => ({
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
  };

  const getTaskStatus = (taskId: string): TaskStatus => {
    return state.taskOverrides[taskId]?.status ?? 'pending';
  };

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
      const status = state.taskOverrides[task.id]?.status ?? 'pending';
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
      (state.taskOverrides[t.id]?.status ?? 'pending') === 'completed'
    ).length;

    const velocityRatio = totalEstimatedHours > 0
      ? Math.round((totalActualHours / totalEstimatedHours) * 100) / 100
      : 1;

    return {
      byDeveloper, byDay, total, completed, backlogCount,
      totalEstimatedHours, totalActualHours, totalTokensUsed, totalTokenCostCents,
      velocityRatio, byCategory,
    };
  }, [state.taskOverrides, currentDay]);

  // Group tasks by status for Kanban board
  const boardColumns = useMemo(() => {
    const backlog: string[] = [];
    const todo: string[] = [];
    const inProgress: string[] = [];
    const done: string[] = [];

    SPRINT_TASKS.forEach(task => {
      const status = state.taskOverrides[task.id]?.status ?? 'pending';
      if (status === 'completed') {
        done.push(task.id);
      } else if (status === 'in-progress') {
        inProgress.push(task.id);
      } else if (status === 'rejected') {
        // skip
      } else if (task.day < currentDay) {
        backlog.push(task.id); // overdue = backlog
      } else {
        todo.push(task.id);
      }
    });

    return { backlog, todo, inProgress, done };
  }, [state.taskOverrides, currentDay]);

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
    setState({
      taskOverrides: { ...DEFAULT_TASK_OVERRIDES },
      standups: [...DEFAULT_STANDUPS],
      activityLog: [],
      taskNotes: {},
    });
  };

  // Effort metrics — auto-computed from data-effort.ts
  const effortMetrics: EffortMetrics = useMemo(() => computeEffortMetrics(ALL_EFFORT), []);

  return {
    state,
    currentDay,
    metrics,
    effortMetrics,
    boardColumns,
    updateTaskStatus,
    addStandup,
    addTaskNote,
    getTaskStatus,
    resetToDefaults,
  };
}

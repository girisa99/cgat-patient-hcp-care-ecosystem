// Sprint Tracker — State Management Hook (localStorage persistence)
import { useState, useEffect, useMemo } from 'react';
import type { TaskStatus, Developer, SprintTrackerState, SprintMetrics, ActivityLogEntry, StandupEntry } from './types';
import { SPRINT_TASKS } from './data-tasks';
import { DEFAULT_TASK_OVERRIDES, DEFAULT_STANDUPS, calculateCurrentDay } from './data-config';

const STORAGE_KEY = 'genie_sprint_tracker_state';

export function useSprintTracker() {
  const [state, setState] = useState<SprintTrackerState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
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
    const byDeveloper: SprintMetrics['byDeveloper'] = {
      lovable: { total: 0, completed: 0, inProgress: 0, blocked: 0 },
      claude: { total: 0, completed: 0, inProgress: 0, blocked: 0 },
    };
    const byDay: Record<number, { total: number; completed: number }> = {};
    let backlogCount = 0;

    SPRINT_TASKS.forEach(task => {
      const status = state.taskOverrides[task.id]?.status ?? 'pending';
      byDeveloper[task.developer].total++;
      if (status === 'completed') byDeveloper[task.developer].completed++;
      if (status === 'in-progress') byDeveloper[task.developer].inProgress++;

      if (!byDay[task.day]) byDay[task.day] = { total: 0, completed: 0 };
      byDay[task.day].total++;
      if (status === 'completed') byDay[task.day].completed++;

      // Backlog: tasks from previous days that aren't completed
      if (task.day < currentDay && status !== 'completed' && status !== 'rejected') {
        backlogCount++;
      }
    });

    const total = SPRINT_TASKS.length;
    const completed = SPRINT_TASKS.filter(t =>
      (state.taskOverrides[t.id]?.status ?? 'pending') === 'completed'
    ).length;

    return { byDeveloper, byDay, total, completed, backlogCount };
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

  return {
    state,
    currentDay,
    metrics,
    boardColumns,
    updateTaskStatus,
    addStandup,
    addTaskNote,
    getTaskStatus,
  };
}

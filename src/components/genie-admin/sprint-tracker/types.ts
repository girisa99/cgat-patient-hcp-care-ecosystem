// Sprint Tracker — Shared Types

export type Developer = 'lovable' | 'claude';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'rejected';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface SprintTask {
  id: string;
  title: string;
  developer: Developer;
  day: number;
  priority: TaskPriority;
  module: string;
  filesInvolved: string[];
  acceptanceCriteria: string;
  estimatedHours: number;
  notes?: string;
}

export interface StandupEntry {
  day: number;
  developer: Developer;
  yesterday: string;
  today: string;
  blockers: string;
  createdAt: string;
}

export interface DiagnosisFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  line?: number;
  issue: string;
  rootCause: string;
  status: 'fixed' | 'open' | 'deferred';
  fixedIn?: string;
}

export interface TaskFindings {
  summary: string;
  totalIssues: number;
  issuesBySeverity: { critical: number; high: number; medium: number; low: number };
  findings: DiagnosisFinding[];
  dayTwoImpact: string;
}

export interface TaskOverride {
  status: TaskStatus;
  updatedAt: string;
  note?: string;
}

export interface ActivityLogEntry {
  timestamp: string;
  developer: Developer;
  action: string;
  taskId?: string;
  details?: string;
}

export interface SprintTrackerState {
  taskOverrides: Record<string, TaskOverride>;
  standups: StandupEntry[];
  activityLog: ActivityLogEntry[];
  taskNotes: Record<string, string[]>; // taskId -> discussion notes
}

export interface SprintDay {
  day: number;
  theme: string;
}

export interface SprintMetrics {
  byDeveloper: Record<Developer, { total: number; completed: number; inProgress: number; blocked: number }>;
  byDay: Record<number, { total: number; completed: number }>;
  total: number;
  completed: number;
  backlogCount: number;
}

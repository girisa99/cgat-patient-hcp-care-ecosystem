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

// ── Cross-Functional Dependency Tracking ──

export type HandoffDirection = 'claude-to-lovable' | 'lovable-to-claude' | 'bidirectional';
export type HandoffStatus = 'pending' | 'ready' | 'acknowledged' | 'blocked';

export interface Handoff {
  id: string;
  title: string;
  from: Developer;
  to: Developer;
  direction: HandoffDirection;
  day: number;
  /** The task that produces the handoff */
  producerTaskId: string;
  /** The task that consumes the handoff */
  consumerTaskId: string;
  /** What exactly is being handed off */
  artifact: string;
  /** What the consumer needs to know */
  consumerNotes: string;
  /** Current status */
  status: HandoffStatus;
  /** Has the receiving dev acknowledged? */
  acknowledgedAt?: string;
  priority: 'critical' | 'high' | 'medium';
}

export interface DependencyChain {
  /** Source task */
  taskId: string;
  /** Tasks that must complete before this one can start */
  blockedBy: string[];
  /** Tasks that this one unblocks when completed */
  unblocks: string[];
}

export interface POChecklistItem {
  id: string;
  day: number;
  category: 'verify' | 'approve' | 'decide' | 'unblock';
  title: string;
  description: string;
  route?: string;
  developer: Developer | 'both';
  relatedTasks: string[];
  completed: boolean;
}

export interface DailyPlanItem {
  taskId: string;
  developer: Developer;
  canStart: boolean;
  blockedBy: string[];
  estimatedHours: number;
  notes: string;
}

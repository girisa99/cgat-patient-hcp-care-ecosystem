// Sprint Tracker — Shared Types

export type Developer = 'lovable' | 'claude';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'rejected';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

// ── Work category for velocity breakdown ──
export type WorkCategory = 'frontend' | 'backend' | 'database' | 'testing' | 'ux' | 'docs' | 'devops';

/** Compact inline effort stored directly on SprintTask (not the rich TaskEffort in data-effort.ts) */
export interface SprintTaskEffort {
  actualHours?: number;
  tokensUsed?: number;
  tokenCostCents?: number;
  workCategories: WorkCategory[];
}

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
  effort?: SprintTaskEffort;
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
  byDeveloper: Record<Developer, {
    total: number;
    completed: number;
    inProgress: number;
    blocked: number;
    estimatedHours: number;
    actualHours: number;
    tokensUsed: number;
    tokenCostCents: number;
    byCategory: Partial<Record<WorkCategory, number>>;
  }>;
  byDay: Record<number, {
    total: number;
    completed: number;
    estimatedHours: number;
    actualHours: number;
  }>;
  total: number;
  completed: number;
  backlogCount: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  totalTokensUsed: number;
  totalTokenCostCents: number;
  velocityRatio: number; // actualHours / estimatedHours
  byCategory: Partial<Record<WorkCategory, { tasks: number; estimatedHours: number; actualHours: number }>>;
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

// ── Effort Tracking — Automatic Time & Discipline Breakdown ──

/** Engineering disciplines for effort categorization */
export type Discipline =
  | 'frontend'       // React components, JSX, CSS, Tailwind
  | 'backend'        // Edge functions, API routes, server logic
  | 'ux'             // User flows, interaction design, accessibility
  | 'ui'             // Visual design, layout, styling, branding
  | 'database'       // Supabase tables, RLS, migrations, queries
  | 'devops'         // Build config, CI/CD, deployment, git
  | 'architecture'   // System design, dependency mapping, planning
  | 'testing'        // Manual testing, E2E verification, QA
  | 'documentation'  // Changelogs, standups, CSV updates, CLAUDE.md
  | 'code-review'    // Auditing, diagnosing, reading code
  | 'integration'    // Cross-module wiring, handoffs, shared hooks
  | 'debugging';     // Bug investigation, root cause analysis

/** Single effort entry for a discipline within a task */
export interface DisciplineEffort {
  discipline: Discipline;
  hours: number;
  /** What was done in this discipline */
  description: string;
  /** Files touched for this discipline */
  files?: string[];
}

/** Granular time entry with timestamps */
export interface TimeEntry {
  /** ISO timestamp when work started */
  startedAt: string;
  /** ISO timestamp when work ended */
  endedAt: string;
  /** Duration in hours (computed: endedAt - startedAt) */
  hours: number;
  developer: Developer;
  discipline: Discipline;
  description: string;
}

/** Complete effort record for a single task */
export interface TaskEffort {
  taskId: string;
  developer: Developer;
  day: number;
  /** Estimated hours from sprint plan */
  estimatedHours: number;
  /** Actual total hours (sum of discipline breakdown) */
  actualHours: number;
  /** Variance: actual - estimated (negative = under budget) */
  variance: number;
  /** Breakdown by engineering discipline */
  breakdown: DisciplineEffort[];
  /** Granular time entries (optional, for detailed tracking) */
  timeEntries?: TimeEntry[];
  /** Bugs/issues fixed as part of this task */
  issuesFixed?: string[];
  /** Files modified */
  filesModified?: string[];
  /** Number of lines changed (insertions + deletions) */
  linesChanged?: number;
  /** When the task was started */
  startedAt?: string;
  /** When the task was completed */
  completedAt?: string;
  /** Summary of what was accomplished */
  accomplishment: string;
}

/** Aggregated effort metrics for reporting */
export interface EffortMetrics {
  /** Total estimated hours across all tasks */
  totalEstimated: number;
  /** Total actual hours across all completed tasks */
  totalActual: number;
  /** Overall variance (negative = under budget) */
  totalVariance: number;
  /** Accuracy ratio: actual / estimated */
  estimateAccuracy: number;
  /** Hours by discipline across all tasks */
  byDiscipline: Record<Discipline, { hours: number; percentage: number; taskCount: number }>;
  /** Hours by developer */
  byDeveloper: Record<Developer, {
    estimatedHours: number;
    actualHours: number;
    variance: number;
    completedTasks: number;
    topDisciplines: { discipline: Discipline; hours: number }[];
  }>;
  /** Hours by day */
  byDay: Record<number, {
    estimatedHours: number;
    actualHours: number;
    tasksCompleted: number;
    disciplines: Record<Discipline, number>;
  }>;
  /** Velocity: tasks completed per day */
  velocityByDay: Record<number, number>;
}

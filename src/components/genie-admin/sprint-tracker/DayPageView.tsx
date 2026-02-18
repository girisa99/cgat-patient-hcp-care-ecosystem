// Sprint Tracker — DayPageView
// One scrollable page per sprint day:
//   [1] Day standup  — Claude | Lovable side-by-side, compact read-only + add button
//   [2] Tasks        — Claude col | Lovable col, tasks grouped by status (inline, no card-in-card)
//   [3] Handoffs     — compact inline rows for this day only

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Brain, Zap, CheckCircle2, Clock, AlertTriangle, ArrowRight,
  ArrowLeftRight, Ban, Save, Plus, ChevronDown, ChevronRight,
  FileCode, XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SPRINT_TASKS } from './data-tasks';
import { HANDOFFS, DEPENDENCY_CHAINS } from './data-dependencies';
import { DAY1_FINDINGS } from './data-findings';
import type { Developer, TaskStatus, StandupEntry, HandoffStatus } from './types';

// ─── Dev config ───────────────────────────────────────────────────────────────

const DEV = {
  claude: {
    label: 'Claude', role: 'Tech Lead',
    Icon: Brain,
    accent: 'border-violet-400',
    headerBg: 'bg-violet-50 dark:bg-violet-950/30',
    iconCls: 'text-violet-600',
    badgeCls: 'bg-violet-100 text-violet-700 border-violet-300',
    colBg: 'bg-violet-50/30',
    colBorder: 'border-violet-200',
    taskBorder: 'border-l-violet-400',
  },
  lovable: {
    label: 'Lovable', role: 'Dev / UI',
    Icon: Zap,
    accent: 'border-pink-400',
    headerBg: 'bg-pink-50 dark:bg-pink-950/30',
    iconCls: 'text-pink-600',
    badgeCls: 'bg-pink-100 text-pink-700 border-pink-300',
    colBg: 'bg-pink-50/30',
    colBorder: 'border-pink-200',
    taskBorder: 'border-l-pink-400',
  },
} as const;

const STATUS_CFG: Record<TaskStatus, { label: string; dot: string; textCls: string }> = {
  pending:      { label: 'Todo',        dot: 'bg-muted-foreground/30', textCls: 'text-muted-foreground' },
  'in-progress':{ label: 'In Progress', dot: 'bg-blue-500',            textCls: 'text-blue-700' },
  completed:    { label: 'Done',        dot: 'bg-green-500',           textCls: 'text-green-700' },
  rejected:     { label: 'Skipped',     dot: 'bg-red-400',             textCls: 'text-red-600' },
};

const PRIORITY_BORDER: Record<string, string> = {
  critical: 'border-l-red-500',
  high:     'border-l-orange-400',
  medium:   'border-l-yellow-400',
  low:      'border-l-border',
};

const HANDOFF_STATUS: Record<HandoffStatus, { label: string; cls: string; dot: string }> = {
  pending:      { label: 'Waiting', cls: 'text-amber-700 bg-amber-50 border-amber-200', dot: 'bg-amber-400' },
  ready:        { label: 'Ready',   cls: 'text-blue-700 bg-blue-50 border-blue-200',   dot: 'bg-blue-400'  },
  acknowledged: { label: 'Done',    cls: 'text-green-700 bg-green-50 border-green-200', dot: 'bg-green-400' },
  blocked:      { label: 'Blocked', cls: 'text-red-700 bg-red-50 border-red-200',      dot: 'bg-red-500'   },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isHandoffReady(handoffId: string, getTaskStatus: (id: string) => TaskStatus): boolean {
  const h = HANDOFFS.find(x => x.id === handoffId);
  if (!h) return false;
  if (h.status === 'ready') return true;
  return getTaskStatus(h.producerTaskId) === 'completed';
}

function getUnmetDeps(taskId: string, getTaskStatus: (id: string) => TaskStatus): string[] {
  const chain = DEPENDENCY_CHAINS.find(c => c.taskId === taskId);
  if (!chain) return [];
  return chain.blockedBy.filter(depId => {
    if (depId.startsWith('H-')) return !isHandoffReady(depId, getTaskStatus);
    return getTaskStatus(depId) !== 'completed';
  });
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
      {children}
    </p>
  );
}

// ─── Inline task row (flat, no card-in-card) ─────────────────────────────────

function TaskRow({
  taskId, getTaskStatus, onStatusChange, taskOverrides,
}: {
  taskId: string;
  getTaskStatus: (id: string) => TaskStatus;
  onStatusChange: (id: string, status: TaskStatus) => void;
  taskOverrides: Record<string, { status: TaskStatus; note?: string }>;
}) {
  const [expanded, setExpanded] = useState(false);
  const task = SPRINT_TASKS.find(t => t.id === taskId);

  if (!task) return null;

  const status = getTaskStatus(taskId);
  const sc = STATUS_CFG[status];
  const isDone = status === 'completed';
  const isWIP = status === 'in-progress';
  const unmet = getUnmetDeps(taskId, getTaskStatus);
  const isGated = unmet.length > 0 && !isDone;
  const note = taskOverrides[taskId]?.note;
  const findings = DAY1_FINDINGS[taskId];

  return (
    <div className={cn(
      'border-l-4 rounded-r-lg bg-card transition-all',
      isGated ? 'border-l-amber-400 opacity-80' : PRIORITY_BORDER[task.priority],
      isDone && 'opacity-60',
    )}>
      {/* Main row */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        {/* Status dot */}
        <span className={cn('w-2 h-2 rounded-full shrink-0', sc.dot)} />

        {/* ID */}
        <span className="text-[10px] font-mono text-muted-foreground w-11 shrink-0">{task.id}</span>

        {/* Title */}
        <span className={cn(
          'flex-1 text-sm font-medium min-w-0 truncate',
          isDone && 'line-through text-muted-foreground',
        )}>
          {task.title}
        </span>

        {/* Module badge */}
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 hidden sm:flex shrink-0">
          {task.module}
        </Badge>

        {/* Hours */}
        <span className="text-[10px] text-muted-foreground shrink-0 hidden md:inline">
          {task.estimatedHours}h
        </span>

        {/* Status actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onStatusChange(task.id, isDone ? 'pending' : 'completed')}
            className={cn(
              'w-6 h-6 rounded flex items-center justify-center transition-colors border',
              isDone
                ? 'bg-green-500 border-green-600 text-white'
                : 'border-border hover:bg-green-50 hover:border-green-300 text-muted-foreground hover:text-green-600',
            )}
            title="Mark done"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onStatusChange(task.id, isWIP ? 'pending' : 'in-progress')}
            disabled={isGated}
            className={cn(
              'w-6 h-6 rounded flex items-center justify-center transition-colors border',
              isWIP
                ? 'bg-blue-500 border-blue-600 text-white'
                : 'border-border hover:bg-blue-50 hover:border-blue-300 text-muted-foreground hover:text-blue-600',
              isGated && 'opacity-40 cursor-not-allowed',
            )}
            title="Mark in progress"
          >
            <Clock className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-6 h-6 rounded flex items-center justify-center border border-border hover:bg-muted transition-colors text-muted-foreground"
            title="Details"
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Gate warning inline */}
      {isGated && (
        <div className="flex items-center gap-1.5 px-3 pb-2 text-[10px] text-amber-800">
          <Ban className="w-3 h-3 text-amber-600 shrink-0" />
          Gated by: {unmet.join(', ')}
        </div>
      )}

      {/* Override note */}
      {note && !expanded && (
        <p className="px-3 pb-2 text-[10px] text-muted-foreground italic line-clamp-1">{note}</p>
      )}

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 space-y-2 border-t border-border/30 bg-muted/10 text-xs">
          {note && (
            <p className="italic text-muted-foreground">{note}</p>
          )}
          <p><span className="font-semibold">Acceptance: </span>{task.acceptanceCriteria}</p>
          {task.notes && (
            <p className="text-amber-700"><span className="font-semibold">Note: </span>{task.notes}</p>
          )}
          {task.filesInvolved.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.filesInvolved.map(f => (
                <span key={f} className="inline-flex items-center gap-0.5 bg-muted px-1.5 py-0.5 rounded font-mono text-[9px] border border-border/50">
                  <FileCode className="w-2.5 h-2.5" />{f.split('/').pop()}
                </span>
              ))}
            </div>
          )}
          {findings && (
            <div className="space-y-1 pt-1">
              <p className="font-semibold text-muted-foreground uppercase tracking-wide text-[9px]">
                Findings ({findings.findings.length})
              </p>
              {findings.findings.slice(0, 3).map(f => (
                <div key={f.id} className="flex items-start gap-2">
                  <span className={cn(
                    'text-[9px] font-bold uppercase px-1 py-0.5 rounded shrink-0',
                    f.status === 'fixed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700',
                  )}>
                    {f.status === 'fixed' ? '✓' : '●'}
                  </span>
                  <span className="text-muted-foreground">{f.issue}</span>
                </div>
              ))}
              {findings.findings.length > 3 && (
                <p className="text-muted-foreground">+{findings.findings.length - 3} more…</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Developer column (tasks grouped by status) ───────────────────────────────

function DevColumn({
  dev, dayTasks, getTaskStatus, onStatusChange, taskOverrides,
}: {
  dev: Developer;
  dayTasks: string[];  // task IDs for this dev on this day
  getTaskStatus: (id: string) => TaskStatus;
  onStatusChange: (id: string, status: TaskStatus) => void;
  taskOverrides: Record<string, { status: TaskStatus; note?: string }>;
}) {
  const cfg = DEV[dev];
  const Icon = cfg.Icon;

  const statusOrder: TaskStatus[] = ['in-progress', 'pending', 'completed', 'rejected'];
  const grouped = statusOrder.map(s => ({
    status: s,
    ids: dayTasks.filter(id => getTaskStatus(id) === s),
  })).filter(g => g.ids.length > 0);

  const total = dayTasks.length;
  const done  = dayTasks.filter(id => getTaskStatus(id) === 'completed').length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className={cn('rounded-xl border-2 overflow-hidden flex flex-col', cfg.accent)}>
      {/* Column header */}
      <div className={cn('flex items-center gap-2.5 px-4 py-3', cfg.headerBg)}>
        <Icon className={cn('w-4 h-4 shrink-0', cfg.iconCls)} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-none">{cfg.label}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{cfg.role}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn(
            'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
            pct === 100 ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground',
          )}>
            {done}/{total}
          </span>
          {pct === 100 && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 p-3 space-y-3 bg-card">
        {dayTasks.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">No tasks this day</p>
        )}
        {grouped.map(({ status, ids }) => (
          <div key={status}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_CFG[status].dot)} />
              <span className={cn('text-[10px] font-semibold uppercase tracking-wide', STATUS_CFG[status].textCls)}>
                {STATUS_CFG[status].label}
              </span>
              <span className="text-[10px] text-muted-foreground">({ids.length})</span>
            </div>
            <div className="space-y-1.5 pl-1">
              {ids.map(id => (
                <TaskRow
                  key={id}
                  taskId={id}
                  getTaskStatus={getTaskStatus}
                  onStatusChange={onStatusChange}
                  taskOverrides={taskOverrides}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Compact standup card ─────────────────────────────────────────────────────

function StandupCard({ dev, entry }: { dev: Developer; entry?: StandupEntry }) {
  const cfg = DEV[dev];
  const Icon = cfg.Icon;

  if (!entry) {
    return (
      <div className={cn(
        'rounded-lg border-2 border-dashed px-4 py-4 flex items-center gap-2 text-xs text-muted-foreground',
        dev === 'claude' ? 'border-violet-200' : 'border-pink-200',
      )}>
        <Icon className={cn('w-4 h-4 opacity-30', cfg.iconCls)} />
        No standup logged yet
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border-2 overflow-hidden', cfg.accent)}>
      <div className={cn('flex items-center gap-2 px-3 py-2', cfg.headerBg)}>
        <Icon className={cn('w-3.5 h-3.5', cfg.iconCls)} />
        <span className="text-xs font-bold">{cfg.label}</span>
        <span className="text-[10px] text-muted-foreground ml-auto">
          {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className="px-3 py-2.5 space-y-1.5 bg-card text-xs">
        {entry.yesterday && (
          <div className="flex gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
            <span className="text-foreground leading-snug">{entry.yesterday}</span>
          </div>
        )}
        {entry.today && (
          <div className="flex gap-1.5">
            <Clock className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
            <span className="text-foreground leading-snug">{entry.today}</span>
          </div>
        )}
        {entry.blockers && entry.blockers !== 'None' && (
          <div className="flex gap-1.5 bg-amber-50 border border-amber-200 rounded px-2 py-1.5 mt-1">
            <AlertTriangle className="w-3 h-3 text-amber-600 mt-0.5 shrink-0" />
            <span className="text-amber-900 leading-snug">{entry.blockers}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Mini add-standup form ────────────────────────────────────────────────────

function AddStandupInline({ day, dev, onSave }: {
  day: number; dev: Developer; onSave: (e: Omit<StandupEntry, 'createdAt'>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [completed, setCompleted] = useState('');
  const [working, setWorking] = useState('');
  const [blockers, setBlockers] = useState('');
  const cfg = DEV[dev];
  const Icon = cfg.Icon;

  const save = () => {
    if (!completed.trim() && !working.trim()) return;
    onSave({ day, developer: dev, yesterday: completed, today: working, blockers: blockers || 'None' });
    setCompleted(''); setWorking(''); setBlockers('');
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'w-full flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed text-[11px] font-medium transition-all',
          dev === 'claude'
            ? 'border-violet-300 text-violet-600 hover:bg-violet-50'
            : 'border-pink-300 text-pink-600 hover:bg-pink-50',
        )}
      >
        <Plus className="w-3 h-3" />
        <Icon className="w-3 h-3" />
        Update {cfg.label} standup
      </button>
    );
  }

  return (
    <div className={cn('rounded-lg border-2 overflow-hidden', cfg.accent)}>
      <div className={cn('flex items-center gap-2 px-3 py-1.5', cfg.headerBg)}>
        <Icon className={cn('w-3.5 h-3.5', cfg.iconCls)} />
        <span className="text-xs font-bold">{cfg.label} — Day {day}</span>
      </div>
      <div className="px-3 py-2.5 space-y-2 bg-card">
        <Textarea value={completed} onChange={e => setCompleted(e.target.value)} rows={1} className="text-xs" placeholder="Completed…" />
        <Textarea value={working}   onChange={e => setWorking(e.target.value)}   rows={1} className="text-xs" placeholder="Working on…" />
        <Textarea value={blockers}  onChange={e => setBlockers(e.target.value)}  rows={1} className="text-xs" placeholder="Blockers (blank = none)" />
        <div className="flex gap-1.5">
          <Button size="sm" onClick={save} className="h-7 text-xs gap-1"><Save className="w-3 h-3" />Save</Button>
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)} className="h-7 text-xs">Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Day handoff row ──────────────────────────────────────────────────────────

function HandoffRow({ h, getTaskStatus }: {
  h: typeof HANDOFFS[0];
  getTaskStatus: (id: string) => TaskStatus;
}) {
  const producerDone = getTaskStatus(h.producerTaskId) === 'completed';
  const liveStatus: HandoffStatus = producerDone
    ? (h.status === 'acknowledged' ? 'acknowledged' : 'ready')
    : 'pending';
  const sc = HANDOFF_STATUS[liveStatus];
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-muted/20 transition-colors"
      >
        <span className={cn('w-2 h-2 rounded-full shrink-0', sc.dot)} />
        <span className="text-[10px] font-mono text-muted-foreground shrink-0 w-10">{h.id}</span>
        {/* Direction */}
        <span className="text-[10px] text-muted-foreground shrink-0">
          {h.direction === 'bidirectional' ? '⟷' : '→'}
        </span>
        <span className="flex-1 text-xs font-medium truncate min-w-0">{h.title}</span>
        <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0 border shrink-0', sc.cls)}>
          {sc.label}
        </Badge>
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 capitalize shrink-0">{h.priority}</Badge>
        {expanded ? <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />}
      </button>
      {expanded && (
        <div className="px-3 pb-3 pt-2 border-t border-border/40 space-y-2 text-xs bg-muted/5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground mb-0.5">Artifact</p>
            <p className="font-mono bg-muted px-2 py-1 rounded text-[10px]">{h.artifact}</p>
          </div>
          <div className={cn('px-2.5 py-2 rounded border', h.to === 'lovable' ? 'bg-pink-50 border-pink-200' : 'bg-violet-50 border-violet-200')}>
            <p className={cn('text-[9px] font-bold uppercase tracking-wide mb-0.5', h.to === 'lovable' ? 'text-pink-700' : 'text-violet-700')}>
              {h.to === 'lovable' ? '⚡ Lovable action' : '🧠 Claude action'}
            </p>
            <p className="leading-relaxed">{h.consumerNotes}</p>
          </div>
          <p className="text-muted-foreground text-[10px]">
            Producer: <code className="bg-muted px-1 rounded">{h.producerTaskId}</code>
            {' · '}Consumer: <code className="bg-muted px-1 rounded">{h.consumerTaskId}</code>
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main DayPageView ─────────────────────────────────────────────────────────

interface DayPageViewProps {
  day: number;
  theme: string;
  standups: StandupEntry[];
  onAddStandup: (entry: Omit<StandupEntry, 'createdAt'>) => void;
  getTaskStatus: (id: string) => TaskStatus;
  onStatusChange: (id: string, status: TaskStatus) => void;
  taskOverrides: Record<string, { status: TaskStatus; note?: string }>;
}

export const DayPageView: React.FC<DayPageViewProps> = ({
  day, theme, standups, onAddStandup, getTaskStatus, onStatusChange, taskOverrides,
}) => {
  const dayTasks = SPRINT_TASKS.filter(t => t.day === day);
  const claudeTasks = dayTasks.filter(t => t.developer === 'claude').map(t => t.id);
  const lovableTasks = dayTasks.filter(t => t.developer === 'lovable').map(t => t.id);
  const dayHandoffs = HANDOFFS.filter(h => h.day === day);

  const getLastStandup = (dev: Developer): StandupEntry | undefined => {
    const all = standups.filter(s => s.day === day && s.developer === dev);
    return all[all.length - 1];
  };

  const doneTasks   = dayTasks.filter(t => getTaskStatus(t.id) === 'completed').length;
  const totalTasks  = dayTasks.length;
  const readyHoffs  = dayHandoffs.filter(h => getTaskStatus(h.producerTaskId) === 'completed').length;
  const pendingHoffs= dayHandoffs.length - readyHoffs;

  return (
    <div className="space-y-8">

      {/* ── Day header ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold leading-none">Day {day}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{theme}</p>
        </div>
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <span className={cn(
            'text-xs font-semibold px-2.5 py-1 rounded-full border',
            doneTasks === totalTasks
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-muted text-muted-foreground border-border',
          )}>
            {doneTasks}/{totalTasks} tasks
          </span>
          {dayHandoffs.length > 0 && (
            <span className={cn(
              'text-xs font-semibold px-2.5 py-1 rounded-full border',
              pendingHoffs > 0
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-green-50 text-green-700 border-green-200',
            )}>
              {readyHoffs}/{dayHandoffs.length} handoffs ready
            </span>
          )}
        </div>
      </div>

      {/* ═══ 1. STANDUPS ═══════════════════════════════════════════════════ */}
      <section>
        <SectionLabel>Standups</SectionLabel>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <StandupCard dev="claude" entry={getLastStandup('claude')} />
            <AddStandupInline day={day} dev="claude" onSave={onAddStandup} />
          </div>
          <div className="space-y-2">
            <StandupCard dev="lovable" entry={getLastStandup('lovable')} />
            <AddStandupInline day={day} dev="lovable" onSave={onAddStandup} />
          </div>
        </div>
      </section>

      {/* ═══ 2. TASKS ══════════════════════════════════════════════════════ */}
      <section>
        <SectionLabel>Tasks — Claude | Lovable</SectionLabel>
        <div className="grid md:grid-cols-2 gap-4">
          <DevColumn
            dev="claude"
            dayTasks={claudeTasks}
            getTaskStatus={getTaskStatus}
            onStatusChange={onStatusChange}
            taskOverrides={taskOverrides}
          />
          <DevColumn
            dev="lovable"
            dayTasks={lovableTasks}
            getTaskStatus={getTaskStatus}
            onStatusChange={onStatusChange}
            taskOverrides={taskOverrides}
          />
        </div>
      </section>

      {/* ═══ 3. HANDOFFS ═══════════════════════════════════════════════════ */}
      {dayHandoffs.length > 0 && (
        <section>
          <SectionLabel>Handoffs this day ({dayHandoffs.length})</SectionLabel>
          <div className="space-y-1.5">
            {dayHandoffs.map(h => (
              <HandoffRow key={h.id} h={h} getTaskStatus={getTaskStatus} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

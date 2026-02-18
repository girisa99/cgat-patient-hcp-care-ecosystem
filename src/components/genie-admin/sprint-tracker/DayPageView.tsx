/**
 * DayPageView — Jira-style Sprint Board for one day
 *
 * Jira mapping:
 *   Day         = Epic / Sprint
 *   Task (L/C)  = Story / Issue
 *   Swimlane    = Assignee (Claude | Lovable)
 *   Columns     = Backlog | To Do | In Progress | Done
 *   Handoffs    = Issue Links (blocks / is blocked by)
 *   Standup     = Sprint Ceremony / Activity feed
 *   PO Gate     = Release gate / acceptance criteria
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Brain, Zap, CheckCircle2, Clock, AlertTriangle,
  ArrowRight, Ban, Save, Plus, ChevronDown, ChevronRight,
  FileCode, Link2, MessageSquare,
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
    headerBg: 'bg-violet-50 dark:bg-violet-950/30',
    iconCls: 'text-violet-600',
    rowAccent: 'border-l-violet-500',
    swimBg: 'bg-violet-50/20 dark:bg-violet-950/10',
    swimBorder: 'border-violet-200 dark:border-violet-800',
    tagCls: 'bg-violet-100 text-violet-800 border-violet-300',
  },
  lovable: {
    label: 'Lovable', role: 'Dev / UI',
    Icon: Zap,
    headerBg: 'bg-pink-50 dark:bg-pink-950/30',
    iconCls: 'text-pink-600',
    rowAccent: 'border-l-pink-500',
    swimBg: 'bg-pink-50/20 dark:bg-pink-950/10',
    swimBorder: 'border-pink-200 dark:border-pink-800',
    tagCls: 'bg-pink-100 text-pink-800 border-pink-300',
  },
} as const;

// Jira-style column definitions
const COLUMNS: { status: TaskStatus; label: string; dotCls: string; headerCls: string }[] = [
  { status: 'pending',     label: 'To Do',       dotCls: 'bg-muted-foreground/30', headerCls: 'text-muted-foreground' },
  { status: 'in-progress', label: 'In Progress',  dotCls: 'bg-blue-500',            headerCls: 'text-blue-700' },
  { status: 'completed',   label: 'Done',         dotCls: 'bg-green-500',           headerCls: 'text-green-700' },
  { status: 'rejected',    label: 'Won\'t Do',    dotCls: 'bg-red-400',             headerCls: 'text-red-600' },
];

const PRIORITY_DOT: Record<string, string> = {
  critical: 'bg-red-500',
  high:     'bg-orange-400',
  medium:   'bg-yellow-400',
  low:      'bg-muted-foreground/30',
};

const HANDOFF_STATUS_CFG: Record<HandoffStatus, { label: string; cls: string; dot: string }> = {
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

// ─── Jira Issue Card (flat row, no nesting) ───────────────────────────────────

function IssueRow({
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

  const status    = getTaskStatus(taskId);
  const isDone    = status === 'completed';
  const isWIP     = status === 'in-progress';
  const unmet     = getUnmetDeps(taskId, getTaskStatus);
  const isGated   = unmet.length > 0 && !isDone;
  const note      = taskOverrides[taskId]?.note;
  const findings  = DAY1_FINDINGS[taskId];
  const dev       = DEV[task.developer];

  return (
    <div className={cn(
      'border-l-[3px] bg-card rounded-r border border-l-0 border-border transition-all',
      isGated ? 'border-l-amber-400 opacity-85' : dev.rowAccent,
      isDone && 'opacity-55',
    )}>
      {/* Issue row */}
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Priority dot (Jira-style) */}
        <span
          title={`Priority: ${task.priority}`}
          className={cn('w-2 h-2 rounded-sm shrink-0', PRIORITY_DOT[task.priority])}
        />

        {/* Issue key (e.g. C-201) */}
        <span className="text-[10px] font-mono text-muted-foreground w-12 shrink-0 select-all">
          {task.id}
        </span>

        {/* Summary / Title */}
        <span className={cn(
          'flex-1 text-sm min-w-0 truncate',
          isDone ? 'line-through text-muted-foreground' : 'text-foreground',
        )}>
          {task.title}
        </span>

        {/* Epic label (module) */}
        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border hidden md:inline shrink-0">
          {task.module}
        </span>

        {/* Story points */}
        <span className="text-[10px] text-muted-foreground w-6 text-right shrink-0 hidden sm:inline" title="Estimated hours">
          {task.estimatedHours}h
        </span>

        {/* Status actions */}
        <div className="flex items-center gap-1 shrink-0 ml-1">
          <button
            onClick={() => onStatusChange(task.id, isDone ? 'pending' : 'completed')}
            title="Mark Done"
            className={cn(
              'w-6 h-6 rounded flex items-center justify-center border transition-colors',
              isDone
                ? 'bg-green-500 border-green-600 text-white'
                : 'border-border hover:bg-green-50 hover:border-green-400 text-muted-foreground',
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onStatusChange(task.id, isWIP ? 'pending' : 'in-progress')}
            disabled={isGated && !isWIP}
            title={isGated ? `Blocked by: ${unmet.join(', ')}` : 'Set In Progress'}
            className={cn(
              'w-6 h-6 rounded flex items-center justify-center border transition-colors',
              isWIP
                ? 'bg-blue-500 border-blue-600 text-white'
                : 'border-border hover:bg-blue-50 hover:border-blue-400 text-muted-foreground',
              isGated && !isWIP && 'opacity-35 cursor-not-allowed',
            )}
          >
            <Clock className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            title="Details"
            className="w-6 h-6 rounded flex items-center justify-center border border-border hover:bg-muted transition-colors text-muted-foreground"
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Blocker pill — inline like Jira */}
      {isGated && (
        <div className="flex items-center gap-1 px-3 pb-1.5 text-[10px] text-amber-800">
          <Ban className="w-2.5 h-2.5 text-amber-500 shrink-0" />
          <span>Blocked by: </span>
          {unmet.map(dep => (
            <span key={dep} className="font-mono bg-amber-100 border border-amber-300 px-1 rounded">{dep}</span>
          ))}
        </div>
      )}

      {/* Inline note (collapsed) */}
      {note && !expanded && (
        <p className="px-3 pb-1.5 text-[10px] text-muted-foreground italic truncate">{note}</p>
      )}

      {/* Expanded — Jira issue detail panel */}
      {expanded && (
        <div className="border-t border-border/40 bg-muted/5 px-3 py-2.5 space-y-2 text-xs">
          {note && <p className="italic text-muted-foreground">{note}</p>}

          <div>
            <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
              Acceptance Criteria
            </span>
            <p className="mt-0.5 text-foreground">{task.acceptanceCriteria}</p>
          </div>

          {task.notes && (
            <div className="flex items-start gap-1.5 px-2 py-1.5 bg-amber-50 border border-amber-200 rounded text-amber-800">
              <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
              <p>{task.notes}</p>
            </div>
          )}

          {task.filesInvolved.length > 0 && (
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                Files
              </span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {task.filesInvolved.map(f => (
                  <span key={f} className="inline-flex items-center gap-0.5 bg-muted border border-border/50 px-1.5 py-0.5 rounded font-mono text-[9px]">
                    <FileCode className="w-2.5 h-2.5" />
                    {f.split('/').pop()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {findings && findings.findings.length > 0 && (
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                Findings ({findings.findings.length})
              </span>
              <div className="mt-0.5 space-y-0.5">
                {findings.findings.slice(0, 4).map(f => (
                  <div key={f.id} className="flex items-center gap-2">
                    <span className={cn(
                      'w-1.5 h-1.5 rounded-full shrink-0',
                      f.status === 'fixed' ? 'bg-green-500' : 'bg-amber-500',
                    )} />
                    <span className="text-muted-foreground truncate">{f.issue}</span>
                    <span className={cn(
                      'text-[9px] shrink-0 ml-auto',
                      f.status === 'fixed' ? 'text-green-600' : 'text-amber-600',
                    )}>
                      {f.status}
                    </span>
                  </div>
                ))}
                {findings.findings.length > 4 && (
                  <p className="text-muted-foreground text-[10px]">+{findings.findings.length - 4} more</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Jira Swimlane row (one per developer) ────────────────────────────────────

function SwimlaneRow({
  dev, dayTaskIds, getTaskStatus, onStatusChange, taskOverrides,
}: {
  dev: Developer;
  dayTaskIds: string[];
  getTaskStatus: (id: string) => TaskStatus;
  onStatusChange: (id: string, status: TaskStatus) => void;
  taskOverrides: Record<string, { status: TaskStatus; note?: string }>;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const cfg = DEV[dev];
  const Icon = cfg.Icon;

  const done  = dayTaskIds.filter(id => getTaskStatus(id) === 'completed').length;
  const total = dayTaskIds.length;

  // Group by status for each column
  const byStatus = (s: TaskStatus) => dayTaskIds.filter(id => getTaskStatus(id) === s);

  return (
    <div className={cn('rounded-lg border', cfg.swimBorder)}>
      {/* Swimlane header — assignee row like Jira */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className={cn(
          'w-full flex items-center gap-2.5 px-3 py-2 rounded-t-lg text-left transition-colors hover:bg-muted/30',
          cfg.headerBg,
        )}
      >
        {collapsed
          ? <ChevronRight className={cn('w-3.5 h-3.5 shrink-0', cfg.iconCls)} />
          : <ChevronDown  className={cn('w-3.5 h-3.5 shrink-0', cfg.iconCls)} />
        }
        <Icon className={cn('w-3.5 h-3.5 shrink-0', cfg.iconCls)} />
        <span className="text-sm font-semibold">{cfg.label}</span>
        <span className="text-xs text-muted-foreground">({cfg.role})</span>
        <span className={cn(
          'ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border',
          cfg.tagCls,
        )}>
          {done}/{total}
        </span>
      </button>

      {!collapsed && (
        <div className={cn('rounded-b-lg', cfg.swimBg)}>
          {/* Column headers */}
          <div className="grid grid-cols-4 border-b border-border/40">
            {COLUMNS.map(col => {
              const count = byStatus(col.status).length;
              return (
                <div key={col.status} className="px-3 py-1.5 flex items-center gap-1.5">
                  <span className={cn('w-2 h-2 rounded-full shrink-0', col.dotCls)} />
                  <span className={cn('text-[10px] font-semibold uppercase tracking-wide', col.headerCls)}>
                    {col.label}
                  </span>
                  {count > 0 && (
                    <span className="text-[9px] text-muted-foreground ml-auto">({count})</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Issues in columns */}
          <div className="grid grid-cols-4 divide-x divide-border/40 min-h-[48px]">
            {COLUMNS.map(col => {
              const ids = byStatus(col.status);
              return (
                <div key={col.status} className="p-2 space-y-1.5">
                  {ids.length === 0 ? (
                    <div className="h-8 flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground/40">—</span>
                    </div>
                  ) : (
                    ids.map(id => (
                      <IssueRow
                        key={id}
                        taskId={id}
                        getTaskStatus={getTaskStatus}
                        onStatusChange={onStatusChange}
                        taskOverrides={taskOverrides}
                      />
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Standup entry (activity-feed style, like Jira comments) ─────────────────

function StandupEntry({ entry, dev }: { entry: StandupEntry; dev: Developer }) {
  const cfg = DEV[dev];
  const Icon = cfg.Icon;
  return (
    <div className="flex gap-2.5">
      {/* Avatar */}
      <div className={cn('w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 border', cfg.tagCls)}>
        <Icon className="w-3 h-3" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold">{cfg.label}</span>
          <span className="text-[10px] text-muted-foreground">
            {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="space-y-1 text-xs">
          {entry.yesterday && (
            <p><span className="text-muted-foreground">✓ Done:</span> {entry.yesterday}</p>
          )}
          {entry.today && (
            <p><span className="text-muted-foreground">→ Now:</span> {entry.today}</p>
          )}
          {entry.blockers && entry.blockers !== 'None' && (
            <p className="text-amber-700 flex gap-1 items-start">
              <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
              {entry.blockers}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Add standup inline form ──────────────────────────────────────────────────

function AddStandupForm({ day, dev, onSave }: {
  day: number; dev: Developer; onSave: (e: Omit<StandupEntry, 'createdAt'>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [completed, setCompleted] = useState('');
  const [working,   setWorking]   = useState('');
  const [blockers,  setBlockers]  = useState('');
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
          'flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded border border-dashed transition-colors',
          dev === 'claude'
            ? 'border-violet-300 text-violet-600 hover:bg-violet-50'
            : 'border-pink-300 text-pink-600 hover:bg-pink-50',
        )}
      >
        <Plus className="w-3 h-3" /><Icon className="w-3 h-3" />Add {cfg.label} update
      </button>
    );
  }

  return (
    <div className="border border-border rounded-lg p-2.5 bg-card space-y-1.5">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={cn('w-3 h-3', cfg.iconCls)} />
        <span className="text-[11px] font-semibold">{cfg.label} standup</span>
      </div>
      <Textarea value={completed} onChange={e => setCompleted(e.target.value)} rows={1} className="text-xs resize-none" placeholder="Completed…" />
      <Textarea value={working}   onChange={e => setWorking(e.target.value)}   rows={1} className="text-xs resize-none" placeholder="Working on…" />
      <Textarea value={blockers}  onChange={e => setBlockers(e.target.value)}  rows={1} className="text-xs resize-none" placeholder="Blockers (blank = none)" />
      <div className="flex gap-1.5">
        <Button size="sm" onClick={save} className="h-7 text-xs gap-1"><Save className="w-3 h-3" />Save</Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)} className="h-7 text-xs">Cancel</Button>
      </div>
    </div>
  );
}

// ─── Handoff link row (Jira-style Issue Link) ─────────────────────────────────

function HandoffLink({ h, getTaskStatus }: {
  h: typeof HANDOFFS[0];
  getTaskStatus: (id: string) => TaskStatus;
}) {
  const producerDone = getTaskStatus(h.producerTaskId) === 'completed';
  const liveStatus: HandoffStatus = producerDone
    ? (h.status === 'acknowledged' ? 'acknowledged' : 'ready')
    : h.status === 'blocked' ? 'blocked' : 'pending';
  const sc = HANDOFF_STATUS_CFG[liveStatus];

  const fromDev = DEV[h.from];
  const toDev   = DEV[h.to];

  return (
    <div className="flex items-center gap-2 py-1.5 px-2 border-b border-border/30 last:border-0 text-xs">
      {/* Status dot */}
      <span className={cn('w-2 h-2 rounded-full shrink-0', sc.dot)} />

      {/* Link key */}
      <span className="text-[10px] font-mono text-muted-foreground shrink-0 w-10">{h.id}</span>

      {/* From → To assignees */}
      <div className="flex items-center gap-1 shrink-0">
        <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded border', fromDev.tagCls)}>
          {fromDev.label}
        </span>
        <ArrowRight className="w-3 h-3 text-muted-foreground" />
        <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded border', toDev.tagCls)}>
          {toDev.label}
        </span>
      </div>

      {/* Title */}
      <span className="flex-1 min-w-0 truncate text-foreground">{h.title}</span>

      {/* Status badge */}
      <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded border shrink-0', sc.cls)}>
        {sc.label}
      </span>

      {/* Priority */}
      <span className="text-[9px] text-muted-foreground capitalize shrink-0 hidden sm:inline">
        {h.priority}
      </span>
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
  const dayTasks     = SPRINT_TASKS.filter(t => t.day === day);
  const claudeIds    = dayTasks.filter(t => t.developer === 'claude').map(t => t.id);
  const lovableIds   = dayTasks.filter(t => t.developer === 'lovable').map(t => t.id);
  const dayHandoffs  = HANDOFFS.filter(h => h.day === day);
  const dayStandups  = standups.filter(s => s.day === day);

  const doneTasks    = dayTasks.filter(t => getTaskStatus(t.id) === 'completed').length;
  const readyHoffs   = dayHandoffs.filter(h => getTaskStatus(h.producerTaskId) === 'completed').length;

  // Latest standup per dev
  const claudeSD  = [...dayStandups].filter(s => s.developer === 'claude').pop();
  const lovableSD = [...dayStandups].filter(s => s.developer === 'lovable').pop();

  return (
    <div className="space-y-6">

      {/* ── Epic header ────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          {/* Jira Epic label */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/30 bg-primary/5 px-2 py-0.5 rounded">
              Epic · Day {day}
            </span>
            <span className="text-[10px] text-muted-foreground">Feb {16 + day}, 2026</span>
          </div>
          <h2 className="text-base font-bold leading-none">{theme}</h2>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={cn(
            'px-2 py-1 rounded-full border font-semibold',
            doneTasks === dayTasks.length
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-muted text-muted-foreground border-border',
          )}>
            {doneTasks}/{dayTasks.length} done
          </span>
          {dayHandoffs.length > 0 && (
            <span className={cn(
              'px-2 py-1 rounded-full border font-semibold',
              readyHoffs === dayHandoffs.length
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-amber-50 text-amber-700 border-amber-200',
            )}>
              {readyHoffs}/{dayHandoffs.length} handoffs
            </span>
          )}
        </div>
      </div>

      {/* ═══ 1. SPRINT BOARD — Swimlanes ════════════════════════════════════ */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Sprint Board
          </span>
          <Separator className="flex-1" />
          <span className="text-[10px] text-muted-foreground">Assignee swimlanes · 4 columns</span>
        </div>

        <div className="space-y-3">
          {claudeIds.length > 0 && (
            <SwimlaneRow
              dev="claude"
              dayTaskIds={claudeIds}
              getTaskStatus={getTaskStatus}
              onStatusChange={onStatusChange}
              taskOverrides={taskOverrides}
            />
          )}
          {lovableIds.length > 0 && (
            <SwimlaneRow
              dev="lovable"
              dayTaskIds={lovableIds}
              getTaskStatus={getTaskStatus}
              onStatusChange={onStatusChange}
              taskOverrides={taskOverrides}
            />
          )}
        </div>
      </section>

      {/* ═══ 2. STANDUP — Sprint Ceremony / Activity ═════════════════════════ */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Daily Standup
          </span>
          <Separator className="flex-1" />
          <div className="flex gap-2">
            <AddStandupForm day={day} dev="claude"  onSave={onAddStandup} />
            <AddStandupForm day={day} dev="lovable" onSave={onAddStandup} />
          </div>
        </div>

        {claudeSD || lovableSD ? (
          <div className="space-y-3 pl-1">
            {claudeSD  && <StandupEntry entry={claudeSD}  dev="claude" />}
            {lovableSD && <StandupEntry entry={lovableSD} dev="lovable" />}
            {/* Historic standups (collapsed count) */}
            {dayStandups.length > 2 && (
              <p className="text-[10px] text-muted-foreground pl-8">
                +{dayStandups.length - 2} earlier updates
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground pl-1 italic">No standups logged yet for Day {day}</p>
        )}
      </section>

      {/* ═══ 3. ISSUE LINKS — Handoffs ═══════════════════════════════════════ */}
      {dayHandoffs.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Issue Links · Handoffs
            </span>
            <Separator className="flex-1" />
            <span className="text-[10px] text-muted-foreground">{dayHandoffs.length} link{dayHandoffs.length > 1 ? 's' : ''}</span>
          </div>
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            {/* Column header */}
            <div className="grid grid-cols-[16px_40px_1fr_auto_auto] gap-2 px-2 py-1.5 bg-muted/40 border-b border-border text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
              <span />
              <span>ID</span>
              <span>Title</span>
              <span>Status</span>
              <span className="hidden sm:block">Priority</span>
            </div>
            {dayHandoffs.map(h => (
              <HandoffLink key={h.id} h={h} getTaskStatus={getTaskStatus} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

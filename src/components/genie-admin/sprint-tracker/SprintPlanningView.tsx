/**
 * SprintPlanningView — Full sprint overview: all 5 days in one screen
 *
 * Shows:
 *  - Sprint timeline with day themes and completion %
 *  - Each day's tasks split by dev (Claude | Lovable) in a compact table
 *  - PO gate checkpoints per day
 *  - Cross-day handoff dependency chain
 *  - Who is responsible for what and who is waiting on whom
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Brain, Zap, Flag, CheckCircle2, Clock, AlertTriangle,
  ArrowRight, Ban, ChevronDown, ChevronRight, GitBranch,
  ShieldCheck, Link2, Calendar, Users, Rocket, Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SPRINT_TASKS } from './data-tasks';
import { HANDOFFS, DEPENDENCY_CHAINS, PO_CHECKLISTS } from './data-dependencies';
import { SPRINT_DAYS } from './data-config';
import type { Developer, TaskStatus } from './types';

// ─── Design tokens ────────────────────────────────────────────────────────────

const DEV_CFG = {
  claude:  { label: 'Claude',  role: 'Tech Lead', Icon: Brain, tagCls: 'bg-violet-100 text-violet-800 border-violet-300', dot: 'bg-violet-500', iconCls: 'text-violet-600' },
  lovable: { label: 'Lovable', role: 'Dev / UI',  Icon: Zap,   tagCls: 'bg-pink-100 text-pink-800 border-pink-300',       dot: 'bg-pink-500',   iconCls: 'text-pink-600'   },
} as const;

const PO_CFG = {
  verify:  { label: 'Verify',  cls: 'text-blue-600',  bg: 'bg-blue-50 border-blue-200' },
  approve: { label: 'Approve', cls: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  decide:  { label: 'Decide',  cls: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  unblock: { label: 'Unblock', cls: 'text-red-600',   bg: 'bg-red-50 border-red-200' },
} as const;

const PRIORITY_DOT: Record<string, string> = {
  critical: 'bg-red-500', high: 'bg-orange-400', medium: 'bg-yellow-400', low: 'bg-muted-foreground/30',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isHandoffReady(hid: string, getStatus: (id: string) => TaskStatus): boolean {
  const h = HANDOFFS.find(x => x.id === hid);
  if (!h) return false;
  if (h.status === 'ready' || h.status === 'acknowledged') return true;
  return getStatus(h.producerTaskId) === 'completed';
}

function getUnmetDeps(taskId: string, getStatus: (id: string) => TaskStatus): string[] {
  const chain = DEPENDENCY_CHAINS.find(c => c.taskId === taskId);
  if (!chain) return [];
  return chain.blockedBy.filter(dep =>
    dep.startsWith('H-') ? !isHandoffReady(dep, getStatus) : getStatus(dep) !== 'completed',
  );
}

const PO_STORAGE_KEY = 'genie_sprint_po_checklist';

// ─── Day Column ───────────────────────────────────────────────────────────────

function DayColumn({
  day, theme, getTaskStatus, currentDay,
}: {
  day: number;
  theme: string;
  getTaskStatus: (id: string) => TaskStatus;
  currentDay: number;
}) {
  const [open, setOpen] = useState(day <= currentDay);

  const [poChecked] = useState<Record<string, boolean>>(() => {
    try { const s = localStorage.getItem(PO_STORAGE_KEY); return s ? JSON.parse(s) : {}; }
    catch { return {}; }
  });

  const dayTasks = SPRINT_TASKS.filter(t => t.day === day);
  const dayHandoffs = HANDOFFS.filter(h => h.day === day);
  const dayPO = PO_CHECKLISTS.filter(i => i.day === day);

  const completed = dayTasks.filter(t => getTaskStatus(t.id) === 'completed').length;
  const total = dayTasks.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const isToday = day === currentDay;
  const isPast  = day < currentDay;
  const isFuture = day > currentDay;

  const poComplete = dayPO.filter(i => poChecked[i.id]).length;
  const poCritical = dayPO.filter(i => i.category === 'unblock' || i.category === 'approve').length;
  const poCriticalDone = dayPO.filter(i => (i.category === 'unblock' || i.category === 'approve') && poChecked[i.id]).length;

  const claudeTasks = dayTasks.filter(t => t.developer === 'claude');
  const lovableTasks = dayTasks.filter(t => t.developer === 'lovable');

  return (
    <div className={cn(
      'rounded-lg border flex flex-col',
      isToday ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border/60',
      isPast ? 'bg-muted/10' : isFuture ? 'bg-muted/5' : 'bg-card',
    )}>
      {/* Day header */}
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-2 px-3 py-2.5 rounded-t-lg w-full text-left transition-colors hover:bg-muted/20 border-b border-border/40',
          isToday ? 'bg-primary/5' : isPast ? 'bg-muted/20' : 'bg-muted/10',
        )}
      >
        {/* Day badge */}
        <span className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
          isPast    ? 'bg-green-500 text-white' :
          isToday   ? 'bg-primary text-primary-foreground' :
                      'bg-muted-foreground/20 text-muted-foreground',
        )}>
          {isPast ? '✓' : day}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {isToday && <span className="text-[8px] font-bold uppercase text-primary px-1 py-0.5 rounded bg-primary/10">Today</span>}
            <p className="text-xs font-semibold truncate">Day {day}</p>
          </div>
          <p className="text-[10px] text-muted-foreground truncate">{theme}</p>
        </div>

        {/* Progress */}
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <span className={cn(
            'text-[10px] font-bold',
            pct === 100 ? 'text-green-600' : isToday ? 'text-primary' : 'text-muted-foreground',
          )}>{pct}%</span>
          <span className="text-[9px] text-muted-foreground">{completed}/{total}</span>
        </div>

        {open ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
      </button>

      {/* Progress bar */}
      <Progress value={pct} className={cn('h-1 rounded-none', isPast ? '[&>div]:bg-green-500' : isToday ? '' : '[&>div]:bg-muted-foreground/40')} />

      {open && (
        <div className="p-2.5 space-y-2.5">

          {/* PO Gate summary */}
          <div className={cn('rounded border p-2', poCriticalDone === poCritical ? 'bg-green-50 border-green-200' : 'bg-emerald-50/50 border-emerald-200')}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Flag className="w-3 h-3 text-emerald-700 shrink-0" />
              <span className="text-[9px] font-bold uppercase tracking-wide text-emerald-800">PO Gate</span>
              <span className="ml-auto text-[9px] font-semibold text-emerald-700">{poComplete}/{dayPO.length}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {(['verify', 'approve', 'decide', 'unblock'] as const).map(cat => {
                const items = dayPO.filter(i => i.category === cat);
                if (items.length === 0) return null;
                const doneCnt = items.filter(i => poChecked[i.id]).length;
                const cfg = PO_CFG[cat];
                return (
                  <span key={cat} className={cn('text-[8px] font-semibold px-1.5 py-0.5 rounded border', cfg.cls, cfg.bg)}>
                    {cat} {doneCnt}/{items.length}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Tasks by developer */}
          {([['claude', claudeTasks], ['lovable', lovableTasks]] as [Developer, typeof claudeTasks][]).map(([dev, tasks]) => {
            if (tasks.length === 0) return null;
            const cfg = DEV_CFG[dev];
            const Icon = cfg.Icon;
            const devDone = tasks.filter(t => getTaskStatus(t.id) === 'completed').length;
            return (
              <div key={dev} className="space-y-1">
                {/* Dev header */}
                <div className="flex items-center gap-1.5">
                  <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
                  <Icon className={cn('w-3 h-3 shrink-0', cfg.iconCls)} />
                  <span className={cn('text-[9px] font-bold uppercase tracking-wide', cfg.iconCls)}>{cfg.label}</span>
                  <span className="text-[9px] text-muted-foreground ml-auto">{devDone}/{tasks.length}</span>
                </div>
                {/* Task rows */}
                <div className="space-y-0.5 pl-3">
                  {tasks.map(task => {
                    const status = getTaskStatus(task.id);
                    const isDone = status === 'completed';
                    const isWIP  = status === 'in-progress';
                    const unmet  = getUnmetDeps(task.id, getTaskStatus);
                    const isGated = unmet.length > 0 && !isDone && !isWIP;

                    return (
                      <div key={task.id} className={cn(
                        'flex items-center gap-1.5 text-[9px] px-1.5 py-1 rounded border-l-2',
                        isDone  ? 'border-l-green-400 bg-green-50/30 text-muted-foreground' :
                        isWIP   ? 'border-l-blue-400 bg-blue-50/30' :
                        isGated ? 'border-l-amber-400 bg-amber-50/30' :
                                  'border-l-border/40',
                      )}>
                        <span className={cn('w-1 h-1 rounded-full shrink-0', PRIORITY_DOT[task.priority])} />
                        <span className="font-mono text-muted-foreground w-9 shrink-0">{task.id}</span>
                        <span className={cn('flex-1 min-w-0 truncate', isDone && 'line-through')}>{task.title}</span>
                        {isDone  && <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />}
                        {isWIP   && <Clock className="w-3 h-3 text-blue-500 shrink-0" />}
                        {isGated && <Ban className="w-3 h-3 text-amber-500 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Handoffs for this day */}
          {dayHandoffs.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Link2 className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">Handoffs</span>
              </div>
              <div className="space-y-0.5 pl-3">
                {dayHandoffs.map(h => {
                  const rdy = isHandoffReady(h.id, getTaskStatus);
                  const fromCfg = DEV_CFG[h.from];
                  const toCfg = DEV_CFG[h.to];
                  return (
                    <div key={h.id} className="flex items-center gap-1 text-[9px]">
                      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', rdy ? 'bg-green-500' : 'bg-amber-400')} />
                      <span className="font-mono text-muted-foreground w-10 shrink-0">{h.id}</span>
                      <span className={cn('font-semibold', fromCfg.iconCls)}>{fromCfg.label}</span>
                      <ArrowRight className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                      <span className={cn('font-semibold', toCfg.iconCls)}>{toCfg.label}</span>
                      <span className="flex-1 min-w-0 truncate text-muted-foreground ml-1">{h.title}</span>
                      <span className={cn('text-[8px] font-semibold px-1 rounded border',
                        rdy ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      )}>{rdy ? '✓' : '⏳'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

// ─── Dependency Chain Viz ─────────────────────────────────────────────────────

function DependencyFlow({ getTaskStatus }: { getTaskStatus: (id: string) => TaskStatus }) {
  const [open, setOpen] = useState(false);

  // Key cross-day chains to visualize
  const keyChains = [
    { from: 'C-101', to: 'C-201', label: 'Day 1 diagnosis → Day 2 Deck fix' },
    { from: 'C-203', to: 'H-201', label: 'Deck complete → Lovable links it' },
    { from: 'C-304', to: 'H-301', label: 'Spark complete → Landing demos' },
    { from: 'C-404', to: 'H-401', label: 'Mind complete → Landing showcases' },
    { from: 'C-504', to: 'H-501', label: 'Claude merges → Lovable rebases' },
  ];

  return (
    <div className="rounded-lg border border-border/60 bg-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-2.5 bg-muted/20 hover:bg-muted/30 transition-colors text-left border-b border-border/40"
      >
        <GitBranch className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs font-bold uppercase tracking-widest text-foreground">Cross-Day Dependency Chain</span>
        <span className="text-[10px] text-muted-foreground ml-1">— What unlocks what across the sprint</span>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-auto" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />}
      </button>
      {open && (
        <div className="p-3 space-y-1.5">
          {keyChains.map((chain, i) => {
            const fromStatus = getTaskStatus(chain.from);
            const isDone = fromStatus === 'completed';
            return (
              <div key={i} className="flex items-center gap-2 text-[10px]">
                <span className={cn('font-mono font-semibold px-1.5 py-0.5 rounded border',
                  isDone ? 'bg-green-50 text-green-700 border-green-200' : 'bg-muted text-muted-foreground border-border'
                )}>{chain.from}</span>
                <ArrowRight className={cn('w-3 h-3 shrink-0', isDone ? 'text-green-500' : 'text-muted-foreground/40')} />
                <span className="font-mono font-semibold text-muted-foreground px-1.5 py-0.5 rounded border border-border/40 bg-muted/30">{chain.to}</span>
                <span className="text-muted-foreground truncate flex-1">{chain.label}</span>
                {isDone
                  ? <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                  : <Clock className="w-3 h-3 text-muted-foreground/40 shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Responsibility Matrix ────────────────────────────────────────────────────

function ResponsibilityMatrix({ getTaskStatus }: { getTaskStatus: (id: string) => TaskStatus }) {
  const days = [1, 2, 3, 4, 5];
  const [poChecked] = useState<Record<string, boolean>>(() => {
    try { const s = localStorage.getItem(PO_STORAGE_KEY); return s ? JSON.parse(s) : {}; }
    catch { return {}; }
  });

  return (
    <div className="rounded-lg border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/20 border-b border-border/40">
        <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs font-bold uppercase tracking-widest text-foreground">Responsibility Matrix</span>
        <span className="text-[10px] text-muted-foreground ml-1">— Who owns what per day</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-border/40 bg-muted/10">
              <th className="text-left px-3 py-1.5 text-muted-foreground font-semibold uppercase tracking-wide w-24">Role</th>
              {days.map(d => (
                <th key={d} className="text-center px-2 py-1.5 text-muted-foreground font-semibold uppercase tracking-wide">
                  Day {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* PO/SM row */}
            <tr className="border-b border-border/30">
              <td className="px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <Flag className="w-3 h-3 text-emerald-600" />
                  <span className="font-semibold text-emerald-700">PO/SM</span>
                </div>
              </td>
              {days.map(d => {
                 const items = PO_CHECKLISTS.filter(i => i.day === d);
                 const done = items.filter(i => poChecked[i.id]).length;
                const allDone = done === items.length;
                return (
                  <td key={d} className="px-2 py-2 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      {allDone
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        : <span className="text-[9px] font-semibold text-emerald-700">{done}/{items.length}</span>}
                      <span className="text-[8px] text-muted-foreground">gate items</span>
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Claude row */}
            <tr className="border-b border-border/30">
              <td className="px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <Brain className="w-3 h-3 text-violet-600" />
                  <span className="font-semibold text-violet-700">Claude</span>
                </div>
              </td>
              {days.map(d => {
                const tasks = SPRINT_TASKS.filter(t => t.developer === 'claude' && t.day === d);
                const done = tasks.filter(t => getTaskStatus(t.id) === 'completed').length;
                const wip = tasks.filter(t => getTaskStatus(t.id) === 'in-progress').length;
                const allDone = done === tasks.length && tasks.length > 0;
                return (
                  <td key={d} className="px-2 py-2 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      {allDone
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        : wip > 0
                        ? <Clock className="w-3.5 h-3.5 text-blue-500" />
                        : <span className="text-[9px] font-semibold text-violet-700">{done}/{tasks.length}</span>}
                      <span className="text-[8px] text-muted-foreground">tasks</span>
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Lovable row */}
            <tr>
              <td className="px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-pink-600" />
                  <span className="font-semibold text-pink-700">Lovable</span>
                </div>
              </td>
              {days.map(d => {
                const tasks = SPRINT_TASKS.filter(t => t.developer === 'lovable' && t.day === d);
                const done = tasks.filter(t => getTaskStatus(t.id) === 'completed').length;
                const wip = tasks.filter(t => getTaskStatus(t.id) === 'in-progress').length;
                const allDone = done === tasks.length && tasks.length > 0;
                return (
                  <td key={d} className="px-2 py-2 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      {allDone
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        : wip > 0
                        ? <Clock className="w-3.5 h-3.5 text-blue-500" />
                        : <span className="text-[9px] font-semibold text-pink-700">{done}/{tasks.length}</span>}
                      <span className="text-[8px] text-muted-foreground">tasks</span>
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface SprintPlanningViewProps {
  getTaskStatus: (id: string) => TaskStatus;
  currentDay: number;
  onNavigateToDay: (day: number) => void;
}

export const SprintPlanningView: React.FC<SprintPlanningViewProps> = ({
  getTaskStatus, currentDay, onNavigateToDay,
}) => {
  const totalTasks = SPRINT_TASKS.length;
  const completedTasks = SPRINT_TASKS.filter(t => getTaskStatus(t.id) === 'completed').length;
  const overallPct = Math.round((completedTasks / totalTasks) * 100);

  const totalHandoffs = HANDOFFS.length;
  const readyHandoffs = HANDOFFS.filter(h => isHandoffReady(h.id, getTaskStatus)).length;

  const [poChecked] = useState<Record<string, boolean>>(() => {
    try { const s = localStorage.getItem(PO_STORAGE_KEY); return s ? JSON.parse(s) : {}; }
    catch { return {}; }
  });
  const totalPO = PO_CHECKLISTS.length;
  const donePO = PO_CHECKLISTS.filter(i => poChecked[i.id]).length;

  return (
    <div className="space-y-5">

      {/* ── Sprint header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-primary border border-primary/30 bg-primary/5 px-2 py-0.5 rounded">
              Sprint Plan · Feb 17–21, 2026
            </span>
          </div>
          <h2 className="text-base font-bold">GenieSuite 5-Day Sprint — Project Plan</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            📋 This is the live version of <span className="font-mono font-semibold">GENIESUITE_PROJECT_PLAN.csv</span> — all 41 tasks, all days, all assignees, all dependencies
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs flex-wrap">
          {/* Sprint health pills */}
          <div className="flex flex-col items-center px-3 py-1.5 rounded-lg border border-border bg-card gap-0.5">
            <span className="font-bold text-sm text-foreground">{overallPct}%</span>
            <span className="text-[9px] text-muted-foreground">Overall</span>
          </div>
          <div className="flex flex-col items-center px-3 py-1.5 rounded-lg border border-border bg-card gap-0.5">
            <span className="font-bold text-sm text-green-600">{completedTasks}/{totalTasks}</span>
            <span className="text-[9px] text-muted-foreground">Tasks done</span>
          </div>
          <div className="flex flex-col items-center px-3 py-1.5 rounded-lg border border-border bg-card gap-0.5">
            <span className="font-bold text-sm text-blue-600">{readyHandoffs}/{totalHandoffs}</span>
            <span className="text-[9px] text-muted-foreground">Handoffs</span>
          </div>
          <div className="flex flex-col items-center px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 gap-0.5">
            <span className="font-bold text-sm text-emerald-700">{donePO}/{totalPO}</span>
            <span className="text-[9px] text-emerald-600">PO gates</span>
          </div>
        </div>
      </div>

      {/* Sprint progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Sprint progress</span>
          <span className="font-semibold">{overallPct}% complete</span>
        </div>
        <Progress value={overallPct} className="h-2" />
        <div className="flex justify-between text-[9px] text-muted-foreground">
          <span>Day 1 · Foundation</span>
          <span>Day 3 · Spark</span>
          <span>Day 5 · Integration</span>
        </div>
      </div>

      {/* ── Responsibility Matrix ─────────────────────────────────────────── */}
      <ResponsibilityMatrix getTaskStatus={getTaskStatus} />

      {/* ── Role legend ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 text-[10px]">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50">
          <Flag className="w-3 h-3 text-emerald-700" />
          <div>
            <p className="font-bold text-emerald-800">PO / SM — Product Owner / Scrum Master</p>
            <p className="text-emerald-700">Verifies, approves, decides, and unblocks. Must clear gates for each day to proceed.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-violet-200 bg-violet-50">
          <Brain className="w-3 h-3 text-violet-700" />
          <div>
            <p className="font-bold text-violet-800">Claude — Tech Lead</p>
            <p className="text-violet-700">Owns: GenieDeck, GenieSpark, GenieMind, navigation, admin. Merges to main first on Day 5.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-pink-200 bg-pink-50">
          <Zap className="w-3 h-3 text-pink-700" />
          <div>
            <p className="font-bold text-pink-800">Lovable — Dev / UI</p>
            <p className="text-pink-700">Owns: Landing pages, explore flows, products, legal. Rebases onto main AFTER Claude on Day 5.</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* ── Cross-day dependency chain ────────────────────────────────────── */}
      <DependencyFlow getTaskStatus={getTaskStatus} />

      <Separator />

      {/* ── All 5 day columns ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sprint Timeline — All Days</span>
          <Separator className="flex-1" />
          <span className="text-[9px] text-muted-foreground">Click a day to expand</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {SPRINT_DAYS.map(({ day, theme }) => (
            <div key={day} className="relative">
              <DayColumn
                day={day}
                theme={theme}
                getTaskStatus={getTaskStatus}
                currentDay={currentDay}
              />
              <button
                onClick={() => onNavigateToDay(day)}
                className="mt-1 w-full text-[9px] text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1 py-0.5"
              >
                <Rocket className="w-2.5 h-2.5" /> Open Day {day} board
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── All handoffs overview ─────────────────────────────────────────── */}
      <div className="rounded-lg border border-border/60 bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/20 border-b border-border/40">
          <Link2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs font-bold uppercase tracking-widest text-foreground">All Handoffs — Sprint Overview</span>
          <span className="text-[10px] text-muted-foreground ml-1">Cross-functional dependencies between Claude ↔ Lovable</span>
          <div className="ml-auto flex gap-1.5">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
              {readyHandoffs} ready
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
              {totalHandoffs - readyHandoffs} pending
            </span>
          </div>
        </div>
        <div className="divide-y divide-border/30">
          {HANDOFFS.map(h => {
            const rdy = isHandoffReady(h.id, getTaskStatus);
            const fromCfg = DEV_CFG[h.from];
            const toCfg = DEV_CFG[h.to];
            return (
              <div key={h.id} className="flex items-center gap-2 px-4 py-2 text-[10px] hover:bg-muted/10 transition-colors">
                <span className={cn('w-2 h-2 rounded-full shrink-0', rdy ? 'bg-green-500' : 'bg-amber-400')} />
                <span className="font-mono text-muted-foreground w-10 shrink-0">{h.id}</span>
                <span className="text-muted-foreground shrink-0">Day {h.day}</span>
                <span className={cn('font-semibold shrink-0', fromCfg.iconCls)}>{fromCfg.label}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className={cn('font-semibold shrink-0', toCfg.iconCls)}>{toCfg.label}</span>
                <span className="flex-1 min-w-0 truncate text-foreground">{h.title}</span>
                <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded border shrink-0',
                  h.priority === 'critical' ? 'bg-red-50 text-red-700 border-red-200' :
                  h.priority === 'high'     ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                              'bg-muted text-muted-foreground border-border'
                )}>{h.priority}</span>
                <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded border shrink-0',
                  rdy ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                )}>{rdy ? '✓ ready' : '⏳ pending'}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

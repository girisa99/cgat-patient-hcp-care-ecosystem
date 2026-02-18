/**
 * PO MISSION CONTROL — Single-screen sprint command center
 *
 * Designed so the PO/SM can understand the entire sprint state in under 60 seconds.
 * Layout:
 *   Row 1: Sprint health banner (day, %, velocity, risk)
 *   Row 2: Today at a glance (Claude tasks | Lovable tasks | Blockers | Handoffs)
 *   Row 3: Daily PO actions (what YOU need to do TODAY)
 *   Row 4: Sprint timeline (all 5 days, completion per day)
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle2, AlertTriangle, Clock, ArrowRight, Flag,
  Zap, Brain, Link2, Eye, ThumbsUp, HelpCircle, KeyRound,
  TrendingUp, Calendar, Save, ChevronRight, XCircle, Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SPRINT_TASKS } from './data-tasks';
import { HANDOFFS, PO_CHECKLISTS, DEPENDENCY_CHAINS } from './data-dependencies';
import { SPRINT_DAYS } from './data-config';
import type { TaskStatus } from './types';

const STORAGE_KEY = 'genie_sprint_po_checklist';
const NOTES_KEY   = 'genie_sprint_po_notes';

// ─── Category config ─────────────────────────────────────────────────────────
const CAT_CFG = {
  verify:  { icon: Eye,        label: 'Verify',  color: 'text-blue-600',  bg: 'bg-blue-50',  border: 'border-blue-200',  badge: 'bg-blue-100 text-blue-700' },
  approve: { icon: ThumbsUp,   label: 'Approve', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700' },
  decide:  { icon: HelpCircle, label: 'Decide',  color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
  unblock: { icon: KeyRound,   label: 'Unblock', color: 'text-red-600',   bg: 'bg-red-50',   border: 'border-red-200',   badge: 'bg-red-100 text-red-700' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function handoffStatus(h: (typeof HANDOFFS)[0], getTaskStatus: (id: string) => TaskStatus) {
  if (h.status === 'acknowledged') return 'done';
  if (h.status === 'ready' || getTaskStatus(h.producerTaskId) === 'completed') return 'ready';
  return 'pending';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = 'text-foreground', icon: Icon }: {
  label: string; value: string | number; sub?: string; color?: string; icon?: React.ElementType;
}) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl border bg-card">
      {Icon && <Icon className={cn('w-4 h-4 mb-0.5', color)} />}
      <p className={cn('text-2xl font-bold leading-none', color)}>{value}</p>
      <p className="text-xs font-medium text-foreground">{label}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function DevTaskRow({ id, title, status, priority, isBlocked }: {
  id: string; title: string; status: TaskStatus; priority: string; isBlocked: boolean;
}) {
  const statusIcon =
    status === 'completed'  ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" /> :
    status === 'in-progress'? <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0 animate-pulse" /> :
    isBlocked               ? <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" /> :
                              <Circle className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />;

  return (
    <div className={cn(
      'flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors',
      status === 'completed' ? 'bg-green-50/60 text-muted-foreground' :
      isBlocked              ? 'bg-red-50/60'                          : 'bg-muted/30',
    )}>
      {statusIcon}
      <span className="font-mono text-[10px] text-muted-foreground w-10 shrink-0">{id}</span>
      <span className={cn('flex-1 font-medium truncate', status === 'completed' && 'line-through opacity-60')}>
        {title}
      </span>
      {isBlocked && <Badge className="text-[10px] bg-red-100 text-red-700 shrink-0">Blocked</Badge>}
      {priority === 'critical' && !isBlocked && status !== 'completed' &&
        <Badge className="text-[10px] bg-red-500 text-white shrink-0">Critical</Badge>}
    </div>
  );
}

function HandoffRow({ h, statusLabel }: { h: (typeof HANDOFFS)[0]; statusLabel: 'done' | 'ready' | 'pending' }) {
  const isReady  = statusLabel === 'ready';
  const isDone   = statusLabel === 'done';
  const isPending = statusLabel === 'pending';
  const fromLabel = h.from === 'claude' ? '🧠 Claude' : '⚡ Lovable';
  const toLabel   = h.to   === 'claude' ? '🧠 Claude' : '⚡ Lovable';

  return (
    <div className={cn(
      'flex items-start gap-2.5 p-2.5 rounded-lg border text-xs',
      isDone   ? 'bg-green-50/60 border-green-200' :
      isReady  ? 'bg-blue-50/60 border-blue-200'   :
                 'bg-amber-50/60 border-amber-200',
    )}>
      <div className={cn(
        'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
        isDone ? 'bg-green-500' : isReady ? 'bg-blue-500' : 'bg-amber-500',
      )} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono text-[10px] text-muted-foreground">{h.id}</span>
          <span className="font-semibold truncate">{h.title}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 text-muted-foreground">
          <span>{fromLabel}</span>
          <ArrowRight className="w-3 h-3 shrink-0" />
          <span>{toLabel}</span>
          <span className="text-[10px] opacity-60 truncate">— {h.artifact}</span>
        </div>
      </div>
      <Badge className={cn(
        'text-[10px] shrink-0',
        isDone   ? 'bg-green-100 text-green-700'  :
        isReady  ? 'bg-blue-100 text-blue-700'    :
                   'bg-amber-100 text-amber-700',
      )}>
        {isDone ? '✓ Done' : isReady ? '→ Ready' : '⏳ Pending'}
      </Badge>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface POMissionControlProps {
  currentDay: number;
  getTaskStatus: (id: string) => TaskStatus;
  onNavigateToDay: (day: number) => void;
}

export const POMissionControl: React.FC<POMissionControlProps> = ({
  currentDay, getTaskStatus, onNavigateToDay,
}) => {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : {}; }
    catch { return {}; }
  });
  const [notes, setNotes] = useState<string>(() => {
    try { const s = localStorage.getItem(NOTES_KEY + currentDay); return s || ''; }
    catch { return ''; }
  });

  const toggleCheck = (id: string) => {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const saveNote = (val: string) => {
    setNotes(val);
    localStorage.setItem(NOTES_KEY + currentDay, val);
  };

  // ── Sprint health metrics ─────────────────────────────────────────────────
  const allTasks = SPRINT_TASKS;
  const completedTasks = allTasks.filter(t => getTaskStatus(t.id) === 'completed');
  const inProgressTasks = allTasks.filter(t => getTaskStatus(t.id) === 'in-progress');
  const overallPct = Math.round((completedTasks.length / allTasks.length) * 100);

  // Expected completion based on current day
  const expectedByNow = allTasks.filter(t => t.day < currentDay).length;
  const actualDone    = completedTasks.length;
  const velocity      = expectedByNow > 0 ? Math.round((actualDone / expectedByNow) * 100) : 100;
  const velocityColor = velocity >= 90 ? 'text-green-600' : velocity >= 70 ? 'text-amber-600' : 'text-red-600';
  const velocityLabel = velocity >= 90 ? 'On Track' : velocity >= 70 ? 'At Risk' : 'Behind';

  const backlogCount = allTasks.filter(t => {
    if (t.day >= currentDay) return false;
    const s = getTaskStatus(t.id);
    return s !== 'completed' && s !== 'rejected';
  }).length;

  // ── Today's tasks split by dev ────────────────────────────────────────────
  const todayTasks = allTasks.filter(t => t.day === currentDay);
  const claudeTasks   = todayTasks.filter(t => t.developer === 'claude');
  const lovableTasks  = todayTasks.filter(t => t.developer === 'lovable');

  function isBlocked(taskId: string) {
    const chain = DEPENDENCY_CHAINS.find(c => c.taskId === taskId);
    if (!chain) return false;
    return chain.blockedBy.some(dep => {
      if (dep.startsWith('H-')) {
        const h = HANDOFFS.find(x => x.id === dep);
        return !h || (h.status !== 'ready' && h.status !== 'acknowledged' && getTaskStatus(h.producerTaskId) !== 'completed');
      }
      return getTaskStatus(dep) !== 'completed';
    });
  }

  const blockedToday = todayTasks.filter(t => isBlocked(t.id) && getTaskStatus(t.id) !== 'completed');

  // ── Handoffs for today ────────────────────────────────────────────────────
  const todayHandoffs = HANDOFFS.filter(h => h.day === currentDay);
  const pendingHandoffs = HANDOFFS.filter(h => {
    const st = handoffStatus(h, getTaskStatus);
    return st === 'pending' && h.day <= currentDay;
  });

  // ── PO checklist for today ────────────────────────────────────────────────
  const todayChecklist = PO_CHECKLISTS.filter(i => i.day === currentDay);
  const todayDone = todayChecklist.filter(i => checked[i.id]).length;
  const todayPct  = todayChecklist.length > 0 ? Math.round((todayDone / todayChecklist.length) * 100) : 0;

  // Prioritize: unblock > decide > approve > verify
  const sortedChecklist = [...todayChecklist].sort((a, b) => {
    const order = { unblock: 0, decide: 1, approve: 2, verify: 3 };
    return (order[a.category] ?? 9) - (order[b.category] ?? 9);
  });

  // ── Day timeline ─────────────────────────────────────────────────────────
  const dayPct = (day: number) => {
    const tasks = allTasks.filter(t => t.day === day);
    if (!tasks.length) return 0;
    return Math.round(tasks.filter(t => getTaskStatus(t.id) === 'completed').length / tasks.length * 100);
  };

  return (
    <div className="space-y-5">

      {/* ── HEADER BANNER ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Flag className="w-5 h-5 text-emerald-600" />
            PO Mission Control
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Sprint Day {currentDay} of 5 · {SPRINT_DAYS[currentDay - 1]?.theme}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn(
            'px-3 py-1.5 text-sm font-bold',
            velocity >= 90 ? 'bg-green-100 text-green-800 border border-green-300' :
            velocity >= 70 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                             'bg-red-100 text-red-800 border border-red-300',
          )}>
            {velocity >= 90 ? '🟢' : velocity >= 70 ? '🟡' : '🔴'} {velocityLabel}
          </Badge>
          <Badge variant="outline" className="text-sm font-bold">{overallPct}% complete</Badge>
        </div>
      </div>

      {/* ── ROW 1: HEALTH STATS ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Tasks Done" value={`${completedTasks.length}/${allTasks.length}`}
          sub="sprint total" color="text-green-600" icon={CheckCircle2} />
        <StatCard label="In Progress" value={inProgressTasks.length}
          sub="active right now" color="text-blue-600" icon={Clock} />
        <StatCard label="Velocity" value={`${velocity}%`}
          sub={velocity >= 90 ? 'On track!' : velocity >= 70 ? 'Slightly behind' : 'Needs attention'}
          color={velocityColor} icon={TrendingUp} />
        <StatCard label="Backlog" value={backlogCount}
          sub={backlogCount === 0 ? 'No overdue tasks 🎉' : 'overdue from prev days'}
          color={backlogCount > 0 ? 'text-amber-600' : 'text-green-600'} icon={AlertTriangle} />
      </div>

      {/* ── ROW 2: TODAY AT A GLANCE ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Claude today */}
        <Card>
          <CardHeader className="py-3 px-4 bg-violet-50 border-b border-violet-100">
            <CardTitle className="text-sm text-violet-800 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Claude Today
              <Badge className="ml-auto bg-violet-100 text-violet-700">
                {claudeTasks.filter(t => getTaskStatus(t.id) === 'completed').length}/{claudeTasks.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            {claudeTasks.length === 0
              ? <p className="text-xs text-muted-foreground text-center py-4">No tasks today</p>
              : claudeTasks.map(t => (
                <DevTaskRow key={t.id} id={t.id} title={t.title}
                  status={getTaskStatus(t.id)} priority={t.priority}
                  isBlocked={isBlocked(t.id) && getTaskStatus(t.id) !== 'completed'} />
              ))}
          </CardContent>
        </Card>

        {/* Lovable today */}
        <Card>
          <CardHeader className="py-3 px-4 bg-pink-50 border-b border-pink-100">
            <CardTitle className="text-sm text-pink-800 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Lovable Today
              <Badge className="ml-auto bg-pink-100 text-pink-700">
                {lovableTasks.filter(t => getTaskStatus(t.id) === 'completed').length}/{lovableTasks.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            {lovableTasks.length === 0
              ? <p className="text-xs text-muted-foreground text-center py-4">No tasks today</p>
              : lovableTasks.map(t => (
                <DevTaskRow key={t.id} id={t.id} title={t.title}
                  status={getTaskStatus(t.id)} priority={t.priority}
                  isBlocked={isBlocked(t.id) && getTaskStatus(t.id) !== 'completed'} />
              ))}
          </CardContent>
        </Card>

        {/* Blockers & Handoffs */}
        <div className="space-y-3">
          {/* Blockers */}
          <Card className={blockedToday.length > 0 ? 'border-red-200' : ''}>
            <CardHeader className={cn('py-3 px-4 border-b', blockedToday.length > 0 ? 'bg-red-50 border-red-100' : 'bg-muted/30')}>
              <CardTitle className={cn('text-sm flex items-center gap-2', blockedToday.length > 0 ? 'text-red-800' : 'text-muted-foreground')}>
                <AlertTriangle className="w-4 h-4" />
                Blockers
                <Badge className={cn('ml-auto', blockedToday.length > 0 ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground')}>
                  {blockedToday.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              {blockedToday.length === 0
                ? <p className="text-xs text-muted-foreground text-center py-3">No blockers today ✓</p>
                : blockedToday.map(t => (
                  <div key={t.id} className="flex items-center gap-2 px-2 py-1.5 rounded bg-red-50 text-xs text-red-800">
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-mono text-[10px] shrink-0">{t.id}</span>
                    <span className="truncate font-medium">{t.title}</span>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Handoffs */}
          <Card className={pendingHandoffs.length > 0 ? 'border-amber-200' : ''}>
            <CardHeader className={cn('py-3 px-4 border-b', pendingHandoffs.length > 0 ? 'bg-amber-50 border-amber-100' : 'bg-muted/30')}>
              <CardTitle className={cn('text-sm flex items-center gap-2', pendingHandoffs.length > 0 ? 'text-amber-800' : 'text-muted-foreground')}>
                <Link2 className="w-4 h-4" />
                Pending Handoffs
                <Badge className={cn('ml-auto', pendingHandoffs.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground')}>
                  {pendingHandoffs.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1.5">
              {pendingHandoffs.length === 0
                ? <p className="text-xs text-muted-foreground text-center py-3">All handoffs resolved ✓</p>
                : pendingHandoffs.slice(0, 3).map(h => (
                  <div key={h.id} className="flex items-start gap-2 px-2 py-1.5 rounded bg-amber-50 text-xs text-amber-800">
                    <span className="font-mono text-[10px] shrink-0 mt-0.5">{h.id}</span>
                    <span className="flex-1 font-medium truncate">{h.title}</span>
                  </div>
                ))}
              {pendingHandoffs.length > 3 && (
                <p className="text-[11px] text-muted-foreground text-center">+{pendingHandoffs.length - 3} more</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* ── ROW 3: YOUR ACTIONS TODAY ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Flag className="w-4 h-4 text-emerald-600" />
              Your Actions Today — Day {currentDay}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {todayDone} of {todayChecklist.length} completed · {todayPct}% done
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={todayPct} className="w-24 h-2" />
            <Badge className={cn(
              'text-xs',
              todayPct === 100 ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground',
            )}>
              {todayPct === 100 ? '✓ All done!' : `${todayPct}%`}
            </Badge>
          </div>
        </div>

        {todayChecklist.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No PO actions defined for today yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sortedChecklist.map(item => {
              const cfg = CAT_CFG[item.category];
              const Icon = cfg.icon;
              const isDone = checked[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all select-none',
                    isDone
                      ? 'bg-green-50/60 border-green-200 opacity-70'
                      : cn(cfg.bg, cfg.border, 'hover:opacity-80'),
                  )}
                >
                  <Checkbox
                    checked={isDone || false}
                    onCheckedChange={() => toggleCheck(item.id)}
                    className="mt-0.5 shrink-0"
                    onClick={e => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge className={cn('text-[10px] px-1.5 py-0 gap-1 flex items-center', cfg.badge)}>
                        <Icon className="w-2.5 h-2.5" />
                        {cfg.label}
                      </Badge>
                      {item.developer !== 'both' && (
                        <Badge className={cn('text-[10px] px-1.5 py-0',
                          item.developer === 'lovable' ? 'bg-pink-100 text-pink-700' : 'bg-violet-100 text-violet-700',
                        )}>
                          {item.developer === 'lovable' ? '⚡ Lovable' : '🧠 Claude'}
                        </Badge>
                      )}
                      {item.route && (
                        <Badge variant="outline" className="text-[10px] font-mono">{item.route}</Badge>
                      )}
                    </div>
                    <p className={cn('text-sm font-semibold mt-1', isDone && 'line-through text-muted-foreground')}>
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                  {isDone && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Separator />

      {/* ── ROW 4: TODAY'S HANDOFF DETAILS ───────────────────────────────── */}
      {todayHandoffs.length > 0 && (
        <div>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" />
            Today's Handoffs — Day {currentDay}
          </h3>
          <div className="space-y-2">
            {todayHandoffs.map(h => (
              <HandoffRow key={h.id} h={h} statusLabel={handoffStatus(h, getTaskStatus)} />
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* ── ROW 5: SPRINT TIMELINE ────────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Sprint Timeline — 5 Days
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map(day => {
            const pct   = dayPct(day);
            const tasks = allTasks.filter(t => t.day === day);
            const done  = tasks.filter(t => getTaskStatus(t.id) === 'completed').length;
            const isPast    = day < currentDay;
            const isToday   = day === currentDay;
            const isFuture  = day > currentDay;
            return (
              <button
                key={day}
                onClick={() => onNavigateToDay(day)}
                className={cn(
                  'flex flex-col gap-1.5 p-3 rounded-xl border text-left transition-all hover:shadow-sm',
                  isToday   ? 'border-primary bg-primary/5 ring-1 ring-primary/30' :
                  isPast && pct === 100 ? 'border-green-200 bg-green-50/50' :
                  isPast    ? 'border-amber-200 bg-amber-50/50' :
                              'border-border bg-card hover:bg-muted/30',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold',
                    isToday   ? 'bg-primary text-primary-foreground' :
                    isPast && pct === 100 ? 'bg-green-500 text-white' :
                    isPast    ? 'bg-amber-400 text-white' :
                                'bg-muted text-muted-foreground',
                  )}>
                    {isPast && pct === 100 ? '✓' : day}
                  </span>
                  <span className={cn(
                    'text-[11px] font-bold',
                    isToday ? 'text-primary' : isPast && pct === 100 ? 'text-green-600' : isPast ? 'text-amber-600' : 'text-muted-foreground',
                  )}>
                    {pct}%
                  </span>
                </div>
                <p className="text-[10px] font-semibold leading-tight">
                  {SPRINT_DAYS[day - 1]?.theme}
                </p>
                <Progress value={pct} className="h-1.5" />
                <p className="text-[10px] text-muted-foreground">{done}/{tasks.length} tasks</p>
                {isToday && (
                  <Badge className="text-[10px] bg-primary/10 text-primary border border-primary/20">
                    Today <ChevronRight className="w-2.5 h-2.5 inline-block" />
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* ── PO NOTES ─────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Save className="w-4 h-4" /> PO Notes — Day {currentDay}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <Textarea
            value={notes}
            onChange={e => saveNote(e.target.value)}
            placeholder={`Decisions made, feedback, blockers raised, follow-ups for Day ${currentDay}...`}
            rows={3}
            className="text-sm resize-none"
          />
          <p className="text-[11px] text-muted-foreground mt-1.5">Auto-saved to browser.</p>
        </CardContent>
      </Card>

    </div>
  );
};

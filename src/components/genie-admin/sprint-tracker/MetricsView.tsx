// Sprint Tracker — Velocity & Metrics View
// Shows: sprint completion, per-developer velocity, actual vs estimated hours,
//        token usage, work category breakdown (FE/BE/DB/Test/UX/Docs/DevOps), burndown by day
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Zap, Brain, TrendingUp, AlertTriangle, Clock, CheckCircle2,
  BarChart3, Cpu, DollarSign, Code2, Database, FlaskConical,
  Paintbrush, FileText, Server, ChevronDown, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SprintMetrics, Developer, WorkCategory } from './types';
import { SPRINT_DAYS } from './data-config';
import { SPRINT_TASKS } from './data-tasks';

interface MetricsViewProps {
  metrics: SprintMetrics;
  currentDay: number;
}

// ── Work category display config ────────────────────────────────────────────

const CAT_CFG: Record<WorkCategory, { label: string; Icon: React.ElementType; cls: string; bg: string }> = {
  frontend:  { label: 'Frontend',  Icon: Code2,       cls: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200'    },
  backend:   { label: 'Backend',   Icon: Server,      cls: 'text-violet-700',  bg: 'bg-violet-50 border-violet-200'},
  database:  { label: 'Database',  Icon: Database,    cls: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200'},
  testing:   { label: 'Testing',   Icon: FlaskConical,cls: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200'  },
  ux:        { label: 'UX/Design', Icon: Paintbrush,  cls: 'text-pink-700',    bg: 'bg-pink-50 border-pink-200'    },
  docs:      { label: 'Docs',      Icon: FileText,    cls: 'text-orange-700',  bg: 'bg-orange-50 border-orange-200'},
  devops:    { label: 'DevOps',    Icon: Cpu,         cls: 'text-slate-700',   bg: 'bg-slate-50 border-slate-200'  },
};

const ALL_CATS: WorkCategory[] = ['frontend', 'backend', 'database', 'testing', 'ux', 'docs', 'devops'];

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmt(h: number) {
  if (h === 0) return '0h';
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

function fmtTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
}

function fmtCost(cents: number) {
  if (cents === 0) return '$0.00';
  return `$${(cents / 100).toFixed(2)}`;
}

function VelocityBar({ estimated, actual, label }: { estimated: number; actual: number; label: string }) {
  const ratio = estimated > 0 ? actual / estimated : 0;
  const pct = Math.min(ratio * 100, 200); // cap display at 200%
  const isOver = ratio > 1.1;
  const isUnder = ratio < 0.8;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className={cn('font-bold text-[11px]', isOver ? 'text-amber-600' : isUnder ? 'text-blue-600' : 'text-green-600')}>
          {fmt(actual)} / {fmt(estimated)} est.
          {estimated > 0 && <span className="ml-1 opacity-70">({Math.round(ratio * 100)}%)</span>}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        {/* Estimated baseline */}
        <div className="absolute inset-y-0 left-0 w-full bg-muted-foreground/10 rounded-full" />
        {/* Actual bar */}
        <div
          className={cn('absolute inset-y-0 left-0 rounded-full transition-all',
            isOver ? 'bg-amber-400' : isUnder ? 'bg-blue-400' : 'bg-green-500')}
          style={{ width: `${Math.min(pct / 2, 100)}%` }}
        />
        {/* 100% marker */}
        <div className="absolute inset-y-0 left-1/2 w-px bg-muted-foreground/30" />
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground">
        <span>0</span>
        <span className="text-muted-foreground/60">← est →</span>
        <span>{fmt(estimated * 2)}</span>
      </div>
    </div>
  );
}

// ── Dev card ────────────────────────────────────────────────────────────────

function DevMetricCard({ dev, data, totalSprintTasks }: {
  dev: Developer;
  data: SprintMetrics['byDeveloper'][Developer];
  totalSprintTasks: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLovable = dev === 'lovable';
  const completionPct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
  const velocityRatio = data.estimatedHours > 0 ? data.actualHours / data.estimatedHours : null;
  const isOnTrack = velocityRatio === null || (velocityRatio >= 0.8 && velocityRatio <= 1.2);

  // Tasks that are completed and have actual effort logged
  const completedWithData = SPRINT_TASKS.filter(t =>
    t.developer === dev && t.effort?.actualHours !== undefined
  );

  return (
    <Card className={cn('border-2', isLovable ? 'border-pink-200' : 'border-violet-200')}>
      {/* Header */}
      <CardHeader className={cn('py-3 px-4 border-b', isLovable ? 'bg-pink-50/60 border-pink-100' : 'bg-violet-50/60 border-violet-100')}>
        <div className="flex items-center gap-2">
          {isLovable ? <Zap className="w-4 h-4 text-pink-600 shrink-0" /> : <Brain className="w-4 h-4 text-violet-600 shrink-0" />}
          <div className="flex-1">
            <p className="font-bold text-sm">{isLovable ? 'Lovable' : 'Claude Code'}</p>
            <p className="text-[11px] text-muted-foreground">{isLovable ? 'Landing & Marketing' : 'CREATE Tools'}</p>
          </div>
          <Badge className={cn('text-sm font-bold px-2.5 py-1',
            completionPct >= 80 ? 'bg-green-100 text-green-800' :
            completionPct >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800')}>
            {completionPct}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Task progress */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Tasks</span>
            <span className="font-semibold">{data.completed} done · {data.inProgress} active · {data.total - data.completed - data.inProgress} pending</span>
          </div>
          <Progress value={completionPct} className="h-2" />
        </div>

        {/* Hour breakdown */}
        <VelocityBar estimated={data.estimatedHours} actual={data.actualHours} label="Hours (actual vs estimated)" />

        {/* Token + cost row */}
        {data.tokensUsed > 0 && (
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5 p-2.5 rounded-lg bg-muted/40 border border-border/40">
              <Cpu className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">Tokens used</p>
                <p className="text-sm font-bold">{fmtTokens(data.tokensUsed)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 p-2.5 rounded-lg bg-muted/40 border border-border/40">
              <DollarSign className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">Token cost</p>
                <p className="text-sm font-bold">{fmtCost(data.tokenCostCents)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Category breakdown pills */}
        {Object.keys(data.byCategory).length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Work Breakdown</p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.entries(data.byCategory) as [WorkCategory, number][])
                .sort(([, a], [, b]) => b - a)
                .map(([cat, count]) => {
                  const cfg = CAT_CFG[cat];
                  const Icon = cfg.Icon;
                  return (
                    <span key={cat} className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold', cfg.bg, cfg.cls)}>
                      <Icon className="w-2.5 h-2.5" />
                      {cfg.label} <span className="opacity-70">×{count}</span>
                    </span>
                  );
                })}
            </div>
          </div>
        )}

        {/* Task list toggle */}
        {completedWithData.length > 0 && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-full flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            {expanded ? 'Hide' : 'Show'} completed task effort ({completedWithData.length})
          </button>
        )}
        {expanded && (
          <div className="space-y-1.5 border-t pt-3">
            {completedWithData.map(t => (
              <div key={t.id} className="flex items-center gap-2 text-[11px]">
                <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                <span className="font-mono text-muted-foreground w-10 shrink-0">{t.id}</span>
                <span className="flex-1 truncate">{t.title}</span>
                <span className="font-semibold shrink-0">{fmt(t.effort?.actualHours ?? t.estimatedHours)}</span>
                {t.effort?.tokensUsed ? (
                  <span className="text-muted-foreground shrink-0">{fmtTokens(t.effort.tokensUsed)} tok</span>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────

export const MetricsView: React.FC<MetricsViewProps> = ({ metrics, currentDay }) => {
  const overallPct = metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0;
  const expectedPct = Math.round((currentDay / 5) * 100);
  const onTrack = overallPct >= expectedPct - 10;

  // Velocity ratio label
  const vr = metrics.velocityRatio;
  const vrLabel = vr <= 0 ? 'No data yet' : vr <= 0.85 ? 'Under estimate ↓' : vr <= 1.15 ? '✓ On estimate' : 'Over estimate ↑';
  const vrColor = vr <= 0 ? 'text-muted-foreground' : vr <= 0.85 ? 'text-blue-600' : vr <= 1.15 ? 'text-green-600' : 'text-amber-600';

  return (
    <div className="space-y-6">

      {/* ── SPRINT HEADER ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Overall pct */}
        <Card className="col-span-2 md:col-span-1">
          <CardContent className="p-4 text-center space-y-1">
            <p className={cn('text-4xl font-black', onTrack ? 'text-green-600' : 'text-amber-600')}>{overallPct}%</p>
            <p className="text-xs text-muted-foreground">Sprint Completion</p>
            <div className="flex justify-center">
              {onTrack
                ? <Badge className="bg-green-100 text-green-700 text-[10px]">On Track</Badge>
                : <Badge className="bg-amber-100 text-amber-700 text-[10px]"><AlertTriangle className="w-3 h-3 mr-1" />Behind</Badge>}
            </div>
            <p className="text-[10px] text-muted-foreground">Expected {expectedPct}% by Day {currentDay}</p>
          </CardContent>
        </Card>

        {/* Hours */}
        <Card>
          <CardContent className="p-4 space-y-1">
            <Clock className="w-4 h-4 text-blue-500 mb-1" />
            <p className="text-2xl font-bold">{fmt(metrics.totalActualHours)}</p>
            <p className="text-xs text-muted-foreground">Actual hours logged</p>
            <p className="text-[10px] text-muted-foreground">{fmt(metrics.totalEstimatedHours)} estimated</p>
          </CardContent>
        </Card>

        {/* Tokens */}
        <Card>
          <CardContent className="p-4 space-y-1">
            <Cpu className="w-4 h-4 text-violet-500 mb-1" />
            <p className="text-2xl font-bold">{fmtTokens(metrics.totalTokensUsed)}</p>
            <p className="text-xs text-muted-foreground">Tokens consumed</p>
            <p className="text-[10px] text-muted-foreground">{fmtCost(metrics.totalTokenCostCents)} cost</p>
          </CardContent>
        </Card>

        {/* Velocity ratio */}
        <Card>
          <CardContent className="p-4 space-y-1">
            <TrendingUp className={cn('w-4 h-4 mb-1', vrColor)} />
            <p className={cn('text-2xl font-bold', vrColor)}>
              {metrics.totalEstimatedHours > 0 ? `${Math.round(metrics.velocityRatio * 100)}%` : '–'}
            </p>
            <p className="text-xs text-muted-foreground">Velocity ratio</p>
            <p className={cn('text-[10px] font-semibold', vrColor)}>{vrLabel}</p>
          </CardContent>
        </Card>
      </div>

      {/* ── DEVELOPER CARDS ─────────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        {(['lovable', 'claude'] as Developer[]).map(dev => (
          <DevMetricCard key={dev} dev={dev} data={metrics.byDeveloper[dev]} totalSprintTasks={metrics.total} />
        ))}
      </div>

      {/* ── WORK CATEGORY BREAKDOWN ─────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Work Category Breakdown (Sprint Total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ALL_CATS.map(cat => {
              const data = metrics.byCategory[cat];
              const cfg = CAT_CFG[cat];
              const Icon = cfg.Icon;
              if (!data) return (
                <div key={cat} className="p-3 rounded-lg border border-dashed border-border/40 opacity-40">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={cn('w-3.5 h-3.5', cfg.cls)} />
                    <span className="text-[11px] font-semibold">{cfg.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">No tasks</p>
                </div>
              );
              const pct = data.estimatedHours > 0 ? Math.round((data.actualHours / data.estimatedHours) * 100) : 0;
              return (
                <div key={cat} className={cn('p-3 rounded-lg border', cfg.bg)}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon className={cn('w-3.5 h-3.5 shrink-0', cfg.cls)} />
                    <span className={cn('text-[11px] font-bold', cfg.cls)}>{cfg.label}</span>
                    <span className="ml-auto text-[10px] font-semibold text-muted-foreground">{data.tasks} tasks</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">Hours</span>
                      <span className="font-semibold">{fmt(data.actualHours)} / {fmt(data.estimatedHours)}</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                    {pct > 0 && (
                      <p className={cn('text-[10px] font-semibold', cfg.cls)}>{pct}% complete</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── BURNDOWN BY DAY ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Daily Burndown — Tasks & Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {SPRINT_DAYS.map(sprintDay => {
            const data = metrics.byDay[sprintDay.day] ?? { total: 0, completed: 0, estimatedHours: 0, actualHours: 0 };
            const taskPct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
            const isPast = sprintDay.day < currentDay;
            const isCurrent = sprintDay.day === currentDay;
            const isFuture = sprintDay.day > currentDay;
            return (
              <div key={sprintDay.day} className={cn('space-y-2', isFuture && 'opacity-40')}>
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2">
                    <span className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                      isPast    ? 'bg-green-500 text-white' :
                      isCurrent ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' :
                                  'bg-muted text-muted-foreground',
                    )}>
                      {isPast ? '✓' : sprintDay.day}
                    </span>
                    <span className={cn('font-medium', isCurrent && 'font-bold')}>{sprintDay.theme}</span>
                    {isCurrent && <Badge className="bg-blue-100 text-blue-700 text-[10px]">Today</Badge>}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{data.completed}/{data.total} tasks ({taskPct}%)</span>
                    {data.estimatedHours > 0 && (
                      <span className={cn(
                        'font-semibold',
                        !isFuture && data.actualHours > data.estimatedHours * 1.1 ? 'text-amber-600' : 'text-foreground',
                      )}>
                        {fmt(data.actualHours)} / {fmt(data.estimatedHours)} h
                      </span>
                    )}
                  </div>
                </div>
                {/* Task progress */}
                <Progress value={taskPct} className="h-2" />
                {/* Hour bar (only for days with actual data) */}
                {data.estimatedHours > 0 && (
                  <div className="flex gap-2 items-center text-[10px] text-muted-foreground">
                    <div className="flex-1 h-1 rounded-full bg-muted relative overflow-hidden">
                      <div
                        className={cn('absolute inset-y-0 left-0 rounded-full',
                          data.actualHours > data.estimatedHours * 1.1 ? 'bg-amber-400' : 'bg-blue-400')}
                        style={{ width: `${Math.min((data.actualHours / (data.estimatedHours * 1.5)) * 100, 100)}%` }}
                      />
                    </div>
                    <span>Hours progress</span>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ── SPRINT SUMMARY TABLE ────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Sprint Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 pr-4 font-semibold">Metric</th>
                  <th className="text-right py-2 px-3 font-semibold text-violet-700">Claude</th>
                  <th className="text-right py-2 px-3 font-semibold text-pink-700">Lovable</th>
                  <th className="text-right py-2 pl-3 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {[
                  {
                    label: 'Tasks completed',
                    c: `${metrics.byDeveloper.claude.completed}/${metrics.byDeveloper.claude.total}`,
                    l: `${metrics.byDeveloper.lovable.completed}/${metrics.byDeveloper.lovable.total}`,
                    t: `${metrics.completed}/${metrics.total}`,
                  },
                  {
                    label: 'Est. hours',
                    c: fmt(metrics.byDeveloper.claude.estimatedHours),
                    l: fmt(metrics.byDeveloper.lovable.estimatedHours),
                    t: fmt(metrics.totalEstimatedHours),
                  },
                  {
                    label: 'Actual hours',
                    c: fmt(metrics.byDeveloper.claude.actualHours),
                    l: fmt(metrics.byDeveloper.lovable.actualHours),
                    t: fmt(metrics.totalActualHours),
                  },
                  {
                    label: 'Tokens used',
                    c: fmtTokens(metrics.byDeveloper.claude.tokensUsed),
                    l: fmtTokens(metrics.byDeveloper.lovable.tokensUsed),
                    t: fmtTokens(metrics.totalTokensUsed),
                  },
                  {
                    label: 'Token cost',
                    c: fmtCost(metrics.byDeveloper.claude.tokenCostCents),
                    l: fmtCost(metrics.byDeveloper.lovable.tokenCostCents),
                    t: fmtCost(metrics.totalTokenCostCents),
                  },
                ].map(row => (
                  <tr key={row.label} className="hover:bg-muted/20">
                    <td className="py-2 pr-4 text-muted-foreground">{row.label}</td>
                    <td className="py-2 px-3 text-right font-medium text-violet-800">{row.c}</td>
                    <td className="py-2 px-3 text-right font-medium text-pink-800">{row.l}</td>
                    <td className="py-2 pl-3 text-right font-bold">{row.t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {metrics.totalTokensUsed === 0 && (
            <p className="text-[11px] text-muted-foreground text-center mt-3 italic">
              Token data accumulates as tasks are completed with effort logged.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

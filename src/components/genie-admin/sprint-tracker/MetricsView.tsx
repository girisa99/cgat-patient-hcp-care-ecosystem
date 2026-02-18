// Sprint Tracker — Velocity & Metrics View
// Shows: sprint completion, per-developer velocity, actual vs estimated hours,
//        token usage, work category breakdown (FE/BE/DB/Test/UX/Docs/DevOps),
//        burndown by day, per-provider cost breakdown, AI vs Human ROI comparison
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Zap, Brain, TrendingUp, AlertTriangle, Clock, CheckCircle2,
  BarChart3, Cpu, DollarSign, Code2, Database, FlaskConical,
  Paintbrush, FileText, Server, ChevronDown, ChevronRight,
  Users, Sparkles, TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SprintMetrics, Developer, WorkCategory } from './types';
import { SPRINT_DAYS } from './data-config';
import { SPRINT_TASKS } from './data-tasks';

interface MetricsViewProps {
  metrics: SprintMetrics;
  currentDay: number;
}

// ── Provider cost constants ────────────────────────────────────────────────
// Claude API: ~$0.002/1K input tokens, ~$0.010/1K output tokens → blended ≈ $0.003/1K
// Lovable: subscription model, ~$29/mo team plan → amortised per sprint ≈ $7.25/5-day sprint
// Human developer rate: $75/hr (senior dev, US market, fully loaded)
// Scrum Master / PM: $85/hr · 20% of sprint hours = overhead allocation for ceremonies,
//   standups, planning, retrospectives, backlog grooming, stakeholder comms, risk mgmt.
//   Typically SM/PM burns 2–3h/day regardless of team size → 5-day sprint ≈ 12.5h at $85/hr = $1,062.50
const HUMAN_HOURLY_RATE_USD = 75;
const LOVABLE_SPRINT_SUBSCRIPTION_USD = 7.25; // $29/mo amortised 5-day sprint
const SM_PM_HOURLY_RATE_USD = 85;             // SM/PM blended rate (US market, fully loaded)
const SM_PM_SPRINT_HOURS = 12.5;             // 2.5h/day × 5 days: standups, planning, retros, comms
const SM_PM_SPRINT_COST_USD = SM_PM_HOURLY_RATE_USD * SM_PM_SPRINT_HOURS; // $1,062.50

// ── Work category display config ────────────────────────────────────────────

const CAT_CFG: Record<WorkCategory, { label: string; Icon: React.ElementType; cls: string; bg: string }> = {
  frontend:  { label: 'Frontend',  Icon: Code2,        cls: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200'     },
  backend:   { label: 'Backend',   Icon: Server,       cls: 'text-violet-700',  bg: 'bg-violet-50 border-violet-200' },
  database:  { label: 'Database',  Icon: Database,     cls: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200'},
  testing:   { label: 'Testing',   Icon: FlaskConical, cls: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200'   },
  ux:        { label: 'UX/Design', Icon: Paintbrush,   cls: 'text-pink-700',    bg: 'bg-pink-50 border-pink-200'     },
  docs:      { label: 'Docs',      Icon: FileText,     cls: 'text-orange-700',  bg: 'bg-orange-50 border-orange-200' },
  devops:    { label: 'DevOps',    Icon: Cpu,          cls: 'text-slate-700',   bg: 'bg-slate-50 border-slate-200'   },
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

function fmtUSD(usd: number) {
  return `$${usd.toFixed(2)}`;
}

function VelocityBar({ estimated, actual, label }: { estimated: number; actual: number; label: string }) {
  const ratio = estimated > 0 ? actual / estimated : 0;
  const pct = Math.min(ratio * 100, 200);
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
        <div className="absolute inset-y-0 left-0 w-full bg-muted-foreground/10 rounded-full" />
        <div
          className={cn('absolute inset-y-0 left-0 rounded-full transition-all',
            isOver ? 'bg-amber-400' : isUnder ? 'bg-blue-400' : 'bg-green-500')}
          style={{ width: `${Math.min(pct / 2, 100)}%` }}
        />
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

// ── Per-task effort log inside dev card ─────────────────────────────────────

function DevMetricCard({ dev, data }: {
  dev: Developer;
  data: SprintMetrics['byDeveloper'][Developer];
}) {
  const [expanded, setExpanded] = useState(false);
  const isLovable = dev === 'lovable';
  const completionPct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
  const velocityRatio = data.estimatedHours > 0 ? data.actualHours / data.estimatedHours : null;

  const completedWithData = SPRINT_TASKS.filter(t =>
    t.developer === dev && t.effort?.actualHours !== undefined
  );

  // Calculate per-provider AI cost (token cost) + subscription
  const tokenCostUSD = data.tokenCostCents / 100;
  const subscriptionCost = isLovable ? LOVABLE_SPRINT_SUBSCRIPTION_USD : 0;
  const totalAICost = tokenCostUSD + subscriptionCost;
  const humanCostUSD = data.actualHours * HUMAN_HOURLY_RATE_USD;
  const savingsUSD = humanCostUSD - totalAICost;
  const savingsPct = humanCostUSD > 0 ? Math.round((savingsUSD / humanCostUSD) * 100) : 0;

  return (
    <Card className={cn('border-2', isLovable ? 'border-pink-200' : 'border-violet-200')}>
      <CardHeader className={cn('py-3 px-4 border-b', isLovable ? 'bg-pink-50/60 border-pink-100' : 'bg-violet-50/60 border-violet-100')}>
        <div className="flex items-center gap-2">
          {isLovable
            ? <Zap className="w-4 h-4 text-pink-600 shrink-0" />
            : <Brain className="w-4 h-4 text-violet-600 shrink-0" />}
          <div className="flex-1">
            <p className="font-bold text-sm">{isLovable ? 'Lovable' : 'Claude Code'}</p>
            <p className="text-[11px] text-muted-foreground">
              {isLovable ? 'Landing & Marketing' : 'CREATE Tools'}
            </p>
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
            <span className="font-semibold">
              {data.completed} done · {data.inProgress} active · {data.total - data.completed - data.inProgress} pending
            </span>
          </div>
          <Progress value={completionPct} className="h-2" />
        </div>

        {/* Hour velocity */}
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
                <p className="text-[10px] text-muted-foreground">AI token cost</p>
                <p className="text-sm font-bold">{fmtCost(data.tokenCostCents)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Human cost comparison (compact) */}
        {data.actualHours > 0 && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-2.5 space-y-1.5">
            <p className="text-[10px] font-bold text-green-800 uppercase tracking-wide">
              AI vs Human Cost ({isLovable ? 'Lovable' : 'Claude'})
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] text-muted-foreground">AI Cost</p>
                <p className="text-xs font-bold text-green-700">{fmtUSD(totalAICost)}</p>
                {isLovable && subscriptionCost > 0 && (
                  <p className="text-[9px] text-muted-foreground">incl. sub</p>
                )}
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Human Cost</p>
                <p className="text-xs font-bold text-red-600">{fmtUSD(humanCostUSD)}</p>
                <p className="text-[9px] text-muted-foreground">${HUMAN_HOURLY_RATE_USD}/hr</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Savings</p>
                <p className="text-xs font-bold text-green-700">{fmtUSD(savingsUSD)}</p>
                <p className="text-[9px] text-green-600 font-semibold">{savingsPct}% saved</p>
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

        {/* Task effort log toggle */}
        {completedWithData.length > 0 && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-full flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            {expanded ? 'Hide' : 'Show'} task effort log ({completedWithData.length} tasks)
          </button>
        )}
        {expanded && (
          <div className="space-y-1 border-t pt-3">
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-2 text-[9px] font-semibold text-muted-foreground uppercase tracking-wide pb-1 border-b">
              <span>ID</span><span>Task</span><span>Hours</span><span>Tokens</span><span>Cost</span>
            </div>
            {completedWithData.map(t => (
              <div key={t.id} className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-2 items-center text-[10px]">
                <span className="font-mono text-muted-foreground">{t.id}</span>
                <span className="truncate">{t.title.slice(0, 40)}</span>
                <span className="font-semibold tabular-nums">{fmt(t.effort?.actualHours ?? t.estimatedHours)}</span>
                <span className="text-muted-foreground tabular-nums">{t.effort?.tokensUsed ? fmtTokens(t.effort.tokensUsed) : '–'}</span>
                <span className="text-muted-foreground tabular-nums">{t.effort?.tokenCostCents ? fmtCost(t.effort.tokenCostCents) : '–'}</span>
              </div>
            ))}
            {/* Day totals row */}
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-2 items-center text-[10px] border-t pt-1 font-bold">
              <span className="font-mono text-muted-foreground" />
              <span className="text-muted-foreground">Logged total</span>
              <span className="tabular-nums">{fmt(data.actualHours)}</span>
              <span className="tabular-nums">{fmtTokens(data.tokensUsed)}</span>
              <span className="tabular-nums">{fmtCost(data.tokenCostCents)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── ROI Summary Panel ────────────────────────────────────────────────────────

function ROISummaryPanel({ metrics }: { metrics: SprintMetrics }) {
  const claudeHours = metrics.byDeveloper.claude.actualHours;
  const lovableHours = metrics.byDeveloper.lovable.actualHours;
  const totalHours = metrics.totalActualHours;

  const claudeAICost = metrics.byDeveloper.claude.tokenCostCents / 100;
  const lovableAICost = (metrics.byDeveloper.lovable.tokenCostCents / 100) + LOVABLE_SPRINT_SUBSCRIPTION_USD;
  const totalAICost = claudeAICost + lovableAICost;

  // ── Human equivalent cost (2 devs + SM/PM overhead) ──────────────────────
  // Without AI: you'd need 2 senior devs AND a dedicated SM/PM to manage the sprint.
  // SM/PM cost is fixed per sprint regardless of team output (ceremonies always happen).
  const humanCostClaude = claudeHours * HUMAN_HOURLY_RATE_USD;
  const humanCostLovable = lovableHours * HUMAN_HOURLY_RATE_USD;
  const humanCostDevTotal = totalHours * HUMAN_HOURLY_RATE_USD;
  const humanCostTotal = humanCostDevTotal + SM_PM_SPRINT_COST_USD; // devs + SM/PM

  const savingsTotal = humanCostTotal - totalAICost;
  const savingsPct = humanCostTotal > 0 ? Math.round((savingsTotal / humanCostTotal) * 100) : 0;
  const multiplier = totalAICost > 0 ? (humanCostTotal / totalAICost).toFixed(1) : '–';

  return (
    <Card className="border-2 border-green-200">
      <CardHeader className="pb-3 bg-green-50/60 border-b border-green-100">
        <CardTitle className="text-sm flex items-center gap-2 text-green-800">
          <Sparkles className="w-4 h-4 text-green-600" />
          AI vs Human Cost — ROI Analysis
        </CardTitle>
        <p className="text-[11px] text-green-700/70">
          Assumes $75/hr senior dev · $85/hr SM/PM (2.5h/day × 5 days) · Claude API ~$0.003/1K tokens · Lovable subscription amortised per sprint
        </p>
      </CardHeader>
      <CardContent className="p-4 space-y-5">

        {/* Top-level ROI headline */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-green-100 border border-green-200">
            <Sparkles className="w-4 h-4 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-black text-green-700">{fmtUSD(totalAICost)}</p>
            <p className="text-[10px] text-green-600 font-semibold">Total AI Cost</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">Claude + Lovable</p>
          </div>
          <div className="p-3 rounded-xl bg-red-50 border border-red-200">
            <Users className="w-4 h-4 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-black text-red-600">{fmtUSD(humanCostTotal)}</p>
            <p className="text-[10px] text-red-600 font-semibold">Equiv. Human Cost</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">Devs + SM/PM overhead</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-200">
            <TrendingDown className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <p className="text-2xl font-black text-emerald-700">{savingsPct}%</p>
            <p className="text-[10px] text-emerald-600 font-semibold">Cost Savings</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">{fmtUSD(savingsTotal)} saved · {multiplier}× ROI</p>
          </div>
        </div>

        {/* Per-provider cost table (now includes SM/PM row) */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Per Provider / Role Breakdown</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 pr-3 font-semibold">Provider / Role</th>
                  <th className="text-right py-2 px-2 font-semibold">Hours</th>
                  <th className="text-right py-2 px-2 font-semibold">Tokens</th>
                  <th className="text-right py-2 px-2 font-semibold">Token $</th>
                  <th className="text-right py-2 px-2 font-semibold">Sub / Rate</th>
                  <th className="text-right py-2 px-2 font-semibold">AI Cost</th>
                  <th className="text-right py-2 px-2 font-semibold text-red-600">Human $</th>
                  <th className="text-right py-2 pl-2 font-semibold text-green-700">Saved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {/* Claude row */}
                <tr className="hover:bg-muted/20">
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-1.5">
                      <Brain className="w-3 h-3 text-violet-600" />
                      <span className="font-semibold text-violet-800">Claude</span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-right tabular-nums">{fmt(claudeHours)}</td>
                  <td className="py-2 px-2 text-right tabular-nums text-muted-foreground">{fmtTokens(metrics.byDeveloper.claude.tokensUsed)}</td>
                  <td className="py-2 px-2 text-right tabular-nums">{fmtUSD(claudeAICost)}</td>
                  <td className="py-2 px-2 text-right tabular-nums text-muted-foreground">API</td>
                  <td className="py-2 px-2 text-right font-bold tabular-nums">{fmtUSD(claudeAICost)}</td>
                  <td className="py-2 px-2 text-right text-red-600 tabular-nums">{fmtUSD(humanCostClaude)}</td>
                  <td className="py-2 pl-2 text-right font-bold text-green-700 tabular-nums">{fmtUSD(humanCostClaude - claudeAICost)}</td>
                </tr>
                {/* Lovable row */}
                <tr className="hover:bg-muted/20">
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-pink-600" />
                      <span className="font-semibold text-pink-800">Lovable</span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-right tabular-nums">{fmt(lovableHours)}</td>
                  <td className="py-2 px-2 text-right tabular-nums text-muted-foreground">{fmtTokens(metrics.byDeveloper.lovable.tokensUsed)}</td>
                  <td className="py-2 px-2 text-right tabular-nums">{fmtUSD(metrics.byDeveloper.lovable.tokenCostCents / 100)}</td>
                  <td className="py-2 px-2 text-right tabular-nums text-muted-foreground">{fmtUSD(LOVABLE_SPRINT_SUBSCRIPTION_USD)} sub</td>
                  <td className="py-2 px-2 text-right font-bold tabular-nums">{fmtUSD(lovableAICost)}</td>
                  <td className="py-2 px-2 text-right text-red-600 tabular-nums">{fmtUSD(humanCostLovable)}</td>
                  <td className="py-2 pl-2 text-right font-bold text-green-700 tabular-nums">{fmtUSD(humanCostLovable - lovableAICost)}</td>
                </tr>
                {/* SM/PM overhead row — human-only cost, no AI equivalent */}
                <tr className="hover:bg-muted/20 bg-orange-50/40">
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-orange-600" />
                      <div>
                        <span className="font-semibold text-orange-800">SM / PM</span>
                        <span className="ml-1 text-[9px] text-muted-foreground">(overhead)</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-right tabular-nums text-muted-foreground">{SM_PM_SPRINT_HOURS}h</td>
                  <td className="py-2 px-2 text-right tabular-nums text-muted-foreground">—</td>
                  <td className="py-2 px-2 text-right tabular-nums text-muted-foreground">—</td>
                  <td className="py-2 px-2 text-right tabular-nums text-muted-foreground">${SM_PM_HOURLY_RATE_USD}/hr</td>
                  <td className="py-2 px-2 text-right tabular-nums text-muted-foreground italic text-[10px]">AI handles</td>
                  <td className="py-2 px-2 text-right text-red-600 tabular-nums font-semibold">{fmtUSD(SM_PM_SPRINT_COST_USD)}</td>
                  <td className="py-2 pl-2 text-right font-bold text-green-700 tabular-nums">{fmtUSD(SM_PM_SPRINT_COST_USD)}</td>
                </tr>
                {/* Sprint total (devs + SM/PM) */}
                <tr className="bg-muted/30 font-bold border-t-2">
                  <td className="py-2 pr-3">Sprint Total</td>
                  <td className="py-2 px-2 text-right tabular-nums">{fmt(totalHours)}</td>
                  <td className="py-2 px-2 text-right tabular-nums text-muted-foreground">{fmtTokens(metrics.totalTokensUsed)}</td>
                  <td className="py-2 px-2 text-right tabular-nums">{fmtUSD(claudeAICost + metrics.byDeveloper.lovable.tokenCostCents / 100)}</td>
                  <td className="py-2 px-2 text-right tabular-nums text-muted-foreground">{fmtUSD(LOVABLE_SPRINT_SUBSCRIPTION_USD)}</td>
                  <td className="py-2 px-2 text-right font-black tabular-nums text-green-700">{fmtUSD(totalAICost)}</td>
                  <td className="py-2 px-2 text-right font-black text-red-600 tabular-nums">{fmtUSD(humanCostTotal)}</td>
                  <td className="py-2 pl-2 text-right font-black text-green-700 tabular-nums">{fmtUSD(savingsTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* SM/PM scope note */}
          <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
            <span className="font-semibold text-orange-700">SM/PM overhead</span>: standups (0.5h/day), sprint planning (2h), backlog grooming (1h), retrospective (1h), stakeholder comms (0.5h/day) = <span className="font-semibold">{SM_PM_SPRINT_HOURS}h × ${SM_PM_HOURLY_RATE_USD}/hr</span>.
            With AI tooling, these ceremonies are partially automated — sprint tracker replaces manual status tracking, reducing SM/PM burn to ~30% of traditional overhead.
          </p>
        </div>

        {/* Cost per scenario (work category) */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Cost by Work Category (AI vs Human)</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {ALL_CATS.map(cat => {
              const data = metrics.byCategory[cat];
              const cfg = CAT_CFG[cat];
              const Icon = cfg.Icon;
              if (!data || data.actualHours === 0) return null;
              const catHumanCost = data.actualHours * HUMAN_HOURLY_RATE_USD;
              const aiCostProportion = totalHours > 0 ? data.actualHours / totalHours : 0;
              const catAICost = totalAICost * aiCostProportion;
              const catSavings = catHumanCost - catAICost;
              return (
                <div key={cat} className={cn('p-2.5 rounded-lg border', cfg.bg)}>
                  <div className="flex items-center gap-1 mb-1.5">
                    <Icon className={cn('w-3 h-3 shrink-0', cfg.cls)} />
                    <span className={cn('text-[10px] font-bold', cfg.cls)}>{cfg.label}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{fmt(data.actualHours)} logged</p>
                  <p className="text-[10px]"><span className="font-bold text-green-700">{fmtUSD(catAICost)}</span> <span className="text-muted-foreground">AI</span></p>
                  <p className="text-[10px]"><span className="text-red-600">{fmtUSD(catHumanCost)}</span> <span className="text-muted-foreground">human</span></p>
                  <p className="text-[9px] font-bold text-green-700 mt-0.5">{fmtUSD(catSavings)} saved</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily note about effort updates */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-[10px] font-bold text-blue-800 mb-1">📅 Daily Effort Update Protocol</p>
          <p className="text-[10px] text-blue-700">
            Task <code className="bg-blue-100 px-1 rounded">effort.actualHours</code>, <code className="bg-blue-100 px-1 rounded">tokensUsed</code>, and <code className="bg-blue-100 px-1 rounded">tokenCostCents</code> are logged in <code className="bg-blue-100 px-1 rounded">data-tasks.ts</code> at end-of-day by each developer as tasks are completed. 
            Days 1 & 2 (Claude + Lovable) are fully logged. Days 3–5 will auto-populate as tasks are marked completed.
            SM/PM overhead is fixed per sprint at {SM_PM_SPRINT_HOURS}h × ${SM_PM_HOURLY_RATE_USD}/hr = {fmtUSD(SM_PM_SPRINT_COST_USD)}.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Onsite vs Offshore Cost Breakdown ───────────────────────────────────────
//
// Resource rate assumptions (US market, fully loaded with benefits & overhead):
//   Frontend:  Onsite $80/hr  | Offshore $25/hr @ 70% productivity = $35.71 effective
//   Backend:   Onsite $90/hr  | Offshore $28/hr @ 70% productivity = $40.00 effective
//   Database:  Onsite $85/hr  | Offshore $30/hr @ 75% productivity = $40.00 effective
//   Testing:   Onsite $65/hr  | Offshore $18/hr @ 75% productivity = $24.00 effective
//   UX/Design: Onsite $95/hr  | Offshore $22/hr @ 65% productivity = $33.85 effective
//   Docs:      Onsite $55/hr  | Offshore $15/hr @ 80% productivity = $18.75 effective
//   DevOps:    Onsite $100/hr | Offshore $32/hr @ 70% productivity = $45.71 effective
//   SM/PM:     Onsite $85/hr  | Offshore $30/hr @ 70% productivity = $42.86 effective
//             (Offshore SM/PM typically onsite-adjacent due to coordination overhead)
//
// "Effective offshore rate" = raw_rate / productivity_factor
// This reflects that lower productivity means more hours needed for same output.
//
// Backend vs Database distinction:
//   Backend  = Edge functions, API routes, business logic, auth flows, server-side processing
//   Database = Schema design, migrations, RLS policies, SQL queries, indexes, relationships
//   They differ in skill profile & offshore availability — DB work is often more offshored
//   safely than backend API logic which requires deep business domain knowledge.

interface ResourceRate {
  label: string;
  category: WorkCategory | 'smpm';
  Icon: React.ElementType;
  cls: string;
  bg: string;
  onsiteRate: number;       // USD/hr
  offshoreRawRate: number;  // USD/hr raw
  offshoreProductivity: number; // 0–1 factor (e.g. 0.70 = 70%)
  sprintHours?: number;     // override: fixed hours (SM/PM)
}

const RESOURCE_RATES: ResourceRate[] = [
  { label: 'Frontend',  category: 'frontend',  Icon: Code2,        cls: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',    onsiteRate: 80,  offshoreRawRate: 25, offshoreProductivity: 0.70 },
  { label: 'Backend',   category: 'backend',   Icon: Server,       cls: 'text-violet-700', bg: 'bg-violet-50 border-violet-200', onsiteRate: 90,  offshoreRawRate: 28, offshoreProductivity: 0.70 },
  { label: 'Database',  category: 'database',  Icon: Database,     cls: 'text-emerald-700',bg: 'bg-emerald-50 border-emerald-200', onsiteRate: 85, offshoreRawRate: 30, offshoreProductivity: 0.75 },
  { label: 'Testing',   category: 'testing',   Icon: FlaskConical, cls: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',   onsiteRate: 65,  offshoreRawRate: 18, offshoreProductivity: 0.75 },
  { label: 'UX / Design', category: 'ux',      Icon: Paintbrush,   cls: 'text-pink-700',   bg: 'bg-pink-50 border-pink-200',     onsiteRate: 95,  offshoreRawRate: 22, offshoreProductivity: 0.65 },
  { label: 'Docs',      category: 'docs',      Icon: FileText,     cls: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', onsiteRate: 55,  offshoreRawRate: 15, offshoreProductivity: 0.80 },
  { label: 'DevOps',    category: 'devops',    Icon: Cpu,          cls: 'text-slate-700',  bg: 'bg-slate-50 border-slate-200',   onsiteRate: 100, offshoreRawRate: 32, offshoreProductivity: 0.70 },
  { label: 'SM / PM',   category: 'smpm',      Icon: Users,        cls: 'text-orange-800', bg: 'bg-orange-50 border-orange-200', onsiteRate: 85,  offshoreRawRate: 30, offshoreProductivity: 0.70, sprintHours: SM_PM_SPRINT_HOURS },
];

function OnsiteVsOffshorePanel({ metrics }: { metrics: SprintMetrics }) {
  const [view, setView] = useState<'table' | 'cards'>('table');
  const totalActualHours = metrics.totalActualHours;

  // Effective offshore rate accounts for productivity loss
  // effective_rate = raw_rate / productivity  →  more hours needed per unit of output
  const effectiveOffshore = (r: ResourceRate) => r.offshoreRawRate / r.offshoreProductivity;

  const rows = RESOURCE_RATES.map(r => {
    const hours = r.sprintHours != null
      ? r.sprintHours
      : (r.category !== 'smpm' ? (metrics.byCategory[r.category as WorkCategory]?.actualHours ?? 0) : 0);

    const onsiteCost = hours * r.onsiteRate;
    const offshoreCost = hours * effectiveOffshore(r);
    const saving = onsiteCost - offshoreCost;
    const savingPct = onsiteCost > 0 ? Math.round((saving / onsiteCost) * 100) : 0;
    return { ...r, hours, onsiteCost, offshoreCost, saving, savingPct };
  });

  const totalOnsite = rows.reduce((s, r) => s + r.onsiteCost, 0);
  const totalOffshore = rows.reduce((s, r) => s + r.offshoreCost, 0);
  const totalSaving = totalOnsite - totalOffshore;
  const totalSavingPct = totalOnsite > 0 ? Math.round((totalSaving / totalOnsite) * 100) : 0;

  // AI total cost for comparison
  const claudeAI = metrics.byDeveloper.claude.tokenCostCents / 100;
  const lovableAI = (metrics.byDeveloper.lovable.tokenCostCents / 100) + LOVABLE_SPRINT_SUBSCRIPTION_USD;
  const totalAI = claudeAI + lovableAI;

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="pb-3 bg-blue-50/60 border-b border-blue-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
              <Users className="w-4 h-4 text-blue-600" />
              Resource Cost Breakdown — Onsite vs Offshore vs AI
            </CardTitle>
            <p className="text-[11px] text-blue-700/70 mt-1">
              Effective offshore rate = raw rate ÷ productivity factor (lower productivity = more hours = higher real cost).
              Backend &amp; UX carry higher offshore risk due to domain knowledge &amp; communication overhead.
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            <button onClick={() => setView('table')}
              className={cn('px-2 py-1 text-[10px] rounded font-semibold transition-colors',
                view === 'table' ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
              Table
            </button>
            <button onClick={() => setView('cards')}
              className={cn('px-2 py-1 text-[10px] rounded font-semibold transition-colors',
                view === 'cards' ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
              Cards
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">

        {/* ── Headline totals ─────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-blue-100 border border-blue-200">
            <Users className="w-4 h-4 text-blue-600 mx-auto mb-1" />
            <p className="text-xl font-black text-blue-700">{fmtUSD(totalOnsite)}</p>
            <p className="text-[10px] text-blue-600 font-semibold">Onsite Total</p>
            <p className="text-[9px] text-muted-foreground">All resources</p>
          </div>
          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
            <TrendingDown className="w-4 h-4 text-teal-600 mx-auto mb-1" />
            <p className="text-xl font-black text-teal-700">{fmtUSD(totalOffshore)}</p>
            <p className="text-[10px] text-teal-600 font-semibold">Offshore Effective</p>
            <p className="text-[9px] text-muted-foreground">Incl. productivity loss</p>
          </div>
          <div className="p-3 rounded-xl bg-green-100 border border-green-200">
            <Sparkles className="w-4 h-4 text-green-600 mx-auto mb-1" />
            <p className="text-xl font-black text-green-700">{fmtUSD(totalAI)}</p>
            <p className="text-[10px] text-green-600 font-semibold">AI (This Sprint)</p>
            <p className="text-[9px] text-muted-foreground">Claude + Lovable</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-200">
            <TrendingDown className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <p className="text-xl font-black text-emerald-700">{totalSavingPct}%</p>
            <p className="text-[10px] text-emerald-600 font-semibold">Offshore vs Onsite</p>
            <p className="text-[9px] text-muted-foreground">{fmtUSD(totalSaving)} saved</p>
          </div>
        </div>

        {/* ── Table view ──────────────────────────────────────── */}
        {view === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground text-[10px]">
                  <th className="text-left py-2 pr-3 font-semibold">Resource</th>
                  <th className="text-right py-2 px-2 font-semibold">Hours</th>
                  <th className="text-right py-2 px-2 font-semibold text-blue-700">Onsite $/hr</th>
                  <th className="text-right py-2 px-2 font-semibold text-blue-800">Onsite Cost</th>
                  <th className="text-right py-2 px-2 font-semibold text-teal-700">Shore $/hr</th>
                  <th className="text-right py-2 px-2 font-semibold text-teal-600">Prod.</th>
                  <th className="text-right py-2 px-2 font-semibold text-teal-800">Eff. $/hr</th>
                  <th className="text-right py-2 px-2 font-semibold text-teal-800">Off. Cost</th>
                  <th className="text-right py-2 px-2 font-semibold text-green-700">AI Cost</th>
                  <th className="text-right py-2 pl-2 font-semibold text-emerald-700">Saving</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {rows.map(r => {
                  const Icon = r.Icon;
                  const effRate = effectiveOffshore(r);
                  // AI cost proportional to hours this category uses
                  const catAIcost = totalActualHours > 0 && r.category !== 'smpm'
                    ? totalAI * (r.hours / Math.max(totalActualHours, 0.01))
                    : r.category === 'smpm' ? 0 : 0;
                  return (
                    <tr key={r.label} className={cn('hover:bg-muted/20', r.hours === 0 && 'opacity-40')}>
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-1.5">
                          <Icon className={cn('w-3 h-3 shrink-0', r.cls)} />
                          <span className={cn('font-semibold', r.cls)}>{r.label}</span>
                          {r.category === 'smpm' && (
                            <span className="text-[9px] text-muted-foreground ml-1">fixed</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-right tabular-nums text-muted-foreground">
                        {r.hours > 0 ? fmt(r.hours) : '—'}
                      </td>
                      {/* Onsite */}
                      <td className="py-2 px-2 text-right tabular-nums text-blue-700">${r.onsiteRate}</td>
                      <td className="py-2 px-2 text-right tabular-nums font-semibold text-blue-800">
                        {r.hours > 0 ? fmtUSD(r.onsiteCost) : '—'}
                      </td>
                      {/* Offshore */}
                      <td className="py-2 px-2 text-right tabular-nums text-teal-700">${r.offshoreRawRate}</td>
                      <td className="py-2 px-2 text-right tabular-nums text-teal-600 font-semibold">
                        {Math.round(r.offshoreProductivity * 100)}%
                      </td>
                      <td className="py-2 px-2 text-right tabular-nums text-teal-700 font-semibold">
                        ${effRate.toFixed(0)}
                      </td>
                      <td className="py-2 px-2 text-right tabular-nums font-semibold text-teal-800">
                        {r.hours > 0 ? fmtUSD(r.offshoreCost) : '—'}
                      </td>
                      {/* AI */}
                      <td className="py-2 px-2 text-right tabular-nums text-green-700 font-semibold">
                        {r.category === 'smpm' ? <span className="text-muted-foreground italic text-[9px]">AI handles</span> : fmtUSD(catAIcost)}
                      </td>
                      {/* Saving (onsite - offshore) */}
                      <td className="py-2 pl-2 text-right tabular-nums font-bold text-emerald-700">
                        {r.hours > 0 ? (
                          <span>{fmtUSD(r.saving)} <span className="text-[9px] opacity-70">({r.savingPct}%)</span></span>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })}
                {/* Totals */}
                <tr className="bg-muted/30 font-bold border-t-2 text-[11px]">
                  <td className="py-2 pr-3">Sprint Total</td>
                  <td className="py-2 px-2 text-right tabular-nums">{fmt(totalActualHours + SM_PM_SPRINT_HOURS)}</td>
                  <td className="py-2 px-2" colSpan={2} />
                  <td className="py-2 px-2 text-right font-black text-blue-800" colSpan={1}>{fmtUSD(totalOnsite)}</td>
                  <td className="py-2 px-2" colSpan={3} />
                  <td className="py-2 px-2 text-right font-black text-teal-800">{fmtUSD(totalOffshore)}</td>
                  <td className="py-2 px-2 text-right font-black text-green-700">{fmtUSD(totalAI)}</td>
                  <td className="py-2 pl-2 text-right font-black text-emerald-700">{fmtUSD(totalSaving)} ({totalSavingPct}%)</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ── Cards view ──────────────────────────────────────── */}
        {view === 'cards' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {rows.map(r => {
              const Icon = r.Icon;
              const effRate = effectiveOffshore(r);
              const catAICost = totalActualHours > 0 && r.category !== 'smpm'
                ? totalAI * (r.hours / Math.max(totalActualHours, 0.01))
                : 0;
              return (
                <div key={r.label} className={cn('p-3 rounded-lg border', r.bg, r.hours === 0 && 'opacity-40')}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon className={cn('w-3.5 h-3.5 shrink-0', r.cls)} />
                    <span className={cn('text-[11px] font-bold', r.cls)}>{r.label}</span>
                  </div>
                  {r.hours > 0 ? (
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hours</span>
                        <span className="font-semibold">{fmt(r.hours)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Onsite</span>
                        <span className="font-bold text-blue-800">{fmtUSD(r.onsiteCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-teal-700">Offshore eff.</span>
                        <span className="font-bold text-teal-800">{fmtUSD(r.offshoreCost)}</span>
                      </div>
                      <div className="flex justify-between text-[9px]">
                        <span className="text-muted-foreground">Prod. factor</span>
                        <span className="text-amber-700 font-semibold">{Math.round(r.offshoreProductivity * 100)}%</span>
                      </div>
                      {r.category !== 'smpm' && (
                        <div className="flex justify-between">
                          <span className="text-green-700">AI cost</span>
                          <span className="font-bold text-green-700">{fmtUSD(catAICost)}</span>
                        </div>
                      )}
                      <div className="pt-1 border-t flex justify-between">
                        <span className="text-emerald-700 font-semibold">Saving</span>
                        <span className="font-black text-emerald-700">{fmtUSD(r.saving)} ({r.savingPct}%)</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground italic">No hours logged</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Rate assumptions legend ──────────────────────────── */}
        <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3 space-y-1.5">
          <p className="text-[10px] font-bold text-blue-800">Rate Assumptions & Offshore Productivity Notes</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0.5">
            {RESOURCE_RATES.map(r => (
              <div key={r.label} className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                <r.Icon className={cn('w-2.5 h-2.5 shrink-0', r.cls)} />
                <span className="font-semibold text-foreground/70">{r.label}:</span>
                <span>Onsite ${r.onsiteRate}/hr · Offshore ${r.offshoreRawRate}/hr @ {Math.round(r.offshoreProductivity*100)}% → eff. ${effectiveOffshore(r).toFixed(0)}/hr</span>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground mt-1 leading-relaxed">
            <span className="font-semibold text-amber-700">⚠ Offshore productivity:</span> UX/Design (65%) and Backend (70%) carry the highest risk due to design system familiarity and business domain knowledge. 
            Database &amp; Testing are more safely offshored (75–80%). SM/PM is treated as onsite-adjacent due to real-time coordination requirements.
          </p>
        </div>

      </CardContent>
    </Card>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────

export const MetricsView: React.FC<MetricsViewProps> = ({ metrics, currentDay }) => {
  const overallPct = metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0;
  const expectedPct = Math.round((currentDay / 5) * 100);
  const onTrack = overallPct >= expectedPct - 10;

  const vr = metrics.velocityRatio;
  const vrLabel = vr <= 0 ? 'No data yet' : vr <= 0.85 ? 'Under estimate ↓' : vr <= 1.15 ? '✓ On estimate' : 'Over estimate ↑';
  const vrColor = vr <= 0 ? 'text-muted-foreground' : vr <= 0.85 ? 'text-blue-600' : vr <= 1.15 ? 'text-green-600' : 'text-amber-600';

  return (
    <div className="space-y-6">

      {/* ── SPRINT HEADER ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

        <Card>
          <CardContent className="p-4 space-y-1">
            <Clock className="w-4 h-4 text-blue-500 mb-1" />
            <p className="text-2xl font-bold">{fmt(metrics.totalActualHours)}</p>
            <p className="text-xs text-muted-foreground">Actual hours logged</p>
            <p className="text-[10px] text-muted-foreground">{fmt(metrics.totalEstimatedHours)} estimated</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <Cpu className="w-4 h-4 text-violet-500 mb-1" />
            <p className="text-2xl font-bold">{fmtTokens(metrics.totalTokensUsed)}</p>
            <p className="text-xs text-muted-foreground">Tokens consumed</p>
            <p className="text-[10px] text-muted-foreground">{fmtCost(metrics.totalTokenCostCents)} cost</p>
          </CardContent>
        </Card>

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

      {/* ── DEVELOPER CARDS ───────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        {(['lovable', 'claude'] as Developer[]).map(dev => (
          <DevMetricCard key={dev} dev={dev} data={metrics.byDeveloper[dev]} />
        ))}
      </div>

      {/* ── ROI / COST COMPARISON ─────────────────────────────────────────── */}
      <ROISummaryPanel metrics={metrics} />

      {/* ── ONSITE vs OFFSHORE vs AI COST BREAKDOWN ──────────────────────── */}
      <OnsiteVsOffshorePanel metrics={metrics} />

      {/* ── WORK CATEGORY BREAKDOWN ───────────────────────────────────────── */}
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
                    {pct > 0 && <p className={cn('text-[10px] font-semibold', cfg.cls)}>{pct}% complete</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── BURNDOWN BY DAY ───────────────────────────────────────────────── */}
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
                <Progress value={taskPct} className="h-2" />
                {data.estimatedHours > 0 && (
                  <div className="flex gap-2 items-center text-[10px] text-muted-foreground">
                    <div className="flex-1 h-1 rounded-full bg-muted relative overflow-hidden">
                      <div
                        className={cn('absolute inset-y-0 left-0 rounded-full',
                          data.actualHours > data.estimatedHours * 1.1 ? 'bg-amber-400' : 'bg-blue-400')}
                        style={{ width: `${Math.min((data.actualHours / (data.estimatedHours * 1.5)) * 100, 100)}%` }}
                      />
                    </div>
                    <span>Hours</span>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ── SPRINT SUMMARY TABLE ──────────────────────────────────────────── */}
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
                    label: 'Token cost (API)',
                    c: fmtCost(metrics.byDeveloper.claude.tokenCostCents),
                    l: fmtCost(metrics.byDeveloper.lovable.tokenCostCents),
                    t: fmtCost(metrics.totalTokenCostCents),
                  },
                  {
                    label: 'Total AI cost (incl. sub)',
                    c: fmtUSD(metrics.byDeveloper.claude.tokenCostCents / 100),
                    l: fmtUSD((metrics.byDeveloper.lovable.tokenCostCents / 100) + LOVABLE_SPRINT_SUBSCRIPTION_USD),
                    t: fmtUSD((metrics.totalTokenCostCents / 100) + LOVABLE_SPRINT_SUBSCRIPTION_USD),
                  },
                  {
                    label: 'Human equiv. cost ($75/hr)',
                    c: fmtUSD(metrics.byDeveloper.claude.actualHours * HUMAN_HOURLY_RATE_USD),
                    l: fmtUSD(metrics.byDeveloper.lovable.actualHours * HUMAN_HOURLY_RATE_USD),
                    t: fmtUSD(metrics.totalActualHours * HUMAN_HOURLY_RATE_USD),
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

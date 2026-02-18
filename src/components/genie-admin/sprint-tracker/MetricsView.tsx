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

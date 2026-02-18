/**
 * GovernanceFlowView — Sprint Lifecycle Governance
 *
 * Answers explicitly:
 *   1. How does Verify / Approve / Decide trigger Backlog?
 *   2. How are Findings / QA addressed and fixed?
 *   3. What is the Release Gate and who owns it?
 *
 * Sections:
 *   A. Lifecycle diagram — PO action → outcome (backlog / proceed / decide)
 *   B. Backlog trigger rules — which PO action creates backlog and why
 *   C. Findings / QA pipeline — from finding to fix-confirmation
 *   D. Release Gate — step-by-step who does what, in what order
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Eye, ThumbsUp, HelpCircle, KeyRound, Archive, Bug, CheckCircle2,
  ArrowRight, ArrowDown, AlertTriangle, Flag, GitMerge, Rocket,
  Brain, Zap, Shield, ChevronDown, ChevronRight, Clock, Ban,
  BookOpen, GitBranch, RefreshCw, ShieldCheck, XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PO_CHECKLISTS, HANDOFFS, DEPENDENCY_CHAINS } from './data-dependencies';
import { SPRINT_TASKS } from './data-tasks';
import { DAY1_FINDINGS } from './data-findings';
import type { TaskStatus, Developer } from './types';

// ─── Design tokens ────────────────────────────────────────────────────────────

const PO_ACT = {
  verify:  { label: 'Verify',  Icon: Eye,        cls: 'bg-blue-50 border-blue-300 text-blue-800',   dot: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  approve: { label: 'Approve', Icon: ThumbsUp,    cls: 'bg-green-50 border-green-300 text-green-800', dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700 border-green-200' },
  decide:  { label: 'Decide',  Icon: HelpCircle,  cls: 'bg-amber-50 border-amber-300 text-amber-800', dot: 'bg-amber-500',  badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  unblock: { label: 'Unblock', Icon: KeyRound,    cls: 'bg-red-50 border-red-300 text-red-800',      dot: 'bg-red-500',    badge: 'bg-red-100 text-red-700 border-red-200' },
} as const;

const DEV_CFG = {
  po:      { label: 'PO/SM',   Icon: Flag,  cls: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', tag: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  claude:  { label: 'Claude',  Icon: Brain, cls: 'text-violet-700',  bg: 'bg-violet-50 border-violet-200',   tag: 'bg-violet-100 text-violet-800 border-violet-300' },
  lovable: { label: 'Lovable', Icon: Zap,   cls: 'text-pink-700',    bg: 'bg-pink-50 border-pink-200',       tag: 'bg-pink-100 text-pink-800 border-pink-300' },
} as const;

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, subtitle, icon: Icon, iconCls, children, defaultOpen = true }: {
  title: string; subtitle?: string; icon: React.ElementType; iconCls?: string;
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-5 py-3.5 bg-muted/20 hover:bg-muted/30 transition-colors text-left border-b border-border/40"
      >
        <Icon className={cn('w-4 h-4 shrink-0', iconCls ?? 'text-primary')} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">{title}</p>
          {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      {open && <div className="p-5 space-y-4">{children}</div>}
    </div>
  );
}

function RoleTag({ role }: { role: 'po' | 'claude' | 'lovable' }) {
  const cfg = DEV_CFG[role];
  const Icon = cfg.Icon;
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border', cfg.tag)}>
      <Icon className="w-2.5 h-2.5" />{cfg.label}
    </span>
  );
}

// ─── A. Lifecycle Flow Diagram ────────────────────────────────────────────────

function LifecycleFlowDiagram() {
  // PO actions → outcomes mapping
  const flows: {
    action: keyof typeof PO_ACT;
    question: string;
    yesOutcome: { label: string; color: string; bg: string };
    noOutcome:  { label: string; color: string; bg: string; triggersBacklog?: boolean };
    affectedDevs: ('claude' | 'lovable')[];
    example: string;
  }[] = [
    {
      action: 'verify',
      question: 'Does the feature work as expected?',
      yesOutcome: { label: 'Proceed to next task', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
      noOutcome:  { label: '→ Backlog (regressed)', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', triggersBacklog: true },
      affectedDevs: ['claude', 'lovable'],
      example: 'PO visits /genie-deck and sees the wizard fails on step 3 → task C-201 moves to Backlog.',
    },
    {
      action: 'approve',
      question: 'Is the output quality / design acceptable?',
      yesOutcome: { label: 'Merge approved / handoff unlocked', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
      noOutcome:  { label: '→ Backlog (rework required)', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', triggersBacklog: true },
      affectedDevs: ['claude', 'lovable'],
      example: 'PO reviews pricing tiers and finds mismatch → Lovable reworks pricing page (backlog).',
    },
    {
      action: 'decide',
      question: 'What priority / direction to take?',
      yesOutcome: { label: 'Decision locked → devs proceed', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
      noOutcome:  { label: '→ Task stays in "Pending" (awaiting decision)', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
      affectedDevs: ['claude', 'lovable'],
      example: 'PO has not decided real AI vs simulated for MVP → S-006 stays Pending, blocking C-301.',
    },
    {
      action: 'unblock',
      question: 'Are all prerequisite conditions met?',
      yesOutcome: { label: 'Gated tasks become "Can Start"', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
      noOutcome:  { label: '→ Gated (dependency chain stalled)', color: 'text-red-700', bg: 'bg-red-50 border-red-200', triggersBacklog: true },
      affectedDevs: ['claude', 'lovable'],
      example: 'PO has not confirmed H-201 acknowledged → C-202, C-203 remain gated in Backlog.',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 text-[11px] text-blue-800">
        <strong>How it works:</strong> Each PO action (Verify / Approve / Decide / Unblock) has a binary outcome.
        The <strong>NO path</strong> creates work — either a backlog item, a rework task, or a stalled dependency chain.
        Tasks only move to <strong className="text-green-700">Done</strong> after the PO says YES.
      </div>

      <div className="space-y-3">
        {flows.map(f => {
          const cfg = PO_ACT[f.action];
          const Icon = cfg.Icon;
          return (
            <div key={f.action} className={cn('rounded-lg border p-3.5 space-y-2.5', cfg.cls)}>
              {/* Action header */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn('w-6 h-6 rounded-full flex items-center justify-center shrink-0', cfg.dot)}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </span>
                <span className="text-sm font-bold">{cfg.label}</span>
                <span className="text-[11px] opacity-80 italic flex-1 min-w-0">"{f.question}"</span>
                <div className="flex gap-1">
                  {f.affectedDevs.map(d => <RoleTag key={d} role={d} />)}
                </div>
              </div>

              {/* YES / NO outcomes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className={cn('rounded border p-2.5 text-[11px]', 'bg-green-50 border-green-200')}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0" />
                    <span className="font-bold text-green-700">YES →</span>
                  </div>
                  <p className="text-green-800">{f.yesOutcome.label}</p>
                </div>
                <div className={cn('rounded border p-2.5 text-[11px]', f.noOutcome.bg)}>
                  <div className="flex items-center gap-1.5 mb-1">
                    {f.noOutcome.triggersBacklog
                      ? <Archive className="w-3 h-3 text-amber-600 shrink-0" />
                      : <Clock className="w-3 h-3 text-purple-600 shrink-0" />}
                    <span className={cn('font-bold', f.noOutcome.color)}>NO →</span>
                    {f.noOutcome.triggersBacklog && (
                      <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-amber-200 text-amber-800">BACKLOG</span>
                    )}
                  </div>
                  <p className={f.noOutcome.color}>{f.noOutcome.label}</p>
                </div>
              </div>

              {/* Example */}
              <div className="flex items-start gap-1.5 text-[10px] opacity-75 italic">
                <BookOpen className="w-3 h-3 shrink-0 mt-0.5" />
                <span>Example: {f.example}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── B. Backlog Trigger Rules ─────────────────────────────────────────────────

function BacklogTriggerRules({ getTaskStatus }: { getTaskStatus: (id: string) => TaskStatus }) {
  const rules: {
    trigger: string;
    mechanism: string;
    who: 'po' | 'claude' | 'lovable' | 'system';
    example: string;
    autoDetect?: boolean;
  }[] = [
    {
      trigger: 'PO says NO on Verify',
      mechanism: 'PO unchecks (or skips) the Verify item. The related task\'s acceptanceCriteria is not met. Dev marks task back to "pending" after rework instructions.',
      who: 'po',
      example: 'PO-201 (Deck flow) NOT checked → C-201 reverts to pending → appears in Backlog count.',
      autoDetect: true,
    },
    {
      trigger: 'PO says NO on Approve',
      mechanism: 'PO rejects output quality. Task is re-assigned with a note. Dev reworks and submits again.',
      who: 'po',
      example: 'PO-203 (pricing match) rejected → L-202 re-opens → overdue task enters Backlog.',
      autoDetect: true,
    },
    {
      trigger: 'Day N ends with incomplete tasks',
      mechanism: 'All tasks whose day < currentDay and status ≠ completed or rejected are auto-counted as Backlog by the Sprint Tracker. No manual action needed.',
      who: 'system' as any,
      example: 'Today is Day 3. C-201 still pending → BoardColumns.backlog includes C-201 automatically.',
      autoDetect: true,
    },
    {
      trigger: 'Handoff not acknowledged by receiver',
      mechanism: 'Consumer dev cannot start gated tasks until handoff is acknowledged. Producer must mark their task complete. Until then, consumer tasks show "Gated" — which is functionally Backlog.',
      who: 'po',
      example: 'H-201 pending → C-202, C-203 gated → appear as Blocked in Kickstart panel.',
      autoDetect: true,
    },
    {
      trigger: 'PO Decide not made (direction unclear)',
      mechanism: 'Task cannot be started. It remains in "pending" indefinitely and migrates to Backlog once its day passes.',
      who: 'po',
      example: 'PO-305 (real AI vs simulated) undecided → S-006 stays pending → Backlog after Day 3.',
    },
    {
      trigger: 'Dev marks task "Won\'t Do" (rejected)',
      mechanism: 'Claude or Lovable can mark a task as rejected. It exits Backlog (not counted). PO should review and formally agree.',
      who: 'po',
      example: 'C-502 deemed out of scope → Claude marks rejected → PO verifies and approves that decision.',
    },
  ];

  // Live backlog count
  const currentDay = Math.max(1, Math.min(5, Math.ceil((new Date().getTime() - new Date('2026-02-17').getTime()) / 86400000) + 1));
  const liveBacklog = SPRINT_TASKS.filter(t => {
    if (t.day >= currentDay) return false;
    const st = getTaskStatus(t.id);
    return st !== 'completed' && st !== 'rejected';
  });

  return (
    <div className="space-y-4">
      {/* Live backlog count */}
      <div className="flex items-center gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50/50">
        <Archive className="w-4 h-4 text-amber-600 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-bold text-amber-800">Current Backlog: {liveBacklog.length} tasks</p>
          <p className="text-[11px] text-amber-700">Tasks from past days not yet completed or rejected.</p>
        </div>
        {liveBacklog.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {liveBacklog.slice(0, 5).map(t => (
              <span key={t.id} className="font-mono text-[9px] px-1.5 py-0.5 rounded border bg-amber-100 text-amber-800 border-amber-300">
                {t.id}
              </span>
            ))}
            {liveBacklog.length > 5 && <span className="text-[9px] text-amber-700">+{liveBacklog.length - 5}</span>}
          </div>
        )}
      </div>

      {/* Rules table */}
      <div className="rounded-lg border border-border/60 overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto] text-[10px] font-bold uppercase tracking-wide text-muted-foreground bg-muted/20 border-b border-border/40 px-3 py-2 gap-2">
          <span>Trigger</span>
          <span>Owner</span>
          <span>Auto?</span>
        </div>
        {rules.map((r, i) => (
          <div key={i} className={cn('border-b border-border/30 last:border-0 px-3 py-3 space-y-1.5 grid grid-cols-[1fr_auto_auto] gap-x-2 gap-y-1.5 items-start')}>
            <div className="col-span-3 font-semibold text-sm">{r.trigger}</div>
            <p className="text-[11px] text-muted-foreground col-span-3 leading-relaxed">{r.mechanism}</p>
            <p className="text-[10px] italic text-muted-foreground col-span-3 flex items-start gap-1">
              <BookOpen className="w-3 h-3 shrink-0 mt-0.5" />
              {r.example}
            </p>
            <div /> {/* spacer for grid */}
            <RoleTag role={r.who === 'system' ? 'po' : r.who as any} />
            {r.autoDetect
              ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700 border border-green-200">Auto</span>
              : <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">Manual</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── C. Findings / QA Pipeline ────────────────────────────────────────────────

function FindingsQAPipeline() {
  const stages: {
    step: number;
    role: 'claude' | 'lovable' | 'po';
    action: string;
    detail: string;
    output: string;
    color: string;
    Icon: React.ElementType;
  }[] = [
    {
      step: 1, role: 'claude', action: 'Diagnosis',
      detail: 'Claude runs deep audit on each product page (C-101, C-102, C-103, C-104). Issues logged to data-findings.ts with severity: critical / high / medium / low.',
      output: 'DiagnosisFinding[] in data-findings.ts',
      color: 'border-violet-300 bg-violet-50/30', Icon: Bug,
    },
    {
      step: 2, role: 'po', action: 'PO Reviews & Prioritises',
      detail: 'PO reads GENIESUITE_DAY1_DIAGNOSIS.md and the Findings/QA tab. PO classifies: must-fix for MVP vs post-sprint nice-to-have. This is PO-105 (Decide).',
      output: 'Verbal decision + PO-105 checkbox ticked',
      color: 'border-emerald-300 bg-emerald-50/30', Icon: HelpCircle,
    },
    {
      step: 3, role: 'claude', action: 'Fix Implementation',
      detail: 'Claude fixes issues in priority order across sprint days (Day 2 = Deck, Day 3 = Spark, Day 4 = Mind). Each fix updates finding.status from "open" → "fixed" and logs fixedIn: commitHash.',
      output: 'finding.status = "fixed", fixedIn = "commitHash"',
      color: 'border-violet-300 bg-violet-50/30', Icon: RefreshCw,
    },
    {
      step: 4, role: 'po', action: 'PO Verifies Fix',
      detail: 'PO visits the route from the related PO checklist item (e.g. PO-201 → /genie-deck). Manually checks the acceptance criteria. If passed: ticks the Verify item. If not: unchecks it → task re-enters Backlog.',
      output: 'PO checklist item checked + task marked completed',
      color: 'border-emerald-300 bg-emerald-50/30', Icon: Eye,
    },
    {
      step: 5, role: 'po', action: 'Approve for Release Gate',
      detail: 'Only after all critical and high severity findings are "fixed" + verified can the PO proceed to the Release Gate. Any open critical finding blocks the release.',
      output: 'PO-504/PO-505 approve merge. S-501 = final build.',
      color: 'border-emerald-300 bg-emerald-50/30', Icon: ShieldCheck,
    },
    {
      step: 6, role: 'lovable', action: 'Lovable Verifies Own Findings',
      detail: 'Lovable verifies UI-side findings (D-002, D-004, D-005, D-006, X-002): DeckDemoCard fallback UI, error messages, image loading skeletons. Marks fixed and submits for PO Verify.',
      output: 'finding.status = "fixed" for Lovable-owned issues',
      color: 'border-pink-300 bg-pink-50/30', Icon: CheckCircle2,
    },
  ];

  // Live findings summary
  const allFindings = Object.values(DAY1_FINDINGS).flatMap(d => d.findings);
  const open = allFindings.filter(f => f.status === 'open');
  const fixed = allFindings.filter(f => f.status === 'fixed');
  const bySeverity = {
    critical: open.filter(f => f.severity === 'critical').length,
    high: open.filter(f => f.severity === 'high').length,
    medium: open.filter(f => f.severity === 'medium').length,
    low: open.filter(f => f.severity === 'low').length,
  };

  return (
    <div className="space-y-4">
      {/* Live finding stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded-lg border p-3 text-center bg-card">
          <p className="text-2xl font-bold">{allFindings.length}</p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{fixed.length}</p>
          <p className="text-[10px] text-green-600">Fixed ✓</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
          <p className="text-2xl font-bold text-amber-700">{open.length}</p>
          <p className="text-[10px] text-amber-600">Open</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center">
          <p className="text-2xl font-bold text-red-700">{bySeverity.critical + bySeverity.high}</p>
          <p className="text-[10px] text-red-600">Crit/High Open</p>
        </div>
      </div>

      {/* Open severity breakdown */}
      {open.length > 0 && (
        <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/30 space-y-1.5">
          <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Open Finding Severity</p>
          <div className="flex flex-wrap gap-2">
            {bySeverity.critical > 0 && <span className="text-[11px] font-semibold px-2 py-0.5 rounded border bg-red-100 text-red-700 border-red-200">{bySeverity.critical} critical 🚨</span>}
            {bySeverity.high > 0    && <span className="text-[11px] font-semibold px-2 py-0.5 rounded border bg-orange-100 text-orange-700 border-orange-200">{bySeverity.high} high</span>}
            {bySeverity.medium > 0  && <span className="text-[11px] font-semibold px-2 py-0.5 rounded border bg-yellow-100 text-yellow-700 border-yellow-200">{bySeverity.medium} medium</span>}
            {bySeverity.low > 0     && <span className="text-[11px] font-semibold px-2 py-0.5 rounded border bg-muted text-muted-foreground border-border">{bySeverity.low} low</span>}
          </div>
          {(bySeverity.critical + bySeverity.high) > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] text-red-700 font-semibold mt-1">
              <AlertTriangle className="w-3 h-3" />
              Critical/High findings block the Release Gate until fixed.
            </div>
          )}
        </div>
      )}

      {/* Pipeline steps */}
      <div className="relative space-y-2">
        {stages.map((s, i) => {
          const Icon = s.Icon;
          const devCfg = DEV_CFG[s.role];
          return (
            <React.Fragment key={s.step}>
              <div className={cn('rounded-lg border p-3.5 space-y-2', s.color)}>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center text-[10px] font-bold shrink-0 text-foreground">
                    {s.step}
                  </span>
                  <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm font-bold">{s.action}</span>
                  <RoleTag role={s.role} />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{s.detail}</p>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="font-semibold text-foreground">Output:</span>
                  <span className="font-mono text-muted-foreground">{s.output}</span>
                </div>
              </div>
              {i < stages.length - 1 && (
                <div className="flex justify-center">
                  <ArrowDown className="w-4 h-4 text-muted-foreground/40" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ─── D. Release Gate ──────────────────────────────────────────────────────────

function ReleaseGate({ getTaskStatus }: { getTaskStatus: (id: string) => TaskStatus }) {
  const gateSteps: {
    step: number;
    label: string;
    role: 'claude' | 'lovable' | 'po';
    taskId?: string;
    poItemId?: string;
    requirement: string;
    detail: string;
    blocksNext: boolean;
  }[] = [
    {
      step: 1, label: 'All CREATE modules functional', role: 'claude', taskId: 'C-501',
      requirement: 'Spark, Mind, Deck all load without console errors. Core flows work.',
      detail: 'Claude verifies /genie-spark, /genie-mind, /genie-deck. PO spot-checks each. Task C-501.',
      blocksNext: true,
    },
    {
      step: 2, label: 'All Landing routes functional', role: 'lovable', taskId: 'L-501',
      requirement: '/, /explore, /products, /support — no console errors, correct data.',
      detail: 'Lovable verifies all landing routes. PO checks via PO-502.',
      blocksNext: true,
    },
    {
      step: 3, label: 'End-to-end navigation verified', role: 'po', taskId: 'C-502',
      requirement: 'User can: landing → sign in → studio → create content. No broken links.',
      detail: 'PO walks the full journey. Both devs fix anything found. PO-503 is the gate item.',
      blocksNext: true,
    },
    {
      step: 4, label: 'All critical/high findings fixed', role: 'po',
      requirement: 'Findings/QA: 0 critical open, 0 high open.',
      detail: 'PO reviews Findings tab. Any critical/high still open BLOCKS the merge.',
      blocksNext: true,
    },
    {
      step: 5, label: 'PO approves Claude merge', role: 'po', taskId: 'C-504', poItemId: 'PO-504',
      requirement: 'Build passes on Claude\'s branch. All C-5xx tasks done.',
      detail: 'PO checks CI build green, reviews diff, clicks "Approve" on PO-504. Claude runs: git merge origin/main.',
      blocksNext: true,
    },
    {
      step: 6, label: 'Lovable rebases onto main', role: 'lovable', taskId: 'L-504',
      requirement: 'Lovable must rebase AFTER Claude merge. Resolve any conflicts.',
      detail: 'This order is MANDATORY (H-501). Parallel merges cause conflicts. PO confirms Claude merged first.',
      blocksNext: true,
    },
    {
      step: 7, label: 'PO approves Lovable merge', role: 'po', taskId: 'L-504', poItemId: 'PO-505',
      requirement: 'Lovable build passes post-rebase. PO-505 checked.',
      detail: 'PO reviews Lovable\'s final diff. Approves merge to main.',
      blocksNext: true,
    },
    {
      step: 8, label: 'Final build on main', role: 'po', taskId: 'S-501', poItemId: 'PO-506',
      requirement: 'Both branches merged. npm run build on main = GREEN.',
      detail: 'Either dev runs the build. PO confirms green. This is S-501 (Shared sync task).',
      blocksNext: false,
    },
    {
      step: 9, label: '🚀 Release / Publish', role: 'po',
      requirement: 'All above gates passed. PO clicks "Publish" in Lovable.',
      detail: 'Only the PO/SM has publish authority. Lovable\'s Publish button deploys to production. No code changes after this without a new sprint.',
      blocksNext: false,
    },
  ];

  // Compute live status for each step
  const stepStatus = gateSteps.map(s => {
    if (!s.taskId) return 'manual';
    const st = getTaskStatus(s.taskId);
    if (st === 'completed') return 'done';
    if (st === 'in-progress') return 'active';
    return 'pending';
  });

  const completedSteps = stepStatus.filter(s => s === 'done').length;

  return (
    <div className="space-y-4">
      {/* Overall gate progress */}
      <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/30 space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <p className="text-sm font-bold text-emerald-800">Release Gate Progress</p>
          <span className="ml-auto text-sm font-bold text-emerald-700">{completedSteps}/{gateSteps.length} gates</span>
        </div>
        <Progress value={Math.round((completedSteps / gateSteps.length) * 100)} className="h-2 [&>div]:bg-emerald-500" />
        <p className="text-[11px] text-emerald-700">
          <strong>Who releases:</strong> Only <RoleTag role="po" /> can publish. Devs prepare and fix, PO approves each gate, PO triggers publish.
        </p>
      </div>

      {/* Gate steps */}
      <div className="space-y-2">
        {gateSteps.map((s, i) => {
          const status = stepStatus[i];
          const devCfg = DEV_CFG[s.role];
          const isDone = status === 'done';
          const isActive = status === 'active';
          const isManual = status === 'manual';
          const isPending = !isDone && !isActive;

          return (
            <React.Fragment key={s.step}>
              <div className={cn(
                'rounded-lg border p-3 space-y-1.5 transition-all',
                isDone   ? 'border-green-300 bg-green-50/40' :
                isActive ? 'border-blue-300 bg-blue-50/40 ring-1 ring-blue-200' :
                           'border-border/50 bg-card',
              )}>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Step number / status icon */}
                  <span className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                    isDone   ? 'bg-green-500 text-white' :
                    isActive ? 'bg-blue-500 text-white' :
                               'bg-muted text-muted-foreground',
                  )}>
                    {isDone ? '✓' : s.step}
                  </span>

                  <span className={cn('text-sm font-semibold', isDone && 'line-through text-muted-foreground')}>{s.label}</span>
                  <RoleTag role={s.role} />
                  {s.taskId && (
                    <span className={cn(
                      'font-mono text-[9px] px-1.5 py-0.5 rounded border',
                      isDone ? 'bg-green-50 text-green-700 border-green-200' : 'bg-muted text-muted-foreground border-border',
                    )}>{s.taskId}</span>
                  )}
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-auto shrink-0" />}
                  {isActive && <Clock className="w-3.5 h-3.5 text-blue-500 ml-auto shrink-0 animate-pulse" />}
                  {isPending && !isManual && <Ban className="w-3.5 h-3.5 text-muted-foreground/40 ml-auto shrink-0" />}
                </div>

                <p className="text-[11px] text-muted-foreground pl-8 leading-relaxed">{s.detail}</p>

                {/* Requirement */}
                <div className="pl-8">
                  <p className="text-[10px] font-semibold text-foreground flex items-start gap-1">
                    <Shield className="w-3 h-3 shrink-0 mt-0.5 text-muted-foreground" />
                    Gate requirement: <span className="font-normal text-muted-foreground ml-1">{s.requirement}</span>
                  </p>
                </div>

                {s.blocksNext && (
                  <div className="pl-8">
                    <span className="text-[9px] font-bold text-red-600 flex items-center gap-1">
                      <Ban className="w-2.5 h-2.5" /> Blocks next step if not complete
                    </span>
                  </div>
                )}
              </div>

              {i < gateSteps.length - 1 && s.blocksNext && (
                <div className="flex items-center gap-1.5 justify-center">
                  <ArrowDown className={cn('w-4 h-4', isDone ? 'text-green-500' : 'text-muted-foreground/30')} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Who can release summary */}
      <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-blue-700 shrink-0" />
          <p className="text-sm font-bold text-blue-800">Who Releases & How</p>
        </div>
        <div className="space-y-1.5 text-[11px] text-blue-900">
          {[
            { role: 'po' as const,      action: 'Approves each gate. Clicks Publish in Lovable. ONLY role with publish authority.' },
            { role: 'claude' as const,  action: 'Runs final build. Merges branch FIRST (per H-501). Fixes any last-minute issues.' },
            { role: 'lovable' as const, action: 'Rebases onto main AFTER Claude. Merges second. No independent publish authority.' },
          ].map(({ role, action }) => {
            const cfg = DEV_CFG[role];
            const Icon = cfg.Icon;
            return (
              <div key={role} className="flex items-start gap-2">
                <RoleTag role={role} />
                <span className="text-muted-foreground leading-relaxed">{action}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface GovernanceFlowViewProps {
  getTaskStatus: (id: string) => TaskStatus;
}

export const GovernanceFlowView: React.FC<GovernanceFlowViewProps> = ({ getTaskStatus }) => {
  return (
    <div className="space-y-5">
      {/* Reference-only banner */}
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-blue-200 bg-blue-50/70">
        <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-blue-800">📖 Reference Guide — Read Only</p>
          <p className="text-xs text-blue-700 mt-0.5">
            This page explains <strong>how</strong> the sprint governance works. 
            Your actual daily actions (Verify · Approve · Decide · Unblock) and PO Notes are in <strong>📋 Actions & Notes</strong>.
          </p>
        </div>
      </div>

      {/* Page header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
        </div>
        <div>
          <h2 className="text-base font-bold">Governance &amp; Release Flow</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            How PO actions (Verify / Approve / Decide / Unblock) trigger Backlog · How Findings get fixed · How the Release Gate works and who releases.
          </p>
        </div>
      </div>

      {/* Role legend */}
      <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-border/50 bg-muted/10">
        <span className="text-[11px] text-muted-foreground font-semibold mr-1">Roles:</span>
        {(['po', 'claude', 'lovable'] as const).map(r => {
          const cfg = DEV_CFG[r];
          const Icon = cfg.Icon;
          const desc = r === 'po' ? 'Gate authority · Release authority' : r === 'claude' ? 'Tech Lead · Fix owner' : 'Dev / UI · Landing owner';
          return (
            <div key={r} className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px]', cfg.bg)}>
              <Icon className={cn('w-3 h-3', cfg.cls)} />
              <span className={cn('font-semibold', cfg.cls)}>{cfg.label}</span>
              <span className="text-muted-foreground">— {desc}</span>
            </div>
          );
        })}
      </div>

      {/* Section A: Lifecycle flow */}
      <Section
        title="A. PO Action → Outcome: How Backlog is Triggered"
        subtitle="Verify / Approve / Decide / Unblock — YES proceeds, NO creates Backlog or stalls the chain"
        icon={HelpCircle}
        iconCls="text-amber-600"
      >
        <LifecycleFlowDiagram />
      </Section>

      {/* Section B: Backlog trigger rules */}
      <Section
        title="B. Backlog Trigger Rules — Exactly When & How"
        subtitle="All 6 specific conditions that push a task into Backlog and who is responsible"
        icon={Archive}
        iconCls="text-amber-600"
      >
        <BacklogTriggerRules getTaskStatus={getTaskStatus} />
      </Section>

      {/* Section C: Findings / QA pipeline */}
      <Section
        title="C. Findings / QA Pipeline — From Bug to Verified Fix"
        subtitle="6-step flow: Diagnosis → PO Prioritises → Dev Fixes → PO Verifies → Approve → Release Gate"
        icon={Bug}
        iconCls="text-red-600"
      >
        <FindingsQAPipeline />
      </Section>

      {/* Section D: Release gate */}
      <Section
        title="D. Release Gate — 9 Steps, Who Owns Each, Who Publishes"
        subtitle="Sequential gate: each step blocks the next. Only PO can publish."
        icon={Rocket}
        iconCls="text-emerald-600"
      >
        <ReleaseGate getTaskStatus={getTaskStatus} />
      </Section>
    </div>
  );
};

/**
 * EOD Handoff View — Auto-generated End-of-Day brief + Day N+1 Kickstart prompt
 *
 * ZERO manual PO input needed. This component:
 *   1. Reads live sprint state (tasks, effort, handoffs, standups)
 *   2. Auto-generates an EOD summary for the CURRENT day
 *   3. Generates a Claude-ready kickstart prompt for Day N+1
 *   4. Publishes it to Supabase so BOTH AIs see it at session start — no PO copy-paste
 *
 * Flow:
 *   PO clicks "Close Day & Publish" → brief saved to Supabase → next day, both AIs
 *   call forceRefresh() and see the brief automatically in their session start routine.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2, Clock, AlertTriangle, Link2, Brain, Zap, Flag,
  Copy, Send, RefreshCw, ArrowRight, Calendar, Sparkles, FileText,
  TrendingUp, DollarSign, Eye, Rocket, ChevronDown, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { SPRINT_TASKS } from './data-tasks';
import { HANDOFFS, DEPENDENCY_CHAINS } from './data-dependencies';
import { SPRINT_DAYS } from './data-config';
import type { TaskStatus, SprintMetrics, StandupEntry } from './types';

// ── Storage key in Supabase (reuses sprint-tracker session) ──────────────────
const EOD_CHANNEL_TYPE = 'sprint-tracker';
const EOD_STEP_PREFIX = 'genie-eod-brief-day-';

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(h: number) {
  if (!h) return '0h';
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

function fmtUSD(n: number) {
  return `$${n.toFixed(2)}`;
}

function fmtTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
}

// ── Generate EOD brief from live data ────────────────────────────────────────

function generateEODBrief(
  currentDay: number,
  getTaskStatus: (id: string) => TaskStatus,
  metrics: SprintMetrics,
  standups: StandupEntry[],
): string {
  const nextDay = currentDay + 1;
  const currentTheme = SPRINT_DAYS[currentDay - 1]?.theme ?? '';
  const nextTheme = SPRINT_DAYS[nextDay - 1]?.theme ?? 'Sprint Complete';

  // Tasks for today
  const todayTasks = SPRINT_TASKS.filter(t => t.day === currentDay);
  const completedToday = todayTasks.filter(t => getTaskStatus(t.id) === 'completed');
  const pendingToday = todayTasks.filter(t => getTaskStatus(t.id) !== 'completed' && getTaskStatus(t.id) !== 'rejected');

  // Backlog (incomplete from previous days)
  const backlog = SPRINT_TASKS.filter(t =>
    t.day < currentDay && getTaskStatus(t.id) !== 'completed' && getTaskStatus(t.id) !== 'rejected'
  );

  // Handoffs for today — what was produced / what's pending
  const todayHandoffs = HANDOFFS.filter(h => h.day === currentDay);
  const readyHandoffs = todayHandoffs.filter(h =>
    h.status === 'ready' || h.status === 'acknowledged' || getTaskStatus(h.producerTaskId) === 'completed'
  );
  const pendingHandoffs = todayHandoffs.filter(h =>
    h.status === 'pending' && getTaskStatus(h.producerTaskId) !== 'completed'
  );

  // Day N+1 tasks
  const nextDayTasks = SPRINT_TASKS.filter(t => t.day === nextDay);
  const claudeNextDay = nextDayTasks.filter(t => t.developer === 'claude');
  const lovableNextDay = nextDayTasks.filter(t => t.developer === 'lovable');

  // Effort stats for today
  const claudeDay = metrics.byDeveloper.claude;
  const lovableDay = metrics.byDeveloper.lovable;
  const totalAICost = (claudeDay.tokenCostCents + lovableDay.tokenCostCents) / 100 + 7.25;

  // Standup for today
  const todayStandups = standups.filter(s => s.day === currentDay);
  const claudeStandup = todayStandups.find(s => s.developer === 'claude');
  const lovableStandup = todayStandups.find(s => s.developer === 'lovable');

  const lines: string[] = [];

  lines.push(`# 📋 EOD BRIEF — Day ${currentDay}: ${currentTheme}`);
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Auto-published to Supabase. Both Claude & Lovable will see this at Day ${nextDay} session start.`);
  lines.push('');

  // ── Day summary ──
  lines.push(`## ✅ Day ${currentDay} Summary`);
  lines.push(`Completed: ${completedToday.length}/${todayTasks.length} tasks`);
  lines.push(`Sprint progress: ${metrics.completed}/${metrics.total} tasks (${Math.round(metrics.completed / Math.max(metrics.total, 1) * 100)}%)`);
  lines.push(`Total AI cost today: ${fmtUSD(totalAICost)} | Hours: ${fmt(metrics.totalActualHours)}`);
  lines.push('');

  // ── Completed tasks ──
  if (completedToday.length > 0) {
    lines.push('### Completed Today');
    completedToday.forEach(t => {
      const effort = t.effort;
      const hours = effort?.actualHours != null ? fmt(effort.actualHours) : fmt(t.estimatedHours);
      const tokens = effort?.tokensUsed ? `${fmtTokens(effort.tokensUsed)} tokens` : '';
      lines.push(`- [${t.developer === 'claude' ? '🧠' : '⚡'}] **${t.id}**: ${t.title} (${hours}${tokens ? ` · ${tokens}` : ''})`);
    });
    lines.push('');
  }

  // ── Pending / carry-forward ──
  if (pendingToday.length > 0) {
    lines.push('### ⏳ Carry-Forward to Backlog');
    pendingToday.forEach(t => {
      lines.push(`- [${t.developer === 'claude' ? '🧠' : '⚡'}] **${t.id}**: ${t.title} [${t.priority}]`);
    });
    lines.push('');
  }

  // ── Backlog from previous days ──
  if (backlog.length > 0) {
    lines.push('### 🗂 Open Backlog (Previous Days)');
    backlog.forEach(t => {
      lines.push(`- **${t.id}** (Day ${t.day}): ${t.title}`);
    });
    lines.push('');
  }

  // ── Handoffs ──
  lines.push('### 🔗 Handoff Status');
  if (readyHandoffs.length > 0) {
    lines.push('**Ready / Acknowledged:**');
    readyHandoffs.forEach(h => {
      lines.push(`- ✅ **${h.id}**: ${h.title} → ${h.artifact}`);
    });
  }
  if (pendingHandoffs.length > 0) {
    lines.push('**Still Pending:**');
    pendingHandoffs.forEach(h => {
      lines.push(`- ⏳ **${h.id}**: ${h.title} (producer: ${h.producerTaskId})`);
    });
  }
  if (readyHandoffs.length === 0 && pendingHandoffs.length === 0) {
    lines.push('No handoffs for today.');
  }
  lines.push('');

  // ── Standups ──
  if (claudeStandup || lovableStandup) {
    lines.push('### 📝 Standups');
    if (claudeStandup) {
      lines.push(`**Claude:** ${claudeStandup.today}`);
      if (claudeStandup.blockers && claudeStandup.blockers !== 'None') {
        lines.push(`  Blockers: ${claudeStandup.blockers}`);
      }
    }
    if (lovableStandup) {
      lines.push(`**Lovable:** ${lovableStandup.today}`);
      if (lovableStandup.blockers && lovableStandup.blockers !== 'None') {
        lines.push(`  Blockers: ${lovableStandup.blockers}`);
      }
    }
    lines.push('');
  }

  // ── Day N+1 kickstart ──
  if (nextDay <= 5) {
    lines.push('---');
    lines.push('');
    lines.push(`# 🚀 DAY ${nextDay} KICKSTART — ${nextTheme}`);
    lines.push(`Read this at the start of Day ${nextDay}. No manual action needed — data is already in Supabase.`);
    lines.push('');

    if (claudeNextDay.length > 0) {
      lines.push(`## 🧠 Claude — Day ${nextDay} Tasks`);
      claudeNextDay.forEach(t => {
        lines.push(`- **${t.id}** [${t.priority}]: ${t.title} (est. ${fmt(t.estimatedHours)})`);
        lines.push(`  Acceptance: ${t.acceptanceCriteria}`);
      });
      lines.push('');

      // Which handoffs Claude needs to produce
      const claudeHandoffs = HANDOFFS.filter(h => h.day === nextDay && h.from === 'claude');
      if (claudeHandoffs.length > 0) {
        lines.push(`**Handoffs Claude must produce Day ${nextDay}:**`);
        claudeHandoffs.forEach(h => {
          lines.push(`- **${h.id}** [${h.priority}]: ${h.artifact}`);
          lines.push(`  Consumer notes: ${h.consumerNotes}`);
        });
        lines.push('');
      }

      // What Claude needs from Lovable
      const lovableToClaudeHandoffs = HANDOFFS.filter(h => h.day === nextDay && h.to === 'claude');
      if (lovableToClaudeHandoffs.length > 0) {
        lines.push(`**Handoffs Claude receives from Lovable:**`);
        lovableToClaudeHandoffs.forEach(h => {
          lines.push(`- **${h.id}**: ${h.artifact}`);
        });
        lines.push('');
      }
    }

    if (lovableNextDay.length > 0) {
      lines.push(`## ⚡ Lovable — Day ${nextDay} Tasks`);
      lovableNextDay.forEach(t => {
        lines.push(`- **${t.id}** [${t.priority}]: ${t.title} (est. ${fmt(t.estimatedHours)})`);
        lines.push(`  Acceptance: ${t.acceptanceCriteria}`);
      });
      lines.push('');

      // Which handoffs Lovable needs to produce
      const lovableHandoffs = HANDOFFS.filter(h => h.day === nextDay && h.from === 'lovable');
      if (lovableHandoffs.length > 0) {
        lines.push(`**Handoffs Lovable must produce Day ${nextDay}:**`);
        lovableHandoffs.forEach(h => {
          lines.push(`- **${h.id}** [${h.priority}]: ${h.artifact}`);
        });
        lines.push('');
      }
    }

    // Blocked tasks for next day
    const blockedNextDay = nextDayTasks.filter(t => {
      const chain = DEPENDENCY_CHAINS.find(c => c.taskId === t.id);
      if (!chain) return false;
      return chain.blockedBy.some(dep => {
        if (dep.startsWith('H-')) {
          const h = HANDOFFS.find(x => x.id === dep);
          return !h || (h.status !== 'ready' && h.status !== 'acknowledged' && getTaskStatus(h.producerTaskId) !== 'completed');
        }
        return getTaskStatus(dep) !== 'completed';
      });
    });

    if (blockedNextDay.length > 0) {
      lines.push(`⚠️ **Still Blocked at Day ${nextDay} Start:**`);
      blockedNextDay.forEach(t => {
        const chain = DEPENDENCY_CHAINS.find(c => c.taskId === t.id);
        lines.push(`- **${t.id}**: ${t.title} — blocked by: ${chain?.blockedBy.join(', ')}`);
      });
      lines.push('');
    }

    // EOD protocol reminder
    lines.push('## 📌 EOD Protocol (Repeat Each Day)');
    lines.push(`When finishing Day ${nextDay}, log effort in data-tasks.ts:`);
    lines.push('```');
    lines.push('effort: {');
    lines.push('  actualHours: X.X,');
    lines.push('  tokensUsed: NNNNN,');
    lines.push('  tokenCostCents: NN,');
    lines.push("  workCategories: ['frontend', 'backend', ...],");
    lines.push('}');
    lines.push('```');
    lines.push('This auto-populates ALL metrics panels. No other updates needed.');
  } else {
    lines.push('---');
    lines.push('🎉 Sprint complete! Day 5 was the final day.');
  }

  return lines.join('\n');
}

// ── Main Component ────────────────────────────────────────────────────────────

interface EODHandoffViewProps {
  currentDay: number;
  getTaskStatus: (id: string) => TaskStatus;
  metrics: SprintMetrics;
  standups: StandupEntry[];
}

export const EODHandoffView: React.FC<EODHandoffViewProps> = ({
  currentDay, getTaskStatus, metrics, standups,
}) => {
  const [publishing, setPublishing] = useState(false);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [copied, setCopied] = useState<'claude' | 'lovable' | 'full' | null>(null);
  const [expandSection, setExpandSection] = useState<'brief' | 'claude' | 'lovable' | null>('brief');

  const nextDay = currentDay + 1;
  const currentTheme = SPRINT_DAYS[currentDay - 1]?.theme ?? '';
  const nextTheme = SPRINT_DAYS[nextDay - 1]?.theme ?? 'Sprint Complete';

  // Generate full brief from live data
  const fullBrief = useMemo(
    () => generateEODBrief(currentDay, getTaskStatus, metrics, standups),
    [currentDay, getTaskStatus, metrics, standups],
  );

  // ── Task summary for current day ──────────────────────────────────────────
  const todayTasks = SPRINT_TASKS.filter(t => t.day === currentDay);
  const completedToday = todayTasks.filter(t => getTaskStatus(t.id) === 'completed');
  const pendingToday = todayTasks.filter(t => getTaskStatus(t.id) !== 'completed' && getTaskStatus(t.id) !== 'rejected');
  const nextDayTasks = SPRINT_TASKS.filter(t => t.day === nextDay);
  const claudeNextDay = nextDayTasks.filter(t => t.developer === 'claude');
  const lovableNextDay = nextDayTasks.filter(t => t.developer === 'lovable');

  const todayHandoffs = HANDOFFS.filter(h => h.day === currentDay);
  const pendingHandoffs = todayHandoffs.filter(h =>
    h.status === 'pending' && getTaskStatus(h.producerTaskId) !== 'completed'
  );

  // ── Day readiness check ───────────────────────────────────────────────────
  const dayCompletePct = Math.round(completedToday.length / Math.max(todayTasks.length, 1) * 100);
  const sprintPct = Math.round(metrics.completed / Math.max(metrics.total, 1) * 100);
  const isReadyToClose = dayCompletePct >= 80; // 80%+ tasks done = ready to close

  // ── Claude-specific prompt ────────────────────────────────────────────────
  const claudePrompt = useMemo(() => {
    const nextTasks = claudeNextDay.map(t =>
      `• ${t.id} [${t.priority}] ${t.title} (${fmt(t.estimatedHours)}) — ${t.acceptanceCriteria}`
    ).join('\n');

    const todayDone = completedToday.filter(t => t.developer === 'claude')
      .map(t => `• ${t.id}: ${t.title}${t.effort?.actualHours ? ` (${fmt(t.effort.actualHours)} actual)` : ''}`)
      .join('\n');

    const readyHandoffs = HANDOFFS.filter(h =>
      h.day === currentDay && (h.status === 'ready' || h.status === 'acknowledged' || getTaskStatus(h.producerTaskId) === 'completed')
    ).map(h => `• ${h.id}: ${h.artifact}`).join('\n');

    const nextHandoffs = HANDOFFS.filter(h => h.day === nextDay && h.from === 'claude')
      .map(h => `• ${h.id} [${h.priority}]: ${h.artifact}\n  → ${h.consumerNotes}`).join('\n\n');

    return `Hi Claude 👋 — Auto-generated Day ${currentDay} EOD Brief. Day ${nextDay} starts now.

── DAY ${currentDay} RECAP (your tasks) ──
${todayDone || 'No completed tasks logged yet.'}

── HANDOFFS YOU PRODUCED ──
${readyHandoffs || 'None yet — check if tasks are marked complete.'}

── DAY ${nextDay} TASKS FOR YOU — ${nextTheme} ──
${nextTasks || 'No tasks assigned for Day ' + nextDay}

── HANDOFFS YOU MUST PRODUCE ON DAY ${nextDay} ──
${nextHandoffs || 'No outgoing handoffs this day.'}

── SPRINT HEALTH ──
Sprint: ${sprintPct}% complete (${metrics.completed}/${metrics.total} tasks)
Total AI cost: ${((metrics.byDeveloper.claude.tokenCostCents + metrics.byDeveloper.lovable.tokenCostCents) / 100 + 7.25).toFixed(2)} (Claude + Lovable incl. sub)

── EOD PROTOCOL ──
Log effort in data-tasks.ts when tasks complete:
effort: { actualHours: X, tokensUsed: N, tokenCostCents: N, workCategories: [...] }
This auto-flows into ALL metrics panels — no other updates needed.

Source: Auto-published to Supabase at EOD by Sprint Tracker. forceRefresh() to reload.`;
  }, [currentDay, nextDay, nextTheme, claudeNextDay, completedToday, sprintPct, metrics, getTaskStatus]);

  // ── Lovable-specific prompt ───────────────────────────────────────────────
  const lovablePrompt = useMemo(() => {
    const nextTasks = lovableNextDay.map(t =>
      `• ${t.id} [${t.priority}] ${t.title} (${fmt(t.estimatedHours)}) — ${t.acceptanceCriteria}`
    ).join('\n');

    const todayDone = completedToday.filter(t => t.developer === 'lovable')
      .map(t => `• ${t.id}: ${t.title}${t.effort?.actualHours ? ` (${fmt(t.effort.actualHours)} actual)` : ''}`)
      .join('\n');

    const readyFromClaude = HANDOFFS.filter(h =>
      h.day === currentDay && h.to === 'lovable' &&
      (h.status === 'ready' || h.status === 'acknowledged' || getTaskStatus(h.producerTaskId) === 'completed')
    ).map(h => `• ${h.id}: ${h.artifact}\n  → ${h.consumerNotes}`).join('\n\n');

    const nextHandoffs = HANDOFFS.filter(h => h.day === nextDay && h.from === 'lovable')
      .map(h => `• ${h.id} [${h.priority}]: ${h.artifact}`).join('\n');

    return `Hi Lovable 👋 — Auto-generated Day ${currentDay} EOD Brief. Day ${nextDay} starts now.

── DAY ${currentDay} RECAP (your tasks) ──
${todayDone || 'No completed tasks logged yet.'}

── HANDOFFS READY FROM CLAUDE ──
${readyFromClaude || 'Waiting on Claude to complete producer tasks.'}

── DAY ${nextDay} TASKS FOR YOU — ${nextTheme} ──
${nextTasks || 'No tasks assigned for Day ' + nextDay}

── HANDOFFS YOU MUST PRODUCE ON DAY ${nextDay} ──
${nextHandoffs || 'No outgoing handoffs this day.'}

── TERRITORY REMINDER ──
• Never touch: src/constants/genie-products.ts, src/hooks/useMasterAuth.tsx, src/config/genieStudioNavItems.ts
• Your territory: src/components/landing/**, src/hooks/landing/**, landing pages

── SPRINT HEALTH ──
Sprint: ${sprintPct}% complete (${metrics.completed}/${metrics.total} tasks)

Source: Auto-published to Supabase at EOD by Sprint Tracker. Data is live — no PO copy-paste needed.`;
  }, [currentDay, nextDay, nextTheme, lovableNextDay, completedToday, sprintPct, metrics, getTaskStatus]);

  // ── Publish to Supabase ───────────────────────────────────────────────────
  const handlePublish = useCallback(async () => {
    setPublishing(true);
    setPublishError(null);

    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      const briefData = {
        day: currentDay,
        nextDay,
        generatedAt: new Date().toISOString(),
        fullBrief,
        claudePrompt,
        lovablePrompt,
        sprintPct,
        completedToday: completedToday.length,
        totalToday: todayTasks.length,
        pendingHandoffs: pendingHandoffs.length,
      };

      // Upsert to Supabase — one row per day
      const { error } = await (supabase as any)
        .from('universal_save_sessions')
        .upsert({
          user_id: userId,
          session_type: 'sprint_eod_brief',
          channel_type: EOD_CHANNEL_TYPE,
          current_step: `${EOD_STEP_PREFIX}${currentDay}`,
          form_data: briefData,
          progress_percentage: sprintPct,
          metadata: {
            day: currentDay,
            nextDay,
            generatedAt: briefData.generatedAt,
            sprintId: 'genie-sprint-feb17-21-2026',
          },
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'current_step,channel_type',
          ignoreDuplicates: false,
        });

      if (error) {
        // Fallback: try insert if upsert fails
        const { error: insertError } = await (supabase as any)
          .from('universal_save_sessions')
          .insert({
            user_id: userId,
            session_type: 'sprint_eod_brief',
            channel_type: EOD_CHANNEL_TYPE,
            current_step: `${EOD_STEP_PREFIX}${currentDay}`,
            form_data: briefData,
            progress_percentage: sprintPct,
            metadata: {
              day: currentDay,
              nextDay,
              generatedAt: briefData.generatedAt,
            },
            updated_at: new Date().toISOString(),
          });

        if (insertError) throw new Error(insertError.message);
      }

      setPublishedAt(new Date().toLocaleTimeString());
    } catch (e: any) {
      setPublishError(e.message ?? 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  }, [currentDay, nextDay, fullBrief, claudePrompt, lovablePrompt, sprintPct, completedToday, todayTasks, pendingHandoffs]);

  // ── Copy helper ──────────────────────────────────────────────────────────
  const copyToClipboard = useCallback(async (text: string, type: 'claude' | 'lovable' | 'full') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  // ── Section toggle ────────────────────────────────────────────────────────
  const toggleSection = (s: 'brief' | 'claude' | 'lovable') =>
    setExpandSection(prev => prev === s ? null : s);

  return (
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Rocket className="w-5 h-5 text-blue-600" />
            EOD Auto-Handoff
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Day {currentDay} → Day {nextDay} transition brief. Published to Supabase — no PO copy-paste needed.
          </p>
        </div>

        {publishedAt && (
          <Badge className="bg-green-100 text-green-800 border-green-300 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Published at {publishedAt}
          </Badge>
        )}
      </div>

      {/* ── Status overview ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl border bg-card text-center">
          <p className={cn('text-2xl font-black', dayCompletePct >= 80 ? 'text-green-600' : 'text-amber-600')}>
            {dayCompletePct}%
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Day {currentDay} done</p>
          <p className="text-[10px] text-muted-foreground">{completedToday.length}/{todayTasks.length} tasks</p>
        </div>

        <div className="p-3 rounded-xl border bg-card text-center">
          <p className="text-2xl font-black text-blue-600">{sprintPct}%</p>
          <p className="text-xs text-muted-foreground mt-0.5">Sprint total</p>
          <p className="text-[10px] text-muted-foreground">{metrics.completed}/{metrics.total} tasks</p>
        </div>

        <div className="p-3 rounded-xl border bg-card text-center">
          <p className={cn('text-2xl font-black', pendingToday.length === 0 ? 'text-green-600' : 'text-amber-600')}>
            {pendingToday.length}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Carry-forward</p>
          <p className="text-[10px] text-muted-foreground">tasks → backlog</p>
        </div>

        <div className="p-3 rounded-xl border bg-card text-center">
          <p className={cn('text-2xl font-black', pendingHandoffs.length === 0 ? 'text-green-600' : 'text-red-600')}>
            {pendingHandoffs.length}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Pending handoffs</p>
          <p className="text-[10px] text-muted-foreground">blocking Day {nextDay}</p>
        </div>
      </div>

      {/* ── Readiness check ─────────────────────────────────────────────────── */}
      <Card className={cn('border-2', isReadyToClose ? 'border-green-200' : 'border-amber-200')}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {isReadyToClose
              ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              : <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
            <div className="flex-1">
              <p className={cn('font-semibold text-sm', isReadyToClose ? 'text-green-800' : 'text-amber-800')}>
                {isReadyToClose
                  ? `Day ${currentDay} is ready to close (${dayCompletePct}% complete)`
                  : `Day ${currentDay} has ${pendingToday.length} incomplete tasks — consider carrying forward`}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {pendingHandoffs.length > 0
                  ? `⚠️ ${pendingHandoffs.length} pending handoff${pendingHandoffs.length > 1 ? 's' : ''} will block Day ${nextDay} tasks.`
                  : `All handoffs resolved. Day ${nextDay} can start cleanly.`}
              </p>
            </div>

            {/* Publish button */}
            <div className="flex flex-col gap-2 shrink-0">
              <Button
                onClick={handlePublish}
                disabled={publishing}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {publishing
                  ? <><RefreshCw className="w-4 h-4 animate-spin" /> Publishing…</>
                  : <><Send className="w-4 h-4" /> Close Day & Publish</>}
              </Button>
              {publishError && (
                <p className="text-[10px] text-red-600">{publishError}</p>
              )}
              {publishedAt && (
                <p className="text-[10px] text-green-600 text-center">✓ Both AIs will see this</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Day N+1 preview ──────────────────────────────────────────────────── */}
      {nextDay <= 5 && (
        <Card className="border border-blue-200">
          <CardHeader className="py-3 px-4 bg-blue-50/60 border-b border-blue-100">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
              <Calendar className="w-4 h-4" />
              Day {nextDay} Preview — {nextTheme}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Claude */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-violet-700 uppercase tracking-wide flex items-center gap-1">
                  <Brain className="w-3 h-3" /> Claude ({claudeNextDay.length} tasks)
                </p>
                {claudeNextDay.map(t => (
                  <div key={t.id} className="flex items-start gap-2 text-xs">
                    <span className="font-mono text-[10px] text-muted-foreground w-11 shrink-0 mt-0.5">{t.id}</span>
                    <div>
                      <p className="font-medium">{t.title}</p>
                      <p className="text-[10px] text-muted-foreground">{fmt(t.estimatedHours)} est. · {t.priority}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lovable */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-pink-700 uppercase tracking-wide flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Lovable ({lovableNextDay.length} tasks)
                </p>
                {lovableNextDay.map(t => (
                  <div key={t.id} className="flex items-start gap-2 text-xs">
                    <span className="font-mono text-[10px] text-muted-foreground w-11 shrink-0 mt-0.5">{t.id}</span>
                    <div>
                      <p className="font-medium">{t.title}</p>
                      <p className="text-[10px] text-muted-foreground">{fmt(t.estimatedHours)} est. · {t.priority}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Generated prompts ────────────────────────────────────────────────── */}
      <div className="space-y-3">

        {/* Full brief */}
        <Card>
          <CardHeader
            className="py-3 px-4 cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => toggleSection('brief')}
          >
            <CardTitle className="text-sm flex items-center gap-2">
              {expandSection === 'brief' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <FileText className="w-4 h-4 text-muted-foreground" />
              Full EOD Brief (auto-generated)
              <Button
                variant="ghost" size="sm"
                className="ml-auto h-7 px-2 text-[10px] gap-1"
                onClick={e => { e.stopPropagation(); copyToClipboard(fullBrief, 'full'); }}
              >
                <Copy className="w-3 h-3" />
                {copied === 'full' ? 'Copied!' : 'Copy'}
              </Button>
            </CardTitle>
          </CardHeader>
          {expandSection === 'brief' && (
            <CardContent className="p-0">
              <ScrollArea className="h-64">
                <pre className="p-4 text-[10px] font-mono leading-relaxed whitespace-pre-wrap text-foreground">
                  {fullBrief}
                </pre>
              </ScrollArea>
            </CardContent>
          )}
        </Card>

        {/* Claude prompt */}
        <Card className="border-violet-200">
          <CardHeader
            className="py-3 px-4 bg-violet-50/60 border-b border-violet-100 cursor-pointer hover:bg-violet-50 transition-colors"
            onClick={() => toggleSection('claude')}
          >
            <CardTitle className="text-sm flex items-center gap-2 text-violet-800">
              {expandSection === 'claude' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <Brain className="w-4 h-4" />
              Claude Kickstart Prompt (Day {nextDay})
              <Badge className="bg-violet-100 text-violet-700 text-[10px] border-violet-200 ml-1">Auto-ready</Badge>
              <Button
                variant="ghost" size="sm"
                className="ml-auto h-7 px-2 text-[10px] gap-1"
                onClick={e => { e.stopPropagation(); copyToClipboard(claudePrompt, 'claude'); }}
              >
                <Copy className="w-3 h-3" />
                {copied === 'claude' ? 'Copied!' : 'Copy for Claude'}
              </Button>
            </CardTitle>
          </CardHeader>
          {expandSection === 'claude' && (
            <CardContent className="p-0">
              <ScrollArea className="h-64">
                <pre className="p-4 text-[10px] font-mono leading-relaxed whitespace-pre-wrap text-foreground">
                  {claudePrompt}
                </pre>
              </ScrollArea>
            </CardContent>
          )}
        </Card>

        {/* Lovable prompt */}
        <Card className="border-pink-200">
          <CardHeader
            className="py-3 px-4 bg-pink-50/60 border-b border-pink-100 cursor-pointer hover:bg-pink-50 transition-colors"
            onClick={() => toggleSection('lovable')}
          >
            <CardTitle className="text-sm flex items-center gap-2 text-pink-800">
              {expandSection === 'lovable' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <Zap className="w-4 h-4" />
              Lovable Kickstart Prompt (Day {nextDay})
              <Badge className="bg-pink-100 text-pink-700 text-[10px] border-pink-200 ml-1">Auto-ready</Badge>
              <Button
                variant="ghost" size="sm"
                className="ml-auto h-7 px-2 text-[10px] gap-1"
                onClick={e => { e.stopPropagation(); copyToClipboard(lovablePrompt, 'lovable'); }}
              >
                <Copy className="w-3 h-3" />
                {copied === 'lovable' ? 'Copied!' : 'Copy for Lovable'}
              </Button>
            </CardTitle>
          </CardHeader>
          {expandSection === 'lovable' && (
            <CardContent className="p-0">
              <ScrollArea className="h-64">
                <pre className="p-4 text-[10px] font-mono leading-relaxed whitespace-pre-wrap text-foreground">
                  {lovablePrompt}
                </pre>
              </ScrollArea>
            </CardContent>
          )}
        </Card>
      </div>

      {/* ── How this works ───────────────────────────────────────────────────── */}
      <Card className="border border-blue-100 bg-blue-50/40">
        <CardContent className="p-4">
          <p className="text-[11px] font-bold text-blue-800 mb-2">
            ⚙️ How Automated EOD Works — Zero PO Copy-Paste
          </p>
          <div className="space-y-1.5">
            {[
              ['1. PO clicks "Close Day & Publish"', 'Brief auto-generated from live sprint data and saved to Supabase'],
              ['2. Both AIs call forceRefresh() at session start', 'Supabase returns the latest EOD brief automatically'],
              ['3. Claude/Lovable see their personalised kickstart prompt', 'Tasks, handoffs, blockers all pre-loaded — no manual reading needed'],
              ['4. Metrics flow from data-tasks.ts effort logging', 'Log actualHours + tokensUsed → all panels update instantly'],
              ['5. Next EOD cycle repeats automatically', 'No manual prompt writing, no copy-paste, no sync lag'],
            ].map(([step, detail]) => (
              <div key={step} className="flex items-start gap-2 text-[10px]">
                <ArrowRight className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                <span><span className="font-semibold text-foreground">{step}</span> — <span className="text-muted-foreground">{detail}</span></span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

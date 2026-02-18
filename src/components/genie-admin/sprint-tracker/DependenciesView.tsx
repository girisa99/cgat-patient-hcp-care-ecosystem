// Sprint Tracker — Handoffs View (compact, scannable)
// Layout: Summary bar + day filter tabs + compact row list (no accordion)
// Each row: status pill | ID | from→to | title | priority | artifact (truncated)

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight, ArrowLeftRight, AlertTriangle, CheckCircle2,
  Clock, Zap, Brain, ChevronDown, ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HANDOFFS } from './data-dependencies';
import { SPRINT_DAYS } from './data-config';
import type { TaskStatus, HandoffStatus, Developer } from './types';

interface DependenciesViewProps {
  currentDay: number;
  getTaskStatus: (id: string) => TaskStatus;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<HandoffStatus, { label: string; cls: string; dot: string }> = {
  pending:      { label: 'Waiting',  cls: 'bg-amber-100 text-amber-800 border-amber-300',  dot: 'bg-amber-500'  },
  ready:        { label: 'Ready',    cls: 'bg-blue-100 text-blue-800 border-blue-300',     dot: 'bg-blue-500'   },
  acknowledged: { label: 'Done',     cls: 'bg-green-100 text-green-800 border-green-300',  dot: 'bg-green-500'  },
  blocked:      { label: 'Blocked',  cls: 'bg-red-100 text-red-800 border-red-300',        dot: 'bg-red-500'    },
};

const PRIORITY_DOT: Record<string, string> = {
  critical: 'bg-red-500',
  high:     'bg-orange-400',
  medium:   'bg-blue-400',
};

function DevBadge({ dev }: { dev: Developer }) {
  const isL = dev === 'lovable';
  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded border',
      isL ? 'bg-pink-50 text-pink-700 border-pink-200' : 'bg-violet-50 text-violet-700 border-violet-200',
    )}>
      {isL ? <Zap className="w-2.5 h-2.5" /> : <Brain className="w-2.5 h-2.5" />}
      {isL ? 'Lovable' : 'Claude'}
    </span>
  );
}

// ─── Single handoff row ───────────────────────────────────────────────────────

function HandoffRow({ h, liveStatus, expanded, onToggle }: {
  h: typeof HANDOFFS[0];
  liveStatus: HandoffStatus;
  expanded: boolean;
  onToggle: () => void;
}) {
  const sc = STATUS_CFG[liveStatus];
  const isPending = liveStatus === 'pending';

  return (
    <div className={cn(
      'rounded-lg border transition-all',
      isPending ? 'border-amber-200 bg-amber-50/30' : 'border-border bg-card',
    )}>
      {/* Main row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/20 transition-colors rounded-lg"
      >
        {/* Status dot */}
        <span className={cn('w-2 h-2 rounded-full shrink-0', sc.dot)} />

        {/* ID */}
        <span className="text-[11px] font-mono text-muted-foreground w-11 shrink-0">{h.id}</span>

        {/* Priority dot */}
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', PRIORITY_DOT[h.priority])} title={h.priority} />

        {/* From → To */}
        <div className="flex items-center gap-1 shrink-0">
          <DevBadge dev={h.from} />
          {h.direction === 'bidirectional'
            ? <ArrowLeftRight className="w-3 h-3 text-muted-foreground" />
            : <ArrowRight className="w-3 h-3 text-muted-foreground" />}
          <DevBadge dev={h.to} />
        </div>

        {/* Title */}
        <span className="flex-1 text-sm font-medium truncate min-w-0">{h.title}</span>

        {/* Status badge */}
        <Badge className={cn('text-[10px] px-2 py-0.5 border font-semibold shrink-0', sc.cls)}>
          {sc.label}
        </Badge>

        {/* Expand chevron */}
        {expanded
          ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-3 space-y-2 border-t border-border/40 pt-3">
          {/* Artifact */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Artifact</p>
            <p className="text-sm bg-muted/40 rounded px-2.5 py-1.5 font-mono text-xs">{h.artifact}</p>
          </div>

          {/* Action note */}
          <div className={cn(
            'rounded px-3 py-2',
            h.to === 'lovable' ? 'bg-pink-50 border border-pink-200' : 'bg-violet-50 border border-violet-200',
          )}>
            <p className={cn(
              'text-[10px] font-semibold uppercase tracking-wide mb-0.5',
              h.to === 'lovable' ? 'text-pink-700' : 'text-violet-700',
            )}>
              {h.to === 'lovable' ? '⚡ Lovable action' : '🧠 Claude action'}
            </p>
            <p className="text-xs leading-relaxed">{h.consumerNotes}</p>
          </div>

          {/* Task links */}
          <div className="flex gap-4 text-[10px] text-muted-foreground">
            <span>Producer: <code className="bg-muted px-1 rounded">{h.producerTaskId}</code></span>
            <span>Consumer: <code className="bg-muted px-1 rounded">{h.consumerTaskId}</code></span>
            <span className="capitalize">Day {h.day} · {h.priority} priority</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export const DependenciesView: React.FC<DependenciesViewProps> = ({ currentDay, getTaskStatus }) => {
  const [dayFilter, setDayFilter] = useState<number | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getLiveStatus = (h: typeof HANDOFFS[0]): HandoffStatus => {
    const producerDone = getTaskStatus(h.producerTaskId) === 'completed';
    if (producerDone) return h.status === 'acknowledged' ? 'acknowledged' : 'ready';
    return 'pending';
  };

  const filtered = dayFilter === 'all' ? HANDOFFS : HANDOFFS.filter(h => h.day === dayFilter);

  const counts = {
    total:   HANDOFFS.length,
    ready:   HANDOFFS.filter(h => getLiveStatus(h) === 'ready').length,
    pending: HANDOFFS.filter(h => getLiveStatus(h) === 'pending').length,
    done:    HANDOFFS.filter(h => getLiveStatus(h) === 'acknowledged').length,
  };

  return (
    <div className="space-y-4">

      {/* ── Summary bar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
          <span className="text-muted-foreground">{counts.total} total</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-blue-700 font-medium">{counts.ready} ready</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-amber-700 font-medium">{counts.pending} waiting</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-green-700 font-medium">{counts.done} done</span>
        </div>

        {/* Blocker callout */}
        {counts.pending > 0 && (
          <div className="ml-auto flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            {counts.pending} handoff{counts.pending > 1 ? 's' : ''} blocking progress
          </div>
        )}
      </div>

      {/* ── Day filter tabs ── */}
      <div className="flex items-center gap-0 border-b overflow-x-auto">
        <button
          onClick={() => setDayFilter('all')}
          className={cn(
            'px-4 py-2 border-b-2 text-xs font-medium transition-all whitespace-nowrap',
            dayFilter === 'all' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          All Days
        </button>
        {SPRINT_DAYS.map(d => {
          const dayHandoffs = HANDOFFS.filter(h => h.day === d.day);
          const dayPending = dayHandoffs.filter(h => getLiveStatus(h) === 'pending').length;
          return (
            <button
              key={d.day}
              onClick={() => setDayFilter(d.day)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 border-b-2 text-xs font-medium transition-all whitespace-nowrap',
                dayFilter === d.day ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
                d.day === currentDay && dayFilter !== d.day && 'text-foreground',
              )}
            >
              Day {d.day}
              {dayPending > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">{dayPending}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Handoff rows ── */}
      <div className="space-y-1.5">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 gap-2 text-muted-foreground">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
            <p className="text-sm">No handoffs for this day.</p>
          </div>
        )}
        {filtered.map(h => (
          <HandoffRow
            key={h.id}
            h={h}
            liveStatus={getLiveStatus(h)}
            expanded={expandedId === h.id}
            onToggle={() => setExpandedId(prev => prev === h.id ? null : h.id)}
          />
        ))}
      </div>
    </div>
  );
};

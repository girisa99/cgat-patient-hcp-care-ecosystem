// Sprint Tracker — Dependencies & Handoffs View — UX Polished
// - Large colored status badges (prominent at a glance)
// - Direction arrows (Claude → Lovable, Lovable → Claude)
// - "My handoffs" filter + All/Pending/Ready
// - Consumer notes prominently displayed

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  ArrowRight, ArrowLeftRight, AlertTriangle, CheckCircle2,
  Clock, Zap, Brain, Link2, GitBranch, Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HANDOFFS, DEPENDENCY_CHAINS } from './data-dependencies';
import { SPRINT_TASKS } from './data-tasks';
import { SPRINT_DAYS } from './data-config';
import type { TaskStatus, HandoffStatus, Developer } from './types';

interface DependenciesViewProps {
  currentDay: number;
  getTaskStatus: (id: string) => TaskStatus;
}

// Large status badge configs
const HANDOFF_STATUS: Record<HandoffStatus, { label: string; cls: string; iconCls: string; icon: React.ElementType }> = {
  pending:      { label: 'Waiting',      cls: 'bg-amber-100 text-amber-800 border border-amber-300', iconCls: 'text-amber-600', icon: Clock },
  ready:        { label: 'Ready ✓',      cls: 'bg-blue-100 text-blue-800 border border-blue-300',   iconCls: 'text-blue-600',   icon: ArrowRight },
  acknowledged: { label: 'Acknowledged', cls: 'bg-green-100 text-green-800 border border-green-300', iconCls: 'text-green-600', icon: CheckCircle2 },
  blocked:      { label: 'BLOCKED',      cls: 'bg-red-100 text-red-800 border border-red-300',       iconCls: 'text-red-600',    icon: AlertTriangle },
};

const PRIORITY_CLS: Record<string, string> = {
  critical: 'bg-red-500 text-white',
  high:     'bg-orange-500 text-white',
  medium:   'bg-blue-100 text-blue-800',
};

function DevChip({ dev }: { dev: Developer }) {
  const isLovable = dev === 'lovable';
  return (
    <Badge className={cn(
      'text-xs gap-1 px-2 py-0.5',
      isLovable ? 'bg-pink-100 text-pink-700 border border-pink-300' : 'bg-purple-100 text-purple-700 border border-purple-300',
    )}>
      {isLovable ? <><Zap className="w-3 h-3" />Lovable</> : <><Brain className="w-3 h-3" />Claude</>}
    </Badge>
  );
}

type StatusFilter = 'all' | 'pending' | 'ready' | 'mine';

export const DependenciesView: React.FC<DependenciesViewProps> = ({ currentDay, getTaskStatus }) => {
  const [dayFilter, setDayFilter] = useState<number | 'all'>(currentDay);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const taskMap = Object.fromEntries(SPRINT_TASKS.map(t => [t.id, t]));

  const getHandoffLiveStatus = (h: typeof HANDOFFS[0]): HandoffStatus => {
    const producerStatus = getTaskStatus(h.producerTaskId);
    if (producerStatus === 'completed') return h.status === 'acknowledged' ? 'acknowledged' : 'ready';
    return 'pending';
  };

  // Blocked tasks
  const blockedTasks = DEPENDENCY_CHAINS.filter(chain => {
    const task = taskMap[chain.taskId];
    if (!task) return false;
    if (getTaskStatus(chain.taskId) === 'completed') return false;
    return chain.blockedBy.some(depId => {
      if (depId.startsWith('H-')) {
        const handoff = HANDOFFS.find(h => h.id === depId);
        if (!handoff) return false;
        const ls = getHandoffLiveStatus(handoff);
        return ls !== 'acknowledged' && ls !== 'ready';
      }
      return getTaskStatus(depId) !== 'completed';
    });
  });

  // Filtering
  let filteredHandoffs = dayFilter === 'all'
    ? HANDOFFS
    : HANDOFFS.filter(h => h.day === dayFilter);

  if (statusFilter === 'pending') {
    filteredHandoffs = filteredHandoffs.filter(h => getHandoffLiveStatus(h) === 'pending');
  } else if (statusFilter === 'ready') {
    filteredHandoffs = filteredHandoffs.filter(h => ['ready', 'acknowledged'].includes(getHandoffLiveStatus(h)));
  } else if (statusFilter === 'mine') {
    filteredHandoffs = filteredHandoffs.filter(h => h.to === 'lovable');
  }

  const readyCount = HANDOFFS.filter(h => getHandoffLiveStatus(h) === 'ready').length;
  const pendingCount = HANDOFFS.filter(h => getHandoffLiveStatus(h) === 'pending').length;
  const ackedCount = HANDOFFS.filter(h => getHandoffLiveStatus(h) === 'acknowledged').length;

  const STATUS_FILTER_OPTS: { key: StatusFilter; label: string }[] = [
    { key: 'all',     label: 'All' },
    { key: 'mine',    label: '⚡ My Handoffs (→ Lovable)' },
    { key: 'pending', label: '⏳ Waiting' },
    { key: 'ready',   label: '✓ Ready' },
  ];

  return (
    <div className="space-y-5">
      {/* ── Active blocker alert ── */}
      {blockedTasks.length > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span className="font-semibold text-red-800">
                {blockedTasks.length} task{blockedTasks.length > 1 ? 's' : ''} currently blocked
              </span>
            </div>
            <div className="space-y-2">
              {blockedTasks.map(chain => {
                const task = taskMap[chain.taskId];
                if (!task) return null;
                const unmetDeps = chain.blockedBy.filter(depId =>
                  depId.startsWith('H-') ? true : getTaskStatus(depId) !== 'completed'
                );
                return (
                  <div key={chain.taskId} className="flex items-start gap-2 text-sm flex-wrap">
                    <Badge variant="outline" className="font-mono text-xs shrink-0">{chain.taskId}</Badge>
                    <DevChip dev={task.developer} />
                    <span className="flex-1 min-w-0">{task.title}</span>
                    <div className="flex items-center gap-1 flex-wrap shrink-0">
                      <span className="text-red-600 text-xs font-medium">blocked by:</span>
                      {unmetDeps.map(dep => (
                        <Badge key={dep} variant="outline" className="font-mono text-xs text-red-600 border-red-300">{dep}</Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Summary stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{HANDOFFS.length}</p>
            <p className="text-xs text-muted-foreground">Total Handoffs</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{readyCount}</p>
            <p className="text-xs text-blue-600 font-medium">Ready / Acknowledged</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
            <p className="text-xs text-amber-600 font-medium">Waiting on Claude</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{ackedCount}</p>
            <p className="text-xs text-green-600 font-medium">Acknowledged</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Filters row ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Status filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {STATUS_FILTER_OPTS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setStatusFilter(opt.key)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                statusFilter === opt.key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Day filter */}
        <div className="flex gap-2 flex-wrap ml-auto">
          <button
            onClick={() => setDayFilter('all')}
            className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
              dayFilter === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80')}
          >
            All Days
          </button>
          {SPRINT_DAYS.map(d => (
            <button key={d.day} onClick={() => setDayFilter(d.day)}
              className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                dayFilter === d.day ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80',
                d.day === currentDay && dayFilter !== d.day && 'ring-2 ring-primary/30')}
            >
              Day {d.day}
            </button>
          ))}
        </div>
      </div>

      {/* ── Handoff cards ── */}
      {filteredHandoffs.length === 0 && (
        <p className="text-center text-muted-foreground py-10">No handoffs match this filter.</p>
      )}

      <Accordion
        type="multiple"
        defaultValue={filteredHandoffs.filter(h => h.priority === 'critical').map(h => h.id)}
        className="space-y-2"
      >
        {filteredHandoffs.map(h => {
          const liveStatus = getHandoffLiveStatus(h);
          const statusCfg = HANDOFF_STATUS[liveStatus];
          const StatusIcon = statusCfg.icon;
          const isForLovable = h.to === 'lovable';

          return (
            <AccordionItem
              key={h.id}
              value={h.id}
              className={cn(
                'border rounded-xl mb-2 overflow-hidden',
                liveStatus === 'pending' && isForLovable && 'border-amber-300',
                liveStatus === 'ready' && 'border-blue-300',
                liveStatus === 'acknowledged' && 'border-green-300',
                liveStatus === 'blocked' && 'border-red-300',
              )}
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
                <div className="flex items-center gap-3 flex-1 flex-wrap min-w-0">
                  {/* Handoff ID */}
                  <span className="text-[11px] font-mono font-bold text-muted-foreground shrink-0">{h.id}</span>

                  {/* Direction: FROM → TO */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <DevChip dev={h.from} />
                    {h.direction === 'bidirectional'
                      ? <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
                      : <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                    <DevChip dev={h.to} />
                  </div>

                  {/* Title */}
                  <span className="text-sm font-medium flex-1 text-left min-w-0 truncate">{h.title}</span>

                  {/* Priority + large status badge */}
                  <div className="flex gap-2 shrink-0 items-center">
                    <Badge className={cn('text-xs', PRIORITY_CLS[h.priority])}>{h.priority}</Badge>
                    {/* Large status badge */}
                    <Badge className={cn('text-xs gap-1.5 px-2.5 py-1 font-semibold', statusCfg.cls)}>
                      <StatusIcon className={cn('w-3.5 h-3.5', statusCfg.iconCls)} />
                      {statusCfg.label}
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-4 space-y-3">
                {/* Artifact + Consumer Notes (prominent) */}
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Artifact</p>
                    <p className="bg-muted/50 p-2.5 rounded-lg border border-border/40">{h.artifact}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      {isForLovable ? '⚡ What Lovable needs to do' : '🧠 What Claude needs to do'}
                    </p>
                    <p className={cn(
                      'p-2.5 rounded-lg border font-medium',
                      isForLovable
                        ? 'bg-pink-50 border-pink-200 text-pink-900'
                        : 'bg-purple-50 border-purple-200 text-purple-900',
                    )}>
                      {h.consumerNotes}
                    </p>
                  </div>
                </div>

                {/* Producer / Consumer task links */}
                <div className="flex items-center gap-4 text-xs flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Producer:</span>
                    <Badge variant="outline" className="font-mono text-[10px]">{h.producerTaskId}</Badge>
                    <span className={cn('font-semibold',
                      getTaskStatus(h.producerTaskId) === 'completed' ? 'text-green-600' : 'text-amber-600',
                    )}>
                      ({getTaskStatus(h.producerTaskId)})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Consumer:</span>
                    <Badge variant="outline" className="font-mono text-[10px]">{h.consumerTaskId}</Badge>
                    <span className={cn('font-semibold',
                      getTaskStatus(h.consumerTaskId) === 'completed' ? 'text-green-600' : 'text-amber-600',
                    )}>
                      ({getTaskStatus(h.consumerTaskId)})
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

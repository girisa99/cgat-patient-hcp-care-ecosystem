// Sprint Tracker — Dependencies & Handoffs View
// Shows cross-functional handoffs, dependency chains, and blocker alerts

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  ArrowRight, ArrowLeftRight, AlertTriangle, CheckCircle2,
  Clock, Zap, Brain, Link2, GitBranch,
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

const HANDOFF_STATUS_STYLE: Record<HandoffStatus, { label: string; cls: string; icon: React.ElementType }> = {
  pending: { label: 'Waiting', cls: 'bg-gray-100 text-gray-700', icon: Clock },
  ready: { label: 'Ready', cls: 'bg-blue-100 text-blue-700', icon: ArrowRight },
  acknowledged: { label: 'Acknowledged', cls: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  blocked: { label: 'Blocked', cls: 'bg-red-100 text-red-700', icon: AlertTriangle },
};

const DEV_BADGE = (dev: Developer) => (
  <Badge className={cn('text-xs', dev === 'lovable' ? 'bg-pink-100 text-pink-700' : 'bg-purple-100 text-purple-700')}>
    {dev === 'lovable' ? <><Zap className="w-3 h-3 mr-1" />Lovable</> : <><Brain className="w-3 h-3 mr-1" />Claude</>}
  </Badge>
);

export const DependenciesView: React.FC<DependenciesViewProps> = ({ currentDay, getTaskStatus }) => {
  const [dayFilter, setDayFilter] = useState<number | 'all'>(currentDay);
  const taskMap = Object.fromEntries(SPRINT_TASKS.map(t => [t.id, t]));

  // Compute live handoff status based on task completion
  const getHandoffLiveStatus = (h: typeof HANDOFFS[0]): HandoffStatus => {
    const producerStatus = getTaskStatus(h.producerTaskId);
    if (producerStatus === 'completed') return h.status === 'acknowledged' ? 'acknowledged' : 'ready';
    if (producerStatus === 'in-progress') return 'pending';
    return 'pending';
  };

  // Find blockers: tasks whose dependencies aren't met
  const blockedTasks = DEPENDENCY_CHAINS.filter(chain => {
    const task = taskMap[chain.taskId];
    if (!task) return false;
    const taskStatus = getTaskStatus(chain.taskId);
    if (taskStatus === 'completed') return false;
    return chain.blockedBy.some(depId => {
      // If dependency is a handoff (H-xxx), check handoff status
      if (depId.startsWith('H-')) {
        const handoff = HANDOFFS.find(h => h.id === depId);
        return handoff ? getHandoffLiveStatus(handoff) !== 'acknowledged' && getHandoffLiveStatus(handoff) !== 'ready' : false;
      }
      return getTaskStatus(depId) !== 'completed';
    });
  });

  const filteredHandoffs = dayFilter === 'all'
    ? HANDOFFS
    : HANDOFFS.filter(h => h.day === dayFilter);

  // Summary counts
  const readyCount = HANDOFFS.filter(h => getHandoffLiveStatus(h) === 'ready').length;
  const pendingCount = HANDOFFS.filter(h => getHandoffLiveStatus(h) === 'pending').length;
  const ackedCount = HANDOFFS.filter(h => getHandoffLiveStatus(h) === 'acknowledged').length;

  return (
    <div className="space-y-6">
      {/* ── Alert banner for active blockers ── */}
      {blockedTasks.length > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-800">{blockedTasks.length} tasks currently blocked by unmet dependencies</span>
            </div>
            <div className="space-y-2">
              {blockedTasks.map(chain => {
                const task = taskMap[chain.taskId];
                if (!task) return null;
                const unmetDeps = chain.blockedBy.filter(depId => {
                  if (depId.startsWith('H-')) return true;
                  return getTaskStatus(depId) !== 'completed';
                });
                return (
                  <div key={chain.taskId} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="font-mono text-xs">{chain.taskId}</Badge>
                    {DEV_BADGE(task.developer)}
                    <span className="truncate">{task.title}</span>
                    <span className="text-red-600 shrink-0">blocked by: {unmetDeps.join(', ')}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{HANDOFFS.length}</p>
          <p className="text-sm text-muted-foreground">Total Handoffs</p>
        </CardContent></Card>
        <Card className="bg-blue-50"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{readyCount}</p>
          <p className="text-sm text-blue-600">Ready for Pickup</p>
        </CardContent></Card>
        <Card className="bg-amber-50"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
          <p className="text-sm text-amber-600">Waiting on Producer</p>
        </CardContent></Card>
        <Card className="bg-green-50"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{ackedCount}</p>
          <p className="text-sm text-green-600">Acknowledged</p>
        </CardContent></Card>
      </div>

      {/* ── Day filter ── */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setDayFilter('all')}
          className={cn('px-3 py-1.5 rounded-full text-sm font-medium transition-all',
            dayFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
          All Days
        </button>
        {SPRINT_DAYS.map(d => (
          <button key={d.day} onClick={() => setDayFilter(d.day)}
            className={cn('px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              dayFilter === d.day ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80',
              d.day === currentDay && dayFilter !== d.day && 'ring-2 ring-primary/30')}>
            Day {d.day}
          </button>
        ))}
      </div>

      {/* ── Handoff cards ── */}
      <Accordion type="multiple" defaultValue={filteredHandoffs.filter(h => h.priority === 'critical').map(h => h.id)}>
        {filteredHandoffs.map(h => {
          const liveStatus = getHandoffLiveStatus(h);
          const statusStyle = HANDOFF_STATUS_STYLE[liveStatus];
          const StatusIcon = statusStyle.icon;

          return (
            <AccordionItem key={h.id} value={h.id} className="border rounded-lg mb-3">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3 flex-1 flex-wrap">
                  {/* Direction arrow */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {DEV_BADGE(h.from)}
                    {h.direction === 'bidirectional'
                      ? <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
                      : <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    }
                    {DEV_BADGE(h.to)}
                  </div>
                  {/* Title */}
                  <span className="text-sm font-medium flex-1 text-left">{h.title}</span>
                  {/* Status + Priority */}
                  <div className="flex gap-2 shrink-0">
                    <Badge className={cn('text-xs',
                      h.priority === 'critical' ? 'bg-red-500 text-white' :
                      h.priority === 'high' ? 'bg-orange-500 text-white' :
                      'bg-blue-100 text-blue-800')}>{h.priority}</Badge>
                    <Badge className={cn('text-xs gap-1', statusStyle.cls)}>
                      <StatusIcon className="w-3 h-3" />{statusStyle.label}
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-3">
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">Artifact</p>
                    <p className="bg-muted/50 p-2 rounded">{h.artifact}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">Consumer Notes</p>
                    <p className="bg-muted/50 p-2 rounded">{h.consumerNotes}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Producer:</span>
                    <Badge variant="outline" className="font-mono text-xs">{h.producerTaskId}</Badge>
                    <span className={cn('text-xs font-medium',
                      getTaskStatus(h.producerTaskId) === 'completed' ? 'text-green-600' : 'text-amber-600',
                    )}>
                      ({getTaskStatus(h.producerTaskId)})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Consumer:</span>
                    <Badge variant="outline" className="font-mono text-xs">{h.consumerTaskId}</Badge>
                    <span className={cn('text-xs font-medium',
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

      {filteredHandoffs.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No handoffs for this day.</p>
      )}
    </div>
  );
};

// Sprint Tracker — Board View (Kanban: Backlog | To Do | In Progress | Done)
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, ListChecks, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskCard } from './TaskCard';
import { SPRINT_TASKS } from './data-tasks';
import { DAY1_FINDINGS } from './data-findings';
import { HANDOFFS, DEPENDENCY_CHAINS } from './data-dependencies';
import type { TaskStatus, Developer } from './types';

// Resolve live handoff status from task-completion state
function isHandoffReady(handoffId: string, getTaskStatus: (id: string) => TaskStatus): boolean {
  const h = HANDOFFS.find(x => x.id === handoffId);
  if (!h) return false;
  // Hard-coded ready handoffs (Claude confirmed) OR producer task completed
  if (h.status === 'ready') return true;
  return getTaskStatus(h.producerTaskId) === 'completed';
}

// Returns list of unmet dependency IDs for a task
function getUnmetDeps(taskId: string, getTaskStatus: (id: string) => TaskStatus): string[] {
  const chain = DEPENDENCY_CHAINS.find(c => c.taskId === taskId);
  if (!chain) return [];
  return chain.blockedBy.filter(depId => {
    if (depId.startsWith('H-')) return !isHandoffReady(depId, getTaskStatus);
    return getTaskStatus(depId) !== 'completed';
  });
}

interface BoardViewProps {
  boardColumns: { backlog: string[]; todo: string[]; inProgress: string[]; done: string[] };
  getTaskStatus: (id: string) => TaskStatus;
  onStatusChange: (id: string, status: TaskStatus) => void;
  taskOverrides: Record<string, { status: TaskStatus; note?: string }>;
  taskNotes: Record<string, string[]>;
}

const COLUMNS = [
  { key: 'backlog' as const, title: 'Backlog', icon: AlertTriangle, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { key: 'todo' as const, title: 'To Do', icon: ListChecks, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
  { key: 'inProgress' as const, title: 'In Progress', icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { key: 'done' as const, title: 'Done', icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
];

export const BoardView: React.FC<BoardViewProps> = ({
  boardColumns, getTaskStatus, onStatusChange, taskOverrides, taskNotes,
}) => {
  const [devFilter, setDevFilter] = useState<Developer | 'all'>('all');
  const taskMap = Object.fromEntries(SPRINT_TASKS.map(t => [t.id, t]));

  const filterByDev = (ids: string[]) =>
    devFilter === 'all' ? ids : ids.filter(id => taskMap[id]?.developer === devFilter);

  return (
    <div className="space-y-4">
      {/* Developer filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Filter:</span>
        <div className="flex gap-2">
          {(['all', 'claude', 'lovable'] as const).map(f => {
            const activeClass = f === 'claude'
              ? 'bg-purple-100 text-purple-700 border-purple-300 shadow-sm'
              : f === 'lovable'
              ? 'bg-pink-100 text-pink-700 border-pink-300 shadow-sm'
              : 'bg-primary text-primary-foreground border-primary shadow-sm';
            return (
            <button key={f} onClick={() => setDevFilter(f)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all border',
                devFilter === f ? activeClass : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80',
              )}>
              {f === 'all' ? 'All Tasks' : f === 'claude' ? 'Claude' : 'Lovable'}
            </button>
            );
          })}
        </div>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map(col => {
          const ids = filterByDev(boardColumns[col.key]);
          const Icon = col.icon;
          return (
            <Card key={col.key} className={cn('border-t-4', col.borderColor)}>
              <CardHeader className={cn('py-3 px-4', col.bgColor)}>
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className={cn('flex items-center gap-2', col.color)}>
                    <Icon className="w-4 h-4" />
                    {col.title}
                  </span>
                  <Badge variant="outline" className="text-xs font-bold">{ids.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <ScrollArea className={ids.length > 3 ? 'h-[480px]' : ''}>
                  <div className="space-y-2 p-1">
                    {ids.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">No tasks</p>
                    )}
                    {ids.map(id => {
                      const task = taskMap[id];
                      if (!task) return null;
                      const unmetDeps = getUnmetDeps(id, getTaskStatus);
                      return (
                        <TaskCard
                          key={id}
                          task={task}
                          status={getTaskStatus(id)}
                          findings={DAY1_FINDINGS[id]}
                          overrideNote={taskOverrides[id]?.note}
                          taskNotes={taskNotes[id]}
                          onStatusChange={onStatusChange}
                          compact={col.key === 'done'}
                          blockedBy={unmetDeps.length > 0 ? unmetDeps : undefined}
                        />
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

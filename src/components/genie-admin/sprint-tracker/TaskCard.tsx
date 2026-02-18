// Sprint Tracker — TaskCard Component (expandable task with findings)
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, Clock, XCircle, FileCode, AlertTriangle, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SprintTask, TaskStatus, TaskFindings } from './types';

const PRIORITY_STYLES: Record<string, { label: string; cls: string }> = {
  critical: { label: 'Critical', cls: 'bg-red-500 text-white' },
  high: { label: 'High', cls: 'bg-orange-500 text-white' },
  medium: { label: 'Medium', cls: 'bg-blue-100 text-blue-800' },
  low: { label: 'Low', cls: 'bg-gray-100 text-gray-600' },
};

const STATUS_STYLES: Record<TaskStatus, { label: string; cls: string }> = {
  pending: { label: 'To Do', cls: 'bg-gray-100 text-gray-700' },
  'in-progress': { label: 'In Progress', cls: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Done', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Skipped', cls: 'bg-red-100 text-red-700' },
};

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'border-red-300 bg-red-50 text-red-800',
  high: 'border-orange-300 bg-orange-50 text-orange-800',
  medium: 'border-blue-300 bg-blue-50 text-blue-800',
  low: 'border-gray-300 bg-gray-50 text-gray-700',
};

interface TaskCardProps {
  task: SprintTask;
  status: TaskStatus;
  findings?: TaskFindings;
  overrideNote?: string;
  taskNotes?: string[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  compact?: boolean;
  /** List of unmet dependency IDs that gate this task (H-xxx or task IDs) */
  blockedBy?: string[];
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task, status, findings, overrideNote, taskNotes, onStatusChange, compact, blockedBy,
}) => {
  const priority = PRIORITY_STYLES[task.priority];
  const statusStyle = STATUS_STYLES[status];
  const isDone = status === 'completed';
  const hasFindings = findings && findings.findings.length > 0;
  const isGateBlocked = (blockedBy?.length ?? 0) > 0 && !isDone;

  return (
    <Card className={cn(
      'border-l-4 transition-all',
      isGateBlocked && 'border-l-amber-500 bg-amber-50/30 opacity-80',
      !isGateBlocked && status === 'completed' && 'border-l-green-500 bg-green-50/30',
      !isGateBlocked && status === 'in-progress' && 'border-l-blue-500 bg-blue-50/30',
      !isGateBlocked && status === 'pending' && 'border-l-gray-300',
      status === 'rejected' && 'border-l-red-400 opacity-60',
    )}>
      <CardContent className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-mono font-bold text-muted-foreground">{task.id}</span>
            <Badge className={cn('text-xs', priority.cls)}>{priority.label}</Badge>
            <Badge variant="outline" className="text-xs">{task.module}</Badge>
            <Badge className={cn(
              'text-xs',
              task.developer === 'lovable' ? 'bg-pink-100 text-pink-700' : 'bg-purple-100 text-purple-700',
            )}>
              {task.developer === 'lovable' ? 'Lovable' : 'Claude'}
            </Badge>
          </div>
          <Badge className={cn('text-xs shrink-0', statusStyle.cls)}>{statusStyle.label}</Badge>
        </div>

        {/* Title */}
        <p className={cn('text-sm font-medium leading-relaxed', isDone && 'line-through text-muted-foreground')}>
          {task.title}
        </p>

        {/* Quick summary for completed tasks with findings */}
        {isDone && findings && (
          <p className="text-sm text-muted-foreground italic">{findings.summary}</p>
        )}

        {/* Gate-blocked banner */}
        {isGateBlocked && (
          <div className="flex items-start gap-2 p-2 rounded bg-amber-100 border border-amber-300 text-xs text-amber-900">
            <Ban className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-700" />
            <span>
              <span className="font-semibold">WAIT — gate pending:</span>{' '}
              {blockedBy!.join(', ')} must be Ready before starting this task.
            </span>
          </div>
        )}

        {/* Override note */}
        {overrideNote && (
          <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">{overrideNote}</p>
        )}

        {/* Status buttons — disabled when gate-blocked (except Done to allow override) */}
        <div className="flex gap-1.5">
          <Button size="sm" variant={isDone ? 'default' : 'outline'} className="h-8 px-3 text-xs gap-1.5"
            onClick={() => onStatusChange(task.id, isDone ? 'pending' : 'completed')}>
            <CheckCircle2 className="w-4 h-4 text-green-600" /> Done
          </Button>
          <Button size="sm" variant={status === 'in-progress' ? 'default' : 'outline'} className="h-8 px-3 text-xs gap-1.5"
            disabled={isGateBlocked}
            onClick={() => onStatusChange(task.id, status === 'in-progress' ? 'pending' : 'in-progress')}>
            <Clock className="w-4 h-4 text-blue-600" /> WIP
          </Button>
          <Button size="sm" variant={status === 'rejected' ? 'default' : 'outline'} className="h-8 px-3 text-xs gap-1.5"
            onClick={() => onStatusChange(task.id, status === 'rejected' ? 'pending' : 'rejected')}>
            <XCircle className="w-4 h-4 text-red-500" /> Skip
          </Button>
        </div>

        {/* Expandable details + findings */}
        {!compact && (
          <Accordion type="multiple" className="w-full">
            {/* Task details */}
            <AccordionItem value="details" className="border-b-0">
              <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                Task Details
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm">
                <div><span className="font-medium">Acceptance:</span> {task.acceptanceCriteria}</div>
                <div><span className="font-medium">Estimated:</span> {task.estimatedHours}h</div>
                {task.notes && <div className="text-amber-700"><span className="font-medium">Notes:</span> {task.notes}</div>}
                {task.filesInvolved.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {task.filesInvolved.map(f => (
                      <Badge key={f} variant="outline" className="text-xs font-mono">
                        <FileCode className="w-3 h-3 mr-1" />{f.split('/').pop()}
                      </Badge>
                    ))}
                  </div>
                )}
                {findings && <div><span className="font-medium">Next Impact:</span> {findings.dayTwoImpact}</div>}
              </AccordionContent>
            </AccordionItem>

            {/* Findings */}
            {hasFindings && (
              <AccordionItem value="findings" className="border-b-0">
                <AccordionTrigger className="py-2 text-sm font-medium text-purple-700 hover:no-underline">
                  Findings ({findings.findings.length}) — {findings.findings.filter(f => f.status === 'fixed').length} fixed, {findings.findings.filter(f => f.status === 'open').length} open
                </AccordionTrigger>
                <AccordionContent>
                  {/* Severity summary */}
                  <div className="flex gap-2 mb-3 flex-wrap text-xs">
                    {findings.issuesBySeverity.critical > 0 && <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-medium">{findings.issuesBySeverity.critical} Critical</span>}
                    {findings.issuesBySeverity.high > 0 && <span className="px-2 py-1 rounded bg-orange-100 text-orange-700 font-medium">{findings.issuesBySeverity.high} High</span>}
                    {findings.issuesBySeverity.medium > 0 && <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">{findings.issuesBySeverity.medium} Medium</span>}
                    {findings.issuesBySeverity.low > 0 && <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 font-medium">{findings.issuesBySeverity.low} Low</span>}
                  </div>
                  {/* Individual findings */}
                  <div className="space-y-2">
                    {findings.findings.map(f => (
                      <div key={f.id} className={cn('p-3 rounded border text-sm', SEVERITY_STYLES[f.severity])}>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-mono font-bold">{f.id}</span>
                          <span className={cn('text-xs font-semibold uppercase',
                            f.status === 'fixed' ? 'text-green-700' : f.status === 'open' ? 'text-amber-700' : 'text-gray-500',
                          )}>
                            {f.status === 'fixed' ? 'FIXED' : f.status === 'open' ? 'OPEN' : 'DEFERRED'}
                          </span>
                        </div>
                        <p className="font-medium">{f.issue}</p>
                        <p className="opacity-80 mt-1"><span className="font-medium">Root cause:</span> {f.rootCause}</p>
                        <p className="font-mono text-xs opacity-60 mt-1">{f.file}{f.line ? `:${f.line}` : ''}{f.fixedIn ? ` (commit: ${f.fixedIn})` : ''}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Discussion notes */}
            {taskNotes && taskNotes.length > 0 && (
              <AccordionItem value="discussion" className="border-b-0">
                <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                  Discussion ({taskNotes.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1.5">
                    {taskNotes.map((note, i) => (
                      <p key={i} className="text-sm bg-muted/50 p-2 rounded">{note}</p>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

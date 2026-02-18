// Sprint Tracker — TaskCard Component (UX polished)
// - Priority as colored left-border (critical=red, high=orange, medium=yellow, low=gray)
// - Developer color chip with icon
// - Compact mode for Done column
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, Clock, XCircle, FileCode, AlertTriangle, Ban, Zap, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SprintTask, TaskStatus, TaskFindings } from './types';

// Priority → left border color
const PRIORITY_BORDER: Record<string, string> = {
  critical: 'border-l-red-500',
  high:     'border-l-orange-400',
  medium:   'border-l-yellow-400',
  low:      'border-l-gray-300',
};

// Priority → badge style
const PRIORITY_BADGE: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border border-red-300',
  high:     'bg-orange-100 text-orange-700 border border-orange-300',
  medium:   'bg-yellow-50 text-yellow-700 border border-yellow-300',
  low:      'bg-gray-100 text-gray-600 border border-gray-200',
};

const PRIORITY_LABEL: Record<string, string> = {
  critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low',
};

const STATUS_STYLES: Record<TaskStatus, { label: string; cls: string }> = {
  pending:      { label: 'To Do',       cls: 'bg-gray-100 text-gray-700' },
  'in-progress':{ label: 'In Progress', cls: 'bg-blue-100 text-blue-700' },
  completed:    { label: 'Done',        cls: 'bg-green-100 text-green-700' },
  rejected:     { label: 'Skipped',     cls: 'bg-red-100 text-red-700' },
};

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'border-red-300 bg-red-50 text-red-800',
  high:     'border-orange-300 bg-orange-50 text-orange-800',
  medium:   'border-blue-300 bg-blue-50 text-blue-800',
  low:      'border-gray-300 bg-gray-50 text-gray-700',
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
  const statusStyle = STATUS_STYLES[status];
  const isDone = status === 'completed';
  const hasFindings = findings && findings.findings.length > 0;
  const isGateBlocked = (blockedBy?.length ?? 0) > 0 && !isDone;
  const isLovable = task.developer === 'lovable';

  // Background tint based on state
  const bgTint = isGateBlocked
    ? 'bg-amber-50/30'
    : isDone
    ? 'bg-green-50/20'
    : status === 'in-progress'
    ? 'bg-blue-50/20'
    : '';

  return (
    <Card className={cn(
      'border-l-4 transition-all duration-200',
      isGateBlocked ? 'border-l-amber-400' : PRIORITY_BORDER[task.priority],
      bgTint,
      isDone && 'opacity-75',
      status === 'rejected' && 'opacity-50',
    )}>
      <CardContent className={cn('p-3 space-y-2', compact && 'p-2 space-y-1.5')}>

        {/* ── Header row: ID + priority + developer + status ── */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Task ID */}
            <span className="text-[11px] font-mono font-bold text-muted-foreground">{task.id}</span>

            {/* Priority badge */}
            <Badge className={cn('text-[10px] px-1.5 py-0', PRIORITY_BADGE[task.priority])}>
              {PRIORITY_LABEL[task.priority]}
            </Badge>

            {/* Developer chip */}
            <Badge className={cn(
              'text-[10px] px-1.5 py-0 gap-0.5',
              isLovable
                ? 'bg-pink-100 text-pink-700 border border-pink-300'
                : 'bg-purple-100 text-purple-700 border border-purple-300',
            )}>
              {isLovable
                ? <><Zap className="w-2.5 h-2.5" />Lovable</>
                : <><Brain className="w-2.5 h-2.5" />Claude</>}
            </Badge>

            {/* Module */}
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{task.module}</Badge>
          </div>

          {/* Status pill */}
          <Badge className={cn('text-[10px] px-2 shrink-0', statusStyle.cls)}>
            {statusStyle.label}
          </Badge>
        </div>

        {/* ── Title ── */}
        <p className={cn(
          'text-sm font-medium leading-snug',
          isDone && 'line-through text-muted-foreground',
        )}>
          {task.title}
        </p>

        {/* Completed summary */}
        {isDone && findings && (
          <p className="text-xs text-muted-foreground italic">{findings.summary}</p>
        )}

        {/* Gate-blocked banner */}
        {isGateBlocked && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-100 border border-amber-300 text-xs text-amber-900">
            <Ban className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-700" />
            <span>
              <span className="font-bold">GATE PENDING: </span>
              {blockedBy!.join(', ')} must be Ready before starting.
            </span>
          </div>
        )}

        {/* Override note */}
        {overrideNote && (
          <p className="text-xs text-muted-foreground bg-muted/40 p-2 rounded-lg border border-border/40 italic">
            {overrideNote}
          </p>
        )}

        {/* ── Status action buttons ── */}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={isDone ? 'default' : 'outline'}
            className="h-7 px-2 text-[11px] gap-1 flex-1"
            onClick={() => onStatusChange(task.id, isDone ? 'pending' : 'completed')}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Done
          </Button>
          <Button
            size="sm"
            variant={status === 'in-progress' ? 'default' : 'outline'}
            className="h-7 px-2 text-[11px] gap-1 flex-1"
            disabled={isGateBlocked}
            onClick={() => onStatusChange(task.id, status === 'in-progress' ? 'pending' : 'in-progress')}
          >
            <Clock className="w-3.5 h-3.5 text-blue-600" /> WIP
          </Button>
          <Button
            size="sm"
            variant={status === 'rejected' ? 'default' : 'outline'}
            className="h-7 px-2 text-[11px] gap-1"
            onClick={() => onStatusChange(task.id, status === 'rejected' ? 'pending' : 'rejected')}
          >
            <XCircle className="w-3.5 h-3.5 text-red-500" />
          </Button>
        </div>

        {/* ── Expandable details (hidden in compact mode) ── */}
        {!compact && (
          <Accordion type="multiple" className="w-full">
            {/* Task details */}
            <AccordionItem value="details" className="border-b-0">
              <AccordionTrigger className="py-1.5 text-xs font-medium hover:no-underline text-muted-foreground">
                Task Details · {task.estimatedHours}h est.
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-xs">
                <div><span className="font-semibold">Acceptance:</span> {task.acceptanceCriteria}</div>
                {task.notes && (
                  <div className="text-amber-700"><span className="font-semibold">Notes:</span> {task.notes}</div>
                )}
                {task.filesInvolved.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {task.filesInvolved.map(f => (
                      <Badge key={f} variant="outline" className="text-[10px] font-mono">
                        <FileCode className="w-2.5 h-2.5 mr-0.5" />{f.split('/').pop()}
                      </Badge>
                    ))}
                  </div>
                )}
                {findings && (
                  <div className="text-muted-foreground">
                    <span className="font-semibold">Day 2 impact:</span> {findings.dayTwoImpact}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Findings */}
            {hasFindings && (
              <AccordionItem value="findings" className="border-b-0">
                <AccordionTrigger className="py-1.5 text-xs font-medium text-purple-700 hover:no-underline">
                  Findings ({findings.findings.length}) — {findings.findings.filter(f => f.status === 'fixed').length} fixed,{' '}
                  {findings.findings.filter(f => f.status === 'open').length} open
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex gap-1.5 mb-2 flex-wrap text-xs">
                    {findings.issuesBySeverity.critical > 0 && <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">{findings.issuesBySeverity.critical} Crit</span>}
                    {findings.issuesBySeverity.high > 0 && <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 font-medium">{findings.issuesBySeverity.high} High</span>}
                    {findings.issuesBySeverity.medium > 0 && <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">{findings.issuesBySeverity.medium} Med</span>}
                    {findings.issuesBySeverity.low > 0 && <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{findings.issuesBySeverity.low} Low</span>}
                  </div>
                  <div className="space-y-1.5">
                    {findings.findings.map(f => (
                      <div key={f.id} className={cn('p-2 rounded border text-xs', SEVERITY_STYLES[f.severity])}>
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="font-mono font-bold">{f.id}</span>
                          <span className={cn('text-[10px] font-bold uppercase',
                            f.status === 'fixed' ? 'text-green-700' : f.status === 'open' ? 'text-amber-700' : 'text-gray-500',
                          )}>
                            {f.status === 'fixed' ? '✓ FIXED' : f.status === 'open' ? '● OPEN' : 'DEFERRED'}
                          </span>
                        </div>
                        <p className="font-medium">{f.issue}</p>
                        <p className="opacity-75 mt-0.5">Root: {f.rootCause}</p>
                        <p className="font-mono opacity-50 mt-0.5">{f.file}{f.line ? `:${f.line}` : ''}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Discussion notes */}
            {taskNotes && taskNotes.length > 0 && (
              <AccordionItem value="discussion" className="border-b-0">
                <AccordionTrigger className="py-1.5 text-xs font-medium hover:no-underline">
                  Discussion ({taskNotes.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1">
                    {taskNotes.map((note, i) => (
                      <p key={i} className="text-xs bg-muted/50 p-2 rounded">{note}</p>
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

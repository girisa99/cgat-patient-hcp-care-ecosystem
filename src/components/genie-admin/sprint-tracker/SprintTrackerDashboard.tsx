/**
 * SPRINT TRACKER DASHBOARD (Redesigned — Step-by-Step Workflow)
 *
 * Clear sequential flow:
 * 1. Overview: At-a-glance sprint health (always visible header)
 * 2. Board: Kanban view of all tasks
 * 3. Handoffs: Cross-functional dependencies & blockers
 * 4. Findings: Issue diagnosis grouped by product
 * 5. Standups: Daily communication timeline
 * 6. Metrics: Progress tracking & burndown
 * 7. Strategy: File ownership & conflict prevention
 * 8. PO Gate: Product Owner verification checklist
 *
 * State persisted to localStorage via useSprintTracker hook.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Target, LayoutGrid, Bug, MessageSquare, BarChart3, Shield, Link2, ClipboardCheck,
  AlertTriangle, CheckCircle2, Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useSprintTracker } from './useSprintTracker';
import { SPRINT_DAYS, SPRINT_START_DATE, SPRINT_END_DATE } from './data-config';
import { HANDOFFS } from './data-dependencies';
import { BoardView } from './BoardView';
import { DependenciesView } from './DependenciesView';
import { FindingsView } from './FindingsView';
import { StandupsView } from './StandupsView';
import { MetricsView } from './MetricsView';
import { StrategyView } from './StrategyView';
import { POVerificationView } from './POVerificationView';

const WORKFLOW_STEPS = [
  { value: 'board', step: 1, label: 'Board', desc: 'Task status', icon: LayoutGrid, group: 'work' },
  { value: 'deps', step: 2, label: 'Handoffs', desc: 'Dependencies', icon: Link2, group: 'work' },
  { value: 'findings', step: 3, label: 'Findings', desc: 'Issues', icon: Bug, group: 'work' },
  { value: 'standups', step: 4, label: 'Standups', desc: 'Communication', icon: MessageSquare, group: 'work' },
  { value: 'metrics', step: 5, label: 'Metrics', desc: 'Progress', icon: BarChart3, group: 'mgmt' },
  { value: 'strategy', step: 6, label: 'Strategy', desc: 'Governance', icon: Shield, group: 'mgmt' },
  { value: 'po', step: 7, label: 'PO Gate', desc: 'Sign-off', icon: ClipboardCheck, group: 'mgmt' },
] as const;

export const SprintTrackerDashboard: React.FC = () => {
  const {
    state, currentDay, metrics, boardColumns,
    updateTaskStatus, addStandup, getTaskStatus,
  } = useSprintTracker();

  const [selectedDay, setSelectedDay] = useState(currentDay);
  const overallPct = Math.round((metrics.completed / metrics.total) * 100);

  // Quick counts for overview
  const blockedHandoffs = HANDOFFS.filter(h => {
    const st = getTaskStatus(h.producerTaskId);
    return st !== 'completed';
  }).length;

  return (
    <div className="space-y-5">
      {/* ── Sprint Header + Overview ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-xl">Sprint Tracker</CardTitle>
                <CardDescription className="text-sm">
                  Lovable + Claude Code | {SPRINT_START_DATE} to {SPRINT_END_DATE} | Day {currentDay} of 5
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {metrics.backlogCount > 0 && (
                <Badge className="bg-amber-100 text-amber-800 text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {metrics.backlogCount} backlog
                </Badge>
              )}
              <Badge variant="outline" className="text-sm font-semibold">
                {metrics.completed}/{metrics.total} ({overallPct}%)
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Overview — 4 status cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="text-lg font-bold text-green-700">{metrics.completed}</p>
                <p className="text-xs text-green-600">Completed</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <Clock className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <p className="text-lg font-bold text-blue-700">
                  {metrics.total - metrics.completed - metrics.backlogCount}
                </p>
                <p className="text-xs text-blue-600">In Progress</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-lg font-bold text-amber-700">{blockedHandoffs}</p>
                <p className="text-xs text-amber-600">Pending Handoffs</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
              <Target className="w-5 h-5 text-purple-600 shrink-0" />
              <div>
                <p className="text-lg font-bold text-purple-700">{overallPct}%</p>
                <p className="text-xs text-purple-600">Sprint Health</p>
              </div>
            </div>
          </div>

          {/* Day stepper */}
          <div className="grid grid-cols-5 gap-2">
            {SPRINT_DAYS.map((day) => {
              const isPast = day.day < currentDay;
              const isCurrent = day.day === currentDay;
              const isSelected = day.day === selectedDay;
              return (
                <button
                  key={day.day}
                  onClick={() => setSelectedDay(day.day)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-xl transition-all border-2',
                    isSelected && 'ring-2 ring-primary border-primary bg-primary/5',
                    !isSelected && isPast && 'border-green-200 bg-green-50/50 hover:bg-green-50',
                    !isSelected && isCurrent && 'border-primary/30 bg-primary/5 hover:bg-primary/10',
                    !isSelected && !isPast && !isCurrent && 'border-transparent bg-muted/50 hover:bg-muted',
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm font-bold',
                    isPast && 'bg-green-500 text-white',
                    isCurrent && 'bg-primary text-primary-foreground',
                    !isPast && !isCurrent && 'bg-muted text-muted-foreground',
                  )}>
                    {isPast ? '\u2713' : day.day}
                  </div>
                  <span className={cn(
                    'text-xs leading-tight text-center',
                    isPast && 'text-green-600',
                    isCurrent && 'text-primary font-semibold',
                    !isPast && !isCurrent && 'text-muted-foreground',
                  )}>
                    <span className="font-medium block">Day {day.day}</span>
                    <span className="hidden sm:block">{day.theme.split(' & ')[0]}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Sprint Progress</span>
              <span>{metrics.completed}/{metrics.total} tasks ({overallPct}%)</span>
            </div>
            <Progress value={(metrics.completed / metrics.total) * 100} className="h-2.5" />
          </div>
        </CardContent>
      </Card>

      {/* ── Step-by-Step Workflow Tabs ── */}
      <Tabs defaultValue="board" className="space-y-4">
        {/* Workflow navigation with step numbers */}
        <Card className="p-2">
          <div className="space-y-2">
            {/* Sprint Work (Steps 1-4) */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-1.5">Sprint Work</p>
              <TabsList className="grid w-full grid-cols-4 h-auto bg-transparent gap-1">
                {WORKFLOW_STEPS.filter(s => s.group === 'work').map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <React.Fragment key={step.value}>
                      <TabsTrigger
                        value={step.value}
                        className="flex flex-col items-center gap-0.5 py-2.5 px-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm h-auto"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold opacity-50">{step.step}</span>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-medium">{step.label}</span>
                        <span className="text-[10px] text-muted-foreground hidden sm:block">{step.desc}</span>
                      </TabsTrigger>
                    </React.Fragment>
                  );
                })}
              </TabsList>
            </div>

            {/* Management (Steps 5-7) */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-1.5">Management</p>
              <TabsList className="grid w-full grid-cols-3 max-w-md h-auto bg-transparent gap-1">
                {WORKFLOW_STEPS.filter(s => s.group === 'mgmt').map((step) => {
                  const Icon = step.icon;
                  return (
                    <TabsTrigger
                      key={step.value}
                      value={step.value}
                      className="flex flex-col items-center gap-0.5 py-2.5 px-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm h-auto"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold opacity-50">{step.step}</span>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium">{step.label}</span>
                      <span className="text-[10px] text-muted-foreground hidden sm:block">{step.desc}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
          </div>
        </Card>

        {/* Tab content */}
        <TabsContent value="board">
          <BoardView
            boardColumns={boardColumns}
            getTaskStatus={getTaskStatus}
            onStatusChange={updateTaskStatus}
            taskOverrides={state.taskOverrides}
            taskNotes={state.taskNotes}
          />
        </TabsContent>

        <TabsContent value="deps">
          <DependenciesView currentDay={currentDay} getTaskStatus={getTaskStatus} />
        </TabsContent>

        <TabsContent value="findings">
          <FindingsView />
        </TabsContent>

        <TabsContent value="standups">
          <StandupsView
            standups={state.standups}
            selectedDay={selectedDay}
            onAddStandup={addStandup}
          />
        </TabsContent>

        <TabsContent value="metrics">
          <MetricsView metrics={metrics} currentDay={currentDay} />
        </TabsContent>

        <TabsContent value="strategy">
          <StrategyView activityLog={state.activityLog} />
        </TabsContent>

        <TabsContent value="po">
          <POVerificationView currentDay={currentDay} getTaskStatus={getTaskStatus} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SprintTrackerDashboard;

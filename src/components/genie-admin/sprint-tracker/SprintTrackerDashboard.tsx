/**
 * SPRINT TRACKER DASHBOARD — UX Polished
 * - Color-coded status cards (green/amber/red/purple)
 * - Day stepper with theme + completion % per day
 * - Grouped tab nav with badge counts
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Target, LayoutGrid, Bug, MessageSquare, BarChart3, Shield, Link2, ClipboardCheck,
  AlertTriangle, CheckCircle2, Clock, TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useSprintTracker } from './useSprintTracker';
import { SPRINT_DAYS, SPRINT_START_DATE, SPRINT_END_DATE } from './data-config';
import { HANDOFFS } from './data-dependencies';
import { SPRINT_TASKS } from './data-tasks';
import { BoardView } from './BoardView';
import { DependenciesView } from './DependenciesView';
import { FindingsView } from './FindingsView';
import { StandupsView } from './StandupsView';
import { MetricsView } from './MetricsView';
import { StrategyView } from './StrategyView';
import { POVerificationView } from './POVerificationView';

const WORKFLOW_STEPS = [
  { value: 'board',    step: 1, label: 'Board',    desc: 'Task status',    icon: LayoutGrid,    group: 'work' },
  { value: 'deps',     step: 2, label: 'Handoffs', desc: 'Dependencies',   icon: Link2,         group: 'work' },
  { value: 'findings', step: 3, label: 'Findings', desc: 'Issues',         icon: Bug,           group: 'work' },
  { value: 'standups', step: 4, label: 'Standups', desc: 'Communication',  icon: MessageSquare, group: 'work' },
  { value: 'metrics',  step: 5, label: 'Metrics',  desc: 'Progress',       icon: BarChart3,     group: 'mgmt' },
  { value: 'strategy', step: 6, label: 'Strategy', desc: 'Governance',     icon: Shield,        group: 'mgmt' },
  { value: 'po',       step: 7, label: 'PO Gate',  desc: 'Sign-off',       icon: ClipboardCheck, group: 'mgmt' },
] as const;

export const SprintTrackerDashboard: React.FC = () => {
  const {
    state, currentDay, metrics, boardColumns,
    updateTaskStatus, addStandup, getTaskStatus,
  } = useSprintTracker();

  const [selectedDay, setSelectedDay] = useState(currentDay);
  const overallPct = Math.round((metrics.completed / metrics.total) * 100);

  // Pending handoffs count (for badge)
  const pendingHandoffs = HANDOFFS.filter(h => {
    const st = getTaskStatus(h.producerTaskId);
    return st !== 'completed';
  }).length;

  // Per-day completion for stepper
  const dayCompletion = (day: number) => {
    const dayTasks = SPRINT_TASKS.filter(t => t.day === day);
    if (dayTasks.length === 0) return 0;
    const done = dayTasks.filter(t => getTaskStatus(t.id) === 'completed').length;
    return Math.round((done / dayTasks.length) * 100);
  };

  // Health color for sprint health card
  const healthColor = overallPct >= 70 ? 'green' : overallPct >= 40 ? 'amber' : 'red';

  // Badge counts per tab
  const tabBadges: Record<string, number | undefined> = {
    deps: pendingHandoffs > 0 ? pendingHandoffs : undefined,
  };

  return (
    <div className="space-y-5">
      {/* ── Sprint Header + Overview ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Sprint Tracker</CardTitle>
                <CardDescription className="text-sm">
                  Lovable + Claude Code · {SPRINT_START_DATE} → {SPRINT_END_DATE} · Day {currentDay} of 5
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {metrics.backlogCount > 0 && (
                <Badge className="bg-amber-100 text-amber-800 border border-amber-300 text-xs gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {metrics.backlogCount} backlog
                </Badge>
              )}
              <Badge variant="outline" className="text-sm font-semibold">
                {metrics.completed}/{metrics.total} · {overallPct}%
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* ── 4 Color-coded Status Cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Completed — Green */}
            <div className="relative overflow-hidden flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
              <div className="absolute inset-y-0 left-0 w-1 bg-green-500 rounded-l-xl" />
              <CheckCircle2 className="w-7 h-7 text-green-600 shrink-0" />
              <div>
                <p className="text-2xl font-bold text-green-700 leading-none">{metrics.completed}</p>
                <p className="text-xs text-green-600 mt-0.5 font-medium">Completed</p>
              </div>
            </div>

            {/* In Progress — Blue */}
            <div className="relative overflow-hidden flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
              <div className="absolute inset-y-0 left-0 w-1 bg-blue-500 rounded-l-xl" />
              <Clock className="w-7 h-7 text-blue-600 shrink-0" />
              <div>
                <p className="text-2xl font-bold text-blue-700 leading-none">
                  {metrics.total - metrics.completed - metrics.backlogCount}
                </p>
                <p className="text-xs text-blue-600 mt-0.5 font-medium">In Progress</p>
              </div>
            </div>

            {/* Pending Handoffs — Amber when any pending, green when clear */}
            <div className={cn(
              'relative overflow-hidden flex items-center gap-3 p-4 rounded-xl border',
              pendingHandoffs > 0
                ? 'bg-amber-50 border-amber-200'
                : 'bg-green-50 border-green-200',
            )}>
              <div className={cn(
                'absolute inset-y-0 left-0 w-1 rounded-l-xl',
                pendingHandoffs > 0 ? 'bg-amber-500' : 'bg-green-500',
              )} />
              <AlertTriangle className={cn('w-7 h-7 shrink-0', pendingHandoffs > 0 ? 'text-amber-600' : 'text-green-600')} />
              <div>
                <p className={cn('text-2xl font-bold leading-none', pendingHandoffs > 0 ? 'text-amber-700' : 'text-green-700')}>
                  {pendingHandoffs}
                </p>
                <p className={cn('text-xs mt-0.5 font-medium', pendingHandoffs > 0 ? 'text-amber-600' : 'text-green-600')}>
                  Pending Handoffs
                </p>
              </div>
            </div>

            {/* Sprint Health — Red/Amber/Green based on %  */}
            <div className={cn(
              'relative overflow-hidden flex items-center gap-3 p-4 rounded-xl border',
              healthColor === 'green' ? 'bg-green-50 border-green-200' :
              healthColor === 'amber' ? 'bg-amber-50 border-amber-200' :
              'bg-red-50 border-red-200',
            )}>
              <div className={cn(
                'absolute inset-y-0 left-0 w-1 rounded-l-xl',
                healthColor === 'green' ? 'bg-green-500' :
                healthColor === 'amber' ? 'bg-amber-500' :
                'bg-red-500',
              )} />
              <TrendingUp className={cn('w-7 h-7 shrink-0',
                healthColor === 'green' ? 'text-green-600' :
                healthColor === 'amber' ? 'text-amber-600' :
                'text-red-600',
              )} />
              <div>
                <p className={cn('text-2xl font-bold leading-none',
                  healthColor === 'green' ? 'text-green-700' :
                  healthColor === 'amber' ? 'text-amber-700' :
                  'text-red-700',
                )}>{overallPct}%</p>
                <p className={cn('text-xs mt-0.5 font-medium',
                  healthColor === 'green' ? 'text-green-600' :
                  healthColor === 'amber' ? 'text-amber-600' :
                  'text-red-600',
                )}>Sprint Health</p>
              </div>
            </div>
          </div>

          {/* ── Day Stepper — with theme + completion % ── */}
          <div className="grid grid-cols-5 gap-2">
            {SPRINT_DAYS.map((day) => {
              const isPast    = day.day < currentDay;
              const isCurrent = day.day === currentDay;
              const isSelected = day.day === selectedDay;
              const pct = dayCompletion(day.day);
              const dayTasks = SPRINT_TASKS.filter(t => t.day === day.day).length;

              return (
                <button
                  key={day.day}
                  onClick={() => setSelectedDay(day.day)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-xl transition-all border-2 text-left',
                    isSelected
                      ? 'ring-2 ring-primary border-primary bg-primary/5 shadow-sm'
                      : isPast
                      ? 'border-green-200 bg-green-50/60 hover:bg-green-50'
                      : isCurrent
                      ? 'border-primary/40 bg-primary/5 hover:bg-primary/10'
                      : 'border-transparent bg-muted/40 hover:bg-muted',
                  )}
                >
                  {/* Circle */}
                  <div className={cn(
                    'w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                    isPast    ? 'bg-green-500 text-white' :
                    isCurrent ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' :
                    'bg-muted text-muted-foreground',
                  )}>
                    {isPast ? '✓' : day.day}
                  </div>

                  {/* Theme label */}
                  <div className="flex flex-col items-center gap-0.5 w-full">
                    <span className={cn(
                      'text-[10px] sm:text-xs font-semibold leading-tight text-center',
                      isPast    ? 'text-green-700' :
                      isCurrent ? 'text-primary' :
                      'text-muted-foreground',
                    )}>
                      Day {day.day}
                    </span>
                    <span className="hidden sm:block text-[9px] leading-tight text-center text-muted-foreground line-clamp-2">
                      {day.theme.split(' & ')[0]}
                    </span>
                  </div>

                  {/* Completion mini-bar */}
                  {dayTasks > 0 && (
                    <div className="w-full space-y-0.5">
                      <div className="h-1 rounded-full overflow-hidden bg-muted">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            pct === 100 ? 'bg-green-500' :
                            pct > 0     ? 'bg-primary' :
                            'bg-transparent',
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className={cn(
                        'text-[9px] text-center',
                        pct === 100 ? 'text-green-600' : 'text-muted-foreground',
                      )}>{pct}%</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Overall progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Sprint Progress</span>
              <span>{metrics.completed}/{metrics.total} tasks ({overallPct}%)</span>
            </div>
            <Progress value={(metrics.completed / metrics.total) * 100} className="h-2.5" />
          </div>
        </CardContent>
      </Card>

      {/* ── Grouped Tab Navigation with Badge Counts ── */}
      <Tabs defaultValue="board" className="space-y-4">
        <Card className="p-2">
          <div className="space-y-2">
            {/* Sprint Work (Steps 1-4) */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-1.5">
                Sprint Work
              </p>
              <TabsList className="grid w-full grid-cols-4 h-auto bg-transparent gap-1">
                {WORKFLOW_STEPS.filter(s => s.group === 'work').map((step) => {
                  const Icon = step.icon;
                  const badge = tabBadges[step.value];
                  return (
                    <TabsTrigger
                      key={step.value}
                      value={step.value}
                      className="relative flex flex-col items-center gap-0.5 py-2.5 px-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm h-auto"
                    >
                      {badge !== undefined && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center px-1 z-10">
                          {badge}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold opacity-40">{step.step}</span>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium">{step.label}</span>
                      <span className="text-[10px] text-muted-foreground hidden sm:block">{step.desc}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {/* Management (Steps 5-7) */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-1.5">
                Management
              </p>
              <TabsList className="grid w-full grid-cols-3 max-w-md h-auto bg-transparent gap-1">
                {WORKFLOW_STEPS.filter(s => s.group === 'mgmt').map((step) => {
                  const Icon = step.icon;
                  const badge = tabBadges[step.value];
                  return (
                    <TabsTrigger
                      key={step.value}
                      value={step.value}
                      className="relative flex flex-col items-center gap-0.5 py-2.5 px-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm h-auto"
                    >
                      {badge !== undefined && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center px-1 z-10">
                          {badge}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold opacity-40">{step.step}</span>
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

        {/* Tab content panels */}
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

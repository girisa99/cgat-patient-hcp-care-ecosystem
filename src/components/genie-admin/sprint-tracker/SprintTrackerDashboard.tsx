/**
 * SPRINT TRACKER DASHBOARD (Redesigned — Modular)
 *
 * Composes sub-components for a clean, readable UX:
 * - BoardView: Kanban board (Backlog | To Do | In Progress | Done)
 * - DependenciesView: Cross-functional handoffs, dependency chains, blocker alerts
 * - FindingsView: Expandable diagnosis findings grouped by product
 * - StandupsView: Timeline of standups with forms
 * - MetricsView: Live progress, burndown, velocity
 * - StrategyView: File ownership, locked files, activity log
 * - POVerificationView: PO/SM daily checklist — verify, approve, decide, unblock
 *
 * State persisted to localStorage via useSprintTracker hook.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, LayoutGrid, Bug, MessageSquare, BarChart3, Shield, Link2, ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useSprintTracker } from './useSprintTracker';
import { SPRINT_DAYS, SPRINT_START_DATE, SPRINT_END_DATE } from './data-config';
import { BoardView } from './BoardView';
import { DependenciesView } from './DependenciesView';
import { FindingsView } from './FindingsView';
import { StandupsView } from './StandupsView';
import { MetricsView } from './MetricsView';
import { StrategyView } from './StrategyView';
import { POVerificationView } from './POVerificationView';

export const SprintTrackerDashboard: React.FC = () => {
  const {
    state, currentDay, metrics, boardColumns,
    updateTaskStatus, addStandup, getTaskStatus,
  } = useSprintTracker();

  const [selectedDay, setSelectedDay] = useState(currentDay);

  return (
    <div className="space-y-5">
      {/* ── Sprint Header ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-xl">Sprint Tracker</CardTitle>
                <CardDescription className="text-sm">
                  Lovable + Claude Code | {SPRINT_START_DATE} to {SPRINT_END_DATE}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {metrics.backlogCount > 0 && (
                <Badge className="bg-amber-100 text-amber-800 text-sm">
                  {metrics.backlogCount} backlog
                </Badge>
              )}
              <Badge variant="outline" className="text-sm font-semibold">
                {metrics.completed}/{metrics.total} ({Math.round((metrics.completed / metrics.total) * 100)}%)
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Day stepper */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {SPRINT_DAYS.map((day, i) => (
              <React.Fragment key={day.day}>
                {i > 0 && <div className="flex-1 h-0.5 bg-border" />}
                <button
                  onClick={() => setSelectedDay(day.day)}
                  className={cn(
                    'flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-all min-w-[56px]',
                    day.day === selectedDay && 'ring-2 ring-primary bg-primary/5',
                    day.day < currentDay && 'text-green-600',
                    day.day === currentDay && 'text-primary font-bold',
                    day.day > currentDay && 'text-muted-foreground',
                  )}
                >
                  <div className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2',
                    day.day < currentDay && 'bg-green-500 text-white border-green-500',
                    day.day === currentDay && 'bg-primary text-primary-foreground border-primary',
                    day.day > currentDay && 'bg-muted text-muted-foreground border-muted',
                  )}>
                    D{day.day}
                  </div>
                  <span className="text-xs leading-tight text-center hidden sm:block">
                    {day.theme.split(' & ')[0]}
                  </span>
                </button>
              </React.Fragment>
            ))}
          </div>
          <Progress value={(metrics.completed / metrics.total) * 100} className="h-2.5" />
        </CardContent>
      </Card>

      {/* ── Main Tabs ── */}
      <Tabs defaultValue="board" className="space-y-4">
        <TabsList className="flex w-full max-w-3xl overflow-x-auto">
          <TabsTrigger value="board" className="gap-1.5 text-sm flex-1">
            <LayoutGrid className="w-4 h-4" /> Board
          </TabsTrigger>
          <TabsTrigger value="deps" className="gap-1.5 text-sm flex-1">
            <Link2 className="w-4 h-4" /> Handoffs
          </TabsTrigger>
          <TabsTrigger value="findings" className="gap-1.5 text-sm flex-1">
            <Bug className="w-4 h-4" /> Findings
          </TabsTrigger>
          <TabsTrigger value="standups" className="gap-1.5 text-sm flex-1">
            <MessageSquare className="w-4 h-4" /> Standups
          </TabsTrigger>
          <TabsTrigger value="metrics" className="gap-1.5 text-sm flex-1">
            <BarChart3 className="w-4 h-4" /> Metrics
          </TabsTrigger>
          <TabsTrigger value="strategy" className="gap-1.5 text-sm flex-1">
            <Shield className="w-4 h-4" /> Strategy
          </TabsTrigger>
          <TabsTrigger value="po" className="gap-1.5 text-sm flex-1">
            <ClipboardCheck className="w-4 h-4" /> PO Gate
          </TabsTrigger>
        </TabsList>

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

/**
 * SPRINT TRACKER DASHBOARD — Full-Screen Single-Page Layout
 *
 * Design: sticky top bar + flat content area. No card-within-card.
 * Tab navigation is a horizontal pill bar across the top (not nested inside a card).
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Target, LayoutGrid, Bug, MessageSquare, BarChart3, Shield, Link2, ClipboardCheck,
  AlertTriangle, CheckCircle2, Clock, TrendingUp, ArrowLeft, Video,
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

const TABS = [
  { value: 'board',    label: 'Board',    icon: LayoutGrid,    group: 'work' },
  { value: 'deps',     label: 'Handoffs', icon: Link2,         group: 'work' },
  { value: 'findings', label: 'Findings', icon: Bug,           group: 'work' },
  { value: 'standups', label: 'Standups', icon: MessageSquare, group: 'work' },
  { value: 'metrics',  label: 'Metrics',  icon: BarChart3,     group: 'mgmt' },
  { value: 'strategy', label: 'Strategy', icon: Shield,        group: 'mgmt' },
  { value: 'po',       label: 'PO Gate',  icon: ClipboardCheck, group: 'mgmt' },
] as const;

export const SprintTrackerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  const {
    state, currentDay, metrics, boardColumns,
    updateTaskStatus, addStandup, getTaskStatus,
  } = useSprintTracker();

  const [selectedDay, setSelectedDay] = useState(currentDay);

  const overallPct = Math.round((metrics.completed / metrics.total) * 100);
  const pendingHandoffs = HANDOFFS.filter(h => getTaskStatus(h.producerTaskId) !== 'completed').length;
  const healthColor = overallPct >= 70 ? 'green' : overallPct >= 40 ? 'amber' : 'red';

  const dayCompletion = (day: number) => {
    const dayTasks = SPRINT_TASKS.filter(t => t.day === day);
    if (dayTasks.length === 0) return 0;
    return Math.round(dayTasks.filter(t => getTaskStatus(t.id) === 'completed').length / dayTasks.length * 100);
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-background">
      <Tabs defaultValue="board" className="flex flex-col flex-1">

        {/* ─── STICKY TOP BAR ─── */}
        <div className="sticky top-0 z-20 bg-background border-b shadow-sm">

          {/* Row 1: Back button + Title + stat chips + Genie Cast shortcut */}
          <div className="flex items-center gap-3 px-4 sm:px-6 pt-3 pb-2 flex-wrap">
            {/* Back button — restores sidebar nav */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/genie-admin?tab=genie-cast')}
              className="gap-1.5 shrink-0 h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">Back</span>
            </Button>

            <div className="flex items-center gap-2 shrink-0">
              <Target className="w-5 h-5 text-primary" />
              <span className="font-bold text-base">Sprint Tracker</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Day {currentDay}/5 · {SPRINT_START_DATE} → {SPRINT_END_DATE}
              </span>
            </div>

            {/* Inline stat chips */}
            <div className="flex items-center gap-2 flex-wrap ml-auto">
              {/* Completed */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 border border-green-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-bold text-green-700">{metrics.completed}</span>
                <span className="text-[10px] text-green-600">done</span>
              </div>

              {/* In Progress */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 border border-blue-300">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-bold text-blue-700">
                  {metrics.total - metrics.completed - metrics.backlogCount}
                </span>
                <span className="text-[10px] text-blue-600">active</span>
              </div>

              {/* Handoffs */}
              <div className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full border',
                pendingHandoffs > 0
                  ? 'bg-amber-100 border-amber-300'
                  : 'bg-green-100 border-green-300',
              )}>
                <AlertTriangle className={cn('w-3.5 h-3.5', pendingHandoffs > 0 ? 'text-amber-600' : 'text-green-600')} />
                <span className={cn('text-xs font-bold', pendingHandoffs > 0 ? 'text-amber-700' : 'text-green-700')}>
                  {pendingHandoffs}
                </span>
                <span className={cn('text-[10px]', pendingHandoffs > 0 ? 'text-amber-600' : 'text-green-600')}>
                  handoffs
                </span>
              </div>

              {/* Sprint health */}
              <div className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full border',
                healthColor === 'green' ? 'bg-green-100 border-green-300' :
                healthColor === 'amber' ? 'bg-amber-100 border-amber-300' :
                'bg-red-100 border-red-300',
              )}>
                <TrendingUp className={cn('w-3.5 h-3.5',
                  healthColor === 'green' ? 'text-green-600' :
                  healthColor === 'amber' ? 'text-amber-600' : 'text-red-600'
                )} />
                <span className={cn('text-xs font-bold',
                  healthColor === 'green' ? 'text-green-700' :
                  healthColor === 'amber' ? 'text-amber-700' : 'text-red-700'
                )}>{overallPct}%</span>
              </div>

              {metrics.backlogCount > 0 && (
                <Badge className="bg-amber-100 text-amber-800 border border-amber-300 text-xs gap-1">
                  <AlertTriangle className="w-3 h-3" />{metrics.backlogCount} backlog
                </Badge>
              )}

              {/* Genie Cast shortcut */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/genie-admin?tab=genie-cast')}
                className="gap-1.5 h-7 px-2.5 text-xs shrink-0 border-primary/30 text-primary hover:bg-primary/10"
              >
                <Video className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Genie Cast</span>
              </Button>
            </div>
          </div>

          {/* Row 2: Day stepper (compact horizontal) */}
          <div className="flex items-center gap-1.5 px-4 sm:px-6 pb-2 overflow-x-auto">
            {SPRINT_DAYS.map(day => {
              const isPast    = day.day < currentDay;
              const isCurrent = day.day === currentDay;
              const isSelected = day.day === selectedDay;
              const pct = dayCompletion(day.day);

              return (
                <button
                  key={day.day}
                  onClick={() => setSelectedDay(day.day)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all whitespace-nowrap shrink-0',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : isPast
                      ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                      : isCurrent
                      ? 'bg-primary/10 border-primary/40 text-primary hover:bg-primary/20'
                      : 'bg-muted border-transparent text-muted-foreground hover:bg-muted/80',
                  )}
                >
                  {/* Circle */}
                  <span className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                    isSelected && !isPast ? 'bg-primary-foreground text-primary' :
                    isPast    ? 'bg-green-500 text-white' :
                    isCurrent ? 'bg-primary text-primary-foreground' :
                    'bg-muted-foreground/20 text-muted-foreground',
                  )}>
                    {isPast ? '✓' : day.day}
                  </span>
                  <span className="hidden sm:inline">{day.theme.split(' & ')[0]}</span>
                  <span className="sm:hidden">Day {day.day}</span>
                  <span className={cn(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                    pct === 100 ? 'bg-green-500 text-white' :
                    pct > 0     ? 'bg-primary/20 text-primary' :
                    'bg-muted text-muted-foreground',
                  )}>{pct}%</span>
                </button>
              );
            })}

            {/* Slim overall progress */}
            <div className="flex items-center gap-2 ml-auto pl-4 shrink-0 min-w-[120px]">
              <Progress value={overallPct} className="h-1.5 flex-1" />
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {metrics.completed}/{metrics.total}
              </span>
            </div>
          </div>

          {/* Row 3: Tab navigation — full-width pill bar */}
          <div className="border-t">
            <TabsList className="h-auto bg-transparent rounded-none w-full justify-start gap-0 px-4 sm:px-6">
              {/* Sprint Work group label + tabs */}
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mr-2 self-center hidden md:inline">
                Work:
              </span>
              {TABS.filter(t => t.group === 'work').map(tab => {
                const Icon = tab.icon;
                const badge = tab.value === 'deps' && pendingHandoffs > 0 ? pendingHandoffs : undefined;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="relative px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent bg-transparent gap-1.5 transition-colors"
                  >
                    {badge !== undefined && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center px-1">
                        {badge}
                      </span>
                    )}
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}

              {/* Divider */}
              <span className="mx-3 text-border self-center hidden md:inline">│</span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mr-2 self-center hidden md:inline">
                Mgmt:
              </span>

              {TABS.filter(t => t.group === 'mgmt').map(tab => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="relative px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent bg-transparent gap-1.5 transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        </div>

        {/* ─── CONTENT AREA — flat, padded, no wrapping card ─── */}
        <div className="flex-1 overflow-auto">
          <TabsContent value="board" className="m-0 p-4 sm:p-6">
            <BoardView
              boardColumns={boardColumns}
              getTaskStatus={getTaskStatus}
              onStatusChange={updateTaskStatus}
              taskOverrides={state.taskOverrides}
              taskNotes={state.taskNotes}
            />
          </TabsContent>

          <TabsContent value="deps" className="m-0 p-4 sm:p-6">
            <DependenciesView currentDay={currentDay} getTaskStatus={getTaskStatus} />
          </TabsContent>

          <TabsContent value="findings" className="m-0 p-4 sm:p-6">
            <FindingsView />
          </TabsContent>

          <TabsContent value="standups" className="m-0 p-4 sm:p-6">
            <StandupsView
              standups={state.standups}
              selectedDay={selectedDay}
              onAddStandup={addStandup}
            />
          </TabsContent>

          <TabsContent value="metrics" className="m-0 p-4 sm:p-6">
            <MetricsView metrics={metrics} currentDay={currentDay} />
          </TabsContent>

          <TabsContent value="strategy" className="m-0 p-4 sm:p-6">
            <StrategyView activityLog={state.activityLog} />
          </TabsContent>

          <TabsContent value="po" className="m-0 p-4 sm:p-6">
            <POVerificationView currentDay={currentDay} getTaskStatus={getTaskStatus} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SprintTrackerDashboard;

/**
 * SPRINT TRACKER — Day-Centric Layout
 *
 * Sidebar: Day 1–5 (with %) | Backlog | — | Metrics | Strategy | PO Gate
 * Main: DayPageView = standup + tasks(Claude|Lovable) + handoffs — all per day
 * Secondary views: Backlog list, Metrics, Strategy, PO Gate
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  LayoutGrid, BarChart3, Shield, ClipboardCheck, Clock,
  CheckCircle2, TrendingUp, ArrowLeft, Video,
  Archive, Target, Calendar, Flag, Brain, Zap, ChevronRight, BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useSprintTracker } from './useSprintTracker';
import { SPRINT_DAYS } from './data-config';
import { HANDOFFS } from './data-dependencies';
import { SPRINT_TASKS } from './data-tasks';
import { DayPageView } from './DayPageView';
import { MetricsView } from './MetricsView';
import { StrategyView } from './StrategyView';
import { POVerificationView } from './POVerificationView';
import { FindingsView } from './FindingsView';
import { SprintPlanningView } from './SprintPlanningView';
import { GovernanceFlowView } from './GovernanceFlowView';
import { SprintCharterView } from './SprintCharterView';
import { EffortTrackingView } from './EffortTrackingView';

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewId = 'day-1' | 'day-2' | 'day-3' | 'day-4' | 'day-5' | 'backlog' | 'metrics' | 'effort' | 'strategy' | 'po-gate' | 'findings' | 'planning' | 'governance' | 'charter';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY_THEMES = ['Foundation', 'Deck + Products', 'Spark + Demos', 'Mind + Polish', 'Integration'];

function RoleChip({ role }: { role: 'po' | 'claude' | 'lovable' }) {
  const cfg = {
    po:      { label: 'PO/SM',   cls: 'bg-emerald-100 text-emerald-800 border-emerald-300', Icon: Flag },
    claude:  { label: 'Claude',  cls: 'bg-violet-100 text-violet-800 border-violet-300',    Icon: Brain },
    lovable: { label: 'Lovable', cls: 'bg-pink-100 text-pink-800 border-pink-300',          Icon: Zap },
  }[role];
  const Icon = cfg.Icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold', cfg.cls)}>
      <Icon className="w-2.5 h-2.5" />{cfg.label}
    </span>
  );
}

// ─── Sidebar nav button ───────────────────────────────────────────────────────

function NavBtn({
  active, dayNum, isPast, isToday, pct, badge, label, icon: Icon, onClick,
}: {
  active: boolean; dayNum?: number; isPast?: boolean; isToday?: boolean;
  pct?: number; badge?: number; label: string; icon: React.ElementType; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left',
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        isToday && !active && 'ring-1 ring-primary/40',
      )}
    >
      {dayNum !== undefined ? (
        <span className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0',
          active    ? 'bg-primary-foreground/20 text-primary-foreground' :
          isPast    ? 'bg-green-500 text-white' :
          isToday   ? 'bg-primary text-primary-foreground' :
                      'bg-muted-foreground/20 text-muted-foreground',
        )}>
          {isPast ? '✓' : dayNum}
        </span>
      ) : (
        <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-primary-foreground' : '')} />
      )}

      <span className="flex-1 truncate text-sm">{label}</span>

      {badge != null && badge > 0 && (
        <span className={cn(
          'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shrink-0',
          active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-amber-500 text-white',
        )}>
          {badge}
        </span>
      )}

      {pct !== undefined && (
        <span className={cn(
          'text-[10px] font-bold shrink-0',
          active ? 'text-primary-foreground/80' : isPast ? 'text-green-600' : 'text-muted-foreground',
        )}>
          {pct}%
        </span>
      )}
    </button>
  );
}

// ─── Backlog view ─────────────────────────────────────────────────────────────

function BacklogView({ getTaskStatus, onStatusChange, taskOverrides, currentDay }: {
  getTaskStatus: (id: string) => import('./types').TaskStatus;
  onStatusChange: (id: string, status: import('./types').TaskStatus) => void;
  taskOverrides: Record<string, { status: import('./types').TaskStatus; note?: string }>;
  currentDay: number;
}) {
  const overdueTasks = SPRINT_TASKS.filter(t => {
    if (t.day >= currentDay) return false;
    return getTaskStatus(t.id) !== 'completed' && getTaskStatus(t.id) !== 'rejected';
  });

  if (overdueTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
        <p className="text-base font-medium">No backlog — all past days complete 🎉</p>
      </div>
    );
  }

  // Group by day
  const byDay = overdueTasks.reduce<Record<number, typeof overdueTasks>>((acc, t) => {
    if (!acc[t.day]) acc[t.day] = [];
    acc[t.day].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Archive className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-semibold text-amber-700">{overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}</span>
      </div>
      {Object.entries(byDay).sort(([a], [b]) => +a - +b).map(([dayStr, tasks]) => {
        const d = +dayStr;
        return (
          <div key={d}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Day {d} · {DAY_THEMES[d - 1]}
            </p>
            <div className="space-y-1.5">
              {tasks.map(task => {
                const status = getTaskStatus(task.id);
                const isDone = status === 'completed';
                const isWIP  = status === 'in-progress';
                const isL    = task.developer === 'lovable';
                return (
                  <div key={task.id} className={cn(
                    'flex items-center gap-2.5 px-3 py-2.5 border-l-4 rounded-r-lg bg-card',
                    isL ? 'border-l-pink-400' : 'border-l-violet-400',
                  )}>
                    <span className={cn('text-[10px] font-mono text-muted-foreground w-11 shrink-0')}>{task.id}</span>
                    <span className={cn('flex-1 text-sm font-medium', isDone && 'line-through text-muted-foreground')}>
                      {task.title}
                    </span>
                    <span className={cn(
                      'text-[10px] font-semibold px-1.5 py-0.5 rounded border',
                      isL ? 'bg-pink-50 text-pink-700 border-pink-200' : 'bg-violet-50 text-violet-700 border-violet-200',
                    )}>
                      {isL ? '⚡ Lovable' : '🧠 Claude'}
                    </span>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => onStatusChange(task.id, isDone ? 'pending' : 'completed')}
                        className={cn('w-6 h-6 rounded flex items-center justify-center border transition-colors',
                          isDone ? 'bg-green-500 border-green-600 text-white' : 'border-border hover:bg-green-50 hover:border-green-300 text-muted-foreground')}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export const SprintTrackerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    state, currentDay, metrics, effortMetrics, updateTaskStatus, addStandup, getTaskStatus,
  } = useSprintTracker();

  const [activeView, setActiveView] = useState<ViewId>(`day-${currentDay}` as ViewId);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── computed ──────────────────────────────────────────────────────────────
  const overallPct = metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0;
  const healthColor = overallPct >= 70 ? 'green' : overallPct >= 40 ? 'amber' : 'red';

  const dayCompletion = (day: number) => {
    const tasks = SPRINT_TASKS.filter(t => t.day === day);
    if (!tasks.length) return 0;
    return Math.round(tasks.filter(t => getTaskStatus(t.id) === 'completed').length / tasks.length * 100);
  };

  const backlogCount = SPRINT_TASKS.filter(t => {
    if (t.day >= currentDay) return false;
    return getTaskStatus(t.id) !== 'completed' && getTaskStatus(t.id) !== 'rejected';
  }).length;

  const pendingHandoffs = HANDOFFS.filter(h => getTaskStatus(h.producerTaskId) !== 'completed').length;

  // ── active day ────────────────────────────────────────────────────────────
  const activeDayNum = activeView.startsWith('day-') ? parseInt(activeView.split('-')[1]) : undefined;

  // ── view title ────────────────────────────────────────────────────────────
  const viewTitle =
    activeDayNum !== undefined   ? `Day ${activeDayNum} · ${DAY_THEMES[activeDayNum - 1]}` :
    activeView === 'backlog'     ? 'Backlog' :
    activeView === 'metrics'     ? 'Metrics' :
    activeView === 'effort'      ? 'Effort Tracking' :
    activeView === 'strategy'    ? 'Strategy' :
    activeView === 'findings'    ? 'Findings / QA' :
    activeView === 'governance'  ? 'Governance & Release Flow' :
    activeView === 'planning'    ? 'Sprint Planning' :
    activeView === 'charter'     ? 'Sprint Charter, Roles & Glossary' :
    'Release Gate';

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ═══ SIDEBAR ═════════════════════════════════════════════════════════ */}
      <aside className={cn(
        'flex flex-col border-r bg-card transition-all duration-200 shrink-0',
        sidebarOpen ? 'w-52' : 'w-0 overflow-hidden border-r-0',
      )}>
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b shrink-0">
          <Target className="w-4 h-4 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-none truncate">Sprint Tracker</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Feb 17–21 · Day {currentDay}/5</p>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-2 py-3 space-y-4">

            {/* Epics = Days */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
                Epics · Sprint Days
              </p>
              <div className="space-y-0.5">
                {[1, 2, 3, 4, 5].map(d => (
                  <NavBtn
                    key={d}
                    active={activeView === `day-${d}`}
                    dayNum={d}
                    isPast={d < currentDay}
                    isToday={d === currentDay}
                    pct={dayCompletion(d)}
                    label={`Day ${d} · ${DAY_THEMES[d - 1]}`}
                    icon={Calendar}
                    onClick={() => setActiveView(`day-${d}` as ViewId)}
                  />
                ))}
              </div>
            </div>

            <Separator />

            {/* Backlog */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
                Board
              </p>
              <div className="space-y-0.5">
                <NavBtn
                  active={activeView === 'backlog'}
                  badge={backlogCount}
                  label="Backlog"
                  icon={Archive}
                  onClick={() => setActiveView('backlog')}
                />
                <NavBtn active={activeView === 'metrics'}  label="Velocity / Metrics" icon={BarChart3}     onClick={() => setActiveView('metrics')}  />
                <NavBtn active={activeView === 'effort'}   label="Effort Tracking"   icon={Clock}          onClick={() => setActiveView('effort')}   />
              </div>
            </div>

            <Separator />

            {/* Reports & Gates */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
                Reports
              </p>
              <div className="space-y-0.5">
                <NavBtn active={activeView === 'charter'}    label="Sprint Charter ▸"         icon={BookOpen}        onClick={() => setActiveView('charter')}  />
                <NavBtn active={activeView === 'planning'}   label="Sprint Planning ▸"       icon={Target}          onClick={() => setActiveView('planning')}  />
                <NavBtn active={activeView === 'findings'}   label="Findings / QA"            icon={ClipboardCheck}  onClick={() => setActiveView('findings')} />
                <NavBtn active={activeView === 'governance'} label="Governance Flow ▸"        icon={Shield}          onClick={() => setActiveView('governance')} />
                <NavBtn active={activeView === 'strategy'}   label="Strategy"                 icon={TrendingUp}      onClick={() => setActiveView('strategy')} />
                <NavBtn active={activeView === 'po-gate'}    label="Release Gate ▸"           icon={Flag}            onClick={() => setActiveView('po-gate')}  />
              </div>
            </div>

            <Separator />

            {/* Assignees legend */}
            <div className="px-2 space-y-1.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Assignees
              </p>
              <div className="flex items-center gap-2"><RoleChip role="po" /><span className="text-[10px] text-muted-foreground">PO / Gate</span></div>
              <div className="flex items-center gap-2"><RoleChip role="claude" /><span className="text-[10px] text-muted-foreground">Tech Lead</span></div>
              <div className="flex items-center gap-2"><RoleChip role="lovable" /><span className="text-[10px] text-muted-foreground">Dev / UI</span></div>
            </div>

          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t px-2 py-2 shrink-0 space-y-0.5">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8 text-xs text-muted-foreground"
            onClick={() => navigate('/genie-admin?tab=genie-cast')}>
            <Video className="w-3.5 h-3.5" />Genie Cast
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8 text-xs text-muted-foreground"
            onClick={() => navigate('/genie-admin')}>
            <ArrowLeft className="w-3.5 h-3.5" />Exit Sprint View
          </Button>
        </div>
      </aside>

      {/* ═══ MAIN ════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Top bar */}
        <header className="shrink-0 border-b bg-card">
          <div className="flex items-center gap-3 px-4 py-2.5">
            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors shrink-0"
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <LayoutGrid className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="text-xs text-muted-foreground hidden sm:inline">Sprint Tracker</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground hidden sm:inline shrink-0" />
              <span className="text-sm font-semibold truncate">{viewTitle}</span>
            </div>

            {/* Health pills */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 border border-green-200">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                <span className="text-xs font-bold text-green-700">{metrics.completed}/{metrics.total}</span>
              </div>
              {pendingHandoffs > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 border border-amber-200">
                  <span className="text-xs font-bold text-amber-700">{pendingHandoffs} handoffs</span>
                </div>
              )}
              {backlogCount > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 border border-red-200">
                  <Archive className="w-3 h-3 text-red-600" />
                  <span className="text-xs font-bold text-red-700">{backlogCount}</span>
                </div>
              )}
              <div className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md border',
                healthColor === 'green' ? 'bg-green-50 border-green-200' :
                healthColor === 'amber' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200',
              )}>
                <TrendingUp className={cn('w-3 h-3',
                  healthColor === 'green' ? 'text-green-600' :
                  healthColor === 'amber' ? 'text-amber-600' : 'text-red-600',
                )} />
                <span className={cn('text-xs font-bold',
                  healthColor === 'green' ? 'text-green-700' :
                  healthColor === 'amber' ? 'text-amber-700' : 'text-red-700',
                )}>{overallPct}%</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <Progress value={overallPct} className="h-0.5 rounded-none" />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-5 max-w-6xl">

            {/* Day pages */}
            {activeDayNum !== undefined && (
              <DayPageView
                day={activeDayNum}
                theme={SPRINT_DAYS[activeDayNum - 1]?.theme ?? ''}
                standups={state.standups}
                onAddStandup={addStandup}
                getTaskStatus={getTaskStatus}
                onStatusChange={updateTaskStatus}
                taskOverrides={state.taskOverrides}
              />
            )}

            {/* Backlog */}
            {activeView === 'backlog' && (
              <BacklogView
                getTaskStatus={getTaskStatus}
                onStatusChange={updateTaskStatus}
                taskOverrides={state.taskOverrides}
                currentDay={currentDay}
              />
            )}

            {/* Metrics */}
            {activeView === 'metrics' && (
              <MetricsView metrics={metrics} currentDay={currentDay} />
            )}

            {/* Effort Tracking */}
            {activeView === 'effort' && (
              <EffortTrackingView effortMetrics={effortMetrics} currentDay={currentDay} />
            )}

            {/* Findings */}
            {activeView === 'findings' && <FindingsView />}

            {/* Strategy */}
            {activeView === 'strategy' && (
              <StrategyView activityLog={state.activityLog} />
            )}

            {/* PO Gate */}
            {activeView === 'po-gate' && (
              <POVerificationView currentDay={currentDay} getTaskStatus={getTaskStatus} />
            )}

            {/* Governance Flow */}
            {activeView === 'governance' && (
              <GovernanceFlowView getTaskStatus={getTaskStatus} />
            )}

            {/* Sprint Planning */}
            {activeView === 'planning' && (
              <SprintPlanningView
                getTaskStatus={getTaskStatus}
                currentDay={currentDay}
                onNavigateToDay={(d) => setActiveView(`day-${d}` as ViewId)}
              />
            )}

            {/* Sprint Charter, Roles & Glossary */}
            {activeView === 'charter' && (
              <SprintCharterView getTaskStatus={getTaskStatus} currentDay={currentDay} />
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default SprintTrackerDashboard;

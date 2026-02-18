/**
 * SPRINT TRACKER — Real Team UX Layout
 *
 * Layout: Left sidebar (nav + day selector + team legend)
 *         Top bar (sprint identity + health strip)
 *         Main content (selected view, no wrapping card)
 *
 * Roles:  PO/SM (gate keeper), Claude (Tech Lead), Lovable (Dev), Both
 * Views:  Day boards (1-5), Backlog, Standups, Handoffs, Findings, Strategy, Metrics, PO Gate
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  LayoutGrid, Bug, MessageSquare, BarChart3, Shield, Link2, ClipboardCheck,
  AlertTriangle, CheckCircle2, Clock, TrendingUp, ArrowLeft, Video,
  ChevronRight, Users, Zap, Brain, Calendar, GitBranch, Target,
  Flag, Archive,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useSprintTracker } from './useSprintTracker';
import { SPRINT_DAYS } from './data-config';
import { HANDOFFS } from './data-dependencies';
import { SPRINT_TASKS } from './data-tasks';
import { BoardView } from './BoardView';
import { DependenciesView } from './DependenciesView';
import { FindingsView } from './FindingsView';
import { StandupsView } from './StandupsView';
import { MetricsView } from './MetricsView';
import { StrategyView } from './StrategyView';
import { POVerificationView } from './POVerificationView';

// ─── Navigation structure ─────────────────────────────────────────────────────

type ViewId =
  | 'day-1' | 'day-2' | 'day-3' | 'day-4' | 'day-5'
  | 'backlog' | 'standups' | 'handoffs' | 'findings'
  | 'metrics' | 'strategy' | 'po-gate';

interface NavItem {
  id: ViewId;
  label: string;
  icon: React.ElementType;
  group: 'sprint' | 'team' | 'mgmt';
  badge?: () => number | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dayLabel(day: number) {
  const themes = [
    'Foundation',
    'Deck + Products',
    'Spark + Demos',
    'Mind + Polish',
    'Integration',
  ];
  return themes[day - 1] ?? `Day ${day}`;
}

// ─── Team legend chip ─────────────────────────────────────────────────────────

function RoleChip({ role }: { role: 'po' | 'claude' | 'lovable' }) {
  const cfg = {
    po:      { label: 'PO/SM',   cls: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: Flag },
    claude:  { label: 'Claude',  cls: 'bg-violet-100 text-violet-800 border-violet-300',    icon: Brain },
    lovable: { label: 'Lovable', cls: 'bg-pink-100 text-pink-800 border-pink-300',          icon: Zap },
  }[role];
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold', cfg.cls)}>
      <Icon className="w-2.5 h-2.5" />{cfg.label}
    </span>
  );
}

// ─── Sidebar nav item ─────────────────────────────────────────────────────────

function NavLink({
  item, active, badge, pct, dayNum, currentDay,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  badge?: number | null;
  pct?: number;
  dayNum?: number;
  currentDay?: number;
  onClick: () => void;
}) {
  const Icon = item.icon;
  const isToday = dayNum !== undefined && dayNum === currentDay;
  const isPast  = dayNum !== undefined && dayNum < (currentDay ?? 0);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left group',
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        isToday && !active && 'ring-1 ring-primary/40',
      )}
    >
      {/* Day completion dot or icon */}
      {dayNum !== undefined ? (
        <span className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0',
          active  ? 'bg-primary-foreground/20 text-primary-foreground' :
          isPast  ? 'bg-green-500 text-white' :
          isToday ? 'bg-primary text-primary-foreground' :
                    'bg-muted-foreground/20 text-muted-foreground',
        )}>
          {isPast ? '✓' : dayNum}
        </span>
      ) : (
        <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-primary-foreground' : '')} />
      )}

      <span className="flex-1 truncate">{item.label}</span>

      {/* Badge count */}
      {badge != null && badge > 0 && (
        <span className={cn(
          'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shrink-0',
          active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-amber-500 text-white',
        )}>
          {badge}
        </span>
      )}

      {/* Day completion pct */}
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

// ─── Main component ───────────────────────────────────────────────────────────

export const SprintTrackerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const {
    state, currentDay, metrics, boardColumns,
    updateTaskStatus, addStandup, getTaskStatus,
  } = useSprintTracker();

  const [activeView, setActiveView] = useState<ViewId>(`day-${currentDay}` as ViewId);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const overallPct = metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0;
  const pendingHandoffs = HANDOFFS.filter(h => getTaskStatus(h.producerTaskId) !== 'completed').length;
  const healthColor = overallPct >= 70 ? 'green' : overallPct >= 40 ? 'amber' : 'red';

  const dayCompletion = (day: number) => {
    const tasks = SPRINT_TASKS.filter(t => t.day === day);
    if (!tasks.length) return 0;
    return Math.round(tasks.filter(t => getTaskStatus(t.id) === 'completed').length / tasks.length * 100);
  };

  const backlogCount = SPRINT_TASKS.filter(t => {
    const d = t.day;
    if (d >= currentDay) return false;
    return getTaskStatus(t.id) !== 'completed';
  }).length;

  // ── Nav items ─────────────────────────────────────────────────────────────
  const NAV: NavItem[] = [
    // Sprint days
    { id: 'day-1', label: `Day 1 · ${dayLabel(1)}`, icon: Calendar, group: 'sprint' },
    { id: 'day-2', label: `Day 2 · ${dayLabel(2)}`, icon: Calendar, group: 'sprint' },
    { id: 'day-3', label: `Day 3 · ${dayLabel(3)}`, icon: Calendar, group: 'sprint' },
    { id: 'day-4', label: `Day 4 · ${dayLabel(4)}`, icon: Calendar, group: 'sprint' },
    { id: 'day-5', label: `Day 5 · ${dayLabel(5)}`, icon: Calendar, group: 'sprint' },
    { id: 'backlog', label: 'Backlog', icon: Archive, group: 'sprint' },
    // Team views
    { id: 'standups', label: 'Standups', icon: MessageSquare, group: 'team' },
    { id: 'handoffs', label: 'Handoffs', icon: Link2, group: 'team', badge: () => pendingHandoffs },
    { id: 'findings', label: 'Findings', icon: Bug, group: 'team' },
    // Management
    { id: 'metrics',  label: 'Metrics',  icon: BarChart3,    group: 'mgmt' },
    { id: 'strategy', label: 'Strategy', icon: Shield,       group: 'mgmt' },
    { id: 'po-gate',  label: 'PO Gate',  icon: ClipboardCheck, group: 'mgmt' },
  ];

  // Map day-N view → board filter
  const activeDayNum = activeView.startsWith('day-')
    ? parseInt(activeView.split('-')[1])
    : undefined;

  // Board columns filtered to a specific day
  const dayBoardColumns = activeDayNum !== undefined ? {
    backlog:    boardColumns.backlog.filter(id => SPRINT_TASKS.find(t => t.id === id)?.day === activeDayNum),
    todo:       boardColumns.todo.filter(id => SPRINT_TASKS.find(t => t.id === id)?.day === activeDayNum),
    inProgress: boardColumns.inProgress.filter(id => SPRINT_TASKS.find(t => t.id === id)?.day === activeDayNum),
    done:       boardColumns.done.filter(id => SPRINT_TASKS.find(t => t.id === id)?.day === activeDayNum),
  } : {
    // Backlog: tasks from past days not completed
    backlog: [],
    todo: SPRINT_TASKS.filter(t => t.day < currentDay && getTaskStatus(t.id) !== 'completed').map(t => t.id),
    inProgress: [],
    done: [],
  };

  // ── View title & role badge ────────────────────────────────────────────────
  const VIEW_META: Record<ViewId, { title: string; subtitle: string }> = {
    'day-1': { title: 'Day 1 Board', subtitle: 'Foundation & Assessment' },
    'day-2': { title: 'Day 2 Board', subtitle: 'Genie Deck + Landing Products' },
    'day-3': { title: 'Day 3 Board', subtitle: 'Genie Spark + Landing Demos' },
    'day-4': { title: 'Day 4 Board', subtitle: 'Genie Mind + Landing Polish' },
    'day-5': { title: 'Day 5 Board', subtitle: 'Integration & Merge' },
    backlog:  { title: 'Backlog',    subtitle: 'Incomplete tasks from past days' },
    standups: { title: 'Standups',   subtitle: 'Daily sync — Claude & Lovable' },
    handoffs: { title: 'Handoffs',   subtitle: 'Cross-team artifact handoffs' },
    findings: { title: 'Findings',   subtitle: 'Issues by severity — Day 1 diagnosis' },
    metrics:  { title: 'Metrics',    subtitle: 'Sprint progress & burndown' },
    strategy: { title: 'Strategy',   subtitle: 'File ownership & territory map' },
    'po-gate':{ title: 'PO Gate',    subtitle: 'Daily sign-off checklist per day' },
  };

  const meta = VIEW_META[activeView];
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ═══════════════════════════════════════════════════════════════════════
          LEFT SIDEBAR — Navigation
      ═══════════════════════════════════════════════════════════════════════ */}
      <aside className={cn(
        'flex flex-col border-r bg-card transition-all duration-200 shrink-0',
        sidebarOpen ? 'w-56' : 'w-0 overflow-hidden border-r-0',
      )}>
        {/* Sidebar header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b shrink-0">
          <Target className="w-4 h-4 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-none truncate">Sprint Tracker</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Feb 17–21 · Day {currentDay}/5</p>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-3 py-3 space-y-5">

            {/* ── Sprint Days ─────────────────────────────────────── */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1.5">Sprint Days</p>
              <div className="space-y-0.5">
                {NAV.filter(n => n.group === 'sprint').map(item => {
                  const dayNum = item.id.startsWith('day-') ? parseInt(item.id.split('-')[1]) : undefined;
                  return (
                    <NavLink
                      key={item.id}
                      item={item}
                      active={activeView === item.id}
                      pct={dayNum !== undefined ? dayCompletion(dayNum) : undefined}
                      dayNum={dayNum}
                      currentDay={currentDay}
                      badge={item.id === 'backlog' ? backlogCount : undefined}
                      onClick={() => setActiveView(item.id)}
                    />
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* ── Team Views ──────────────────────────────────────── */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1.5">Team</p>
              <div className="space-y-0.5">
                {NAV.filter(n => n.group === 'team').map(item => (
                  <NavLink
                    key={item.id}
                    item={item}
                    active={activeView === item.id}
                    badge={item.badge?.()}
                    onClick={() => setActiveView(item.id)}
                  />
                ))}
              </div>
            </div>

            <Separator />

            {/* ── Management ──────────────────────────────────────── */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1.5">Management</p>
              <div className="space-y-0.5">
                {NAV.filter(n => n.group === 'mgmt').map(item => (
                  <NavLink
                    key={item.id}
                    item={item}
                    active={activeView === item.id}
                    onClick={() => setActiveView(item.id)}
                  />
                ))}
              </div>
            </div>

            <Separator />

            {/* ── Team Legend ─────────────────────────────────────── */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">Team</p>
              <div className="space-y-2 px-1">
                <div className="flex items-center gap-2">
                  <RoleChip role="po" />
                  <span className="text-[10px] text-muted-foreground">Gate keeper</span>
                </div>
                <div className="flex items-center gap-2">
                  <RoleChip role="claude" />
                  <span className="text-[10px] text-muted-foreground">Tech lead</span>
                </div>
                <div className="flex items-center gap-2">
                  <RoleChip role="lovable" />
                  <span className="text-[10px] text-muted-foreground">Dev / UI</span>
                </div>
              </div>
            </div>

          </div>
        </ScrollArea>

        {/* Sidebar footer — quick nav */}
        <div className="border-t px-3 py-2 shrink-0 space-y-1">
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

      {/* ═══════════════════════════════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
        <header className="shrink-0 border-b bg-card">

          {/* Row 1: Sidebar toggle + breadcrumb + health strip */}
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
              <span className="text-sm font-semibold truncate">{meta.title}</span>
              <span className="text-xs text-muted-foreground truncate hidden md:inline">· {meta.subtitle}</span>
            </div>

            {/* Health strip — compact pills */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Completed */}
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 border border-green-200">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                <span className="text-xs font-bold text-green-700">{metrics.completed}/{metrics.total}</span>
                <span className="text-[10px] text-green-600 hidden md:inline">done</span>
              </div>

              {/* Handoffs */}
              {pendingHandoffs > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 border border-amber-200">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  <span className="text-xs font-bold text-amber-700">{pendingHandoffs}</span>
                  <span className="text-[10px] text-amber-600 hidden md:inline">handoffs</span>
                </div>
              )}

              {/* Backlog */}
              {backlogCount > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 border border-red-200">
                  <Archive className="w-3 h-3 text-red-600" />
                  <span className="text-xs font-bold text-red-700">{backlogCount}</span>
                  <span className="text-[10px] text-red-600 hidden md:inline">backlog</span>
                </div>
              )}

              {/* Sprint health */}
              <div className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md border',
                healthColor === 'green' ? 'bg-green-50 border-green-200' :
                healthColor === 'amber' ? 'bg-amber-50 border-amber-200' :
                'bg-red-50 border-red-200',
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

          {/* Row 2: Overall progress bar (very slim) */}
          <div className="px-0">
            <Progress
              value={overallPct}
              className="h-0.5 rounded-none"
            />
          </div>

          {/* Row 3: Day tabs (only for day/backlog views) — slim underline style */}
          {(activeView.startsWith('day-') || activeView === 'backlog') && (
            <div className="flex items-center gap-0 px-4 overflow-x-auto">
              {SPRINT_DAYS.map(day => {
                const id = `day-${day.day}` as ViewId;
                const pct = dayCompletion(day.day);
                const isCurrent = day.day === currentDay;
                const isPast = day.day < currentDay;
                const isActive = activeView === id;

                return (
                  <button
                    key={day.day}
                    onClick={() => setActiveView(id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 border-b-2 text-xs font-medium transition-all whitespace-nowrap',
                      isActive
                        ? 'border-primary text-primary'
                        : isPast
                        ? 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40'
                        : isCurrent
                        ? 'border-transparent text-foreground hover:border-muted-foreground/40'
                        : 'border-transparent text-muted-foreground/60 hover:text-muted-foreground',
                    )}
                  >
                    <span className={cn(
                      'w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold',
                      isPast  ? 'bg-green-500 text-white' :
                      isCurrent ? 'bg-primary text-primary-foreground' :
                      'bg-muted text-muted-foreground',
                    )}>
                      {isPast ? '✓' : day.day}
                    </span>
                    <span className="hidden sm:inline">{dayLabel(day.day)}</span>
                    <span className="sm:hidden">D{day.day}</span>
                    <span className={cn(
                      'text-[9px] font-bold px-1 py-0.5 rounded-full',
                      pct === 100 ? 'bg-green-100 text-green-700' :
                      pct > 0    ? 'bg-primary/10 text-primary' :
                      'text-muted-foreground',
                    )}>{pct}%</span>
                  </button>
                );
              })}

              {/* Backlog tab */}
              <button
                onClick={() => setActiveView('backlog')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 border-b-2 text-xs font-medium transition-all whitespace-nowrap',
                  activeView === 'backlog'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40',
                )}
              >
                <Archive className="w-3 h-3" />
                Backlog
                {backlogCount > 0 && (
                  <span className="text-[9px] font-bold bg-red-100 text-red-700 px-1 py-0.5 rounded-full">{backlogCount}</span>
                )}
              </button>
            </div>
          )}
        </header>

        {/* ── CONTENT AREA ─────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-auto">

          {/* Day boards (1–5) */}
          {activeView.startsWith('day-') && activeDayNum !== undefined && (
            <div className="p-4 sm:p-6">
              <BoardView
                boardColumns={dayBoardColumns}
                getTaskStatus={getTaskStatus}
                onStatusChange={updateTaskStatus}
                taskOverrides={state.taskOverrides}
                taskNotes={state.taskNotes}
              />
            </div>
          )}

          {/* Backlog */}
          {activeView === 'backlog' && (
            <div className="p-4 sm:p-6">
              {backlogCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                  <p className="text-sm font-medium">No backlog — all past days are clear! 🎉</p>
                </div>
              ) : (
                <BoardView
                  boardColumns={dayBoardColumns}
                  getTaskStatus={getTaskStatus}
                  onStatusChange={updateTaskStatus}
                  taskOverrides={state.taskOverrides}
                  taskNotes={state.taskNotes}
                />
              )}
            </div>
          )}

          {/* Standups */}
          {activeView === 'standups' && (
            <div className="p-4 sm:p-6">
              <StandupsView
                standups={state.standups}
                selectedDay={currentDay}
                onAddStandup={addStandup}
              />
            </div>
          )}

          {/* Handoffs */}
          {activeView === 'handoffs' && (
            <div className="p-4 sm:p-6">
              <DependenciesView currentDay={currentDay} getTaskStatus={getTaskStatus} />
            </div>
          )}

          {/* Findings */}
          {activeView === 'findings' && (
            <div className="p-4 sm:p-6">
              <FindingsView />
            </div>
          )}

          {/* Metrics */}
          {activeView === 'metrics' && (
            <div className="p-4 sm:p-6">
              <MetricsView metrics={metrics} currentDay={currentDay} />
            </div>
          )}

          {/* Strategy */}
          {activeView === 'strategy' && (
            <div className="p-4 sm:p-6">
              <StrategyView activityLog={state.activityLog} />
            </div>
          )}

          {/* PO Gate */}
          {activeView === 'po-gate' && (
            <div className="p-4 sm:p-6">
              <POVerificationView currentDay={currentDay} getTaskStatus={getTaskStatus} />
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default SprintTrackerDashboard;

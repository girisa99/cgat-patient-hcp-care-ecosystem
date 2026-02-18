/**
 * Effort Tracking View — Automatic time & discipline breakdown for PO/SM review
 *
 * PO/SM only needs to CHECK and CONFIRM — no data entry required.
 * Claude (Team Lead) auto-populates effort data when tasks complete.
 *
 * Shows:
 *  1. Summary: Estimated vs Actual with variance
 *  2. Discipline breakdown (pie/bar chart style)
 *  3. Per-task detail with expandable breakdowns
 *  4. Per-day burndown
 *  5. Developer comparison
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Clock,
  TrendingDown,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Code2,
  Server,
  Users,
  Palette,
  Database,
  GitBranch,
  Blocks,
  TestTube2,
  FileText,
  Search,
  Link,
  Bug,
  BarChart3,
  Timer,
  Target,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EffortMetrics, TaskEffort, Discipline, Developer } from './types';
import { ALL_EFFORT, DISCIPLINE_META, computeEffortMetrics } from './data-effort';
import { SPRINT_TASKS } from './data-tasks';

// Discipline icon map
const DISCIPLINE_ICONS: Record<Discipline, React.ElementType> = {
  frontend: Code2,
  backend: Server,
  ux: Users,
  ui: Palette,
  database: Database,
  devops: GitBranch,
  architecture: Blocks,
  testing: TestTube2,
  documentation: FileText,
  'code-review': Search,
  integration: Link,
  debugging: Bug,
};

interface EffortTrackingViewProps {
  effortMetrics: EffortMetrics;
  currentDay: number;
}

// ── Summary Cards ──
function SummarySection({ metrics }: { metrics: EffortMetrics }) {
  const isUnderBudget = metrics.totalVariance < 0;
  const accuracyLabel = metrics.estimateAccuracy <= 80 ? 'Efficient' :
    metrics.estimateAccuracy <= 100 ? 'On Track' : 'Over Budget';
  const accuracyColor = metrics.estimateAccuracy <= 80 ? 'text-green-600' :
    metrics.estimateAccuracy <= 100 ? 'text-blue-600' : 'text-red-600';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Estimated</span>
          </div>
          <p className="text-2xl font-bold">{metrics.totalEstimated}h</p>
          <p className="text-[10px] text-muted-foreground">{ALL_EFFORT.length} tasks tracked</p>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Actual</span>
          </div>
          <p className="text-2xl font-bold">{metrics.totalActual.toFixed(1)}h</p>
          <p className="text-[10px] text-muted-foreground">
            {metrics.byDeveloper.claude.completedTasks} Claude + {metrics.byDeveloper.lovable.completedTasks} Lovable tasks
          </p>
        </CardContent>
      </Card>

      <Card className={cn("border-border/50", isUnderBudget ? "bg-green-50/50 dark:bg-green-950/20" : "bg-red-50/50 dark:bg-red-950/20")}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            {isUnderBudget ? (
              <TrendingDown className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingUp className="h-4 w-4 text-red-600" />
            )}
            <span className="text-xs text-muted-foreground font-medium">Variance</span>
          </div>
          <p className={cn("text-2xl font-bold", isUnderBudget ? "text-green-600" : "text-red-600")}>
            {isUnderBudget ? '' : '+'}{metrics.totalVariance.toFixed(1)}h
          </p>
          <p className="text-[10px] text-muted-foreground">
            {isUnderBudget ? 'Under budget' : 'Over budget'}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Accuracy</span>
          </div>
          <p className={cn("text-2xl font-bold", accuracyColor)}>
            {metrics.estimateAccuracy}%
          </p>
          <p className="text-[10px] text-muted-foreground">{accuracyLabel}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Discipline Breakdown ──
function DisciplineBreakdownSection({ metrics }: { metrics: EffortMetrics }) {
  const sorted = Object.entries(metrics.byDiscipline)
    .filter(([, v]) => v.hours > 0)
    .sort(([, a], [, b]) => b.hours - a.hours);

  const maxHours = sorted.length > 0 ? sorted[0][1].hours : 1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Time by Discipline
        </CardTitle>
        <CardDescription className="text-xs">
          Where engineering hours are being spent
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {sorted.map(([discipline, data]) => {
          const meta = DISCIPLINE_META[discipline as Discipline];
          const Icon = DISCIPLINE_ICONS[discipline as Discipline] || Code2;
          return (
            <div key={discipline} className="flex items-center gap-3">
              <div className="w-6 flex justify-center">
                <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
              </div>
              <span className="text-xs w-24 truncate font-medium">{meta.label}</span>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(data.hours / maxHours) * 100}%`,
                      backgroundColor: meta.color,
                    }}
                  />
                </div>
              </div>
              <span className="text-xs font-mono w-12 text-right">{data.hours.toFixed(1)}h</span>
              <span className="text-[10px] text-muted-foreground w-10 text-right">{data.percentage}%</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ── Developer Comparison ──
function DeveloperComparisonSection({ metrics }: { metrics: EffortMetrics }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {(['claude', 'lovable'] as Developer[]).map(dev => {
        const data = metrics.byDeveloper[dev];
        const isUnder = data.variance < 0;
        return (
          <Card key={dev} className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Badge variant={dev === 'claude' ? 'default' : 'secondary'} className="text-[10px]">
                  {dev === 'claude' ? 'Claude' : 'Lovable'}
                </Badge>
                <span className="text-muted-foreground text-xs">{data.completedTasks} tasks</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold">{data.estimatedHours}h</p>
                  <p className="text-[10px] text-muted-foreground">Estimated</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{data.actualHours.toFixed(1)}h</p>
                  <p className="text-[10px] text-muted-foreground">Actual</p>
                </div>
                <div>
                  <p className={cn("text-lg font-bold", isUnder ? "text-green-600" : "text-red-600")}>
                    {isUnder ? '' : '+'}{data.variance.toFixed(1)}h
                  </p>
                  <p className="text-[10px] text-muted-foreground">Variance</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-1">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Top Disciplines</p>
                {data.topDisciplines.slice(0, 4).map(td => {
                  const meta = DISCIPLINE_META[td.discipline];
                  const Icon = DISCIPLINE_ICONS[td.discipline] || Code2;
                  return (
                    <div key={td.discipline} className="flex items-center gap-2 text-xs">
                      <Icon className="h-3 w-3" style={{ color: meta.color }} />
                      <span className="flex-1">{meta.label}</span>
                      <span className="font-mono">{td.hours.toFixed(1)}h</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ── Daily Burndown ──
function DailyBurndownSection({ metrics, currentDay }: { metrics: EffortMetrics; currentDay: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Daily Effort & Velocity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(day => {
            const data = metrics.byDay[day];
            const isPast = day < currentDay;
            const isCurrent = day === currentDay;
            const isFuture = day > currentDay;
            const maxHours = Math.max(...Object.values(metrics.byDay).map(d => d.actualHours), 1);
            return (
              <div key={day} className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-colors",
                isCurrent && "bg-primary/5 border border-primary/20",
                isPast && "opacity-90",
                isFuture && "opacity-40",
              )}>
                <div className="w-14 text-xs font-medium">
                  Day {day}
                  {isCurrent && <span className="text-[9px] text-primary ml-0.5">now</span>}
                </div>
                <div className="flex-1">
                  {data.actualHours > 0 ? (
                    <div className="h-5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/70 rounded-full transition-all flex items-center justify-end pr-1"
                        style={{ width: `${Math.max((data.actualHours / maxHours) * 100, 10)}%` }}
                      >
                        <span className="text-[9px] font-mono text-primary-foreground">
                          {data.actualHours.toFixed(1)}h
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-5 bg-muted/50 rounded-full flex items-center pl-2">
                      <span className="text-[9px] text-muted-foreground">
                        {isFuture ? 'upcoming' : 'no data'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="w-12 text-right">
                  <span className="text-xs text-muted-foreground">est: {data.estimatedHours}h</span>
                </div>
                <div className="w-8 text-center">
                  <Badge variant="outline" className="text-[9px] px-1">
                    {data.tasksCompleted}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Per-Task Detail (Expandable) ──
function TaskEffortDetail({ effort }: { effort: TaskEffort }) {
  const [isOpen, setIsOpen] = useState(false);
  const task = SPRINT_TASKS.find(t => t.id === effort.taskId);
  const isUnder = effort.variance < 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left">
          {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}

          <Badge variant="outline" className="text-[10px] font-mono w-12 justify-center">
            {effort.taskId}
          </Badge>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{task?.title || effort.accomplishment.slice(0, 60)}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">est: {effort.estimatedHours}h</span>
            <span className="text-xs font-medium">actual: {effort.actualHours.toFixed(1)}h</span>
            <Badge
              variant={isUnder ? 'default' : 'destructive'}
              className="text-[9px] px-1.5"
            >
              {isUnder ? '' : '+'}{effort.variance.toFixed(1)}h
            </Badge>
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="ml-8 mr-3 mb-3 p-3 rounded-lg bg-muted/30 space-y-3">
          {/* Accomplishment */}
          <p className="text-xs text-muted-foreground">{effort.accomplishment}</p>

          {/* Discipline Breakdown */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Discipline Breakdown</p>
            {effort.breakdown.map((entry, i) => {
              const meta = DISCIPLINE_META[entry.discipline];
              const Icon = DISCIPLINE_ICONS[entry.discipline] || Code2;
              const pct = effort.actualHours > 0 ? Math.round((entry.hours / effort.actualHours) * 100) : 0;
              return (
                <div key={i} className="flex items-start gap-2">
                  <div className="mt-0.5 w-5 flex justify-center">
                    <Icon className="h-3 w-3" style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium" style={{ color: meta.color }}>{meta.label}</span>
                      <span className="text-[10px] font-mono">{entry.hours.toFixed(2)}h</span>
                      <span className="text-[9px] text-muted-foreground">({pct}%)</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-snug">{entry.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Issues Fixed */}
          {effort.issuesFixed && effort.issuesFixed.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-[10px] text-muted-foreground mr-1">Fixed:</span>
              {effort.issuesFixed.map(id => (
                <Badge key={id} variant="outline" className="text-[9px] px-1 bg-green-50 text-green-700 border-green-300 dark:bg-green-950/30 dark:text-green-400">
                  <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />{id}
                </Badge>
              ))}
            </div>
          )}

          {/* Files + Lines */}
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            {effort.filesModified.length > 0 && (
              <span>{effort.filesModified.length} files modified</span>
            )}
            {effort.linesChanged != null && effort.linesChanged > 0 && (
              <span>{effort.linesChanged} lines changed</span>
            )}
            {effort.startedAt && effort.completedAt && (
              <span>
                {new Date(effort.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {' → '}
                {new Date(effort.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ── Main View ──
export const EffortTrackingView: React.FC<EffortTrackingViewProps> = ({ effortMetrics, currentDay }) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const filteredEfforts = useMemo(() => {
    if (selectedDay === null) return ALL_EFFORT;
    return ALL_EFFORT.filter(e => e.day === selectedDay);
  }, [selectedDay]);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Effort Tracking
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Auto-populated by Claude (Team Lead). PO/SM: review and confirm only.
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={selectedDay === null ? 'default' : 'outline'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setSelectedDay(null)}
            >
              All Days
            </Button>
            {[1, 2, 3, 4, 5].map(d => (
              <Button
                key={d}
                variant={selectedDay === d ? 'default' : 'outline'}
                size="sm"
                className={cn("h-7 px-2 text-xs", d > currentDay && "opacity-40")}
                onClick={() => setSelectedDay(d)}
                disabled={d > currentDay}
              >
                D{d}
              </Button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <SummarySection metrics={effortMetrics} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Discipline Breakdown */}
          <DisciplineBreakdownSection metrics={effortMetrics} />

          {/* Right: Daily Burndown */}
          <DailyBurndownSection metrics={effortMetrics} currentDay={currentDay} />
        </div>

        {/* Developer Comparison */}
        <DeveloperComparisonSection metrics={effortMetrics} />

        {/* Per-Task Detail */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Task-Level Effort Detail
              <Badge variant="outline" className="text-[10px]">{filteredEfforts.length} tasks</Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Click any task to see full discipline breakdown, issues fixed, and files touched
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-0.5">
            {filteredEfforts.map(effort => (
              <TaskEffortDetail key={effort.taskId} effort={effort} />
            ))}
            {filteredEfforts.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                No effort data for this day yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

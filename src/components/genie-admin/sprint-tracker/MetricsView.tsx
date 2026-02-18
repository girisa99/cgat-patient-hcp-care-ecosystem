// Sprint Tracker — Metrics View (live progress, burndown, velocity)
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SprintMetrics, Developer } from './types';
import { SPRINT_DAYS } from './data-config';

interface MetricsViewProps {
  metrics: SprintMetrics;
  currentDay: number;
}

export const MetricsView: React.FC<MetricsViewProps> = ({ metrics, currentDay }) => {
  const overallPct = Math.round((metrics.completed / metrics.total) * 100);
  const expectedPct = Math.round((currentDay / 5) * 100);
  const onTrack = overallPct >= expectedPct - 10;

  return (
    <div className="space-y-6">
      {/* Overall hero */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
        <CardContent className="p-6 text-center space-y-2">
          <p className="text-5xl font-bold">{overallPct}%</p>
          <p className="text-base text-muted-foreground">Overall Sprint Completion</p>
          <p className="text-sm text-muted-foreground">
            {metrics.completed} of {metrics.total} tasks completed
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            {onTrack ? (
              <Badge className="bg-green-100 text-green-700 text-sm">On Track</Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-700 text-sm">
                <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Behind Schedule
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">Expected: {expectedPct}% by Day {currentDay}</span>
          </div>
          {metrics.backlogCount > 0 && (
            <p className="text-sm text-amber-600 mt-1">
              {metrics.backlogCount} task{metrics.backlogCount > 1 ? 's' : ''} in backlog from previous days
            </p>
          )}
        </CardContent>
      </Card>

      {/* By developer */}
      <div className="grid md:grid-cols-2 gap-4">
        {(['lovable', 'claude'] as Developer[]).map(dev => {
          const data = metrics.byDeveloper[dev];
          const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
          const isLovable = dev === 'lovable';
          return (
            <Card key={dev}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  {isLovable ? <Zap className="w-6 h-6 text-pink-600" /> : <Brain className="w-6 h-6 text-purple-600" />}
                  <div>
                    <p className="text-base font-semibold">{isLovable ? 'Lovable' : 'Claude Code'}</p>
                    <p className="text-sm text-muted-foreground">{isLovable ? 'Landing & Marketing' : 'CREATE Tools'}</p>
                  </div>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{data.completed}/{data.total} tasks</span>
                  <span className="font-bold">{pct}%</span>
                </div>
                <Progress value={pct} className="h-2.5" />
                <div className="flex gap-3 text-sm">
                  <span className="text-green-600">{data.completed} done</span>
                  <span className="text-blue-600">{data.inProgress} active</span>
                  <span className="text-gray-500">{data.total - data.completed - data.inProgress} pending</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* By day - burndown style */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Completion by Sprint Day
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {SPRINT_DAYS.map(day => {
            const data = metrics.byDay[day.day] ?? { total: 0, completed: 0 };
            const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
            const isPast = day.day < currentDay;
            const isCurrent = day.day === currentDay;
            return (
              <div key={day.day}>
                <div className="flex justify-between items-center text-sm mb-1.5">
                  <span className="flex items-center gap-2">
                    <span className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                      isPast && 'bg-green-500 text-white',
                      isCurrent && 'bg-primary text-primary-foreground ring-2 ring-primary/30',
                      !isPast && !isCurrent && 'bg-muted text-muted-foreground',
                    )}>{day.day}</span>
                    <span className={cn(isCurrent && 'font-semibold')}>{day.theme}</span>
                    {isCurrent && <Badge className="bg-blue-100 text-blue-700 text-xs">Today</Badge>}
                  </span>
                  <span className="font-medium">{data.completed}/{data.total} ({pct}%)</span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

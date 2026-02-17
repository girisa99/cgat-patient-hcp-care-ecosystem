/**
 * Goal Tracking Component
 * P4-ANA-30: Goal & KPI Tracking
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { businessAnalyticsService, Goal } from '@/services/analytics/businessAnalyticsService';
import { Target, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const GoalTrackingPanel: React.FC = () => {
  const { data: goals, isLoading } = useQuery({
    queryKey: ['analytics', 'goals'],
    queryFn: () => businessAnalyticsService.getGoals(),
    staleTime: 5 * 60 * 1000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'on_track': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'at_risk': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'behind': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'achieved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'on_track': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'at_risk': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'behind': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue': return '💰';
      case 'growth': return '📈';
      case 'engagement': return '🎯';
      case 'quality': return '⭐';
      case 'efficiency': return '⚡';
      default: return '📊';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'USD') return `$${value.toLocaleString()}`;
    if (unit === '%') return `${value}%`;
    return value.toLocaleString();
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-muted/50 rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const onTrackCount = goals?.filter(g => g.status === 'on_track' || g.status === 'achieved').length || 0;
  const totalCount = goals?.length || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Goals & KPIs
            </CardTitle>
            <CardDescription>Track progress toward your objectives</CardDescription>
          </div>
          <Badge variant="outline" className="text-sm">
            {onTrackCount}/{totalCount} On Track
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals?.map((goal) => (
            <div
              key={goal.goalId}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{goal.goalName}</h4>
                      <Badge className={getStatusColor(goal.status)}>
                        {getStatusIcon(goal.status)}
                        <span className="ml-1 capitalize">{goal.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      Due: {new Date(goal.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {formatValue(goal.currentValue, goal.unit)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    of {formatValue(goal.targetValue, goal.unit)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{goal.progress}%</span>
                </div>
                <Progress 
                  value={goal.progress} 
                  className={`h-2 ${
                    goal.status === 'behind' ? '[&>div]:bg-red-500' :
                    goal.status === 'at_risk' ? '[&>div]:bg-yellow-500' :
                    goal.status === 'achieved' ? '[&>div]:bg-green-500' :
                    ''
                  }`}
                />
              </div>

              {/* Milestones */}
              {goal.milestones.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Milestones:</p>
                  <div className="flex gap-2">
                    {goal.milestones.map((milestone, i) => (
                      <div
                        key={i}
                        className={`flex-1 p-2 rounded text-center text-xs ${
                          milestone.actual !== undefined
                            ? milestone.actual >= milestone.target
                              ? 'bg-green-100 dark:bg-green-900/30'
                              : 'bg-red-100 dark:bg-red-900/30'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="font-medium">
                          {new Date(milestone.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p>{formatValue(milestone.target, goal.unit)}</p>
                        {milestone.actual !== undefined && (
                          <p className="text-muted-foreground">
                            ({formatValue(milestone.actual, goal.unit)})
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalTrackingPanel;

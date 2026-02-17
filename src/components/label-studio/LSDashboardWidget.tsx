import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLabelStudio } from '@/hooks/useLabelStudio';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface LSDashboardWidgetProps {
  projectId?: number;
  compact?: boolean;
  showActions?: boolean;
}

export const LSDashboardWidget: React.FC<LSDashboardWidgetProps> = ({
  projectId,
  compact = false,
  showActions = true
}) => {
  const [stats, setStats] = useState({
    totalProjects: 3,
    activeTasks: 156,
    completedTasks: 892,
    pendingTasks: 42,
    averageCompletionTime: 2.4,
    accuracyRate: 94.2,
    activeAnnotators: 8,
    recentActivity: [
      { project: 'Medical X-Ray Analysis', action: '12 tasks completed', time: '2 hours ago' },
      { project: 'Sentiment Analysis', action: 'Quality check passed', time: '4 hours ago' },
      { project: 'Object Detection', action: '25 new tasks added', time: '6 hours ago' }
    ]
  });

  const { loading, listProjects } = useLabelStudio();

  const refreshStats = async () => {
    // In real implementation, fetch actual stats from Label Studio API
    console.log('Refreshing Label Studio stats...');
  };

  useEffect(() => {
    refreshStats();
  }, [projectId]);

  const completionRate = ((stats.completedTasks / (stats.completedTasks + stats.pendingTasks)) * 100);

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Label Studio</CardTitle>
            <Badge variant="secondary">{stats.totalProjects} projects</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Completion</span>
              <span className="text-sm font-medium">{completionRate.toFixed(1)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-green-600">{stats.completedTasks}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div>
                <p className="text-lg font-bold text-orange-600">{stats.pendingTasks}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
            {showActions && (
              <Link to="/label-studio-enhanced">
                <Button size="sm" variant="outline" className="w-full">
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Open Label Studio
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Label Studio Overview</h3>
          <p className="text-sm text-muted-foreground">
            Annotation projects and task progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={refreshStats} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {showActions && (
            <Link to="/label-studio-enhanced">
              <Button size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Dashboard
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">{stats.totalProjects}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <p className="text-xs text-green-600">2 new this week</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Tasks</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <Activity className="h-3 w-3 text-blue-500 mr-1" />
              <p className="text-xs text-blue-600">+15% from last week</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Tasks</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingTasks}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex items-center mt-2">
              <AlertCircle className="h-3 w-3 text-orange-500 mr-1" />
              <p className="text-xs text-orange-600">Requires attention</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                <p className="text-2xl font-bold">{stats.accuracyRate}%</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <p className="text-xs text-green-600">Above target</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>
            Task completion across all active projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Completion</span>
              <span className="text-sm text-muted-foreground">
                {stats.completedTasks} / {stats.completedTasks + stats.pendingTasks} tasks
              </span>
            </div>
            <Progress value={completionRate} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{completionRate.toFixed(1)}% completed</span>
              <span>Est. completion: 3 days</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{activity.project}</p>
                  <p className="text-sm text-muted-foreground">{activity.action}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
          {showActions && (
            <div className="mt-4 pt-4 border-t">
              <Link to="/label-studio-enhanced">
                <Button variant="outline" size="sm" className="w-full">
                  View All Activity
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {showActions && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/label-studio-enhanced">
                <Button variant="outline" size="sm" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Projects
                </Button>
              </Link>
              <Link to="/label-studio-enhanced">
                <Button variant="outline" size="sm" className="w-full">
                  <Activity className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
              <Link to="/label-studio-enhanced">
                <Button variant="outline" size="sm" className="w-full">
                  <Clock className="h-4 w-4 mr-2" />
                  Batch Operations
                </Button>
              </Link>
              <Link to="/label-studio-enhanced">
                <Button variant="outline" size="sm" className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Templates
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
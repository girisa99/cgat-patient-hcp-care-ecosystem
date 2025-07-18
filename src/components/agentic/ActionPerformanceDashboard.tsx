import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, Clock, CheckCircle, AlertTriangle, TrendingUp,
  BarChart3, Gauge, Timer, Zap, AlertCircle, PlayCircle,
  PauseCircle, RotateCcw, Target, Users, Calendar
} from 'lucide-react';

interface ActionMetrics {
  executionCount: number;
  successRate: number;
  averageExecutionTime: number;
  lastExecuted: string;
  failureCount: number;
  retryCount: number;
  averageRetryTime: number;
  status: 'active' | 'paused' | 'failed' | 'scheduled';
  healthScore: number;
}

interface ExecutionHistory {
  id: string;
  timestamp: string;
  status: 'success' | 'failed' | 'retrying' | 'timeout';
  executionTime: number;
  errorMessage?: string;
  retryAttempt?: number;
}

interface ActionPerformanceDashboardProps {
  actionId: string;
  actionName: string;
  metrics: ActionMetrics;
  executionHistory: ExecutionHistory[];
  onPause: () => void;
  onResume: () => void;
  onRetry: () => void;
}

export const ActionPerformanceDashboard: React.FC<ActionPerformanceDashboardProps> = ({
  actionId,
  actionName,
  metrics,
  executionHistory,
  onPause,
  onResume,
  onRetry
}) => {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'paused': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      case 'scheduled': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <PlayCircle className="h-4 w-4" />;
      case 'paused': return <PauseCircle className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      case 'scheduled': return <Calendar className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getExecutionStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'retrying': return <RotateCcw className="h-4 w-4 text-yellow-500" />;
      case 'timeout': return <Timer className="h-4 w-4 text-orange-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Mock recent executions for demonstration
  const recentExecutions = executionHistory.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header with Action Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance Dashboard: {actionName}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time monitoring and performance metrics
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 ${getStatusColor(metrics.status)}`}>
                {getStatusIcon(metrics.status)}
                <span className="font-medium capitalize">{metrics.status}</span>
              </div>
              <div className="flex gap-2">
                {metrics.status === 'active' ? (
                  <Button variant="outline" size="sm" onClick={onPause}>
                    <PauseCircle className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={onResume}>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={onRetry}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total Executions</span>
            </div>
            <div className="text-2xl font-bold">{metrics.executionCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Success Rate</span>
            </div>
            <div className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.executionCount - metrics.failureCount} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Avg Execution Time</span>
            </div>
            <div className="text-2xl font-bold">{formatDuration(metrics.averageExecutionTime)}</div>
            <p className="text-xs text-muted-foreground">Per execution</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Health Score</span>
            </div>
            <div className={`text-2xl font-bold ${getHealthScoreColor(metrics.healthScore)}`}>
              {metrics.healthScore}/100
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.healthScore >= 90 ? 'Excellent' : 
               metrics.healthScore >= 70 ? 'Good' : 'Needs attention'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Failures</span>
                </div>
                <div className="text-lg font-bold">{metrics.failureCount}</div>
                <p className="text-xs text-muted-foreground">
                  {((metrics.failureCount / metrics.executionCount) * 100).toFixed(1)}% failure rate
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <RotateCcw className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Retries</span>
                </div>
                <div className="text-lg font-bold">{metrics.retryCount}</div>
                <p className="text-xs text-muted-foreground">
                  Avg: {formatDuration(metrics.averageRetryTime)}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Last Executed</span>
                </div>
                <div className="text-sm">{formatDate(metrics.lastExecuted)}</div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Trend</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {metrics.successRate > 95 ? 'Improving' : 
                   metrics.successRate > 85 ? 'Stable' : 'Declining'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Execution History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Executions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {recentExecutions.length > 0 ? (
                  recentExecutions.map((execution) => (
                    <div key={execution.id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getExecutionStatusIcon(execution.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium capitalize">{execution.status}</span>
                            {execution.retryAttempt && (
                              <Badge variant="outline" className="text-xs">
                                Retry #{execution.retryAttempt}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(execution.timestamp)}
                          </p>
                          {execution.errorMessage && (
                            <p className="text-xs text-red-600 truncate max-w-[200px]">
                              {execution.errorMessage}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatDuration(execution.executionTime)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No executions yet</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Alert Thresholds & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alerts & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.successRate < 90 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Low Success Rate</h4>
                  <p className="text-sm text-yellow-700">
                    Success rate is below 90%. Consider reviewing error logs and adjusting retry policies.
                  </p>
                </div>
              </div>
            )}

            {metrics.averageExecutionTime > 30000 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <Timer className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-800">Slow Execution</h4>
                  <p className="text-sm text-orange-700">
                    Average execution time is over 30 seconds. Consider optimizing the action or adjusting timeout settings.
                  </p>
                </div>
              </div>
            )}

            {metrics.retryCount > metrics.executionCount * 0.1 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <RotateCcw className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">High Retry Rate</h4>
                  <p className="text-sm text-red-700">
                    Retry rate is high. This may indicate connectivity issues or service instability.
                  </p>
                </div>
              </div>
            )}

            {metrics.healthScore >= 95 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Excellent Performance</h4>
                  <p className="text-sm text-green-700">
                    Action is performing excellently with high success rate and optimal execution times.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
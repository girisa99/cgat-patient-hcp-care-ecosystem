
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { useHealthMonitor } from '@/hooks/useHealthMonitor';
import { errorManager } from '@/utils/error/ErrorManager';
import { QueryOptimizer } from '@/utils/performance/QueryOptimizer';

const EnhancedSystemStatusDisplay: React.FC = () => {
  const { health } = useHealthMonitor({ autoRefresh: true });
  
  // Get error statistics
  const errorStats = errorManager.getErrorStats();
  
  // Get performance statistics
  const performanceStats = QueryOptimizer.getPerformanceStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* System Health */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {health?.overall === 'healthy' ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              )}
              <span className="font-medium">
                {health?.overall ? health.overall.toUpperCase() : 'CHECKING...'}
              </span>
            </div>
            {health && (
              <Badge variant={health.overall === 'healthy' ? 'default' : 'secondary'}>
                {health.checks.filter(c => c.status === 'healthy').length}/{health.checks.length}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Statistics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Error Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {errorStats.total}
            </div>
            <div className="flex space-x-2">
              <Badge variant="destructive" className="text-xs">
                {errorStats.bySeverity.critical} Critical
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {errorStats.bySeverity.high} High
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Cache Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {performanceStats.cacheStats.hitRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              Hit Rate ({performanceStats.cacheStats.size} cached)
            </div>
            <div className="text-xs text-muted-foreground">
              Avg: {performanceStats.cacheStats.avgExecutionTime.toFixed(0)}ms
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Query Performance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Query Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {performanceStats.queryStats.totalQueries}
            </div>
            <div className="text-xs text-muted-foreground">
              Total Queries (1h)
            </div>
            {performanceStats.queryStats.slowQueries.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {performanceStats.queryStats.slowQueries.length} Slow
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedSystemStatusDisplay;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MemoryStick, 
  RefreshCw,
  Zap 
} from 'lucide-react';
import { useHealthMonitor } from '@/hooks/useHealthMonitor';
import { HealthCheck } from '@/utils/monitoring/HealthMonitor';

const HealthDashboard: React.FC = () => {
  const { 
    health, 
    isLoading, 
    error, 
    runHealthCheck, 
    getSystemMetrics 
  } = useHealthMonitor({
    autoRefresh: true,
    refreshInterval: 30000
  });

  const systemMetrics = getSystemMetrics();

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: HealthCheck['status']) => {
    const variants = {
      healthy: 'default',
      warning: 'secondary',
      unhealthy: 'destructive',
      unknown: 'outline'
    } as const;

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const formatUptime = (uptimeMs: number) => {
    const seconds = Math.floor(uptimeMs / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health</h2>
          <p className="text-muted-foreground">
            Monitor application health and performance metrics
          </p>
        </div>
        <Button 
          onClick={runHealthCheck} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-800">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span>Health check failed: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {health && (
        <>
          {/* Overall Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Overall System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {getStatusIcon(health.overall === 'healthy' ? 'healthy' : 
                                  health.overall === 'degraded' ? 'warning' : 'unhealthy')}
                    <span className="ml-2 font-medium">
                      {health.overall.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    Uptime: {formatUptime(health.uptime)}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Last checked: {health.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {systemMetrics.memoryUsage && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <MemoryStick className="h-4 w-4 mr-2" />
                    Memory Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {systemMetrics.memoryUsage.used}MB
                    </div>
                    <Progress 
                      value={(systemMetrics.memoryUsage.used / systemMetrics.memoryUsage.limit) * 100} 
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground">
                      {systemMetrics.memoryUsage.used}MB of {systemMetrics.memoryUsage.limit}MB
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {systemMetrics.performanceMetrics.navigation && (
                    <>
                      <div className="text-2xl font-bold">
                        {Math.round(systemMetrics.performanceMetrics.navigation.loadEventEnd - 
                                   systemMetrics.performanceMetrics.navigation.navigationStart)}ms
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Page Load Time
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Health Checks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {health.checks.filter(c => c.status === 'healthy').length}/{health.checks.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Passing Checks
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Individual Health Checks */}
          <Card>
            <CardHeader>
              <CardTitle>Health Check Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {health.checks.map((check) => (
                  <div key={check.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <div className="font-medium capitalize">
                          {check.name.replace(/-/g, ' ')}
                        </div>
                        {check.message && (
                          <div className="text-sm text-muted-foreground">
                            {check.message}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {check.responseTime && (
                        <div className="text-sm text-muted-foreground">
                          {check.responseTime.toFixed(2)}ms
                        </div>
                      )}
                      {getStatusBadge(check.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default HealthDashboard;

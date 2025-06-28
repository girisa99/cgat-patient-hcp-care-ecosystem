
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cpu, Network, Bell } from 'lucide-react';
import { ComprehensiveSecurityPerformanceSummary } from '@/utils/verification/EnhancedSecurityPerformanceOrchestrator';

interface SecurityLiveMonitoringProps {
  comprehensiveSummary: ComprehensiveSecurityPerformanceSummary | null;
}

const SecurityLiveMonitoring: React.FC<SecurityLiveMonitoringProps> = ({
  comprehensiveSummary
}) => {
  if (!comprehensiveSummary) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading monitoring data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <Cpu className="h-4 w-4 mr-2" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((comprehensiveSummary.realUserMetrics.memoryUsage.heapUsed / comprehensiveSummary.realUserMetrics.memoryUsage.heapTotal) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {comprehensiveSummary.realUserMetrics.memoryUsage.memoryLeaks.length} leaks detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <Network className="h-4 w-4 mr-2" />
              Core Web Vitals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {comprehensiveSummary.realUserMetrics.coreWebVitals.lcp}ms
            </div>
            <p className="text-xs text-muted-foreground">
              LCP (Target: &lt;2500ms)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <Bell className="h-4 w-4 mr-2" />
              Active Threats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {comprehensiveSummary.runtimeSecurity.activeThreats.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {comprehensiveSummary.runtimeSecurity.activeThreats.filter(t => !t.mitigated).length} unmitigated
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Priority Actions */}
      {comprehensiveSummary.priorityActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Priority Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {comprehensiveSummary.priorityActions.slice(0, 5).map((action, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Badge variant={action.priority === 'critical' ? 'destructive' : 'default'}>
                    {action.priority}
                  </Badge>
                  <div className="flex-1">
                    <h4 className="font-medium">{action.title}</h4>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                    <p className="text-xs text-blue-600 mt-1">Timeline: {action.timeline}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SecurityLiveMonitoring;

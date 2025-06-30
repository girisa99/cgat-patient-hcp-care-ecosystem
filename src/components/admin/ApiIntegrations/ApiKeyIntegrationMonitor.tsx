
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApiKeyMonitor } from '@/hooks/useApiKeyMonitor';
import { 
  Activity, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  Clock,
  BarChart3
} from 'lucide-react';

const ApiKeyIntegrationMonitor: React.FC = () => {
  console.log('🚀 ApiKeyIntegrationMonitor: Component rendering');
  
  const { 
    usage, 
    metrics, 
    alerts, 
    isLoading 
  } = useApiKeyMonitor();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Loading API key monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">API Key Monitoring</h3>
          <p className="text-sm text-muted-foreground">
            Monitor API key usage, performance, and security metrics
          </p>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{metrics?.totalRequests || 0}</p>
                <p className="text-sm text-muted-foreground">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{metrics?.successRate || 0}%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{metrics?.avgResponseTime || 0}ms</p>
                <p className="text-sm text-muted-foreground">Avg Response</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{alerts?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Recent API Key Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usage && usage.length > 0 ? (
            <div className="space-y-3">
              {usage.slice(0, 5).map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">{entry.keyName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {entry.endpoint} - {entry.method}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={entry.status === 200 ? 'default' : 'destructive'}>
                      {entry.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {entry.responseTime}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recent API key usage</p>
          )}
        </CardContent>
      </Card>

      {/* Security Alerts */}
      {alerts && alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Security Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded border-orange-200 bg-orange-50">
                  <div>
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                  <Badge variant="destructive">{alert.severity}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApiKeyIntegrationMonitor;

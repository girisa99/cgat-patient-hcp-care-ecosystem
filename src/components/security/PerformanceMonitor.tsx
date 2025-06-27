
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Zap, 
  Server, 
  Clock,
  TrendingUp,
  Database,
  Globe,
  Cpu
} from 'lucide-react';

const PerformanceMonitor: React.FC = () => {
  const performanceMetrics = [
    {
      title: 'API Response Time',
      value: '1.2s',
      percentage: 85,
      icon: Zap,
      trend: '+5%'
    },
    {
      title: 'Database Query Time',
      value: '45ms',
      percentage: 92,
      icon: Database,
      trend: '-2%'
    },
    {
      title: 'Server CPU Usage',
      value: '32%',
      percentage: 68,
      icon: Cpu,
      trend: '+1%'
    },
    {
      title: 'Network Latency',
      value: '23ms',
      percentage: 88,
      icon: Globe,
      trend: '-3%'
    }
  ];

  const systemHealth = [
    { component: 'Web Server', status: 'Healthy', uptime: '99.9%' },
    { component: 'Database', status: 'Healthy', uptime: '99.8%' },
    { component: 'API Gateway', status: 'Healthy', uptime: '99.7%' },
    { component: 'Authentication', status: 'Healthy', uptime: '100%' }
  ];

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <div className="flex items-center">
                  <metric.icon className="h-4 w-4 mr-2" />
                  {metric.title}
                </div>
                <span className="text-xs text-muted-foreground">{metric.trend}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{metric.value}</div>
                <Progress value={metric.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Performance Score: {metric.percentage}%
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            System Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemHealth.map((system) => (
              <div key={system.component} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">{system.component}</p>
                    <p className="text-sm text-muted-foreground">{system.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{system.uptime}</p>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Performance Trends (Last 24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Response Time Trends</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Peak Performance</span>
                  <span className="text-sm font-medium">0.8s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average</span>
                  <span className="text-sm font-medium">1.2s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Slowest Response</span>
                  <span className="text-sm font-medium">2.1s</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Resource Usage</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Memory Usage</span>
                  <span className="text-sm font-medium">64%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Disk I/O</span>
                  <span className="text-sm font-medium">23%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Network Traffic</span>
                  <span className="text-sm font-medium">156 MB</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;

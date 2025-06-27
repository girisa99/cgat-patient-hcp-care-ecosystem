
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity, Zap, Database, Cpu, Globe } from 'lucide-react';

const PerformanceMetricsCard: React.FC = () => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Performance Metrics
        </CardTitle>
        <CardDescription>System performance and response times</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {performanceMetrics.map((metric) => (
            <div key={metric.title} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className="h-5 w-5" />
                <span className="text-xs text-muted-foreground">{metric.trend}</span>
              </div>
              <div className="text-2xl font-bold mb-2">{metric.value}</div>
              <p className="text-sm font-medium mb-2">{metric.title}</p>
              <Progress value={metric.percentage} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">
                Performance Score: {metric.percentage}%
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetricsCard;

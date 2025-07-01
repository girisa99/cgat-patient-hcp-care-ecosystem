
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  Database, 
  Globe, 
  HardDrive, 
  RefreshCw,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';

interface HealthMetric {
  name: string;
  value: number;
  status: 'healthy' | 'warning' | 'critical';
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
}

interface SystemStats {
  uptime: string;
  responseTime: number;
  throughput: number;
  errorRate: number;
  activeUsers: number;
  databaseConnections: number;
}

const HealthDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Mock health metrics - in real app these would come from monitoring APIs
  const [healthMetrics] = useState<HealthMetric[]>([
    { name: 'CPU Usage', value: 45, status: 'healthy', unit: '%', trend: 'stable' },
    { name: 'Memory Usage', value: 62, status: 'healthy', unit: '%', trend: 'up' },
    { name: 'Database Performance', value: 89, status: 'healthy', unit: '%', trend: 'stable' },
    { name: 'API Response Time', value: 245, status: 'healthy', unit: 'ms', trend: 'down' },
    { name: 'Error Rate', value: 0.5, status: 'healthy', unit: '%', trend: 'stable' },
    { name: 'Disk Usage', value: 73, status: 'warning', unit: '%', trend: 'up' }
  ]);

  const [systemStats] = useState<SystemStats>({
    uptime: '15 days, 4 hours',
    responseTime: 245,
    throughput: 1250,
    errorRate: 0.5,
    activeUsers: 47,
    databaseConnections: 12
  });

  const [performanceData] = useState({
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    datasets: [
      {
        label: 'Response Time (ms)',
        data: [200, 180, 220, 190, 210, 245, 230],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
      {
        label: 'CPU Usage (%)',
        data: [30, 35, 45, 40, 50, 45, 42],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
      }
    ]
  });

  const refreshMetrics = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-green-500 rotate-180" />;
      case 'stable': return <Activity className="h-3 w-3 text-blue-500" />;
      default: return null;
    }
  };

  // Calculate performance timing safely
  const getPerformanceTiming = () => {
    if (typeof window !== 'undefined' && window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      // Use loadEventEnd instead of navigationStart which doesn't exist on PerformanceNavigationTiming
      const loadTime = timing.loadEventEnd - timing.fetchStart;
      return loadTime > 0 ? loadTime : 0;
    }
    return 0;
  };

  useEffect(() => {
    const loadTime = getPerformanceTiming();
    if (loadTime > 0) {
      console.log(`Page load time: ${loadTime}ms`);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health Dashboard</h2>
          <p className="text-gray-600">Monitor system performance and health metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button 
            onClick={refreshMetrics} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.uptime}</div>
            <Badge variant="outline" className="mt-2 bg-green-50 text-green-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              Stable
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.responseTime}ms</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 rotate-180 mr-1" />
              <span className="text-xs text-green-600">Improving</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.activeUsers}</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-blue-500 mr-1" />
              <span className="text-xs text-blue-600">Active</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.errorRate}%</div>
            <Badge variant="outline" className="mt-2 bg-green-50 text-green-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              Low
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Health Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Health Metrics</CardTitle>
          <CardDescription>
            Real-time system performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {healthMetrics.map((metric, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(metric.status)}`} />
                    <span className="font-medium">{metric.name}</span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(metric.status)}
                    <span className="text-lg font-bold">
                      {metric.value}{metric.unit}
                    </span>
                  </div>
                </div>
                <Progress 
                  value={metric.name === 'API Response Time' ? Math.min(metric.value / 10, 100) : metric.value} 
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              System Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>CPU Usage</span>
              <span className="font-mono">45%</span>
            </div>
            <Progress value={45} className="w-full" />
            
            <div className="flex items-center justify-between">
              <span>Memory Usage</span>
              <span className="font-mono">62%</span>
            </div>
            <Progress value={62} className="w-full" />
            
            <div className="flex items-center justify-between">
              <span>Disk Usage</span>
              <span className="font-mono text-yellow-600">73%</span>
            </div>
            <Progress value={73} className="w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Active Connections</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {systemStats.databaseConnections}/50
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Query Performance</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Optimal
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Replication Status</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                In Sync
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Backup Status</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Current
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network & External Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Network & External Services
          </CardTitle>
          <CardDescription>
            Status of external API integrations and network connectivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">External APIs</div>
                <div className="text-sm text-gray-500">12 services</div>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                All Online
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">CDN Status</div>
                <div className="text-sm text-gray-500">Global</div>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Healthy
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">SSL Certificate</div>
                <div className="text-sm text-gray-500">Valid until Dec 2024</div>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Valid
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Monitoring</div>
                <div className="text-sm text-gray-500">Real-time</div>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthDashboard;

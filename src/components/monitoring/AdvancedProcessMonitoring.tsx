import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  BarChart3, 
  Clock, 
  Cpu, 
  Database, 
  Network,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Server,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricData {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'healthy' | 'warning' | 'critical';
}

interface ProcessMonitoringProps {
  agentId?: string;
  processId?: string;
}

export const AdvancedProcessMonitoring: React.FC<ProcessMonitoringProps> = ({
  agentId,
  processId
}) => {
  const [metrics, setMetrics] = useState<MetricData[]>([
    { name: 'CPU Usage', value: 45, unit: '%', trend: 'up', status: 'healthy' },
    { name: 'Memory', value: 68, unit: '%', trend: 'stable', status: 'healthy' },
    { name: 'Network I/O', value: 1.2, unit: 'MB/s', trend: 'down', status: 'healthy' },
    { name: 'Response Time', value: 85, unit: 'ms', trend: 'up', status: 'warning' },
    { name: 'Error Rate', value: 0.3, unit: '%', trend: 'down', status: 'healthy' },
    { name: 'Throughput', value: 450, unit: 'req/min', trend: 'up', status: 'healthy' }
  ]);

  const [logs, setLogs] = useState([
    { timestamp: '14:30:15', level: 'INFO', message: 'Agent workflow started successfully', component: 'WorkflowEngine' },
    { timestamp: '14:30:12', level: 'DEBUG', message: 'Node configuration validated', component: 'NodeValidator' },
    { timestamp: '14:30:10', level: 'INFO', message: 'Database connection established', component: 'DataLayer' },
    { timestamp: '14:30:08', level: 'WARN', message: 'High memory usage detected', component: 'ResourceMonitor' },
    { timestamp: '14:30:05', level: 'INFO', message: 'Real-time sync initialized', component: 'SyncEngine' }
  ]);

  const [alerts, setAlerts] = useState([
    { id: '1', type: 'warning', message: 'Memory usage approaching 75% threshold', timestamp: '14:25:00' },
    { id: '2', type: 'info', message: 'Auto-scaling triggered', timestamp: '14:20:00' },
    { id: '3', type: 'success', message: 'Deployment completed successfully', timestamp: '14:15:00' }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, metric.value + (Math.random() - 0.5) * 10),
        trend: Math.random() > 0.5 ? 'up' : 'down'
      })));

      // Add new log entry occasionally
      if (Math.random() > 0.8) {
        const newLog = {
          timestamp: new Date().toLocaleTimeString(),
          level: ['INFO', 'DEBUG', 'WARN'][Math.floor(Math.random() * 3)],
          message: 'Real-time process update',
          component: 'MonitoringSystem'
        };
        setLogs(prev => [newLog, ...prev.slice(0, 9)]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <div className="h-3 w-3 rounded-full bg-gray-400" />;
    }
  };

  const getMetricIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'cpu usage':
        return <Cpu className="h-4 w-4" />;
      case 'memory':
        return <Server className="h-4 w-4" />;
      case 'network i/o':
        return <Network className="h-4 w-4" />;
      case 'response time':
        return <Clock className="h-4 w-4" />;
      case 'error rate':
        return <AlertTriangle className="h-4 w-4" />;
      case 'throughput':
        return <Zap className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-500';
      case 'WARN':
        return 'text-yellow-500';
      case 'INFO':
        return 'text-blue-500';
      case 'DEBUG':
        return 'text-gray-500';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Process Monitoring</h2>
        <Badge variant="outline" className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Live
        </Badge>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getMetricIcon(metric.name)}
                        <span className="text-sm font-medium">{metric.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(metric.trend)}
                        {getStatusIcon(metric.status)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">
                          {metric.value.toFixed(metric.name === 'Network I/O' ? 1 : 0)}
                        </span>
                        <span className="text-sm text-muted-foreground">{metric.unit}</span>
                      </div>
                      {metric.name.includes('%') && (
                        <Progress value={metric.value} className="h-2" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Real-time Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {logs.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/50"
                  >
                    <span className="text-xs text-muted-foreground font-mono w-16">
                      {log.timestamp}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getLevelColor(log.level)}`}
                    >
                      {log.level}
                    </Badge>
                    <span className="text-sm flex-1">{log.message}</span>
                    <span className="text-xs text-muted-foreground">{log.component}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-3">
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className={`border-l-4 ${
                  alert.type === 'warning' ? 'border-l-yellow-500' :
                  alert.type === 'success' ? 'border-l-green-500' :
                  'border-l-blue-500'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                        {alert.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {alert.type === 'info' && <Activity className="h-5 w-5 text-blue-500" />}
                        <span className="font-medium">{alert.message}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{alert.timestamp}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Memory</span>
                      <span>68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Disk I/O</span>
                      <span>32%</span>
                    </div>
                    <Progress value={32} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Overall Status</span>
                  <Badge className="bg-green-500">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Uptime</span>
                  <span className="font-mono text-sm">99.8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active Processes</span>
                  <span className="font-mono text-sm">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Queue Size</span>
                  <span className="font-mono text-sm">5</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
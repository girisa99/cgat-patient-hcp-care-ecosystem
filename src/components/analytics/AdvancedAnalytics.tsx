import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Users,
  Clock,
  Zap,
  Brain,
  Target,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Sparkles
} from 'lucide-react';

interface AdvancedAnalyticsProps {
  sessionId?: string;
  timeRange?: '1h' | '24h' | '7d' | '30d' | '90d';
}

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({
  sessionId,
  timeRange = '24h'
}) => {
  const [selectedMetric, setSelectedMetric] = useState('performance');
  const [realTimeData, setRealTimeData] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(true);

  // Mock data generation for demonstration
  const generateMockData = () => {
    const now = new Date();
    const data = [];
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: time.getTime(),
        performance: Math.floor(Math.random() * 100) + 50,
        users: Math.floor(Math.random() * 50) + 10,
        workflows: Math.floor(Math.random() * 30) + 5,
        errors: Math.floor(Math.random() * 5),
        success_rate: Math.floor(Math.random() * 20) + 80,
        response_time: Math.floor(Math.random() * 200) + 100,
        cpu_usage: Math.floor(Math.random() * 60) + 20,
        memory_usage: Math.floor(Math.random() * 40) + 30,
        ai_requests: Math.floor(Math.random() * 100) + 20,
        templates_used: Math.floor(Math.random() * 15) + 5
      });
    }
    
    return data;
  };

  const [analyticsData, setAnalyticsData] = useState(generateMockData());

  // Real-time data updates
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      setAnalyticsData(prev => {
        const newData = [...prev.slice(1)]; // Remove first item
        const lastItem = prev[prev.length - 1];
        const now = new Date();
        
        newData.push({
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: now.getTime(),
          performance: Math.max(0, lastItem.performance + (Math.random() - 0.5) * 20),
          users: Math.max(0, lastItem.users + Math.floor((Math.random() - 0.5) * 10)),
          workflows: Math.max(0, lastItem.workflows + Math.floor((Math.random() - 0.5) * 5)),
          errors: Math.max(0, lastItem.errors + Math.floor((Math.random() - 0.7) * 3)),
          success_rate: Math.min(100, Math.max(60, lastItem.success_rate + (Math.random() - 0.5) * 10)),
          response_time: Math.max(50, lastItem.response_time + (Math.random() - 0.5) * 50),
          cpu_usage: Math.min(100, Math.max(0, lastItem.cpu_usage + (Math.random() - 0.5) * 15)),
          memory_usage: Math.min(100, Math.max(0, lastItem.memory_usage + (Math.random() - 0.5) * 10)),
          ai_requests: Math.max(0, lastItem.ai_requests + Math.floor((Math.random() - 0.3) * 20)),
          templates_used: Math.max(0, lastItem.templates_used + Math.floor((Math.random() - 0.5) * 3))
        });
        
        return newData;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  // Key Performance Indicators
  const currentData = analyticsData[analyticsData.length - 1] || {};
  const previousData = analyticsData[analyticsData.length - 2] || {};
  
  const kpis = [
    {
      title: 'Active Users',
      value: currentData.users || 0,
      change: ((currentData.users - previousData.users) / previousData.users) * 100 || 0,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Workflow Success Rate',
      value: `${currentData.success_rate || 0}%`,
      change: ((currentData.success_rate - previousData.success_rate) / previousData.success_rate) * 100 || 0,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Avg Response Time',
      value: `${currentData.response_time || 0}ms`,
      change: -((currentData.response_time - previousData.response_time) / previousData.response_time) * 100 || 0,
      icon: Zap,
      color: 'text-yellow-600'
    },
    {
      title: 'AI Requests',
      value: currentData.ai_requests || 0,
      change: ((currentData.ai_requests - previousData.ai_requests) / previousData.ai_requests) * 100 || 0,
      icon: Brain,
      color: 'text-purple-600'
    }
  ];

  // Usage patterns data
  const usagePatterns = [
    { name: 'AI Generation', value: 35, color: '#3b82f6' },
    { name: 'Template Usage', value: 25, color: '#10b981' },
    { name: 'Manual Building', value: 20, color: '#f59e0b' },
    { name: 'Testing', value: 12, color: '#ef4444' },
    { name: 'Deployment', value: 8, color: '#8b5cf6' }
  ];

  // Performance radar data
  const performanceRadar = [
    { metric: 'Speed', value: currentData.performance || 0, fullMark: 100 },
    { metric: 'Reliability', value: currentData.success_rate || 0, fullMark: 100 },
    { metric: 'Efficiency', value: 100 - (currentData.cpu_usage || 0), fullMark: 100 },
    { metric: 'Memory', value: 100 - (currentData.memory_usage || 0), fullMark: 100 },
    { metric: 'User Satisfaction', value: (currentData.success_rate || 0) * 0.9, fullMark: 100 },
    { metric: 'AI Performance', value: (currentData.ai_requests || 0) / 2, fullMark: 100 }
  ];

  // Predictive insights (mock)
  const predictiveInsights = [
    {
      type: 'trend',
      title: 'Usage Spike Predicted',
      description: 'Based on patterns, expect 40% increase in AI requests in next 2 hours',
      confidence: 85,
      impact: 'medium',
      icon: TrendingUp
    },
    {
      type: 'alert',
      title: 'Memory Usage Warning',
      description: 'Current trajectory suggests memory optimization needed',
      confidence: 92,
      impact: 'high',
      icon: AlertTriangle
    },
    {
      type: 'opportunity',
      title: 'Template Optimization',
      description: 'Users frequently modify Template #3 - consider creating variant',
      confidence: 78,
      impact: 'low',
      icon: Target
    }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">Real-time insights and predictive analytics</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant={isLive ? "default" : "outline"}
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            <Activity className="w-4 h-4 mr-1" />
            {isLive ? 'Live' : 'Paused'}
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {kpi.change > 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      )}
                      <span className={`text-xs ${kpi.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {Math.abs(kpi.change).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <kpi.icon className={`w-8 h-8 ${kpi.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Analytics Dashboard */}
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
          <TabsTrigger value="ai">AI Insights</TabsTrigger>
          <TabsTrigger value="predictive">Predictions</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="performance" 
                      stackId="1" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="success_rate" 
                      stackId="2" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={performanceRadar}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Usage Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={usagePatterns}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {usagePatterns.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Activity Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#3b82f6" name="Active Users" />
                    <Line type="monotone" dataKey="workflows" stroke="#10b981" name="Workflows Created" />
                    <Line type="monotone" dataKey="templates_used" stroke="#f59e0b" name="Templates Used" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {predictiveInsights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <insight.icon className="w-4 h-4" />
                        {insight.title}
                      </CardTitle>
                      <Badge variant={
                        insight.impact === 'high' ? 'destructive' : 
                        insight.impact === 'medium' ? 'default' : 'secondary'
                      }>
                        {insight.impact} impact
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {insight.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Confidence: {insight.confidence}%
                      </span>
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-500" />
                        <span className="text-xs font-medium">AI Insight</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="cpu_usage" 
                      stackId="1" 
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.6}
                      name="CPU Usage %" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="memory_usage" 
                      stackId="1" 
                      stroke="#f59e0b" 
                      fill="#f59e0b" 
                      fillOpacity={0.6}
                      name="Memory Usage %" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="errors" fill="#ef4444" name="Errors" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;
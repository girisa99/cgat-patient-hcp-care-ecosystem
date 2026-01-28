import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Users, Bot, Clock, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { RegionalAnalyticsPanel } from './RegionalAnalyticsPanel';
import { FunnelVisualization } from './FunnelVisualization';
import { CohortRetentionHeatmap } from './CohortRetentionHeatmap';
import { RevenueMetricsPanel } from './RevenueMetricsPanel';

interface AnalyticsMetrics {
  totalAgents: number;
  activeAgents: number;
  totalSessions: number;
  avgResponseTime: number;
  successRate: number;
  costSavings: number;
  userSatisfaction: number;
  uptime: number;
}

interface PerformanceData {
  timestamp: string;
  response_time: number;
  success_rate: number;
  active_sessions: number;
  error_rate: number;
}

interface UsagePattern {
  hour: number;
  sessions: number;
  success_rate: number;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

export const EnterpriseAnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('24h');
  
  // Fetch analytics data
  const { data: metrics } = useQuery({
    queryKey: ['enterprise-metrics', timeRange],
    queryFn: async (): Promise<AnalyticsMetrics> => {
      // Mock data - replace with actual API call
      return {
        totalAgents: 47,
        activeAgents: 32,
        totalSessions: 1420,
        avgResponseTime: 1.2,
        successRate: 94.5,
        costSavings: 125000,
        userSatisfaction: 4.7,
        uptime: 99.8
      };
    }
  });

  const { data: performanceData } = useQuery({
    queryKey: ['performance-data', timeRange],
    queryFn: async (): Promise<PerformanceData[]> => {
      // Mock data - replace with actual API call
      return Array.from({ length: 24 }, (_, i) => ({
        timestamp: `${i}:00`,
        response_time: 0.8 + Math.random() * 1.2,
        success_rate: 90 + Math.random() * 10,
        active_sessions: Math.floor(20 + Math.random() * 60),
        error_rate: Math.random() * 5
      }));
    }
  });

  const { data: usagePatterns } = useQuery({
    queryKey: ['usage-patterns', timeRange],
    queryFn: async (): Promise<UsagePattern[]> => {
      return Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        sessions: Math.floor(10 + Math.random() * 50),
        success_rate: 85 + Math.random() * 15
      }));
    }
  });

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color?: string;
  }> = ({ title, value, change, icon, color = 'blue' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={`text-${color}-600`}>{icon}</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {change !== undefined && (
            <div className="flex items-center text-xs text-muted-foreground">
              {change > 0 ? (
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              <span className={change > 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(change)}%
              </span>
              <span className="ml-1">vs last period</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  if (!metrics) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Enterprise Analytics</h1>
        <div className="flex gap-2">
          {(['24h', '7d', '30d', '90d'] as const).map((range) => (
            <Badge
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Badge>
          ))}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="regional">Regional (MENA/India/Asia)</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="funnels">Funnels</TabsTrigger>
          <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
          <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
        </TabsList>

        {/* NEW: Regional Analytics Tab */}
        <TabsContent value="regional" className="space-y-6">
          <RegionalAnalyticsPanel />
        </TabsContent>

        {/* NEW: Revenue Metrics Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <RevenueMetricsPanel showTrend={true} />
        </TabsContent>

        {/* NEW: Funnels Tab */}
        <TabsContent value="funnels" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FunnelVisualization 
              funnelId="signup_to_generation" 
              title="Signup to Generation" 
              description="User journey from landing to first content"
            />
            <FunnelVisualization 
              funnelId="free_to_paid" 
              title="Free to Paid" 
              description="Conversion funnel to paid subscription"
            />
          </div>
        </TabsContent>

        {/* NEW: Cohorts Tab */}
        <TabsContent value="cohorts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CohortRetentionHeatmap weeks={8} />
            <CohortRetentionHeatmap region="mena" weeks={8} />
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Agents"
              value={metrics.totalAgents}
              change={12}
              icon={<Bot className="w-4 h-4" />}
              color="blue"
            />
            <MetricCard
              title="Active Sessions"
              value={metrics.totalSessions.toLocaleString()}
              change={8}
              icon={<Users className="w-4 h-4" />}
              color="green"
            />
            <MetricCard
              title="Avg Response Time"
              value={`${metrics.avgResponseTime}s`}
              change={-5}
              icon={<Clock className="w-4 h-4" />}
              color="orange"
            />
            <MetricCard
              title="Success Rate"
              value={`${metrics.successRate}%`}
              change={2}
              icon={<Target className="w-4 h-4" />}
              color="green"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Over Time</CardTitle>
                <CardDescription>Response time and success rate trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="response_time"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Response Time (s)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="success_rate"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Success Rate (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Real-time session activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="active_sessions"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Health Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Uptime</span>
                    <span>{metrics.uptime}%</span>
                  </div>
                  <Progress value={metrics.uptime} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Success Rate</span>
                    <span>{metrics.successRate}%</span>
                  </div>
                  <Progress value={metrics.successRate} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>User Satisfaction</span>
                    <span>{metrics.userSatisfaction}/5.0</span>
                  </div>
                  <Progress value={(metrics.userSatisfaction / 5) * 100} className="h-2" />
                </div>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="error_rate" fill="#ef4444" name="Error Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Patterns by Hour</CardTitle>
              <CardDescription>Peak usage times and performance correlation</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={usagePatterns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="sessions" fill="#3b82f6" name="Sessions" />
                  <Line yAxisId="right" dataKey="success_rate" stroke="#10b981" name="Success Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roi" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Savings Analysis</CardTitle>
                <CardDescription>Estimated savings from agent automation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ${metrics.costSavings.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Monthly savings compared to traditional support
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Labor cost reduction</span>
                    <span className="font-medium">$89,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Efficiency gains</span>
                    <span className="font-medium">$28,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>24/7 availability</span>
                    <span className="font-medium">$8,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance ROI</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Resolution Time Improvement</span>
                  <Badge variant="secondary">-65%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Customer Satisfaction</span>
                  <Badge variant="secondary">+23%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>First Contact Resolution</span>
                  <Badge variant="secondary">+45%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Agent Productivity</span>
                  <Badge variant="secondary">+78%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
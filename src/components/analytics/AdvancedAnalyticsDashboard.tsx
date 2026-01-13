import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, TrendingUp, TrendingDown, Users, FileVideo, 
  MessageSquare, Clock, Download, RefreshCw, Calendar,
  Activity, Zap
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#10b981', '#f59e0b', '#ef4444'];

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [granularity, setGranularity] = useState<'hour' | 'day' | 'week' | 'month'>('day');

  const getDateRange = () => {
    const end = new Date().toISOString();
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    return { start, end };
  };

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['analytics-overview', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('analytics-dashboard', {
        body: { action: 'get_overview', date_range: getDateRange() }
      });
      if (error) throw error;
      return data.overview;
    }
  });

  const { data: contentMetrics, isLoading: loadingContent } = useQuery({
    queryKey: ['analytics-content', dateRange, granularity],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('analytics-dashboard', {
        body: { action: 'get_content_metrics', date_range: getDateRange(), granularity }
      });
      if (error) throw error;
      return data.metrics;
    }
  });

  const { data: engagement } = useQuery({
    queryKey: ['analytics-engagement', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('analytics-dashboard', {
        body: { action: 'get_engagement', date_range: getDateRange() }
      });
      if (error) throw error;
      return data.engagement;
    }
  });

  const { data: performance } = useQuery({
    queryKey: ['analytics-performance', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('analytics-dashboard', {
        body: { action: 'get_performance', date_range: getDateRange() }
      });
      if (error) throw error;
      return data.performance;
    }
  });

  const { data: trends } = useQuery({
    queryKey: ['analytics-trends', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('analytics-dashboard', {
        body: { action: 'get_trends', date_range: getDateRange() }
      });
      if (error) throw error;
      return data.trends;
    }
  });

  const { data: realtime } = useQuery({
    queryKey: ['analytics-realtime'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('analytics-dashboard', {
        body: { action: 'get_realtime' }
      });
      if (error) throw error;
      return data.realtime;
    },
    refetchInterval: 30000
  });

  const handleExport = async (format: 'json' | 'csv') => {
    const { data, error } = await supabase.functions.invoke('analytics-dashboard', {
      body: { action: 'export_report', date_range: getDateRange(), export_format: format }
    });
    if (error) {
      console.error('Export failed:', error);
      return;
    }
    
    const blob = new Blob([format === 'csv' ? data : JSON.stringify(data.report, null, 2)], {
      type: format === 'csv' ? 'text/csv' : 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report.${format}`;
    a.click();
  };

  const TrendIndicator = ({ value, direction }: { value: string; direction: string }) => (
    <div className={`flex items-center gap-1 text-sm ${direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
      {direction === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
      {value}
    </div>
  );

  const contentTypeData = contentMetrics ? [
    { name: 'Videos', value: contentMetrics.by_type?.videos || 0 },
    { name: 'Scripts', value: contentMetrics.by_type?.scripts || 0 }
  ] : [];

  const statusData = contentMetrics ? [
    { name: 'Published', value: contentMetrics.by_status?.published || 0 },
    { name: 'Draft', value: contentMetrics.by_status?.draft || 0 },
    { name: 'Processing', value: contentMetrics.by_status?.processing || 0 }
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
            <p className="text-muted-foreground">Insights and performance metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Stats */}
      {realtime && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Real-time (Last 24 Hours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold">{realtime.last_24h_content}</div>
                <div className="text-sm text-muted-foreground">New Content</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{realtime.last_24h_conversations}</div>
                <div className="text-sm text-muted-foreground">Conversations</div>
              </div>
              <div className="col-span-2">
                <ResponsiveContainer width="100%" height={60}>
                  <AreaChart data={realtime.hourly_breakdown?.slice(-12) || []}>
                    <Area type="monotone" dataKey="content" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileVideo className="h-4 w-4" />
              Total Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.content?.total || 0}</div>
            {trends?.content_growth && <TrendIndicator {...trends.content_growth} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.users?.active_users || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagement?.total_conversations || 0}</div>
            <div className="text-sm text-muted-foreground">
              {engagement?.completion_rate}% completion
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{performance?.success_rate || 100}%</div>
            <div className="text-sm text-muted-foreground">
              Avg: {performance?.avg_duration_ms || 0}ms
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Over Time</CardTitle>
                <div className="flex gap-2">
                  {(['day', 'week', 'month'] as const).map(g => (
                    <Button
                      key={g}
                      variant={granularity === g ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setGranularity(g)}
                    >
                      {g}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={contentMetrics?.time_series || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">By Type</h4>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie
                          data={contentTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          dataKey="value"
                          label
                        >
                          {contentTypeData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">By Status</h4>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          dataKey="value"
                          label
                        >
                          {statusData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversation Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <span>Total Conversations</span>
                    <span className="text-2xl font-bold">{engagement?.total_conversations || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <span>Completed</span>
                    <span className="text-2xl font-bold text-green-600">{engagement?.completed_conversations || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <span>Completion Rate</span>
                    <span className="text-2xl font-bold">{engagement?.completion_rate || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <span>Avg Messages/Conversation</span>
                    <span className="text-2xl font-bold">{engagement?.avg_messages_per_conversation || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversations by Agent</CardTitle>
              </CardHeader>
              <CardContent>
                {engagement?.conversations_by_agent ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(engagement.conversations_by_agent).map(([id, count]) => ({
                      agent: id.slice(0, 8) + '...',
                      count
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="agent" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    No agent data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <span>Total Actions</span>
                    <span className="text-2xl font-bold">{performance?.total_actions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <span>Success Rate</span>
                    <span className="text-2xl font-bold text-green-600">{performance?.success_rate || 100}%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <span>Avg Response Time</span>
                    <span className="text-2xl font-bold">{performance?.avg_duration_ms || 0}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { status: 'Completed', count: performance?.actions_by_status?.completed || 0 },
                    { status: 'Failed', count: performance?.actions_by_status?.failed || 0 },
                    { status: 'Pending', count: performance?.actions_by_status?.pending || 0 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                      {[0, 1, 2].map((index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Bar>
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

export default AdvancedAnalyticsDashboard;

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLabelStudio, type LSProject, type LSTask } from '@/hooks/useLabelStudio';
import { useMasterToast } from '@/hooks/useMasterToast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Users,
  FileText,
  Target,
  Activity,
  Download,
  Calendar
} from 'lucide-react';

interface LSAdvancedAnalyticsProps {
  projectId: number;
  timeRange?: 'day' | 'week' | 'month' | 'year';
}

export const LSAdvancedAnalytics: React.FC<LSAdvancedAnalyticsProps> = ({
  projectId,
  timeRange = 'week'
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('overview');
  const [dateRange, setDateRange] = useState(timeRange);

  const {
    loading,
    getProjectStats,
    listProjectTasks,
    exportProject
  } = useLabelStudio();

  const { showSuccess, showError } = useMasterToast();

  // Mock analytics data - in real implementation, fetch from Label Studio API
  const analyticsData = useMemo(() => ({
    overview: {
      totalTasks: 1248,
      completedTasks: 892,
      pendingTasks: 356,
      averageAnnotationTime: 2.4, // minutes
      accuracyScore: 94.2,
      productivity: 78,
      qualityScore: 91.5
    },
    completionTrend: [
      { date: '2024-01-01', completed: 45, pending: 23, accuracy: 92.1 },
      { date: '2024-01-02', completed: 67, pending: 18, accuracy: 93.5 },
      { date: '2024-01-03', completed: 78, pending: 15, accuracy: 94.2 },
      { date: '2024-01-04', completed: 82, pending: 12, accuracy: 95.1 },
      { date: '2024-01-05', completed: 95, pending: 8, accuracy: 94.8 },
      { date: '2024-01-06', completed: 103, pending: 5, accuracy: 96.2 },
      { date: '2024-01-07', completed: 118, pending: 3, accuracy: 95.7 }
    ],
    annotatorPerformance: [
      { name: 'Alice Johnson', tasksCompleted: 156, avgTime: 1.8, accuracy: 97.2 },
      { name: 'Bob Smith', tasksCompleted: 134, avgTime: 2.1, accuracy: 95.8 },
      { name: 'Carol Davis', tasksCompleted: 142, avgTime: 2.0, accuracy: 96.1 },
      { name: 'David Wilson', tasksCompleted: 128, avgTime: 2.3, accuracy: 94.5 },
      { name: 'Emma Brown', tasksCompleted: 119, avgTime: 2.5, accuracy: 93.9 }
    ],
    labelDistribution: [
      { name: 'Category A', value: 35, color: '#8884d8' },
      { name: 'Category B', value: 25, color: '#82ca9d' },
      { name: 'Category C', value: 20, color: '#ffc658' },
      { name: 'Category D', value: 15, color: '#ff7c7c' },
      { name: 'Other', value: 5, color: '#8dd1e1' }
    ],
    qualityMetrics: [
      { metric: 'Inter-Annotator Agreement', score: 87.3, trend: 'up' },
      { metric: 'Label Consistency', score: 92.1, trend: 'up' },
      { metric: 'Task Completion Rate', score: 71.5, trend: 'down' },
      { metric: 'Review Pass Rate', score: 89.7, trend: 'up' }
    ]
  }), [dateRange]);

  const exportAnalytics = async () => {
    try {
      const analyticsReport = {
        projectId,
        generatedAt: new Date().toISOString(),
        timeRange: dateRange,
        data: analyticsData,
        summary: {
          totalTasks: analyticsData.overview.totalTasks,
          completionRate: ((analyticsData.overview.completedTasks / analyticsData.overview.totalTasks) * 100).toFixed(1),
          averageAccuracy: analyticsData.overview.accuracyScore,
          topPerformer: analyticsData.annotatorPerformance[0]?.name
        }
      };

      const blob = new Blob([JSON.stringify(analyticsReport, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `label-studio-analytics-${projectId}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSuccess('Analytics report exported successfully');
    } catch (error) {
      showError('Failed to export analytics report');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into annotation performance and quality
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalTasks.toLocaleString()}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Progress 
                value={(analyticsData.overview.completedTasks / analyticsData.overview.totalTasks) * 100} 
                className="h-1" 
              />
              <p className="text-xs text-muted-foreground mt-1">
                {((analyticsData.overview.completedTasks / analyticsData.overview.totalTasks) * 100).toFixed(1)}% completed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Time</p>
                <p className="text-2xl font-bold">{analyticsData.overview.averageAnnotationTime}m</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <p className="text-xs text-green-600">12% faster this week</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold">{analyticsData.overview.accuracyScore}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
              <p className="text-xs text-green-600">Above target</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quality Score</p>
                <p className="text-2xl font-bold">{analyticsData.overview.qualityScore}%</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <p className="text-xs text-green-600">Improving</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Completion Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Task Completion Trend</CardTitle>
                <CardDescription>Daily completion rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.completionTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="completed" 
                      stackId="1"
                      stroke="#8884d8" 
                      fill="#8884d8" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pending" 
                      stackId="1"
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Label Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Label Distribution</CardTitle>
                <CardDescription>Breakdown of annotation categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.labelDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analyticsData.labelDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Annotator Performance</CardTitle>
              <CardDescription>Individual contributor metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.annotatorPerformance.map((annotator, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{annotator.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {annotator.tasksCompleted} tasks completed
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg. Time</p>
                        <p className="font-medium">{annotator.avgTime}m</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Accuracy</p>
                        <Badge variant={annotator.accuracy > 95 ? 'default' : 'secondary'}>
                          {annotator.accuracy}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics</CardTitle>
              <CardDescription>Annotation quality indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analyticsData.qualityMetrics.map((metric, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{metric.metric}</p>
                      <div className="flex items-center gap-1">
                        {metric.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-2xl font-bold mt-2">{metric.score}%</p>
                    <Progress value={metric.score} className="mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accuracy Trends</CardTitle>
              <CardDescription>Accuracy improvement over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData.completionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[90, 100]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
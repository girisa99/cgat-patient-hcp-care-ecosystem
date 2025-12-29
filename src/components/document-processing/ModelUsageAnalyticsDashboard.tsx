/**
 * Model Usage Analytics Dashboard
 * Improvements 2 & 3: Analytics tracking + Cost estimation
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, Area, AreaChart
} from 'recharts';
import { 
  Brain, Zap, DollarSign, Clock, TrendingUp, Activity,
  CheckCircle, AlertTriangle, BarChart3, PieChartIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface ModelUsageEntry {
  id: string;
  document_type: string;
  model_used: string;
  primary_model: string;
  selection_reason: string;
  processing_time_ms: number;
  estimated_cost_cents: number;
  total_fields_extracted: number;
  average_confidence: number;
  success: boolean;
  created_at: string;
}

interface ModelStats {
  model: string;
  count: number;
  avgTime: number;
  totalCost: number;
  successRate: number;
  color: string;
}

const MODEL_COLORS: Record<string, string> = {
  claude: '#8B5CF6',
  gemini: '#3B82F6',
  openai: '#10B981',
};

const COST_PER_1K_TOKENS: Record<string, { input: number; output: number }> = {
  claude: { input: 0.003, output: 0.015 },
  gemini: { input: 0.00035, output: 0.00105 },
  openai: { input: 0.005, output: 0.015 },
};

interface ModelUsageAnalyticsDashboardProps {
  className?: string;
  compact?: boolean;
}

export const ModelUsageAnalyticsDashboard: React.FC<ModelUsageAnalyticsDashboardProps> = ({
  className,
  compact = false
}) => {
  const [analytics, setAnalytics] = useState<ModelUsageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      const { data, error } = await supabase
        .from('model_usage_analytics')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(500);

      if (!error && data) {
        setAnalytics(data as ModelUsageEntry[]);
      }
    } catch (e) {
      console.error('Failed to fetch analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const modelStats: ModelStats[] = ['claude', 'gemini', 'openai'].map(model => {
    const modelEntries = analytics.filter(a => a.model_used === model);
    const successEntries = modelEntries.filter(a => a.success);
    
    return {
      model,
      count: modelEntries.length,
      avgTime: modelEntries.length > 0 
        ? Math.round(modelEntries.reduce((sum, a) => sum + (a.processing_time_ms || 0), 0) / modelEntries.length)
        : 0,
      totalCost: modelEntries.reduce((sum, a) => sum + (a.estimated_cost_cents || 0), 0) / 100,
      successRate: modelEntries.length > 0 
        ? Math.round((successEntries.length / modelEntries.length) * 100)
        : 0,
      color: MODEL_COLORS[model]
    };
  }).filter(s => s.count > 0);

  const totalProcessed = analytics.length;
  const totalCost = analytics.reduce((sum, a) => sum + (a.estimated_cost_cents || 0), 0) / 100;
  const avgProcessingTime = totalProcessed > 0 
    ? Math.round(analytics.reduce((sum, a) => sum + (a.processing_time_ms || 0), 0) / totalProcessed)
    : 0;
  const overallSuccessRate = totalProcessed > 0
    ? Math.round((analytics.filter(a => a.success).length / totalProcessed) * 100)
    : 0;

  // Data for charts
  const pieData = modelStats.map(s => ({
    name: s.model.charAt(0).toUpperCase() + s.model.slice(1),
    value: s.count,
    color: s.color
  }));

  const documentTypeData = Object.entries(
    analytics.reduce((acc, a) => {
      acc[a.document_type] = (acc[a.document_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([type, count]) => ({ type, count })).slice(0, 6);

  // Selection reason breakdown
  const selectionReasonData = Object.entries(
    analytics.reduce((acc, a) => {
      acc[a.selection_reason] = (acc[a.selection_reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([reason, count]) => ({ 
    reason: reason.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
    count 
  }));

  if (compact) {
    return (
      <Card className={cn("", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Model Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            {modelStats.map(stat => (
              <div 
                key={stat.model}
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <div className="text-lg font-bold" style={{ color: stat.color }}>
                  {stat.count}
                </div>
                <div className="text-[10px] text-muted-foreground capitalize">
                  {stat.model}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Total: {totalProcessed}</span>
            <span>Cost: ${totalCost.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Model Usage Analytics
            </CardTitle>
            <CardDescription>
              AI model performance, costs, and selection patterns
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Processed</span>
            </div>
            <div className="text-2xl font-bold">{totalProcessed}</div>
            <div className="text-xs text-muted-foreground">documents</div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Total Cost</span>
            </div>
            <div className="text-2xl font-bold text-green-600">${totalCost.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">estimated</div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">Avg Time</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{(avgProcessingTime / 1000).toFixed(1)}s</div>
            <div className="text-xs text-muted-foreground">per document</div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-purple-600" />
              <span className="text-xs text-muted-foreground">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{overallSuccessRate}%</div>
            <div className="text-xs text-muted-foreground">accuracy</div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="models">By Model</TabsTrigger>
            <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
            <TabsTrigger value="selection">Selection</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Model Distribution Pie */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Model Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Document Types Bar */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">By Document Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={documentTypeData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="type" type="category" width={100} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="models" className="mt-4 space-y-4">
            {/* Model Performance Comparison */}
            <div className="grid grid-cols-3 gap-4">
              {modelStats.map(stat => (
                <Card key={stat.model} style={{ borderColor: `${stat.color}40` }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: stat.color }}
                      />
                      <span className="capitalize">{stat.model}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div>
                        <div className="text-xl font-bold">{stat.count}</div>
                        <div className="text-[10px] text-muted-foreground">Processed</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold">{stat.successRate}%</div>
                        <div className="text-[10px] text-muted-foreground">Success</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Avg Time</span>
                        <span>{(stat.avgTime / 1000).toFixed(1)}s</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Total Cost</span>
                        <span>${stat.totalCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="costs" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Cost Estimation Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(COST_PER_1K_TOKENS).map(([model, costs]) => (
                      <div 
                        key={model}
                        className="p-3 rounded-lg border"
                        style={{ borderColor: `${MODEL_COLORS[model]}40` }}
                      >
                        <div className="font-medium capitalize mb-2" style={{ color: MODEL_COLORS[model] }}>
                          {model}
                        </div>
                        <div className="text-xs space-y-1 text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Input:</span>
                            <span>${costs.input.toFixed(4)}/1K</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Output:</span>
                            <span>${costs.output.toFixed(4)}/1K</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm font-medium mb-2">Cost by Model</div>
                    <div className="space-y-2">
                      {modelStats.map(stat => (
                        <div key={stat.model} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: stat.color }}
                          />
                          <span className="text-sm capitalize flex-1">{stat.model}</span>
                          <span className="text-sm font-medium">${stat.totalCost.toFixed(2)}</span>
                          <Progress 
                            value={totalCost > 0 ? (stat.totalCost / totalCost) * 100 : 0} 
                            className="w-20 h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="selection" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Model Selection Reasons</CardTitle>
                <CardDescription>How the system decides which model to use</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectionReasonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="reason" tick={{ fontSize: 10 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-muted/30 rounded">
                    <div className="font-medium">Explicit Config</div>
                    <div className="text-muted-foreground">Document type has predefined model</div>
                  </div>
                  <div className="p-2 bg-muted/30 rounded">
                    <div className="font-medium">Category Default</div>
                    <div className="text-muted-foreground">Using category's default model</div>
                  </div>
                  <div className="p-2 bg-muted/30 rounded">
                    <div className="font-medium">Content Analysis</div>
                    <div className="text-muted-foreground">AI analyzed content patterns</div>
                  </div>
                  <div className="p-2 bg-muted/30 rounded">
                    <div className="font-medium">Fallback</div>
                    <div className="text-muted-foreground">Primary model failed, used backup</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ModelUsageAnalyticsDashboard;

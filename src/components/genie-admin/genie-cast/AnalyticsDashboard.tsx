/**
 * ANALYTICS DASHBOARD
 * Performance metrics from database + analytics-dashboard edge function.
 * Tracks: video generation, engagement, content performance, trends, cost savings.
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  Video,
  Globe,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  MessageSquare,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface VideoStats {
  total: number;
  completed: number;
  processing: number;
  failed: number;
  languages: string[];
}

// Estimated cost per video (for cost savings calculation)
const ESTIMATED_COST_PER_MANUAL_VIDEO = 500;
const ESTIMATED_COST_PER_AI_VIDEO = 15;

export const AnalyticsDashboard: React.FC = () => {
  const [analyticsTab, setAnalyticsTab] = useState<'overview' | 'engagement' | 'performance' | 'trends'>('overview');

  // Fetch video statistics (from database)
  const { data: videoStats, isLoading: statsLoading } = useQuery({
    queryKey: ['analytics-video-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_page_videos')
        .select('generation_status, language_name, created_at');

      if (error) throw error;

      const stats: VideoStats = {
        total: data?.length || 0,
        completed: data?.filter(v => v.generation_status === 'completed').length || 0,
        processing: data?.filter(v => v.generation_status === 'processing').length || 0,
        failed: data?.filter(v => v.generation_status === 'failed').length || 0,
        languages: [...new Set(data?.map(v => v.language_name).filter(Boolean) || [])],
      };

      return stats;
    },
  });

  // Fetch recent videos for activity feed
  const { data: recentVideos = [] } = useQuery({
    queryKey: ['analytics-recent-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_page_videos')
        .select('id, title, generation_status, created_at, language_name')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch engagement analytics from edge function
  const { data: engagementData, isLoading: engagementLoading, refetch: refetchEngagement } = useQuery({
    queryKey: ['analytics-edge-engagement'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('analytics-dashboard', {
        body: { action: 'get_engagement', period: '30d' },
      });
      if (error) throw error;
      return data;
    },
    enabled: false,
  });

  // Fetch performance analytics from edge function
  const { data: performanceData, isLoading: performanceLoading, refetch: refetchPerformance } = useQuery({
    queryKey: ['analytics-edge-performance'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('analytics-dashboard', {
        body: { action: 'get_performance', period: '30d' },
      });
      if (error) throw error;
      return data;
    },
    enabled: false,
  });

  // Fetch trends from edge function
  const { data: trendsData, isLoading: trendsLoading, refetch: refetchTrends } = useQuery({
    queryKey: ['analytics-edge-trends'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('analytics-dashboard', {
        body: { action: 'get_trends', period: '30d' },
      });
      if (error) throw error;
      return data;
    },
    enabled: false,
  });

  // Load edge function data when tabs switch
  const handleTabChange = (tab: string) => {
    setAnalyticsTab(tab as any);
    if (tab === 'engagement' && !engagementData) refetchEngagement();
    if (tab === 'performance' && !performanceData) refetchPerformance();
    if (tab === 'trends' && !trendsData) refetchTrends();
  };

  // Calculate cost savings
  const costSavings = (videoStats?.completed || 0) * (ESTIMATED_COST_PER_MANUAL_VIDEO - ESTIMATED_COST_PER_AI_VIDEO);

  // Success rate
  const successRate = videoStats?.total
    ? Math.round((videoStats.completed / videoStats.total) * 100)
    : 0;

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Videos Generated</p>
                <p className="text-3xl font-bold mt-1">{videoStats?.total || 0}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Video className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                {videoStats?.completed || 0} complete
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Success Rate</p>
                <p className="text-3xl font-bold mt-1">{successRate}%</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="mt-3">
              <Progress value={successRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Languages</p>
                <p className="text-3xl font-bold mt-1">{videoStats?.languages.length || 0}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Globe className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {videoStats?.languages.slice(0, 3).map((lang) => (
                <Badge key={lang} variant="outline" className="text-xs">
                  {lang}
                </Badge>
              ))}
              {(videoStats?.languages.length || 0) > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{(videoStats?.languages.length || 0) - 3}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Cost Savings</p>
                <p className="text-3xl font-bold mt-1 text-green-600">
                  ${costSavings.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-full">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              vs ${((videoStats?.completed || 0) * ESTIMATED_COST_PER_MANUAL_VIDEO).toLocaleString()} manual
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed deep analytics */}
      <Tabs value={analyticsTab} onValueChange={handleTabChange}>
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex-1 gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex-1 gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex-1 gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex-1 gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Trends
          </TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW (existing) ── */}
        <TabsContent value="overview" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Generation Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Completed
                      </span>
                      <span className="font-medium">{videoStats?.completed || 0}</span>
                    </div>
                    <Progress
                      value={videoStats?.total ? (videoStats.completed / videoStats.total) * 100 : 0}
                      className="h-2 bg-green-100 [&>div]:bg-green-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        Processing
                      </span>
                      <span className="font-medium">{videoStats?.processing || 0}</span>
                    </div>
                    <Progress
                      value={videoStats?.total ? (videoStats.processing / videoStats.total) * 100 : 0}
                      className="h-2 bg-blue-100 [&>div]:bg-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        Failed
                      </span>
                      <span className="font-medium">{videoStats?.failed || 0}</span>
                    </div>
                    <Progress
                      value={videoStats?.total ? (videoStats.failed / videoStats.total) * 100 : 0}
                      className="h-2 bg-red-100 [&>div]:bg-red-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  {recentVideos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Video className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No videos generated yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentVideos.map((video) => (
                        <div
                          key={video.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{video.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {video.language_name} {video.created_at ? `\u2022 ${format(new Date(video.created_at), 'MMM d, h:mm a')}` : ''}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              'ml-2 shrink-0',
                              video.generation_status === 'completed' && 'text-green-600 border-green-200',
                              video.generation_status === 'processing' && 'text-blue-600 border-blue-200',
                              video.generation_status === 'failed' && 'text-red-600 border-red-200',
                            )}
                          >
                            {video.generation_status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Language Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Language Distribution
              </CardTitle>
              <CardDescription>
                Videos generated per language
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(videoStats?.languages.length || 0) === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No language data available yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {videoStats?.languages.map((lang) => (
                    <div
                      key={lang}
                      className="p-3 rounded-lg border text-center hover:bg-muted/50 transition-colors"
                    >
                      <p className="text-sm font-medium">{lang}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ENGAGEMENT (from edge function) ── */}
        <TabsContent value="engagement" className="mt-4 space-y-4">
          {engagementLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : engagementData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="p-3 text-center">
                    <MessageSquare className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <p className="text-2xl font-bold">{engagementData.totalConversations || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Conversations</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-500" />
                    <p className="text-2xl font-bold">{engagementData.completedConversations || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Completed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <FileText className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                    <p className="text-2xl font-bold">{engagementData.avgMessagesPerConversation?.toFixed(1) || '0'}</p>
                    <p className="text-[10px] text-muted-foreground">Avg Messages</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <Zap className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                    <p className="text-2xl font-bold">{engagementData.totalMessages || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Total Messages</p>
                  </CardContent>
                </Card>
              </div>

              {/* Agent breakdown */}
              {engagementData.conversationsByAgent && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Conversations by Agent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(engagementData.conversationsByAgent).map(([agent, count]) => (
                        <div key={agent} className="flex items-center justify-between text-sm">
                          <span className="capitalize">{agent.replace(/_/g, ' ')}</span>
                          <Badge variant="outline">{String(count)}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No engagement data loaded</p>
              <Button variant="outline" size="sm" className="mt-2 gap-1.5" onClick={() => refetchEngagement()}>
                <RefreshCw className="w-3.5 h-3.5" /> Load Engagement Data
              </Button>
            </div>
          )}
        </TabsContent>

        {/* ── PERFORMANCE (from edge function) ── */}
        <TabsContent value="performance" className="mt-4 space-y-4">
          {performanceLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : performanceData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="p-3 text-center">
                    <Activity className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <p className="text-2xl font-bold">{performanceData.totalRequests || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Total Requests</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                    <p className="text-2xl font-bold">{performanceData.avgDuration ? `${(performanceData.avgDuration / 1000).toFixed(1)}s` : 'N/A'}</p>
                    <p className="text-[10px] text-muted-foreground">Avg Response</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-500" />
                    <p className="text-2xl font-bold">{performanceData.successRate ? `${Math.round(performanceData.successRate)}%` : 'N/A'}</p>
                    <p className="text-[10px] text-muted-foreground">Success Rate</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <AlertCircle className="w-5 h-5 mx-auto mb-1 text-red-500" />
                    <p className="text-2xl font-bold">{performanceData.errorCount || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Errors</p>
                  </CardContent>
                </Card>
              </div>

              {/* Action breakdown */}
              {performanceData.statusBreakdown && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Action Status Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(performanceData.statusBreakdown).map(([status, count]) => (
                        <div key={status} className="flex items-center gap-2">
                          <Badge variant="outline" className={cn(
                            "text-[10px]",
                            status === 'completed' && 'text-green-600 border-green-300',
                            status === 'failed' && 'text-red-600 border-red-300',
                            status === 'pending' && 'text-blue-600 border-blue-300',
                          )}>
                            {status}
                          </Badge>
                          <Progress value={performanceData.totalRequests ? ((count as number) / performanceData.totalRequests) * 100 : 0} className="h-1.5 flex-1" />
                          <span className="text-xs font-medium w-8 text-right">{String(count)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No performance data loaded</p>
              <Button variant="outline" size="sm" className="mt-2 gap-1.5" onClick={() => refetchPerformance()}>
                <RefreshCw className="w-3.5 h-3.5" /> Load Performance Data
              </Button>
            </div>
          )}
        </TabsContent>

        {/* ── TRENDS (from edge function) ── */}
        <TabsContent value="trends" className="mt-4 space-y-4">
          {trendsLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : trendsData ? (
            <div className="space-y-4">
              {/* Period comparison */}
              {trendsData.comparison && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(trendsData.comparison).map(([metric, data]: [string, any]) => {
                    const growth = data.growth || 0;
                    const isUp = growth >= 0;
                    return (
                      <Card key={metric}>
                        <CardContent className="p-3">
                          <p className="text-[10px] text-muted-foreground uppercase">{metric.replace(/_/g, ' ')}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xl font-bold">{data.current || 0}</span>
                            <Badge variant="outline" className={cn(
                              "text-[9px]",
                              isUp ? 'text-green-600 border-green-300' : 'text-red-600 border-red-300'
                            )}>
                              {isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                              {Math.abs(growth).toFixed(1)}%
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Previous: {data.previous || 0}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Growth summary */}
              {trendsData.growth && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Growth Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(trendsData.growth).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="capitalize text-muted-foreground">{key.replace(/_/g, ' ')}</span>
                          <Badge variant="outline" className={cn(
                            "text-xs",
                            (val as number) >= 0 ? 'text-green-600 border-green-300' : 'text-red-600 border-red-300'
                          )}>
                            {(val as number) >= 0 ? '+' : ''}{(val as number).toFixed(1)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No trends data loaded</p>
              <Button variant="outline" size="sm" className="mt-2 gap-1.5" onClick={() => refetchTrends()}>
                <RefreshCw className="w-3.5 h-3.5" /> Load Trends Data
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

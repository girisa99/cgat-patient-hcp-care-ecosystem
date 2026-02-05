/**
 * ANALYTICS DASHBOARD
 * Performance metrics and usage statistics from database
 * Tracks video generation, views, languages, and cost savings
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart3,
  Video,
  Eye,
  Globe,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';

interface VideoStats {
  total: number;
  completed: number;
  processing: number;
  failed: number;
  languages: string[];
}

interface DailyMetric {
  date: string;
  count: number;
}

// Estimated cost per video (for cost savings calculation)
const ESTIMATED_COST_PER_MANUAL_VIDEO = 500; // $500 per video if done manually
const ESTIMATED_COST_PER_AI_VIDEO = 15; // $15 per AI-generated video

export const AnalyticsDashboard: React.FC = () => {
  // Fetch video statistics
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

  // Calculate cost savings
  const costSavings = (videoStats?.completed || 0) * (ESTIMATED_COST_PER_MANUAL_VIDEO - ESTIMATED_COST_PER_AI_VIDEO);
  const totalCost = (videoStats?.completed || 0) * ESTIMATED_COST_PER_AI_VIDEO;

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
              vs ${(videoStats?.completed || 0) * ESTIMATED_COST_PER_MANUAL_VIDEO} manual
            </div>
          </CardContent>
        </Card>
      </div>

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
                          {video.language_name} • {format(new Date(video.created_at), 'MMM d, h:mm a')}
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
    </div>
  );
};

/**
 * Publishing Analytics Panel
 * P4-ANA-33: Content published to YouTube, TikTok, LinkedIn, etc.
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Share2, Check, Clock, AlertCircle, Eye, Heart, 
  Youtube, Linkedin, Instagram, Twitter
} from 'lucide-react';
import { distributionAnalyticsService } from '@/services/analytics/distributionAnalyticsService';

const platformIcons: Record<string, React.ReactNode> = {
  youtube: <Youtube className="w-4 h-4 text-red-500" />,
  tiktok: <div className="w-4 h-4 bg-black rounded text-white text-[8px] flex items-center justify-center font-bold">TT</div>,
  linkedin: <Linkedin className="w-4 h-4 text-blue-600" />,
  instagram: <Instagram className="w-4 h-4 text-pink-500" />,
  twitter: <Twitter className="w-4 h-4" />,
  facebook: <div className="w-4 h-4 bg-blue-500 rounded text-white text-[8px] flex items-center justify-center font-bold">f</div>,
};

export const PublishingAnalyticsPanel: React.FC = () => {
  const { data: platforms, isLoading } = useQuery({
    queryKey: ['analytics', 'publishing-platforms'],
    queryFn: () => distributionAnalyticsService.getPublishingMetrics(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: overview } = useQuery({
    queryKey: ['analytics', 'publishing-overview'],
    queryFn: () => distributionAnalyticsService.getPublishingOverview(),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || !platforms || !overview) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48" />
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/50 rounded" />
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              Publishing Analytics
            </CardTitle>
            <CardDescription>Content distribution across platforms</CardDescription>
          </div>
          <Badge variant="outline" className="text-green-600">
            {overview.platformsConnected} platforms connected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Check className="w-4 h-4 mx-auto mb-1 text-green-500" />
            <div className="text-lg font-bold">{overview.totalPublished.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Published</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Clock className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
            <div className="text-lg font-bold">{overview.totalPending}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Eye className="w-4 h-4 mx-auto mb-1 text-blue-500" />
            <div className="text-lg font-bold">{formatNumber(overview.totalReach)}</div>
            <div className="text-xs text-muted-foreground">Total Reach</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <Heart className="w-4 h-4 mx-auto mb-1 text-red-500" />
            <div className="text-lg font-bold">{formatNumber(overview.totalEngagement)}</div>
            <div className="text-xs text-muted-foreground">Engagements</div>
          </div>
        </div>

        {/* Platform Breakdown */}
        <ScrollArea className="h-72">
          <div className="space-y-3">
            {platforms.map((platform) => (
              <div key={platform.platformId} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {platformIcons[platform.platformId]}
                    <span className="font-medium">{platform.platformName}</span>
                    {!platform.connected && (
                      <Badge variant="outline" className="text-muted-foreground">
                        Not Connected
                      </Badge>
                    )}
                  </div>
                  {platform.connected && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-green-600 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {platform.successRate.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                
                {platform.connected ? (
                  <>
                    <div className="grid grid-cols-4 gap-2 text-xs mb-2">
                      <div>
                        <span className="text-muted-foreground">Published</span>
                        <div className="font-medium">{platform.totalPublished}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Views</span>
                        <div className="font-medium">{formatNumber(platform.avgViewsPerPost)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Engagement</span>
                        <div className="font-medium">{platform.avgEngagementRate.toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Reach</span>
                        <div className="font-medium">{formatNumber(platform.totalViews)}</div>
                      </div>
                    </div>
                    
                    {/* Status indicators */}
                    <div className="flex gap-2">
                      {platform.pending > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {platform.pending} pending
                        </Badge>
                      )}
                      {platform.failed > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {platform.failed} failed
                        </Badge>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Connect this platform to start publishing
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Overall Success Rate */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Overall Success Rate</span>
            <span className="font-medium">{overview.avgSuccessRate.toFixed(1)}%</span>
          </div>
          <Progress value={overview.avgSuccessRate} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default PublishingAnalyticsPanel;

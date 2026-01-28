/**
 * Cross-Platform Sync Panel
 * P4-ANA-34 & P4-ANA-35: Desktop/mobile sync, offline queue metrics
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, Laptop, Smartphone, Wifi, WifiOff, 
  ArrowRightLeft, Clock, CheckCircle, AlertTriangle
} from 'lucide-react';
import { distributionAnalyticsService } from '@/services/analytics/distributionAnalyticsService';

export const CrossPlatformSyncPanel: React.FC = () => {
  const { data: syncMetrics, isLoading: syncLoading } = useQuery({
    queryKey: ['analytics', 'cross-platform-sync'],
    queryFn: () => distributionAnalyticsService.getCrossPlatformSyncMetrics(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: offlineMetrics, isLoading: offlineLoading } = useQuery({
    queryKey: ['analytics', 'offline-queue'],
    queryFn: () => distributionAnalyticsService.getOfflineQueueMetrics(),
    staleTime: 5 * 60 * 1000,
  });

  if (syncLoading || offlineLoading || !syncMetrics || !offlineMetrics) {
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

  const totalActiveSessions = syncMetrics.activeSessionsBreakdown.desktopOnly + 
    syncMetrics.activeSessionsBreakdown.mobileOnly + 
    syncMetrics.activeSessionsBreakdown.crossPlatform;

  const syncSuccessRate = (syncMetrics.syncEvents.successful / syncMetrics.syncEvents.total) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" />
              Cross-Platform & Sync
            </CardTitle>
            <CardDescription>Desktop ↔ Mobile synchronization and offline queue</CardDescription>
          </div>
          <Badge variant={syncSuccessRate > 98 ? 'default' : 'secondary'}>
            {syncSuccessRate.toFixed(1)}% sync success
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Sessions Breakdown */}
        <div>
          <div className="text-sm font-medium mb-2">Active Sessions by Platform</div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <Laptop className="w-4 h-4 mx-auto mb-1" />
              <div className="text-lg font-bold">{syncMetrics.activeSessionsBreakdown.desktopOnly.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Desktop Only</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <Smartphone className="w-4 h-4 mx-auto mb-1" />
              <div className="text-lg font-bold">{syncMetrics.activeSessionsBreakdown.mobileOnly.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Mobile Only</div>
            </div>
            <div className="text-center p-2 bg-primary/10 rounded-lg border border-primary/20">
              <ArrowRightLeft className="w-4 h-4 mx-auto mb-1 text-primary" />
              <div className="text-lg font-bold text-primary">{syncMetrics.activeSessionsBreakdown.crossPlatform.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Cross-Platform</div>
            </div>
          </div>
        </div>

        {/* Session Continuity */}
        <div>
          <div className="text-sm font-medium mb-2">Session Continuity</div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
              <span className="flex items-center gap-1">
                <Smartphone className="w-3 h-3" />→<Laptop className="w-3 h-3" />
              </span>
              <span className="font-medium">{syncMetrics.sessionContinuity.startedOnMobileFinishedDesktop.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
              <span className="flex items-center gap-1">
                <Laptop className="w-3 h-3" />→<Smartphone className="w-3 h-3" />
              </span>
              <span className="font-medium">{syncMetrics.sessionContinuity.startedOnDesktopFinishedMobile.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {syncMetrics.sessionContinuity.seamlessTransitions.toLocaleString()} seamless transitions this period
          </div>
        </div>

        {/* Offline Queue */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium flex items-center gap-1">
              <WifiOff className="w-4 h-4" /> Offline Queue
            </div>
            <Badge variant="outline">{offlineMetrics.currentQueueSize} items queued</Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-xs mb-3">
            <div className="text-center p-2 bg-muted/30 rounded">
              <div className="font-medium">{offlineMetrics.pendingUploads}</div>
              <div className="text-muted-foreground">Uploads</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <div className="font-medium">{offlineMetrics.pendingGenerations}</div>
              <div className="text-muted-foreground">Generations</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <div className="font-medium">{offlineMetrics.avgWaitTime}s</div>
              <div className="text-muted-foreground">Avg Wait</div>
            </div>
          </div>

          {/* Record to Publish Time */}
          <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
              Record-to-Publish Time (Target: &lt;60s)
            </div>
            <div className="flex justify-between text-xs">
              <span>P50: <strong className={offlineMetrics.recordToPublishTime.p50 < 60 ? 'text-green-600' : 'text-destructive'}>{offlineMetrics.recordToPublishTime.p50}s</strong></span>
              <span>P90: <strong className={offlineMetrics.recordToPublishTime.p90 < 60 ? 'text-green-600' : 'text-yellow-600'}>{offlineMetrics.recordToPublishTime.p90}s</strong></span>
              <span>P99: <strong className={offlineMetrics.recordToPublishTime.p99 < 90 ? 'text-green-600' : 'text-destructive'}>{offlineMetrics.recordToPublishTime.p99}s</strong></span>
            </div>
          </div>
        </div>

        {/* Regional Offline Usage */}
        <div>
          <div className="text-sm font-medium mb-2">Offline Usage by Region</div>
          <div className="space-y-2">
            {offlineMetrics.byRegion.slice(0, 4).map((region) => (
              <div key={region.region} className="flex items-center gap-2 text-xs">
                <span className="w-16">{region.region}</span>
                <Progress value={region.offlineUsageRate} className="flex-1 h-2" />
                <span className="w-8 text-right text-muted-foreground">{region.offlineUsageRate}%</span>
                <Badge variant="outline" className="text-[10px]">
                  {region.queueSize} queued
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Sync Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{offlineMetrics.successfulSyncsToday.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <CheckCircle className="w-3 h-3" /> Synced Today
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-destructive">{offlineMetrics.failedSyncsToday}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Failed Today
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CrossPlatformSyncPanel;

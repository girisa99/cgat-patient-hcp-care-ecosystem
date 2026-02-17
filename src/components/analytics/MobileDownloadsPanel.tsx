/**
 * Mobile Downloads Panel
 * P4-ANA-32: PWA installs, native app downloads, conversion funnel
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Smartphone, Download, Apple, TabletSmartphone, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { distributionAnalyticsService } from '@/services/analytics/distributionAnalyticsService';

export const MobileDownloadsPanel: React.FC = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['analytics', 'mobile-downloads'],
    queryFn: () => distributionAnalyticsService.getMobileDownloadMetrics(30),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || !metrics) {
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

  const { pwa, native, conversionFunnel } = metrics;

  // Funnel conversion rates
  const funnelRates = [
    { step: 'Landing Visits', count: conversionFunnel.landingVisits, rate: 100 },
    { step: 'Prompt Shown', count: conversionFunnel.installPromptShown, rate: (conversionFunnel.installPromptShown / conversionFunnel.landingVisits) * 100 },
    { step: 'Install Started', count: conversionFunnel.installStarted, rate: (conversionFunnel.installStarted / conversionFunnel.landingVisits) * 100 },
    { step: 'Completed', count: conversionFunnel.installCompleted, rate: (conversionFunnel.installCompleted / conversionFunnel.landingVisits) * 100 },
    { step: 'First Session', count: conversionFunnel.firstSessionAfterInstall, rate: (conversionFunnel.firstSessionAfterInstall / conversionFunnel.landingVisits) * 100 },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Mobile Downloads & Installs
            </CardTitle>
            <CardDescription>PWA installs, native app downloads, and conversion funnel</CardDescription>
          </div>
          <Badge variant="outline">
            {(pwa.totalInstalls + native.ios.totalDownloads + native.android.totalDownloads).toLocaleString()} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <TabletSmartphone className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <div className="text-xl font-bold">{pwa.totalInstalls.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">PWA Installs</div>
            <div className="text-xs text-green-600">+{pwa.weeklyInstalls} this week</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Apple className="w-5 h-5 mx-auto mb-1" />
            <div className="text-xl font-bold">{native.ios.totalDownloads.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">iOS Downloads</div>
            <div className="flex items-center justify-center gap-1 text-xs">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              {native.ios.rating}
            </div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Download className="w-5 h-5 mx-auto mb-1 text-green-500" />
            <div className="text-xl font-bold">{native.android.totalDownloads.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Android Downloads</div>
            <div className="flex items-center justify-center gap-1 text-xs">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              {native.android.rating}
            </div>
          </div>
        </div>

        {/* PWA Platform Breakdown */}
        <div>
          <div className="text-sm font-medium mb-2">PWA Installs by Platform</div>
          <div className="space-y-2">
            {Object.entries(pwa.byPlatform).map(([platform, count]) => (
              <div key={platform} className="flex items-center gap-2">
                <span className="text-xs w-16 capitalize">{platform}</span>
                <Progress value={(count / pwa.totalInstalls) * 100} className="flex-1 h-2" />
                <span className="text-xs text-muted-foreground w-16 text-right">{count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Install Conversion Funnel */}
        <div>
          <div className="text-sm font-medium mb-2">Install Conversion Funnel</div>
          <div className="space-y-1">
            {funnelRates.map((step, i) => (
              <div key={step.step} className="flex items-center gap-2">
                <span className="text-xs w-24">{step.step}</span>
                <div className="flex-1 relative h-6 bg-muted rounded overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-primary/80 transition-all"
                    style={{ width: `${step.rate}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                    {step.count.toLocaleString()}
                  </span>
                </div>
                <span className="text-xs w-12 text-right text-muted-foreground">
                  {step.rate.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Native App Health */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <div className="text-sm font-medium mb-2 flex items-center gap-1">
              <Apple className="w-4 h-4" /> iOS Health
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Users</span>
                <span>{native.ios.activeUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reviews</span>
                <span>{native.ios.reviews}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Crashes (7d)</span>
                <span className={native.ios.crashes > 50 ? 'text-destructive' : 'text-green-600'}>
                  {native.ios.crashes}
                </span>
              </div>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium mb-2 flex items-center gap-1">
              <Download className="w-4 h-4 text-green-500" /> Android Health
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Users</span>
                <span>{native.android.activeUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reviews</span>
                <span>{native.android.reviews}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Crashes (7d)</span>
                <span className={native.android.crashes > 50 ? 'text-destructive' : 'text-green-600'}>
                  {native.android.crashes}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileDownloadsPanel;

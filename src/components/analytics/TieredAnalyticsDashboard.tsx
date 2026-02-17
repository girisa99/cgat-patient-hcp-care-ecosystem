/**
 * TIERED ANALYTICS DASHBOARD
 * Supports different data scopes based on user type:
 * - Internal Admin: Full platform-wide data
 * - Enterprise: Full analytics for own workspace
 * - Business: Basic metrics for own workspace
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Lock, Crown, TrendingUp, Globe, Users, BarChart3, Activity, PieChart, Smartphone, Share2, MessageSquare } from 'lucide-react';
import { RegionalAnalyticsPanel } from './RegionalAnalyticsPanel';
import { FunnelVisualization } from './FunnelVisualization';
import { CohortRetentionHeatmap } from './CohortRetentionHeatmap';
import { RevenueMetricsPanel } from './RevenueMetricsPanel';
import { ChurnPredictionDashboard } from './ChurnPredictionDashboard';
import { ProviderCostAnalysisPanel } from './ProviderCostAnalysisPanel';
import { GoalTrackingPanel } from './GoalTrackingPanel';
import { AnomalyDetectionAlerts } from './AnomalyDetectionAlerts';
import { RealTimeMetricsPanel } from './RealTimeMetricsPanel';
import { FeatureUsagePanel } from './FeatureUsagePanel';
import { MobileDownloadsPanel } from './MobileDownloadsPanel';
import { PublishingAnalyticsPanel } from './PublishingAnalyticsPanel';
import { CrossPlatformSyncPanel } from './CrossPlatformSyncPanel';
// P4-COLLAB Collaboration Components
import { TeamActivityFeed } from '@/components/collaboration/TeamActivityFeed';
import { NotificationsPanel } from '@/components/collaboration/NotificationsPanel';
import { 
  useAdvancedAnalytics, 
  useFunnelMetrics,
  useCohortAnalysis,
  PRIORITY_REGIONS 
} from '@/hooks/useAdvancedAnalytics';

export type AnalyticsAccessLevel = 'internal' | 'enterprise' | 'business';

interface TieredAnalyticsDashboardProps {
  accessLevel: AnalyticsAccessLevel;
  workspaceId?: string;
  className?: string;
}

export const TieredAnalyticsDashboard: React.FC<TieredAnalyticsDashboardProps> = ({
  accessLevel,
  workspaceId,
  className
}) => {
  const [timeRange, setTimeRange] = React.useState<'24h' | '7d' | '30d' | '90d'>('7d');
  
  // Fetch analytics data based on access level
  const analytics = useAdvancedAnalytics({
    region: accessLevel === 'internal' ? undefined : PRIORITY_REGIONS[0], // Internal sees all
  });

  const funnel = useFunnelMetrics('signup_to_generation');
  const cohort = useCohortAnalysis('signup_month');

  const canAccessAdvanced = accessLevel === 'internal' || accessLevel === 'enterprise';
  const canAccessRegional = accessLevel === 'internal';

  // Tab configuration based on access level
  const availableTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, minLevel: 'business' },
    { id: 'collaboration', label: 'Collaboration', icon: MessageSquare, minLevel: 'business' },
    { id: 'predictive', label: 'Predictive', icon: TrendingUp, minLevel: 'enterprise' },
    { id: 'performance', label: 'Performance', icon: Activity, minLevel: 'enterprise' },
    { id: 'distribution', label: 'Distribution', icon: Share2, minLevel: 'enterprise' },
    { id: 'mobile', label: 'Mobile & Sync', icon: Smartphone, minLevel: 'enterprise' },
    { id: 'funnels', label: 'Funnels', icon: Activity, minLevel: 'enterprise' },
    { id: 'cohorts', label: 'Cohorts', icon: Users, minLevel: 'enterprise' },
    { id: 'regional', label: 'Regional (MENA/India/Asia)', icon: Globe, minLevel: 'internal' },
    { id: 'system', label: 'System Health', icon: PieChart, minLevel: 'internal' },
  ];

  const isTabAccessible = (minLevel: string) => {
    const levelHierarchy = { business: 0, enterprise: 1, internal: 2 };
    return levelHierarchy[accessLevel] >= levelHierarchy[minLevel as keyof typeof levelHierarchy];
  };

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header with access level indicator */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">
            {accessLevel === 'internal' && 'Platform-wide analytics • All regions and workspaces'}
            {accessLevel === 'enterprise' && 'Enterprise analytics • Your workspace data'}
            {accessLevel === 'business' && 'Basic analytics • Key metrics overview'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={accessLevel === 'internal' ? 'default' : 'secondary'}
            className={accessLevel === 'internal' ? 'bg-purple-600' : ''}
          >
            {accessLevel === 'internal' && <Crown className="w-3 h-3 mr-1" />}
            {accessLevel.charAt(0).toUpperCase() + accessLevel.slice(1)}
          </Badge>
          <div className="flex gap-1">
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
      </div>

      {/* Upgrade prompt for business tier */}
      {accessLevel === 'business' && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <Crown className="h-4 w-4 text-amber-500" />
          <AlertDescription className="flex items-center justify-between">
            <span>Upgrade to Enterprise for advanced analytics, funnels, cohorts, and regional insights.</span>
            <Button size="sm" variant="outline" className="ml-4">
              Upgrade Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="inline-flex w-max gap-1 p-1">
            {availableTabs.map((tab) => {
              const accessible = isTabAccessible(tab.minLevel);
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  disabled={!accessible}
                  className={!accessible ? 'opacity-50' : ''}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                  {!accessible && <Lock className="w-3 h-3 ml-1 text-muted-foreground" />}
                </TabsTrigger>
              );
            })}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Overview Tab - Available to all */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {accessLevel === 'internal' ? '12,847' : '324'}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% from last period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {accessLevel === 'internal' ? '1,420' : '89'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Content Generated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {accessLevel === 'internal' ? '45,230' : '1,847'}
                </div>
                <p className="text-xs text-muted-foreground">
                  This period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">94.5%</div>
                <p className="text-xs text-muted-foreground">
                  Generation success
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Basic charts for all tiers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueMetricsPanel showTrend={canAccessAdvanced} />
            {canAccessAdvanced && (
              <FunnelVisualization 
                funnelId="signup_to_generation" 
                title="User Journey" 
                description="From signup to first generation"
              />
            )}
          </div>
        </TabsContent>

        {/* Collaboration Tab - Available to all (P4-COLLAB-08/09/10) */}
        <TabsContent value="collaboration" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TeamActivityFeed 
              workspaceId={workspaceId} 
              limit={25}
              showStats={canAccessAdvanced}
            />
            <NotificationsPanel />
          </div>
        </TabsContent>
        <TabsContent value="predictive" className="space-y-6">
          {canAccessAdvanced ? (
            <div className="space-y-6">
              <AnomalyDetectionAlerts />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChurnPredictionDashboard />
                <GoalTrackingPanel />
              </div>
            </div>
          ) : (
            <LockedFeatureCard feature="Predictive Analytics" requiredLevel="enterprise" />
          )}
        </TabsContent>

        {/* Performance Tab - Enterprise+ (Real-time, Costs, Usage) */}
        <TabsContent value="performance" className="space-y-6">
          {canAccessAdvanced ? (
            <div className="space-y-6">
              <RealTimeMetricsPanel />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProviderCostAnalysisPanel />
                <FeatureUsagePanel />
              </div>
            </div>
          ) : (
            <LockedFeatureCard feature="Performance Analytics" requiredLevel="enterprise" />
          )}
        </TabsContent>

        {/* Distribution Tab - Enterprise+ (Publishing analytics) */}
        <TabsContent value="distribution" className="space-y-6">
          {canAccessAdvanced ? (
            <PublishingAnalyticsPanel />
          ) : (
            <LockedFeatureCard feature="Distribution Analytics" requiredLevel="enterprise" />
          )}
        </TabsContent>

        {/* Mobile & Sync Tab - Enterprise+ */}
        <TabsContent value="mobile" className="space-y-6">
          {canAccessAdvanced ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MobileDownloadsPanel />
              <CrossPlatformSyncPanel />
            </div>
          ) : (
            <LockedFeatureCard feature="Mobile & Sync Analytics" requiredLevel="enterprise" />
          )}
        </TabsContent>

        {/* Regional Tab - Internal only */}
        <TabsContent value="regional" className="space-y-6">
          {canAccessRegional ? (
            <RegionalAnalyticsPanel />
          ) : (
            <LockedFeatureCard feature="Regional Analytics" requiredLevel="internal" />
          )}
        </TabsContent>

        {/* Funnels Tab - Enterprise+ */}
        <TabsContent value="funnels" className="space-y-6">
          {canAccessAdvanced ? (
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
          ) : (
            <LockedFeatureCard feature="Funnel Analytics" requiredLevel="enterprise" />
          )}
        </TabsContent>

        {/* Cohorts Tab - Enterprise+ */}
        <TabsContent value="cohorts" className="space-y-6">
          {canAccessAdvanced ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CohortRetentionHeatmap weeks={8} />
              <CohortRetentionHeatmap region="mena" weeks={8} />
            </div>
          ) : (
            <LockedFeatureCard feature="Cohort Analytics" requiredLevel="enterprise" />
          )}
        </TabsContent>

        {/* System Health Tab - Internal only */}
        <TabsContent value="system" className="space-y-6">
          {accessLevel === 'internal' ? (
            <RegionalAnalyticsPanel />
          ) : (
            <LockedFeatureCard feature="System Health" requiredLevel="internal" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Locked feature placeholder
const LockedFeatureCard: React.FC<{ feature: string; requiredLevel: string }> = ({ 
  feature, 
  requiredLevel 
}) => (
  <Card className="border-dashed">
    <CardContent className="flex flex-col items-center justify-center py-12">
      <Lock className="w-12 h-12 text-muted-foreground mb-4" />
      <CardTitle className="text-lg mb-2">{feature}</CardTitle>
      <CardDescription className="text-center max-w-md mb-4">
        This feature requires {requiredLevel === 'enterprise' ? 'Enterprise' : 'Internal Admin'} access.
        {requiredLevel === 'enterprise' && ' Upgrade your plan to unlock advanced analytics.'}
      </CardDescription>
      {requiredLevel === 'enterprise' && (
        <Button variant="outline">
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to Enterprise
        </Button>
      )}
    </CardContent>
  </Card>
);

export default TieredAnalyticsDashboard;

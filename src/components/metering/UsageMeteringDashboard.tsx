/**
 * Usage Metering Dashboard - P2 #121
 * 
 * Displays real-time usage metrics and metering for AI features.
 * Tracks API calls, credits consumed, and resource utilization.
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  Activity,
  Zap,
  Clock,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  CreditCard,
  MessageSquare,
  Film,
  Volume2,
  Brain,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useConversationLimits } from '@/hooks/useConversationLimits';
import { useSubscription } from '@/hooks/useSubscription';

// ============================================================================
// TYPES
// ============================================================================

interface UsageMetric {
  id: string;
  name: string;
  icon: React.ReactNode;
  current: number;
  limit: number;
  unit: string;
  period: 'day' | 'month';
  trend?: number;
  color: string;
}

interface UsageEvent {
  id: string;
  timestamp: string;
  feature: string;
  action: string;
  credits: number;
  status: 'success' | 'failed' | 'pending';
}

// ============================================================================
// COMPONENT
// ============================================================================

export const UsageMeteringDashboard: React.FC<{ className?: string }> = ({ className }) => {
  const { moduleStats, recentEvents, isLoading, refetch } = useUsageTracking();
  const { tierLimits, usage, usagePercentages, isNearLimit } = useConversationLimits();
  const { subscription } = useSubscription();
  const tier = subscription?.tier || 'free';
  const credits = { used: 0, total: 1000 }; // Placeholder - would come from credit tracking

  // Usage metrics derived from hooks
  const metrics: UsageMetric[] = [
    {
      id: 'conversations',
      name: 'AI Conversations',
      icon: <MessageSquare className="h-4 w-4" />,
      current: usage.conversationsToday,
      limit: tierLimits.conversationsPerDay,
      unit: 'conversations',
      period: 'day',
      trend: 12,
      color: 'text-blue-500',
    },
    {
      id: 'credits',
      name: 'AI Credits',
      icon: <Zap className="h-4 w-4" />,
      current: credits?.used || 0,
      limit: credits?.total || 1000,
      unit: 'credits',
      period: 'month',
      trend: -5,
      color: 'text-amber-500',
    },
    {
      id: 'voice',
      name: 'Voice Minutes',
      icon: <Volume2 className="h-4 w-4" />,
      current: usage.voiceMinutesUsedThisMonth,
      limit: tierLimits.voiceMinutesPerMonth,
      unit: 'minutes',
      period: 'month',
      trend: 8,
      color: 'text-purple-500',
    },
    {
      id: 'video',
      name: 'Video Minutes',
      icon: <Film className="h-4 w-4" />,
      current: usage.videoMinutesUsedThisMonth,
      limit: tierLimits.videoMinutesPerMonth,
      unit: 'minutes',
      period: 'month',
      trend: 15,
      color: 'text-green-500',
    },
  ];

  // Mock recent events (would come from actual tracking)
  const mockEvents: UsageEvent[] = [
    { id: '1', timestamp: new Date().toISOString(), feature: 'Script Generator', action: 'generate_script', credits: 5, status: 'success' },
    { id: '2', timestamp: new Date(Date.now() - 300000).toISOString(), feature: 'TTS Engine', action: 'text_to_speech', credits: 3, status: 'success' },
    { id: '3', timestamp: new Date(Date.now() - 600000).toISOString(), feature: 'RAG Search', action: 'knowledge_query', credits: 2, status: 'success' },
    { id: '4', timestamp: new Date(Date.now() - 900000).toISOString(), feature: 'Video Assembly', action: 'compile_video', credits: 10, status: 'pending' },
    { id: '5', timestamp: new Date(Date.now() - 1200000).toISOString(), feature: 'Image Generation', action: 'generate_image', credits: 8, status: 'failed' },
  ];

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Usage Metering
            </CardTitle>
            <CardDescription>
              Real-time tracking of AI feature consumption
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn(
              tier === 'business' ? 'border-green-500 text-green-600' :
              tier === 'pro' ? 'border-blue-500 text-blue-600' :
              tier === 'starter' ? 'border-amber-500 text-amber-600' :
              'border-slate-500'
            )}>
              {tier || 'Free'} Tier
            </Badge>
            <Button variant="ghost" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
            <TabsTrigger value="modules">By Module</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.map(metric => {
                const percentage = metric.limit > 0 ? (metric.current / metric.limit) * 100 : 0;
                const isNear = percentage >= 80;
                const isOver = percentage >= 100;
                
                return (
                  <Card key={metric.id} className={cn(
                    "border",
                    isOver && "border-red-500/50 bg-red-500/5",
                    isNear && !isOver && "border-amber-500/50 bg-amber-500/5"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className={cn("p-2 rounded-full bg-muted", metric.color)}>
                          {metric.icon}
                        </div>
                        {metric.trend !== undefined && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs",
                              metric.trend > 0 ? "text-green-600" : "text-red-600"
                            )}
                          >
                            <TrendingUp className={cn(
                              "h-3 w-3 mr-1",
                              metric.trend < 0 && "rotate-180"
                            )} />
                            {Math.abs(metric.trend)}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium mb-1">{metric.name}</p>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-2xl font-bold">{metric.current.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">
                          / {metric.limit.toLocaleString()} {metric.unit}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(percentage, 100)} 
                        className={cn(
                          "h-2",
                          isOver && "[&>div]:bg-red-500",
                          isNear && !isOver && "[&>div]:bg-amber-500"
                        )} 
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {metric.period === 'day' ? 'Today' : 'This month'}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Warnings */}
            {isNearLimit.any && (
              <Card className="border-amber-500/50 bg-amber-500/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Usage Warning</p>
                    <p className="text-xs text-muted-foreground">
                      You're approaching your usage limits. Consider upgrading for more capacity.
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    Upgrade
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{mockEvents.filter(e => e.status === 'success').length}</p>
                  <p className="text-xs text-muted-foreground">Successful Operations</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">2.3s</p>
                  <p className="text-xs text-muted-foreground">Avg Response Time</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <CreditCard className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{mockEvents.reduce((sum, e) => sum + e.credits, 0)}</p>
                  <p className="text-xs text-muted-foreground">Credits Used Today</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {mockEvents.map(event => (
                  <div 
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        event.status === 'success' && "bg-green-500",
                        event.status === 'failed' && "bg-red-500",
                        event.status === 'pending' && "bg-amber-500"
                      )} />
                      <div>
                        <p className="text-sm font-medium">{event.feature}</p>
                        <p className="text-xs text-muted-foreground">{event.action}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        {event.credits} credits
                      </Badge>
                      <span className="text-xs text-muted-foreground w-16 text-right">
                        {formatTimeAgo(event.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* By Module Tab */}
          <TabsContent value="modules">
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {moduleStats.map(stat => (
                  <Card key={stat.moduleId}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-primary" />
                          <span className="font-medium">{stat.moduleName}</span>
                        </div>
                        <Badge 
                          variant={stat.isOverLimit ? 'destructive' : 'outline'}
                          className="text-xs"
                        >
                          {stat.usageCount} / {stat.limit}
                        </Badge>
                      </div>
                      <Progress 
                        value={stat.percentUsed} 
                        className={cn(
                          "h-2",
                          stat.isOverLimit && "[&>div]:bg-red-500",
                          stat.percentUsed >= 80 && !stat.isOverLimit && "[&>div]:bg-amber-500"
                        )}
                      />
                      {stat.lastUsed && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Last used: {formatTimeAgo(stat.lastUsed)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {moduleStats.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No module usage data yet</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UsageMeteringDashboard;

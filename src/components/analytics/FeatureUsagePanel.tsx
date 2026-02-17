/**
 * Feature Usage Analytics Component
 * P4-ANA-23: Feature Usage Analytics
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { businessAnalyticsService, FeatureUsageMetric } from '@/services/analytics/businessAnalyticsService';
import { TrendingUp, TrendingDown, Minus, Star, Users, Clock, BarChart3 } from 'lucide-react';

export const FeatureUsagePanel: React.FC = () => {
  const { data: features, isLoading } = useQuery({
    queryKey: ['analytics', 'feature-usage'],
    queryFn: () => businessAnalyticsService.getFeatureUsageMetrics(),
    staleTime: 5 * 60 * 1000,
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Generation: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30',
      Audio: 'bg-green-100 text-green-800 dark:bg-green-900/30',
      Localization: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30',
      Presentation: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30',
      Editing: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30',
      Assets: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30',
      Publishing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30',
      Insights: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const maxUsage = Math.max(...(features?.map(f => f.usageCount) || [1]));

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-20 bg-muted/50 rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Feature Usage Analytics
        </CardTitle>
        <CardDescription>Track adoption and usage across features</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {features?.map((feature) => (
            <div
              key={feature.featureId}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{feature.featureName}</h4>
                    <Badge className={getCategoryColor(feature.category)}>
                      {feature.category}
                    </Badge>
                    {getTrendIcon(feature.trend)}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{feature.satisfaction.toFixed(1)}</span>
                </div>
              </div>

              {/* Usage Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Usage</span>
                  <span className="font-medium">{feature.usageCount.toLocaleString()}</span>
                </div>
                <Progress 
                  value={(feature.usageCount / maxUsage) * 100} 
                  className="h-2"
                />
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">Users</p>
                    <p className="font-medium">{feature.uniqueUsers.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">Adoption</p>
                    <p className="font-medium">{feature.adoptionRate}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">Avg Time</p>
                    <p className="font-medium">{feature.avgTimePerSession}m</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureUsagePanel;

/**
 * Provider Cost Analysis Component
 * P4-ANA-20: Provider Cost Analysis
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { performanceAnalyticsService, ProviderCostAnalysis } from '@/services/analytics/performanceAnalyticsService';
import { TrendingUp, TrendingDown, Minus, DollarSign, Clock, CheckCircle } from 'lucide-react';

export const ProviderCostAnalysisPanel: React.FC = () => {
  const { data: providers, isLoading } = useQuery({
    queryKey: ['analytics', 'provider-costs'],
    queryFn: () => performanceAnalyticsService.getProviderCostAnalysis(),
    staleTime: 5 * 60 * 1000,
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'llm': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'tts': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'video': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'image': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
      case 'stt': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const totalCost = providers?.reduce((sum, p) => sum + p.totalCost, 0) || 0;

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-muted/50 rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Provider Cost Analysis</CardTitle>
            <CardDescription>Cost breakdown by AI provider</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Cost (30d)</p>
            <p className="text-2xl font-bold">${totalCost.toLocaleString()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {providers?.map((provider) => (
            <div
              key={provider.providerId}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{provider.providerName}</h4>
                      <Badge className={getCategoryColor(provider.category)}>
                        {provider.category.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {provider.requestCount.toLocaleString()} requests
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-lg font-bold">${provider.totalCost.toLocaleString()}</span>
                    {getTrendIcon(provider.costTrend)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ${provider.avgCostPerRequest.toFixed(4)}/request
                  </p>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                    <p className="font-medium">{provider.successRate}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Latency</p>
                    <p className="font-medium">{provider.avgLatency}ms</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Cost Share</p>
                    <p className="font-medium">
                      {((provider.totalCost / totalCost) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Cost Progress Bar */}
              <Progress 
                value={(provider.totalCost / totalCost) * 100} 
                className="h-2 mb-2"
              />

              {/* Recommendations */}
              {provider.recommendations.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Recommendations:</p>
                  <div className="flex flex-wrap gap-1">
                    {provider.recommendations.map((rec, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {rec}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderCostAnalysisPanel;

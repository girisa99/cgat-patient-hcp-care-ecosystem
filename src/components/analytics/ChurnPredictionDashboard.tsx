/**
 * Churn Prediction Dashboard Component
 * P4-ANA-18: Churn Prediction
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { predictiveAnalyticsService, ChurnRiskUser, ChurnMetrics } from '@/services/analytics/predictiveAnalyticsService';
import { AlertTriangle, TrendingDown, Users, DollarSign, Mail, Phone, RefreshCw } from 'lucide-react';

export const ChurnPredictionDashboard: React.FC = () => {
  const { data: metrics, isLoading: metricsLoading, refetch } = useQuery({
    queryKey: ['analytics', 'churn-metrics'],
    queryFn: () => predictiveAnalyticsService.getChurnMetrics(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: atRiskUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['analytics', 'at-risk-users'],
    queryFn: () => predictiveAnalyticsService.getAtRiskUsers(undefined, 15),
    staleTime: 5 * 60 * 1000,
  });

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      default: return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    }
  };

  if (metricsLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-20 bg-muted/50 rounded" />
          <div className="h-40 bg-muted/50 rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk Users</p>
                <p className="text-2xl font-bold">{metrics?.totalAtRisk || 0}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Risk</p>
                <p className="text-2xl font-bold text-red-600">{metrics?.criticalRiskCount || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Risk Score</p>
                <p className="text-2xl font-bold">{metrics?.avgRiskScore?.toFixed(1) || 0}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue at Risk</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${metrics?.predictedChurnRevenue?.toLocaleString() || 0}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Factors */}
      <Card>
        <CardHeader>
          <CardTitle>Top Risk Factors</CardTitle>
          <CardDescription>Most common reasons for potential churn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics?.topRiskFactors.map((factor, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{factor.factor}</span>
                    <span className="text-sm text-muted-foreground">{factor.frequency}%</span>
                  </div>
                  <Progress value={factor.frequency} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* At-Risk Users List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>At-Risk Users</CardTitle>
            <CardDescription>Users identified as churn risks with suggested actions</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {usersLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-20 bg-muted/50 rounded animate-pulse" />
                ))
              ) : (
                atRiskUsers?.map((user) => (
                  <div
                    key={user.userId}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.displayName || user.email}</span>
                          <Badge variant="outline" className="text-xs">
                            {user.tier}
                          </Badge>
                          <Badge className={getRiskColor(user.riskLevel)}>
                            {user.riskLevel} ({user.riskScore}%)
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Last active: {new Date(user.lastActive).toLocaleDateString()} 
                          ({user.daysInactive} days ago)
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {user.factors.map((factor, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChurnPredictionDashboard;

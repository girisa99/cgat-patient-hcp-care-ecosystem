/**
 * ANALYTICS WIDGET - Compact dashboard for embedding
 * Shows key metrics for enterprise/business users on their main dashboard
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BarChart3, 
  ArrowRight,
  Activity,
  Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AnalyticsWidgetProps {
  tier: 'business' | 'enterprise';
  className?: string;
}

export const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({ tier, className }) => {
  // Mock data - would come from actual analytics hook
  const metrics = {
    totalUsers: tier === 'enterprise' ? 324 : 89,
    activeSessions: tier === 'enterprise' ? 42 : 12,
    contentGenerated: tier === 'enterprise' ? 1847 : 423,
    successRate: 94.5,
    trend: 12,
  };

  const topRegions = [
    { name: 'MENA', value: 35, color: 'bg-blue-500' },
    { name: 'India', value: 28, color: 'bg-green-500' },
    { name: 'SEA', value: 22, color: 'bg-purple-500' },
    { name: 'Other', value: 15, color: 'bg-gray-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Analytics Overview</CardTitle>
            </div>
            <Link to="/genie-analytics">
              <Button variant="ghost" size="sm" className="text-xs">
                View Full Analytics
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
          <CardDescription>
            {tier === 'enterprise' ? 'Your workspace performance' : 'Key metrics'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <Users className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <div className="text-lg font-bold">{metrics.totalUsers}</div>
              <div className="text-xs text-muted-foreground">Users</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <Activity className="w-4 h-4 mx-auto mb-1 text-green-500" />
              <div className="text-lg font-bold text-green-600">{metrics.activeSessions}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <BarChart3 className="w-4 h-4 mx-auto mb-1 text-purple-500" />
              <div className="text-lg font-bold">{metrics.contentGenerated}</div>
              <div className="text-xs text-muted-foreground">Generated</div>
            </div>
          </div>

          {/* Success Rate */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Success Rate</span>
              <span className="font-medium flex items-center gap-1">
                {metrics.successRate}%
                <TrendingUp className="w-3 h-3 text-green-500" />
              </span>
            </div>
            <Progress value={metrics.successRate} className="h-2" />
          </div>

          {/* Regional Breakdown (Enterprise only) */}
          {tier === 'enterprise' && (
            <div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <Globe className="w-3 h-3" />
                Regional Distribution
              </div>
              <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                {topRegions.map((region) => (
                  <div
                    key={region.name}
                    className={`${region.color}`}
                    style={{ width: `${region.value}%` }}
                    title={`${region.name}: ${region.value}%`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {topRegions.slice(0, 3).map((region) => (
                  <Badge key={region.name} variant="outline" className="text-xs">
                    {region.name} {region.value}%
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Trend indicator */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-muted-foreground">vs last 7 days</span>
            <Badge variant="secondary" className="text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{metrics.trend}%
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AnalyticsWidget;

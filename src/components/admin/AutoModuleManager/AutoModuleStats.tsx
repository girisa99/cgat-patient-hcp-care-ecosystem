
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { moduleRegistry } from '@/utils/moduleRegistry';
import { TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';

interface AutoModuleStatsProps {
  stats: {
    autoRegistered: number;
    needsReview: number;
    totalScanned: number;
  };
}

export const AutoModuleStats: React.FC<AutoModuleStatsProps> = ({ stats }) => {
  const registryStats = moduleRegistry.getStats();
  const successRate = stats.totalScanned > 0 ? (stats.autoRegistered / stats.totalScanned) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Auto Registration Rate</CardTitle>
          {successRate >= 70 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-yellow-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(successRate)}%</div>
          <Progress value={successRate} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {stats.autoRegistered} of {stats.totalScanned} auto-registered
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Components Detected</CardTitle>
          <Activity className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{registryStats.totalComponents}</div>
          <div className="flex space-x-2 mt-1">
            <Badge variant="outline" className="text-xs">
              UI Components
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Services Detected</CardTitle>
          <Activity className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{registryStats.totalServices}</div>
          <div className="flex space-x-2 mt-1">
            <Badge variant="outline" className="text-xs">
              Data & API Services
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
          <AlertCircle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.needsReview}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Low confidence modules
          </p>
        </CardContent>
      </Card>
    </div>
  );
};


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { moduleRegistry } from '@/utils/moduleRegistry';
import { Activity, Component, Settings, Zap } from 'lucide-react';

interface ModuleStatsProps {
  totalModules: number;
  activeModules: number;
  inactiveModules: number;
}

export const ModuleStats: React.FC<ModuleStatsProps> = ({
  totalModules,
  activeModules,
  inactiveModules
}) => {
  // Get detailed stats from the registry
  const registryStats = moduleRegistry.getStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalModules}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
            <Badge variant="default" className="text-xs">
              {activeModules} Active
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {inactiveModules} Inactive
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Components</CardTitle>
          <Component className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{registryStats.totalComponents}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
            <Badge variant="outline" className="text-xs">
              {registryStats.protectedComponents} Protected
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Services</CardTitle>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{registryStats.totalServices}</div>
          <div className="text-xs text-muted-foreground mt-1">
            API & Data Services
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hooks</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{registryStats.totalHooks}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Custom React Hooks
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

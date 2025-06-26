
/**
 * Module Statistics Component
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  const stats = [
    { label: 'Total Modules', value: totalModules, color: 'blue' },
    { label: 'Active Modules', value: activeModules, color: 'green' },
    { label: 'Inactive Modules', value: inactiveModules, color: 'red' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold text-${stat.color}-600`}>
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

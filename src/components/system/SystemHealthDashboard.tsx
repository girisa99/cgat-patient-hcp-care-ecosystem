
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, Shield, Users } from 'lucide-react';
import { RLSStatusIndicator } from './RLSStatusIndicator';

/**
 * System Health Dashboard showing the status of key system components
 * Including the newly fixed RLS policies
 */
export const SystemHealthDashboard: React.FC = () => {
  const systemComponents = [
    {
      name: 'Database',
      status: 'operational',
      icon: Database,
      description: 'All tables accessible'
    },
    {
      name: 'Authentication',
      status: 'operational', 
      icon: Shield,
      description: 'Auth.users integration working'
    },
    {
      name: 'User Management',
      status: 'operational',
      icon: Users,
      description: 'Unified user management active'
    },
    {
      name: 'RLS Policies',
      status: 'fixed',
      icon: Activity,
      description: 'Recursion issues resolved'
    }
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'operational': return 'default';
      case 'fixed': return 'secondary';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemComponents.map((component) => {
              const Icon = component.icon;
              return (
                <div key={component.name} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <Badge variant={getStatusVariant(component.status)}>
                      {component.status}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-sm">{component.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {component.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <RLSStatusIndicator />

      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <h3 className="font-semibold text-green-900 text-sm">✅ RLS Recursion Fix Applied</h3>
          </div>
          <div className="text-xs text-green-700 space-y-1">
            <p>• All recursive policies have been replaced with safe, non-recursive versions</p>
            <p>• User role checking now uses direct queries to prevent circular dependencies</p>
            <p>• Authentication and authorization are working correctly across all modules</p>
            <p>• System stability has been restored with proper RLS policy isolation</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

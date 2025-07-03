
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useModules } from '@/hooks/useModules';

const RoutingPreferences: React.FC = () => {
  const { modules, isLoading } = useModules();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Module Routing Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Module Routing Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {modules.map((module) => (
            <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium">{module.name}</h3>
                  <Badge variant={module.is_active ? 'default' : 'secondary'}>
                    {module.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {module.description && (
                  <p className="text-sm text-gray-600">{module.description}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Auto-route enabled</p>
                </div>
                <Switch 
                  defaultChecked={module.is_active}
                  disabled={!module.is_active}
                />
              </div>
            </div>
          ))}
          
          {modules.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No modules available for routing configuration.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoutingPreferences;

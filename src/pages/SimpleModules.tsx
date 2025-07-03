import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/components/layout/AppLayout';
import { useModules } from '@/hooks/useModules';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Badge } from '@/components/ui/badge';

const SimpleModules: React.FC = () => {
  console.log('📦 Simple Modules page rendering');
  const { modules, isLoading, error, getModuleStats } = useModules();
  const { hasAccess, currentRole } = useRoleBasedNavigation();

  if (!hasAccess('/modules')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access Modules Management.</p>
            <p className="text-sm text-muted-foreground mt-2">Current role: {currentRole}</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const stats = getModuleStats();

  return (
    <AppLayout title="Modules Management">
      <div className="space-y-6">
        {/* Module Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Modules</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-muted-foreground">Active Modules</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.userAccessible}</div>
              <div className="text-sm text-muted-foreground">User Accessible</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{Object.keys(stats.byCategory || {}).length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </CardContent>
          </Card>
        </div>

        {/* Module Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Module Management
              <Badge variant="outline">{modules.length} modules</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading modules...</p>
            ) : error ? (
              <p className="text-red-600">Error: {String(error)}</p>
            ) : (
              <div className="space-y-4">
                <p>Managing {modules.length} system modules and their configurations.</p>
                
                {/* Module List Preview */}
                <div className="space-y-2">
                  {modules.slice(0, 5).map((module: any) => (
                    <div key={module.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{module.name}</div>
                        <div className="text-sm text-muted-foreground">{module.description}</div>
                      </div>
                      <Badge variant={module.is_active ? 'default' : 'secondary'}>
                        {module.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                  {modules.length > 5 && (
                    <p className="text-sm text-muted-foreground">
                      And {modules.length - 5} more modules...
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SimpleModules;
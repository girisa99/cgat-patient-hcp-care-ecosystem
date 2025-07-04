
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Activity, Database } from 'lucide-react';
import { useMasterModules } from '@/hooks/useMasterModules';

const SimpleModules: React.FC = () => {
  const { modules, activeModules, isLoading, getModuleStats } = useMasterModules();
  
  console.log('📦 Simple Modules - Real Database Integration');
  
  const stats = getModuleStats();

  return (
    <AppLayout title="Simple Modules">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Simple Modules View</h1>
            <p className="text-muted-foreground">
              Simplified module overview - Real database integration
            </p>
          </div>
          <Badge variant="default" className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            Real Data Active
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                From database
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Modules</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactive}</div>
              <p className="text-xs text-muted-foreground">
                Not active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Modules List */}
        <Card>
          <CardHeader>
            <CardTitle>All Modules</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center p-8">Loading modules from database...</div>
            ) : (
              <div className="space-y-4">
                {modules.map((module) => (
                  <div key={module.id} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-medium">{module.name}</h3>
                      <p className="text-sm text-gray-600">{module.description || 'No description'}</p>
                      <p className="text-xs text-gray-500">Created: {new Date(module.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={module.is_active ? "default" : "secondary"}>
                      {module.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
                {modules.length === 0 && (
                  <div className="text-center p-8 text-gray-500">
                    No modules found in database
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Source Information */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Data Source: Real Database (Supabase)</span>
              <span>Total Records: {modules.length}</span>
              <span>No Mock Data: ✅</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SimpleModules;

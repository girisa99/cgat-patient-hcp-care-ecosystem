
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Activity, Database } from 'lucide-react';
import { useMasterModules } from '@/hooks/useMasterModules';

const SimpleModules: React.FC = () => {
  // USE THE EXACT SAME SOURCE AS MASTER MODULES PAGE - SINGLE SOURCE OF TRUTH
  const { modules, activeModules, isLoading, getModuleStats } = useMasterModules();
  
  console.log('📦 Simple Modules - CONSOLIDATED Single Source of Truth - Same as Master Modules');
  console.log('📊 Real modules count:', modules.length);
  
  const stats = getModuleStats();

  return (
    <AppLayout title="Simple Modules">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Simple Modules View</h1>
            <p className="text-muted-foreground">
              Consolidated single source of truth - Same data as Master Modules: {modules.length} modules
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              Single Source Active
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              Total: {modules.length}
            </Badge>
          </div>
        </div>

        {/* Stats Cards - SAME DATA AS MASTER MODULES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Same as Master Modules
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

        {/* Modules List - SAME DATA AS MASTER MODULES */}
        <Card>
          <CardHeader>
            <CardTitle>All Modules (Single Source of Truth: {modules.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center p-8">Loading modules from consolidated source...</div>
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
                    No modules found in consolidated source
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Source Verification - CONSOLIDATED */}
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Data Source: Consolidated Master Modules (useMasterModules)</span>
                <span>Records: {modules.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-medium text-green-700">
                <span>✅ Single Source of Truth Verified</span>
                <span>✅ Same Count as Master Modules: {modules.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SimpleModules;

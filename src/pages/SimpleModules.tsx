
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw, Plus, Package } from 'lucide-react';
import { useMasterData } from '@/hooks/useMasterData';
import { useMasterAuth } from '@/hooks/useMasterAuth';

const SimpleModules: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, userRoles } = useMasterAuth();
  const { 
    modules, 
    isLoading, 
    error, 
    refreshData, 
    stats,
    createModule,
    isCreatingModule
  } = useMasterData();
  
  const [searchQuery, setSearchQuery] = React.useState('');

  console.log('📦 Modules Page - Master Data Integration');

  const handleCreateModule = () => {
    createModule({
      name: `New Module ${Date.now()}`,
      description: 'Auto-generated module for testing'
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-muted-foreground">Loading modules...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">Please log in to view modules</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-600">Error loading modules: {error.message}</div>
            <Button onClick={refreshData} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredModules = modules.filter(module =>
    module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (module.description && module.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Module Management</h1>
        <p className="text-muted-foreground">
          Configure and manage system modules and features
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalModules}</div>
          <div className="text-sm text-blue-600">Total Modules</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.activeModules}</div>
          <div className="text-sm text-green-600">Active</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{stats.totalModules - stats.activeModules}</div>
          <div className="text-sm text-orange-600">Inactive</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{userRoles.length}</div>
          <div className="text-sm text-purple-600">Your Roles</div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              System Modules ({filteredModules.length})
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={refreshData}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={handleCreateModule}
                disabled={isCreatingModule}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {isCreatingModule ? 'Creating...' : 'Add Module'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Modules List */}
            {filteredModules.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No modules found</p>
                {searchQuery && (
                  <p className="text-sm">Try adjusting your search terms</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredModules.map((module) => (
                  <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{module.name}</div>
                        <Badge variant={module.is_active ? 'default' : 'secondary'}>
                          {module.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {module.description && (
                        <div className="text-sm text-muted-foreground mt-1">{module.description}</div>
                      )}
                      <div className="text-xs text-muted-foreground mt-2">
                        Created: {new Date(module.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleModules;

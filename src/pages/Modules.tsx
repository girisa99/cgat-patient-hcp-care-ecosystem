
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Package, CheckCircle } from 'lucide-react';
import { useMasterModules } from '@/hooks/useMasterModules';
import { MasterConsolidationStatus } from '@/components/verification/MasterConsolidationStatus';

const Modules: React.FC = () => {
  const { hasAccess } = useRoleBasedNavigation();
  const masterModules = useMasterModules();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newModule, setNewModule] = useState({
    name: '',
    description: '',
    is_active: true
  });

  if (!hasAccess('/modules')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access Modules.</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const handleCreateModule = () => {
    if (newModule.name.trim()) {
      masterModules.createModule(newModule);
      setNewModule({ name: '', description: '', is_active: true });
      setShowCreateForm(false);
    }
  };

  const integrity = masterModules.verifyModuleIntegrity();

  return (
    <AppLayout title="Master Modules Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Master Modules System</h1>
            <p className="text-muted-foreground">
              Single source of truth for all module management - Consolidated, Verified, Validated
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={integrity.isHealthy ? "default" : "destructive"}>
              {integrity.isHealthy ? "✅ Healthy" : "⚠️ Issues"}
            </Badge>
            <Button onClick={() => setShowCreateForm(true)} disabled={masterModules.isCreating}>
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </div>
        </div>

        <Tabs defaultValue="modules" className="space-y-4">
          <TabsList>
            <TabsTrigger value="modules">Modules ({masterModules.modules.length})</TabsTrigger>
            <TabsTrigger value="verification">Master Consolidation</TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="space-y-4">
            {/* Create Module Form */}
            {showCreateForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Module</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Module Name</Label>
                    <Input
                      id="name"
                      value={newModule.name}
                      onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
                      placeholder="Enter module name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newModule.description}
                      onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                      placeholder="Enter module description"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateModule} disabled={masterModules.isCreating}>
                      {masterModules.isCreating ? 'Creating...' : 'Create Module'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Modules List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {masterModules.isLoading ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    Loading modules...
                  </CardContent>
                </Card>
              ) : masterModules.modules.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No modules found</p>
                  </CardContent>
                </Card>
              ) : (
                masterModules.modules.map((module) => (
                  <Card key={module.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{module.name}</CardTitle>
                        <Badge variant={module.is_active ? "default" : "secondary"}>
                          {module.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {module.description && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {module.description}
                        </p>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(module.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="verification">
            <MasterConsolidationStatus />
          </TabsContent>
        </Tabs>

        {/* System Meta Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Master Consolidation Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Version</div>
                <div className="text-muted-foreground">{masterModules.meta.version}</div>
              </div>
              <div>
                <div className="font-medium">Architecture</div>
                <div className="text-muted-foreground">{masterModules.meta.architectureType}</div>
              </div>
              <div>
                <div className="font-medium">Single Source</div>
                <div className="text-green-600">
                  {masterModules.meta.singleSourceValidated ? '✅ Validated' : '❌ Invalid'}
                </div>
              </div>
              <div>
                <div className="font-medium">Cache Strategy</div>
                <div className="text-muted-foreground font-mono text-xs">{masterModules.meta.cacheKey}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Modules;

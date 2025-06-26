
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Settings, Users, Plus } from 'lucide-react';
import { useModules } from '@/hooks/useModules';
import ModuleAssignmentDialog from '@/components/modules/ModuleAssignmentDialog';
import CreateModuleDialog from '@/components/modules/CreateModuleDialog';
import ModuleRoleAssignmentDialog from '@/components/modules/ModuleRoleAssignmentDialog';

const Modules = () => {
  const { modules, userModules, isLoadingModules, isLoadingUserModules } = useModules();
  const [moduleAssignmentOpen, setModuleAssignmentOpen] = useState(false);
  const [createModuleOpen, setCreateModuleOpen] = useState(false);
  const [roleAssignmentOpen, setRoleAssignmentOpen] = useState(false);

  if (isLoadingModules || isLoadingUserModules) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Module Management</h2>
          <p className="text-muted-foreground">
            Manage system modules and access permissions
          </p>
        </div>
        <Button onClick={() => setCreateModuleOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Module
        </Button>
      </div>

      {/* Available Modules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Available Modules ({modules?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules?.map((module) => (
              <Card key={module.id} className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    {module.name}
                    <Badge variant="secondary">
                      {module.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {module.description || 'No description available'}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setModuleAssignmentOpen(true)}
                    >
                      <Users className="h-3 w-3 mr-1" />
                      Assign to User
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setRoleAssignmentOpen(true)}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Assign to Role
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User's Current Modules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Your Active Modules ({userModules?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userModules && userModules.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {userModules.map((module) => (
                <div key={module.module_id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{module.module_name}</h4>
                    <Badge variant="outline">{module.source}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {module.module_description}
                  </p>
                  {module.expires_at && (
                    <p className="text-xs text-amber-600">
                      Expires: {new Date(module.expires_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No modules currently assigned to you.</p>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ModuleAssignmentDialog
        open={moduleAssignmentOpen}
        onOpenChange={setModuleAssignmentOpen}
      />

      <CreateModuleDialog
        open={createModuleOpen}
        onOpenChange={setCreateModuleOpen}
      />

      <ModuleRoleAssignmentDialog
        open={roleAssignmentOpen}
        onOpenChange={setRoleAssignmentOpen}
      />
    </div>
  );
};

export default Modules;

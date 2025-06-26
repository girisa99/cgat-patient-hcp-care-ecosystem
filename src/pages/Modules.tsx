
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
  const [selectedModule, setSelectedModule] = useState<any>(null);

  if (isLoadingModules || isLoadingUserModules) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleAssignToUser = (module: any) => {
    setSelectedModule(module);
    setModuleAssignmentOpen(true);
  };

  const handleAssignToRole = (module: any) => {
    setSelectedModule(module);
    setRoleAssignmentOpen(true);
  };

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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules?.map((module) => (
              <Card key={module.id} className="border-2 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight break-words">
                      {module.name}
                    </CardTitle>
                    <Badge variant="secondary" className="shrink-0">
                      {module.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed min-h-[2.5rem]">
                    {module.description || 'No description available'}
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAssignToUser(module)}
                      className="w-full"
                    >
                      <Users className="h-3 w-3 mr-2" />
                      Assign to User
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAssignToRole(module)}
                      className="w-full"
                    >
                      <Shield className="h-3 w-3 mr-2" />
                      Assign to Role
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {(!modules || modules.length === 0) && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No modules available. Create your first module to get started.</p>
            </div>
          )}
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userModules.map((module) => (
                <div key={module.module_id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium leading-tight break-words">{module.module_name}</h4>
                    <Badge variant="outline" className="shrink-0">{module.source}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {module.module_description || 'No description available'}
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
        selectedModule={selectedModule}
      />

      <CreateModuleDialog
        open={createModuleOpen}
        onOpenChange={setCreateModuleOpen}
      />

      <ModuleRoleAssignmentDialog
        open={roleAssignmentOpen}
        onOpenChange={setRoleAssignmentOpen}
        selectedModule={selectedModule}
      />
    </div>
  );
};

export default Modules;

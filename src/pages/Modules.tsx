
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Settings, List, Plus } from 'lucide-react';
import { useModules } from '@/hooks/useModules';
import { CreateModuleDialog } from '@/components/modules/CreateModuleDialog';
import { ModuleAssignmentDialog } from '@/components/modules/ModuleAssignmentDialog';
import { ModuleRoleAssignmentDialog } from '@/components/modules/ModuleRoleAssignmentDialog';
import { useToast } from '@/hooks/use-toast';
import { AutoModuleManager } from '@/components/admin/AutoModuleManager';

const Modules = () => {
  const { modules, isLoading, createModule, updateModule, deleteModule } = useModules();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [roleAssignmentDialogOpen, setRoleAssignmentDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const { toast } = useToast();

  const handleCreateModule = async (moduleData: any) => {
    try {
      await createModule(moduleData);
      setCreateDialogOpen(false);
      toast({
        title: "Module Created",
        description: "New module has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create module.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    try {
      await deleteModule(moduleId);
      toast({
        title: "Module Deleted",
        description: "Module has been removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete module.",
        variant: "destructive",
      });
    }
  };

  const stats = [
    { label: 'Total Modules', value: modules?.length || 0, color: 'blue' },
    { label: 'Active Modules', value: modules?.filter(m => m.is_active).length || 0, color: 'green' },
    { label: 'Inactive Modules', value: modules?.filter(m => !m.is_active).length || 0, color: 'red' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Module Management</h1>
          <p className="text-gray-600">Manage application modules and their configurations</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Module
        </Button>
      </div>

      {/* Stats */}
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

      {/* Tabs */}
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">
            <List className="w-4 h-4 mr-2" />
            Module List
          </TabsTrigger>
          <TabsTrigger value="auto">
            <Zap className="w-4 h-4 mr-2" />
            Auto Detection
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All Modules</CardTitle>
            </CardHeader>
            <CardContent>
              {modules && modules.length > 0 ? (
                <div className="space-y-4">
                  {modules.map((module) => (
                    <div key={module.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{module.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={module.is_active ? "default" : "secondary"}>
                            {module.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedModule(module);
                              setAssignmentDialogOpen(true);
                            }}
                          >
                            Assign Users
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedModule(module);
                              setRoleAssignmentDialogOpen(true);
                            }}
                          >
                            Assign Roles
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteModule(module.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No modules found. Create your first module to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auto">
          <AutoModuleManager />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Module Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Auto-Registration</h3>
                    <p className="text-sm text-gray-600">Automatically register new modules when detected</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Code Generation</h3>
                    <p className="text-sm text-gray-600">Generate boilerplate code for new modules</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Schema Validation</h3>
                    <p className="text-sm text-gray-600">Validate module configurations against database schema</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateModuleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateModule}
      />
      
      {selectedModule && (
        <>
          <ModuleAssignmentDialog
            open={assignmentDialogOpen}
            onOpenChange={setAssignmentDialogOpen}
            module={selectedModule}
          />
          <ModuleRoleAssignmentDialog
            open={roleAssignmentDialogOpen}
            onOpenChange={setRoleAssignmentDialogOpen}
            module={selectedModule}
          />
        </>
      )}
    </div>
  );
};

export default Modules;

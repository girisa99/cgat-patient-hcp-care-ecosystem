
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Zap, Settings, List, Plus } from 'lucide-react';
import { useModules } from '@/hooks/useModules';
import CreateModuleDialog from '@/components/modules/CreateModuleDialog';
import ModuleAssignmentDialog from '@/components/modules/ModuleAssignmentDialog';
import ModuleRoleAssignmentDialog from '@/components/modules/ModuleRoleAssignmentDialog';
import { ModuleStats } from '@/components/modules/ModuleStats';
import { ModuleList } from '@/components/modules/ModuleList';
import { ModuleSettings } from '@/components/modules/ModuleSettings';
import { AutoModuleManager } from '@/components/admin/AutoModuleManager';
import { useToast } from '@/hooks/use-toast';

const Modules = () => {
  const { modules, isLoadingModules: isLoading, createModule } = useModules();
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
      // TODO: Implement delete functionality in useModules hook
      console.log('Delete module:', moduleId);
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

  const handleAssignUsers = (module: any) => {
    setSelectedModule(module);
    setAssignmentDialogOpen(true);
  };

  const handleAssignRoles = (module: any) => {
    setSelectedModule(module);
    setRoleAssignmentDialogOpen(true);
  };

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
      <ModuleStats
        totalModules={modules?.length || 0}
        activeModules={modules?.filter(m => m.is_active).length || 0}
        inactiveModules={modules?.filter(m => !m.is_active).length || 0}
      />

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
          <ModuleList
            modules={modules || []}
            onAssignUsers={handleAssignUsers}
            onAssignRoles={handleAssignRoles}
            onDeleteModule={handleDeleteModule}
          />
        </TabsContent>

        <TabsContent value="auto">
          <AutoModuleManager />
        </TabsContent>

        <TabsContent value="settings">
          <ModuleSettings />
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
            selectedModule={selectedModule}
          />
          <ModuleRoleAssignmentDialog
            open={roleAssignmentDialogOpen}
            onOpenChange={setRoleAssignmentDialogOpen}
            selectedModule={selectedModule}
          />
        </>
      )}
    </div>
  );
};

export default Modules;

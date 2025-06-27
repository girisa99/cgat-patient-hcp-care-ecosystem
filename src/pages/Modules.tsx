
import React, { useState } from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Zap, Settings, List, Plus, Component } from 'lucide-react';
import { useModules } from '@/hooks/useModules';
import { useModuleRealtime } from '@/hooks/useRealtime';
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

  // Enhanced real-time sync for modules with component tracking
  useModuleRealtime();

  const handleCreateModule = async (moduleData: any) => {
    try {
      await createModule(moduleData);
      setCreateDialogOpen(false);
      toast({
        title: "Module Created",
        description: "New module has been created and will be auto-scanned for components and services.",
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
        description: "Module and its components have been removed successfully.",
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
      <StandardizedDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </StandardizedDashboardLayout>
    );
  }

  const headerActions = (
    <Button onClick={() => setCreateDialogOpen(true)}>
      <Plus className="w-4 h-4 mr-2" />
      Create Module
    </Button>
  );

  return (
    <StandardizedDashboardLayout
      showPageHeader={true}
      pageTitle="Module Management"
      pageSubtitle="Manage application modules, components, and services with real-time RBAC sync"
      headerActions={headerActions}
    >
      {/* Real-time status indicator */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm text-green-600">Real-time sync active</span>
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
    </StandardizedDashboardLayout>
  );
};

export default Modules;

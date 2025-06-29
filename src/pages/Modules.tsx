import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { ModuleList } from '@/components/modules/ModuleList';
import { ModuleStats } from '@/components/modules/ModuleStats';
import AutoModuleManager from '@/components/admin/AutoModuleManager';
import CreateModuleDialog from '@/components/modules/CreateModuleDialog';
import ModuleUserAssignmentDialog from '@/components/modules/ModuleUserAssignmentDialog';
import ModuleRoleAssignmentDialog from '@/components/modules/ModuleRoleAssignmentDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useModules } from '@/hooks/useModules';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAdminRealtime } from '@/hooks/useAdminRealtime';

const Modules = () => {
  // Enable real-time updates for modules area
  useAdminRealtime({
    enableNotifications: true,
    areas: ['dashboard', 'rbac', 'userManagement', 'apiIntegration']
  });

  const { modules, isLoading } = useModules();
  const { toast } = useToast();
  const [selectedModule, setSelectedModule] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUserAssignmentDialog, setShowUserAssignmentDialog] = useState(false);
  const [showRoleAssignmentDialog, setShowRoleAssignmentDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);

  const handleAssignUsers = (module: any) => {
    console.log('Opening user assignment dialog for module:', module);
    setSelectedModule(module);
    setShowUserAssignmentDialog(true);
  };

  const handleAssignRoles = (module: any) => {
    console.log('Opening role assignment dialog for module:', module);
    setSelectedModule(module);
    setShowRoleAssignmentDialog(true);
  };

  const handleDeleteModule = (moduleId: string) => {
    const module = modules?.find(m => m.id === moduleId);
    if (module) {
      console.log('Preparing to delete module:', module);
      setModuleToDelete(module);
      setShowDeleteDialog(true);
    }
  };

  const confirmDeleteModule = async () => {
    if (!moduleToDelete) return;
    
    try {
      console.log('Deleting module:', moduleToDelete.id);
      
      // Here you would typically call a delete mutation
      // For now, we'll show a toast indicating the action would happen
      toast({
        title: "Module Deletion",
        description: `Module "${moduleToDelete.name}" deletion initiated. This would remove the module and all associated assignments.`,
        variant: "destructive",
      });
      
      setShowDeleteDialog(false);
      setModuleToDelete(null);
    } catch (error) {
      console.error('Error deleting module:', error);
      toast({
        title: "Error",
        description: "Failed to delete module. Please try again.",
        variant: "destructive",
      });
    }
  };

  const moduleList = modules || [];
  const totalModules = moduleList.length;
  const activeModules = moduleList.filter(m => m.is_active).length;
  const inactiveModules = totalModules - activeModules;

  const headerActions = (
    <Button onClick={() => setShowCreateDialog(true)}>
      <Plus className="h-4 w-4 mr-2" />
      Add Module
    </Button>
  );

  return (
    <MainLayout>
      <PageContainer
        title="Modules"
        subtitle="Manage system modules and their configurations"
        headerActions={headerActions}
      >
        <div className="space-y-6">
          <ModuleStats 
            totalModules={totalModules}
            activeModules={activeModules}
            inactiveModules={inactiveModules}
          />
          <AutoModuleManager />
          <ModuleList 
            modules={moduleList}
            onAssignUsers={handleAssignUsers}
            onAssignRoles={handleAssignRoles}
            onDeleteModule={handleDeleteModule}
          />

          <CreateModuleDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
          />

          <ModuleUserAssignmentDialog
            open={showUserAssignmentDialog}
            onOpenChange={setShowUserAssignmentDialog}
            selectedModule={selectedModule}
          />

          <ModuleRoleAssignmentDialog
            open={showRoleAssignmentDialog}
            onOpenChange={setShowRoleAssignmentDialog}
            selectedModule={selectedModule}
          />

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Module</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the module "{moduleToDelete?.name}"? 
                  This action cannot be undone and will remove all user and role assignments for this module.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDeleteModule} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete Module
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default Modules;

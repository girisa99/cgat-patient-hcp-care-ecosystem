
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { ModuleList } from '@/components/modules/ModuleList';
import { ModuleStats } from '@/components/modules/ModuleStats';
import AutoModuleManager from '@/components/admin/AutoModuleManager';
import CreateModuleDialog from '@/components/modules/CreateModuleDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useModules } from '@/hooks/useModules';

const Modules = () => {
  const { modules, isLoadingModules } = useModules();
  const [selectedModule, setSelectedModule] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleAssignUsers = (module: any) => {
    console.log('Assigning users to module:', module);
    // TODO: Implement user assignment logic
  };

  const handleAssignRoles = (module: any) => {
    console.log('Assigning roles to module:', module);
    // TODO: Implement role assignment logic
  };

  const handleDeleteModule = (moduleId: string) => {
    console.log('Deleting module:', moduleId);
    // TODO: Implement module deletion logic
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
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default Modules;

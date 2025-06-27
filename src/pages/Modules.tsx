
import React from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import ModuleList from '@/components/modules/ModuleList';
import ModuleStats from '@/components/modules/ModuleStats';
import AutoModuleManager from '@/components/admin/AutoModuleManager';

const Modules = () => {
  return (
    <StandardizedDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modules</h1>
          <p className="text-muted-foreground">
            Manage system modules and their configurations
          </p>
        </div>
        
        <ModuleStats />
        <AutoModuleManager />
        <ModuleList />
      </div>
    </StandardizedDashboardLayout>
  );
};

export default Modules;

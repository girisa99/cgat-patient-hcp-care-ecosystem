import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { ModulesManagementTable } from '@/components/modules/ModulesManagementTable';

const Modules: React.FC = () => {
  console.log('📦 Modules page - Using existing working components and relationships');
  
  const { hasAccess, currentRole } = useRoleBasedNavigation();
  
  if (!hasAccess('/modules')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access Modules Management.</p>
            <p className="text-sm text-muted-foreground mt-2">Current role: {currentRole}</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Modules Management">
      <ModulesManagementTable />
    </AppLayout>
  );
};

export default Modules;

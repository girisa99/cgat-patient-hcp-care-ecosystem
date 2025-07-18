import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { ExtensibleModuleTemplate } from '@/templates/components/ExtensibleModuleTemplate';
import { useModules } from '@/hooks/useModules';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';

const Modules: React.FC = () => {
  console.log('📦 Modules page - Using template structure');
  
  const { hasAccess, currentRole } = useRoleBasedNavigation();
  const modules = useModules();
  
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

  const columns = [
    {
      key: 'name',
      header: 'Name'
    },
    {
      key: 'description',
      header: 'Description'
    },
    {
      key: 'version',
      header: 'Version',
      cell: (value: string) => <Badge variant="outline">{value || '1.0.0'}</Badge>
    },
    {
      key: 'is_active',
      header: 'Status',
      cell: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      )
    }
  ];

  return (
    <AppLayout title="Modules Management">
      <ExtensibleModuleTemplate
        title="Modules"
        description="Manage system modules and their configurations"
        items={modules.items}
        isLoading={modules.isLoading}
        error={modules.error}
        searchItems={modules.searchItems}
        createItem={undefined}
        updateItem={undefined}
        deleteItem={undefined}
        getStatistics={modules.getStatistics}
        columns={columns}
        onRefresh={modules.refetch}
        customActions={
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
          </div>
        }
      />
    </AppLayout>
  );
};

export default Modules;

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { ExtensibleModuleTemplate } from '@/templates/components/ExtensibleModuleTemplate';
import { useFacilities } from '@/hooks/useFacilities';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';

const Facilities: React.FC = () => {
  console.log('🏥 Facilities page - Using template structure');
  
  const { hasAccess, currentRole } = useRoleBasedNavigation();
  const facilities = useFacilities();
  
  if (!hasAccess('/facilities')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access Facilities Management.</p>
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
      key: 'facility_type',
      header: 'Type',
      cell: (value: string) => <Badge variant="outline">{value}</Badge>
    },
    {
      key: 'address',
      header: 'Address'
    },
    {
      key: 'phone',
      header: 'Phone'
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
    <AppLayout title="Facilities Management">
      <ExtensibleModuleTemplate
        title="Facilities"
        description="Manage healthcare facilities and their configurations"
        items={facilities.items}
        isLoading={facilities.isLoading}
        error={facilities.error}
        searchItems={facilities.searchItems}
        createItem={undefined}
        updateItem={undefined}
        deleteItem={undefined}
        getStatistics={facilities.getStatistics}
        columns={columns}
        onRefresh={facilities.refetch}
        customActions={
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
          </div>
        }
      />
    </AppLayout>
  );
};

export default Facilities;

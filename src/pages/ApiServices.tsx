
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { ExtensibleModuleTemplate } from '@/templates/components/ExtensibleModuleTemplate';
import { useApiServices } from '@/hooks/useApiServices';
import { Badge } from '@/components/ui/badge';
import { Globe } from 'lucide-react';

const ApiServices = () => {
  console.log('🚀 API Services page - Using template structure');
  
  const apiServices = useApiServices();

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
      key: 'type',
      header: 'Type',
      cell: (value: string) => <Badge variant="outline">{value}</Badge>
    },
    {
      key: 'direction',
      header: 'Direction',
      cell: (value: string) => <Badge variant="secondary">{value}</Badge>
    },
    {
      key: 'status',
      header: 'Status',
      cell: (value: string) => (
        <Badge variant={value === 'active' ? "default" : "secondary"}>
          {value}
        </Badge>
      )
    }
  ];
  
  return (
    <AppLayout title="API Services">
      <ExtensibleModuleTemplate
        title="API Services"
        description="Comprehensive API ecosystem management including internal services, external integrations, publishing, marketplace, developer portal, and more"
        items={apiServices.items}
        isLoading={apiServices.isLoading}
        error={apiServices.error}
        searchItems={apiServices.searchItems}
        createItem={undefined}
        updateItem={undefined}
        deleteItem={undefined}
        getStatistics={apiServices.getStatistics}
        columns={columns}
        onRefresh={apiServices.refetch}
        customActions={
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
          </div>
        }
      />
    </AppLayout>
  );
};

export default ApiServices;

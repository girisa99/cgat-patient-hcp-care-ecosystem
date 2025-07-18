
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { ExtensibleModuleTemplate } from '@/templates/components/ExtensibleModuleTemplate';
import { usePatients } from '@/hooks/usePatients';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

const Patients: React.FC = () => {
  console.log('🏥 Patients page - Using template structure');
  
  const { hasAccess, currentRole } = useRoleBasedNavigation();
  const patients = usePatients();
  
  if (!hasAccess('/patients')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access Patient Management.</p>
            <p className="text-sm text-muted-foreground mt-2">Current role: {currentRole}</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const columns = [
    {
      key: 'first_name',
      header: 'First Name'
    },
    {
      key: 'last_name',
      header: 'Last Name'
    },
    {
      key: 'email',
      header: 'Email'
    },
    {
      key: 'phone',
      header: 'Phone'
    },
    {
      key: 'created_at',
      header: 'Registered',
      cell: (value: string) => value ? new Date(value).toLocaleDateString() : 'N/A'
    }
  ];

  return (
    <AppLayout title="Patient Management">
      <ExtensibleModuleTemplate
        title="Patients"
        description="Manage patient profiles and healthcare information"
        items={patients.items}
        isLoading={patients.isLoading}
        error={patients.error}
        searchItems={patients.searchItems}
        createItem={undefined}
        updateItem={undefined}
        deleteItem={undefined}
        getStatistics={patients.getStatistics}
        columns={columns}
        onRefresh={patients.refetch}
        customActions={
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
          </div>
        }
      />
    </AppLayout>
  );
};

export default Patients;

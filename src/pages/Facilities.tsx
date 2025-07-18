import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { FacilitiesManagementTable } from '@/components/facilities/FacilitiesManagementTable';

const Facilities: React.FC = () => {
  console.log('🏥 Facilities page - Using existing working components and relationships');
  
  const { hasAccess, currentRole } = useRoleBasedNavigation();
  
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

  return (
    <AppLayout title="Facilities Management">
      <FacilitiesManagementTable />
    </AppLayout>
  );
};

export default Facilities;

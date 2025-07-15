
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardManagementTable } from '@/components/dashboard/DashboardManagementTable';

const Index: React.FC = () => {
  console.log('🏠 Dashboard/Index page - Using existing working components and relationships');
  
  const { hasAccess, currentRole } = useRoleBasedNavigation();
  
  if (!hasAccess('/dashboard')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access the Dashboard.</p>
            <p className="text-sm text-muted-foreground mt-2">Current role: {currentRole}</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Healthcare Management Dashboard">
      <DashboardManagementTable />
    </AppLayout>
  );
};

export default Index;

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { UserManagementTable } from '@/components/users/UserManagementTable';

const SimpleUsers: React.FC = () => {
  console.log('👥 Simple Users page rendering');
  const { hasAccess, currentRole } = useRoleBasedNavigation();

  if (!hasAccess('/users')) {
    return (
      <AppLayout title="Access Denied">
        <Card>
          <CardContent className="p-8 text-center">
            <p>You don't have permission to access User Management.</p>
            <p className="text-sm text-muted-foreground mt-2">Current role: {currentRole}</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="User Management">
      <UserManagementTable />
    </AppLayout>
  );
};

export default SimpleUsers;
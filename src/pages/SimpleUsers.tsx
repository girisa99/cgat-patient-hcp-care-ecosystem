import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { UserManagementTable } from '@/components/users/UserManagementTable';

const SimpleUsers: React.FC = () => {
  console.log('👥 Simple Users page rendering - START');
  
  // Simple debug version first
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">User Management Debug</h1>
      <p>Page is loading successfully!</p>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p>Debug info:</p>
        <p>- Route: /users</p>
        <p>- Component: SimpleUsers</p>
        <p>- Status: Rendering</p>
      </div>
    </div>
  );
  
  /*
  const { hasAccess, currentRole } = useRoleBasedNavigation();
  
  console.log('🔍 Debug - hasAccess:', hasAccess('/users'), 'currentRole:', currentRole);

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
  */
};

export default SimpleUsers;

import React from 'react';
import UnifiedDashboardLayout from '@/components/layout/UnifiedDashboardLayout';
import { UserManagement } from '@/components/admin/UserManagement';
import { useFacilities } from '@/hooks/useFacilities';

const UsersPage: React.FC = () => {
  const { facilities } = useFacilities();

  return (
    <UnifiedDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-600">
            Manage users, roles, and permissions. {facilities.length} facilities available.
          </p>
        </div>
        <UserManagement />
      </div>
    </UnifiedDashboardLayout>
  );
};

export default UsersPage;

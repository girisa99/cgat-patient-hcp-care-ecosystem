
import React from 'react';
import UnifiedDashboardLayout from '@/components/layout/UnifiedDashboardLayout';
import { UserManagementMain } from '@/components/admin/UserManagement/UserManagementMain';

const AdminPage: React.FC = () => {
  return (
    <UnifiedDashboardLayout>
      <UserManagementMain />
    </UnifiedDashboardLayout>
  );
};

export default AdminPage;

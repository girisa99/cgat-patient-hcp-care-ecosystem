
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { UserManagementMain } from '@/components/admin/UserManagement/UserManagementMain';

const Users: React.FC = () => {
  return (
    <MainLayout>
      <PageContainer
        title="Users"
        subtitle="Manage users, roles, and permissions across the platform"
        fluid
      >
        <UserManagementMain />
      </PageContainer>
    </MainLayout>
  );
};

export default Users;

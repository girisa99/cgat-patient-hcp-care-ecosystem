
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { ConsolidatedUserManagement } from '@/components/admin/UserManagement/ConsolidatedUserManagement';

const UsersPage: React.FC = () => {
  console.log('👥 UsersPage: Rendering with consolidated user management');

  return (
    <MainLayout>
      <PageContainer
        title="User Management"
        subtitle="Unified user management system with single source of truth"
        fluid
      >
        <ConsolidatedUserManagement />
      </PageContainer>
    </MainLayout>
  );
};

export default UsersPage;

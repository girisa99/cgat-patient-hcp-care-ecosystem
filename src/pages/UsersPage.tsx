
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { CompactUserManagement } from '@/components/users/CompactUserManagement';

const UsersPage: React.FC = () => {
  return (
    <MainLayout>
      <PageContainer
        title="Users"
        subtitle="Manage user accounts and permissions"
      >
        <CompactUserManagement />
      </PageContainer>
    </MainLayout>
  );
};

export default UsersPage;

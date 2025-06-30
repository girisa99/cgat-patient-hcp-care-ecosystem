
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';

const UsersPage: React.FC = () => {
  return (
    <MainLayout>
      <PageContainer
        title="Users"
        subtitle="Manage user accounts and permissions"
      >
        <p>User management content will be implemented here.</p>
      </PageContainer>
    </MainLayout>
  );
};

export default UsersPage;

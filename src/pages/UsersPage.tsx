
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import CompactUserManagement from '@/components/users/CompactUserManagement';

const UsersPage: React.FC = () => {
  return (
    <MainLayout>
      <PageContainer
        title="Users"
        subtitle="Manage user accounts and permissions"
      >
        <CompactUserManagement 
          stats={{
            totalUsers: 0,
            usersWithRoles: 0,
            activeUsers: 0,
            usersWithFacilities: 0
          }}
          onCreateUser={() => {}}
          onAssignRole={() => {}}
          onAssignFacility={() => {}}
          onEditUser={() => {}}
        />
      </PageContainer>
    </MainLayout>
  );
};

export default UsersPage;

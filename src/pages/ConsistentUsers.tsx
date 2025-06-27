
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import ConsistentUsersLayout from '@/components/users/ConsistentUsersLayout';

const ConsistentUsers = () => {
  return (
    <MainLayout>
      <PageContainer fluid>
        <ConsistentUsersLayout />
      </PageContainer>
    </MainLayout>
  );
};

export default ConsistentUsers;

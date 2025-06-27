
import React from 'react';
import UnifiedDashboardLayout from '@/components/layout/UnifiedDashboardLayout';
import { PageContent } from '@/components/layout/PageContent';
import ConsistentUsersLayout from '@/components/users/ConsistentUsersLayout';

const ConsistentUsers = () => {
  return (
    <UnifiedDashboardLayout>
      <PageContent
        maxWidth="full"
        padding="none"
      >
        <ConsistentUsersLayout />
      </PageContent>
    </UnifiedDashboardLayout>
  );
};

export default ConsistentUsers;

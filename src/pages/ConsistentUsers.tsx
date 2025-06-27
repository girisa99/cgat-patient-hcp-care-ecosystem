
import React from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import ConsistentUsersLayout from '@/components/users/ConsistentUsersLayout';

const ConsistentUsers = () => {
  return (
    <StandardizedDashboardLayout>
      <ConsistentUsersLayout />
    </StandardizedDashboardLayout>
  );
};

export default ConsistentUsers;

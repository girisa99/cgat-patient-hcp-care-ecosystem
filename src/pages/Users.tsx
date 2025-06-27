
import React from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import { ConsistentUsersLayout } from '@/components/users/ConsistentUsersLayout';

const Users = () => {
  return (
    <StandardizedDashboardLayout>
      <ConsistentUsersLayout>
        {/* The ConsistentUsersLayout will handle its own content */}
      </ConsistentUsersLayout>
    </StandardizedDashboardLayout>
  );
};

export default Users;

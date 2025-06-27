
import React from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import { ConsistentUsersLayout } from '@/components/users/ConsistentUsersLayout';

const Users = () => {
  return (
    <StandardizedDashboardLayout>
      <ConsistentUsersLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            User management functionality will be available here.
          </p>
        </div>
      </ConsistentUsersLayout>
    </StandardizedDashboardLayout>
  );
};

export default Users;

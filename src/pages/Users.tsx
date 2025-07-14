
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { MasterApplicationTable } from '@/components/master/MasterApplicationTable';

const Users = () => {
  console.log('👥 Users Page - Simplified without stability protection');

  return (
    <AppLayout title="Users">
      <div className="max-w-7xl mx-auto">
        <MasterApplicationTable />
      </div>
    </AppLayout>
  );
};

export default Users;

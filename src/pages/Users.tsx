
import React from 'react';
import DashboardHeader from "@/components/layout/DashboardHeader";
import { MasterApplicationTable } from '@/components/master/MasterApplicationTable';
import { UserManagementModule } from '@/components/isolation/IsolatedModule';
import { StateIsolationProvider } from '@/components/isolation/StateIsolation';

const Users = () => {
  console.log('👥 Users Page - Now using Phase 3 Component Isolation');

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StateIsolationProvider moduleId="user-management" isolated={true}>
          <UserManagementModule>
            <MasterApplicationTable />
          </UserManagementModule>
        </StateIsolationProvider>
      </div>
    </div>
  );
};

export default Users;

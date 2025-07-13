
import React from 'react';
import DashboardHeader from "@/components/layout/DashboardHeader";
import { MasterApplicationTable } from '@/components/master/MasterApplicationTable';

const Users = () => {
  console.log('👥 Users Page - Simplified without stability protection');

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MasterApplicationTable />
      </div>
    </div>
  );
};

export default Users;

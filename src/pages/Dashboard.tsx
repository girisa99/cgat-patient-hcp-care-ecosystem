
import React from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SystemStatusCard from '@/components/dashboard/SystemStatusCard';
import UserRolesCard from '@/components/dashboard/UserRolesCard';
import ProfileCard from '@/components/dashboard/ProfileCard';
import StatusAlerts from '@/components/dashboard/StatusAlerts';

const Dashboard = () => {
  return (
    <StandardizedDashboardLayout>
      <div className="space-y-6">
        <DashboardHeader />
        <StatusAlerts />
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <SystemStatusCard />
          <UserRolesCard />
          <ProfileCard />
        </div>
      </div>
    </StandardizedDashboardLayout>
  );
};

export default Dashboard;

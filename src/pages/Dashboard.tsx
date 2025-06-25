
import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardLoading from '@/components/dashboard/DashboardLoading';
import StatusAlerts from '@/components/dashboard/StatusAlerts';
import ProfileCard from '@/components/dashboard/ProfileCard';
import UserRolesCard from '@/components/dashboard/UserRolesCard';
import SystemStatusCard from '@/components/dashboard/SystemStatusCard';

const Dashboard = () => {
  const {
    profile,
    userRoles,
    loading,
    user,
    handleRefresh,
    handleAssignTestRole,
    getRoleColor,
    getRoleDescription
  } = useDashboard();

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        user={user}
        userRoles={userRoles}
        onRefresh={handleRefresh}
        onAssignTestRole={handleAssignTestRole}
      />

      <StatusAlerts
        user={user}
        profile={profile}
        userRoles={userRoles}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ProfileCard
          profile={profile}
          user={user}
        />

        <UserRolesCard
          userRoles={userRoles}
          user={user}
          getRoleColor={getRoleColor}
          getRoleDescription={getRoleDescription}
        />

        <SystemStatusCard
          user={user}
          profile={profile}
          userRoles={userRoles}
        />
      </div>
    </div>
  );
};

export default Dashboard;

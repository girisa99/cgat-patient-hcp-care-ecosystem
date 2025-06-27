
import React from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import { useDashboard } from '@/hooks/useDashboard';
import DashboardLoading from '@/components/dashboard/DashboardLoading';
import ProfileCard from '@/components/dashboard/ProfileCard';
import UserRolesCard from '@/components/dashboard/UserRolesCard';
import SystemStatusCard from '@/components/dashboard/SystemStatusCard';
import { Button } from '@/components/ui/button';
import { RefreshCw, UserPlus } from 'lucide-react';

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
    return (
      <StandardizedDashboardLayout>
        <DashboardLoading />
      </StandardizedDashboardLayout>
    );
  }

  const headerActions = (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Refresh Data
      </Button>
      {user && userRoles.length === 0 && (
        <Button
          variant="default"
          size="sm"
          onClick={handleAssignTestRole}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Test Role Assignment
        </Button>
      )}
    </div>
  );

  return (
    <StandardizedDashboardLayout
      showPageHeader={true}
      pageTitle="Dashboard"
      pageSubtitle="Healthcare System Overview"
      headerActions={headerActions}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
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
    </StandardizedDashboardLayout>
  );
};

export default Dashboard;

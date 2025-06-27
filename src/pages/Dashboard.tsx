
import React from 'react';
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
    return <DashboardLoading />;
  }

  return (
    <div className="w-full space-y-6">
      {/* Dashboard actions - moved here since we removed DashboardHeader */}
      <div className="flex justify-end items-center w-full">
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
      </div>

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
    </div>
  );
};

export default Dashboard;

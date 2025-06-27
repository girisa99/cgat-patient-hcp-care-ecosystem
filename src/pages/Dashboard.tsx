
import React from 'react';
import StandardizedDashboardLayout from '@/components/layout/StandardizedDashboardLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SystemStatusCard from '@/components/dashboard/SystemStatusCard';
import UserRolesCard from '@/components/dashboard/UserRolesCard';
import ProfileCard from '@/components/dashboard/ProfileCard';
import { useDashboard } from '@/hooks/useDashboard';

const Dashboard = () => {
  const {
    user,
    profile,
    userRoles,
    handleRefresh,
    handleAssignTestRole,
    getRoleColor,
    getRoleDescription
  } = useDashboard();

  console.log('🔍 Dashboard Debug Info:', {
    user: user ? 'Present' : 'Missing',
    profile: profile ? 'Present' : 'Missing',
    userRoles: userRoles.length,
    currentRoute: '/dashboard'
  });

  return (
    <StandardizedDashboardLayout>
      <div className="space-y-6">
        <DashboardHeader 
          user={user}
          userRoles={userRoles}
          onRefresh={handleRefresh}
          onAssignTestRole={handleAssignTestRole}
        />
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <SystemStatusCard 
            user={user}
            profile={profile}
            userRoles={userRoles}
          />
          <UserRolesCard 
            userRoles={userRoles}
            user={user}
            getRoleColor={getRoleColor}
            getRoleDescription={getRoleDescription}
          />
          <ProfileCard 
            profile={profile}
            user={user}
          />
        </div>
      </div>
    </StandardizedDashboardLayout>
  );
};

export default Dashboard;

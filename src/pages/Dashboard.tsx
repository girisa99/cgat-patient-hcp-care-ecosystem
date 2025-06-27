
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { AdminStatsGrid, StatCard } from '@/components/layout/AdminPageWrapper';
import { Card, CardContent } from '@/components/ui/card';
import SystemStatusCard from '@/components/dashboard/SystemStatusCard';
import UserRolesCard from '@/components/dashboard/UserRolesCard';
import ProfileCard from '@/components/dashboard/ProfileCard';
import { Button } from '@/components/ui/button';
import { RefreshCw, UserPlus, Users, Shield, Activity, Database } from 'lucide-react';
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
    <MainLayout>
      <PageContainer
        title="Dashboard"
        subtitle="Welcome to your healthcare portal dashboard"
        headerActions={headerActions}
      >
        <div className="space-y-6">
          {/* Quick Stats */}
          <AdminStatsGrid columns={4}>
            <StatCard
              title="System Status"
              value={user ? "Active" : "Inactive"}
              icon={Activity}
              description="Current system status"
            />
            <StatCard
              title="User Roles"
              value={userRoles.length}
              icon={Shield}
              description="Assigned roles"
            />
            <StatCard
              title="Profile Status"
              value={profile ? "Complete" : "Incomplete"}
              icon={Users}
              description="Profile completion"
            />
            <StatCard
              title="Data Access"
              value={user ? "Granted" : "Denied"}
              icon={Database}
              description="System access level"
            />
          </AdminStatsGrid>

          {/* Dashboard Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="shadow-sm">
              <CardContent className="p-0">
                <SystemStatusCard 
                  user={user}
                  profile={profile}
                  userRoles={userRoles}
                />
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardContent className="p-0">
                <UserRolesCard 
                  userRoles={userRoles}
                  user={user}
                  getRoleColor={getRoleColor}
                  getRoleDescription={getRoleDescription}
                />
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardContent className="p-0">
                <ProfileCard 
                  profile={profile}
                  user={user}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default Dashboard;


import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { AdminStatsGrid, StatCard } from '@/components/layout/AdminStatsGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building, Shield, Activity, Database, Zap } from 'lucide-react';
import { ModulesOverviewCard } from '@/components/dashboard/ModulesOverviewCard';
import { useUsers } from '@/hooks/useUsers';
import { useFacilities } from '@/hooks/useFacilities';
import { useModules } from '@/hooks/useModules';
import { useAdminRealtime } from '@/hooks/useAdminRealtime';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const Dashboard = () => {
  // Enable real-time updates for all admin areas
  useAdminRealtime({
    enableNotifications: true,
    areas: ['userManagement', 'facility', 'rbac', 'dashboard', 'apiIntegration']
  });

  const { users, isLoading: isLoadingUsers } = useUsers();
  const { facilities, isLoading: isLoadingFacilities } = useFacilities();
  const { modules, isLoading: isLoadingModules } = useModules();

  // Calculate real-time stats
  const stats = {
    totalUsers: users?.length || 0,
    activeUsers: users?.filter(u => u.last_login && 
      new Date(u.last_login) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length || 0,
    totalFacilities: facilities?.length || 0,
    activeFacilities: facilities?.filter(f => f.is_active).length || 0,
    totalModules: modules?.length || 0,
    activeModules: modules?.filter(m => m.is_active).length || 0,
    usersWithRoles: users?.filter(u => u.user_roles && u.user_roles.length > 0).length || 0
  };

  const isLoading = isLoadingUsers || isLoadingFacilities || isLoadingModules;

  if (isLoading) {
    return (
      <MainLayout>
        <PageContainer title="Dashboard" subtitle="Loading dashboard data...">
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        </PageContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageContainer
        title="Admin Dashboard"
        subtitle="Real-time overview of your healthcare platform with live updates"
      >
        <div className="space-y-6">
          {/* Real-time Stats Grid */}
          <AdminStatsGrid columns={6}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              description="All registered users"
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Active Users"
              value={stats.activeUsers}
              icon={Activity}
              description="Active in last 7 days"
              trend={{ value: 8, isPositive: true }}
            />
            <StatCard
              title="Total Facilities"
              value={stats.totalFacilities}
              icon={Building}
              description="Healthcare facilities"
            />
            <StatCard
              title="Active Facilities"
              value={stats.activeFacilities}
              icon={Zap}
              description="Currently active"
            />
            <StatCard
              title="System Modules"
              value={stats.totalModules}
              icon={Database}
              description="Available modules"
            />
            <StatCard
              title="Users with Roles"
              value={stats.usersWithRoles}
              icon={Shield}
              description="Role-based access control"
            />
          </AdminStatsGrid>

          {/* Real-time System Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ModulesOverviewCard />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Real-time System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">User Management Updates</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-green-600">Live</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Facility Management</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-green-600">Live</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Module & RBAC Updates</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-green-600">Live</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API Integrations</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-green-600">Live</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Dashboard Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  Real-time activity feed will appear here as changes occur across the system.
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Database</span>
                    <span className="text-sm text-green-600">Healthy</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Real-time Updates</span>
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">API Services</span>
                    <span className="text-sm text-green-600">Operational</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800">
                    View All Users →
                  </button>
                  <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800">
                    Manage Facilities →
                  </button>
                  <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800">
                    Configure Modules →
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default Dashboard;

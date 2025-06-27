
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { AdminStatsGrid, StatCard } from '@/components/layout/AdminStatsGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building2, 
  Activity, 
  Shield, 
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    dashboardData, 
    isLoading, 
    error, 
    refetch 
  } = useDashboard();

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "Dashboard Refreshed",
        description: "Dashboard data has been refreshed successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh dashboard data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const headerActions = (
    <Button 
      variant="outline" 
      onClick={handleRefresh}
      disabled={isLoading}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
      Refresh
    </Button>
  );

  // Show loading state
  if (isLoading) {
    return (
      <MainLayout>
        <PageContainer
          title="Dashboard"
          subtitle="Loading dashboard data..."
        >
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        </PageContainer>
      </MainLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <MainLayout>
        <PageContainer
          title="Dashboard"
          subtitle="Error loading dashboard data"
        >
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <p className="text-red-600">Failed to load dashboard: {error.message}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </PageContainer>
      </MainLayout>
    );
  }

  // Use dashboard data or fallback to default values
  const stats = dashboardData || {
    totalUsers: 0,
    totalFacilities: 0,
    activeModules: 0,
    systemHealth: 'healthy'
  };

  return (
    <MainLayout>
      <PageContainer
        title="Healthcare Admin Dashboard"
        subtitle={`Welcome back, ${user?.email || 'Administrator'}`}
        headerActions={headerActions}
      >
        <div className="space-y-6">
          {/* Stats Grid */}
          <AdminStatsGrid columns={4}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              description="Registered system users"
            />
            <StatCard
              title="Active Facilities"
              value={stats.totalFacilities}
              icon={Building2}
              description="Healthcare facilities"
            />
            <StatCard
              title="Active Modules"
              value={stats.activeModules}
              icon={Activity}
              description="System modules running"
            />
            <StatCard
              title="System Health"
              value={stats.systemHealth === 'healthy' ? 'Good' : 'Issues'}
              icon={stats.systemHealth === 'healthy' ? CheckCircle : AlertTriangle}
              description="Overall system status"
            />
          </AdminStatsGrid>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Manage Users
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Building2 className="h-6 w-6 mb-2" />
                  Manage Facilities
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Activity className="h-6 w-6 mb-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">
                  All systems operational
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default Dashboard;

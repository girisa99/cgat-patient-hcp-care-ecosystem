
import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  CheckCircle,
  Database,
  Globe,
  Server,
  Eye,
  TrendingUp
} from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useApiIntegrations } from '@/hooks/useApiIntegrations';
import { useAuditLogStats } from '@/hooks/useAuditLogs';
import { RealTimeDashboardStats } from '@/components/dashboard/RealTimeDashboardStats';
import { ModulesOverviewCard } from '@/components/dashboard/ModulesOverviewCard';
import { ComponentsServicesCard } from '@/components/dashboard/ComponentsServicesCard';
import { SystemHighlightsCard } from '@/components/dashboard/SystemHighlightsCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    dashboardData, 
    isLoading, 
    error, 
    refetch 
  } = useDashboard();

  // Get API integration data
  const { integrations, isLoading: integrationsLoading } = useApiIntegrations();
  
  // Get audit log statistics
  const { data: auditStats, isLoading: auditLoading } = useAuditLogStats();

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

  // Connected quick action handlers
  const handleManageUsers = () => {
    navigate('/users');
  };

  const handleManageFacilities = () => {
    navigate('/facilities');
  };

  const handleViewAnalytics = () => {
    navigate('/audit-log');
  };

  const handleViewApiIntegrations = () => {
    navigate('/api-integrations');
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
    systemHealth: 'healthy',
    apiIntegrations: 0,
    recentAuditLogs: 0
  };

  // Calculate API integration stats
  const apiStats = {
    totalIntegrations: integrations?.length || 0,
    activeIntegrations: integrations?.filter(api => api.status === 'active').length || 0,
    externalApis: integrations?.filter(api => api.type === 'external').length || 0,
    internalApis: integrations?.filter(api => api.type === 'internal').length || 0
  };

  return (
    <MainLayout>
      <PageContainer
        title="Healthcare Admin Dashboard"
        subtitle={`Welcome back, ${user?.email || 'Administrator'} - Real-time system monitoring`}
        headerActions={headerActions}
      >
        <div className="space-y-6">
          {/* Main Stats Grid */}
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

          {/* Real-time Activity Stats */}
          <RealTimeDashboardStats />

          {/* System Highlights */}
          <SystemHighlightsCard />

          {/* Modules and Components Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ModulesOverviewCard />
            <ComponentsServicesCard />
          </div>

          {/* API Integration Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  API Integration Overview
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleViewApiIntegrations}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3">
                  <Server className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{apiStats.totalIntegrations}</p>
                    <p className="text-sm text-muted-foreground">Total APIs</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{apiStats.activeIntegrations}</p>
                    <p className="text-sm text-muted-foreground">Active APIs</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{apiStats.externalApis}</p>
                    <p className="text-sm text-muted-foreground">External APIs</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Database className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{apiStats.internalApis}</p>
                    <p className="text-sm text-muted-foreground">Internal APIs</p>
                  </div>
                </div>
              </div>
              {integrationsLoading && (
                <div className="flex items-center mt-4">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading API data...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit Logs Real-time Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  System Activity & Security
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleViewAnalytics}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Logs
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <Activity className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{auditStats?.total_logs || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Audit Logs</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{auditStats?.today_logs || 0}</p>
                    <p className="text-sm text-muted-foreground">Today's Activity</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.recentAuditLogs}</p>
                    <p className="text-sm text-muted-foreground">Recent Activity</p>
                  </div>
                </div>
              </div>
              {auditLoading && (
                <div className="flex items-center mt-4">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading audit data...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Connected Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={handleManageUsers}
                >
                  <Users className="h-6 w-6 mb-2" />
                  Manage Users
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={handleManageFacilities}
                >
                  <Building2 className="h-6 w-6 mb-2" />
                  Manage Facilities
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={handleViewAnalytics}
                >
                  <Eye className="h-6 w-6 mb-2" />
                  View Audit Logs
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>Real-time System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Database Connection</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">API Services</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">
                    {apiStats.activeIntegrations}/{apiStats.totalIntegrations} Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Audit Logging</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Real-time Updates</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Connected</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default Dashboard;

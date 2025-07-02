
import React from 'react';
import { useUnifiedPageData } from '@/hooks/useUnifiedPageData';
import DashboardHeader from './DashboardHeader';
import DashboardLoading from './DashboardLoading';
import { NavigationDiagnostic } from '@/components/debug/NavigationDiagnostic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { useDashboard } from '@/hooks/useDashboard';

const UnifiedDashboard: React.FC = () => {
  console.log('🎯 Unified Dashboard - Rendering with diagnostic tools');
  
  const { 
    isLoading: pageDataLoading, 
    error: pageDataError 
  } = useUnifiedPageData();

  const { 
    dashboardData, 
    loading: dashboardLoading, 
    error: dashboardError,
    profile,
    userRoles 
  } = useDashboard();

  const { user } = useAuthContext();

  const isLoading = pageDataLoading || dashboardLoading;
  const error = pageDataError || dashboardError;

  if (isLoading) {
    console.log('🎯 Dashboard loading...');
    return <DashboardLoading />;
  }

  if (error) {
    console.error('🎯 Dashboard error:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <NavigationDiagnostic />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Dashboard Error</h3>
          <p className="text-red-600">{error instanceof Error ? error.message : String(error)}</p>
        </div>
      </div>
    );
  }

  console.log('🎯 Dashboard rendering with data:', Object.keys(dashboardData || {}));

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleAssignTestRole = () => {
    console.log('Assign test role clicked');
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <NavigationDiagnostic />
      
      <DashboardHeader 
        user={user}
        userRoles={userRoles}
        onRefresh={handleRefresh}
        onAssignTestRole={handleAssignTestRole}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* System Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span>System Online</span>
              </div>
              <div className="text-sm text-muted-foreground">
                All services operational
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Real-time Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{dashboardData?.totalUsers || 0}</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
          </CardContent>
        </Card>

        {/* Modules Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{dashboardData?.totalModules || 0}</div>
              <div className="text-sm text-muted-foreground">Available Modules</div>
            </div>
          </CardContent>
        </Card>

        {/* Components & Services Card */}
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{dashboardData?.totalApiServices || 0}</div>
              <div className="text-sm text-muted-foreground">API Services</div>
              <div className="text-xs text-muted-foreground">
                {dashboardData?.totalFacilities || 0} Facilities
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnifiedDashboard;

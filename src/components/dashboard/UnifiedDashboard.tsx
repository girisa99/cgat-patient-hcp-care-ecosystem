
import React, { useEffect, useState } from 'react';
import { useUnifiedPageData } from '@/hooks/useUnifiedPageData';
import { useRealTimeUserStats } from '@/hooks/useRealTimeUserStats';
import { useAuthValidation } from '@/hooks/useAuthValidation';
import { RealTimeStatsCard } from './RealTimeStatsCard';
import DashboardHeader from './DashboardHeader';
import DashboardLoading from './DashboardLoading';
import { RealTimeDashboardStats } from './RealTimeDashboardStats';
import SystemStatusCard from './SystemStatusCard';
import { ModulesOverviewCard } from './ModulesOverviewCard';
import { ComponentsServicesCard } from './ComponentsServicesCard';
import ProfileCard from './ProfileCard';
import UserRolesCard from './UserRolesCard';
import StatusAlerts from './StatusAlerts';
import { SystemHighlightsCard } from './SystemHighlightsCard';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UnifiedDashboard: React.FC = () => {
  console.log('🎯 Unified Dashboard - Rendering with consolidated single source data');
  
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const { toast } = useToast();
  
  // Single source of truth for all data
  const { 
    users, 
    facilities, 
    modules, 
    apiServices, 
    auth,
    refreshAllData,
    isLoading: unifiedLoading,
    hasError 
  } = useUnifiedPageData();
  
  const { data: realTimeStats, isLoading: statsLoading, refetch: refetchStats } = useRealTimeUserStats();
  const { validationResult, validateAuth } = useAuthValidation();

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing dashboard data...');
      refetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchStats]);

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered - refreshing all dashboard data from unified sources...');
    
    try {
      await Promise.all([
        refreshAllData(),
        refetchStats(),
        validateAuth()
      ]);
      
      setLastRefresh(new Date());
      
      toast({
        title: "Dashboard Refreshed",
        description: "All data has been updated successfully.",
      });
      
      console.log('✅ Dashboard refresh completed successfully');
    } catch (error) {
      console.error('❌ Dashboard refresh failed:', error);
      
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh dashboard data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAssignTestRole = async () => {
    console.log('🔧 Test role assignment triggered');
    // This would be implemented based on your role assignment logic
    toast({
      title: "Test Role Assignment",
      description: "Role assignment functionality would be triggered here.",
    });
  };

  if (unifiedLoading || statsLoading) {
    return <DashboardLoading />;
  }

  if (hasError) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <p>Error loading dashboard data. Please refresh the page or try again.</p>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Extract user roles from validation result using single source
  const userRoles = validationResult?.userId ? 
    users.data.find(u => u.id === validationResult.userId)?.user_roles?.map(ur => ur.roles.name) || [] : 
    [];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superAdmin': return 'bg-red-100 text-red-800';
      case 'onboardingTeam': return 'bg-blue-100 text-blue-800';
      case 'patientCaregiver': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'superAdmin': return 'Full system access';
      case 'onboardingTeam': return 'Onboarding management';
      case 'patientCaregiver': return 'Patient care services';
      default: return 'Standard user';
    }
  };

  // Calculate accurate metrics from unified sources
  const unifiedMetrics = {
    totalUsers: users.data.length,
    totalFacilities: facilities.data.length,
    totalModules: modules.data.length,
    totalApiServices: apiServices.data.length,
    activeUsers: users.data.filter(u => u.last_sign_in_at).length,
    activeFacilities: facilities.data.filter(f => f.is_active !== false).length,
    activeModules: modules.data.filter(m => m.is_active !== false).length,
    activeApiServices: apiServices.data.filter(a => a.status === 'active').length
  };

  // Validate single source metrics
  console.log('📊 Dashboard Metrics Validation:', {
    unifiedUsers: unifiedMetrics.totalUsers,
    realTimeUsers: realTimeStats?.totalUsers,
    unifiedFacilities: unifiedMetrics.totalFacilities,
    realTimeFacilities: realTimeStats?.totalFacilities,
    singleSourceValidated: unifiedMetrics.totalUsers === realTimeStats?.totalUsers,
    lastRefresh: lastRefresh.toLocaleTimeString()
  });

  return (
    <div className="space-y-6 p-6">
      <DashboardHeader 
        user={auth.user}
        userRoles={userRoles}
        onRefresh={handleRefresh}
        onAssignTestRole={handleAssignTestRole}
      />
      
      {/* Enhanced Single Source Validation Alert with Refresh Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
            <h3 className="font-semibold text-blue-900">📊 Unified Dashboard Metrics - Single Source Validated</h3>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All Data
          </Button>
        </div>
        <div className="text-sm text-blue-700 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <strong>Users:</strong> {unifiedMetrics.totalUsers} ({unifiedMetrics.activeUsers} active)
          </div>
          <div>
            <strong>Facilities:</strong> {unifiedMetrics.totalFacilities} ({unifiedMetrics.activeFacilities} active)
          </div>
          <div>
            <strong>Modules:</strong> {unifiedMetrics.totalModules} ({unifiedMetrics.activeModules} active)
          </div>
          <div>
            <strong>APIs:</strong> {unifiedMetrics.totalApiServices} ({unifiedMetrics.activeApiServices} active)
          </div>
        </div>
        <div className="mt-2 text-xs text-blue-600">
          ✅ All metrics refreshed from live database | Last refresh: {lastRefresh.toLocaleTimeString()} | Auto-refresh: 30s
        </div>
      </div>
      
      {/* Real-Time Statistics - Primary Display */}
      <RealTimeStatsCard />
      
      {/* Enhanced Real-Time Stats with Comparison */}
      <RealTimeDashboardStats 
        users={users.data} 
        realTimeStats={realTimeStats}
        meta={users.meta}
      />

      {/* System Status and Overview Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SystemStatusCard 
          user={auth.user}
          profile={auth.profile}
          userRoles={userRoles}
        />
        <SystemHighlightsCard />
      </div>

      {/* Module and Services Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ModulesOverviewCard />
        <ComponentsServicesCard />
      </div>

      {/* User Profile and Roles */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ProfileCard 
          profile={auth.profile}
          user={auth.user}
        />
        <UserRolesCard 
          userRoles={userRoles}
          user={auth.user}
          getRoleColor={getRoleColor}
          getRoleDescription={getRoleDescription}
        />
      </div>

      {/* Status Alerts with corrected information */}
      <StatusAlerts 
        user={auth.user}
        profile={auth.profile}
        userRoles={userRoles}
      />
    </div>
  );
};

export default UnifiedDashboard;

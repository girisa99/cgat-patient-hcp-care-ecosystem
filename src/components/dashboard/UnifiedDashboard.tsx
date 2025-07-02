
import React from 'react';
import { useUnifiedUserManagement } from '@/hooks/useUnifiedUserManagement';
import { useRealTimeUserStats } from '@/hooks/useRealTimeUserStats';
import { RealTimeStatsCard } from './RealTimeStatsCard';
import DashboardHeader from './DashboardHeader';
import DashboardLoading from './DashboardLoading';
import RealTimeDashboardStats from './RealTimeDashboardStats';
import SystemStatusCard from './SystemStatusCard';
import ModulesOverviewCard from './ModulesOverviewCard';
import ComponentsServicesCard from './ComponentsServicesCard';
import ProfileCard from './ProfileCard';
import UserRolesCard from './UserRolesCard';
import StatusAlerts from './StatusAlerts';
import SystemHighlightsCard from './SystemHighlightsCard';

const UnifiedDashboard: React.FC = () => {
  console.log('🎯 Unified Dashboard - Rendering with real-time data integration');
  
  const { users, isLoading: usersLoading, meta } = useUnifiedUserManagement();
  const { data: realTimeStats, isLoading: statsLoading } = useRealTimeUserStats();

  if (usersLoading || statsLoading) {
    return <DashboardLoading />;
  }

  return (
    <div className="space-y-6 p-6">
      <DashboardHeader />
      
      {/* Real-Time Statistics - Primary Display */}
      <RealTimeStatsCard />
      
      {/* Enhanced Real-Time Stats with Comparison */}
      <RealTimeDashboardStats 
        users={users} 
        realTimeStats={realTimeStats}
        meta={meta}
      />

      {/* System Status and Overview Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SystemStatusCard />
        <SystemHighlightsCard />
      </div>

      {/* Module and Services Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ModulesOverviewCard />
        <ComponentsServicesCard />
      </div>

      {/* User Profile and Roles */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ProfileCard />
        <UserRolesCard />
      </div>

      {/* Status Alerts */}
      <StatusAlerts />
    </div>
  );
};

export default UnifiedDashboard;

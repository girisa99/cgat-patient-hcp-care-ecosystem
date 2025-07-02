
import React from 'react';
import { useUnifiedPageData } from '@/hooks/useUnifiedPageData';
import DashboardHeader from './DashboardHeader';
import DashboardLoading from './DashboardLoading';
import SystemStatusCard from './SystemStatusCard';
import { RealTimeStatsCard } from './RealTimeStatsCard';
import { ModulesOverviewCard } from './ModulesOverviewCard';
import { ComponentsServicesCard } from './ComponentsServicesCard';
import { NavigationDiagnostic } from '@/components/debug/NavigationDiagnostic';

const UnifiedDashboard: React.FC = () => {
  console.log('🎯 Unified Dashboard - Rendering with diagnostic tools');
  
  const { 
    dashboardData, 
    isLoading, 
    error 
  } = useUnifiedPageData();

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
          <p className="text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }

  console.log('🎯 Dashboard rendering with data:', Object.keys(dashboardData || {}));

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <NavigationDiagnostic />
      
      <DashboardHeader />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SystemStatusCard />
        <RealTimeStatsCard />
        <ModulesOverviewCard modules={dashboardData?.modules || []} />
        <ComponentsServicesCard 
          apis={dashboardData?.apiIntegrations || []}
          facilities={dashboardData?.facilities || []}
        />
      </div>
    </div>
  );
};

export default UnifiedDashboard;

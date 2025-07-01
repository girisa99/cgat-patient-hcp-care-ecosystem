
import { useDashboard } from './useDashboard';
import { useModules } from './useModules';
import { useIntelligentRouting } from './useIntelligentRouting';

/**
 * Dedicated hook for Dashboard page - LOCKED IMPLEMENTATION
 * This hook ensures the Dashboard page has consistent data access
 * DO NOT MODIFY - This is the single source of truth for Dashboard page
 */
export const useDashboardPage = () => {
  console.log('🔒 Dashboard Page Hook - Locked implementation active');
  
  // Use consolidated hooks as single source of truth
  const dashboardData = useDashboard();
  const modulesData = useModules();
  const routingData = useIntelligentRouting();

  // Return consolidated data with clear naming to prevent confusion
  return {
    // Primary data sources - LOCKED
    dashboardData: dashboardData.dashboardData,
    profile: dashboardData.profile,
    userRoles: dashboardData.userRoles,
    loading: dashboardData.loading,
    
    // Module data - LOCKED
    userModules: modulesData.userModules,
    
    // Routing data - LOCKED
    moduleProgress: routingData.moduleProgress,
    
    // Meta information - LOCKED
    meta: {
      totalSources: 3,
      dataSource: 'consolidated_dashboard_data',
      hookVersion: 'locked-v1.0.0',
      singleSourceValidated: true,
      implementationLocked: true,
      dataSources: dashboardData.meta?.dataSources || {}
    }
  };
};

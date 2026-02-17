
import { useMasterData } from './useMasterData';
import { useMasterAuth } from './useMasterAuth';

/**
 * Dedicated hook for Dashboard page - MASTER DATA INTEGRATION
 * This hook ensures the Dashboard page has consistent data access
 */
export const useDashboardPage = () => {
  console.log('🔒 Dashboard Page Hook - Master data integration active');
  
  const authData = useMasterAuth();
  const masterData = useMasterData();

  // Return consolidated data with clear naming to prevent confusion
  return {
    // Primary data sources - MASTER DATA
    dashboardData: {
      totalUsers: masterData.stats.totalUsers,
      totalFacilities: masterData.stats.totalFacilities,
      totalModules: masterData.stats.totalModules,
      totalApiServices: masterData.stats.totalApiServices,
      welcomeMessage: `Welcome back${authData.profile?.first_name ? `, ${authData.profile.first_name}` : ''}!`,
      summary: `Managing ${masterData.stats.totalUsers} users across ${masterData.stats.totalFacilities} facilities`
    },
    profile: authData.profile,
    userRoles: authData.userRoles,
    loading: authData.isLoading || masterData.isLoading,
    
    // Module data - MASTER DATA
    modules: masterData.modules,
    
    // Consolidated access
    users: masterData.users,
    facilities: masterData.facilities,
    apiServices: masterData.apiServices,
    
    // Meta information - MASTER DATA
    meta: {
      totalSources: 1,
      dataSource: 'master_data_consolidated',
      hookVersion: 'master-v1.0.0',
      singleSourceValidated: true,
      implementationLocked: true,
      dataSources: masterData.meta
    }
  };
};

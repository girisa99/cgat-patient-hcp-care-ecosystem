
import { useUnifiedUserManagement } from './useUnifiedUserManagement';
import { useFacilities } from './useFacilities';
import { useModules } from './useModules';
import { useApiServices } from './useApiServices';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { useRealTimeUserStats } from './useRealTimeUserStats';

/**
 * SINGLE SOURCE OF TRUTH - Unified Page Data Hook
 * This hook consolidates ALL data sources for the entire application
 * Every page should use this hook to maintain consistency
 */
export const useUnifiedPageData = () => {
  console.log('🎯 Unified Page Data Hook - Single Source of Truth Active');

  // Authentication state - Single Source
  const authData = useAuthContext();
  
  // User management - Single Source
  const userData = useUnifiedUserManagement();
  
  // Facilities - Single Source
  const facilitiesData = useFacilities();
  
  // Modules - Single Source  
  const modulesData = useModules();
  
  // API Services - Single Source
  const apiServicesData = useApiServices();
  
  // Real-time stats - Single Source
  const { data: realTimeStats } = useRealTimeUserStats();

  // Consolidated loading state
  const isLoading = userData.isLoading || facilitiesData.isLoading || apiServicesData.isLoading;

  // Consolidated error state
  const hasError = userData.error || facilitiesData.error || apiServicesData.error;

  return {
    // Authentication - Single Source
    auth: {
      user: authData.user,
      profile: authData.profile,
      userRoles: authData.userRoles,
      isAuthenticated: authData.isAuthenticated,
      isLoading: authData.isLoading,
      signIn: authData.signIn,
      signUp: authData.signUp,
      signOut: authData.signOut
    },

    // Users - Single Source
    users: {
      data: userData.users || [],
      isLoading: userData.isLoading,
      error: userData.error,
      createUser: userData.createUser,
      assignRole: userData.assignRole,
      removeRole: userData.removeRole,
      searchUsers: userData.searchUsers,
      getUserStats: userData.getUserStats,
      getPatients: userData.getPatients,
      getStaff: userData.getStaff,
      getAdmins: userData.getAdmins,
      meta: userData.meta
    },

    // Facilities - Single Source
    facilities: {
      data: facilitiesData.facilities || [],
      isLoading: facilitiesData.isLoading,
      error: facilitiesData.error,
      createFacility: facilitiesData.createFacility,
      updateFacility: facilitiesData.updateFacility,
      searchFacilities: facilitiesData.searchFacilities,
      getFacilityStats: facilitiesData.getFacilityStats,
      meta: facilitiesData.meta
    },

    // Modules - Single Source
    modules: {
      data: modulesData.modules || [],
      isLoading: modulesData.isLoading,
      error: modulesData.error,
      getModuleStats: modulesData.getModuleStats,
      meta: modulesData.meta
    },

    // API Services - Single Source  
    apiServices: {
      data: apiServicesData.integrations || [],
      isLoading: apiServicesData.isLoading,
      error: apiServicesData.error,
      createIntegration: apiServicesData.createIntegration,
      updateIntegration: apiServicesData.updateIntegration,
      getApiStats: apiServicesData.getApiStats,
      searchApis: apiServicesData.searchApis,
      meta: {
        totalIntegrations: apiServicesData.integrations?.length || 0,
        dataSource: 'api_integration_registry'
      }
    },

    // Real-time Statistics - Single Source
    realTimeStats,

    // Global States - Single Source
    isLoading,
    hasError,

    // Meta Information - Single Source Validation
    meta: {
      singleSourceValidated: true,
      implementationLocked: true,
      dataSourcesCount: 5,
      version: 'unified-v1.0.0',
      lastUpdated: new Date().toISOString(),
      dataSources: {
        users: userData.meta.dataSource,
        facilities: facilitiesData.meta?.dataSource || 'facilities table',
        modules: modulesData.meta?.dataSource || 'modules table',
        apiServices: 'api_integration_registry table',
        auth: 'supabase auth'
      }
    }
  };
};

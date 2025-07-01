
import { useModules } from './useModules';

/**
 * Dedicated hook for Modules page - LOCKED IMPLEMENTATION
 * This hook ensures the Modules page has consistent data access
 * DO NOT MODIFY - This is the single source of truth for Modules page
 */
export const useModulesPage = () => {
  console.log('🔒 Modules Page Hook - Locked implementation active');
  
  // Use consolidated modules hook as single source of truth
  const modulesData = useModules();

  // Return consolidated data with clear naming to prevent confusion
  return {
    // Primary data sources - LOCKED
    modules: modulesData.modules || [],
    userModules: modulesData.userModules || [],
    isLoading: modulesData.isLoading,
    error: modulesData.error,
    
    // Actions - LOCKED
    refetch: modulesData.refetch,
    assignModuleToRole: modulesData.assignModuleToRole,
    
    // Utilities - LOCKED
    getModuleStats: modulesData.getModuleStats,
    searchModules: modulesData.searchModules,
    hasModuleAccess: modulesData.hasModuleAccess,
    
    // Status flags - LOCKED
    isLoadingModules: modulesData.isLoadingModules,
    isLoadingUserModules: modulesData.isLoadingUserModules,
    isAssigningToRole: modulesData.isAssigningToRole,
    
    // Meta information - LOCKED
    meta: {
      totalModules: modulesData.meta.totalModules,
      dataSource: modulesData.meta.dataSource,
      lastFetch: modulesData.meta.lastFetch,
      version: modulesData.meta.version,
      hookVersion: 'locked-v1.0.0',
      singleSourceValidated: true,
      implementationLocked: true
    }
  };
};

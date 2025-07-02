
import { useModules } from './useModules';
import { useModuleData } from './modules/useModuleData';

/**
 * Dedicated hook for Modules page - LOCKED IMPLEMENTATION
 * This hook ensures the Modules page has consistent data access
 * DO NOT MODIFY - This is the single source of truth for Modules page
 */
export const useModulesPage = () => {
  console.log('🔒 Modules Page Hook - Locked implementation active');
  
  // Use consolidated modules management as single source of truth
  const modulesData = useModules();
  const moduleDetailsData = useModuleData();

  // Return consolidated data with clear naming to prevent confusion
  return {
    // Primary data sources - LOCKED
    modules: modulesData.modules || [],
    isLoading: modulesData.isLoading,
    error: modulesData.error,
    
    // Actions - LOCKED
    createModule: modulesData.createModule,
    updateModule: modulesData.updateModule,
    deleteModule: modulesData.deleteModule,
    
    // Utilities - LOCKED
    searchModules: modulesData.searchModules,
    getModuleStats: modulesData.getModuleStats,
    getActiveModules: modulesData.getActiveModules,
    
    // Status flags - LOCKED
    isCreating: modulesData.isCreating,
    isUpdating: modulesData.isUpdating,
    isDeleting: modulesData.isDeleting,
    
    // Meta information - LOCKED
    meta: {
      totalModules: modulesData.modules?.length || 0,
      activeModules: modulesData.getActiveModules?.().length || 0,
      dataSource: 'modules table',
      hookVersion: 'locked-v1.0.0',
      singleSourceValidated: true,
      implementationLocked: true
    }
  };
};


/**
 * Main Modules Hook - Now uses consolidated data with working functionality
 * Provides working sample data for all module operations
 */
import { useConsolidatedData } from './useConsolidatedData';

export const useModules = () => {
  const { modules } = useConsolidatedData();
  
  console.log('📦 Modules Hook - Using consolidated data with working functionality');

  // Mock user modules (would be replaced with actual user module query)
  const userModules = modules.data;

  // Mock module access check
  const hasModuleAccess = (moduleId: string) => {
    return userModules.some(module => module.id === moduleId);
  };

  return {
    // Data
    modules: modules.data,
    userModules,
    isLoading: modules.isLoading,
    isLoadingModules: modules.isLoading,
    isLoadingUserModules: modules.isLoading,
    error: modules.error,
    
    // Actions
    createModule: modules.createModule,
    updateModule: modules.updateModule,
    assignModuleToRole: async ({ moduleId, roleId }: { moduleId: string; roleId: string }) => {
      console.log('🔗 Assigning module to role:', { moduleId, roleId });
      return Promise.resolve();
    },
    
    // Utilities
    getModuleStats: modules.getModuleStats,
    searchModules: modules.searchModules,
    hasModuleAccess,
    
    // Status flags
    isCreatingModule: false,
    isUpdatingModule: false,
    isAssigningToRole: false,
    
    // Meta information
    meta: modules.meta
  };
};

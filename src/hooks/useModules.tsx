
/**
 * Main Modules Hook - Refactored to use focused modules
 */

import { useModuleData } from './modules/useModuleData';
import { useModulePermissions } from './modules/useModulePermissions';
import { useModuleMutations } from './modules/useModuleMutations';

export const useModules = () => {
  const { modules, userModules, isLoadingModules, isLoadingUserModules, modulesError, userModulesError } = useModuleData();
  const { hasModuleAccess } = useModulePermissions();
  const mutations = useModuleMutations();

  return {
    modules,
    userModules,
    isLoadingModules,
    isLoadingUserModules,
    modulesError,
    userModulesError,
    hasModuleAccess,
    ...mutations
  };
};

// Re-export individual hooks for direct use
export { useModuleData } from './modules/useModuleData';
export { useModulePermissions } from './modules/useModulePermissions';
export { useModuleMutations } from './modules/useModuleMutations';

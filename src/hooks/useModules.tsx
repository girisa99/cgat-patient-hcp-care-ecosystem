
import { useModuleData } from './modules/useModuleData';
import { useModuleMutations } from './modules/useModuleMutations';
import { useModulePermissions } from './modules/useModulePermissions';
import { useMemo } from 'react';

export const useModules = () => {
  const { data: modules, isLoading, error, refetch } = useModuleData();
  const moduleMutations = useModuleMutations();
  const { hasModuleAccess, userModules } = useModulePermissions();

  // Mock user modules data for now - this would come from a real query
  const userModulesFormatted = modules?.map(module => ({
    module_id: module.id,
    module_name: module.name,
    module_description: module.description || 'No description available'
  })) || [];

  // Calculate module statistics
  const getModuleStats = useMemo(() => {
    return () => {
      if (!modules) {
        return {
          total: 0,
          active: 0,
          inactive: 0,
          userAccessible: 0
        };
      }

      const stats = {
        total: modules.length,
        active: modules.filter(m => m.is_active).length,
        inactive: modules.filter(m => !m.is_active).length,
        userAccessible: modules.filter(m => m.is_active).length // For now, assume all active modules are user accessible
      };

      return stats;
    };
  }, [modules]);

  return {
    modules: modules || [],
    userModules: userModulesFormatted,
    isLoading,
    isLoadingModules: isLoading,
    isLoadingUserModules: isLoading,
    error,
    refetch,
    getModuleStats,
    hasModuleAccess,
    ...moduleMutations
  };
};

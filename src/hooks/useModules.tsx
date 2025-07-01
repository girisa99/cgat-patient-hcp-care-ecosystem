
import { useModuleData } from './modules/useModuleData';
import { useModuleMutations } from './modules/useModuleMutations';

/**
 * Main Modules Hook - Now uses consolidated approach
 * Following the unified user management pattern
 */
export const useModules = () => {
  const { data: modules, isLoading, error, refetch } = useModuleData();
  const mutations = useModuleMutations();

  const getModuleStats = () => {
    return {
      total: modules?.length || 0,
      active: modules?.filter(m => m.is_active !== false).length || 0,
      inactive: modules?.filter(m => m.is_active === false).length || 0
    };
  };

  const searchModules = (query: string) => {
    if (!query.trim()) return modules || [];
    
    return (modules || []).filter((module: any) => 
      module.name?.toLowerCase().includes(query.toLowerCase()) ||
      module.description?.toLowerCase().includes(query.toLowerCase())
    );
  };

  return {
    modules: modules || [],
    isLoading,
    error,
    refetch,
    getModuleStats,
    searchModules,
    ...mutations,
    // Meta information consistent with unified system
    meta: {
      totalModules: modules?.length || 0,
      dataSource: 'modules table via direct query',
      lastFetch: new Date().toISOString(),
      version: 'consolidated-v1'
    }
  };
};

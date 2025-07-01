
import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';
import { useModuleData } from './modules/useModuleData';
import { useModuleMutations } from './modules/useModuleMutations';

/**
 * Fully Consolidated Modules Hook - Using Universal Template
 */
export const useModules = () => {
  const config = {
    tableName: 'modules' as const,
    moduleName: 'Modules',
    requiredFields: ['name'],
    customValidation: (data: any) => {
      return !!(data.name && data.name.trim().length > 0);
    }
  };

  const templateResult = useTypeSafeModuleTemplate(config);
  const { data: modules, isLoading: isLoadingModules, error, refetch } = useModuleData();
  const mutations = useModuleMutations();

  // User modules query for access checking
  const userModules = modules?.map(module => ({
    module_id: module.id,
    module_name: module.name,
    module_description: module.description
  })) || [];

  // Module access checking
  const hasModuleAccess = (moduleName: string): boolean => {
    return userModules.some(module => 
      module.module_name.toLowerCase() === moduleName.toLowerCase()
    );
  };

  // Module search
  const searchModules = (query: string) => {
    if (!query.trim()) return modules || [];
    
    return (modules || []).filter((module: any) => 
      module.name?.toLowerCase().includes(query.toLowerCase()) ||
      module.description?.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Module statistics
  const getModuleStats = () => {
    const allModules = modules || [];
    const active = allModules.filter(m => m.is_active !== false).length;
    const inactive = allModules.length - active;

    return {
      total: allModules.length,
      active,
      inactive,
      userAccessible: userModules.length
    };
  };

  return {
    // Core data (backward compatible)
    modules: modules || [],
    userModules,
    isLoading: isLoadingModules,
    isLoadingModules,
    isLoadingUserModules: false,
    error,
    refetch,
    
    // Access control (backward compatible)
    hasModuleAccess,
    
    // Mutations (backward compatible)
    createModule: mutations.createModule,
    assignModule: mutations.assignModule,
    assignModuleToRole: mutations.assignModuleToRole,
    isCreating: mutations.isCreating,
    isAssigning: mutations.isAssigning,
    isAssigningToRole: mutations.isAssigningToRole,
    
    // Enhanced functionality
    searchModules,
    getModuleStats,
    
    // Universal template access
    template: templateResult,
    
    // Comprehensive metadata
    meta: {
      ...templateResult.meta,
      moduleCount: modules?.length || 0,
      dataSource: 'modules table (direct)',
      consolidationStatus: 'FULLY_CONSOLIDATED',
      templateVersion: '2.0'
    }
  };
};

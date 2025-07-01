
import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';
import { useModuleData } from './modules/useModuleData';
import { useModuleMutations } from './modules/useModuleMutations';

/**
 * Modules Hook - Now using Universal Template with backward compatibility
 * 
 * Unified with the template system for consistent module management while
 * maintaining all expected properties for existing components.
 */
export const useModules = () => {
  const config = {
    tableName: 'modules' as const,
    moduleName: 'Modules',
    requiredFields: ['name'],
    customValidation: (data: any) => {
      return data.name && data.name.trim().length > 0;
    }
  };

  const templateResult = useTypeSafeModuleTemplate(config);
  const { userModules, isLoadingUserModules } = useModuleData();
  const { createModule, assignModule, assignModuleToRole, isCreating, isAssigning, isAssigningToRole } = useModuleMutations();

  // Module-specific filtering
  const modules = templateResult.items.filter((item: any) => 
    item.name && item.is_active !== false
  );

  // Module-specific search
  const searchModules = (query: string) => {
    if (!query.trim()) return modules;
    
    return modules.filter((module: any) => 
      module.name?.toLowerCase().includes(query.toLowerCase()) ||
      module.description?.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Module access check function
  const hasModuleAccess = (moduleName: string) => {
    if (!userModules) return false;
    return userModules.some((module: any) => 
      module.module_name?.toLowerCase() === moduleName.toLowerCase() ||
      module.moduleName?.toLowerCase() === moduleName.toLowerCase()
    );
  };

  // Module-specific statistics
  const getModuleStats = () => {
    const stats = templateResult.getStatistics();
    const withDescription = modules.filter((m: any) => m.description).length;
    
    return {
      ...stats,
      total: modules.length,
      withDescription,
      withoutDescription: modules.length - withDescription
    };
  };

  return {
    // Core functionality (backward compatible)
    modules,
    userModules,
    isLoading: templateResult.isLoading,
    isLoadingModules: templateResult.isLoading,
    isLoadingUserModules,
    error: templateResult.error,
    refetch: templateResult.refetch,
    
    // Mutations (backward compatible)
    createModule,
    assignModule,
    assignModuleToRole,
    updateModule: templateResult.updateItem,
    deleteModule: templateResult.deleteItem,
    isCreating,
    isCreatingModule: isCreating,
    isAssigning,
    isAssigningToRole,
    isUpdating: templateResult.isUpdating,
    isDeleting: templateResult.isDeleting,
    
    // Module access functionality
    hasModuleAccess,
    
    // Enhanced functionality
    searchModules,
    getModuleStats,
    
    // Universal template access
    template: templateResult,
    
    // Metadata
    meta: {
      ...templateResult.meta,
      moduleCount: modules.length,
      completionRate: modules.filter((m: any) => m.description).length / modules.length
    }
  };
};

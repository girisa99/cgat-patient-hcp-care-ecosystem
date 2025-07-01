
import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';

/**
 * Modules Hook - Now using Universal Template
 * 
 * Unified with the template system for consistent module management.
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
    isLoading: templateResult.isLoading,
    error: templateResult.error,
    refetch: templateResult.refetch,
    
    // Mutations (backward compatible)
    createModule: templateResult.createItem,
    updateModule: templateResult.updateItem,
    deleteModule: templateResult.deleteItem,
    isCreating: templateResult.isCreating,
    isUpdating: templateResult.isUpdating,
    isDeleting: templateResult.isDeleting,
    
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

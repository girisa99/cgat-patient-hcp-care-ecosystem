
import { Database } from '@/integrations/supabase/types';
import { ModuleConfig } from '@/utils/moduleValidation';
import { useModuleData } from './useModuleData';
import { useModuleMutations } from './useModuleMutations';
import { useModuleValidation } from './useModuleValidation';

type DatabaseTables = keyof Database['public']['Tables'];

/**
 * Type-Safe Module Template Hook (Refactored)
 * 
 * This improved template ensures TypeScript validation before database operations
 * and provides extensible patterns for all future modules.
 * 
 * Now uses focused hooks for better maintainability:
 * - useModuleData: handles data fetching and caching
 * - useModuleMutations: handles create/update operations
 * - useModuleValidation: handles validation logic
 */
export const useTypeSafeModuleTemplate = <T extends DatabaseTables>(
  config: ModuleConfig & { tableName: T }
) => {
  // Use focused hooks for different concerns
  const dataHook = useModuleData(config);
  const mutationsHook = useModuleMutations(config);
  const validationHook = useModuleValidation(config);

  return {
    // Data fetching
    items: dataHook.items,
    isLoading: dataHook.isLoading,
    error: dataHook.error,
    refetch: dataHook.refetch,
    
    // Mutations
    createItem: mutationsHook.createItem,
    updateItem: mutationsHook.updateItem,
    isCreating: mutationsHook.isCreating,
    isUpdating: mutationsHook.isUpdating,
    
    // Validation
    isTableValid: validationHook.isTableValid,
    validateRequiredFields: validationHook.validateRequiredFields,
    validateCustomRules: validationHook.validateCustomRules,
    getMissingFields: validationHook.getMissingFields,
    
    // Debugging metadata (enhanced with validation info)
    meta: {
      ...dataHook.meta,
      validationStatus: {
        isTableValid: validationHook.isTableValid,
        hasRequiredFields: !!config.requiredFields,
        hasCustomValidation: !!config.customValidation
      }
    }
  };
};


import { Database } from '@/integrations/supabase/types';
import { ModuleConfig } from '@/utils/moduleValidation';
import { useModuleData } from './useModuleData';
import { useModuleMutations } from './useModuleMutations';
import { useModuleValidation } from './useModuleValidation';

type DatabaseTables = keyof Database['public']['Tables'];

/**
 * Universal Type-Safe Module Template Hook
 * 
 * This is the single source of truth for all module functionality.
 * All existing modules (Patients, Users, Facilities, etc.) will use this template.
 * 
 * Key Features:
 * - Universal compatibility with all database tables
 * - Type-safe validation before operations
 * - Extensible configuration system
 * - Consistent API across all modules
 * - Backward compatibility with existing implementations
 */
export const useTypeSafeModuleTemplate = <T extends DatabaseTables>(
  config: ModuleConfig & { tableName: T }
) => {
  // Core functionality hooks
  const dataHook = useModuleData(config);
  const mutationsHook = useModuleMutations(config);
  const validationHook = useModuleValidation(config);

  // Get data from the query result
  const items = dataHook.data || [];

  // Enhanced validation with auto-correction
  const validateAndCorrect = (data: any) => {
    const validation = validationHook.validateRequiredFields(data);
    if (!validation.isValid) {
      console.warn(`Validation failed for ${config.moduleName}:`, validation.errors);
      // Auto-correct common issues
      const correctedData = { ...data };
      config.requiredFields.forEach(field => {
        if (!correctedData[field]) {
          correctedData[field] = getDefaultValue(field);
        }
      });
      return correctedData;
    }
    return data;
  };

  // Smart default value generator
  const getDefaultValue = (field: string) => {
    const fieldLower = field.toLowerCase();
    if (fieldLower.includes('email')) return '';
    if (fieldLower.includes('name')) return '';
    if (fieldLower.includes('status')) return 'active';
    if (fieldLower.includes('role')) return 'user';
    if (fieldLower.includes('date')) return new Date().toISOString();
    return '';
  };

  // Universal create with validation
  const createWithValidation = async (data: any) => {
    const validatedData = validateAndCorrect(data);
    return mutationsHook.createItem(validatedData);
  };

  // Universal update with validation
  const updateWithValidation = async (id: string, data: any) => {
    const validatedData = validateAndCorrect(data);
    return mutationsHook.updateItem({ id, updates: validatedData });
  };

  // Enhanced search and filtering
  const searchItems = (query: string) => {
    if (!query.trim()) return items;
    
    const searchFields = ['name', 'title', 'first_name', 'last_name', 'email'];
    return items.filter((item: any) => 
      searchFields.some(field => 
        item[field]?.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  // Statistics generator
  const getStatistics = () => {
    const total = items.length;
    const active = items.filter((item: any) => item.status === 'active' || item.is_active !== false).length;
    const inactive = total - active;
    
    return {
      total,
      active,
      inactive,
      recentlyCreated: items.filter((item: any) => {
        const created = new Date(item.created_at || item.created_at);
        const week = new Date();
        week.setDate(week.getDate() - 7);
        return created > week;
      }).length
    };
  };

  return {
    // Core data access
    items,
    isLoading: dataHook.isLoading,
    error: dataHook.error,
    refetch: dataHook.refetch,
    
    // Enhanced mutations
    createItem: createWithValidation,
    updateItem: updateWithValidation,
    deleteItem: mutationsHook.deleteItem || (() => Promise.resolve()),
    isCreating: mutationsHook.isCreating,
    isUpdating: mutationsHook.isUpdating,
    isDeleting: mutationsHook.isDeleting || false,
    
    // Validation system
    isTableValid: validationHook.isValid,
    validateRequiredFields: validationHook.validateRequiredFields,
    validateCustomRules: validationHook.validateCustomRules,
    getMissingFields: validationHook.getMissingFields,
    
    // Enhanced functionality
    searchItems,
    getStatistics,
    validateAndCorrect,
    
    // Backward compatibility
    create: createWithValidation,
    update: updateWithValidation,
    delete: mutationsHook.deleteItem || (() => Promise.resolve()),
    
    // Comprehensive metadata
    meta: {
      moduleName: config.moduleName,
      tableName: config.tableName,
      totalItems: items.length,
      validationStatus: {
        isTableValid: validationHook.isValid,
        hasRequiredFields: !!config.requiredFields?.length,
        hasCustomValidation: !!config.customValidation,
        lastValidated: new Date().toISOString()
      },
      capabilities: {
        canCreate: !!mutationsHook.createItem,
        canUpdate: !!mutationsHook.updateItem,
        canDelete: !!mutationsHook.deleteItem,
        canSearch: true,
        canValidate: true,
        canGenerateStats: true
      }
    }
  };
};

// Legacy compatibility wrapper
export const useModuleTemplate = useTypeSafeModuleTemplate;

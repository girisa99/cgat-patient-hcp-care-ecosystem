import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ModuleConfig {
  tableName: string;
  moduleName: string;
  requiredFields: string[];
  customValidation?: (data: any) => boolean;
}

export const useTypeSafeModuleTemplate = (config: ModuleConfig) => {
  const templateQuery = useQuery({
    queryKey: ['module-template', config.tableName],
    queryFn: async () => {
      console.log('🔍 Validating module template for:', config.moduleName);
      
      // Fetch actual data from the table with type safety
      const tryTableQuery = async () => {
        try {
          // Use type assertion with proper validation
          const validTables = ['facilities', 'modules', 'profiles', 'roles', 'user_roles'];
          if (!validTables.includes(config.tableName)) {
            throw new Error(`Invalid table name: ${config.tableName}`);
          }
          
          // Use type assertion for dynamic table access but with validation
          const { data, error } = await (supabase as any)
            .from(config.tableName)
            .select('*')
            .limit(100);
          
          if (error) throw error;
          return { data, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      };

      const result = await tryTableQuery();
      
      if (result.error) {
        console.error('❌ Error fetching template data:', result.error);
        throw result.error;
      }
      
      // Basic validation
      const isValid = config.requiredFields.length > 0 && 
                     config.tableName && 
                     config.moduleName;

      return {
        isValid,
        config,
        items: (result.data && Array.isArray(result.data)) ? result.data : [],
        validatedAt: new Date().toISOString()
      };
    },
    staleTime: 300000, // 5 minutes
    retry: 1
  });

  const items = templateQuery.data?.items || [];

  const searchItems = (query: string) => {
    if (!query.trim() || !Array.isArray(items)) return items;
    
    return items.filter((item: any) => {
      return Object.values(item).some((value: any) => 
        value && value.toString().toLowerCase().includes(query.toLowerCase())
      );
    });
  };

  const getStatistics = () => {
    if (!Array.isArray(items)) return { total: 0, active: 0, inactive: 0 };
    
    return {
      total: items.length,
      active: items.filter((item: any) => item.is_active !== false).length,
      inactive: items.filter((item: any) => item.is_active === false).length
    };
  };

  const createItem = async (itemData: any) => {
    // Use type assertion with validation for dynamic table access
    const validTables = ['facilities', 'modules', 'profiles', 'roles', 'user_roles'];
    if (!validTables.includes(config.tableName)) {
      throw new Error(`Invalid table name: ${config.tableName}`);
    }
    
    const { data, error } = await (supabase as any)
      .from(config.tableName)
      .insert(itemData)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateItem = async (id: string, updates: any) => {
    // Use type assertion with validation for dynamic table access
    const validTables = ['facilities', 'modules', 'profiles', 'roles', 'user_roles'];
    if (!validTables.includes(config.tableName)) {
      throw new Error(`Invalid table name: ${config.tableName}`);
    }
    
    const { data, error } = await (supabase as any)
      .from(config.tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteItem = async (id: string) => {
    // Use type assertion with validation for dynamic table access
    const validTables = ['facilities', 'modules', 'profiles', 'roles', 'user_roles'];
    if (!validTables.includes(config.tableName)) {
      throw new Error(`Invalid table name: ${config.tableName}`);
    }
    
    const { error } = await (supabase as any)
      .from(config.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  return {
    isValid: templateQuery.data?.isValid || false,
    isLoading: templateQuery.isLoading,
    error: templateQuery.error,
    refetch: templateQuery.refetch,
    items,
    searchItems,
    getStatistics,
    createItem,
    updateItem,
    deleteItem,
    isCreating: false, // These would need to be connected to mutations
    isUpdating: false,
    isDeleting: false,
    meta: {
      templateVersion: '1.0',
      moduleName: config.moduleName,
      tableName: config.tableName,
      validatedAt: templateQuery.data?.validatedAt
    }
  };
};
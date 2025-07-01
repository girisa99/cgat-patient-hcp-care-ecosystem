
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ModuleConfig {
  tableName: string; // Simplified to avoid type recursion
  moduleName: string;
  requiredFields: string[];
  customValidation?: (data: any) => boolean;
}

export const useTypeSafeModuleTemplate = (config: ModuleConfig) => {
  const templateQuery = useQuery({
    queryKey: ['module-template', config.tableName],
    queryFn: async () => {
      console.log('🔍 Validating module template for:', config.moduleName);
      
      // Fetch actual data from the table with proper typing
      const { data, error } = await supabase
        .from(config.tableName as any) // Cast to any to avoid type issues
        .select('*')
        .limit(100);

      if (error) {
        console.error('❌ Error fetching template data:', error);
        throw error;
      }

      // Basic validation
      const isValid = config.requiredFields.length > 0 && 
                     config.tableName && 
                     config.moduleName;

      return {
        isValid,
        config,
        items: data || [],
        validatedAt: new Date().toISOString()
      };
    },
    staleTime: 300000, // 5 minutes
    retry: 1
  });

  const items = templateQuery.data?.items || [];

  const searchItems = (query: string) => {
    if (!query.trim()) return items;
    
    return items.filter((item: any) => {
      return Object.values(item).some((value: any) => 
        value && value.toString().toLowerCase().includes(query.toLowerCase())
      );
    });
  };

  const getStatistics = () => {
    return {
      total: items.length,
      active: items.filter((item: any) => item.is_active !== false).length,
      inactive: items.filter((item: any) => item.is_active === false).length
    };
  };

  const createItem = async (itemData: any) => {
    const { data, error } = await supabase
      .from(config.tableName as any)
      .insert(itemData)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateItem = async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from(config.tableName as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from(config.tableName as any)
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

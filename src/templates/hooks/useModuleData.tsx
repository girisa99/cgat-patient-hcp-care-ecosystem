
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { validateTableExists, ModuleConfig } from '@/utils/moduleValidation';
import { Database } from '@/integrations/supabase/types';

type DatabaseTables = keyof Database['public']['Tables'];

/**
 * Module Data Fetching Hook
 * Handles data fetching and caching for modules
 */
export const useModuleData = <T extends DatabaseTables>(
  config: ModuleConfig & { tableName: T }
) => {
  // Type-safe data fetching with proper return type
  const {
    data: items,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [config.tableName, config.moduleName],
    queryFn: async () => {
      console.log(`🔍 Fetching ${config.tableName} data for ${config.moduleName}...`);
      
      if (!validateTableExists(config.tableName)) {
        throw new Error(`Invalid table: ${config.tableName}`);
      }

      const { data, error } = await supabase
        .from(config.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`❌ Error fetching ${config.tableName}:`, error);
        throw error;
      }

      console.log(`✅ ${config.tableName} data fetched:`, data?.length || 0);
      return data || [];
    },
    retry: 2,
    staleTime: 30000,
    enabled: validateTableExists(config.tableName), // Only run if table is valid
  });

  return {
    items,
    isLoading,
    error,
    refetch,
    // Debugging metadata
    meta: {
      moduleName: config.moduleName,
      tableName: config.tableName,
      totalItems: items?.length || 0,
      isTableValid: validateTableExists(config.tableName),
      lastFetch: new Date().toISOString()
    }
  };
};

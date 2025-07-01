
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type DatabaseTables = keyof Database['public']['Tables'];

/**
 * Generic Module Data Hook
 * Provides data fetching for any database table
 */
export const useModuleData = (config?: { tableName: DatabaseTables }) => {
  const tableName = config?.tableName || 'profiles';

  const {
    data: items = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [tableName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(tableName)
        .select('*');

      if (error) throw error;
      return data || [];
    },
    retry: 1,
    staleTime: 30000
  });

  return {
    items,
    isLoading,
    error,
    refetch,
    meta: {
      tableName,
      itemCount: items.length,
      lastFetch: new Date().toISOString()
    }
  };
};

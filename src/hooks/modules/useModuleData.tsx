
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Module } from '@/types/database';

export const useModuleData = () => {
  return useQuery({
    queryKey: ['modules'],
    queryFn: async (): Promise<Module[]> => {
      console.log('🔍 Fetching modules from database...');
      
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching modules:', error);
        throw error;
      }

      console.log('✅ Modules fetched successfully:', data?.length || 0);
      return data || [];
    },
    retry: 2,
    staleTime: 60000
  });
};

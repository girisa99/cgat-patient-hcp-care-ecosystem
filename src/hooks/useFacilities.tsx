
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ExtendedFacility } from '@/types/database';

export const useFacilities = () => {
  const {
    data: facilities,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['facilities'],
    queryFn: async (): Promise<ExtendedFacility[]> => {
      const { data, error } = await supabase
        .from('facilities')
        .select('*');

      if (error) throw error;
      return data || [];
    },
    retry: 1,
    staleTime: 30000
  });

  return {
    facilities: facilities || [],
    isLoading,
    error,
    refetch
  };
};

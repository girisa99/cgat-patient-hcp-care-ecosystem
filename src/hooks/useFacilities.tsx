
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFacilities = () => {
  const { toast } = useToast();

  const {
    data: facilities,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['facilities'],
    queryFn: async () => {
      console.log('🔍 Fetching facilities...');
      
      try {
        const { data, error } = await supabase
          .from('facilities')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) {
          console.error('❌ Error fetching facilities:', error);
          throw error;
        }

        console.log('✅ Facilities fetched successfully:', data?.length || 0);
        return data || [];
      } catch (err) {
        console.error('❌ Error in facilities query:', err);
        throw err;
      }
    },
    retry: 2,
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  return {
    facilities,
    isLoading,
    error,
    refetch
  };
};

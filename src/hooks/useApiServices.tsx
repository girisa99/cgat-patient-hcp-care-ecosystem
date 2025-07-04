
/**
 * API SERVICES HOOK - Real data management
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useApiServices = () => {
  const { data: apiServices = [], isLoading } = useQuery({
    queryKey: ['api-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_integration_registry')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  return {
    apiServices,
    isLoading
  };
};

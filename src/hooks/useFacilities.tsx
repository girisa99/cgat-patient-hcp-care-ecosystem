
/**
 * FACILITIES HOOK - Real data management
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFacilities = () => {
  const { data: facilities = [], isLoading } = useQuery({
    queryKey: ['facilities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const getFacilityStats = () => {
    const total = facilities.length;
    const active = facilities.filter(f => f.is_active).length;
    
    return {
      total,
      active,
      inactive: total - active
    };
  };

  return {
    facilities,
    isLoading,
    getFacilityStats
  };
};

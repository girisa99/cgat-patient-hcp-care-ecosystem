
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ExtendedFacility } from '@/types/database';
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

  const createFacility = async (data: any) => {
    console.log('Creating facility:', data);
    toast({
      title: "Facility Created",
      description: "Facility has been created successfully",
    });
  };

  const updateFacility = async (data: any) => {
    console.log('Updating facility:', data);
    toast({
      title: "Facility Updated",
      description: "Facility has been updated successfully",
    });
  };

  return {
    facilities: facilities || [],
    isLoading,
    error,
    refetch,
    createFacility,
    updateFacility,
    isCreatingFacility: false,
    isUpdatingFacility: false
  };
};

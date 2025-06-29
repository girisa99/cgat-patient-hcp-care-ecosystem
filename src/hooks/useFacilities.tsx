
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFacilities = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: facilities,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['facilities'],
    queryFn: async () => {
      console.log('🏥 Fetching facilities...');
      
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('❌ Error fetching facilities:', error);
        throw error;
      }

      console.log('✅ Facilities fetched:', data?.length || 0);
      return data || [];
    },
    retry: 1,
    staleTime: 60000
  });

  const createFacilityMutation = useMutation({
    mutationFn: async (facilityData: {
      name: string;
      facility_type: string;
      address?: string;
      phone?: string;
      email?: string;
    }) => {
      console.log('🔄 Creating facility:', facilityData);
      
      const { data, error } = await supabase
        .from('facilities')
        .insert(facilityData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      toast({
        title: "Facility Created",
        description: "New facility has been created successfully.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Create facility error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create facility",
        variant: "destructive",
      });
    }
  });

  return {
    facilities,
    isLoading,
    error,
    refetch,
    createFacility: createFacilityMutation.mutate,
    isCreatingFacility: createFacilityMutation.isPending
  };
};

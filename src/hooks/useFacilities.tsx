
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type FacilityInsert = Database['public']['Tables']['facilities']['Insert'];
type FacilityUpdate = Database['public']['Tables']['facilities']['Update'];

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

  const createFacilityMutation = useMutation({
    mutationFn: async (facilityData: FacilityInsert) => {
      console.log('🔄 Creating facility:', facilityData);
      
      const { data, error } = await supabase
        .from('facilities')
        .insert(facilityData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating facility:', error);
        throw error;
      }

      console.log('✅ Facility created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      toast({
        title: "Facility Created",
        description: "The facility has been created successfully.",
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

  const updateFacilityMutation = useMutation({
    mutationFn: async ({ facilityId, facilityData }: { facilityId: string; facilityData: FacilityUpdate }) => {
      console.log('🔄 Updating facility:', facilityId, facilityData);
      
      const { data, error } = await supabase
        .from('facilities')
        .update(facilityData)
        .eq('id', facilityId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating facility:', error);
        throw error;
      }

      console.log('✅ Facility updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      toast({
        title: "Facility Updated",
        description: "The facility has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Update facility error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update facility",
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
    isCreatingFacility: createFacilityMutation.isPending,
    updateFacility: updateFacilityMutation.mutate,
    isUpdatingFacility: updateFacilityMutation.isPending
  };
};

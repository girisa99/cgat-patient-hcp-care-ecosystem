
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Facility = Database['public']['Tables']['facilities']['Row'];
type FacilityType = Database['public']['Enums']['facility_type'];

export const useFacilities = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: facilities,
    isLoading,
    error
  } = useQuery({
    queryKey: ['facilities'],
    queryFn: async () => {
      console.log('🔍 Fetching facilities list...');
      
      const { data, error } = await supabase.functions.invoke('manage-facilities', {
        body: { action: 'list' }
      });

      if (error) {
        console.error('❌ Error fetching facilities:', error);
        throw error;
      }

      console.log('✅ Facilities fetched successfully:', data);
      return data.data as Facility[];
    }
  });

  const createFacilityMutation = useMutation({
    mutationFn: async (facilityData: {
      name: string;
      facility_type: FacilityType;
      address?: string;
      phone?: string;
      email?: string;
      license_number?: string;
      npi_number?: string;
    }) => {
      console.log('🔄 Creating new facility:', facilityData);
      
      const { data, error } = await supabase.functions.invoke('manage-facilities', {
        body: {
          action: 'create',
          facility_data: facilityData
        }
      });

      if (error) {
        console.error('❌ Error creating facility:', error);
        throw error;
      }

      console.log('✅ Facility created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('🔄 Invalidating facilities cache after creation...');
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

  const updateFacilityMutation = useMutation({
    mutationFn: async ({ 
      facilityId, 
      facilityData 
    }: { 
      facilityId: string; 
      facilityData: Partial<Facility>; 
    }) => {
      console.log('🔄 Updating facility:', facilityId, facilityData);
      
      const { data, error } = await supabase.functions.invoke('manage-facilities', {
        body: {
          action: 'update',
          facility_id: facilityId,
          facility_data: facilityData
        }
      });

      if (error) {
        console.error('❌ Error updating facility:', error);
        throw error;
      }

      console.log('✅ Facility updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      console.log('🔄 Invalidating facilities cache after update...');
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      toast({
        title: "Facility Updated",
        description: "Facility has been updated successfully.",
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
    createFacility: createFacilityMutation.mutate,
    updateFacility: updateFacilityMutation.mutate,
    isCreatingFacility: createFacilityMutation.isPending,
    isUpdatingFacility: updateFacilityMutation.isPending
  };
};

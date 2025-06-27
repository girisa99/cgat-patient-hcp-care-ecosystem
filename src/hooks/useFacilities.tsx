
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type FacilityType = Database['public']['Enums']['facility_type'];

interface CreateFacilityData {
  name: string;
  facility_type: FacilityType;
  address?: string;
  phone?: string;
  email?: string;
  license_number?: string;
  npi_number?: string;
}

interface UpdateFacilityData {
  facilityId: string;
  facilityData: Partial<CreateFacilityData>;
}

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
      
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('❌ Error fetching facilities:', error);
        throw error;
      }

      console.log('✅ Facilities fetched successfully:', data.length);
      return data;
    },
    retry: 1,
    staleTime: 300000, // 5 minutes
  });

  const createFacilityMutation = useMutation({
    mutationFn: async (facilityData: CreateFacilityData) => {
      console.log('🔄 Creating facility:', facilityData);
      
      const { data, error } = await supabase
        .from('facilities')
        .insert([facilityData])
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
    mutationFn: async ({ facilityId, facilityData }: UpdateFacilityData) => {
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
    refetch,
    createFacility: createFacilityMutation.mutate,
    updateFacility: updateFacilityMutation.mutate,
    isCreatingFacility: createFacilityMutation.isPending,
    isUpdatingFacility: updateFacilityMutation.isPending
  };
};

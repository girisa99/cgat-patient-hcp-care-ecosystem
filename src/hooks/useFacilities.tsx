
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
    error,
    refetch
  } = useQuery({
    queryKey: ['facilities'],
    queryFn: async (): Promise<Facility[]> => {
      console.log('🏥 Fetching facilities...');
      
      try {
        const { data, error } = await supabase
          .from('facilities')
          .select('*')
          .order('name');

        if (error) {
          console.error('❌ Error fetching facilities:', error);
          throw error;
        }

        console.log('✅ Facilities loaded:', data?.length || 0);
        return data || [];
      } catch (err) {
        console.error('❌ Exception fetching facilities:', err);
        throw err;
      }
    },
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Create new facility
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
      const { error } = await supabase
        .from('facilities')
        .insert({
          name: facilityData.name,
          facility_type: facilityData.facility_type,
          address: facilityData.address || null,
          phone: facilityData.phone || null,
          email: facilityData.email || null,
          license_number: facilityData.license_number || null,
          npi_number: facilityData.npi_number || null,
          is_active: true
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      toast({
        title: "Facility Created",
        description: "New facility has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create facility",
        variant: "destructive",
      });
    }
  });

  // Update facility
  const updateFacilityMutation = useMutation({
    mutationFn: async ({ 
      facilityId, 
      facilityData 
    }: { 
      facilityId: string; 
      facilityData: Partial<Facility>;
    }) => {
      const { error } = await supabase
        .from('facilities')
        .update(facilityData)
        .eq('id', facilityId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      toast({
        title: "Facility Updated",
        description: "Facility has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update facility",
        variant: "destructive",
      });
    }
  });

  return {
    facilities: facilities || [],
    isLoading,
    error,
    refetch,
    createFacility: createFacilityMutation.mutate,
    updateFacility: updateFacilityMutation.mutate,
    isCreatingFacility: createFacilityMutation.isPending,
    isUpdatingFacility: updateFacilityMutation.isPending
  };
};

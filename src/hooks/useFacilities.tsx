
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
    queryFn: async () => {
      console.log('🔍 Fetching facilities list...');
      
      try {
        const { data, error } = await supabase.functions.invoke('manage-facilities', {
          body: { action: 'list' }
        });

        if (error) {
          console.error('❌ Edge function error:', error);
          throw new Error(`Edge function error: ${error.message || 'Unknown error'}`);
        }

        if (!data || !data.success) {
          console.error('❌ Invalid response from edge function:', data);
          throw new Error(data?.error || 'Invalid response from server');
        }

        console.log('✅ Facilities fetched successfully:', data.data);
        return data.data as Facility[];
      } catch (err) {
        console.error('❌ Network or parsing error:', err);
        
        // Fallback: try direct database query if edge function fails
        console.log('🔄 Attempting direct database query as fallback...');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('facilities')
          .select('*')
          .eq('is_active', true)
          .order('name');
        
        if (fallbackError) {
          console.error('❌ Fallback query failed:', fallbackError);
          throw new Error(`Database error: ${fallbackError.message}`);
        }
        
        console.log('✅ Fallback query successful:', fallbackData);
        return fallbackData as Facility[];
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000, // Consider data stale after 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
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
      
      try {
        const { data, error } = await supabase.functions.invoke('manage-facilities', {
          body: {
            action: 'create',
            facility_data: facilityData
          }
        });

        if (error) {
          console.error('❌ Error creating facility via edge function:', error);
          throw error;
        }

        console.log('✅ Facility created successfully via edge function:', data);
        return data;
      } catch (err) {
        console.error('❌ Edge function failed, attempting direct database insert...', err);
        
        // Fallback: try direct database insert if edge function fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('facilities')
          .insert({
            ...facilityData,
            is_active: true
          })
          .select();
        
        if (fallbackError) {
          console.error('❌ Fallback insert failed:', fallbackError);
          throw new Error(`Database error: ${fallbackError.message}`);
        }
        
        console.log('✅ Facility created successfully via direct insert:', fallbackData);
        return { success: true, data: fallbackData };
      }
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
      
      try {
        const { data, error } = await supabase.functions.invoke('manage-facilities', {
          body: {
            action: 'update',
            facility_id: facilityId,
            facility_data: facilityData
          }
        });

        if (error) {
          console.error('❌ Error updating facility via edge function:', error);
          throw error;
        }

        console.log('✅ Facility updated successfully via edge function:', data);
        return data;
      } catch (err) {
        console.error('❌ Edge function failed, attempting direct database update...', err);
        
        // Fallback: try direct database update if edge function fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('facilities')
          .update({
            ...facilityData,
            updated_at: new Date().toISOString()
          })
          .eq('id', facilityId)
          .select();
        
        if (fallbackError) {
          console.error('❌ Fallback update failed:', fallbackError);
          throw new Error(`Database error: ${fallbackError.message}`);
        }
        
        console.log('✅ Facility updated successfully via direct update:', fallbackData);
        return { success: true, data: fallbackData };
      }
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
    refetch,
    createFacility: createFacilityMutation.mutate,
    updateFacility: updateFacilityMutation.mutate,
    isCreatingFacility: createFacilityMutation.isPending,
    isUpdatingFacility: updateFacilityMutation.isPending
  };
};

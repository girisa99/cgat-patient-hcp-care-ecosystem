
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Focused hook for facility mutations
 */
export const useFacilityMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createFacilityMutation = useMutation({
    mutationFn: async (facilityData: any) => {
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
        description: "Facility has been created successfully",
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

  const updateFacilityMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      console.log('🔄 Updating facility:', id, updates);
      
      const { data, error } = await supabase
        .from('facilities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      toast({
        title: "Facility Updated",
        description: "Facility has been updated successfully",
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
    createFacility: createFacilityMutation.mutate,
    updateFacility: (id: string, updates: any) => updateFacilityMutation.mutate({ id, updates }),
    isCreatingFacility: createFacilityMutation.isPending,
    isUpdatingFacility: updateFacilityMutation.isPending
  };
};

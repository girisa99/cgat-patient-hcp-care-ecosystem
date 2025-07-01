
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type FacilityType = Database['public']['Enums']['facility_type'];

export const useFacilityMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createFacilityMutation = useMutation({
    mutationFn: async (facilityData: {
      name: string;
      facility_type: FacilityType;
      address?: string;
      phone?: string;
      email?: string;
    }) => {
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
      toast({
        title: "Error",
        description: error.message || "Failed to create facility",
        variant: "destructive",
      });
    }
  });

  const updateFacilityMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
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
    createFacility: createFacilityMutation.mutate,
    updateFacility: updateFacilityMutation.mutate,
    isCreatingFacility: createFacilityMutation.isPending,
    isUpdatingFacility: updateFacilityMutation.isPending
  };
};

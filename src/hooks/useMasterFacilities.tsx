
/**
 * MASTER FACILITIES HOOK - SINGLE SOURCE OF TRUTH
 * Consolidates all facility functionality and data
 * Version: master-facilities-v1.0.0
 */
import { useRealFacilities } from './useRealFacilities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

export const useMasterFacilities = () => {
  console.log('🏥 Master Facilities Hook - Single source of truth');
  
  const { facilities, isLoading, error } = useRealFacilities();
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();
  
  const activeFacilities = facilities.filter(f => f.is_active);
  
  const createFacilityMutation = useMutation({
    mutationFn: async (facilityData: any) => {
      const { data, error } = await supabase
        .from('facilities')
        .insert(facilityData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['real-facilities'] });
      showSuccess('Facility Created', 'Facility created successfully');
    },
    onError: (error: any) => {
      showError('Creation Failed', error.message);
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
      queryClient.invalidateQueries({ queryKey: ['real-facilities'] });
      showSuccess('Facility Updated', 'Facility updated successfully');
    },
    onError: (error: any) => {
      showError('Update Failed', error.message);
    }
  });

  const facilityStats = {
    total: facilities.length,
    active: activeFacilities.length,
    inactive: facilities.length - activeFacilities.length,
    byType: facilities.reduce((acc, f) => {
      acc[f.facility_type] = (acc[f.facility_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return {
    // Core data
    facilities,
    activeFacilities,
    facilityStats,
    
    // Loading states
    isLoading,
    isCreating: createFacilityMutation.isPending,
    isUpdating: updateFacilityMutation.isPending,
    
    // Error state
    error,
    
    // Actions
    createFacility: (data: any) => createFacilityMutation.mutate(data),
    updateFacility: (data: { id: string; updates: any }) => updateFacilityMutation.mutate(data),
    
    // Meta
    meta: {
      hookName: 'useMasterFacilities',
      version: 'master-facilities-v1.0.0',
      singleSourceValidated: true,
      dataSource: 'facilities-table-real-data'
    }
  };
};

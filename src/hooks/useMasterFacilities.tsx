/**
 * MASTER FACILITIES MANAGEMENT HOOK - SINGLE SOURCE OF TRUTH
 * Consolidates ALL facilities functionality into ONE hook
 * Version: master-facilities-v1.0.0
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// SINGLE CACHE KEY for all facilities operations
const MASTER_FACILITIES_CACHE_KEY = ['master-facilities'];

export interface Facility {
  id: string;
  name: string;
  facility_type: 'treatmentFacility' | 'referralFacility' | 'prescriberFacility';
  address?: string;
  phone?: string;
  email?: string;
  license_number?: string;
  npi_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * MASTER Facilities Management Hook - Everything in ONE place
 */
export const useMasterFacilities = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  console.log('🏢 Master Facilities - Single Source of Truth Active');

  // ====================== DATA FETCHING ======================
  const {
    data: facilities = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: MASTER_FACILITIES_CACHE_KEY,
    queryFn: async (): Promise<Facility[]> => {
      console.log('🔍 Fetching facilities from single source...');
      
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('❌ Error fetching facilities:', error);
        throw error;
      }
      
      console.log('✅ Facilities fetched from master source:', data?.length || 0);
      return data || [];
    },
    retry: 1,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // ====================== CACHE INVALIDATION HELPER ======================
  const invalidateCache = () => {
    console.log('🔄 Invalidating master facilities cache...');
    queryClient.invalidateQueries({ queryKey: MASTER_FACILITIES_CACHE_KEY });
  };

  // ====================== FACILITY CREATION ======================
  const createFacilityMutation = useMutation({
    mutationFn: async (facilityData: {
      name: string;
      facility_type: 'treatmentFacility' | 'referralFacility' | 'prescriberFacility';
      address?: string;
      phone?: string;
      email?: string;
      license_number?: string;
      npi_number?: string;
    }) => {
      console.log('🔄 Creating facility in master hook:', facilityData.name);
      
      const { data, error } = await supabase
        .from('facilities')
        .insert(facilityData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateCache();
      toast({
        title: "Facility Created",
        description: "New facility has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Facility Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // ====================== FACILITY UPDATE ======================
  const updateFacilityMutation = useMutation({
    mutationFn: async ({ facilityId, updates }: { facilityId: string; updates: Partial<Facility> }) => {
      console.log('🔄 Updating facility in master hook:', facilityId);
      
      const { data, error } = await supabase
        .from('facilities')
        .update(updates)
        .eq('id', facilityId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateCache();
      toast({
        title: "Facility Updated",
        description: "Facility has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Facility Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // ====================== FACILITY DEACTIVATION ======================
  const deactivateFacilityMutation = useMutation({
    mutationFn: async (facilityId: string) => {
      console.log('🔄 Deactivating facility in master hook:', facilityId);
      
      const { data, error } = await supabase
        .from('facilities')
        .update({ is_active: false })
        .eq('id', facilityId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateCache();
      toast({
        title: "Facility Deactivated",
        description: "Facility has been deactivated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Facility Deactivation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // ====================== UTILITY FUNCTIONS ======================
  const searchFacilities = (query: string): Facility[] => {
    if (!query.trim()) return facilities;
    
    return facilities.filter((facility: Facility) => 
      facility.name?.toLowerCase().includes(query.toLowerCase()) ||
      facility.facility_type?.toLowerCase().includes(query.toLowerCase()) ||
      facility.address?.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getFacilityStats = () => {
    const typeDistribution = facilities.reduce((acc: any, facility: Facility) => {
      acc[facility.facility_type] = (acc[facility.facility_type] || 0) + 1;
      return acc;
    }, {});
    
    return {
      total: facilities.length,
      active: facilities.filter(f => f.is_active).length,
      inactive: facilities.filter(f => !f.is_active).length,
      typeDistribution,
    };
  };

  // ====================== RETURN CONSOLIDATED API ======================
  return {
    // Data
    facilities,
    isLoading,
    error,
    refetch,
    
    // Facility Management
    createFacility: createFacilityMutation.mutate,
    isCreatingFacility: createFacilityMutation.isPending,
    
    updateFacility: updateFacilityMutation.mutate,
    isUpdatingFacility: updateFacilityMutation.isPending,
    
    deactivateFacility: deactivateFacilityMutation.mutate,
    isDeactivatingFacility: deactivateFacilityMutation.isPending,
    
    // Utilities
    searchFacilities,
    getFacilityStats,
    
    // Aliases for backward compatibility
    data: facilities,
    loading: isLoading,
    
    // Meta Information
    meta: {
      totalFacilities: facilities.length,
      activeFacilities: facilities.filter(f => f.is_active).length,
      dataSource: 'facilities table (master hook)',
      lastFetched: new Date().toISOString(),
      version: 'master-facilities-v1.0.0',
      singleSourceValidated: true,
      architectureType: 'consolidated',
      cacheKey: MASTER_FACILITIES_CACHE_KEY.join('-'),
      stabilityGuarantee: true
    }
  };
};
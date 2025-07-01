
import { useTypeSafeModuleTemplate } from '@/templates/hooks/useTypeSafeModuleTemplate';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type FacilityType = Database['public']['Enums']['facility_type'];

/**
 * Facilities Hook - Now using Universal Template with backward compatibility
 * 
 * Consolidated with the template system while preserving all facility-specific functionality
 * and expected properties for existing components.
 */
export const useFacilities = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const config = {
    tableName: 'facilities' as const,
    moduleName: 'Facilities',
    requiredFields: ['name', 'facility_type'],
    customValidation: (data: any) => {
      // Validate facility types
      const validTypes = ['treatmentFacility', 'referralFacility', 'prescriberFacility'];
      return validTypes.includes(data.facility_type);
    }
  };

  const templateResult = useTypeSafeModuleTemplate(config);

  // Custom create facility mutation
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
        .insert(facilityData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      templateResult.refetch();
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

  // Custom update facility mutation
  const updateFacilityMutation = useMutation({
    mutationFn: async ({ facilityId, facilityData }: {
      facilityId: string;
      facilityData: Partial<{
        name: string;
        facility_type: FacilityType;
        address: string | null;
        phone: string | null;
        email: string | null;
        license_number: string | null;
        npi_number: string | null;
      }>;
    }) => {
      const { error } = await supabase
        .from('facilities')
        .update(facilityData)
        .eq('id', facilityId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      templateResult.refetch();
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

  // Facility-specific filtering
  const facilities = templateResult.items.filter((item: any) => 
    item.name && item.facility_type
  );

  // Facility-specific search
  const searchFacilities = (query: string) => {
    if (!query.trim()) return facilities;
    
    return facilities.filter((facility: any) => 
      facility.name?.toLowerCase().includes(query.toLowerCase()) ||
      facility.address?.toLowerCase().includes(query.toLowerCase()) ||
      facility.facility_type?.toLowerCase().includes(query.toLowerCase()) ||
      facility.license_number?.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Facility-specific statistics
  const getFacilityStats = () => {
    const stats = templateResult.getStatistics();
    const typeDistribution = facilities.reduce((acc: any, facility: any) => {
      acc[facility.facility_type] = (acc[facility.facility_type] || 0) + 1;
      return acc;
    }, {});
    
    const licensed = facilities.filter((f: any) => f.license_number).length;
    const withNPI = facilities.filter((f: any) => f.npi_number).length;
    
    return {
      ...stats,
      total: facilities.length,
      typeDistribution,
      licensed,
      withNPI,
      treatmentFacilities: typeDistribution.treatmentFacility || 0,
      referralFacilities: typeDistribution.referralFacility || 0,
      prescriberFacilities: typeDistribution.prescriberFacility || 0
    };
  };

  return {
    // Core functionality (backward compatible)
    facilities,
    isLoading: templateResult.isLoading,
    error: templateResult.error,
    refetch: templateResult.refetch,
    
    // Mutations (backward compatible)
    createFacility: createFacilityMutation.mutate,
    updateFacility: updateFacilityMutation.mutate,
    deleteFacility: templateResult.deleteItem,
    isCreating: templateResult.isCreating,
    isCreatingFacility: createFacilityMutation.isPending,
    isUpdating: templateResult.isUpdating,
    isUpdatingFacility: updateFacilityMutation.isPending,
    isDeleting: templateResult.isDeleting,
    
    // Enhanced functionality
    searchFacilities,
    getFacilityStats,
    
    // Universal template access
    template: templateResult,
    
    // Metadata
    meta: {
      ...templateResult.meta,
      facilityCount: facilities.length,
      typeDistribution: facilities.reduce((acc: any, facility: any) => {
        acc[facility.facility_type] = (acc[facility.facility_type] || 0) + 1;
        return acc;
      }, {}),
      licensedCount: facilities.filter((f: any) => f.license_number).length
    }
  };
};

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useSeedData } from '@/hooks/useSeedData';
import { ServiceProvider, Service, ServiceSelection, ServiceProviderCapability } from '@/types/services';

export const useServices = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Use seed data as fallback
  const seedData = useSeedData();

  // Fetch all service providers - use seed data as fallback
  const { data: serviceProviders, isLoading: isLoadingProviders } = useQuery({
    queryKey: ['service-providers'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('service_providers')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        return data?.length > 0 ? data as ServiceProvider[] : seedData.serviceProviders as any[];
      } catch (error) {
        console.log('Using seed data for service providers:', error);
        return seedData.serviceProviders as any[];
      }
    },
  });

  // Fetch all services with their providers - use seed data as fallback
  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select(`
            *,
            service_provider:service_providers(*)
          `)
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        return data?.length > 0 ? data as Service[] : seedData.services as any[];
      } catch (error) {
        console.log('Using seed data for services:', error);
        return seedData.services as any[];
      }
    },
  });

  // Fetch service provider capabilities - use seed data as fallback
  const { data: capabilities, isLoading: isLoadingCapabilities } = useQuery({
    queryKey: ['service-provider-capabilities'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('service_provider_capabilities')
          .select(`
            *,
            service_provider:service_providers(*)
          `)
          .order('therapy_area, service_type');

        if (error) throw error;
        return data?.length > 0 ? data as ServiceProviderCapability[] : seedData.capabilities as any[];
      } catch (error) {
        console.log('Using seed data for capabilities:', error);
        return seedData.capabilities as any[];
      }
    },
  });

  // Fetch service selections for an onboarding application
  const getServiceSelections = (onboardingId: string) => {
    return useQuery({
      queryKey: ['service-selections', onboardingId],
      queryFn: async () => {
        if (!onboardingId) return [];
        
        const { data, error } = await supabase
          .from('onboarding_service_selections')
          .select(`
            *,
            service:services(*),
            service_provider:service_providers(*)
          `)
          .eq('onboarding_id', onboardingId);

        if (error) throw error;
        return data as ServiceSelection[];
      },
      enabled: !!onboardingId,
    });
  };

  // Create or update service selection
  const saveServiceSelectionMutation = useMutation({
    mutationFn: async (selection: Omit<ServiceSelection, 'id'> & { id?: string }) => {
      if (selection.id) {
        // Update existing selection
        const { data, error } = await supabase
          .from('onboarding_service_selections')
          .update({
            service_id: selection.service_id,
            selected_provider_id: selection.selected_provider_id,
            therapy_area: selection.therapy_area,
            selection_rationale: selection.selection_rationale,
            custom_requirements: selection.custom_requirements || {},
            estimated_volume: selection.estimated_volume || {},
            preferred_start_date: selection.preferred_start_date,
          })
          .eq('id', selection.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new selection
        const { data, error } = await supabase
          .from('onboarding_service_selections')
          .insert({
            onboarding_id: selection.onboarding_id,
            service_id: selection.service_id,
            selected_provider_id: selection.selected_provider_id,
            therapy_area: selection.therapy_area,
            selection_rationale: selection.selection_rationale,
            custom_requirements: selection.custom_requirements || {},
            estimated_volume: selection.estimated_volume || {},
            preferred_start_date: selection.preferred_start_date,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-selections', variables.onboarding_id] });
      toast({
        title: "Success",
        description: "Service selection saved successfully!",
      });
    },
    onError: (error: any) => {
      console.error('Error saving service selection:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save service selection",
        variant: "destructive",
      });
    },
  });

  // Delete service selection
  const deleteServiceSelectionMutation = useMutation({
    mutationFn: async ({ id, onboardingId }: { id: string; onboardingId: string }) => {
      const { error } = await supabase
        .from('onboarding_service_selections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, onboardingId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['service-selections', data.onboardingId] });
      toast({
        title: "Success",
        description: "Service selection removed successfully!",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting service selection:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove service selection",
        variant: "destructive",
      });
    },
  });

  return {
    serviceProviders,
    services,
    capabilities,
    onlineServices: seedData.onlineServices,
    userRoles: seedData.userRoles,
    isLoadingProviders: isLoadingProviders || seedData.isLoading,
    isLoadingServices: isLoadingServices || seedData.isLoading,
    isLoadingCapabilities: isLoadingCapabilities || seedData.isLoading,
    getServiceSelections,
    saveServiceSelection: saveServiceSelectionMutation.mutate,
    deleteServiceSelection: deleteServiceSelectionMutation.mutate,
    isSaving: saveServiceSelectionMutation.isPending,
    isDeleting: deleteServiceSelectionMutation.isPending,
  };
};

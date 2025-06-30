import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useSeedData } from '@/hooks/useSeedData';
import { 
  Therapy, 
  Modality, 
  Manufacturer, 
  Product, 
  ClinicalTrial, 
  CommercialProduct, 
  TherapySelection 
} from '@/types/therapies';

export const useTherapies = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Use seed data as fallback
  const seedData = useSeedData();

  // Fetch all therapies - use seed data as fallback
  const { data: therapies, isLoading: isLoadingTherapies } = useQuery({
    queryKey: ['therapies'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('therapies')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        
        // If no data from database, use seed data
        return data?.length > 0 ? data as Therapy[] : seedData.therapies as any[];
      } catch (error) {
        console.log('Using seed data for therapies:', error);
        return seedData.therapies as any[];
      }
    },
  });

  // Fetch all modalities - use seed data as fallback
  const { data: modalities, isLoading: isLoadingModalities } = useQuery({
    queryKey: ['modalities'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('modalities')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        
        return data?.length > 0 ? data as Modality[] : seedData.modalities as any[];
      } catch (error) {
        console.log('Using seed data for modalities:', error);
        return seedData.modalities as any[];
      }
    },
  });

  // Fetch all manufacturers - use seed data as fallback
  const { data: manufacturers, isLoading: isLoadingManufacturers } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('manufacturers')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        
        return data?.length > 0 ? data as Manufacturer[] : seedData.manufacturers as any[];
      } catch (error) {
        console.log('Using seed data for manufacturers:', error);
        return seedData.manufacturers as any[];
      }
    },
  });

  // Fetch products with related data - use seed data as fallback
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            therapy:therapies(*),
            modality:modalities(*),
            manufacturer:manufacturers(*)
          `)
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        
        return data?.length > 0 ? data as Product[] : seedData.products as any[];
      } catch (error) {
        console.log('Using seed data for products:', error);
        return seedData.products as any[];
      }
    },
  });

  // Fetch clinical trials - use seed data as fallback
  const { data: clinicalTrials, isLoading: isLoadingTrials } = useQuery({
    queryKey: ['clinical-trials'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('clinical_trials')
          .select(`
            *,
            product:products(
              *,
              therapy:therapies(*),
              modality:modalities(*),
              manufacturer:manufacturers(*)
            )
          `)
          .eq('is_active', true)
          .order('title');

        if (error) throw error;
        
        return data?.length > 0 ? data as ClinicalTrial[] : seedData.clinicalTrials as any[];
      } catch (error) {
        console.log('Using seed data for clinical trials:', error);
        return seedData.clinicalTrials as any[];
      }
    },
  });

  // Fetch commercial products - use seed data as fallback
  const { data: commercialProducts, isLoading: isLoadingCommercialProducts } = useQuery({
    queryKey: ['commercial-products'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('commercial_products')
          .select(`
            *,
            product:products(
              *,
              therapy:therapies(*),
              modality:modalities(*),
              manufacturer:manufacturers(*)
            )
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        return data?.length > 0 ? data as CommercialProduct[] : seedData.commercialProducts as any[];
      } catch (error) {
        console.log('Using seed data for commercial products:', error);
        return seedData.commercialProducts as any[];
      }
    },
  });

  // Fetch therapy selections for an onboarding application
  const getTherapySelections = (onboardingId: string) => {
    return useQuery({
      queryKey: ['therapy-selections', onboardingId],
      queryFn: async () => {
        if (!onboardingId) return [];
        
        const { data, error } = await supabase
          .from('onboarding_therapy_selections')
          .select(`
            *,
            therapy:therapies(*),
            product:products(
              *,
              therapy:therapies(*),
              modality:modalities(*),
              manufacturer:manufacturers(*)
            ),
            service:services(*),
            service_provider:service_providers(*),
            clinical_trial:clinical_trials(*),
            commercial_product:commercial_products(*)
          `)
          .eq('onboarding_id', onboardingId);

        if (error) throw error;
        return data as TherapySelection[];
      },
      enabled: !!onboardingId,
    });
  };

  // Create or update therapy selection
  const saveTherapySelectionMutation = useMutation({
    mutationFn: async (selection: Omit<TherapySelection, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => {
      if (selection.id) {
        // Update existing selection
        const { data, error } = await supabase
          .from('onboarding_therapy_selections')
          .update({
            therapy_id: selection.therapy_id,
            product_id: selection.product_id,
            service_id: selection.service_id,
            selected_provider_id: selection.selected_provider_id,
            clinical_trial_id: selection.clinical_trial_id,
            commercial_product_id: selection.commercial_product_id,
            patient_volume_estimate: selection.patient_volume_estimate,
            treatment_readiness_level: selection.treatment_readiness_level,
            infrastructure_requirements: selection.infrastructure_requirements || {},
            staff_training_needs: selection.staff_training_needs || {},
            timeline_considerations: selection.timeline_considerations || {},
            special_requirements: selection.special_requirements || {},
            selection_rationale: selection.selection_rationale,
            priority_level: selection.priority_level,
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
          .from('onboarding_therapy_selections')
          .insert({
            onboarding_id: selection.onboarding_id,
            therapy_id: selection.therapy_id,
            product_id: selection.product_id,
            service_id: selection.service_id,
            selected_provider_id: selection.selected_provider_id,
            clinical_trial_id: selection.clinical_trial_id,
            commercial_product_id: selection.commercial_product_id,
            patient_volume_estimate: selection.patient_volume_estimate,
            treatment_readiness_level: selection.treatment_readiness_level,
            infrastructure_requirements: selection.infrastructure_requirements || {},
            staff_training_needs: selection.staff_training_needs || {},
            timeline_considerations: selection.timeline_considerations || {},
            special_requirements: selection.special_requirements || {},
            selection_rationale: selection.selection_rationale,
            priority_level: selection.priority_level,
            preferred_start_date: selection.preferred_start_date,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['therapy-selections', variables.onboarding_id] });
      toast({
        title: "Success",
        description: "Therapy selection saved successfully!",
      });
    },
    onError: (error: any) => {
      console.error('Error saving therapy selection:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save therapy selection",
        variant: "destructive",
      });
    },
  });

  // Delete therapy selection
  const deleteTherapySelectionMutation = useMutation({
    mutationFn: async ({ id, onboardingId }: { id: string; onboardingId: string }) => {
      const { error } = await supabase
        .from('onboarding_therapy_selections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, onboardingId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['therapy-selections', data.onboardingId] });
      toast({
        title: "Success",
        description: "Therapy selection removed successfully!",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting therapy selection:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove therapy selection",
        variant: "destructive",
      });
    },
  });

  return {
    therapies,
    modalities,
    manufacturers,
    products,
    clinicalTrials,
    commercialProducts,
    isLoadingTherapies: isLoadingTherapies || seedData.isLoading,
    isLoadingModalities: isLoadingModalities || seedData.isLoading,
    isLoadingManufacturers: isLoadingManufacturers || seedData.isLoading,
    isLoadingProducts: isLoadingProducts || seedData.isLoading,
    isLoadingTrials: isLoadingTrials || seedData.isLoading,
    isLoadingCommercialProducts: isLoadingCommercialProducts || seedData.isLoading,
    getTherapySelections,
    saveTherapySelection: saveTherapySelectionMutation.mutate,
    deleteTherapySelection: deleteTherapySelectionMutation.mutate,
    isSaving: saveTherapySelectionMutation.isPending,
    isDeleting: deleteTherapySelectionMutation.isPending,
  };
};

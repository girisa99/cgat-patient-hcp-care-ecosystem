
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterAuth } from '@/hooks/useMasterAuth';
import { useToast } from '@/hooks/use-toast';
import { PurchasingMethod, InventoryModel } from '@/types/onboarding';

export interface PurchasingPreferences {
  id?: string;
  onboarding_id: string;
  preferred_purchasing_methods: PurchasingMethod[];
  inventory_management_model: InventoryModel;
  automated_reordering_enabled: boolean;
  reorder_points: any;
  preferred_order_frequency?: string;
  inventory_turnover_targets: any;
  storage_capacity_details: any;
  temperature_controlled_storage: boolean;
  hazmat_storage_capabilities: boolean;
}

export const useOnboardingPurchasing = () => {
  const { user } = useMasterAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: purchasingPreferences, isLoading } = useQuery({
    queryKey: ['onboarding-purchasing', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('onboarding_purchasing_preferences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const createOrUpdatePreferences = useMutation({
    mutationFn: async (preferences: PurchasingPreferences) => {
      const dbPreferences = {
        onboarding_id: preferences.onboarding_id,
        preferred_purchasing_methods: preferences.preferred_purchasing_methods,
        inventory_management_model: preferences.inventory_management_model,
        automated_reordering_enabled: preferences.automated_reordering_enabled,
        reorder_points: preferences.reorder_points,
        preferred_order_frequency: preferences.preferred_order_frequency,
        inventory_turnover_targets: preferences.inventory_turnover_targets,
        storage_capacity_details: preferences.storage_capacity_details,
        temperature_controlled_storage: preferences.temperature_controlled_storage,
        hazmat_storage_capabilities: preferences.hazmat_storage_capabilities,
      };

      if (preferences.id) {
        const { data, error } = await supabase
          .from('onboarding_purchasing_preferences')
          .update(dbPreferences)
          .eq('id', preferences.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('onboarding_purchasing_preferences')
          .insert(dbPreferences)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-purchasing'] });
      toast({
        title: "Success",
        description: "Purchasing preferences saved successfully!",
      });
    },
    onError: (error: any) => {
      console.error('Error saving purchasing preferences:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save purchasing preferences",
        variant: "destructive",
      });
    },
  });

  return {
    purchasingPreferences,
    isLoading,
    savePreferences: createOrUpdatePreferences.mutate,
    isSaving: createOrUpdatePreferences.isPending,
  };
};

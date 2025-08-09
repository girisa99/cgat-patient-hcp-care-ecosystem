import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

interface VoiceProvider {
  id: string;
  name: string;
  provider_type: string;
  configuration: any;
  capabilities: any; // This is stored as JSON in the database
  is_active: boolean;
  api_credentials?: any;
  rate_limits?: any;
  webhook_config?: any;
  health_check_config?: any;
  created_at: string;
  updated_at: string;
}

interface VoiceConfiguration {
  id: string;
  agent_id?: string;
  voice_provider_id: string;
  configuration: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useVoiceProviders = () => {
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  // Fetch voice providers
  const { data: voiceProviders = [], isLoading, error } = useQuery({
    queryKey: ['voice-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voice_providers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as VoiceProvider[];
    }
  });

  // Fetch voice configurations
  const { data: voiceConfigurations = [], isLoading: configurationsLoading } = useQuery({
    queryKey: ['voice-configurations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voice_configurations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as VoiceConfiguration[];
    }
  });

  // Create voice configuration
  const createVoiceConfiguration = useMutation({
    mutationFn: async (config: Partial<VoiceConfiguration>) => {
      const { data, error } = await supabase
        .from('voice_configurations')
        .insert([config])
        .select()
        .maybeSingle();
      
      if (error || !data) throw (error || new Error('Failed to create voice configuration'));

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-configurations'] });
      showSuccess('Voice configuration created successfully');
    },
    onError: (error) => {
      console.error('Error creating voice configuration:', error);
      showError('Failed to create voice configuration');
    },
  });

  // Update voice configuration
  const updateVoiceConfiguration = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<VoiceConfiguration> }) => {
      const { data, error } = await supabase
        .from('voice_configurations')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error || !data) throw (error || new Error('Failed to update voice configuration'));

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-configurations'] });
      showSuccess('Voice configuration updated successfully');
    },
    onError: (error) => {
      console.error('Error updating voice configuration:', error);
      showError('Failed to update voice configuration');
    },
  });

  // Update provider status
  const updateProviderStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from('voice_providers')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error || !data) throw (error || new Error('Failed to update provider status'));

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-providers'] });
      showSuccess('Provider status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating provider status:', error);
      showError('Failed to update provider status');
    },
  });

  // Test voice provider connection
  const testVoiceProvider = useMutation({
    mutationFn: async (providerId: string) => {
      // This would call an edge function to test the provider
      const { data, error } = await supabase.functions.invoke('test-voice-provider', {
        body: { providerId }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      showSuccess('Voice provider test completed successfully');
    },
    onError: (error) => {
      console.error('Error testing voice provider:', error);
      showError('Voice provider test failed');
    },
  });

  return {
    voiceProviders,
    voiceConfigurations,
    isLoading: isLoading || configurationsLoading,
    error,
    createVoiceConfiguration: createVoiceConfiguration.mutate,
    updateVoiceConfiguration: updateVoiceConfiguration.mutate,
    updateProviderStatus: updateProviderStatus.mutate,
    testVoiceProvider: testVoiceProvider.mutate,
    isCreating: createVoiceConfiguration.isPending,
    isUpdating: updateVoiceConfiguration.isPending,
    isTesting: testVoiceProvider.isPending,
  };
};
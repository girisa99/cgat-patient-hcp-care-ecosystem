import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

interface InfrastructureComponent {
  id?: string;
  name: string;
  type: 'server' | 'database' | 'network' | 'storage' | 'security';
  configuration: any;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  agent_id?: string;
  created_by?: string;
  metadata?: any;
}

interface ChannelConfig {
  id?: string;
  name: string;
  channel_type: 'voice' | 'chat' | 'email' | 'sms' | 'webhook';
  configuration: any;
  is_active: boolean;
  agent_id?: string;
  created_by?: string;
}

export const useInfrastructureManager = () => {
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  // Fetch agent deployments (reusing existing table)
  const { data: deployments, isLoading: isLoadingDeployments } = useQuery({
    queryKey: ['agent-deployments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_channel_deployments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch voice providers (reusing existing table)
  const { data: voiceProviders, isLoading: isLoadingVoice } = useQuery({
    queryKey: ['voice-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voice_providers')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch API integrations (reusing existing table)
  const { data: apiIntegrations, isLoading: isLoadingApi } = useQuery({
    queryKey: ['api-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_integration_registry')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Create deployment
  const createDeployment = useMutation({
    mutationFn: async (deploymentData: any) => {
      const user = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('agent_channel_deployments')
        .insert({
          ...deploymentData,
          created_by: user.data.user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-deployments'] });
      showSuccess('Deployment created successfully');
    },
    onError: (error) => {
      showError('Failed to create deployment: ' + error.message);
    }
  });

  // Update deployment
  const updateDeployment = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<any>) => {
      const { data, error } = await supabase
        .from('agent_channel_deployments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-deployments'] });
      showSuccess('Deployment updated successfully');
    },
    onError: (error) => {
      showError('Failed to update deployment: ' + error.message);
    }
  });

  // Create API integration
  const createApiIntegration = useMutation({
    mutationFn: async (integrationData: any) => {
      const user = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('api_integration_registry')
        .insert({
          ...integrationData,
          created_by: user.data.user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-integrations'] });
      showSuccess('API integration created successfully');
    },
    onError: (error) => {
      showError('Failed to create API integration: ' + error.message);
    }
  });

  return {
    // Data
    deployments,
    voiceProviders,
    apiIntegrations,
    
    // Loading states
    isLoading: isLoadingDeployments || isLoadingVoice || isLoadingApi,
    isLoadingDeployments,
    isLoadingVoice,
    isLoadingApi,
    
    // Mutations
    createDeployment: createDeployment.mutate,
    updateDeployment: updateDeployment.mutate,
    createApiIntegration: createApiIntegration.mutate,
    
    // Mutation states
    isCreatingDeployment: createDeployment.isPending,
    isUpdatingDeployment: updateDeployment.isPending,
    isCreatingApiIntegration: createApiIntegration.isPending,
  };
};
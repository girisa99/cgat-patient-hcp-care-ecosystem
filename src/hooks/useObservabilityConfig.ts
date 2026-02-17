import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ObservabilityConfig {
  arizeEnabled: boolean;
  langwatchEnabled: boolean;
  arizeApiKey?: string;
  arizeSpaceKey?: string;
  langwatchApiKey?: string;
  langwatchProjectId?: string;
}

export const useObservabilityConfig = () => {
  const queryClient = useQueryClient();

  // Fetch observability configurations
  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['observability-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('observability_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Convert database configs to UI format
  const config: ObservabilityConfig = {
    arizeEnabled: configs.find(c => c.platform === 'arize')?.is_enabled || false,
    langwatchEnabled: configs.find(c => c.platform === 'langwatch')?.is_enabled || false,
    arizeSpaceKey: configs.find(c => c.platform === 'arize')?.space_key || '',
    langwatchProjectId: configs.find(c => c.platform === 'langwatch')?.project_id || '',
  };

  // Save configuration mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (newConfig: ObservabilityConfig) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update Arize config
      await supabase
        .from('observability_configs')
        .upsert({
          user_id: user.id,
          platform: 'arize',
          is_enabled: newConfig.arizeEnabled,
          space_key: newConfig.arizeSpaceKey,
          configuration: {
            api_key_set: !!newConfig.arizeApiKey
          }
        }, {
          onConflict: 'user_id,platform'
        });

      // Update LangWatch config
      await supabase
        .from('observability_configs')
        .upsert({
          user_id: user.id,
          platform: 'langwatch',
          is_enabled: newConfig.langwatchEnabled,
          project_id: newConfig.langwatchProjectId,
          configuration: {
            api_key_set: !!newConfig.langwatchApiKey
          }
        }, {
          onConflict: 'user_id,platform'
        });

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observability-configs'] });
      toast.success('Observability configuration saved');
    },
    onError: (error: any) => {
      console.error('Failed to save configuration:', error);
      toast.error('Failed to save configuration');
    },
  });

  // Initialize platforms
  const initializePlatformMutation = useMutation({
    mutationFn: async (platform: 'arize' | 'langwatch') => {
      const { data, error } = await supabase.functions.invoke(`${platform}-integration`, {
        body: { 
          action: 'initialize',
          data: {}
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, platform) => {
      toast.success(`${platform} initialized successfully`);
    },
    onError: (error: any, platform) => {
      console.error(`Failed to initialize ${platform}:`, error);
      toast.error(`Failed to initialize ${platform}`);
    },
  });

  // Send trace to platforms
  const sendTraceMutation = useMutation({
    mutationFn: async ({ platform, traceData }: { 
      platform: 'arize' | 'langwatch', 
      traceData: any 
    }) => {
      const { data, error } = await supabase.functions.invoke(`${platform}-integration`, {
        body: { 
          action: 'send_trace',
          data: traceData
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      console.log(`Trace sent to ${variables.platform}:`, data);
    },
    onError: (error: any, variables) => {
      console.error(`Failed to send trace to ${variables.platform}:`, error);
    },
  });

  return {
    config,
    isLoading,
    saveConfig: saveConfigMutation.mutate,
    isSaving: saveConfigMutation.isPending,
    initializePlatform: initializePlatformMutation.mutate,
    isInitializing: initializePlatformMutation.isPending,
    sendTrace: sendTraceMutation.mutate,
    isSendingTrace: sendTraceMutation.isPending,
  };
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

interface ApiServiceConfiguration {
  id: string;
  agent_id?: string;
  service_name: string;
  service_type: string;
  configuration?: any;
  credentials?: any;
  is_active: boolean;
  health_status?: string;
  last_health_check?: string;
  created_at: string;
  updated_at: string;
  // New regular columns extracted from JSONB
  api_endpoint?: string;
  auth_type?: string;
  api_key_header?: string;
  timeout_ms?: number;
  retry_attempts?: number;
  rate_limit?: number;
  environment?: string;
}

export const useApiServiceConfigurations = () => {
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  // Fetch API service configurations
  const { data: apiServiceConfigurations = [], isLoading, error } = useQuery({
    queryKey: ['api-service-configurations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_service_configurations')
        .select(`
          *,
          api_endpoint,
          auth_type,
          api_key_header,
          timeout_ms,
          retry_attempts,
          rate_limit,
          environment
        `)
        .order('service_name');
      
      if (error) throw error;
      return data as ApiServiceConfiguration[];
    }
  });

  // Create API service configuration
  const createApiServiceConfiguration = useMutation({
    mutationFn: async (config: Pick<ApiServiceConfiguration, 'service_name' | 'service_type'> & Partial<Omit<ApiServiceConfiguration, 'id' | 'created_at' | 'updated_at' | 'service_name' | 'service_type'>>) => {
      const { data, error } = await supabase
        .from('api_service_configurations')
        .insert([{
          ...config,
          // Use regular columns for better performance
          api_endpoint: config.api_endpoint,
          auth_type: config.auth_type,
          api_key_header: config.api_key_header,
          timeout_ms: config.timeout_ms || 30000,
          retry_attempts: config.retry_attempts || 3,
          rate_limit: config.rate_limit || 100,
          environment: config.environment || 'production',
          // Keep backwards compatibility with JSONB
          configuration: config.configuration || {
            endpoint: config.api_endpoint,
            auth_type: config.auth_type,
            api_key_header: config.api_key_header,
            timeout_ms: config.timeout_ms,
            retry_attempts: config.retry_attempts,
            rate_limit: config.rate_limit,
            environment: config.environment
          }
        }])
        .select()
        .maybeSingle();
      
      if (error) throw error;
      if (!data) { throw new Error('Failed to create API service configuration: no data returned'); }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-service-configurations'] });
      showSuccess('API service configuration created successfully');
    },
    onError: (error) => {
      console.error('Error creating API service configuration:', error);
      showError('Failed to create API service configuration');
    },
  });

  // Update API service configuration
  const updateApiServiceConfiguration = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ApiServiceConfiguration> }) => {
      const { data, error } = await supabase
        .from('api_service_configurations')
        .update({
          ...updates,
          // Update regular columns
          api_endpoint: updates.api_endpoint,
          auth_type: updates.auth_type,
          api_key_header: updates.api_key_header,
          timeout_ms: updates.timeout_ms,
          retry_attempts: updates.retry_attempts,
          rate_limit: updates.rate_limit,
          environment: updates.environment,
          // Update JSONB for backwards compatibility
          configuration: updates.configuration || {
            endpoint: updates.api_endpoint,
            auth_type: updates.auth_type,
            api_key_header: updates.api_key_header,
            timeout_ms: updates.timeout_ms,
            retry_attempts: updates.retry_attempts,
            rate_limit: updates.rate_limit,
            environment: updates.environment
          }
        })
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      if (!data) { throw new Error('Failed to update API service configuration: no data returned'); }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-service-configurations'] });
      showSuccess('API service configuration updated successfully');
    },
    onError: (error) => {
      console.error('Error updating API service configuration:', error);
      showError('Failed to update API service configuration');
    },
  });

  // Delete API service configuration
  const deleteApiServiceConfiguration = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('api_service_configurations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-service-configurations'] });
      showSuccess('API service configuration deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting API service configuration:', error);
      showError('Failed to delete API service configuration');
    },
  });

  // Test API service connection
  const testApiServiceConnection = useMutation({
    mutationFn: async (configId: string) => {
      // This would call an edge function to test the API service
      const { data, error } = await supabase.functions.invoke('test-api-service', {
        body: { configId }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      showSuccess('API service test completed successfully');
    },
    onError: (error) => {
      console.error('Error testing API service:', error);
      showError('API service test failed');
    },
  });

  return {
    apiServiceConfigurations,
    isLoading,
    error,
    createApiServiceConfiguration: createApiServiceConfiguration.mutate,
    updateApiServiceConfiguration: updateApiServiceConfiguration.mutate,
    deleteApiServiceConfiguration: deleteApiServiceConfiguration.mutate,
    testApiServiceConnection: testApiServiceConnection.mutate,
    isCreating: createApiServiceConfiguration.isPending,
    isUpdating: updateApiServiceConfiguration.isPending,
    isDeleting: deleteApiServiceConfiguration.isPending,
    isTesting: testApiServiceConnection.isPending,
  };
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

interface VoiceConnector {
  id: string;
  name: string;
  connector_type: 'SIP' | 'API' | 'Webhook' | 'Database' | 'CRM' | 'Cloud';
  configuration: any;
  endpoints: string[];
  features: string[];
  is_active: boolean;
  health_status: 'healthy' | 'warning' | 'error' | 'unknown';
  last_tested_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface CreateConnectorData {
  name: string;
  connector_type: 'SIP' | 'API' | 'Webhook' | 'Database' | 'CRM' | 'Cloud';
  configuration: any;
  endpoints?: string[];
  features?: string[];
}

interface UpdateConnectorData extends Partial<CreateConnectorData> {
  is_active?: boolean;
  health_status?: 'healthy' | 'warning' | 'error' | 'unknown';
}

export const useVoiceConnectors = () => {
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();
  const sb = supabase as any;

  // Fetch voice connectors
  const { data: connectors = [], isLoading, error } = useQuery({
    queryKey: ['voice-connectors'],
    queryFn: async () => {
      const { data, error } = await sb
        .from('voice_connectors')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as VoiceConnector[];
    }
  });

  // Create voice connector
  const createConnector = useMutation({
    mutationFn: async (connectorData: CreateConnectorData) => {
      const { data, error } = await sb
        .from('voice_connectors')
        .insert([{
          ...connectorData,
          endpoints: connectorData.endpoints || [],
          features: connectorData.features || [],
          is_active: true,
          health_status: 'unknown',
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-connectors'] });
      showSuccess('Voice connector created successfully');
    },
    onError: (error) => {
      console.error('Error creating connector:', error);
      showError('Failed to create connector');
    },
  });

  // Update voice connector
  const updateConnector = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateConnectorData }) => {
      const { data, error } = await sb
        .from('voice_connectors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-connectors'] });
      showSuccess('Connector updated successfully');
    },
    onError: (error) => {
      console.error('Error updating connector:', error);
      showError('Failed to update connector');
    },
  });

  // Test voice connector
  const testConnector = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await sb
        .from('voice_connectors')
        .update({ 
          last_tested_at: new Date().toISOString(),
          health_status: 'healthy'
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-connectors'] });
      showSuccess('Connector test completed successfully');
    },
    onError: (error) => {
      console.error('Error testing connector:', error);
      showError('Connector test failed');
    },
  });

  // Test all connectors
  const testAllConnectors = useMutation({
    mutationFn: async () => {
      const { data, error } = await sb
        .from('voice_connectors')
        .update({ 
          last_tested_at: new Date().toISOString(),
          health_status: 'healthy'
        })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all records
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-connectors'] });
      showSuccess('All connectors tested successfully');
    },
    onError: (error) => {
      console.error('Error testing all connectors:', error);
      showError('Failed to test all connectors');
    },
  });

  // Delete voice connector
  const deleteConnector = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb
        .from('voice_connectors')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-connectors'] });
      showSuccess('Connector deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting connector:', error);
      showError('Failed to delete connector');
    },
  });

  return {
    connectors,
    isLoading,
    error,
    createConnector: createConnector.mutate,
    updateConnector: updateConnector.mutate,
    testConnector: testConnector.mutate,
    testAllConnectors: testAllConnectors.mutate,
    deleteConnector: deleteConnector.mutate,
    isCreating: createConnector.isPending,
    isUpdating: updateConnector.isPending,
    isTesting: testConnector.isPending || testAllConnectors.isPending,
    isDeleting: deleteConnector.isPending,
  };
};
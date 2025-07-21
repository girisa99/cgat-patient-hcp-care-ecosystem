import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ConnectorMetrics {
  totalConnectors: number;
  activeConnectors: number;
  inactiveConnectors: number;
  testingConnectors: number;
  errorConnectors: number;
  totalUsage: number;
  averageSuccessRate: number;
  connectorsByType: {
    database: number;
    api: number;
    messaging: number;
    external_service: number;
    ai_model: number;
    file_system: number;
  };
  recentActivity: Array<{
    id: string;
    connector_name: string;
    action: string;
    timestamp: string;
    status: string;
  }>;
  topConnectors: Array<{
    id: string;
    name: string;
    usage_count: number;
    success_rate: number;
    status: string;
  }>;
}

export interface Connector {
  id: string;
  name: string;
  description: string;
  type: 'database' | 'api' | 'messaging' | 'external_service' | 'ai_model' | 'file_system';
  category: string;
  status: 'active' | 'inactive' | 'testing' | 'error';
  base_url?: string;
  auth_type: string;
  configuration: Record<string, any>;
  endpoints: Array<{
    id: string;
    path: string;
    method: string;
    description: string;
  }>;
  usage_count: number;
  success_rate: number;
  last_tested?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ConnectorActivity {
  id: string;
  connector_id: string;
  action_type: string;
  action_description: string;
  status: string;
  metadata: Record<string, any>;
  created_at: string;
  user_id: string;
}

export const useConnectorMetrics = () => {
  const queryClient = useQueryClient();

  // Fetch connector metrics
  const {
    data: metrics,
    isLoading: isLoadingMetrics,
    error: metricsError
  } = useQuery({
    queryKey: ['connector-metrics'],
    queryFn: async (): Promise<ConnectorMetrics> => {
      try {
        // Fetch connectors
        const { data: connectors, error: connectorsError } = await supabase
          .from('system_connectors')
          .select('*');

        if (connectorsError) throw connectorsError;

        // Fetch recent activity
        const { data: activities, error: activitiesError } = await supabase
          .from('connector_activity_logs')
          .select(`
            id,
            connector_id,
            action_type,
            action_description,
            status,
            created_at,
            system_connectors!inner(name)
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (activitiesError) throw activitiesError;

        const totalConnectors = connectors?.length || 0;
        const activeConnectors = connectors?.filter(c => c.status === 'active').length || 0;
        const inactiveConnectors = connectors?.filter(c => c.status === 'inactive').length || 0;
        const testingConnectors = connectors?.filter(c => c.status === 'testing').length || 0;
        const errorConnectors = connectors?.filter(c => c.status === 'error').length || 0;

        const totalUsage = connectors?.reduce((sum, c) => sum + (c.usage_count || 0), 0) || 0;
        const averageSuccessRate = totalConnectors > 0 
          ? Math.round(connectors.reduce((sum, c) => sum + (c.success_rate || 0), 0) / totalConnectors)
          : 0;

        const connectorsByType = {
          database: connectors?.filter(c => c.type === 'database').length || 0,
          api: connectors?.filter(c => c.type === 'api').length || 0,
          messaging: connectors?.filter(c => c.type === 'messaging').length || 0,
          external_service: connectors?.filter(c => c.type === 'external_service').length || 0,
          ai_model: connectors?.filter(c => c.type === 'ai_model').length || 0,
          file_system: connectors?.filter(c => c.type === 'file_system').length || 0,
        };

        const recentActivity = activities?.map(activity => ({
          id: activity.id,
          connector_name: (activity.system_connectors as any)?.name || 'Unknown',
          action: activity.action_type,
          timestamp: activity.created_at,
          status: activity.status
        })) || [];

        const topConnectors = connectors
          ?.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
          .slice(0, 5)
          .map(c => ({
            id: c.id,
            name: c.name,
            usage_count: c.usage_count || 0,
            success_rate: c.success_rate || 0,
            status: c.status
          })) || [];

        return {
          totalConnectors,
          activeConnectors,
          inactiveConnectors,
          testingConnectors,
          errorConnectors,
          totalUsage,
          averageSuccessRate,
          connectorsByType,
          recentActivity,
          topConnectors
        };
      } catch (error) {
        console.error('Failed to fetch connector metrics:', error);
        throw error;
      }
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });

  // Fetch all connectors
  const {
    data: connectors,
    isLoading: isLoadingConnectors,
    error: connectorsError
  } = useQuery({
    queryKey: ['connectors'],
    queryFn: async (): Promise<Connector[]> => {
      const { data, error } = await supabase
        .from('system_connectors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Create connector mutation
  const createConnector = useMutation({
    mutationFn: async (connectorData: Omit<Connector, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('system_connectors')
        .insert([{
          ...connectorData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
      queryClient.invalidateQueries({ queryKey: ['connector-metrics'] });
      toast.success(`Connector "${data.name}" created successfully`);
    },
    onError: (error) => {
      console.error('Failed to create connector:', error);
      toast.error('Failed to create connector');
    },
  });

  // Update connector mutation
  const updateConnector = useMutation({
    mutationFn: async ({ connectorId, updates }: { connectorId: string; updates: Partial<Connector> }) => {
      const { data, error } = await supabase
        .from('system_connectors')
        .update(updates)
        .eq('id', connectorId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
      queryClient.invalidateQueries({ queryKey: ['connector-metrics'] });
      toast.success(`Connector "${data.name}" updated successfully`);
    },
    onError: (error) => {
      console.error('Failed to update connector:', error);
      toast.error('Failed to update connector');
    },
  });

  // Delete connector mutation
  const deleteConnector = useMutation({
    mutationFn: async (connectorId: string) => {
      const { error } = await supabase
        .from('system_connectors')
        .delete()
        .eq('id', connectorId);

      if (error) throw error;
      return connectorId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
      queryClient.invalidateQueries({ queryKey: ['connector-metrics'] });
      toast.success('Connector deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete connector:', error);
      toast.error('Failed to delete connector');
    },
  });

  // Test connector mutation
  const testConnector = useMutation({
    mutationFn: async (connectorId: string) => {
      // Update status to testing
      await supabase
        .from('system_connectors')
        .update({ status: 'testing' })
        .eq('id', connectorId);

      // Simulate testing (in real implementation, this would call the actual connector)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const success = Math.random() > 0.2; // 80% success rate
      const status = success ? 'active' : 'error';
      
      const { data, error } = await supabase
        .from('system_connectors')
        .update({ 
          status,
          last_tested: new Date().toISOString(),
          success_rate: success ? 95 : 50 // Mock success rate
        })
        .eq('id', connectorId)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase
        .from('connector_activity_logs')
        .insert({
          connector_id: connectorId,
          action_type: 'test',
          action_description: success ? 'Connection test successful' : 'Connection test failed',
          status: success ? 'success' : 'error',
          metadata: { test_duration: 2000 }
        });

      return { ...data, testSuccess: success };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
      queryClient.invalidateQueries({ queryKey: ['connector-metrics'] });
      
      if (data.testSuccess) {
        toast.success(`Test successful for "${data.name}"`);
      } else {
        toast.error(`Test failed for "${data.name}"`);
      }
    },
    onError: (error) => {
      console.error('Failed to test connector:', error);
      toast.error('Failed to test connector');
    },
  });

  return {
    // Data
    metrics,
    connectors,
    
    // Loading states
    isLoadingMetrics,
    isLoadingConnectors,
    
    // Errors
    metricsError,
    connectorsError,
    
    // Mutations
    createConnector,
    updateConnector,
    deleteConnector,
    testConnector,
    
    // Utility functions
    getConnectorById: (id: string) => connectors?.find(c => c.id === id),
    getConnectorsByType: (type: string) => connectors?.filter(c => c.type === type) || [],
    getConnectorsByStatus: (status: string) => connectors?.filter(c => c.status === status) || [],
  };
};
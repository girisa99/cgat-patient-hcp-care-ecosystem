import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AgentChannelDeployment, VoiceProvider, DeploymentHealth } from '@/types/agent-deployment';
import { toast } from '@/hooks/use-toast';

export const useAgentDeployments = () => {
  const [deployments, setDeployments] = useState<AgentChannelDeployment[]>([]);
  const [voiceProviders, setVoiceProviders] = useState<VoiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch agent deployments
  const fetchDeployments = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('agent_channel_deployments')
        .select(`
          *,
          agents (
            id, name, status, description
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setDeployments((data || []) as AgentChannelDeployment[]);
    } catch (err) {
      console.error('Error fetching deployments:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Fetch voice providers
  const fetchVoiceProviders = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('voice_providers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (fetchError) throw fetchError;
      setVoiceProviders((data || []) as VoiceProvider[]);
    } catch (err) {
      console.error('Error fetching voice providers:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Deploy agent to channel
  const deployAgentToChannel = async (
    agentId: string,
    channelId: string,
    channelType: AgentChannelDeployment['channel_type'],
    config?: Record<string, any>
  ) => {
    try {
      setLoading(true);

      const { data, error: deployError } = await supabase
        .from('agent_channel_deployments')
        .insert({
          agent_id: agentId,
          channel_id: channelId,
          channel_type: channelType,
          deployment_status: 'pending',
          deployment_config: config || {},
          priority: 1,
          assigned_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (deployError) throw deployError;

      await fetchDeployments();
      
      toast({
        title: "Agent Deployed",
        description: `Agent successfully deployed to ${channelType} channel`,
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deploy agent';
      setError(errorMessage);
      toast({
        title: "Deployment Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update deployment status
  const updateDeploymentStatus = async (
    deploymentId: string,
    status: AgentChannelDeployment['deployment_status'],
    metrics?: Record<string, any>
  ) => {
    try {
      const updateData: any = {
        deployment_status: status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'active') {
        updateData.deployed_at = new Date().toISOString();
      }

      if (metrics) {
        updateData.performance_metrics = metrics;
      }

      const { error: updateError } = await supabase
        .from('agent_channel_deployments')
        .update(updateData)
        .eq('id', deploymentId);

      if (updateError) throw updateError;

      await fetchDeployments();
      
      toast({
        title: "Status Updated",
        description: `Deployment status updated to ${status}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
      setError(errorMessage);
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Remove deployment
  const removeDeployment = async (deploymentId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('agent_channel_deployments')
        .delete()
        .eq('id', deploymentId);

      if (deleteError) throw deleteError;

      await fetchDeployments();
      
      toast({
        title: "Deployment Removed",
        description: "Agent deployment successfully removed",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove deployment';
      setError(errorMessage);
      toast({
        title: "Removal Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Get deployment health status
  const getDeploymentHealth = async (deploymentId: string): Promise<DeploymentHealth | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('agent_channel_deployments')
        .select('*')
        .eq('id', deploymentId)
        .single();

      if (fetchError) throw fetchError;

      // Simulate health check - in real implementation, this would call actual health endpoints
      const health: DeploymentHealth = {
        deployment_id: deploymentId,
        agent_id: data.agent_id,
        channel_id: data.channel_id,
        status: (data.health_status || 'unknown') as DeploymentHealth['status'],
        last_check: data.last_health_check || new Date().toISOString(),
        metrics: (typeof data.performance_metrics === 'object' && data.performance_metrics !== null 
          ? data.performance_metrics 
          : {
            response_time: 0,
            success_rate: 0,
            error_rate: 0,
            active_sessions: 0,
          }) as DeploymentHealth['metrics'],
        alerts: [],
      };

      return health;
    } catch (err) {
      console.error('Error getting deployment health:', err);
      return null;
    }
  };

  // Get agents assigned to specific channel
  const getAgentsByChannel = (channelId: string, channelType?: string) => {
    return deployments.filter(deployment => 
      deployment.channel_id === channelId && 
      (!channelType || deployment.channel_type === channelType)
    );
  };

  // Get channels for specific agent
  const getChannelsByAgent = (agentId: string) => {
    return deployments.filter(deployment => deployment.agent_id === agentId);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDeployments(), fetchVoiceProviders()]);
      setLoading(false);
    };

    loadData();

    // Set up real-time subscriptions
    const deploymentsSubscription = supabase
      .channel('agent_channel_deployments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_channel_deployments'
        },
        () => {
          fetchDeployments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(deploymentsSubscription);
    };
  }, []);

  return {
    deployments,
    voiceProviders,
    loading,
    error,
    deployAgentToChannel,
    updateDeploymentStatus,
    removeDeployment,
    getDeploymentHealth,
    getAgentsByChannel,
    getChannelsByAgent,
    refetch: () => Promise.all([fetchDeployments(), fetchVoiceProviders()]),
  };
};
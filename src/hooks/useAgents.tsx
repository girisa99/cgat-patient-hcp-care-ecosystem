/**
 * AGENTS HOOK - Real Data Implementation
 * Provides complete agent management functionality
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

interface Agent {
  id: string;
  name: string;
  description?: string;
  agent_type?: string;
  status?: string;
  purpose?: string;
  use_case?: string;
  brand?: string;
  configuration: any;
  deployment_config?: any;
  template_id?: string;
  categories?: string[];
  business_units?: string[];
  topics?: string[];
  organization_id?: string;
  facility_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useAgents = () => {
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  // Fetch agents from database
  const { data: agents = [], isLoading, error } = useQuery({
    queryKey: ['agents'],
    queryFn: async (): Promise<Agent[]> => {
      console.log('🤖 Fetching agents from database...');
      
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching agents:', error);
        throw error;
      }

      console.log('✅ Agents loaded:', data?.length || 0);
      return data || [];
    },
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  const createAgentMutation = useMutation({
    mutationFn: async (agentData: {
      name: string;
      description?: string;
      agent_type?: string;
      purpose?: string;
      use_case?: string;
      configuration?: any;
      categories?: string[];
      business_units?: string[];
      topics?: string[];
      organization_id?: string;
      facility_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('agents')
        .insert({
          ...agentData,
          status: 'draft',
          configuration: agentData.configuration || {},
          deployment_config: {}
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      showSuccess('Agent Created', 'Agent created successfully');
    },
    onError: (error: any) => {
      showError('Creation Failed', error.message);
    }
  });

  // Update agent mutation
  const updateAgentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('agents')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      showSuccess('Agent Updated', 'Agent updated successfully');
    },
    onError: (error: any) => {
      showError('Update Failed', error.message);
    }
  });

  // Delete agent mutation
  const deleteAgentMutation = useMutation({
    mutationFn: async (agentId: string) => {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId);
      
      if (error) throw error;
      return agentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      showSuccess('Agent Deleted', 'Agent deleted successfully');
    },
    onError: (error: any) => {
      showError('Deletion Failed', error.message);
    }
  });

  const getAgentStats = () => {
    const stats = {
      total: agents.length,
      active: agents.filter(a => a.status === 'active').length,
      draft: agents.filter(a => a.status === 'draft').length,
      deployed: agents.filter(a => a.status === 'deployed').length,
      byType: {} as Record<string, number>,
      byUseCase: {} as Record<string, number>
    };

    // Group by type and use case
    agents.forEach(agent => {
      if (agent.agent_type) {
        stats.byType[agent.agent_type] = (stats.byType[agent.agent_type] || 0) + 1;
      }
      if (agent.use_case) {
        stats.byUseCase[agent.use_case] = (stats.byUseCase[agent.use_case] || 0) + 1;
      }
    });

    return stats;
  };

  return {
    // Core data
    agents,
    
    // Loading states
    isLoading,
    isCreating: createAgentMutation.isPending,
    isUpdating: updateAgentMutation.isPending,
    isDeleting: deleteAgentMutation.isPending,
    
    // Error state
    error,
    
    // Actions
    createAgent: (data: any) => createAgentMutation.mutate(data),
    updateAgent: (id: string, updates: any) => updateAgentMutation.mutate({ id, updates }),
    deleteAgent: (id: string) => deleteAgentMutation.mutate(id),
    
    // Utilities
    getAgentStats,
    getAgentsByStatus: (status: string) => agents.filter(a => a.status === status),
    getAgentsByType: (type: string) => agents.filter(a => a.agent_type === type),
    getAgentById: (id: string) => agents.find(a => a.id === id),
    
    // Meta
    meta: {
      dataSource: 'agents table',
      version: 'agents-v1.0.0',
      totalAgents: agents.length
    }
  };
};
/**
 * AGENTS HOOK - Real Data Implementation
 * Provides complete agent management functionality
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';
import { useMasterAuth } from '@/hooks/useMasterAuth';

interface Agent {
  id: string;
  name: string;
  description?: string;
  agent_type?: string;
  status?: string;
  purpose?: string;
  use_case?: string;
  brand?: string;
  configuration: unknown;
  deployment_config?: unknown;
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
  const { user } = useMasterAuth();

  // Check for duplicate agent name
  const checkDuplicateName = async (name: string, userId: string, excludeId?: string) => {
    const { data, error } = await supabase.rpc('check_duplicate_agent_name', {
      p_name: name,
      p_user_id: userId,
      p_exclude_id: excludeId || null
    });
    
    if (error) {
      console.error('Error checking duplicate name:', error);
      return false;
    }
    
    return data as boolean;
  };

  // Fetch agents from database
  const { data: agents = [], isLoading, error } = useQuery({
    queryKey: ['agents', user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<Agent[]> => {
      console.log('🤖 Fetching MY agents from database...', { userId: user?.id });
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('created_by', user!.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('❌ Error fetching agents:', error);
        throw error;
      }
      console.log('✅ Agents loaded (filtered):', data?.length || 0);
      return data || [];
    },
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  // Debug logging for useAgents hook
  console.log('🔍 useAgents Debug Info:', {
    userExists: !!user,
    userId: user?.id,
    queryEnabled: !!user?.id,
    isLoading,
    agentsCount: agents?.length || 0,
    errorMessage: error?.message,
    agentsData: agents
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
      created_by: string;
    }) => {
      // Check for duplicate name
      const isDuplicate = await checkDuplicateName(agentData.name, agentData.created_by);
      if (isDuplicate) {
        throw new Error(`An agent named "${agentData.name}" already exists. Please choose a different name.`);
      }

      const { data, error } = await supabase
        .from('agents')
        .insert({
          ...agentData,
          status: 'draft',
          configuration: agentData.configuration || {},
          deployment_config: {}
        })
         .select()
         .maybeSingle();
      
      if (error) {
        if (error.code === '23505') {
          throw new Error(`An agent named "${agentData.name}" already exists. Please choose a different name.`);
        }
        throw error;
      }
      if (!data) { throw new Error('Failed to create agent: no data returned'); }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', user?.id] });
      showSuccess('Agent Created', 'Agent created successfully');
    },
    onError: (error: any) => {
      showError('Creation Failed', error.message);
    }
  });

  // Update agent mutation with duplicate check
  const updateAgentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      // Check for duplicate name if name is being updated
      if (updates.name && updates.created_by) {
        const isDuplicate = await checkDuplicateName(updates.name, updates.created_by, id);
        if (isDuplicate) {
          throw new Error(`An agent named "${updates.name}" already exists. Please choose a different name.`);
        }
      }

      const { data, error } = await supabase
        .from('agents')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
         .select()
         .maybeSingle();
      
      if (error) {
        if (error.code === '23505') {
          throw new Error(`An agent named "${updates.name}" already exists. Please choose a different name.`);
        }
        throw error;
      }
      if (!data) { throw new Error('Failed to update agent: no data returned'); }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', user?.id] });
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
      queryClient.invalidateQueries({ queryKey: ['agents', user?.id] });
      showSuccess('Agent Deleted', 'Agent deleted successfully');
    },
    onError: (error: any) => {
      showError('Deletion Failed', error.message);
    }
  });

  const getAgentStats = () => {
    const safeAgents = agents || [];
    const stats = {
      total: safeAgents.length,
      active: safeAgents.filter(a => a.status === 'active').length,
      draft: safeAgents.filter(a => a.status === 'draft').length,
      deployed: safeAgents.filter(a => a.status === 'deployed').length,
      byType: {} as Record<string, number>,
      byUseCase: {} as Record<string, number>
    };

    // Group by type and use case
    safeAgents.forEach(agent => {
      if (agent.agent_type) {
        stats.byType[agent.agent_type] = (stats.byType[agent.agent_type] || 0) + 1;
      }
      if (agent.use_case) {
        stats.byUseCase[agent.use_case] = (stats.byUseCase[agent.use_case] || 0) + 1;
      }
    });

    return stats;
  };

  console.log('🔥 useAgents hook returning:', {
    agents,
    agentsType: typeof agents,
    agentsLength: agents?.length,
    isArray: Array.isArray(agents),
    isLoading,
    error: error?.message
  });

  return {
    // Core data
    agents: agents || [],
    
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
    checkDuplicateName,
    getAgentStats,
    getAgentsByStatus: (status: string) => (agents || []).filter(a => a.status === status),
    getAgentsByType: (type: string) => (agents || []).filter(a => a.agent_type === type),
    getAgentById: (id: string) => (agents || []).find(a => a.id === id),
    
    // Meta
    meta: {
      dataSource: 'agents table',
      version: 'agents-v1.0.0',
      totalAgents: (agents || []).length
    }
  };
};
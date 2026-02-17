import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

interface WorkflowAgent {
  id?: string;
  name: string;
  description?: string;
  agent_type?: string;
  use_case?: string;
  purpose?: string;
  brand?: string;
  status?: string;
  configuration?: any;
  deployment_config?: any;
  template_id?: string;
  facility_id?: string;
  organization_id?: string;
  topics?: string[];
  business_units?: string[];
  categories?: string[];
}

interface AgentAction {
  id?: string;
  agent_id: string;
  name: string;
  description?: string;
  category: string;
  type: string;
  priority: string;
  parameters?: any;
  template_id?: string;
  ai_model_id?: string;
  mcp_server_id?: string;
  is_enabled?: boolean;
  requires_approval?: boolean;
  estimated_duration?: number;
}

export const useWorkflowAgents = () => {
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  // Fetch user's agents
  const { data: agents, isLoading: isLoadingAgents } = useQuery({
    queryKey: ['workflow-agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch agent actions for a specific agent
  const fetchAgentActions = (agentId: string) => {
    return useQuery({
      queryKey: ['agent-actions', agentId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('agent_actions')
          .select('*')
          .eq('agent_id', agentId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
      },
      enabled: !!agentId,
    });
  };

  // Create agent from workflow node
  const createAgent = useMutation({
    mutationFn: async (agentData: Omit<WorkflowAgent, 'id'>) => {
      const { data, error } = await supabase
        .from('agents')
        .insert({
          name: agentData.name,
          description: agentData.description,
          agent_type: agentData.agent_type || 'single',
          use_case: agentData.use_case,
          purpose: agentData.purpose,
          brand: agentData.brand,
          status: agentData.status || 'draft',
          configuration: agentData.configuration || {},
          deployment_config: agentData.deployment_config || {},
          template_id: agentData.template_id,
          facility_id: agentData.facility_id,
          organization_id: agentData.organization_id,
          topics: agentData.topics || [],
          business_units: agentData.business_units || [],
          categories: agentData.categories || [],
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-agents'] });
      showSuccess('Agent created successfully');
    },
    onError: (error) => {
      showError('Failed to create agent: ' + error.message);
    }
  });

  // Update agent
  const updateAgent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WorkflowAgent> & { id: string }) => {
      const { data, error } = await supabase
        .from('agents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-agents'] });
      showSuccess('Agent updated successfully');
    },
    onError: (error) => {
      showError('Failed to update agent: ' + error.message);
    }
  });

  // Create agent action
  const createAgentAction = useMutation({
    mutationFn: async (actionData: Omit<AgentAction, 'id'>) => {
      const { data, error } = await supabase
        .from('agent_actions')
        .insert({
          agent_id: actionData.agent_id,
          name: actionData.name,
          description: actionData.description,
          category: actionData.category,
          type: actionData.type,
          priority: actionData.priority || 'medium',
          parameters: actionData.parameters || {},
          template_id: actionData.template_id,
          ai_model_id: actionData.ai_model_id,
          mcp_server_id: actionData.mcp_server_id,
          is_enabled: actionData.is_enabled !== false,
          requires_approval: actionData.requires_approval || false,
          estimated_duration: actionData.estimated_duration || 5
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-actions'] });
      showSuccess('Agent action created successfully');
    },
    onError: (error) => {
      showError('Failed to create agent action: ' + error.message);
    }
  });

  // Execute agent action
  const executeAction = useMutation({
    mutationFn: async ({ actionId, inputData, agentId }: {
      actionId: string;
      inputData?: any;
      agentId: string;
    }) => {
      const { data, error } = await supabase
        .from('action_execution_logs')
        .insert({
          action_id: actionId,
          agent_id: agentId,
          input_data: inputData || {},
          status: 'pending',
          started_at: new Date().toISOString(),
          triggered_by: 'user'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      showSuccess('Action execution started');
    },
    onError: (error) => {
      showError('Failed to execute action: ' + error.message);
    }
  });

  return {
    agents,
    isLoadingAgents,
    fetchAgentActions,
    createAgent: createAgent.mutate,
    updateAgent: updateAgent.mutate,
    createAgentAction: createAgentAction.mutate,
    executeAction: executeAction.mutate,
    isCreatingAgent: createAgent.isPending,
    isUpdatingAgent: updateAgent.isPending,
    isCreatingAction: createAgentAction.isPending,
    isExecutingAction: executeAction.isPending,
  };
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AgentSession {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  status: string;
  current_step: string;
  template_type?: string;
  template_id?: string;
  created_at: string;
  updated_at: string;
  // New regular columns extracted from JSONB
  agent_name?: string;
  agent_description?: string;
  agent_purpose?: string;
  agent_brand?: string;
  agent_use_case?: string;
  // Keep JSONB for complex data
  basic_info?: Record<string, any>;
  actions?: Record<string, any>;
  connectors?: Record<string, any>;
  knowledge?: Record<string, any>;
  rag?: Record<string, any>;
  deployment?: Record<string, any>;
  canvas?: Record<string, any>;
}

export const useAgentSessions = () => {
  const { data: agentSessions = [], isLoading, error } = useQuery({
    queryKey: ['agent-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_sessions')
        .select(`
          *,
          agent_name,
          agent_description,
          agent_purpose,
          agent_brand,
          agent_use_case
        `)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as AgentSession[];
    }
  });

  const queryClient = useQueryClient();

  const createAgentSession = useMutation({
    mutationFn: async (sessionData: Partial<AgentSession>) => {
      const { data, error } = await supabase
        .from('agent_sessions')
        .insert({
          name: sessionData.name || sessionData.agent_name || 'New Agent Session',
          description: sessionData.description || sessionData.agent_description,
          user_id: sessionData.user_id || '',
          status: sessionData.status || 'draft',
          current_step: sessionData.current_step || 'basic_info',
          template_type: sessionData.template_type,
          template_id: sessionData.template_id,
          // Use regular columns for better performance
          agent_name: sessionData.agent_name || sessionData.name,
          agent_description: sessionData.agent_description || sessionData.description,
          agent_purpose: sessionData.agent_purpose,
          agent_brand: sessionData.agent_brand,
          agent_use_case: sessionData.agent_use_case,
          // Keep backwards compatibility with JSONB
          basic_info: sessionData.basic_info || {
            name: sessionData.agent_name || sessionData.name,
            description: sessionData.agent_description || sessionData.description,
            purpose: sessionData.agent_purpose,
            brand: sessionData.agent_brand,
            use_case: sessionData.agent_use_case
          },
          actions: sessionData.actions || {},
          connectors: sessionData.connectors || {},
          knowledge: sessionData.knowledge || {},
          rag: sessionData.rag || {},
          deployment: sessionData.deployment || {},
          canvas: sessionData.canvas || {}
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-sessions'] });
      toast.success('Agent session created successfully');
    },
    onError: (error) => {
      console.error('Error creating agent session:', error);
      toast.error('Failed to create agent session');
    }
  });

  const updateAgentSession = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AgentSession> & { id: string }) => {
      const { data, error } = await supabase
        .from('agent_sessions')
        .update({
          name: updates.name || updates.agent_name,
          description: updates.description || updates.agent_description,
          status: updates.status,
          current_step: updates.current_step,
          template_type: updates.template_type,
          template_id: updates.template_id,
          // Update regular columns
          agent_name: updates.agent_name || updates.name,
          agent_description: updates.agent_description || updates.description,
          agent_purpose: updates.agent_purpose,
          agent_brand: updates.agent_brand,
          agent_use_case: updates.agent_use_case,
          // Update JSONB for backwards compatibility
          basic_info: updates.basic_info || {
            name: updates.agent_name || updates.name,
            description: updates.agent_description || updates.description,
            purpose: updates.agent_purpose,
            brand: updates.agent_brand,
            use_case: updates.agent_use_case
          },
          actions: updates.actions,
          connectors: updates.connectors,
          knowledge: updates.knowledge,
          rag: updates.rag,
          deployment: updates.deployment,
          canvas: updates.canvas
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-sessions'] });
      toast.success('Agent session updated successfully');
    },
    onError: (error) => {
      console.error('Error updating agent session:', error);
      toast.error('Failed to update agent session');
    }
  });

  const deleteAgentSession = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agent_sessions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-sessions'] });
      toast.success('Agent session deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting agent session:', error);
      toast.error('Failed to delete agent session');
    }
  });

  return {
    agentSessions,
    isLoading,
    error,
    createAgentSession: createAgentSession.mutate,
    updateAgentSession: updateAgentSession.mutate,
    deleteAgentSession: deleteAgentSession.mutate,
    isCreating: createAgentSession.isPending,
    isUpdating: updateAgentSession.isPending,
    isDeleting: deleteAgentSession.isPending
  };
};

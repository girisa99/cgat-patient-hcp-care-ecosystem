import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ConnectorAssignment {
  id: string;
  agent_session_id: string;
  connector_id: string;
  task_id: string;
  task_type: 'action' | 'workflow_step' | 'connector';
  assignment_config: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  connector?: {
    name: string;
    type: string;
    status: string;
  };
}

export const useConnectorAssignments = (agentSessionId?: string) => {
  const queryClient = useQueryClient();

  // Fetch connector assignments
  const {
    data: assignments,
    isLoading,
    error
  } = useQuery({
    queryKey: ['connector-assignments', agentSessionId],
    queryFn: async (): Promise<ConnectorAssignment[]> => {
      if (!agentSessionId || agentSessionId === 'temp-agent-id') return [];
      
      const { data, error } = await supabase
        .from('connector_assignments')
        .select(`
          *,
          connector:system_connectors(name, type, status)
        `)
        .eq('agent_session_id', agentSessionId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching connector assignments:', error);
        return [];
      }
      return (data || []) as ConnectorAssignment[];
    },
    enabled: !!agentSessionId && agentSessionId !== 'temp-agent-id',
    staleTime: 30000,
  });

  // Fetch available connectors
  const {
    data: availableConnectors,
    isLoading: isLoadingConnectors,
    refetch: refetchConnectors
  } = useQuery({
    queryKey: ['available-connectors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_connectors')
        .select('id, name, type, status, description, category')
        .in('status', ['active', 'inactive']) // Include both active and inactive connectors for assignment
        .order('name');

      if (error) throw error;
      return data || [];
    },
    staleTime: 30000, // Reduced stale time for more frequent updates
  });

  // Create assignment mutation
  const assignConnector = useMutation({
    mutationFn: async (assignment: {
      agent_session_id: string;
      connector_id: string;
      task_id: string;
      task_type: 'action' | 'workflow_step' | 'connector';
      assignment_config?: Record<string, any>;
    }) => {
      if (!assignment.agent_session_id || assignment.agent_session_id === 'temp-agent-id') {
        console.error('Cannot assign connector to temporary agent ID');
        throw new Error('Cannot assign connector to temporary agent ID. Please save the agent first.');
      }
      
      const { data, error } = await supabase
        .from('connector_assignments')
        .insert([{
          ...assignment,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select(`
          *,
          connector:system_connectors(name, type, status)
        `)
        .single();

      if (error) {
        console.error('Error assigning connector:', error);
        throw error;
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['connector-assignments'] });
      toast.success(`Connector "${data.connector?.name}" assigned successfully`);
    },
    onError: (error) => {
      console.error('Failed to assign connector:', error);
      toast.error('Failed to assign connector');
    },
  });

  // Update assignment mutation
  const updateAssignment = useMutation({
    mutationFn: async ({ 
      assignmentId, 
      updates 
    }: { 
      assignmentId: string; 
      updates: Partial<ConnectorAssignment> 
    }) => {
      const { data, error } = await supabase
        .from('connector_assignments')
        .update(updates)
        .eq('id', assignmentId)
        .select(`
          *,
          connector:system_connectors(name, type, status)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['connector-assignments'] });
      toast.success('Assignment updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update assignment:', error);
      toast.error('Failed to update assignment');
    },
  });

  // Remove assignment mutation
  const removeAssignment = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('connector_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
      return assignmentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connector-assignments'] });
      toast.success('Connector assignment removed successfully');
    },
    onError: (error) => {
      console.error('Failed to remove assignment:', error);
      toast.error('Failed to remove assignment');
    },
  });

  // Utility functions
  const getTaskAssignment = (taskId: string, taskType: string) => {
    return assignments?.find(
      a => a.task_id === taskId && a.task_type === taskType
    );
  };

  const getAssignmentsByType = () => {
    const grouped = assignments?.reduce((acc, assignment) => {
      const type = assignment.task_type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(assignment);
      return acc;
    }, {} as Record<string, ConnectorAssignment[]>) || {};

    return grouped;
  };

  const getTaskAssignments = (taskId: string, taskType: string) => {
    return assignments?.filter(
      a => a.task_id === taskId && a.task_type === taskType
    ) || [];
  };

  return {
    // Data
    assignments: assignments || [],
    availableConnectors: availableConnectors || [],
    
    // Loading states
    isLoading,
    isLoadingConnectors,
    
    // Error
    error,
    
    // Mutations
    assignConnector,
    updateAssignment,
    removeAssignment,
    
    // Utility functions
    getTaskAssignment,
    getAssignmentsByType,
    getTaskAssignments,
  };
};
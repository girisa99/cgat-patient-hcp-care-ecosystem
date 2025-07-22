import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface APIAssignment {
  id: string;
  agent_session_id: string;
  task_id: string;
  task_type: 'action' | 'workflow_step' | 'connector';
  assigned_api_service: string;
  api_configuration: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useAgentAPIAssignments = (sessionId?: string) => {
  const queryClient = useQueryClient();

  // Fetch API assignments for a session
  const { data: apiAssignments = [], isLoading } = useQuery({
    queryKey: ['agent-api-assignments', sessionId],
    queryFn: async () => {
      if (!sessionId || sessionId === 'temp-agent-id') return [];
      
      const { data, error } = await supabase
        .from('agent_api_assignments')
        .select('*')
        .eq('agent_session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching API assignments:', error);
        return [];
      }

      return data as APIAssignment[];
    },
    enabled: !!sessionId && sessionId !== 'temp-agent-id',
  });

  // Fetch available API services from integration registry
  const { data: availableAPIs = [] } = useQuery({
    queryKey: ['available-api-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_integration_registry')
        .select('id, name, description, type, category, status')
        .eq('status', 'active')
        .order('name');

      if (error) {
        console.error('Error fetching available APIs:', error);
        return [];
      }

      return data;
    },
  });

  // Create API assignment
  const assignAPI = useMutation({
    mutationFn: async (assignment: {
      agent_session_id: string;
      task_id: string;
      task_type: 'action' | 'workflow_step' | 'connector';
      assigned_api_service: string;
      api_configuration?: Record<string, any>;
    }) => {
      if (!assignment.agent_session_id || assignment.agent_session_id === 'temp-agent-id') {
        console.error('Cannot assign API to temporary agent ID');
        throw new Error('Cannot assign API to temporary agent ID. Please save the agent first.');
      }
      
      const { data, error } = await supabase
        .from('agent_api_assignments')
        .insert([{
          ...assignment,
          api_configuration: assignment.api_configuration || {}
        }])
        .select()
        .single();

      if (error) {
        console.error('Error assigning API:', error);
        throw new Error(`Failed to assign API: ${error.message}`);
      }

      return data as APIAssignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-api-assignments', sessionId] });
      toast({
        title: "API Assigned",
        description: "API service has been successfully assigned to the task.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Assignment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update API assignment
  const updateAssignment = useMutation({
    mutationFn: async ({ assignmentId, updates }: { 
      assignmentId: string; 
      updates: Partial<APIAssignment> 
    }) => {
      const { data, error } = await supabase
        .from('agent_api_assignments')
        .update(updates)
        .eq('id', assignmentId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update assignment: ${error.message}`);
      }

      return data as APIAssignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-api-assignments', sessionId] });
      toast({
        title: "Assignment Updated",
        description: "API assignment has been successfully updated.",
      });
    },
  });

  // Remove API assignment
  const removeAssignment = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('agent_api_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) {
        throw new Error(`Failed to remove assignment: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-api-assignments', sessionId] });
      toast({
        title: "Assignment Removed",
        description: "API assignment has been successfully removed.",
      });
    },
  });

  // Get assignment for specific task
  const getTaskAssignment = (taskId: string, taskType: string) => {
    return apiAssignments.find(
      assignment => assignment.task_id === taskId && assignment.task_type === taskType
    );
  };

  // Get all assignments grouped by task type
  const getAssignmentsByType = () => {
    return apiAssignments.reduce((acc, assignment) => {
      if (!acc[assignment.task_type]) {
        acc[assignment.task_type] = [];
      }
      acc[assignment.task_type].push(assignment);
      return acc;
    }, {} as Record<string, APIAssignment[]>);
  };

  return {
    apiAssignments,
    availableAPIs,
    isLoading,
    assignAPI,
    updateAssignment,
    removeAssignment,
    getTaskAssignment,
    getAssignmentsByType,
  };
};
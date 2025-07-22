import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AgentSessionTask {
  id: string;
  session_id: string;
  action_id: string;
  task_name: string;
  task_description: string;
  task_type: 'action' | 'workflow_step' | 'connector';
  task_order: number;
  required_inputs: any[];
  expected_outputs: any[];
  validation_rules: any;
  timeout_minutes: number;
  retry_attempts: number;
  is_critical: boolean;
  ai_model_id?: string;
  mcp_server_id?: string;
  created_at: string;
  updated_at: string;
}

export const useAgentSessionTasks = (sessionId?: string) => {
  const queryClient = useQueryClient();

  // Fetch tasks for a session
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['agent-session-tasks', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      
      const { data, error } = await supabase
        .from('agent_session_tasks')
        .select('*')
        .eq('session_id', sessionId)
        .order('task_order', { ascending: true });
      
      if (error) throw error;
      return data as AgentSessionTask[];
    },
    enabled: !!sessionId,
  });

  // Create task mutation
  const createTask = useMutation({
    mutationFn: async (taskData: Omit<AgentSessionTask, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('agent_session_tasks')
        .insert([taskData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-session-tasks', sessionId] });
      toast({
        title: "Task Created",
        description: "Task has been successfully created",
      });
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    },
  });

  // Update task mutation
  const updateTask = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<AgentSessionTask> }) => {
      const { data, error } = await supabase
        .from('agent_session_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-session-tasks', sessionId] });
      toast({
        title: "Task Updated",
        description: "Task has been successfully updated",
      });
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('agent_session_tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-session-tasks', sessionId] });
      toast({
        title: "Task Deleted",
        description: "Task has been successfully deleted",
      });
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  // Bulk create tasks
  const createMultipleTasks = useMutation({
    mutationFn: async (tasksData: Omit<AgentSessionTask, 'id' | 'created_at' | 'updated_at'>[]) => {
      const { data, error } = await supabase
        .from('agent_session_tasks')
        .insert(tasksData)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agent-session-tasks', sessionId] });
      toast({
        title: "Tasks Created",
        description: `Successfully created ${data?.length || 0} tasks`,
      });
    },
    onError: (error) => {
      console.error('Error creating tasks:', error);
      toast({
        title: "Error",
        description: "Failed to create tasks",
        variant: "destructive",
      });
    },
  });

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    createMultipleTasks,
  };
};
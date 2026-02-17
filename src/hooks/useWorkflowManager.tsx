import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Node, Edge } from '@xyflow/react';
import { useMasterToast } from './useMasterToast';

interface WorkflowData {
  id?: string;
  name: string;
  description?: string;
  workflow_data: any; // Use any for JSON compatibility
  status?: string;
  version?: number;
  agent_session_id?: string;
  template_id?: string;
}

export const useWorkflowManager = (sessionId?: string) => {
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  // Fetch workflows for current user/session
  const { data: workflows, isLoading, error } = useQuery({
    queryKey: ['workflows', sessionId],
    queryFn: async () => {
      let query = supabase
        .from('agent_workflows')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (sessionId) {
        query = query.eq('agent_session_id', sessionId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Create workflow
  const createWorkflow = useMutation({
    mutationFn: async (workflowData: Omit<WorkflowData, 'id'>) => {
      const { data, error } = await supabase
        .from('agent_workflows')
        .insert({
          name: workflowData.name,
          description: workflowData.description,
          workflow_data: workflowData.workflow_data as any,
          status: workflowData.status || 'draft',
          version: workflowData.version || 1,
          agent_session_id: workflowData.agent_session_id || sessionId,
          template_id: workflowData.template_id,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      showSuccess('Workflow created successfully');
    },
    onError: (error) => {
      showError('Failed to create workflow: ' + error.message);
    }
  });

  // Update workflow
  const updateWorkflow = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WorkflowData> & { id: string }) => {
      const { data, error } = await supabase
        .from('agent_workflows')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      showSuccess('Workflow updated successfully');
    },
    onError: (error) => {
      showError('Failed to update workflow: ' + error.message);
    }
  });

  // Delete workflow
  const deleteWorkflow = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agent_workflows')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      showSuccess('Workflow deleted successfully');
    },
    onError: (error) => {
      showError('Failed to delete workflow: ' + error.message);
    }
  });

  // Auto-save workflow (debounced)
  const autoSaveWorkflow = useMutation({
    mutationFn: async ({ id, nodes, edges, metadata }: { 
      id: string; 
      nodes: Node[]; 
      edges: Edge[]; 
      metadata?: any 
    }) => {
      const workflowData = {
        nodes: nodes.map(n => ({ ...n, data: { ...n.data } })),
        edges: edges.map(e => ({ ...e, data: { ...e.data } })),
        metadata: metadata || {},
        lastAutoSave: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('agent_workflows')
        .update({
          workflow_data: workflowData as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onError: (error) => {
      console.warn('Auto-save failed:', error.message);
    }
  });

  return {
    workflows,
    isLoading,
    error,
    createWorkflow: createWorkflow.mutate,
    updateWorkflow: updateWorkflow.mutate,
    deleteWorkflow: deleteWorkflow.mutate,
    autoSaveWorkflow: autoSaveWorkflow.mutate,
    isCreating: createWorkflow.isPending,
    isUpdating: updateWorkflow.isPending,
    isDeleting: deleteWorkflow.isPending,
    isAutoSaving: autoSaveWorkflow.isPending,
  };
};
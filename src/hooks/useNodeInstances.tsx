import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for managing workflow node instances (runtime configurations)
 * Replaces the old workflow_node_configs functionality
 */
export const useNodeInstances = () => {
  const queryClient = useQueryClient();

  // Query for getting node instances by workflow
  const getNodeInstances = (workflowId: string) => {
    return useQuery({
      queryKey: ['node-instances', workflowId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('workflow_node_instances')
          .select(`
            *,
            node_type:workflow_node_types(*)
          `)
          .eq('workflow_id', workflowId)
          .eq('is_active', true)
          .order('created_at');
        
        if (error) throw error;
        return data || [];
      },
      enabled: !!workflowId
    });
  };

  // Mutation for creating node instance
  const createNodeInstanceMutation = useMutation({
    mutationFn: async (instanceData: {
      workflowId: string;
      nodeId: string;
      nodeTypeKey: string;
      instanceName?: string;
      configuration?: any;
      position?: any;
      size?: any;
      metadata?: any;
    }) => {
      const { data, error } = await supabase
        .from('workflow_node_instances')
        .insert([{
          workflow_id: instanceData.workflowId,
          node_id: instanceData.nodeId,
          node_type_key: instanceData.nodeTypeKey,
          instance_name: instanceData.instanceName,
          configuration: instanceData.configuration || {},
          position: instanceData.position || { x: 0, y: 0 },
          size: instanceData.size || { width: 200, height: 100 },
          metadata: instanceData.metadata || {},
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['node-instances', variables.workflowId] });
    }
  });

  // Mutation for updating node instance
  const updateNodeInstanceMutation = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('workflow_node_instances')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['node-instances', data.workflow_id] });
    }
  });

  // Mutation for deleting node instance
  const deleteNodeInstanceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workflow_node_instances')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['node-instances'] });
    }
  });

  return {
    getNodeInstances,
    createNodeInstance: createNodeInstanceMutation.mutate,
    updateNodeInstance: updateNodeInstanceMutation.mutate,
    deleteNodeInstance: deleteNodeInstanceMutation.mutate,
    isCreating: createNodeInstanceMutation.isPending,
    isUpdating: updateNodeInstanceMutation.isPending,
    isDeleting: deleteNodeInstanceMutation.isPending
  };
};
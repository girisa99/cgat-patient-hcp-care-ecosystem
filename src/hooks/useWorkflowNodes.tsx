import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

export interface WorkflowNodeCategory {
  id: string;
  name: string;
  display_name: string;
  description: string;
  icon: string;
  color: string;
  parent_category_id?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowNodeType {
  id: string;
  category_id: string;
  type_key: string;
  display_name: string;
  description: string;
  detailed_explanation: string;
  icon: string;
  color: string;
  is_draggable: boolean;
  is_configurable: boolean;
  default_config: Record<string, any>;
  input_schema: Record<string, any>;
  output_schema: Record<string, any>;
  capabilities: string[];
  requirements: Record<string, any>;
  order_index: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  category?: WorkflowNodeCategory;
}

export const useWorkflowNodes = () => {
  const queryClient = useQueryClient();
  const { toast } = useMasterToast();

  // Fetch categories
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError
  } = useQuery({
    queryKey: ['workflow-node-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_node_categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index');
      
      if (error) throw error;
      return data as WorkflowNodeCategory[];
    }
  });

  // Fetch node types with categories
  const {
    data: nodeTypes = [],
    isLoading: nodeTypesLoading,
    error: nodeTypesError
  } = useQuery({
    queryKey: ['workflow-node-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_node_types')
        .select(`
          *,
          category:workflow_node_categories(*)
        `)
        .eq('is_active', true)
        .order('order_index');
      
      if (error) throw error;
      return data as WorkflowNodeType[];
    }
  });

  // Group node types by category
  const nodeTypesByCategory = nodeTypes.reduce((acc, nodeType) => {
    const categoryName = nodeType.category?.name || 'uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(nodeType);
    return acc;
  }, {} as Record<string, WorkflowNodeType[]>);

  // Create node type mutation
  const createNodeTypeMutation = useMutation({
    mutationFn: async (nodeType: Omit<WorkflowNodeType, 'id' | 'created_at' | 'updated_at' | 'category'>) => {
      const user = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('workflow_node_types')
        .insert([{
          ...nodeType,
          created_by: user.data.user?.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-node-types'] });
      toast.success("Node type created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create node type");
    }
  });

  // Update node type mutation
  const updateNodeTypeMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WorkflowNodeType> & { id: string }) => {
      const { data, error } = await supabase
        .from('workflow_node_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-node-types'] });
      toast.success("Node type updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update node type");
    }
  });

  // Delete node type mutation
  const deleteNodeTypeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workflow_node_types')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-node-types'] });
      toast.success("Node type deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete node type");
    }
  });

  // Get node type by key
  const getNodeTypeByKey = (typeKey: string) => {
    return nodeTypes.find(nt => nt.type_key === typeKey);
  };

  // Get nodes by category
  const getNodesByCategory = (categoryName: string) => {
    return nodeTypesByCategory[categoryName] || [];
  };

  return {
    // Data
    categories,
    nodeTypes,
    nodeTypesByCategory,
    
    // Loading states
    isLoading: categoriesLoading || nodeTypesLoading,
    categoriesLoading,
    nodeTypesLoading,
    
    // Errors
    error: categoriesError || nodeTypesError,
    categoriesError,
    nodeTypesError,
    
    // Mutations
    createNodeType: createNodeTypeMutation.mutate,
    updateNodeType: updateNodeTypeMutation.mutate,
    deleteNodeType: deleteNodeTypeMutation.mutate,
    
    // Mutation states
    isCreating: createNodeTypeMutation.isPending,
    isUpdating: updateNodeTypeMutation.isPending,
    isDeleting: deleteNodeTypeMutation.isPending,
    
    // Utilities
    getNodeTypeByKey,
    getNodesByCategory,
  };
};
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
    queryKey: ['workflow-builder-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_node_categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index');
      
      if (error) throw error;
      
      console.log('[useWorkflowNodes] Fetched categories:', data?.length, 'categories');
      console.log('[useWorkflowNodes] Categories:', data?.map(c => c.name));
      
      return data.map(cat => ({
        id: cat.id,
        name: cat.name,
        display_name: cat.display_name,
        description: cat.description || '',
        icon: cat.icon || 'Box',
        color: cat.color || '#6B7280',
        order_index: cat.order_index || 0,
        is_active: cat.is_active,
        created_at: cat.created_at || '',
        updated_at: cat.updated_at || ''
      }));
    }
  });

  // Fetch node types with categories
  const {
    data: nodeTypes = [],
    isLoading: nodeTypesLoading,
    error: nodeTypesError
  } = useQuery({
    queryKey: ['workflow-builder-nodes'],
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
      
      console.log('[useWorkflowNodes] Fetched node types:', data?.length, 'nodes');
      console.log('[useWorkflowNodes] Sample node data:', data?.[0]);
      
      return data.map(node => ({
        id: node.id,
        category_id: node.category_id,
        type_key: node.type_key,
        display_name: node.display_name,
        description: node.description || '',
        detailed_explanation: node.detailed_explanation || node.description || '',
        icon: node.icon || 'Box',
        color: node.color || '#6B7280',
        is_draggable: node.is_draggable,
        is_configurable: node.is_configurable,
        default_config: (node.default_config && typeof node.default_config === 'object') ? node.default_config as Record<string, any> : {},
        input_schema: (node.input_schema && typeof node.input_schema === 'object') ? node.input_schema as Record<string, any> : {},
        output_schema: (node.output_schema && typeof node.output_schema === 'object') ? node.output_schema as Record<string, any> : {},
        capabilities: Array.isArray(node.capabilities) ? node.capabilities.map(c => String(c)) : [],
        requirements: (node.requirements && typeof node.requirements === 'object') ? node.requirements as Record<string, any> : {},
        order_index: node.order_index || 0,
        is_active: node.is_active,
        created_at: node.created_at || '',
        updated_at: node.updated_at || '',
        category: node.category || {
          id: node.category_id,
          name: 'uncategorized',
          display_name: 'Uncategorized',
          description: '',
          icon: 'Box',
          color: '#6B7280',
          order_index: 0,
          is_active: true,
          created_at: '',
          updated_at: ''
        }
      }));
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
    mutationFn: async (nodeData: {
      type: string;
      category: string;
      label: string;
      description?: string;
      configuration?: any;
    }) => {
      const { data, error } = await supabase
        .from('workflow_node_types')
        .insert([{
          type_key: nodeData.type,
          category_id: nodeData.category,
          display_name: nodeData.label,
          description: nodeData.description || '',
          default_config: nodeData.configuration || {},
          is_active: true
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-builder-nodes'] });
      toast.success("Node type created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create node type");
    }
  });

  // Update node type mutation
  const updateNodeTypeMutation = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
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
      queryClient.invalidateQueries({ queryKey: ['workflow-builder-nodes'] });
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
      queryClient.invalidateQueries({ queryKey: ['workflow-builder-nodes'] });
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
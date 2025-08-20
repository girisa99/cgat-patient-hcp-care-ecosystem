import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

export interface WorkflowLibrary {
  id: string;
  name: string;
  description: string;
  version: string;
  category: 'utility' | 'ai' | 'data' | 'api' | 'ui' | 'security' | 'healthcare' | 'integration';
  author: string;
  tags: string[];
  documentation_url: string;
  repository_url?: string;
  rating: number;
  downloads: number;
  is_installed: boolean;
  is_core: boolean;
  is_custom: boolean;
  configuration: any;
  dependencies: string[];
  examples: any[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowAction {
  id: string;
  name: string;
  description: string;
  type: 'transform' | 'validate' | 'calculate' | 'request' | 'condition' | 'loop' | 'trigger' | 'notification';
  category: string;
  code: string;
  inputs: any[];
  outputs: any[];
  parameters: any;
  validation_rules: any;
  is_custom: boolean;
  usage_count: number;
  success_rate: number;
  average_execution_time_ms: number;
  library_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  workflow_libraries?: { name: string };
}

export interface WorkflowOperator {
  id: string;
  name: string;
  symbol: string;
  description: string;
  category: 'arithmetic' | 'comparison' | 'logical' | 'string' | 'array' | 'object' | 'date' | 'math';
  syntax: string;
  examples: string[];
  precedence: number;
  is_binary: boolean;
  return_type: string;
  usage_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowConnection {
  id: string;
  workflow_id: string;
  source_node_id: string;
  target_node_id: string;
  library_id?: string;
  action_id?: string;
  operator_id?: string;
  connection_type: 'library' | 'action' | 'operator';
  configuration: any;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface UseWorkflowResourcesProps {
  category?: string;
  search?: string;
  type?: string;
}

export const useWorkflowResources = (props: UseWorkflowResourcesProps = {}) => {
  const { category, search, type } = props;
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  // Fetch Libraries
  const {
    data: libraries = [],
    isLoading: isLoadingLibraries,
    error: librariesError
  } = useQuery({
    queryKey: ['workflow-libraries', category, search],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('workflow-resources', {
        body: { path: '/libraries', method: 'GET', params: { category, search } }
      });
      
      if (error) throw error;
      return data as WorkflowLibrary[];
    }
  });

  // Fetch Actions
  const {
    data: actions = [],
    isLoading: isLoadingActions,
    error: actionsError
  } = useQuery({
    queryKey: ['workflow-actions', category, search, type],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('workflow-resources', {
        body: { path: '/actions', method: 'GET', params: { category, search, type } }
      });
      
      if (error) throw error;
      return data as WorkflowAction[];
    }
  });

  // Fetch Operators
  const {
    data: operators = [],
    isLoading: isLoadingOperators,
    error: operatorsError
  } = useQuery({
    queryKey: ['workflow-operators', category, search],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('workflow-resources', {
        body: { path: '/operators', method: 'GET', params: { category, search } }
      });
      
      if (error) throw error;
      return data as WorkflowOperator[];
    }
  });

  // Create Library Mutation
  const createLibraryMutation = useMutation({
    mutationFn: async (libraryData: Partial<WorkflowLibrary>) => {
      const { data, error } = await supabase.functions.invoke('workflow-resources', {
        body: { path: '/libraries', method: 'POST', data: libraryData }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-libraries'] });
      showSuccess('Library created successfully');
    },
    onError: (error: any) => {
      showError('Failed to create library', error.message);
    }
  });

  // Update Library Mutation
  const updateLibraryMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WorkflowLibrary> & { id: string }) => {
      const { data, error } = await supabase.functions.invoke('workflow-resources', {
        body: { path: `/libraries/${id}`, method: 'PUT', data: updates }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-libraries'] });
      showSuccess('Library updated successfully');
    },
    onError: (error: any) => {
      showError('Failed to update library', error.message);
    }
  });

  // Delete Library Mutation
  const deleteLibraryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke('workflow-resources', {
        body: { path: `/libraries/${id}`, method: 'DELETE' }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-libraries'] });
      showSuccess('Library deleted successfully');
    },
    onError: (error: any) => {
      showError('Failed to delete library', error.message);
    }
  });

  // Install/Uninstall Library Mutation
  const toggleInstallLibraryMutation = useMutation({
    mutationFn: async ({ libraryId, install }: { libraryId: string; install: boolean }) => {
      const { data, error } = await supabase.functions.invoke('workflow-resources', {
        body: { path: '/install-library', method: 'POST', data: { libraryId, install } }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { install }) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-libraries'] });
      showSuccess(install ? 'Library installed successfully' : 'Library uninstalled successfully');
    },
    onError: (error: any) => {
      showError('Failed to toggle library installation', error.message);
    }
  });

  // Create Action Mutation
  const createActionMutation = useMutation({
    mutationFn: async (actionData: Partial<WorkflowAction>) => {
      const { data, error } = await supabase.functions.invoke('workflow-resources', {
        body: { path: '/actions', method: 'POST', data: actionData }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-actions'] });
      showSuccess('Action created successfully');
    },
    onError: (error: any) => {
      showError('Failed to create action', error.message);
    }
  });

  // Update Action Mutation
  const updateActionMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WorkflowAction> & { id: string }) => {
      const { data, error } = await supabase.functions.invoke('workflow-resources', {
        body: { path: `/actions/${id}`, method: 'PUT', data: updates }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-actions'] });
      showSuccess('Action updated successfully');
    },
    onError: (error: any) => {
      showError('Failed to update action', error.message);
    }
  });

  // Delete Action Mutation
  const deleteActionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke('workflow-resources', {
        body: { path: `/actions/${id}`, method: 'DELETE' }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-actions'] });
      showSuccess('Action deleted successfully');
    },
    onError: (error: any) => {
      showError('Failed to delete action', error.message);
    }
  });

  // Use Action Mutation
  const useActionMutation = useMutation({
    mutationFn: async (actionId: string) => {
      const { data, error } = await supabase.functions.invoke('workflow-resources', {
        body: { path: '/use-action', method: 'POST', data: { actionId } }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-actions'] });
      showSuccess('Action added to workflow');
    },
    onError: (error: any) => {
      showError('Failed to use action', error.message);
    }
  });

  // Create Operator Mutation
  const createOperatorMutation = useMutation({
    mutationFn: async (operatorData: Partial<WorkflowOperator>) => {
      const { data, error } = await supabase.functions.invoke('workflow-resources', {
        body: { path: '/operators', method: 'POST', data: operatorData }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-operators'] });
      showSuccess('Operator created successfully');
    },
    onError: (error: any) => {
      showError('Failed to create operator', error.message);
    }
  });

  // Create Connection Mutation
  const createConnectionMutation = useMutation({
    mutationFn: async (connectionData: Partial<WorkflowConnection>) => {
      const { data, error } = await supabase.functions.invoke('workflow-resources', {
        body: { path: '/connections', method: 'POST', data: connectionData }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-connections'] });
      showSuccess('Connection created successfully');
    },
    onError: (error: any) => {
      showError('Failed to create connection', error.message);
    }
  });

  return {
    // Data
    libraries,
    actions,
    operators,
    
    // Loading states
    isLoadingLibraries,
    isLoadingActions,
    isLoadingOperators,
    isLoading: isLoadingLibraries || isLoadingActions || isLoadingOperators,
    
    // Errors
    librariesError,
    actionsError,
    operatorsError,
    
    // Library operations
    createLibrary: createLibraryMutation.mutate,
    updateLibrary: updateLibraryMutation.mutate,
    deleteLibrary: deleteLibraryMutation.mutate,
    toggleInstallLibrary: toggleInstallLibraryMutation.mutate,
    isCreatingLibrary: createLibraryMutation.isPending,
    isUpdatingLibrary: updateLibraryMutation.isPending,
    isDeletingLibrary: deleteLibraryMutation.isPending,
    isTogglingInstall: toggleInstallLibraryMutation.isPending,
    
    // Action operations
    createAction: createActionMutation.mutate,
    updateAction: updateActionMutation.mutate,
    deleteAction: deleteActionMutation.mutate,
    useAction: useActionMutation.mutate,
    isCreatingAction: createActionMutation.isPending,
    isUpdatingAction: updateActionMutation.isPending,
    isDeletingAction: deleteActionMutation.isPending,
    isUsingAction: useActionMutation.isPending,
    
    // Operator operations
    createOperator: createOperatorMutation.mutate,
    isCreatingOperator: createOperatorMutation.isPending,
    
    // Connection operations
    createConnection: createConnectionMutation.mutate,
    isCreatingConnection: createConnectionMutation.isPending
  };
};
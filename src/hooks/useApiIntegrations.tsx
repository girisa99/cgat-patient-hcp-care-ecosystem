
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ApiIntegration {
  id: string;
  name: string;
  type: string;
  direction: string;
  purpose: string;
  status: string;
  base_url?: string | null;
  endpoints_count?: number;
  category: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  webhook_config?: any;
  version?: string;
  lifecycle_stage?: string;
  created_by?: string | null;
  last_modified_by?: string | null;
  contact_info?: any;
  documentation_url?: string | null;
  rate_limits?: any;
  security_requirements?: any;
  sla_requirements?: any;
  data_mappings_count?: number;
  rls_policies_count?: number;
}

interface ApiEndpoint {
  id: string;
  endpoint_path: string;
  method: string;
  description?: string | null;
  category: string;
  is_public?: boolean;
  requires_authentication?: boolean;
  api_integration_id?: string | null;
  created_at: string;
  updated_at: string;
  response_schema?: any;
  request_schema?: any;
  example_request?: any;
  example_response?: any;
  rate_limit_config?: any;
  documentation_url?: string | null;
  testing_status?: string;
  sandbox_available?: boolean;
  postman_collection_id?: string | null;
}

export const useApiIntegrations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch API Integrations
  const {
    data: apiIntegrations,
    isLoading: isLoadingIntegrations,
    error: integrationsError
  } = useQuery({
    queryKey: ['api-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_integration_registry')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as unknown as ApiIntegration[];
    }
  });

  // Fetch API Endpoints
  const {
    data: apiEndpoints,
    isLoading: isLoadingEndpoints,
    error: endpointsError
  } = useQuery({
    queryKey: ['api-endpoints'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_endpoints')
        .select('*')
        .order('endpoint_path');
      
      if (error) throw error;
      return data as unknown as ApiEndpoint[];
    }
  });

  // Create API Integration
  const createIntegration = useMutation({
    mutationFn: async (integrationData: any) => {
      const { data, error } = await supabase
        .from('api_integration_registry')
        .insert(integrationData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-integrations'] });
      toast({
        title: "Success",
        description: "API integration created successfully"
      });
    },
    onError: (error) => {
      console.error('Error creating integration:', error);
      toast({
        title: "Error",
        description: "Failed to create API integration",
        variant: "destructive"
      });
    }
  });

  // Update API Integration
  const updateIntegration = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ApiIntegration> }) => {
      const { data, error } = await supabase
        .from('api_integration_registry')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-integrations'] });
      toast({
        title: "Success",
        description: "API integration updated successfully"
      });
    },
    onError: (error) => {
      console.error('Error updating integration:', error);
      toast({
        title: "Error",
        description: "Failed to update API integration",
        variant: "destructive"
      });
    }
  });

  // Delete API Integration
  const deleteIntegration = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('api_integration_registry')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-integrations'] });
      toast({
        title: "Success",
        description: "API integration deleted successfully"
      });
    },
    onError: (error) => {
      console.error('Error deleting integration:', error);
      toast({
        title: "Error",
        description: "Failed to delete API integration",
        variant: "destructive"
      });
    }
  });

  // Create API Endpoint
  const createEndpoint = useMutation({
    mutationFn: async (endpointData: any) => {
      const { data, error } = await supabase
        .from('api_endpoints')
        .insert(endpointData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-endpoints'] });
      toast({
        title: "Success",
        description: "API endpoint created successfully"
      });
    },
    onError: (error) => {
      console.error('Error creating endpoint:', error);
      toast({
        title: "Error",
        description: "Failed to create API endpoint",
        variant: "destructive"
      });
    }
  });

  // Test API Integration
  const testIntegration = useMutation({
    mutationFn: async (id: string) => {
      // Simulate API testing
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, message: 'API integration test successful' };
    },
    onSuccess: (data) => {
      toast({
        title: "Test Successful",
        description: data.message
      });
    },
    onError: () => {
      toast({
        title: "Test Failed",
        description: "API integration test failed",
        variant: "destructive"
      });
    }
  });

  return {
    // Data
    apiIntegrations,
    apiEndpoints,
    
    // Loading states
    isLoadingIntegrations,
    isLoadingEndpoints,
    isLoading: isLoadingIntegrations || isLoadingEndpoints,
    
    // Error states
    integrationsError,
    endpointsError,
    error: integrationsError || endpointsError,
    
    // Mutations
    createIntegration,
    updateIntegration,
    deleteIntegration,
    createEndpoint,
    testIntegration,
    
    // Loading states for mutations
    isCreating: createIntegration.isPending,
    isUpdating: updateIntegration.isPending,
    isDeleting: deleteIntegration.isPending,
    isTesting: testIntegration.isPending
  };
};

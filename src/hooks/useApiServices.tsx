
import { useOptimizedQuery } from './useOptimizedQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from './useErrorHandler';

export const useApiServices = () => {
  const { toast } = useToast();
  const { handleError } = useErrorHandler({ component: 'ApiServices' });
  const queryClient = useQueryClient();

  // Use optimized query with caching and error handling
  const {
    data: integrations,
    isLoading,
    error,
    refetch
  } = useOptimizedQuery({
    queryKey: ['api-integration-registry'],
    queryFn: async () => {
      console.log('🔍 Fetching API integrations...');
      
      const { data, error } = await supabase
        .from('api_integration_registry')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching API integrations:', error);
        throw error;
      }

      console.log('✅ API integrations fetched:', data?.length || 0);
      return data || [];
    },
    cacheTime: 300000, // 5 minutes cache
    staleWhileRevalidate: true,
    component: 'ApiServices'
  });

  const createMutation = useMutation({
    mutationFn: async (newIntegration: any) => {
      console.log('🔄 Creating new API integration:', newIntegration);
      
      const { data, error } = await supabase
        .from('api_integration_registry')
        .insert(newIntegration)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating API integration:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-integration-registry'] });
      toast({
        title: "Integration Created",
        description: "API integration has been created successfully.",
      });
    },
    onError: (error: any) => {
      handleError(error, { operation: 'create-integration' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      console.log('🔄 Updating API integration:', id, updates);
      
      const { data, error } = await supabase
        .from('api_integration_registry')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating API integration:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-integration-registry'] });
      toast({
        title: "Integration Updated",
        description: "API integration has been updated successfully.",
      });
    },
    onError: (error: any) => {
      handleError(error, { operation: 'update-integration' });
    }
  });

  // Add missing methods for compatibility
  const getApiStats = () => {
    const apis = integrations || [];
    return {
      totalIntegrations: apis.length,
      internalApis: apis.filter((api: any) => api.type === 'internal').length,
      externalApis: apis.filter((api: any) => api.type === 'external').length,
      publishedApis: apis.filter((api: any) => api.status === 'published').length
    };
  };

  const searchApis = (searchTerm: string) => {
    if (!searchTerm.trim()) return integrations || [];
    const term = searchTerm.toLowerCase();
    return (integrations || []).filter((api: any) => 
      api.name?.toLowerCase().includes(term) ||
      api.description?.toLowerCase().includes(term) ||
      api.category?.toLowerCase().includes(term)
    );
  };

  // Provide backward compatibility with expected property names
  const apiServices = integrations || [];
  const internalApis = apiServices.filter((api: any) => api.type === 'internal');
  const externalApis = apiServices.filter((api: any) => api.type === 'external');

  return {
    // New consolidated properties
    integrations,
    isLoading,
    error,
    refetch,
    createIntegration: createMutation.mutate,
    updateIntegration: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    
    // Required methods
    getApiStats,
    searchApis,
    
    // Backward compatibility properties
    apiServices,
    internalApis,
    externalApis,
    createApiService: createMutation.mutate,
    isCreatingApiService: createMutation.isPending
  };
};

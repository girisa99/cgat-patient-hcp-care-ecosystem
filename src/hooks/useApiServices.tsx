
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useApiServices = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Simplified query without useOptimizedQuery dependency
  const {
    data: integrations,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['api-integration-registry'],
    queryFn: async () => {
      console.log('🔍 Fetching API integrations...');
      
      try {
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
      } catch (err) {
        console.error('💥 Exception fetching API integrations:', err);
        throw err;
      }
    },
    retry: 1,
    staleTime: 300000, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: async (newIntegration: any) => {
      console.log('🔄 Creating new API integration:', newIntegration);
      
      const { data, error } = await supabase
        .from('api_integration_registry')
        .insert({
          ...newIntegration,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
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
      console.error('❌ Create integration error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create integration",
        variant: "destructive",
      });
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
      console.error('❌ Update integration error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update integration",
        variant: "destructive",
      });
    }
  });

  // Statistics calculation
  const getApiStats = () => {
    const apis = integrations || [];
    return {
      totalIntegrations: apis.length,
      internalApis: apis.filter((api: any) => api.type === 'internal').length,
      externalApis: apis.filter((api: any) => api.type === 'external').length,
      publishedApis: apis.filter((api: any) => api.status === 'published').length
    };
  };

  // Search functionality
  const searchApis = (searchTerm: string) => {
    if (!searchTerm.trim()) return integrations || [];
    const term = searchTerm.toLowerCase();
    return (integrations || []).filter((api: any) => 
      api.name?.toLowerCase().includes(term) ||
      api.description?.toLowerCase().includes(term) ||
      api.category?.toLowerCase().includes(term)
    );
  };

  // Backward compatibility properties
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

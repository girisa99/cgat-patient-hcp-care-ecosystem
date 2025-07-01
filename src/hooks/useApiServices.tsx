
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Consolidated API Services Hook - Single Source of Truth
 * Combines all API service functionality into one unified hook
 */
export const useApiServices = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Main query for API services data
  const { data: apiServices, isLoading, error, refetch } = useQuery({
    queryKey: ['api-services'],
    queryFn: async () => {
      console.log('🔍 Fetching API services from consolidated source...');
      
      const { data, error } = await supabase
        .from('api_integration_registry')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching API services:', error);
        throw error;
      }

      console.log('✅ API services fetched successfully:', data?.length || 0);
      return data || [];
    },
    retry: 2,
    staleTime: 30000,
    meta: {
      description: 'Fetches all API integration services',
      dataSource: 'api_integration_registry table via direct query'
    }
  });

  // Create API service mutation
  const createApiServiceMutation = useMutation({
    mutationFn: async (serviceData: {
      name: string;
      description?: string;
      base_url?: string;
      category: string;
      type: string;
      direction: string;
      purpose: string;
    }) => {
      const { data, error } = await supabase
        .from('api_integration_registry')
        .insert({
          ...serviceData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-services'] });
      toast({
        title: "API Service Created",
        description: "New API service has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create API service",
        variant: "destructive",
      });
    }
  });

  // Update API service mutation
  const updateApiServiceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
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
      queryClient.invalidateQueries({ queryKey: ['api-services'] });
      toast({
        title: "API Service Updated",
        description: "API service has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update API service",
        variant: "destructive",
      });
    }
  });

  // Helper functions
  const getApiServiceStats = () => {
    const stats = {
      total: apiServices?.length || 0,
      active: apiServices?.filter(s => s.status === 'active').length || 0,
      inactive: apiServices?.filter(s => s.status !== 'active').length || 0,
      internal: apiServices?.filter(s => s.direction === 'internal').length || 0,
      external: apiServices?.filter(s => s.direction === 'external').length || 0,
      consuming: apiServices?.filter(s => s.direction === 'consuming').length || 0,
      typeBreakdown: apiServices?.reduce((acc, service) => {
        const type = service.type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {}
    };
    return stats;
  };

  const searchApiServices = (query: string) => {
    if (!query.trim()) return apiServices || [];
    
    return (apiServices || []).filter((service: any) => 
      service.name?.toLowerCase().includes(query.toLowerCase()) ||
      service.description?.toLowerCase().includes(query.toLowerCase()) ||
      service.category?.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Categorize API services
  const internalApis = apiServices?.filter(s => s.direction === 'internal') || [];
  const externalApis = apiServices?.filter(s => s.direction === 'external' || s.direction === 'consuming') || [];

  return {
    // Data
    apiServices: apiServices || [],
    internalApis,
    externalApis,
    
    // State
    isLoading,
    error,
    refetch,
    
    // Actions
    createApiService: createApiServiceMutation.mutate,
    updateApiService: updateApiServiceMutation.mutate,
    isCreatingApiService: createApiServiceMutation.isPending,
    isUpdatingApiService: updateApiServiceMutation.isPending,
    
    // Utilities
    getApiServiceStats,
    searchApiServices,
    
    // Meta information
    meta: {
      totalServices: apiServices?.length || 0,
      dataSource: 'api_integration_registry table via direct query',
      lastFetch: new Date().toISOString(),
      version: 'consolidated-v1'
    }
  };
};

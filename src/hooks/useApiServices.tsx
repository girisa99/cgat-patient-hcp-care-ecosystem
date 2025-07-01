
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Consolidated API Services Hook - Single Source of Truth
 * Uses real data from api_integration_registry table
 */
export const useApiServices = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Main query for API services data from real database
  const { data: apiServices, isLoading, error, refetch } = useQuery({
    queryKey: ['api-services'],
    queryFn: async () => {
      console.log('🔍 Fetching API services from api_integration_registry...');
      
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
      dataSource: 'api_integration_registry table'
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

  // Delete API service mutation
  const deleteApiServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('api_integration_registry')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-services'] });
      toast({
        title: "API Service Deleted",
        description: "API service has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete API service",
        variant: "destructive",
      });
    }
  });

  // Helper functions using real data
  const getApiServiceStats = () => {
    const stats = {
      total: apiServices?.length || 0,
      active: apiServices?.filter(s => s.status === 'active').length || 0,
      inactive: apiServices?.filter(s => s.status !== 'active').length || 0,
      internal: apiServices?.filter(s => s.direction === 'inbound').length || 0,
      external: apiServices?.filter(s => s.direction === 'outbound').length || 0,
      consuming: apiServices?.filter(s => s.direction === 'bidirectional').length || 0,
      typeBreakdown: apiServices?.reduce((acc, service) => {
        const type = service.type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      categoryBreakdown: apiServices?.reduce((acc, service) => {
        const category = service.category || 'uncategorized';
        acc[category] = (acc[category] || 0) + 1;
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
      service.category?.toLowerCase().includes(query.toLowerCase()) ||
      service.purpose?.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Filter APIs by type and direction using real data
  const internalApis = apiServices?.filter(s => 
    s.type === 'internal' || s.direction === 'inbound'
  ) || [];
  
  const externalApis = apiServices?.filter(s => 
    s.type === 'external' || s.direction === 'outbound' || s.direction === 'bidirectional'
  ) || [];

  const consumingApis = apiServices?.filter(s => 
    s.direction === 'bidirectional' || s.purpose?.includes('consuming')
  ) || [];

  const publishingApis = apiServices?.filter(s => 
    s.lifecycle_stage === 'production' && s.status === 'active'
  ) || [];

  return {
    // Data from real database
    apiServices: apiServices || [],
    internalApis,
    externalApis,
    consumingApis,
    publishingApis,
    
    // State
    isLoading,
    error,
    refetch,
    
    // Actions using real mutations
    createApiService: createApiServiceMutation.mutate,
    updateApiService: updateApiServiceMutation.mutate,
    deleteApiService: deleteApiServiceMutation.mutate,
    isCreatingApiService: createApiServiceMutation.isPending,
    isUpdatingApiService: updateApiServiceMutation.isPending,
    isDeletingApiService: deleteApiServiceMutation.isPending,
    
    // Utilities using real data
    getApiServiceStats,
    searchApiServices,
    
    // Meta information
    meta: {
      totalServices: apiServices?.length || 0,
      dataSource: 'api_integration_registry table - real data',
      lastFetch: new Date().toISOString(),
      version: 'consolidated-v2-real-data'
    }
  };
};

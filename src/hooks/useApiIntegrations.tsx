
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useApiServices } from './useApiServices';

/**
 * API Integrations Hook - Consolidated wrapper around useApiServices
 * Maintains backward compatibility while ensuring single source of truth
 */
export const useApiIntegrations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Use consolidated API services hook as single source of truth
  const { 
    apiServices, 
    internalApis, 
    externalApis,
    isLoading
  } = useApiServices();

  console.log('🔍 useApiIntegrations - Delegating to consolidated useApiServices hook');

  // Get API endpoints for external APIs
  const { data: apiEndpoints, isLoading: isLoadingEndpoints } = useQuery({
    queryKey: ['external-api-endpoints'],
    queryFn: async () => {
      console.log('🔍 Fetching API endpoints...');
      
      const { data, error } = await supabase
        .from('external_api_endpoints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching API endpoints:', error);
        throw error;
      }

      console.log('✅ API endpoints fetched:', data?.length || 0);
      return data || [];
    },
    staleTime: 30000
  });

  // Download Postman collection mutation
  const downloadPostmanCollectionMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      // Find the integration from consolidated data
      const integration = apiServices?.find(api => api.id === integrationId);
      
      if (!integration) {
        throw new Error('API integration not found');
      }

      // Generate Postman collection
      const collection = {
        info: {
          name: integration.name,
          description: integration.description || 'API Collection',
          schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
          version: integration.version || '1.0.0'
        },
        item: apiEndpoints
          ?.filter(endpoint => endpoint.external_api_id === integrationId)
          ?.map(endpoint => ({
            name: endpoint.summary || endpoint.external_path,
            request: {
              method: endpoint.method?.toUpperCase() || 'GET',
              header: [
                {
                  key: 'Content-Type',
                  value: 'application/json'
                },
                ...(endpoint.requires_authentication ? [{
                  key: 'Authorization',
                  value: 'Bearer {{api_key}}'
                }] : [])
              ],
              url: {
                raw: `${integration.base_url || '{{base_url}}'}${endpoint.external_path}`,
                host: ['{{base_url}}'],
                path: endpoint.external_path?.split('/').filter(Boolean) || []
              },
              description: endpoint.description || ''
            }
          })) || []
      };

      return collection;
    },
    onSuccess: (collection, integrationId) => {
      // Download the collection
      const blob = new Blob([JSON.stringify(collection, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collection.info.name}-postman-collection.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Collection Downloaded",
        description: "Postman collection has been downloaded successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download Postman collection",
        variant: "destructive",
      });
    }
  });

  // Test endpoint mutation
  const testEndpointMutation = useMutation({
    mutationFn: async ({ integrationId, endpointId }: { integrationId: string; endpointId?: string }) => {
      const integration = apiServices?.find(api => api.id === integrationId);
      
      if (!integration) {
        throw new Error('API integration not found');
      }

      let testUrl = integration.base_url || `${window.location.origin}/api/v1/${integrationId}`;
      
      if (endpointId) {
        const endpoint = apiEndpoints?.find(ep => ep.id === endpointId);
        if (endpoint) {
          testUrl += endpoint.external_path;
        }
      }

      console.log('🧪 Testing endpoint:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        status: response.status,
        statusText: response.statusText,
        url: testUrl,
        timestamp: new Date().toISOString()
      };
    },
    onSuccess: (result) => {
      toast({
        title: "Endpoint Test Completed",
        description: `Status: ${result.status} ${result.statusText}`,
        variant: result.status >= 200 && result.status < 300 ? "default" : "destructive"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Test Failed",
        description: error.message || "Failed to test endpoint",
        variant: "destructive",
      });
    }
  });

  // Return consolidated data using single source of truth
  return {
    // Data - Using consolidated useApiServices as single source
    integrations: apiServices || [],
    internalApis: internalApis || [],
    externalApis: externalApis || [],
    apiEndpoints: apiEndpoints || [],
    
    // Loading states
    isLoading: isLoading || isLoadingEndpoints,
    
    // Actions
    downloadPostmanCollection: downloadPostmanCollectionMutation.mutate,
    testEndpoint: testEndpointMutation.mutate,
    isDownloading: downloadPostmanCollectionMutation.isPending,
    isTesting: testEndpointMutation.isPending,
    
    // Meta - Enhanced with single source validation
    meta: {
      endpointsCount: apiEndpoints?.length || 0,
      singleSourceValidated: true,
      consolidatedHook: 'useApiServices',
      architecture: 'single-source-of-truth'
    }
  };
};

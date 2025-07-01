
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useApiServices } from './useApiServices';

/**
 * API Integrations Hook - Works with External API Registry
 * Connects to external_api_registry table for published APIs
 */
export const useApiIntegrations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get base API services data
  const { 
    apiServices: internalApiServices, 
    internalApis, 
    externalApis: baseExternalApis,
    isLoading: isLoadingBase 
  } = useApiServices();

  // Get external API registry data (published APIs)
  const { data: externalApiRegistry, isLoading: isLoadingExternal } = useQuery({
    queryKey: ['external-api-registry'],
    queryFn: async () => {
      console.log('🔍 Fetching external API registry...');
      
      const { data, error } = await supabase
        .from('external_api_registry')
        .select(`
          *,
          external_api_endpoints (
            id,
            external_path,
            method,
            summary,
            description,
            is_public,
            requires_authentication
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching external API registry:', error);
        throw error;
      }

      console.log('✅ External API registry fetched:', data?.length || 0);
      return data || [];
    },
    staleTime: 30000
  });

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
      // Find the integration
      const integration = [...(internalApiServices || []), ...(externalApiRegistry || [])]
        .find(api => api.id === integrationId);
      
      if (!integration) {
        throw new Error('API integration not found');
      }

      // Safely get the name based on the integration source
      const integrationName = integration.source === 'external' 
        ? (integration as any).external_name || (integration as any).name
        : (integration as any).name || 'API Service';

      const integrationDescription = integration.source === 'external'
        ? (integration as any).external_description || 'API Collection'
        : (integration as any).description || 'API Collection';

      // Generate Postman collection
      const collection = {
        info: {
          name: integrationName,
          description: integrationDescription,
          schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
          version: (integration as any).version || '1.0.0'
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
                raw: `${(integration as any).base_url || '{{base_url}}'}${endpoint.external_path}`,
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
      const integration = [...(internalApiServices || []), ...(externalApiRegistry || [])]
        .find(api => api.id === integrationId);
      
      if (!integration) {
        throw new Error('API integration not found');
      }

      let testUrl = (integration as any).base_url || `${window.location.origin}/api/v1/${integrationId}`;
      
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

  // Combine all integrations
  const allIntegrations = [
    ...(internalApiServices || []).map(api => ({ ...api, source: 'internal' })),
    ...(externalApiRegistry || []).map(api => ({ ...api, source: 'external' }))
  ];

  return {
    // Data - Real from database
    integrations: allIntegrations,
    internalApis: internalApis || [],
    externalApis: externalApiRegistry || [],
    apiEndpoints: apiEndpoints || [],
    
    // Loading states
    isLoading: isLoadingBase || isLoadingExternal || isLoadingEndpoints,
    
    // Actions
    downloadPostmanCollection: downloadPostmanCollectionMutation.mutate,
    testEndpoint: testEndpointMutation.mutate,
    isDownloading: downloadPostmanCollectionMutation.isPending,
    isTesting: testEndpointMutation.isPending,
    
    // Meta
    meta: {
      totalIntegrations: allIntegrations.length,
      internalCount: internalApis?.length || 0,
      externalCount: externalApiRegistry?.length || 0,
      endpointsCount: apiEndpoints?.length || 0,
      dataSource: 'api_integration_registry + external_api_registry tables',
      version: 'real-data-v1'
    }
  };
};

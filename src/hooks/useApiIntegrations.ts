
import { useQuery } from '@tanstack/react-query';
import { InternalApiDetector } from '@/utils/api/InternalApiDetector';
import { ApiIntegration } from '@/utils/api/ApiIntegrationTypes';

export const useApiIntegrations = () => {
  const { data: integrations, isLoading, error } = useQuery({
    queryKey: ['api-integrations'],
    queryFn: async (): Promise<ApiIntegration[]> => {
      console.log('🔍 Loading API integrations with refined detection...');
      
      // Generate the refined internal API integration
      const internalIntegration = InternalApiDetector.generateMockInternalIntegration();
      
      console.log('✅ Generated refined internal API integration:', {
        name: internalIntegration.name,
        endpoints: internalIntegration.endpoints.length,
        schemas: Object.keys(internalIntegration.schemas).length,
        rlsPolicies: internalIntegration.rlsPolicies.length
      });
      
      const integrations: ApiIntegration[] = [internalIntegration];
      
      console.log('📊 Final integrations summary:', {
        total: integrations.length,
        internal: integrations.filter(i => i.type === 'internal').length,
        external: integrations.filter(i => i.type === 'external').length,
        integrations: integrations.map(i => ({
          id: i.id,
          name: i.name,
          type: i.type,
          endpoints: i.endpoints.length,
          rlsPolicies: i.rlsPolicies.length,
          mappings: i.mappings.length
        }))
      });
      
      return integrations;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Derive internal and external APIs from integrations
  const internalApis = integrations?.filter(integration => integration.type === 'internal') || [];
  const externalApis = integrations?.filter(integration => integration.type === 'external') || [];

  // Mock function for registerIntegration
  const registerIntegration = async (integration: Omit<ApiIntegration, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('Mock: Registering integration', integration);
    // This would normally call an API
    return { ...integration, id: 'mock-id', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  };

  // Mock function for downloading Postman collection
  const downloadPostmanCollection = (integrationId: string) => {
    console.log('Mock: Downloading Postman collection for integration:', integrationId);
    // This would normally generate and download a Postman collection
  };

  // Mock function for testing endpoint
  const testEndpoint = async (integrationId: string, endpointId: string) => {
    console.log('Mock: Testing endpoint:', { integrationId, endpointId });
    // This would normally test the endpoint and return results
    return { success: true, message: 'Endpoint test completed' };
  };

  return {
    integrations,
    internalApis,
    externalApis,
    isLoading,
    error,
    registerIntegration,
    isRegistering: false,
    downloadPostmanCollection,
    testEndpoint
  };
};

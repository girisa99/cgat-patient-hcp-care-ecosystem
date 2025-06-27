/**
 * Enhanced hook for managing API integrations with real data detection
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiIntegrationManager } from '@/utils/api/ApiIntegrationManager';
import { ApiIntegration } from '@/utils/api/ApiIntegrationTypes';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Create an instance of the manager
const apiIntegrationManager = new ApiIntegrationManager();

export const useApiIntegrations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  const {
    data: integrations,
    isLoading,
    error
  } = useQuery({
    queryKey: ['api-integrations'],
    queryFn: async () => {
      console.log('Fetching real API integrations...');
      const realIntegrations = await apiIntegrationManager.getIntegrations();
      console.log('Loaded integrations:', realIntegrations);
      return realIntegrations;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 2
  });

  const {
    data: integrationStats
  } = useQuery({
    queryKey: ['api-integration-stats'],
    queryFn: async () => {
      console.log('Fetching integration statistics...');
      const stats = await apiIntegrationManager.getIntegrationStats();
      console.log('Integration stats:', stats);
      return stats;
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
    enabled: !!integrations
  });

  const registerIntegrationMutation = useMutation({
    mutationFn: async (config: Omit<ApiIntegration, 'id' | 'createdAt' | 'updatedAt'>) => {
      console.log('Registering new integration:', config);
      return await apiIntegrationManager.registerIntegration(config);
    },
    onSuccess: (integration) => {
      queryClient.invalidateQueries({ queryKey: ['api-integrations'] });
      queryClient.invalidateQueries({ queryKey: ['api-integration-stats'] });
      toast({
        title: "Integration Registered",
        description: `${integration.name} has been successfully registered with ${integration.endpoints.length} endpoints, ${integration.rlsPolicies.length} RLS policies, and ${integration.mappings.length} data mappings.`,
      });
    },
    onError: (error: any) => {
      console.error('Integration registration failed:', error);
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const executeIntegrationMutation = useMutation({
    mutationFn: async ({ integrationId, operation, data }: {
      integrationId: string;
      operation: 'sync' | 'webhook' | 'manual';
      data?: any;
    }) => {
      console.log('Executing integration:', { integrationId, operation, data });
      return await apiIntegrationManager.executeIntegration(integrationId, operation, data);
    },
    onSuccess: (result) => {
      console.log('Integration execution successful:', result);
      toast({
        title: "Integration Executed",
        description: `API integration completed successfully. Processed ${Object.keys(result.data || {}).length} data fields.`,
      });
    },
    onError: (error: any) => {
      console.error('Integration execution failed:', error);
      toast({
        title: "Integration Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const testEndpoint = async (integrationId: string, endpointId: string) => {
    try {
      console.log('Testing endpoint:', { integrationId, endpointId });
      
      const integration = integrations?.find(i => i.id === integrationId);
      const endpoint = integration?.endpoints.find(e => e.id === endpointId);
      
      if (!integration || !endpoint) {
        throw new Error('Integration or endpoint not found');
      }

      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      let headers = { ...endpoint.headers };
      if (session?.access_token && !endpoint.isPublic) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const url = endpoint.fullUrl || `${integration.baseUrl}${endpoint.url}`;
      
      console.log('Making test request to:', url);
      
      const response = await fetch(url, {
        method: endpoint.method,
        headers
      });

      const result = {
        status: response.status,
        statusText: response.statusText,
        data: await response.json().catch(() => null),
        timestamp: new Date().toISOString()
      };

      console.log('Test result:', result);

      toast({
        title: "Endpoint Test",
        description: `${endpoint.method} ${endpoint.name} - ${response.status}`,
        variant: response.ok ? "default" : "destructive"
      });

      return result;
    } catch (error: any) {
      console.error('Endpoint test failed:', error);
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const downloadPostmanCollection = async (integrationId: string) => {
    try {
      console.log('Downloading Postman collection for:', integrationId);
      const collectionJson = await apiIntegrationManager.exportPostmanCollection(integrationId);
      const integration = integrations?.find(i => i.id === integrationId);
      
      const blob = new Blob([collectionJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${integration?.name || 'API'}_Postman_Collection.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Collection Downloaded",
        description: `Postman collection for ${integration?.name} has been downloaded with ${integration?.endpoints.length} endpoints.`,
      });
    } catch (error: any) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getIntegrationsByType = (type: 'internal' | 'external') => {
    return integrations?.filter(integration => integration.type === type) || [];
  };

  const exportApiDocumentation = async () => {
    try {
      console.log('Exporting complete API documentation...');
      const docs = await apiIntegrationManager.exportApiDocumentation();
      const blob = new Blob([JSON.stringify(docs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'complete-api-documentation.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Documentation Exported",
        description: `Complete API documentation exported with ${docs.metadata.total_endpoints} endpoints, ${docs.metadata.total_rls_policies} RLS policies, and ${docs.metadata.total_data_mappings} data mappings.`,
      });
    } catch (error: any) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Log current state for debugging
  React.useEffect(() => {
    if (integrations) {
      console.log('Current integrations state:', {
        total: integrations.length,
        internal: getIntegrationsByType('internal').length,
        external: getIntegrationsByType('external').length,
        integrations: integrations.map(i => ({
          id: i.id,
          name: i.name,
          type: i.type,
          endpoints: i.endpoints.length,
          rlsPolicies: i.rlsPolicies.length,
          mappings: i.mappings.length
        }))
      });
    }
  }, [integrations]);

  return {
    integrations,
    integrationStats,
    isLoading,
    error,
    selectedIntegration,
    setSelectedIntegration,
    registerIntegration: registerIntegrationMutation.mutate,
    isRegistering: registerIntegrationMutation.isPending,
    executeIntegration: executeIntegrationMutation.mutate,
    isExecuting: executeIntegrationMutation.isPending,
    testEndpoint,
    downloadPostmanCollection,
    getIntegrationsByType,
    exportApiDocumentation,
    internalApis: getIntegrationsByType('internal'),
    externalApis: getIntegrationsByType('external')
  };
};

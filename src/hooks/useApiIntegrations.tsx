
/**
 * Enhanced hook for managing API integrations with real data detection
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiIntegrationManager } from '@/utils/api/ApiIntegrationManager';
import { ApiIntegration } from '@/utils/api/ApiIntegrationTypes';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      try {
        const realIntegrations = await ApiIntegrationManager.initializeIntegrations();
        return realIntegrations;
      } catch (error) {
        throw error;
      }
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
      const stats = ApiIntegrationManager.getIntegrationStats();
      return stats;
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
    enabled: !!integrations
  });

  const registerIntegrationMutation = useMutation({
    mutationFn: async (config: Omit<ApiIntegration, 'id' | 'createdAt' | 'updatedAt'>) => {
      return await ApiIntegrationManager.registerIntegration(config);
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
      return await ApiIntegrationManager.executeIntegration(integrationId, operation, data);
    },
    onSuccess: (result) => {
      toast({
        title: "Integration Executed",
        description: `API integration completed successfully. Processed ${Object.keys(result.data || {}).length} data fields.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Integration Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const testEndpoint = async (integrationId: string, endpointId: string) => {
    try {
      const integration = integrations?.find(i => i.id === integrationId);
      const endpoint = integration?.endpoints.find(e => e.id === endpointId);
      
      if (!integration || !endpoint) {
        throw new Error('Integration or endpoint not found');
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      let headers = { ...endpoint.headers };
      if (session?.access_token && !endpoint.isPublic) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const url = endpoint.fullUrl || `${integration.baseUrl}${endpoint.url}`;
      
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

      toast({
        title: "Endpoint Test",
        description: `${endpoint.method} ${endpoint.name} - ${response.status}`,
        variant: response.ok ? "default" : "destructive"
      });

      return result;
    } catch (error: any) {
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
      const collectionJson = await ApiIntegrationManager.exportPostmanCollection(integrationId);
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
      const docs = await ApiIntegrationManager.exportApiDocumentation();
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
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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

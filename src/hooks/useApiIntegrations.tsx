
/**
 * Enhanced hook for managing API integrations with internal/external differentiation
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiIntegrationManager } from '@/utils/api/ApiIntegrationManager';
import { ApiIntegration } from '@/utils/api/ApiIntegrationTypes';
import { useToast } from '@/hooks/use-toast';

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
    queryFn: () => apiIntegrationManager.getIntegrations(),
    staleTime: 30000
  });

  const {
    data: integrationStats
  } = useQuery({
    queryKey: ['api-integration-stats'],
    queryFn: () => apiIntegrationManager.getIntegrationStats(),
    staleTime: 60000
  });

  const registerIntegrationMutation = useMutation({
    mutationFn: (config: Omit<ApiIntegration, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiIntegrationManager.registerIntegration(config),
    onSuccess: (integration) => {
      queryClient.invalidateQueries({ queryKey: ['api-integrations'] });
      queryClient.invalidateQueries({ queryKey: ['api-integration-stats'] });
      toast({
        title: "Integration Registered",
        description: `${integration.name} has been successfully registered with auto-generated schemas and Postman collection.`,
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
    mutationFn: ({ integrationId, operation, data }: {
      integrationId: string;
      operation: 'sync' | 'webhook' | 'manual';
      data?: any;
    }) => apiIntegrationManager.executeIntegration(integrationId, operation, data),
    onSuccess: (result) => {
      toast({
        title: "Integration Executed",
        description: `API integration completed successfully. Processed ${Object.keys(result.data).length} data fields.`,
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

  const downloadPostmanCollection = (integrationId: string) => {
    try {
      const collectionJson = apiIntegrationManager.exportPostmanCollection(integrationId);
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
        description: `Postman collection for ${integration?.name} has been downloaded successfully.`,
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

  const exportApiDocumentation = () => {
    try {
      const docs = apiIntegrationManager.exportApiDocumentation();
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
        description: "Complete API documentation has been exported successfully.",
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
    downloadPostmanCollection,
    getIntegrationsByType,
    exportApiDocumentation,
    internalApis: getIntegrationsByType('internal'),
    externalApis: getIntegrationsByType('external')
  };
};

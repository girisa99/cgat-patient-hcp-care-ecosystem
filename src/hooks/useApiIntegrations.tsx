
/**
 * Hook for managing API integrations
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiIntegrationManager, ApiIntegration, PostmanCollection } from '@/utils/api/ApiIntegrationManager';
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

  const registerIntegrationMutation = useMutation({
    mutationFn: (config: Omit<ApiIntegration, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiIntegrationManager.registerIntegration(config),
    onSuccess: (integration) => {
      queryClient.invalidateQueries({ queryKey: ['api-integrations'] });
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
    onSuccess: () => {
      toast({
        title: "Integration Executed",
        description: "API integration completed successfully.",
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
        description: "Postman collection has been downloaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    integrations,
    isLoading,
    error,
    selectedIntegration,
    setSelectedIntegration,
    registerIntegration: registerIntegrationMutation.mutate,
    isRegistering: registerIntegrationMutation.isPending,
    executeIntegration: executeIntegrationMutation.mutate,
    isExecuting: executeIntegrationMutation.isPending,
    downloadPostmanCollection
  };
};

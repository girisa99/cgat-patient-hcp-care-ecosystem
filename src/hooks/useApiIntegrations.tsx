
import { useState, useCallback } from 'react';
import { useMasterToast } from './useMasterToast';
import type { ApiIntegrationState } from '@/types/formState';

export const useApiIntegrations = () => {
  const { showSuccess, showError } = useMasterToast();
  
  const [integrationData, setIntegrationData] = useState<ApiIntegrationState>({
    integrationName: '',
    apiUrl: '',
    authMethod: 'api_key',
    headers: '',
    timeout: '30'
  });

  const [isConfiguring, setIsConfiguring] = useState<boolean>(false);

  const updateIntegrationField = useCallback((field: keyof ApiIntegrationState, value: string) => {
    setIntegrationData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const configureIntegration = useCallback(async () => {
    setIsConfiguring(true);
    try {
      // Mock integration configuration
      await new Promise(resolve => setTimeout(resolve, 1500));
      showSuccess('Integration Configured', `Successfully configured ${integrationData.integrationName}`);
    } catch (error) {
      showError('Configuration Failed', 'Failed to configure API integration');
    } finally {
      setIsConfiguring(false);
    }
  }, [integrationData, showSuccess, showError]);

  return {
    integrationData,
    isConfiguring,
    updateIntegrationField,
    configureIntegration,
    meta: {
      hookVersion: 'api-integrations-v1.0.0',
      typeScriptAligned: true
    }
  };
};

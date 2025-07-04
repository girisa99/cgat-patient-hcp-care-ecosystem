
/**
 * API INTEGRATIONS HOOK - FIXED INTERFACES
 * Uses proper ApiIntegrationState interface
 */
import { useState } from 'react';
import { ApiIntegrationState } from '@/types/formState';
import { useMasterToast } from './useMasterToast';

export const useApiIntegrations = () => {
  const [integration, setIntegration] = useState<ApiIntegrationState>({
    name: '',
    status: 'active',
    endpoint: '',
    isActive: true,
    integrationId: '',
    apiName: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useMasterToast();

  const createIntegration = async (data: Partial<ApiIntegrationState>) => {
    setIsLoading(true);
    try {
      setIntegration(prev => ({
        ...prev,
        ...data,
        apiName: data.name || prev.apiName
      }));
      showSuccess('Integration created successfully');
    } catch (error) {
      showError('Failed to create integration');
    } finally {
      setIsLoading(false);
    }
  };

  const updateIntegration = (updates: Partial<ApiIntegrationState>) => {
    setIntegration(prev => ({
      ...prev,
      ...updates
    }));
  };

  return {
    integration,
    setIntegration,
    createIntegration,
    updateIntegration,
    isLoading
  };
};


/**
 * API INTEGRATIONS HOOK - FIXED FORM STATE ALIGNMENT
 * Version: api-integrations-v2.0.0 - Fixed property names
 */
import { useState } from 'react';
import type { ApiIntegrationState } from '@/types/formState';

export const useApiIntegrations = () => {
  const [integrationState, setIntegrationState] = useState<ApiIntegrationState>({
    integrationId: '',
    apiName: '',
    status: 'inactive',
    configuration: {},
    lastSync: undefined
  });

  const updateIntegrationState = (updates: Partial<ApiIntegrationState>) => {
    setIntegrationState(prev => ({
      ...prev,
      ...updates
    }));
  };

  const getIntegrationName = () => integrationState.apiName;

  return {
    integrationState,
    setIntegrationState,
    updateIntegrationState,
    getIntegrationName,
    
    meta: {
      version: 'api-integrations-v2.0.0',
      propertyNamesFixed: true
    }
  };
};

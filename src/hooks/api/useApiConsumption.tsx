
/**
 * API CONSUMPTION HOOK - FIXED FORM STATE ALIGNMENT
 * Version: api-consumption-v2.0.0 - Added missing headers property
 */
import { useState } from 'react';
import type { ApiFormState } from '@/types/formState';

export const useApiConsumption = () => {
  const [consumptionForm, setConsumptionForm] = useState<ApiFormState>({
    name: '',
    description: '',
    baseUrl: '',
    apiKey: '',
    isActive: true,
    endpoint: '',
    method: 'GET',
    headers: {} // ADDED - Missing property causing build errors
  });

  const updateConsumptionForm = (updates: Partial<ApiFormState>) => {
    setConsumptionForm(prev => ({
      ...prev,
      ...updates,
      headers: {
        ...prev.headers,
        ...updates.headers
      }
    }));
  };

  const resetForm = () => {
    setConsumptionForm({
      name: '',
      description: '',
      baseUrl: '',
      apiKey: '',
      isActive: true,
      endpoint: '',
      method: 'GET',
      headers: {}
    });
  };

  return {
    consumptionForm,
    setConsumptionForm,
    updateConsumptionForm,
    resetForm,
    
    meta: {
      version: 'api-consumption-v2.0.0',
      headersPropertyAdded: true,
      formStateFixed: true
    }
  };
};

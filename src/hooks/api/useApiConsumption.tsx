
/**
 * API CONSUMPTION HOOK - FIXED INTERFACES
 * Uses proper ApiFormState interface
 */
import { useState } from 'react';
import { ApiFormState } from '@/types/formState';
import { useMasterToast } from '../useMasterToast';

export const useApiConsumption = () => {
  const [formState, setFormState] = useState<ApiFormState>({
    name: '',
    description: '',
    status: 'active',
    isActive: true,
    baseUrl: '',
    headers: {}
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useMasterToast();

  const updateFormState = (updates: Partial<ApiFormState>) => {
    setFormState(prev => ({
      ...prev,
      ...updates,
      headers: { ...prev.headers, ...updates.headers }
    }));
  };

  const consumeApi = async () => {
    setIsLoading(true);
    try {
      // API consumption logic here
      showSuccess('API consumed successfully');
      setFormState({
        name: '',
        description: '',
        status: 'active',
        isActive: true,
        baseUrl: '',
        headers: {}
      });
    } catch (error) {
      showError('Failed to consume API');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formState,
    updateFormState,
    consumeApi,
    isLoading
  };
};

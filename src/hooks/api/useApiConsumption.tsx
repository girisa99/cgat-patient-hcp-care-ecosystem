import React, { useState, useCallback } from 'react';
import { useMasterToast } from '../useMasterToast';
import type { ApiFormState } from '@/types/formState';

export const useApiConsumption = () => {
  const toast = useMasterToast();
  
  const [formData, setFormData] = useState<ApiFormState>({
    name: '',
    description: '',
    endpoint: '',
    method: 'GET',
    headers: ''
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateFormField = useCallback((field: keyof ApiFormState, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleConsumption = useCallback(async () => {
    setIsLoading(true);
    try {
      // API consumption logic here
      toast.showSuccess('API Consumption', 'Successfully consumed API endpoint');
    } catch (error) {
      toast.showError('API Consumption Error', 'Failed to consume API endpoint');
    } finally {
      setIsLoading(false);
    }
  }, [formData, toast]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      endpoint: '',
      method: 'GET',
      headers: ''
    });
  }, []);

  return {
    formData,
    isLoading,
    updateFormField,
    handleConsumption,
    resetForm,
    meta: {
      hookVersion: 'api-consumption-v1.0.0',
      typeScriptAligned: true
    }
  };
};

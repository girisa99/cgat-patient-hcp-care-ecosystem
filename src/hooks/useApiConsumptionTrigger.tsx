
import { useState, useCallback } from 'react';
import { useMasterToast } from './useMasterToast';
import type { ApiConsumptionTriggerState } from '@/types/formState';

export const useApiConsumptionTrigger = () => {
  const { showSuccess, showError } = useMasterToast();
  
  const [triggerData, setTriggerData] = useState<ApiConsumptionTriggerState>({
    apiName: '',
    triggerType: '',
    endpoint: '',
    method: 'GET',
    payload: ''
  });

  const [automationData, setAutomationData] = useState<ApiConsumptionTriggerState>({
    apiName: '',
    triggerType: 'scheduled',
    endpoint: '',
    method: 'POST',
    payload: ''
  });

  const [isTriggering, setIsTriggering] = useState<boolean>(false);

  const updateTriggerField = useCallback((field: keyof ApiConsumptionTriggerState, value: string) => {
    setTriggerData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const updateAutomationField = useCallback((field: keyof ApiConsumptionTriggerState, value: string) => {
    setAutomationData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const executeTrigger = useCallback(async () => {
    setIsTriggering(true);
    try {
      // Mock API trigger execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('API Trigger Executed', `Successfully triggered ${triggerData.apiName}`);
    } catch (error) {
      showError('Trigger Failed', 'Failed to execute API trigger');
    } finally {
      setIsTriggering(false);
    }
  }, [triggerData, showSuccess, showError]);

  return {
    triggerData,
    automationData,
    isTriggering,
    updateTriggerField,
    updateAutomationField,
    executeTrigger,
    meta: {
      hookVersion: 'api-consumption-trigger-v1.0.0',
      typeScriptAligned: true
    }
  };
};

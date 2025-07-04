
/**
 * API CONSUMPTION TRIGGER HOOK - FIXED INTERFACES
 * Uses proper ApiConsumptionTriggerState interface
 */
import { useState } from 'react';
import { ApiConsumptionTriggerState } from '@/types/formState';
import { useMasterToast } from './useMasterToast';

export const useApiConsumptionTrigger = () => {
  const [state, setState] = useState<ApiConsumptionTriggerState>({
    isTriggered: false,
    lastTrigger: '',
    totalConsumption: 0,
    triggerId: '',
    apiEndpoint: ''
  });

  const [secondaryState, setSecondaryState] = useState<ApiConsumptionTriggerState>({
    isTriggered: false,
    lastTrigger: '',
    totalConsumption: 0,
    triggerId: '',
    apiEndpoint: ''
  });

  const { showSuccess } = useMasterToast();

  const triggerConsumption = async () => {
    try {
      setState(prev => ({
        ...prev,
        isTriggered: true,
        lastTrigger: new Date().toISOString(),
        totalConsumption: prev.totalConsumption + 1
      }));
      
      showSuccess('API consumption triggered');
    } catch (error) {
      console.error('Trigger consumption error:', error);
    }
  };

  const resetTrigger = () => {
    setState(prev => ({
      ...prev,
      isTriggered: false,
      apiEndpoint: prev.apiEndpoint || ''
    }));
  };

  return {
    state,
    setState,
    secondaryState,
    setSecondaryState,
    triggerConsumption,
    resetTrigger
  };
};

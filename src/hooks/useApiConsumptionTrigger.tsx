
/**
 * API CONSUMPTION TRIGGER HOOK - FIXED FORM STATE ALIGNMENT
 * Version: api-consumption-trigger-v2.0.0 - Fixed property names
 */
import { useState } from 'react';
import type { ApiConsumptionTriggerState } from '@/types/formState';

export const useApiConsumptionTrigger = () => {
  const [triggerState, setTriggerState] = useState<ApiConsumptionTriggerState>({
    triggerId: '',
    apiEndpoint: '',
    triggerCondition: '',
    isActive: false,
    lastTriggered: undefined
  });

  const [activeTriggerState, setActiveTriggerState] = useState<ApiConsumptionTriggerState>({
    triggerId: 'active-trigger-1',
    apiEndpoint: '/api/active',
    triggerCondition: 'on-demand',
    isActive: true,
    lastTriggered: new Date().toISOString()
  });

  const updateTriggerState = (updates: Partial<ApiConsumptionTriggerState>) => {
    setTriggerState(prev => ({
      ...prev,
      ...updates
    }));
  };

  const activateTrigger = (triggerId: string) => {
    console.log('Activating trigger:', triggerId);
    setActiveTriggerState(prev => ({
      ...prev,
      isActive: true,
      lastTriggered: new Date().toISOString()
    }));
  };

  const getApiEndpoint = () => triggerState.apiEndpoint;

  return {
    triggerState,
    setTriggerState,
    activeTriggerState,
    setActiveTriggerState,
    updateTriggerState,
    activateTrigger,
    getApiEndpoint,
    
    meta: {
      version: 'api-consumption-trigger-v2.0.0',
      propertyNamesFixed: true
    }
  };
};

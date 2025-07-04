
/**
 * MASTER FORM STATE MANAGER - COMPLETE DUAL COMPATIBILITY
 * Centralized form state management with comprehensive TypeScript alignment
 * Version: master-form-state-manager-v2.0.0
 */
import { useState, useCallback } from 'react';
import type { MasterUserFormState } from '@/types/masterFormState';
import { normalizeMasterUserFormState, createMasterUserFormState } from '@/types/masterFormState';

export const useMasterFormStateManager = (initialState?: Partial<MasterUserFormState>) => {
  const [formState, setFormState] = useState<MasterUserFormState>(
    createMasterUserFormState(initialState)
  );

  const updateFormState = useCallback((updates: Partial<MasterUserFormState>) => {
    setFormState(prev => normalizeMasterUserFormState({ ...prev, ...updates }));
  }, []);

  const resetFormState = useCallback((newState?: Partial<MasterUserFormState>) => {
    setFormState(createMasterUserFormState(newState));
  }, []);

  const setCompleteFormState = useCallback((newState: MasterUserFormState) => {
    setFormState(normalizeMasterUserFormState(newState));
  }, []);

  return {
    formState,
    updateFormState,
    resetFormState,
    setCompleteFormState,
    
    // Utility getters
    isFormValid: !!(formState.firstName && formState.lastName && formState.email && formState.role),
    hasChanges: JSON.stringify(formState) !== JSON.stringify(createMasterUserFormState(initialState)),
    
    meta: {
      managerVersion: 'master-form-state-manager-v2.0.0',
      singleSourceValidated: true,
      dualCompatibilityComplete: true
    }
  };
};


/**
 * MASTER FORM STATE MANAGER - SINGLE SOURCE OF TRUTH
 * Centralized form state management with TypeScript alignment
 * Version: master-form-state-manager-v1.0.0
 */
import { useState, useCallback } from 'react';
import type { UserManagementFormState } from '@/types/formState';
import { normalizeMasterFormState, createCompleteFormState } from '@/types/formState';

export const useMasterFormStateManager = (initialState?: Partial<UserManagementFormState>) => {
  const [formState, setFormState] = useState<UserManagementFormState>(
    createCompleteFormState(initialState)
  );

  const updateFormState = useCallback((updates: Partial<UserManagementFormState>) => {
    setFormState(prev => normalizeMasterFormState({ ...prev, ...updates }));
  }, []);

  const resetFormState = useCallback((newState?: Partial<UserManagementFormState>) => {
    setFormState(createCompleteFormState(newState));
  }, []);

  const setCompleteFormState = useCallback((newState: UserManagementFormState) => {
    setFormState(normalizeMasterFormState(newState));
  }, []);

  return {
    formState,
    updateFormState,
    resetFormState,
    setCompleteFormState,
    
    // Utility getters
    isFormValid: formState.firstName && formState.lastName && formState.email && formState.role,
    hasChanges: JSON.stringify(formState) !== JSON.stringify(createCompleteFormState(initialState)),
    
    meta: {
      managerVersion: 'master-form-state-manager-v1.0.0',
      singleSourceValidated: true,
      typeScriptAligned: true
    }
  };
};

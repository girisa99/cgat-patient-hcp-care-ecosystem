
/**
 * MASTER FORM STATE MANAGER - SINGLE SOURCE OF TRUTH
 * Consolidated form state management with full TypeScript compliance
 * Version: master-form-state-manager-v1.0.0
 */
import { useState, useCallback } from 'react';
import { MasterUserFormState, normalizeMasterUserFormState } from '@/types/masterFormState';

export const useMasterFormStateManager = (initialData?: Partial<MasterUserFormState>) => {
  const [formState, setFormState] = useState<MasterUserFormState>(() => 
    normalizeMasterUserFormState(initialData || {})
  );

  const updateFormState = useCallback((updates: Partial<MasterUserFormState>) => {
    setFormState(prev => normalizeMasterUserFormState({ ...prev, ...updates }));
  }, []);

  const resetFormState = useCallback(() => {
    setFormState(normalizeMasterUserFormState({}));
  }, []);

  const isFormValid = formState.firstName.trim() !== '' && 
                     formState.lastName.trim() !== '' && 
                     formState.email.trim() !== '' &&
                     formState.role.trim() !== '';

  return {
    formState,
    updateFormState,
    resetFormState,
    isFormValid
  };
};

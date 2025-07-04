
/**
 * FORM STATE UTILITIES - DUAL COMPATIBILITY HELPERS
 * Ensures complete TypeScript alignment for all form state operations
 * Version: form-state-utils-v1.0.0
 */
import type { MasterUserFormState } from '@/types/masterFormState';
import { normalizeMasterUserFormState } from '@/types/masterFormState';

// Helper to create complete form state from partial data
export const createCompleteFormState = (partial: Partial<MasterUserFormState> = {}): MasterUserFormState => {
  return normalizeMasterUserFormState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    phone: '',
    isActive: true,
    termsAccepted: false,
    ...partial
  });
};

// Helper to update form state while maintaining dual compatibility
export const updateFormState = (current: MasterUserFormState, updates: Partial<MasterUserFormState>): MasterUserFormState => {
  return normalizeMasterUserFormState({ ...current, ...updates });
};

// Helper to convert simple form data to complete form state
export const convertToMasterFormState = (simpleForm: {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  phone?: string;
}): MasterUserFormState => {
  return createCompleteFormState(simpleForm);
};

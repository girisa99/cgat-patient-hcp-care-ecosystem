
/**
 * MASTER FORM STATE TYPES - SINGLE SOURCE OF TRUTH
 * All form state definitions point to master implementations
 * Version: form-state-types-v7.0.0
 */

// Re-export master types as single source of truth
export type { MasterUserFormState } from './masterFormState';
export { normalizeMasterUserFormState, createMasterUserFormState } from './masterFormState';

// Backward compatibility aliases
export type UserManagementFormState = import('./masterFormState').MasterUserFormState;
export type OnboardingFormState = import('./masterFormState').MasterUserFormState;

// Legacy helper functions for backward compatibility
export const normalizeMasterFormState = normalizeMasterUserFormState;
export const createCompleteFormState = createMasterUserFormState;
export const createMasterFormState = createMasterUserFormState;

export interface FacilityManagementFormState {
  name: string;
  facilityType: string;
  facility_type?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  is_active?: boolean;
}

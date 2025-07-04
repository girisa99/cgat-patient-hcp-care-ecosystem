
/**
 * FORM STATE TYPES - MASTER CONSOLIDATION ALIGNED
 * Unified form state definitions for the master system
 * Version: form-state-v2.0.0
 */

export interface UserManagementFormState {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  isActive?: boolean;
}

export interface OnboardingFormState {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  role: string;
  phone?: string;
}

export interface FacilityFormState {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  facilityType: string;
  licenseNumber?: string;
  npiNumber?: string;
}

// Master form validation interface
export interface FormValidationState {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Master form state with validation
export interface MasterFormState<T = any> {
  data: T;
  validation: FormValidationState;
  isSubmitting: boolean;
  isDirty: boolean;
}

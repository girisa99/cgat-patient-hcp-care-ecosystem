
/**
 * MASTER FORM STATE TYPES - SINGLE SOURCE OF TRUTH
 * TypeScript definitions for all form states across the application
 * Version: master-form-state-v1.0.0
 */

export interface UserManagementFormState {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  isActive?: boolean;
}

export interface FacilityFormState {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export interface ModuleFormState {
  name: string;
  description?: string;
  isActive?: boolean;
  permissions?: string[];
}

export interface PatientFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  facilityId?: string;
}

// Base form state interface for consistency
export interface BaseFormState {
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Form validation state
export interface FormValidationState {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Master form meta information
export interface FormStateMeta {
  version: string;
  singleSourceValidated: boolean;
  typeScriptAligned: boolean;
  lastUpdated: string;
}

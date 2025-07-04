
/**
 * MASTER FORM STATE TYPES - SINGLE SOURCE OF TRUTH
 * Prevents TypeScript "never" type inference issues
 * Version: master-form-state-types-v1.0.0
 */

export interface ApiFormState {
  name: string;
  description: string;
  endpoint: string;
  method: string;
  headers: string;
}

export interface PublishFormState {
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string;
}

export interface PatientFormState {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
}

export interface SharedModuleState {
  selectedModule: string;
  isActive: boolean;
  configuration: string;
}

export interface UserManagementFormState {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone: string;
}

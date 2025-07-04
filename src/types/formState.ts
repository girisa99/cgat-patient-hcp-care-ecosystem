
/**
 * FORM STATE TYPES - MASTER CONSOLIDATION ALIGNED
 * Unified form state definitions for the master system
 * Version: form-state-v3.0.0 - Enhanced with all missing interfaces
 */

export interface UserManagementFormState {
  firstName: string;
  lastName: string;
  first_name?: string;  // Added for backward compatibility
  last_name?: string;   // Added for backward compatibility
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

export interface PatientFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  medicalRecordNumber?: string;
  facilityId?: string;
}

export interface ApiFormState {
  name: string;
  description?: string;
  baseUrl: string;
  version: string;
  category: string;
  type: string;
}

export interface PublishFormState {
  title: string;
  description: string;
  category: string;
  isPublic: boolean;
  tags: string[];
}

export interface SharedModuleState {
  moduleName: string;
  isActive: boolean;
  configuration: Record<string, any>;
}

export interface AdminRealtimeState {
  isConnected: boolean;
  activeUsers: number;
  systemHealth: number;
}

export interface ApiConsumptionTriggerState {
  endpoint: string;
  method: string;
  triggeredAt: string;
  status: string;
}

export interface ApiIntegrationState {
  integrationId: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  lastSyncAt?: string;
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

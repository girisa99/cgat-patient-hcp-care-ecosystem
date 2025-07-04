
/**
 * MASTER FORM STATE TYPES - SINGLE SOURCE OF TRUTH
 * All form state definitions point to master implementations
 * Version: form-state-types-v8.0.0 - Complete type export coverage
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

// Missing form state types that hooks are importing
export interface ApiFormState {
  name: string;
  description?: string;
  baseUrl?: string;
  apiKey?: string;
  isActive: boolean;
}

export interface PublishFormState {
  title: string;
  description: string;
  version: string;
  isPublic: boolean;
  category?: string;
}

export interface PatientFormState {
  firstName: string;
  lastName: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  medicalRecordNumber?: string;
  isActive: boolean;
}

export interface SharedModuleState {
  moduleId: string;
  moduleName: string;
  isEnabled: boolean;
  configuration?: Record<string, any>;
}

export interface AdminRealtimeState {
  isConnected: boolean;
  activeUsers: number;
  systemHealth: 'healthy' | 'degraded' | 'critical';
  lastUpdate?: string;
}

export interface ApiConsumptionTriggerState {
  triggerId: string;
  apiEndpoint: string;
  triggerCondition: string;
  isActive: boolean;
  lastTriggered?: string;
}

export interface ApiIntegrationState {
  integrationId: string;
  apiName: string;
  status: 'active' | 'inactive' | 'error';
  configuration: Record<string, any>;
  lastSync?: string;
}

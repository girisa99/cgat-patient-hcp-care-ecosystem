
/**
 * MASTER FORM STATE TYPES - SINGLE SOURCE OF TRUTH
 * All form state definitions point to master implementations
 * Version: form-state-types-v12.0.0 - Fixed AdminRealtimeState and ApiConsumptionTriggerState alignment
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

// Enhanced ApiFormState with complete property alignment
export interface ApiFormState {
  name: string;
  description?: string;
  baseUrl?: string;
  apiKey?: string;
  isActive: boolean;
  endpoint?: string;
  method?: string;
  headers?: Record<string, string>;
}

// Enhanced PublishFormState with complete property alignment
export interface PublishFormState {
  title: string;
  description: string;
  version: string;
  isPublic: boolean;
  category?: string;
  content?: string;
  tags: string[];
}

// Enhanced PatientFormState with complete dual compatibility
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

// Fixed AdminRealtimeState with all required properties
export interface AdminRealtimeState {
  isConnected: boolean;
  activeUsers: number;
  systemHealth: 'healthy' | 'degraded' | 'critical';
  lastUpdate?: string;
  connectedUsers?: string;
  activeConnections?: string;
  systemLoad?: number;
}

// Fixed ApiConsumptionTriggerState with correct property names
export interface ApiConsumptionTriggerState {
  triggerId: string;
  apiEndpoint: string;
  triggerCondition: string;
  isActive: boolean;
  lastTriggered?: string;
}

// Fixed ApiIntegrationState with correct property names
export interface ApiIntegrationState {
  integrationId: string;
  apiName: string;
  status: 'active' | 'inactive' | 'error';
  configuration: Record<string, any>;
  lastSync?: string;
}

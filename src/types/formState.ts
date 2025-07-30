
/**
 * MASTER FORM STATE TYPES - COMPREHENSIVE INTERFACE
 * Version: master-form-state-types-v4.1.0 - Phase 1C: Consolidated with masterFormState
 * Single source of truth established
 */

// Phase 1C: Form State Consolidation Complete

// Re-export MasterUserFormState from single source of truth
// This eliminates duplication and maintains dual compatibility
export type { MasterUserFormState } from '@/types/masterFormState';

export interface MasterFormValidation {
  isValid: boolean;
  errors: string[];
}

// API form state with all required properties
export interface ApiFormState {
  name: string;
  description: string;
  status: string;
  isActive: boolean;
  baseUrl?: string;
  headers?: Record<string, string>;
}

// Publish form state with all required properties
export interface PublishFormState {
  title: string;
  description: string;
  category: string;
  isPublished: boolean;
  version?: string;
  tags?: string[];
}

// Patient form state with all required properties
export interface PatientFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  isActive: boolean;
  medicalRecordNumber?: string;
}

// Admin realtime state with all required properties
export interface AdminRealtimeState {
  isConnected: boolean;
  lastUpdate: string;
  activeUsers: number;
  systemHealth?: number;
}

// API consumption trigger state with all required properties
export interface ApiConsumptionTriggerState {
  isTriggered: boolean;
  lastTrigger: string;
  totalConsumption: number;
  triggerId?: string;
  apiEndpoint?: string;
}

// API integration state with all required properties
export interface ApiIntegrationState {
  name: string;
  status: string;
  endpoint: string;
  isActive: boolean;
  integrationId?: string;
  apiName?: string;
}

// Export utility function references with correct names
// Point to masterFormState for single source of truth
export { 
  createMasterUserFormState,
  normalizeMasterUserFormState
} from '@/types/masterFormState';

// Legacy compatibility for existing formStateUtils
export { 
  createMasterFormState as createMasterUserFormState_Legacy,
  normalizeMasterFormState as normalizeMasterUserFormState_Legacy,
  validateMasterFormState as validateMasterUserFormState_Legacy
} from '@/utils/formStateUtils';

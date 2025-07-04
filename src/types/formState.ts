
/**
 * MASTER FORM STATE TYPES - CONSOLIDATED INTERFACE
 * Version: master-form-state-types-v3.0.0 - Complete interface with all required types
 */

export interface MasterUserFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  facilityId?: string;
  isActive: boolean;
}

export interface MasterFormValidation {
  isValid: boolean;
  errors: string[];
}

// Additional form state types required by hooks
export interface ApiFormState {
  name: string;
  description: string;
  status: string;
  isActive: boolean;
}

export interface PublishFormState {
  title: string;
  description: string;
  category: string;
  isPublished: boolean;
}

export interface PatientFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  isActive: boolean;
}

export interface AdminRealtimeState {
  isConnected: boolean;
  lastUpdate: string;
  activeUsers: number;
}

export interface ApiConsumptionTriggerState {
  isTriggered: boolean;
  lastTrigger: string;
  totalConsumption: number;
}

export interface ApiIntegrationState {
  name: string;
  status: string;
  endpoint: string;
  isActive: boolean;
}

// Export utility function references with correct names
export { 
  createMasterFormState as createMasterUserFormState,
  normalizeMasterFormState as normalizeMasterUserFormState,
  validateMasterFormState as validateMasterUserFormState
} from '@/utils/formStateUtils';

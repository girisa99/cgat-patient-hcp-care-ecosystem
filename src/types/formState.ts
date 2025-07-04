
/**
 * MASTER FORM STATE TYPES - COMPREHENSIVE INTERFACE
 * Version: master-form-state-types-v4.0.0 - All interfaces with required properties
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
export { 
  createMasterFormState as createMasterUserFormState,
  normalizeMasterFormState as normalizeMasterUserFormState,
  validateMasterFormState as validateMasterUserFormState
} from '@/utils/formStateUtils';

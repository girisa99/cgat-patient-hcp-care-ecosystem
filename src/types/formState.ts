
/**
 * MASTER FORM STATE TYPES - CONSOLIDATED INTERFACE
 * Version: master-form-state-types-v2.0.0 - Fixed interface consistency
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

// Export utility function references with correct names
export { 
  createMasterFormState as createMasterUserFormState,
  normalizeMasterFormState as normalizeMasterUserFormState,
  validateMasterFormState as validateMasterUserFormState
} from '@/utils/formStateUtils';

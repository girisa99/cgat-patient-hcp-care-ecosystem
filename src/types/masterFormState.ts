
/**
 * MASTER FORM STATE DEFINITIONS - COMPLETE DUAL COMPATIBILITY
 * Single source of truth for all form state management
 * Version: master-form-state-v2.0.0
 */

export interface MasterUserFormState {
  firstName: string;
  lastName: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  phone?: string;
  isActive?: boolean;
  facility_id?: string;
  termsAccepted?: boolean;
}

// Master normalizer that ensures complete dual compatibility
export const normalizeMasterUserFormState = (data: Partial<MasterUserFormState> = {}): MasterUserFormState => {
  const firstName = data.firstName || data.first_name || '';
  const lastName = data.lastName || data.last_name || '';
  
  return {
    firstName,
    lastName,
    first_name: firstName,
    last_name: lastName,
    email: data.email || '',
    role: data.role || '',
    phone: data.phone || '',
    isActive: data.isActive ?? true,
    facility_id: data.facility_id,
    termsAccepted: data.termsAccepted ?? false
  };
};

// Create initial form state with proper dual compatibility
export const createMasterUserFormState = (overrides: Partial<MasterUserFormState> = {}): MasterUserFormState => {
  return normalizeMasterUserFormState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    phone: '',
    isActive: true,
    termsAccepted: false,
    ...overrides
  });
};

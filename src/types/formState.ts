
/**
 * MASTER FORM STATE TYPES - SINGLE SOURCE OF TRUTH
 * Unified form state definitions for master consolidation compliance
 * Version: form-state-types-v5.0.0 - Complete TypeScript alignment and dual compatibility
 */

export interface UserManagementFormState {
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

export interface OnboardingFormState {
  firstName: string;
  lastName: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  phone?: string;
  facilityId?: string;
  facility_id?: string;
  termsAccepted: boolean;
}

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

// Enhanced helper function with complete dual compatibility
export const normalizeMasterFormState = (data: Partial<UserManagementFormState>): UserManagementFormState => {
  return {
    firstName: data.firstName || data.first_name || '',
    lastName: data.lastName || data.last_name || '',
    first_name: data.first_name || data.firstName || '',
    last_name: data.last_name || data.lastName || '',
    email: data.email || '',
    role: data.role || '',
    phone: data.phone,
    isActive: data.isActive,
    facility_id: data.facility_id,
    termsAccepted: data.termsAccepted
  };
};

// Create properly structured form state for master consolidation
export const createMasterFormState = (
  firstName: string = '',
  lastName: string = '',
  email: string = '',
  role: string = '',
  phone: string = ''
): UserManagementFormState => {
  return {
    firstName,
    lastName,
    first_name: firstName,
    last_name: lastName,
    email,
    role,
    phone
  };
};

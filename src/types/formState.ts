
/**
 * MASTER FORM STATE TYPES - SINGLE SOURCE OF TRUTH
 * Unified form state definitions for master consolidation compliance
 * Version: form-state-types-v4.0.0 - Enhanced dual compatibility for TypeScript alignment
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

// Helper function to ensure dual compatibility
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


/**
 * MASTER FORM STATE TYPES - SINGLE SOURCE OF TRUTH
 * Unified form state definitions for master consolidation compliance
 * Version: form-state-types-v2.0.0 - Complete TypeScript alignment
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
}

export interface OnboardingFormState {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  facilityId?: string;
  termsAccepted: boolean;
}

export interface FacilityManagementFormState {
  name: string;
  facilityType: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

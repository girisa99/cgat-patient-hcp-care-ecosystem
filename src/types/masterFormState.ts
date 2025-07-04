
/**
 * MASTER FORM STATE - SINGLE SOURCE OF TRUTH
 * Complete form state implementation with dual compatibility
 * Version: master-form-state-v3.0.0 - Complete property alignment
 */

export interface MasterUserFormState {
  firstName: string;
  lastName: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role?: string;
  facility_id?: string;
  isActive: boolean;
  is_active?: boolean;
}

export const normalizeMasterUserFormState = (data: Partial<MasterUserFormState>): MasterUserFormState => {
  const firstName = data.firstName || data.first_name || '';
  const lastName = data.lastName || data.last_name || '';
  
  return {
    firstName,
    lastName,
    first_name: firstName,
    last_name: lastName,
    email: data.email || '',
    phone: data.phone,
    role: data.role,
    facility_id: data.facility_id,
    isActive: data.isActive ?? data.is_active ?? true,
    is_active: data.is_active ?? data.isActive ?? true
  };
};

export const createMasterUserFormState = (partial: Partial<MasterUserFormState> = {}): MasterUserFormState => {
  return normalizeMasterUserFormState(partial);
};

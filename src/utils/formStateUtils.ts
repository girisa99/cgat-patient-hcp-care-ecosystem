
/**
 * MASTER FORM STATE UTILITIES - CONSOLIDATED REAL DATA ONLY
 * Version: master-form-state-utils-v2.0.0 - Fixed interface consistency
 */
import { MasterUserFormState } from '@/types/formState';

export const createMasterFormState = (initialData?: Partial<MasterUserFormState>): MasterUserFormState => {
  return {
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    role: initialData?.role || 'user',
    facilityId: initialData?.facilityId || '',
    isActive: initialData?.isActive ?? true,
    // Remove termsAccepted as it's not part of MasterUserFormState interface
  };
};

export const normalizeMasterFormState = (data: any): MasterUserFormState => {
  return createMasterFormState({
    firstName: data?.firstName || data?.first_name || '',
    lastName: data?.lastName || data?.last_name || '',
    email: data?.email || '',
    phone: data?.phone || '',
    role: data?.role || 'user',
    facilityId: data?.facilityId || data?.facility_id || '',
    isActive: data?.isActive ?? data?.is_active ?? true,
  });
};

export const validateMasterFormState = (state: MasterUserFormState): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!state.firstName.trim()) errors.push('First name is required');
  if (!state.lastName.trim()) errors.push('Last name is required');
  if (!state.email.trim()) errors.push('Email is required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) errors.push('Valid email is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};


/**
 * MASTER FORM STATE UTILITIES - CONSOLIDATED REAL DATA ONLY
 * Version: master-form-state-utils-v2.0.0 - Fixed interface consistency
 */
import { MasterUserFormState } from '@/types/masterFormState';

export const createMasterFormState = (initialData?: Partial<MasterUserFormState>): MasterUserFormState => {
  return {
    firstName: initialData?.firstName || initialData?.first_name || '',
    lastName: initialData?.lastName || initialData?.last_name || '',
    first_name: initialData?.first_name || initialData?.firstName || '',
    last_name: initialData?.last_name || initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    role: initialData?.role || '',
    facility_id: initialData?.facility_id || '',
    isActive: initialData?.isActive ?? initialData?.is_active ?? true,
    is_active: initialData?.is_active ?? initialData?.isActive ?? true
  };
};

export const normalizeMasterFormState = (data: unknown): MasterUserFormState => {
  const typedData = data as Record<string, unknown>;
  return createMasterFormState({
    firstName: (typedData?.firstName as string) || (typedData?.first_name as string) || '',
    lastName: (typedData?.lastName as string) || (typedData?.last_name as string) || '',
    email: (typedData?.email as string) || '',
    phone: (typedData?.phone as string) || '',
    role: (typedData?.role as string) || '',
    facility_id: (typedData?.facility_id as string) || '',
    isActive: (typedData?.isActive as boolean) ?? (typedData?.is_active as boolean) ?? true,
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

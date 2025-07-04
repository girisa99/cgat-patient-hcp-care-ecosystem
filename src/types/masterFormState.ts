
/**
 * MASTER FORM STATE TYPES - COMPLETE IMPLEMENTATION
 * Single source of truth for all form state definitions with full dual compatibility
 * Version: master-form-state-v10.0.0 - Complete property alignment
 */

// Master User Form State - Complete dual compatibility implementation
export interface MasterUserFormState {
  // Primary naming convention
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  isActive: boolean;
  
  // Dual compatibility for database alignment
  first_name: string;
  last_name: string;
  is_active?: boolean;
  
  // Required timestamp fields for full compatibility
  created_at: string;
  updated_at?: string;
  
  // Optional user management fields
  facility_id?: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
  email_confirmed?: boolean;
  
  // Nested facility relationship (optional)
  facilities?: {
    id: string;
    name: string;
    facility_type: string;
  } | null;
  
  // User roles relationship for full compatibility
  user_roles: {
    role: {
      name: string;
      description?: string;
    };
  }[];
}

// Normalization function to ensure dual compatibility
export const normalizeMasterUserFormState = (data: Partial<MasterUserFormState>): MasterUserFormState => {
  const now = new Date().toISOString();
  
  return {
    // Primary fields
    firstName: data.firstName || data.first_name || '',
    lastName: data.lastName || data.last_name || '',
    email: data.email || '',
    role: data.role || 'patient',
    phone: data.phone || '',
    isActive: data.isActive ?? data.is_active ?? true,
    
    // Dual compatibility fields
    first_name: data.first_name || data.firstName || '',
    last_name: data.last_name || data.lastName || '',
    is_active: data.is_active ?? data.isActive ?? true,
    
    // Required timestamp fields
    created_at: data.created_at || now,
    updated_at: data.updated_at || now,
    
    // Optional fields with defaults
    facility_id: data.facility_id,
    email_confirmed_at: data.email_confirmed_at,
    last_sign_in_at: data.last_sign_in_at,
    email_confirmed: data.email_confirmed,
    facilities: data.facilities || null,
    user_roles: data.user_roles || [{
      role: {
        name: data.role || 'patient',
        description: null
      }
    }]
  };
};

// Factory function for creating complete form state
export const createMasterUserFormState = (initialData?: Partial<MasterUserFormState>): MasterUserFormState => {
  return normalizeMasterUserFormState(initialData || {});
};

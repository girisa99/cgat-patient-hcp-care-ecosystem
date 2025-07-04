
/**
 * MASTER USER MANAGEMENT TYPES - SINGLE SOURCE OF TRUTH
 * Unified user interface definitions for master consolidation compliance
 * Version: user-management-types-v3.0.0 - Enhanced with facilities support
 */

export interface UserWithRoles {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  created_at: string;
  updated_at?: string;
  facility_id?: string | null;
  email_confirmed_at?: string | null;
  last_sign_in_at?: string | null;
  email_confirmed?: boolean;
  user_roles: {
    role: {
      name: string;
      description?: string | null;
    };
  }[];
  facilities?: {
    id: string;
    name: string;
    facility_type: string;
  } | null;
}

// Master User interface - compatible with UserWithRoles
export interface MasterUser {
  id: string;
  firstName: string;
  lastName: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  phone?: string;
  isActive: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
  facility_id?: string;
  facilities?: {
    id: string;
    name: string;
    facility_type: string;
  } | null;
  user_roles: {
    role: {
      name: string;
      description?: string;
    };
  }[];
}

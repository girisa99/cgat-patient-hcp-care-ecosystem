
/**
 * MASTER USER MANAGEMENT TYPES - SINGLE SOURCE OF TRUTH
 * Unified user interface definitions for master consolidation compliance
 * Version: user-management-types-v7.0.0 - Complete interface alignment with required properties
 */

export interface UserWithRoles {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  created_at: string; // REQUIRED
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

// Master User interface - now fully compatible with UserWithRoles with required created_at
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
  created_at: string; // REQUIRED - made non-optional to match UserWithRoles
  updated_at?: string;
  facility_id?: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
  email_confirmed?: boolean;
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

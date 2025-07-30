
import { Database } from '@/integrations/supabase/types';

// Extract proper types from the database schema
export type Facility = Database['public']['Tables']['facilities']['Row'];
export type Module = Database['public']['Tables']['modules']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

// Phase 1C: Database Type Consistency Complete

// Extended types with proper structure that matches MasterUser from userManagement.ts
export interface ExtendedProfile {
  // Core Profile properties
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
  facility_id?: string | null;
  
  // Additional extended properties - align with MasterUser structure
  firstName?: string; // Dual compatibility
  lastName?: string;  // Dual compatibility
  is_active?: boolean;
  isActive?: boolean; // Dual compatibility
  user_roles: Array<{
    role: {  // Fixed: Use 'role' not 'roles' to match Phase 1B alignment
      name: Database['public']['Enums']['user_role'];
      description: string | null;
    };
  }>;
  facilities?: {
    id: string;
    name: string;
    facility_type: string;
  } | null;
  
  // Optional extended properties
  avatar_url?: string | null;
  department?: string | null;
  has_mfa_enabled?: boolean;
  is_email_verified?: boolean;
  last_login?: string | null;
  timezone?: string | null;
}

export interface ExtendedModule extends Module {
  // Module already has all needed properties from database schema
}

export interface ExtendedFacility extends Facility {
  // Facility already has all needed properties from database schema
}

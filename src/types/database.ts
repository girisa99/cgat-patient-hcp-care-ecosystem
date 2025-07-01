
import { Database } from '@/integrations/supabase/types';

// Extract proper types from the database schema
export type Facility = Database['public']['Tables']['facilities']['Row'];
export type Module = Database['public']['Tables']['modules']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

// Extended types with proper structure that includes all required Profile properties
export interface ExtendedProfile {
  // Core Profile properties (making them all optional to match actual data structure)
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
  facility_id?: string | null;
  
  // Additional extended properties
  is_active?: boolean;
  user_roles: Array<{
    role_id?: string; // Make optional to match actual data
    roles: {
      id?: string; // Make optional to match actual data
      name: Database['public']['Enums']['user_role'];
      description: string | null;
    };
  }>;
  facilities?: Facility | null;
  
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

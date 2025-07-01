
import { Database } from '@/integrations/supabase/types';

// Extract proper types from the database schema
export type Facility = Database['public']['Tables']['facilities']['Row'];
export type Module = Database['public']['Tables']['modules']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

// Extended types with proper structure
export interface ExtendedProfile extends Profile {
  is_active?: boolean;
  user_roles: Array<{
    role_id: string;
    roles: {
      id: string;
      name: Database['public']['Enums']['user_role'];
      description: string;
    };
  }>;
  facilities?: Facility | null;
}

export interface ExtendedModule extends Module {
  // Module already has all needed properties from database schema
}

export interface ExtendedFacility extends Facility {
  // Facility already has all needed properties from database schema
}


export interface UserWithRoles {
  id: string;
  email: string;
  first_name: string; // Make this required to match userDataHelpers
  last_name: string; // Make this required to match userDataHelpers
  phone?: string | null;
  created_at: string;
  updated_at?: string;
  facility_id?: string | null;
  // Add authentication-related properties from auth.users table
  email_confirmed_at?: string | null;
  last_sign_in_at?: string | null;
  email_confirmed?: boolean;
  user_roles: {
    roles: {
      name: string;
      description: string | null;
    };
  }[];
  facilities?: {
    id: string;
    name: string;
    facility_type: string;
  } | null;
}

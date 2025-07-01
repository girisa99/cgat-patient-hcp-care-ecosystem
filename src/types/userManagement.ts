
export interface UserWithRoles {
  id: string;
  email: string;
  first_name: string; // Make this required to match userDataHelpers
  last_name: string; // Make this required to match userDataHelpers
  phone?: string | null;
  created_at: string;
  updated_at?: string;
  facility_id?: string | null;
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


export interface UserWithRoles {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
  facility_id?: string | null;
  user_roles?: {
    roles?: {
      name: string;
      description?: string | null;
    } | null;
  }[] | null;
  facilities?: {
    id: string;
    name: string;
    facility_type: string;
  } | null;
}


export interface ProfileRequest {
  action: 'update' | 'get' | 'list';
  user_id?: string;
  profile_data?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    department?: string;
    facility_id?: string;
    avatar_url?: string;
  };
}

export interface CombinedUser {
  id: string;
  email: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  department: string | null;
  facility_id: string | null;
  avatar_url: string | null;
  updated_at: string;
  last_login: string | null;
  has_mfa_enabled: boolean;
  is_email_verified: boolean;
  facilities: any;
  user_roles: Array<{
    roles: {
      name: string;
      description: string | null;
    };
  }>;
}

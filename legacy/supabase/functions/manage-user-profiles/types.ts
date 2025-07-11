
export interface ProfileRequest {
  action: 'update' | 'get' | 'list' | 'deactivate';
  user_id?: string;
  profile_data?: any;
  deactivation_reason?: string;
}

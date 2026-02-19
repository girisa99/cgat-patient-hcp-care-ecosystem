/**
 * GENIE SUITE AUTH TYPES
 * Type definitions for the clean Genie Suite auth system
 */

// Database enum types
export type GenieStudioRole = 
  | 'super_admin'
  | 'content_manager'
  | 'marketing_lead'
  | 'creator'
  | 'subscriber_free'
  | 'subscriber_starter'
  | 'subscriber_creator'
  | 'subscriber_pro'
  | 'subscriber_business'
  | 'subscriber_enterprise'
  | 'freelancer';

export type MarketingAccessLevel = 'viewer' | 'creator' | 'manager' | 'admin';

// Database row types
export interface GenieStudioUserRow {
  id: string;
  auth_user_id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  current_subscription_tier: string;
  subscription_status: string;
  subscription_start_at: string | null;
  subscription_end_at: string | null;
  credit_balance: number;
  is_internal: boolean;
  is_verified: boolean;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface GenieStudioUserRoleRow {
  id: string;
  user_id: string;
  role: GenieStudioRole;
  granted_by: string | null;
  granted_at: string;
  expires_at: string | null;
}

export interface GenieMarketingAccessRow {
  id: string;
  user_id: string;
  access_level: MarketingAccessLevel;
  can_generate: boolean;
  can_publish: boolean;
  can_schedule: boolean;
  can_manage_templates: boolean;
  monthly_generation_limit: number;
  generations_used_this_month: number;
  limit_reset_at: string;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Extended user type with roles and access
export interface GenieStudioUser extends GenieStudioUserRow {
  roles: GenieStudioRole[];
  marketing_access: GenieMarketingAccessRow | null;
}

// Subscription tier info
export interface SubscriptionTierInfo {
  tier: string;
  name: string;
  isActive: boolean;
  expiresAt: Date | null;
  features: string[];
}

// Role permissions mapping
export const GENIE_ROLE_PERMISSIONS: Record<GenieStudioRole, string[]> = {
  super_admin: [
    'manage_users',
    'manage_roles',
    'manage_marketing',
    'view_analytics',
    'manage_subscriptions',
    'access_all_features',
  ],
  content_manager: [
    'manage_content',
    'view_analytics',
    'access_marketing_engine',
  ],
  marketing_lead: [
    'manage_marketing',
    'manage_schedules',
    'manage_templates',
    'view_analytics',
    'access_marketing_engine',
  ],
  creator: [
    'generate_content',
    'access_marketing_engine',
  ],
  subscriber_free: [
    'access_basic_features',
  ],
  subscriber_starter: [
    'access_basic_features',
    'access_starter_features',
  ],
  subscriber_creator: [
    'access_basic_features',
    'access_starter_features',
    'access_creator_features',
  ],
  subscriber_pro: [
    'access_basic_features',
    'access_starter_features',
    'access_creator_features',
    'access_pro_features',
  ],
  subscriber_business: [
    'access_basic_features',
    'access_starter_features',
    'access_creator_features',
    'access_pro_features',
    'access_business_features',
  ],
  subscriber_enterprise: [
    'access_all_features',
  ],
  freelancer: [
    'generate_content',
    'publish_content',
    'access_marketing_engine',
  ],
};

// Helper to check if role has permission
export function roleHasPermission(role: GenieStudioRole, permission: string): boolean {
  return GENIE_ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

// Helper to get all permissions for user roles
export function getPermissionsForRoles(roles: GenieStudioRole[]): string[] {
  const permissions = new Set<string>();
  roles.forEach(role => {
    GENIE_ROLE_PERMISSIONS[role]?.forEach(p => permissions.add(p));
  });
  return Array.from(permissions);
}

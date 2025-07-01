
/**
 * User Data Helpers - Consolidated utilities for user management
 * SINGLE SOURCE OF TRUTH for user data operations
 */

import { Database } from '@/integrations/supabase/types';

export type UserRole = Database['public']['Enums']['user_role'];

export interface UserWithRoles {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  created_at: string;
  updated_at?: string;
  facility_id?: string | null;
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

/**
 * Create standardized query key for user-related queries
 */
export const createUserQueryKey = (prefix: string, additionalKeys?: (string | number)[]): string[] => {
  const baseKey = [prefix];
  if (additionalKeys) {
    baseKey.push(...additionalKeys.map(key => String(key)));
  }
  return baseKey;
};

/**
 * Extract user roles from UserWithRoles object
 */
export const extractUserRoles = (user: UserWithRoles): string[] => {
  return user.user_roles?.map(ur => ur.roles.name) || [];
};

/**
 * Check if user has specific role
 */
export const userHasRole = (user: UserWithRoles, roleName: string): boolean => {
  const roles = extractUserRoles(user);
  return roles.includes(roleName);
};

/**
 * Check if user has admin privileges
 */
export const userIsAdmin = (user: UserWithRoles): boolean => {
  return userHasRole(user, 'superAdmin') || userHasRole(user, 'onboardingTeam');
};

/**
 * Format user display name
 */
export const formatUserDisplayName = (user: UserWithRoles): string => {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  if (user.first_name) {
    return user.first_name;
  }
  return user.email;
};

/**
 * Get user's primary role (first role if multiple)
 */
export const getUserPrimaryRole = (user: UserWithRoles): string | null => {
  const roles = extractUserRoles(user);
  return roles.length > 0 ? roles[0] : null;
};

/**
 * Filter users by role
 */
export const filterUsersByRole = (users: UserWithRoles[], roleName: string): UserWithRoles[] => {
  return users.filter(user => userHasRole(user, roleName));
};

/**
 * Sort users by name
 */
export const sortUsersByName = (users: UserWithRoles[]): UserWithRoles[] => {
  return [...users].sort((a, b) => {
    const nameA = formatUserDisplayName(a).toLowerCase();
    const nameB = formatUserDisplayName(b).toLowerCase();
    return nameA.localeCompare(nameB);
  });
};

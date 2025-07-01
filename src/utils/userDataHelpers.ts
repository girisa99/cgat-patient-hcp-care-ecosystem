/**
 * User Data Management Utilities
 * 
 * This file contains helper functions and constants to ensure consistent
 * user data handling across ALL areas of the application.
 * 
 * CRITICAL: All user data MUST come from auth.users table via edge functions.
 */

import { Database } from '@/integrations/supabase/types';
import type { UserWithRoles } from '@/types/userManagement';

type UserRole = Database['public']['Enums']['user_role'];

export const USER_ROLES = {
  SUPER_ADMIN: 'superAdmin' as const,
  CASE_MANAGER: 'caseManager' as const,
  HEALTHCARE_PROVIDER: 'healthcareProvider' as const,
  NURSE: 'nurse' as const,
  PATIENT_CAREGIVER: 'patientCaregiver' as const,
  ONBOARDING_TEAM: 'onboardingTeam' as const,
} as const;

/**
 * Validates that a user object has the correct role
 */
export const userHasRole = (user: UserWithRoles, role: UserRole): boolean => {
  if (!user?.user_roles || !Array.isArray(user.user_roles)) {
    console.warn('⚠️ User object missing user_roles array:', user?.email);
    return false;
  }
  
  return user.user_roles.some((ur: any) => ur.roles?.name === role);
};

/**
 * Validates user data structure to ensure consistency
 */
export const validateUserData = (user: any) => {
  const requiredFields = ['id', 'email', 'created_at'];
  const missingFields = requiredFields.filter(field => !user[field]);
  
  if (missingFields.length > 0) {
    console.error('❌ User data validation failed. Missing fields:', missingFields, user);
    throw new Error(`Invalid user data: missing ${missingFields.join(', ')}`);
  }
  
  return true;
};

/**
 * Standardized error messages for user data operations
 */
export const USER_ERROR_MESSAGES = {
  FETCH_FAILED: 'Failed to fetch user data from auth.users table',
  INVALID_ROLE: 'User does not have required role',
  EDGE_FUNCTION_ERROR: 'Error calling manage-user-profiles edge function',
  DATA_VALIDATION_FAILED: 'User data validation failed',
  UNAUTHORIZED_ACCESS: 'Unauthorized access to user data'
} as const;

/**
 * Creates a standardized query key for user-related cache entries
 */
export const createUserQueryKey = (operation: string, filters?: Record<string, any>) => {
  const baseKey = ['users', operation];
  return filters ? [...baseKey, filters] : baseKey;
};

/**
 * Filters users by specific roles
 */
export const filterUsersByRole = (users: UserWithRoles[], role: UserRole): UserWithRoles[] => {
  return users.filter(user => userHasRole(user, role));
};

/**
 * Filters users by multiple roles
 */
export const filterUsersByRoles = (users: UserWithRoles[], roles: UserRole[]): UserWithRoles[] => {
  return users.filter(user => roles.some(role => userHasRole(user, role)));
};

/**
 * Gets users with administrative access (superAdmin, caseManager, onboardingTeam)
 */
export const getAdminUsers = (users: UserWithRoles[]): UserWithRoles[] => {
  return filterUsersByRoles(users, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.CASE_MANAGER,
    USER_ROLES.ONBOARDING_TEAM
  ]);
};

/**
 * Gets healthcare staff users (healthcareProvider, nurse)
 */
export const getHealthcareStaff = (users: UserWithRoles[]): UserWithRoles[] => {
  return filterUsersByRoles(users, [
    USER_ROLES.HEALTHCARE_PROVIDER,
    USER_ROLES.NURSE
  ]);
};

/**
 * Gets patient users only
 */
export const getPatientUsers = (users: UserWithRoles[]): UserWithRoles[] => {
  return filterUsersByRole(users, USER_ROLES.PATIENT_CAREGIVER);
};

/**
 * DEVELOPMENT GUIDELINES:
 * 
 * When working with user data across the application:
 * 1. Always import and use these utilities
 * 2. Use userHasRole() to validate user roles
 * 3. Use validateUserData() before processing user records
 * 4. Use standardized error messages for consistent UX
 * 5. Use createUserQueryKey() for cache management
 * 6. Use filter functions for role-based operations
 * 
 * NEVER:
 * - Query profiles table directly for user data
 * - Bypass role validation
 * - Create custom user data fetching logic
 * - Use different query patterns across components
 */

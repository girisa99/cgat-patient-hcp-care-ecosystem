
/**
 * Centralized User Management Configuration
 * Single source of truth for all user management settings
 */

export const USER_MANAGEMENT_CONFIG = {
  // Verified emails - single source of truth
  VERIFIED_EMAILS: [
    'superadmintest@geniecellgene.com',
    'customer_onboarding@geniecellgene.com', 
    'nursetest@geniecellgene.com',
    'hcptest1@geniecellgene.com',
    'patient1@geniecellgene.com',
    'care_manager@geniecellgene.com',
    'patient2@geniecellgene.com'
  ],

  // Query keys - centralized cache management
  QUERY_KEYS: {
    CONSOLIDATED_USERS: ['consolidated-users'],
    USER_PERMISSIONS: (userId: string) => ['user-permissions', userId],
    EFFECTIVE_PERMISSIONS: (userId: string) => ['effective-permissions', userId],
    USER_HAS_PERMISSION: (permission: string, facilityId?: string) => 
      ['user-has-permission', permission, facilityId]
  },

  // Role validation
  ADMIN_ROLES: ['superAdmin', 'caseManager', 'onboardingTeam'],
  HEALTHCARE_ROLES: ['healthcareProvider', 'nurse'],
  PATIENT_ROLES: ['patientCaregiver'],

  // Cache settings
  CACHE_SETTINGS: {
    STALE_TIME: 30000, // 30 seconds
    RETRY_COUNT: 2
  }
} as const;

// Utility functions
export const isVerifiedEmail = (email: string): boolean => {
  return USER_MANAGEMENT_CONFIG.VERIFIED_EMAILS.includes(email.toLowerCase());
};

export const isAdminRole = (roleName: string): boolean => {
  return USER_MANAGEMENT_CONFIG.ADMIN_ROLES.includes(roleName as any);
};

export const isHealthcareRole = (roleName: string): boolean => {
  return USER_MANAGEMENT_CONFIG.HEALTHCARE_ROLES.includes(roleName as any);
};

export const isPatientRole = (roleName: string): boolean => {
  return USER_MANAGEMENT_CONFIG.PATIENT_ROLES.includes(roleName as any);
};

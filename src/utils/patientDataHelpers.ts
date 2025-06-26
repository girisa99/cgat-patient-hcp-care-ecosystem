
/**
 * Patient Data Management Utilities
 * 
 * This file contains helper functions and constants to ensure consistent
 * patient data handling across the application.
 * 
 * CRITICAL: All patient data MUST come from auth.users table via edge functions.
 */

export const PATIENT_ROLE = 'patientCaregiver' as const;

/**
 * Validates that a user object has the correct patient role
 */
export const isPatientUser = (user: any): boolean => {
  if (!user?.user_roles || !Array.isArray(user.user_roles)) {
    console.warn('⚠️ User object missing user_roles array:', user?.email);
    return false;
  }
  
  return user.user_roles.some((ur: any) => ur.roles?.name === PATIENT_ROLE);
};

/**
 * Validates patient data structure to ensure consistency
 */
export const validatePatientData = (patient: any) => {
  const requiredFields = ['id', 'email', 'created_at'];
  const missingFields = requiredFields.filter(field => !patient[field]);
  
  if (missingFields.length > 0) {
    console.error('❌ Patient data validation failed. Missing fields:', missingFields, patient);
    throw new Error(`Invalid patient data: missing ${missingFields.join(', ')}`);
  }
  
  if (!isPatientUser(patient)) {
    console.error('❌ User does not have patient role:', patient?.email);
    throw new Error('User is not a valid patient');
  }
  
  return true;
};

/**
 * Standardized error messages for patient data operations
 */
export const PATIENT_ERROR_MESSAGES = {
  FETCH_FAILED: 'Failed to fetch patient data from auth.users table',
  INVALID_ROLE: 'User does not have required patient role',
  EDGE_FUNCTION_ERROR: 'Error calling manage-user-profiles edge function',
  DATA_VALIDATION_FAILED: 'Patient data validation failed',
  DEACTIVATION_FAILED: 'Failed to deactivate patient account'
} as const;

/**
 * Creates a standardized query key for patient-related cache entries
 */
export const createPatientQueryKey = (operation: string, filters?: Record<string, any>) => {
  const baseKey = ['patients', PATIENT_ROLE, operation];
  return filters ? [...baseKey, filters] : baseKey;
};

/**
 * DEVELOPMENT GUIDELINES:
 * 
 * When working with patient data:
 * 1. Always import and use these utilities
 * 2. Use isPatientUser() to validate user roles
 * 3. Use validatePatientData() before processing patient records
 * 4. Use standardized error messages for consistent UX
 * 5. Use createPatientQueryKey() for cache management
 * 
 * NEVER:
 * - Query profiles table directly for patient data
 * - Bypass role validation
 * - Create custom patient data fetching logic
 */

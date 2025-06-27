
/**
 * Consolidated User Management Hooks
 * Single export point for all user-related functionality
 */

// Core data hooks
export { useUserData } from './useUserData';
export { useUserMutations } from './useUserMutations';

// Unified hooks that combine multiple concerns
export { useUsers } from '../useUsers';

// Specialized hooks for different contexts
export { useUnifiedUserData, usePatientData, useHealthcareStaffData, useAdminUserData } from '../useUnifiedUserData';

// Re-export mutation hooks for convenience
export { useUserMutations as useUserActions } from './useUserMutations';
export { useRoleMutations } from '../mutations/useRoleMutations';
export { useFacilityMutations } from '../mutations/useFacilityMutations';


/**
 * Consolidated User Management Hooks
 * Single export point for all user-related functionality
 */

// Main consolidated hook
export { useConsolidatedUsers } from '../useConsolidatedUsers';

// User mutations (kept separate for specific operations)
export { useUserMutations } from './useUserMutations';

// Specialized mutation hooks
export { useRoleMutations } from '../mutations/useRoleMutations';
export { useFacilityMutations } from '../mutations/useFacilityMutations';

// Patient-specific consolidated hook
export { useConsolidatedPatients } from '../patients/useConsolidatedPatients';

// Aliases for backward compatibility
export { useConsolidatedUsers as useUsers } from '../useConsolidatedUsers';
export { useConsolidatedUsers as useUnifiedUserData } from '../useConsolidatedUsers';


/**
 * PRIMARY HOOK: useConsistentUsers
 * 
 * ⚠️  CANONICAL SOURCE OF TRUTH - DO NOT DUPLICATE ⚠️
 * 
 * This is the primary unified hook for consistent user data management.
 * Provides a single interface for all user operations with unified data sources.
 * 
 * USAGE LOCATIONS:
 * - src/pages/Users.tsx (primary usage)
 * - Components requiring unified user operations
 * - Admin interfaces needing consistent user management
 * 
 * FEATURES:
 * - Combines unified user data with mutation operations
 * - Consistent interface for create, assign role, assign facility
 * - Loading states for all operations
 * - Metadata for debugging and monitoring
 * 
 * ARCHITECTURE:
 * - Uses useUnifiedUserData for data fetching
 * - Integrates mutation hooks for operations
 * - Provides consolidated interface
 * 
 * MODIFICATIONS:
 * - Always update this file for unified user logic changes
 * - Do not create alternative unified user hooks
 * - Maintain consistency with underlying hooks
 * 
 * LAST UPDATED: 2025-06-27
 * MAINTAINER: System Architecture Team
 */

import { useUnifiedUserData } from './useUnifiedUserData';
import { useUserMutations } from './mutations/useUserMutations';
import { useRoleMutations } from './mutations/useRoleMutations';
import { useFacilityMutations } from './mutations/useFacilityMutations';

export const useConsistentUsers = () => {
  const { allUsers: users, isLoading, error, refetch, meta } = useUnifiedUserData();
  const { createUser, isCreatingUser } = useUserMutations();
  const { assignRole, isAssigningRole } = useRoleMutations();
  const { assignFacility, isAssigningFacility } = useFacilityMutations();

  return {
    users,
    isLoading,
    error,
    refetch,
    createUser,
    assignRole,
    assignFacility,
    isCreatingUser,
    isAssigningRole,
    isAssigningFacility,
    meta
  };
};

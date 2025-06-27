
/**
 * Unified User Management Hook
 * Provides all user management functionality in a single hook
 */

import { useUsers } from './useUsers';
import { useUserMutations } from './mutations/useUserMutations';
import { useRoleMutations } from './mutations/useRoleMutations';
import { useFacilityMutations } from './mutations/useFacilityMutations';

export const useUserManagement = () => {
  // Core data
  const { users, isLoading, error, refetch } = useUsers();
  
  // Mutations
  const { createUser, isCreatingUser } = useUserMutations();
  const { assignRole, isAssigningRole } = useRoleMutations();
  const { assignFacility, isAssigningFacility } = useFacilityMutations();

  // Computed values
  const totalUsers = users?.length || 0;
  const usersWithRoles = users?.filter(u => u.user_roles && u.user_roles.length > 0).length || 0;
  const usersWithFacilities = users?.filter(u => u.facilities).length || 0;

  return {
    // Data
    users,
    isLoading,
    error,
    refetch,
    
    // Actions
    createUser,
    assignRole,
    assignFacility,
    
    // Loading states
    isCreatingUser,
    isAssigningRole,
    isAssigningFacility,
    
    // Computed stats
    stats: {
      totalUsers,
      usersWithRoles,
      usersWithFacilities,
      activeUsers: totalUsers
    }
  };
};

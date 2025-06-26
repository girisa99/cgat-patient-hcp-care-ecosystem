
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

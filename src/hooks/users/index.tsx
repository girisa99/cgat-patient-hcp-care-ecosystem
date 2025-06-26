
/**
 * Refactored Users Hook - Now uses smaller, focused modules
 */
import { useUserData } from './useUserData';
import { useUserMutations } from './useUserMutations';

export const useUsers = () => {
  const { data: users, isLoading, error, refetch } = useUserData();
  const mutations = useUserMutations();

  return {
    users,
    isLoading,
    error,
    refetch,
    ...mutations
  };
};

// Re-export individual hooks for direct use
export { useUserData } from './useUserData';
export { useUserMutations } from './useUserMutations';

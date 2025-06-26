
/**
 * Refactored Auth Hook - Now uses smaller, focused modules
 */
import { useAuthData } from './useAuthData';
import { useAuthActions } from './useAuthActions';

export const useAuth = () => {
  const authData = useAuthData();
  const authActions = useAuthActions(authData.user, authData.userRoles);

  return {
    ...authData,
    ...authActions
  };
};

// Re-export individual hooks for direct use
export { useAuthData } from './useAuthData';
export { useAuthActions } from './useAuthActions';


import { useAuthContext } from '@/components/auth/CleanAuthProvider';
import { useSimpleRouting } from './useSimpleRouting';

export const useIntelligentRouting = () => {
  const { userRoles, isAuthenticated, isLoading } = useAuthContext();
  const { performRouting, getDefaultRoute } = useSimpleRouting({ 
    userRoles, 
    isAuthenticated 
  });

  return {
    performRouting,
    getDefaultRoute,
    isLoading
  };
};

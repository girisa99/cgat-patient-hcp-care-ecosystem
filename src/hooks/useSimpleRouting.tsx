
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface SimpleRoutingProps {
  userRoles: UserRole[];
  isAuthenticated: boolean;
}

export const useSimpleRouting = ({ userRoles, isAuthenticated }: SimpleRoutingProps) => {
  const navigate = useNavigate();

  const getDefaultRoute = useCallback((): string => {
    if (!isAuthenticated || userRoles.length === 0) {
      return '/';
    }

    // Simple, clear routing logic
    if (userRoles.includes('superAdmin')) {
      return '/dashboard';
    }
    
    if (userRoles.includes('onboardingTeam')) {
      return '/onboarding';
    }
    
    if (userRoles.includes('healthcareProvider') || userRoles.includes('nurse')) {
      return '/patients';
    }
    
    if (userRoles.includes('caseManager')) {
      return '/patients';
    }
    
    // Default fallback
    return '/dashboard';
  }, [userRoles, isAuthenticated]);

  const performRouting = useCallback(() => {
    const route = getDefaultRoute();
    console.log('🚀 Routing to:', route, 'for roles:', userRoles);
    navigate(route, { replace: true });
  }, [getDefaultRoute, navigate, userRoles]);

  return {
    performRouting,
    getDefaultRoute
  };
};

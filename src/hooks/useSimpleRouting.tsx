
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface SimpleRoutingProps {
  userRoles: string[];
  isAuthenticated: boolean;
}

export const useSimpleRouting = ({ userRoles, isAuthenticated }: SimpleRoutingProps) => {
  const navigate = useNavigate();

  const getDefaultRoute = useCallback((): string => {
    if (!isAuthenticated) {
      return '/';
    }

    console.log('🗺️ Determining route for roles:', userRoles);

    // If we have roles, use them for routing
    if (userRoles.length > 0) {
      if (userRoles.includes('superAdmin')) {
        console.log('🗺️ Routing super admin to agents');
        return '/agents';
      }
      
      if (userRoles.includes('onboardingTeam')) {
        console.log('🗺️ Routing onboarding team to agents');
        return '/agents';
      }
      
      if (userRoles.includes('healthcareProvider') || userRoles.includes('nurse')) {
        console.log('🗺️ Routing healthcare staff to patients');
        return '/patients';
      }
      
      if (userRoles.includes('caseManager')) {
        console.log('🗺️ Routing case manager to patients');
        return '/patients';
      }
      
      if (userRoles.includes('patientCaregiver')) {
        console.log('🗺️ Routing patient to dashboard');
        return '/dashboard';
      }
    }
    
    // Default fallback - if authenticated but no specific roles, go to dashboard
    console.log('🗺️ Using default dashboard route');
    return '/dashboard';
  }, [userRoles, isAuthenticated]);

  const performRouting = useCallback(() => {
    const route = getDefaultRoute();
    console.log('🚀 Navigating to:', route, 'for roles:', userRoles);
    
    try {
      navigate(route, { replace: true });
      console.log('✅ Navigation completed to:', route);
    } catch (error) {
      console.error('❌ Navigation error:', error);
      // Fallback to direct navigation
      window.location.href = route;
    }
  }, [getDefaultRoute, navigate, userRoles]);

  return {
    performRouting,
    getDefaultRoute
  };
};

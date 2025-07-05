
import { useMemo } from 'react';
import { navItems } from '@/nav-items';
import { useMasterAuth } from './useMasterAuth';

export const useRoleBasedNavigation = () => {
  const { userRoles, isAuthenticated } = useMasterAuth();

  const getVisibleNavItems = useMemo(() => {
    if (!isAuthenticated) {
      return [];
    }

    // Define role-based access
    const roleAccess = {
      dashboard: ['superAdmin', 'onboardingTeam', 'caseManager', 'nurse', 'provider', 'patientCaregiver'],
      users: ['superAdmin', 'onboardingTeam'],
      patients: ['superAdmin', 'onboardingTeam', 'caseManager', 'nurse', 'provider'],
      facilities: ['superAdmin', 'onboardingTeam'],
      onboarding: ['superAdmin', 'onboardingTeam'],
      modules: ['superAdmin', 'onboardingTeam'],
      'api-services': ['superAdmin', 'onboardingTeam'],
      ngrok: ['superAdmin'],
      security: ['superAdmin'],
      reports: ['superAdmin', 'onboardingTeam', 'caseManager'],
      testing: ['superAdmin'],
      'role-management': ['superAdmin'],
    };

    return navItems.filter(item => {
      const path = item.url.replace('/', '') || 'dashboard';
      const allowedRoles = roleAccess[path as keyof typeof roleAccess] || [];
      return userRoles.some(role => allowedRoles.includes(role));
    });
  }, [userRoles, isAuthenticated]);

  const hasAccess = (path: string) => {
    if (!isAuthenticated) return false;
    
    const cleanPath = path.replace('/', '') || 'dashboard';
    const roleAccess = {
      dashboard: ['superAdmin', 'onboardingTeam', 'caseManager', 'nurse', 'provider', 'patientCaregiver'],
      users: ['superAdmin', 'onboardingTeam'],
      patients: ['superAdmin', 'onboardingTeam', 'caseManager', 'nurse', 'provider'],
      facilities: ['superAdmin', 'onboardingTeam'],
      onboarding: ['superAdmin', 'onboardingTeam'],
      modules: ['superAdmin', 'onboardingTeam'],
      'api-services': ['superAdmin', 'onboardingTeam'],
      ngrok: ['superAdmin'],
      security: ['superAdmin'],
      reports: ['superAdmin', 'onboardingTeam', 'caseManager'],
      testing: ['superAdmin'],
      'role-management': ['superAdmin'],
    };

    const allowedRoles = roleAccess[cleanPath as keyof typeof roleAccess] || [];
    return userRoles.some(role => allowedRoles.includes(role));
  };

  const getNavItemsByRole = () => {
    return userRoles.reduce((acc, role) => {
      acc[role] = navItems.filter(item => {
        const path = item.url.replace('/', '') || 'dashboard';
        const roleAccess = {
          dashboard: ['superAdmin', 'onboardingTeam', 'caseManager', 'nurse', 'provider', 'patientCaregiver'],
          users: ['superAdmin', 'onboardingTeam'],
          patients: ['superAdmin', 'onboardingTeam', 'caseManager', 'nurse', 'provider'],
          facilities: ['superAdmin', 'onboardingTeam'],
          onboarding: ['superAdmin', 'onboardingTeam'],
          modules: ['superAdmin', 'onboardingTeam'],
          'api-services': ['superAdmin', 'onboardingTeam'],
          ngrok: ['superAdmin'],
          security: ['superAdmin'],
          reports: ['superAdmin', 'onboardingTeam', 'caseManager'],
          testing: ['superAdmin'],
          'role-management': ['superAdmin'],
        };
        
        const allowedRoles = roleAccess[path as keyof typeof roleAccess] || [];
        return allowedRoles.includes(role);
      });
      return acc;
    }, {} as Record<string, typeof navItems>);
  };

  const getFilteredNavItems = () => {
    if (!isAuthenticated) return [];
    
    return navItems.filter(item => {
      const path = item.url.replace('/', '') || 'dashboard';
      const roleAccess = {
        dashboard: ['superAdmin', 'onboardingTeam', 'caseManager', 'nurse', 'provider', 'patientCaregiver'],
        users: ['superAdmin', 'onboardingTeam'],
        patients: ['superAdmin', 'onboardingTeam', 'caseManager', 'nurse', 'provider'],
        facilities: ['superAdmin', 'onboardingTeam'],
        onboarding: ['superAdmin', 'onboardingTeam'],
        modules: ['superAdmin', 'onboardingTeam'],
        'api-services': ['superAdmin', 'onboardingTeam'],
        ngrok: ['superAdmin'],
        security: ['superAdmin'],
        reports: ['superAdmin', 'onboardingTeam', 'caseManager'],
        testing: ['superAdmin'],
        'role-management': ['superAdmin'],
      };
      
      const allowedRoles = roleAccess[path as keyof typeof roleAccess] || [];
      return userRoles.some(role => allowedRoles.includes(role));
    });
  };

  const isAccessibleRoute = (routePath: string) => {
    const cleanPath = routePath.replace(/^\//, '') || 'dashboard';
    return hasAccess(cleanPath);
  };

  const getRedirectPath = () => {
    // Priority order for redirection based on role
    if (userRoles.includes('superAdmin')) return '/';
    if (userRoles.includes('onboardingTeam')) return '/onboarding';
    if (userRoles.includes('caseManager') || userRoles.includes('nurse') || userRoles.includes('provider')) return '/patients';
    if (userRoles.includes('patientCaregiver')) return '/';
    return '/';
  };

  // Transform navigation items to match expected format
  const transformedNavItems = getVisibleNavItems.map(item => ({
    ...item,
    to: item.url, // Add 'to' property that maps to 'url'
  }));

  return {
    visibleNavItems: getVisibleNavItems,
    transformedNavItems,
    hasAccess,
    getNavItemsByRole,
    getFilteredNavItems,
    isAccessibleRoute,
    getRedirectPath,
    userRoles,
    isAuthenticated,
  };
};

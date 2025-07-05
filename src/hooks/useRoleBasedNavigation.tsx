import { useMemo } from 'react';
import { navItems } from '@/nav-items';
import { useMasterAuth } from './useMasterAuth';

export const useRoleBasedNavigation = () => {
  const { userRoles, isAuthenticated, user, profile } = useMasterAuth();

  const getVisibleNavItems = useMemo(() => {
    // If not authenticated, assume development mode and expose all nav items for easier testing
    if (!isAuthenticated) {
      return navItems;
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

  const hasPermission = (permission: string) => {
    // Simple permission check based on roles
    if (userRoles.includes('superAdmin')) return true;
    // Add more permission logic as needed
    return false;
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

  // Current role (primary role)
  const currentRole = userRoles.length > 0 ? userRoles[0] : null;
  
  // Admin checks
  const isAdmin = userRoles.includes('onboardingTeam') || userRoles.includes('superAdmin');
  const isSuperAdmin = userRoles.includes('superAdmin');

  // Available tabs (mapped from visible nav items)
  const availableTabs = getVisibleNavItems.map(item => ({
    ...item,
    to: item.url,
  }));

  // Role stats
  const roleStats = {
    totalRoles: userRoles.length,
    primaryRole: currentRole,
    isAdmin,
    isSuperAdmin,
  };

  // Transform navigation items to match expected format
  const transformedNavItems = getVisibleNavItems.map(item => ({
    ...item,
    to: item.url, // Add 'to' property that maps to 'url'
  }));

  return {
    // Core navigation
    visibleNavItems: getVisibleNavItems,
    transformedNavItems,
    availableTabs,
    
    // User info
    user,
    profile,
    currentRole,
    roleStats,
    
    // Permission checks
    hasAccess,
    hasPermission,
    isAdmin,
    isSuperAdmin,
    
    // Utility functions
    getNavItemsByRole,
    getFilteredNavItems,
    isAccessibleRoute,
    getRedirectPath,
    
    // Auth state
    userRoles,
    isAuthenticated,
  };
};


import { useMemo } from 'react';
import { navItems } from '@/nav-items';
import { useMasterAuth } from './useMasterAuth';

export const useRoleBasedNavigation = () => {
  const { userRoles, isAuthenticated, user, profile } = useMasterAuth();

  console.log('🧭 useRoleBasedNavigation called with:', {
    userRoles,
    isAuthenticated,
    userExists: !!user,
    profileExists: !!profile
  });

  const getVisibleNavItems = useMemo(() => {
    console.log('🧭 Computing visible nav items...', {
      isAuthenticated,
      userRolesLength: userRoles.length,
      userRoles,
      totalNavItems: navItems.length
    });

    if (!isAuthenticated) {
      console.log('🚫 Not authenticated, returning empty array');
      return [];
    }

    // During development, show all pages if no roles are assigned yet
    // This prevents the app from being unusable during setup
    if (userRoles.length === 0) {
      console.log('🚧 Development mode: No roles assigned, showing all navigation items');
      return navItems;
    }

    // Define role-based access - more permissive for development
    const roleAccess = {
      dashboard: ['superAdmin', 'onboardingTeam', 'caseManager', 'nurse', 'provider', 'patientCaregiver'],
      users: ['superAdmin', 'onboardingTeam'],
      patients: ['superAdmin', 'onboardingTeam', 'caseManager', 'nurse', 'provider', 'patientCaregiver'],
      facilities: ['superAdmin', 'onboardingTeam'],
      onboarding: ['superAdmin', 'onboardingTeam'],
      modules: ['superAdmin', 'onboardingTeam'],
      'api-services': ['superAdmin', 'onboardingTeam'],
      ngrok: ['superAdmin', 'onboardingTeam'],
      security: ['superAdmin'],
      reports: ['superAdmin', 'onboardingTeam', 'caseManager'],
      testing: ['superAdmin', 'onboardingTeam'],
      'role-management': ['superAdmin'],
      'data-import': ['superAdmin', 'onboardingTeam'],
      'governance': ['superAdmin', 'onboardingTeam'],
      'active-verification': ['superAdmin', 'onboardingTeam'],
      'framework': ['superAdmin', 'onboardingTeam'],
      'stability': ['superAdmin', 'onboardingTeam'],
      'healthcare-ai': ['superAdmin', 'onboardingTeam'],
    };

    const filteredItems = navItems.filter(item => {
      const path = item.url.replace('/', '') || 'dashboard';
      const allowedRoles = roleAccess[path as keyof typeof roleAccess] || [];
      const hasAccess = userRoles.some(role => allowedRoles.includes(role));
      
      // For development, log which items are being filtered
      if (!hasAccess) {
        console.log(`🚫 Navigation filtered: ${item.title} (requires: ${allowedRoles.join(', ')}, have: ${userRoles.join(', ')})`);
      } else {
        console.log(`✅ Navigation allowed: ${item.title}`);
      }
      
      return hasAccess;
    });

    console.log('🧭 Final filtered nav items:', filteredItems.map(item => item.title));
    return filteredItems;
  }, [userRoles, isAuthenticated]);

  const hasAccess = (path: string) => {
    if (!isAuthenticated) return false;
    
    // During development, allow access if no roles assigned
    if (userRoles.length === 0) {
      console.log('🚧 Development mode: Allowing access to', path);
      return true;
    }
    
    const cleanPath = path.replace('/', '') || 'dashboard';
    const roleAccess = {
      dashboard: ['superAdmin', 'onboardingTeam', 'caseManager', 'nurse', 'provider', 'patientCaregiver'],
      users: ['superAdmin', 'onboardingTeam'],
      patients: ['superAdmin', 'onboardingTeam', 'caseManager', 'nurse', 'provider', 'patientCaregiver'],
      facilities: ['superAdmin', 'onboardingTeam'],
      onboarding: ['superAdmin', 'onboardingTeam'],
      modules: ['superAdmin', 'onboardingTeam'],
      'api-services': ['superAdmin', 'onboardingTeam'],
      ngrok: ['superAdmin', 'onboardingTeam'],
      security: ['superAdmin'],
      reports: ['superAdmin', 'onboardingTeam', 'caseManager'],
      testing: ['superAdmin', 'onboardingTeam'],
      'role-management': ['superAdmin'],
      'data-import': ['superAdmin', 'onboardingTeam'],
      'active-verification': ['superAdmin', 'onboardingTeam'],
      'governance': ['superAdmin', 'onboardingTeam'],
    };

    const allowedRoles = roleAccess[cleanPath as keyof typeof roleAccess] || [];
    return userRoles.some(role => allowedRoles.includes(role));
  };

  
  const hasPermission = (permission: string) => {
    // Simple permission check based on roles
    if (userRoles.includes('superAdmin')) return true;
    // During development, be more permissive
    if (userRoles.length === 0) return true;
    return false;
  };

  const getNavItemsByRole = () => {
    return userRoles.reduce((acc, role) => {
      acc[role] = navItems.filter(item => {
        const path = item.url.replace('/', '') || 'dashboard';
        const roleAccess = {
          dashboard: ['superAdmin', 'onboardingTeam', 'caseManager', 'nurse', 'provider', 'patientCaregiver'],
          users: ['superAdmin', 'onboardingTeam'],
          patients: ['superAdmin', 'onboardingTeam', 'caseManager', 'nurse', 'provider', 'patientCaregiver'],
          facilities: ['superAdmin', 'onboardingTeam'],
          onboarding: ['superAdmin', 'onboardingTeam'],
          modules: ['superAdmin', 'onboardingTeam'],
          'api-services': ['superAdmin', 'onboardingTeam'],
          ngrok: ['superAdmin', 'onboardingTeam'],
          security: ['superAdmin'],
          reports: ['superAdmin', 'onboardingTeam', 'caseManager'],
          testing: ['superAdmin', 'onboardingTeam'],
          'role-management': ['superAdmin'],
          'data-import': ['superAdmin', 'onboardingTeam'],
          'active-verification': ['superAdmin', 'onboardingTeam'],
        };
        
        const allowedRoles = roleAccess[path as keyof typeof roleAccess] || [];
        return allowedRoles.includes(role);
      });
      return acc;
    }, {} as Record<string, typeof navItems>);
  };

  const getFilteredNavItems = () => {
    if (!isAuthenticated) return [];
    return getVisibleNavItems;
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

  // Role stats with proper interface
  const roleStats = {
    totalRoles: userRoles.length,
    primaryRole: currentRole || 'none',
    isAdmin,
    isSuperAdmin,
    roleLevel: isAdmin ? 'admin' : 'user', // Add roleLevel property
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

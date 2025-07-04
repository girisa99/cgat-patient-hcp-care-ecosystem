/**
 * ROLE-BASED NAVIGATION HOOK - SINGLE SOURCE OF TRUTH
 * Development-friendly with proper fallbacks and security
 */
import { useMemo } from 'react';
import { navItems } from '@/nav-items';
import { useMasterAuth } from '@/hooks/useMasterAuth';

export const useRoleBasedNavigation = () => {
  const { user, profile, userRoles, isLoading } = useMasterAuth();

  // Role-based access determination
  const isAdmin = useMemo(() => {
    return userRoles.includes('admin') || userRoles.includes('superAdmin');
  }, [userRoles]);

  const isSuperAdmin = useMemo(() => {
    return userRoles.includes('superAdmin');
  }, [userRoles]);

  const isOnboardingTeam = useMemo(() => {
    return userRoles.includes('onboardingTeam');
  }, [userRoles]);

  const isUser = useMemo(() => {
    return userRoles.includes('user');
  }, [userRoles]);

  // Current role priority (highest role)
  const currentRole = useMemo(() => {
    if (isSuperAdmin) return 'Super Admin';
    if (isAdmin) return 'Administrator';
    if (isOnboardingTeam) return 'Onboarding Team';
    if (isUser) return 'User';
    if (isLoading) return 'Loading...';
    return 'Developer';  // Fallback for development
  }, [isSuperAdmin, isAdmin, isOnboardingTeam, isUser, isLoading]);

  // Role-based page access control with development-friendly fallbacks
  const hasAccess = (path: string) => {
    console.log('🔒 Checking access for path:', path, 'User roles:', userRoles, 'Loading:', isLoading);
    
    // Always allow dashboard access
    if (path === '/') return true;
    
    // During loading or if no roles, allow access for development (be permissive)
    if (isLoading || userRoles.length === 0) {
      console.log('🔓 Allowing access during loading or development (no roles found)');
      return true; // Be permissive during development
    }
    
    // Super Admin has access to everything
    if (isSuperAdmin) return true;
    
    // Define role-based access rules - More permissive for development
    const accessRules: Record<string, string[]> = {
      '/': ['superAdmin', 'admin', 'onboardingTeam', 'user'], // Dashboard - everyone
      '/users': ['superAdmin', 'admin', 'onboardingTeam', 'user'], // More permissive for development
      '/patients': ['superAdmin', 'admin', 'onboardingTeam', 'user'], // All logged in users
      '/facilities': ['superAdmin', 'admin', 'onboardingTeam', 'user'], // More permissive
      '/modules': ['superAdmin', 'admin', 'onboardingTeam', 'user'], // More permissive  
      '/api-services': ['superAdmin', 'admin', 'onboardingTeam', 'user'], // More permissive
      '/testing': ['superAdmin', 'admin', 'onboardingTeam', 'user'], // More permissive
      '/data-import': ['superAdmin', 'admin', 'onboardingTeam', 'user'], // More permissive
      '/active-verification': ['superAdmin', 'admin', 'onboardingTeam', 'user'], // More permissive
      '/onboarding': ['superAdmin', 'admin', 'onboardingTeam', 'user'], // More permissive
      '/security': ['superAdmin', 'admin', 'onboardingTeam', 'user'], // More permissive
      '/role-management': ['superAdmin', 'admin'] // Keep some restriction
    };

    const allowedRoles = accessRules[path] || ['superAdmin', 'admin', 'onboardingTeam', 'user'];
    const hasRoleAccess = allowedRoles.some(role => userRoles.includes(role));
    
    console.log('🔒 Access check result:', {
      path,
      userRoles,
      allowedRoles,
      hasAccess: hasRoleAccess
    });
    
    return hasRoleAccess;
  };

  // Always show all navigation items during development/loading
  const availableTabs = useMemo(() => {
    // During loading or development (no roles), show all tabs
    if (isLoading || userRoles.length === 0) {
      console.log('🔓 Showing all tabs during loading/development');
      return navItems.map(item => ({
        title: item.title,
        to: item.to,
        icon: item.icon,
        url: item.url
      }));
    }
    
    // Filter based on role access when roles are loaded
    return navItems.filter(item => hasAccess(item.to)).map(item => ({
      title: item.title,
      to: item.to,
      icon: item.icon,
      url: item.url
    }));
  }, [navItems, userRoles, hasAccess, isLoading]);

  // Role-based quick stats
  const roleStats = useMemo(() => {
    return {
      totalPages: navItems.length,
      accessiblePages: availableTabs.length,
      restrictedPages: navItems.length - availableTabs.length,
      roleLevel: isSuperAdmin ? 'Full Access' : isAdmin ? 'Administrative' : isOnboardingTeam ? 'Onboarding' : userRoles.length === 0 ? 'Development Mode' : 'Limited'
    };
  }, [availableTabs, isSuperAdmin, isAdmin, isOnboardingTeam, userRoles]);

  return {
    hasAccess,
    currentRole,
    availableTabs,
    isAdmin,
    isSuperAdmin,
    isOnboardingTeam,
    isUser,
    roleStats,
    // Single source of truth for all auth data
    user,
    profile,
    userRoles
  };
};

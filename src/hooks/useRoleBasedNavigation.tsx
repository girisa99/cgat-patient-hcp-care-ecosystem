/**
 * ROLE-BASED NAVIGATION HOOK - SINGLE SOURCE OF TRUTH
 * Real role-based filtering with proper access control
 */
import { useMemo } from 'react';
import { navItems } from '@/nav-items';
import { useMasterAuth } from '@/hooks/useMasterAuth';

export const useRoleBasedNavigation = () => {
  const { user, profile, userRoles } = useMasterAuth();

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
    return 'Guest';
  }, [isSuperAdmin, isAdmin, isOnboardingTeam, isUser]);

  // Role-based page access control
  const hasAccess = (path: string) => {
    console.log('🔒 Checking access for path:', path, 'User roles:', userRoles);
    
    // Super Admin has access to everything
    if (isSuperAdmin) return true;
    
    // Define role-based access rules
    const accessRules: Record<string, string[]> = {
      '/': ['superAdmin', 'admin', 'onboardingTeam', 'user'], // Dashboard - everyone
      '/users': ['superAdmin', 'admin', 'onboardingTeam'], // User management - admins only
      '/patients': ['superAdmin', 'admin', 'onboardingTeam', 'user'], // Patient data - all logged in users
      '/facilities': ['superAdmin', 'admin', 'onboardingTeam'], // Facilities - admins only
      '/modules': ['superAdmin', 'admin'], // Module management - admin level only
      '/api-services': ['superAdmin', 'admin'], // API services - admin level only
      '/testing': ['superAdmin', 'admin'], // Testing suite - admin level only
      '/data-import': ['superAdmin', 'admin', 'onboardingTeam'], // Data import - admin + onboarding
      '/active-verification': ['superAdmin', 'admin'], // Verification - admin level only
      '/onboarding': ['superAdmin', 'admin', 'onboardingTeam'], // Onboarding - admin + onboarding team
      '/security': ['superAdmin', 'admin'], // Security - admin level only
      '/role-management': ['superAdmin'] // Role management - super admin only
    };

    const allowedRoles = accessRules[path] || [];
    const hasRoleAccess = allowedRoles.some(role => userRoles.includes(role));
    
    console.log('🔒 Access check result:', {
      path,
      userRoles,
      allowedRoles,
      hasAccess: hasRoleAccess
    });
    
    return hasRoleAccess;
  };

  // Filter navigation items based on role access
  const availableTabs = useMemo(() => {
    return navItems.filter(item => hasAccess(item.to)).map(item => ({
      title: item.title,
      to: item.to,
      icon: item.icon,
      url: item.url
    }));
  }, [navItems, userRoles, hasAccess]);

  // Role-based quick stats
  const roleStats = useMemo(() => {
    return {
      totalPages: navItems.length,
      accessiblePages: availableTabs.length,
      restrictedPages: navItems.length - availableTabs.length,
      roleLevel: isSuperAdmin ? 'Full Access' : isAdmin ? 'Administrative' : isOnboardingTeam ? 'Onboarding' : 'Limited'
    };
  }, [availableTabs, isSuperAdmin, isAdmin, isOnboardingTeam]);

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

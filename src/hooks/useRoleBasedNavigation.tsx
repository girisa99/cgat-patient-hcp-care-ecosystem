/**
 * ROLE-BASED NAVIGATION HOOK - ENTERPRISE HEALTHCARE RBAC
 * Proper role-based access control with no security bypassing
 */
import { useMemo } from 'react';
import { navItems } from '@/nav-items';
import { useMasterAuth } from '@/hooks/useMasterAuth';

// Healthcare role hierarchy (lower number = higher privilege)
const ROLE_HIERARCHY = {
  'superAdmin': 1,
  'admin': 2,
  'provider': 3,
  'nurse': 4,
  'onboardingTeam': 5,
  'technicalServices': 6,
  'billing': 7,
  'compliance': 8,
  'caregiver': 9,
  'patient': 10
} as const;

// Healthcare permissions for each page
const PAGE_PERMISSIONS = {
  '/': ['authenticated'], // Dashboard - requires any authentication
  '/users': ['users.read', 'admin.access'],
  '/patients': ['patients.read', 'clinical.access'],
  '/facilities': ['facilities.read', 'admin.access'],
  '/modules': ['modules.read', 'admin.access'],
  '/api-services': ['api.read', 'technical.access'],
  '/testing': ['testing.read', 'technical.access'],
  '/data-import': ['data.import', 'admin.access'],
  '/active-verification': ['verification.read', 'clinical.access'],
  '/onboarding': ['onboarding.read', 'onboarding.access'],
  '/security': ['security.read', 'admin.access'],
  '/role-management': ['roles.manage', 'superAdmin.access']
} as const;

// Role-based permissions mapping
const ROLE_PERMISSIONS = {
  'superAdmin': [
    'authenticated', 'users.read', 'users.write', 'users.delete',
    'patients.read', 'patients.write', 'patients.delete',
    'facilities.read', 'facilities.write', 'facilities.delete',
    'modules.read', 'modules.write', 'modules.delete',
    'api.read', 'api.write', 'api.delete',
    'testing.read', 'testing.write', 'testing.execute',
    'security.read', 'security.write', 'security.audit',
    'billing.read', 'billing.write', 'billing.process',
    'onboarding.read', 'onboarding.write', 'onboarding.approve',
    'verification.read', 'verification.write', 'verification.approve',
    'data.import', 'data.export', 'data.audit',
    'admin.access', 'clinical.access', 'technical.access',
    'onboarding.access', 'roles.manage', 'superAdmin.access'
  ],
  'admin': [
    'authenticated', 'users.read', 'users.write',
    'patients.read', 'patients.write',
    'facilities.read', 'facilities.write',
    'modules.read', 'modules.write',
    'api.read', 'api.write',
    'testing.read', 'testing.write',
    'security.read', 'security.write',
    'billing.read', 'billing.write',
    'onboarding.read', 'onboarding.write',
    'verification.read', 'verification.write',
    'data.import', 'data.export',
    'admin.access', 'clinical.access'
  ],
  'provider': [
    'authenticated', 'patients.read', 'patients.write',
    'facilities.read', 'modules.read',
    'verification.read', 'verification.write',
    'clinical.access'
  ],
  'nurse': [
    'authenticated', 'patients.read', 'patients.write',
    'facilities.read', 'modules.read',
    'verification.read', 'clinical.access'
  ],
  'onboardingTeam': [
    'authenticated', 'users.read', 'patients.read',
    'facilities.read', 'modules.read',
    'onboarding.read', 'onboarding.write', 'onboarding.approve',
    'verification.read', 'verification.write',
    'onboarding.access'
  ],
  'technicalServices': [
    'authenticated', 'api.read', 'api.write',
    'testing.read', 'testing.write', 'testing.execute',
    'modules.read', 'technical.access'
  ],
  'billing': [
    'authenticated', 'billing.read', 'billing.write', 'billing.process',
    'patients.read', 'facilities.read'
  ],
  'compliance': [
    'authenticated', 'security.read', 'security.audit',
    'patients.read', 'facilities.read', 'data.audit'
  ],
  'caregiver': [
    'authenticated', 'patients.read', 'facilities.read'
  ],
  'patient': [
    'authenticated', 'patients.read' // Limited to own data via RLS
  ]
} as const;

export const useRoleBasedNavigation = () => {
  const { user, profile, userRoles, isLoading, isAuthenticated } = useMasterAuth();

  // Role hierarchy and permissions
  const primaryRole = useMemo(() => {
    if (!userRoles || userRoles.length === 0) return null;
    
    // Get highest priority role
    return userRoles.reduce((highest, current) => {
      const currentPriority = ROLE_HIERARCHY[current as keyof typeof ROLE_HIERARCHY] || 999;
      const highestPriority = ROLE_HIERARCHY[highest as keyof typeof ROLE_HIERARCHY] || 999;
      return currentPriority < highestPriority ? current : highest;
    });
  }, [userRoles]);

  const userPermissions = useMemo(() => {
    if (!userRoles || userRoles.length === 0) return [];
    
    const permissions = new Set<string>();
    userRoles.forEach(role => {
      const rolePermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
      rolePermissions.forEach(permission => permissions.add(permission));
    });
    
    return Array.from(permissions);
  }, [userRoles]);

  // Role-based access determination
  const isAdmin = useMemo(() => {
    return userRoles.includes('admin') || userRoles.includes('superAdmin');
  }, [userRoles]);

  const isSuperAdmin = useMemo(() => {
    return userRoles.includes('superAdmin');
  }, [userRoles]);

  const isProvider = useMemo(() => {
    return userRoles.includes('provider');
  }, [userRoles]);

  const isPatient = useMemo(() => {
    return userRoles.includes('patient');
  }, [userRoles]);

  // Current role display
  const currentRole = useMemo(() => {
    if (isLoading) return 'Loading...';
    if (!isAuthenticated) return 'Unauthenticated';
    if (!primaryRole) return 'No Role Assigned';
    
    const roleDisplayNames: Record<string, string> = {
      'superAdmin': 'Super Administrator',
      'admin': 'Administrator',
      'provider': 'Healthcare Provider',
      'nurse': 'Nursing Staff',
      'onboardingTeam': 'Onboarding Team',
      'technicalServices': 'Technical Services',
      'billing': 'Billing Department',
      'compliance': 'Compliance Officer',
      'caregiver': 'Caregiver',
      'patient': 'Patient'
    };
    
    return roleDisplayNames[primaryRole] || primaryRole;
  }, [primaryRole, isLoading, isAuthenticated]);

  // Strict permission checking
  const hasPermission = (permission: string) => {
    return userPermissions.includes(permission);
  };

  // Page access control - NO BYPASSING
  const hasAccess = (path: string) => {
    console.log('🔒 RBAC Check:', {
      path,
      isAuthenticated,
      isLoading,
      userRoles,
      primaryRole,
      userPermissions: userPermissions.slice(0, 5) // Log first 5 permissions
    });
    
    // NO ACCESS during loading
    if (isLoading) {
      console.log('❌ Access denied: Still loading authentication');
      return false;
    }
    
    // NO ACCESS without authentication
    if (!isAuthenticated) {
      console.log('❌ Access denied: Not authenticated');
      return false;
    }
    
    // NO ACCESS without roles
    if (!userRoles || userRoles.length === 0) {
      console.log('❌ Access denied: No roles assigned');
      return false;
    }
    
    // Check required permissions for path
    const requiredPermissions = PAGE_PERMISSIONS[path as keyof typeof PAGE_PERMISSIONS] || ['authenticated'];
    const hasRequiredPermission = requiredPermissions.some(permission => 
      hasPermission(permission)
    );
    
    console.log('� Permission check result:', {
      path,
      requiredPermissions,
      hasAccess: hasRequiredPermission,
      userRole: primaryRole
    });
    
    return hasRequiredPermission;
  };

  // Available navigation tabs based on strict permissions
  const availableTabs = useMemo(() => {
    // NO TABS during loading
    if (isLoading) {
      console.log('⏳ No tabs available during loading');
      return [];
    }
    
    // NO TABS without authentication
    if (!isAuthenticated) {
      console.log('❌ No tabs available: Not authenticated');
      return [];
    }
    
    // NO TABS without roles
    if (!userRoles || userRoles.length === 0) {
      console.log('❌ No tabs available: No roles assigned');
      return [];
    }
    
    // Filter tabs based on permissions
    const accessibleTabs = navItems.filter(item => hasAccess(item.to)).map(item => ({
      title: item.title,
      to: item.to,
      icon: item.icon,
      url: item.url
    }));
    
    console.log('📋 Available tabs:', accessibleTabs.map(t => t.title));
    
    return accessibleTabs;
  }, [navItems, isLoading, isAuthenticated, userRoles, hasAccess]);

  // Role statistics
  const roleStats = useMemo(() => {
    if (!isAuthenticated) {
      return {
        totalPages: navItems.length,
        accessiblePages: 0,
        restrictedPages: navItems.length,
        roleLevel: 'Not Authenticated',
        securityLevel: 'Blocked'
      };
    }
    
    if (!userRoles || userRoles.length === 0) {
      return {
        totalPages: navItems.length,
        accessiblePages: 0,
        restrictedPages: navItems.length,
        roleLevel: 'No Role Assigned',
        securityLevel: 'Blocked'
      };
    }
    
    return {
      totalPages: navItems.length,
      accessiblePages: availableTabs.length,
      restrictedPages: navItems.length - availableTabs.length,
      roleLevel: isSuperAdmin ? 'Full Access' : 
                 isAdmin ? 'Administrative' : 
                 isProvider ? 'Clinical' : 
                 isPatient ? 'Patient' : 'Limited',
      securityLevel: 'Authenticated'
    };
  }, [availableTabs, isSuperAdmin, isAdmin, isProvider, isPatient, userRoles, isAuthenticated]);

  return {
    // Access control
    hasAccess,
    hasPermission,
    
    // Role information
    currentRole,
    primaryRole,
    userPermissions,
    
    // Navigation
    availableTabs,
    
    // Role flags
    isAdmin,
    isSuperAdmin,
    isProvider,
    isPatient,
    
    // Statistics
    roleStats,
    
    // Authentication state
    isAuthenticated,
    user,
    profile,
    userRoles
  };
};

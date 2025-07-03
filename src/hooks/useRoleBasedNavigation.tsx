import { useMemo } from 'react';
import { useAuthContext } from '@/components/auth/DatabaseAuthProvider';
import { navItems, NavItem } from '@/nav-items';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface RoleBasedNavigation {
  availableTabs: NavItem[];
  hasAccess: (path: string) => boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  currentRole: UserRole | null;
  filteredRoutes: NavItem[];
}

/**
 * SINGLE SOURCE OF TRUTH for Role-Based Navigation
 * Manages what tabs/pages users can access based on their roles
 */
export const useRoleBasedNavigation = (): RoleBasedNavigation => {
  const { user, profile, isAuthenticated } = useAuthContext();

  // Determine user role and admin status
  const userRole = profile?.role || null;
  const isAdmin = userRole === 'superAdmin' || userRole === 'onboardingTeam';
  const isSuperAdmin = userRole === 'superAdmin';

  // Define role-based access rules (using actual database enum values)
  const roleAccessMap = useMemo(() => {
    const accessMap: Record<string, UserRole[]> = {
      '/': ['superAdmin', 'onboardingTeam', 'healthcareProvider', 'caseManager', 'nurse', 'patientCaregiver'], // Dashboard - all authenticated
      '/users': ['superAdmin', 'onboardingTeam'], // User Management - admin only
      '/patients': ['superAdmin', 'onboardingTeam', 'healthcareProvider', 'caseManager', 'nurse'], // Patient Management
      '/facilities': ['superAdmin', 'onboardingTeam', 'healthcareProvider'], // Facility Management
      '/modules': ['superAdmin', 'onboardingTeam'], // Module Management - admin only
      '/api-services': ['superAdmin', 'onboardingTeam'], // API Services - admin only
      '/security': ['superAdmin'], // Security - super admin only
      '/testing': ['superAdmin', 'onboardingTeam'], // Testing Suite - admin only
      '/data-import': ['superAdmin', 'onboardingTeam'], // Data Import - admin only
      '/active-verification': ['superAdmin', 'onboardingTeam'], // Verification - admin only
      '/onboarding': ['superAdmin', 'onboardingTeam'], // Onboarding - admin only
    };
    return accessMap;
  }, []);

  // Filter available tabs based on user role
  const availableTabs = useMemo(() => {
    if (!isAuthenticated || !userRole) {
      return [navItems[0]]; // Only dashboard for non-authenticated
    }

    return navItems.filter(navItem => {
      const allowedRoles = roleAccessMap[navItem.to];
      return allowedRoles?.includes(userRole) || false;
    });
  }, [isAuthenticated, userRole, roleAccessMap]);

  // Function to check if user has access to specific path
  const hasAccess = useMemo(() => {
    return (path: string): boolean => {
      if (!isAuthenticated || !userRole) {
        return path === '/'; // Only dashboard for non-authenticated
      }

      const allowedRoles = roleAccessMap[path];
      return allowedRoles?.includes(userRole) || false;
    };
  }, [isAuthenticated, userRole, roleAccessMap]);

  // Filter routes for routing purposes
  const filteredRoutes = useMemo(() => {
    return availableTabs;
  }, [availableTabs]);

  console.log('🧭 Role-based navigation:', {
    userRole,
    isAdmin,
    isSuperAdmin,
    availableTabsCount: availableTabs.length,
    availablePaths: availableTabs.map(tab => tab.to)
  });

  return {
    availableTabs,
    hasAccess,
    isAdmin,
    isSuperAdmin,
    currentRole: userRole,
    filteredRoutes
  };
};

/**
 * ROLE DEFINITIONS & ACCESS LEVELS (Based on Database Enum)
 * 
 * 🔴 SUPER ADMIN (superAdmin):
 * - Full system access
 * - All modules, security, testing, verification
 * 
 * 🟠 ONBOARDING TEAM (onboardingTeam):
 * - Administrative access
 * - No security module access
 * 
 * 🟡 HEALTHCARE PROVIDER (healthcareProvider):
 * - Facility management
 * - Patient management within facility
 * 
 * 🟢 CASE MANAGER (caseManager):
 * - Patient management
 * - Clinical operations
 * 
 * 🔵 NURSE (nurse):
 * - Patient care access
 * - Basic clinical operations
 * 
 * 🟣 PATIENT CAREGIVER (patientCaregiver):
 * - Dashboard access only
 * - Limited patient interaction
 * 
 * 🟤 FINANCE TEAM (financeTeam):
 * - Financial operations
 * - Billing and payment management
 * 
 * 🟫 CONTRACT TEAM (contractTeam):
 * - Contract management
 * - Legal and compliance operations
 * 
 * ⚫ WORKFLOW MANAGER (workflowManager):
 * - Workflow optimization
 * - Process management
 */
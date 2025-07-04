
/**
 * ROLE-BASED NAVIGATION HOOK
 * Enhanced with full navigation capabilities and role management
 */
import { useState, useMemo } from 'react';
import { navItems } from '@/nav-items';
import { useAuthContext } from '@/components/auth/DatabaseAuthProvider';

export const useRoleBasedNavigation = () => {
  const [currentRole] = useState('user');
  const { user, profile } = useAuthContext();

  // Enhanced navigation with all available tabs
  const availableTabs = useMemo(() => {
    return navItems.map(item => ({
      title: item.title,
      to: item.to,
      icon: item.icon,
      url: item.url
    }));
  }, []);

  // Role-based access determination
  const isAdmin = useMemo(() => {
    return profile?.user_roles?.some(role => 
      ['superAdmin', 'onboardingTeam'].includes(role.role?.name)
    ) || false;
  }, [profile]);

  const isSuperAdmin = useMemo(() => {
    return profile?.user_roles?.some(role => 
      role.role?.name === 'superAdmin'
    ) || false;
  }, [profile]);

  const hasAccess = (path: string) => {
    console.log('🔒 Checking access for path:', path);
    return true; // Allow access to all paths for now
  };

  return {
    hasAccess,
    currentRole,
    availableTabs,
    isAdmin,
    isSuperAdmin
  };
};

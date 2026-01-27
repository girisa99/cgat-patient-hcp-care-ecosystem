/**
 * GENIE STUDIO NAVIGATION HOOK
 * Provides filtered navigation for Genie Studio users
 * Based on subscription tier and internal user status
 */

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useGenieStudioAuth } from './useGenieStudioAuth';
import { 
  getGenieStudioNavItems, 
  getGenieNavByCategory,
  isGenieStudioAccessiblePath,
  SubscriptionTier,
  GenieNavItem,
  TIER_INFO,
} from '@/config/genieStudioNavItems';

export interface UseGenieStudioNavigationReturn {
  // Navigation items
  navItems: GenieNavItem[];
  navByCategory: Record<string, GenieNavItem[]>;
  
  // Access checks
  isAccessiblePath: (path: string) => boolean;
  canAccessRoute: boolean;
  
  // User context
  userTier: SubscriptionTier;
  isInternal: boolean;
  isGenieStudioUser: boolean;
  tierInfo: typeof TIER_INFO[SubscriptionTier];
  
  // Upgrade prompts
  getUpgradePromptForPath: (path: string) => { requiredTier: SubscriptionTier; tierName: string } | null;
}

/**
 * Hook for Genie Studio-specific navigation
 * Filters nav items based on user subscription and internal status
 */
export function useGenieStudioNavigation(): UseGenieStudioNavigationReturn {
  const location = useLocation();
  const { 
    isAuthenticated, 
    genieUser,
    isInternalUser,
  } = useGenieStudioAuth();

  // Determine user tier
  const userTier = useMemo((): SubscriptionTier => {
    if (!genieUser) return 'free';
    return (genieUser.current_subscription_tier as SubscriptionTier) || 'free';
  }, [genieUser]);

  // Check if user is a Genie Studio user (has genie_studio_users record)
  const isGenieStudioUser = useMemo(() => {
    return isAuthenticated && !!genieUser;
  }, [isAuthenticated, genieUser]);

  // Get filtered navigation items
  const navItems = useMemo(() => {
    if (!isAuthenticated) return [];
    return getGenieStudioNavItems(userTier, isInternalUser);
  }, [isAuthenticated, userTier, isInternalUser]);

  // Get items by category
  const navByCategory = useMemo(() => {
    if (!isAuthenticated) return {};
    return getGenieNavByCategory(userTier, isInternalUser);
  }, [isAuthenticated, userTier, isInternalUser]);

  // Check if current route is accessible
  const canAccessRoute = useMemo(() => {
    if (!isAuthenticated) return false;
    return isGenieStudioAccessiblePath(location.pathname, userTier, isInternalUser);
  }, [isAuthenticated, location.pathname, userTier, isInternalUser]);

  // Access checker for arbitrary paths
  const isAccessiblePath = (path: string): boolean => {
    if (!isAuthenticated) return false;
    return isGenieStudioAccessiblePath(path, userTier, isInternalUser);
  };

  // Get upgrade prompt for locked paths
  const getUpgradePromptForPath = (path: string): { requiredTier: SubscriptionTier; tierName: string } | null => {
    // Find the nav item for this path
    const allItems = getGenieStudioNavItems('enterprise', true); // Get all possible items
    const cleanPath = path.split('?')[0];
    
    const item = allItems.find(i => {
      const itemPath = i.url.split('?')[0];
      return cleanPath === itemPath || cleanPath.startsWith(itemPath + '/');
    });

    if (!item) return null;
    
    // Check if user has access
    if (isGenieStudioAccessiblePath(path, userTier, isInternalUser)) {
      return null; // User has access, no upgrade needed
    }

    return {
      requiredTier: item.minTier,
      tierName: TIER_INFO[item.minTier].name,
    };
  };

  // Tier display info
  const tierInfo = TIER_INFO[userTier];

  return {
    navItems,
    navByCategory,
    isAccessiblePath,
    canAccessRoute,
    userTier,
    isInternal: isInternalUser,
    isGenieStudioUser,
    tierInfo,
    getUpgradePromptForPath,
  };
}

export default useGenieStudioNavigation;

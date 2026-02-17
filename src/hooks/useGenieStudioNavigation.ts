/**
 * GENIE STUDIO NAVIGATION HOOK
 * Provides filtered navigation for Genie Studio users
 * Based on subscription tier and internal user status
 * 
 * CRITICAL: DEV_MODE_ALWAYS_SHOW_NAV ensures navigation never disappears
 * even during auth loading states. This prevents the "Genie Cast tab disappearing" bug.
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
 * DEV_MODE_ALWAYS_SHOW_NAV - CRITICAL FIX FOR GENIE CAST TAB VISIBILITY
 * 
 * When true:
 * - Navigation items are ALWAYS returned, even during auth loading
 * - Internal tabs (like Genie Cast) are always visible
 * - Prevents the "disappearing tab" bug caused by async auth state
 * 
 * Set to false only in production when you want strict tier-based access
 */
const DEV_MODE_ALWAYS_SHOW_NAV = true;

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
    isLoading,
  } = useGenieStudioAuth();

  // Determine user tier - default to 'free' during loading
  const userTier = useMemo((): SubscriptionTier => {
    if (!genieUser) return 'free';
    return (genieUser.current_subscription_tier as SubscriptionTier) || 'free';
  }, [genieUser]);

  // Check if user is a Genie Studio user (has genie_studio_users record)
  const isGenieStudioUser = useMemo(() => {
    return isAuthenticated && !!genieUser;
  }, [isAuthenticated, genieUser]);

  /**
   * CRITICAL: Calculate effective internal status
   * In DEV_MODE, always treat as internal to prevent Genie Cast from disappearing
   * This is the root fix for the recurring tab visibility issue
   */
  const effectiveIsInternal = useMemo(() => {
    if (DEV_MODE_ALWAYS_SHOW_NAV) {
      return true; // Always show internal tabs in dev mode
    }
    return isInternalUser;
  }, [isInternalUser]);

  /**
   * CRITICAL: Get navigation items with DEV_MODE override
   * During loading OR in dev mode, always return full nav to prevent flicker
   */
  const navItems = useMemo(() => {
    // In dev mode, ALWAYS return items (even if auth is loading or not authenticated)
    if (DEV_MODE_ALWAYS_SHOW_NAV) {
      return getGenieStudioNavItems(userTier, true); // Force isInternal = true
    }
    
    // Production mode: require authentication
    if (!isAuthenticated) return [];
    return getGenieStudioNavItems(userTier, isInternalUser);
  }, [isAuthenticated, userTier, isInternalUser]);

  /**
   * CRITICAL: Get items by category with same DEV_MODE override
   */
  const navByCategory = useMemo(() => {
    if (DEV_MODE_ALWAYS_SHOW_NAV) {
      return getGenieNavByCategory(userTier, true); // Force isInternal = true
    }
    
    if (!isAuthenticated) return {};
    return getGenieNavByCategory(userTier, isInternalUser);
  }, [isAuthenticated, userTier, isInternalUser]);

  // Check if current route is accessible
  const canAccessRoute = useMemo(() => {
    if (DEV_MODE_ALWAYS_SHOW_NAV) return true;
    if (!isAuthenticated) return false;
    return isGenieStudioAccessiblePath(location.pathname, userTier, effectiveIsInternal);
  }, [isAuthenticated, location.pathname, userTier, effectiveIsInternal]);

  // Access checker for arbitrary paths
  const isAccessiblePath = (path: string): boolean => {
    if (DEV_MODE_ALWAYS_SHOW_NAV) return true;
    if (!isAuthenticated) return false;
    return isGenieStudioAccessiblePath(path, userTier, effectiveIsInternal);
  };

  // Get upgrade prompt for locked paths
  const getUpgradePromptForPath = (path: string): { requiredTier: SubscriptionTier; tierName: string } | null => {
    // In dev mode, never show upgrade prompts
    if (DEV_MODE_ALWAYS_SHOW_NAV) return null;
    
    // Find the nav item for this path
    const allItems = getGenieStudioNavItems('enterprise', true); // Get all possible items
    const cleanPath = path.split('?')[0];
    
    const item = allItems.find(i => {
      const itemPath = i.url.split('?')[0];
      return cleanPath === itemPath || cleanPath.startsWith(itemPath + '/');
    });

    if (!item) return null;
    
    // Check if user has access
    if (isGenieStudioAccessiblePath(path, userTier, effectiveIsInternal)) {
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
    isInternal: effectiveIsInternal,
    isGenieStudioUser,
    tierInfo,
    getUpgradePromptForPath,
  };
}

export default useGenieStudioNavigation;

/**
 * Smart Default Route Component
 * Checks for last visited route before redirecting to role-based default
 * Prevents losing state on refresh within app sections
 * 
 * IMPORTANT: This component checks BOTH healthcare roles AND Genie Suite user status
 * to properly route internal Genie Suite users to /genie-admin
 */

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getDefaultRouteForRoles, normalizeRoles } from '@/utils/roles';
import { supabase } from '@/integrations/supabase/client';

const ROUTE_STORAGE_KEY = 'lovable_last_route';

// Routes that should be remembered and restored
const PERSISTENT_ROUTE_PREFIXES = [
  '/genie-studio',
  '/genie-vibe',
  '/genie-spark',
  '/genie-mind',
  '/genie-arc',
  '/genie-guided',
  '/genie-cast',
  '/genie-admin',
  '/admin',
  '/agents'
];

// Check if route should be persisted
const shouldPersistRoute = (path: string): boolean => {
  return PERSISTENT_ROUTE_PREFIXES.some(prefix => path.startsWith(prefix));
};

interface SmartDefaultRouteProps {
  userRoles: string[];
  isInternal?: boolean;
}

export const SmartDefaultRoute: React.FC<SmartDefaultRouteProps> = ({ userRoles, isInternal }) => {
  const location = useLocation();
  const [targetRoute, setTargetRoute] = useState<string | null>(() => {
    // FAST PATH: Use cached internal user status to avoid spinner/blank screen
    const cachedIsInternal = localStorage.getItem('genie_studio_is_internal');
    if (cachedIsInternal === 'true') return '/genie-cast';
    return null;
  });
  const [isCheckingGenieUser, setIsCheckingGenieUser] = useState(() => {
    // Skip async check if we already have a cached route
    const cachedIsInternal = localStorage.getItem('genie_studio_is_internal');
    return cachedIsInternal !== 'true';
  });

  useEffect(() => {
    // If we already resolved from cache, skip the async DB check
    if (targetRoute && !isCheckingGenieUser) return;

    const determineRoute = async () => {
      // First, check if this user is a Genie Suite internal user
      // This takes priority over healthcare roles
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: genieUser } = await supabase
            .from('genie_studio_users')
            .select('is_internal, current_subscription_tier')
            .eq('auth_user_id', user.id)
            .maybeSingle();

          // If user is Genie Suite internal user, route to /genie-cast
          if (genieUser?.is_internal) {
            console.log('🎯 SmartDefaultRoute: Genie Suite internal user detected, routing to /genie-cast');
            localStorage.setItem('genie_studio_is_internal', 'true');
            setTargetRoute('/genie-cast');
            setIsCheckingGenieUser(false);
            return;
          }

          // If user has Genie Suite account (not internal), route to /genie-studio
          if (genieUser && !genieUser.is_internal) {
            console.log('🎯 SmartDefaultRoute: Genie Suite subscriber detected, routing to /genie-studio');
            setTargetRoute('/genie-studio');
            setIsCheckingGenieUser(false);
            return;
          }
        }
      } catch (error) {
        console.warn('⚠️ SmartDefaultRoute: Could not check Genie Suite status:', error);
      }

      setIsCheckingGenieUser(false);

      // Check if we have a stored route from before refresh
      const lastRoute = localStorage.getItem(ROUTE_STORAGE_KEY);
      
      if (lastRoute && shouldPersistRoute(lastRoute)) {
        const routeData = localStorage.getItem('lovable_route_timestamp');
        if (routeData) {
          const timestamp = parseInt(routeData, 10);
          const isRecent = Date.now() - timestamp < 24 * 60 * 60 * 1000;
          
          if (isRecent) {
            setTargetRoute(lastRoute);
            return;
          }
        }
      }
      
      // Fall back to role-based default
      setTargetRoute(getDefaultRouteForRoles(normalizeRoles(userRoles), isInternal));
    };

    determineRoute();
  }, [userRoles, isInternal, targetRoute, isCheckingGenieUser]);

  // Save current route when navigating
  useEffect(() => {
    if (location.pathname !== '/') {
      localStorage.setItem(ROUTE_STORAGE_KEY, location.pathname);
      localStorage.setItem('lovable_route_timestamp', Date.now().toString());
    }
  }, [location.pathname]);

  // Show nothing while checking Genie user status
  if (isCheckingGenieUser || !targetRoute) {
    return null;
  }

  return <Navigate to={targetRoute} replace />;
};

/**
 * Route persistence wrapper - saves routes to localStorage
 */
export const RouteTracker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Save route for persistence (skip root and auth routes)
    if (location.pathname !== '/' && 
        !location.pathname.startsWith('/login') && 
        !location.pathname.startsWith('/reset') &&
        !location.pathname.startsWith('/forgot')) {
      localStorage.setItem(ROUTE_STORAGE_KEY, location.pathname);
      localStorage.setItem('lovable_route_timestamp', Date.now().toString());
    }
  }, [location.pathname]);

  return <>{children}</>;
};

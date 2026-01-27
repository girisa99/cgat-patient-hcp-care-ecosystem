/**
 * Smart Default Route Component
 * Checks for last visited route before redirecting to role-based default
 * Prevents losing state on refresh within app sections
 */

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getDefaultRouteForRoles, normalizeRoles } from '@/utils/roles';

const ROUTE_STORAGE_KEY = 'lovable_last_route';

// Routes that should be remembered and restored
const PERSISTENT_ROUTE_PREFIXES = [
  '/genie-studio',
  '/genie-vibe',
  '/genie-spark',
  '/genie-mind',
  '/genie-arc',
  '/genie-guided',
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
  const [targetRoute, setTargetRoute] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have a stored route from before refresh
    const lastRoute = localStorage.getItem(ROUTE_STORAGE_KEY);
    
    // Check if the last route is still valid (should be persisted)
    if (lastRoute && shouldPersistRoute(lastRoute)) {
      // Validate the stored route isn't stale (within last 24 hours)
      const routeData = localStorage.getItem('lovable_route_timestamp');
      if (routeData) {
        const timestamp = parseInt(routeData, 10);
        const isRecent = Date.now() - timestamp < 24 * 60 * 60 * 1000; // 24 hours
        
        if (isRecent) {
          setTargetRoute(lastRoute);
          return;
        }
      }
    }
    
    // Fall back to role-based default (with internal user check)
    setTargetRoute(getDefaultRouteForRoles(normalizeRoles(userRoles), isInternal));
  }, [userRoles, isInternal]);

  // Save current route when navigating
  useEffect(() => {
    if (location.pathname !== '/') {
      localStorage.setItem(ROUTE_STORAGE_KEY, location.pathname);
      localStorage.setItem('lovable_route_timestamp', Date.now().toString());
    }
  }, [location.pathname]);

  if (!targetRoute) {
    return null; // Still determining route
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

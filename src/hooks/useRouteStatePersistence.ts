/**
 * Route State Persistence Hook
 * Saves and restores the last visited route for specific sections
 * Prevents losing state on refresh within Genie Suite pages
 */

import { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ROUTE_STORAGE_KEY = 'lovable_last_route';
const GENIE_ROUTES_KEY = 'lovable_genie_last_route';

// Routes that should be persisted (Genie Suite section)
const GENIE_ROUTE_PREFIXES = [
  '/genie-studio',
  '/genie-vibe',
  '/genie-spark',
  '/genie-mind',
  '/genie-arc',
  '/genie-guided',
  '/genie-cast'
];

// Check if route is a Genie Suite route
const isGenieRoute = (path: string): boolean => {
  return GENIE_ROUTE_PREFIXES.some(prefix => path.startsWith(prefix));
};

export const useRouteStatePersistence = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Save current route to localStorage
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Save general last route
    localStorage.setItem(ROUTE_STORAGE_KEY, currentPath);
    
    // Save Genie-specific route if applicable
    if (isGenieRoute(currentPath)) {
      localStorage.setItem(GENIE_ROUTES_KEY, currentPath);
    }
  }, [location.pathname]);

  // Get last visited Genie route
  const getLastGenieRoute = useCallback((): string | null => {
    return localStorage.getItem(GENIE_ROUTES_KEY);
  }, []);

  // Get last visited route
  const getLastRoute = useCallback((): string | null => {
    return localStorage.getItem(ROUTE_STORAGE_KEY);
  }, []);

  // Navigate to last Genie route if coming from refresh
  const restoreGenieRoute = useCallback(() => {
    const lastGenieRoute = getLastGenieRoute();
    if (lastGenieRoute && isGenieRoute(window.location.pathname)) {
      navigate(lastGenieRoute, { replace: true });
    }
  }, [navigate, getLastGenieRoute]);

  // Clear stored routes (e.g., on logout)
  const clearStoredRoutes = useCallback(() => {
    localStorage.removeItem(ROUTE_STORAGE_KEY);
    localStorage.removeItem(GENIE_ROUTES_KEY);
  }, []);

  return {
    getLastRoute,
    getLastGenieRoute,
    restoreGenieRoute,
    clearStoredRoutes,
    isGenieRoute,
    currentPath: location.pathname
  };
};

/**
 * Hook specifically for Genie pages to maintain state on refresh
 */
export const useGenieRouteGuard = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Only save if we're on a Genie route
    if (isGenieRoute(location.pathname)) {
      // Save with timestamp to verify freshness
      const routeData = {
        path: location.pathname,
        timestamp: Date.now(),
        hash: location.hash,
        search: location.search
      };
      localStorage.setItem(GENIE_ROUTES_KEY, JSON.stringify(routeData));
    }
  }, [location]);

  return location.pathname;
};

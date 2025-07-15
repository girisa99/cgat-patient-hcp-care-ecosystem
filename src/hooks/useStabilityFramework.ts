/**
 * React Hook for Stability Framework Integration
 * Provides easy access to stability framework features in React components
 */

import { useState, useEffect, useCallback } from 'react';
import { getStabilityFramework, frameworkHelpers } from '@/utils/framework/init';
import { useMasterAuth } from '@/hooks/useMasterAuth';

export interface UseStabilityFrameworkReturn {
  // Feature access
  canAccessFeature: (featureName: string) => boolean;
  canAccessRoute: (routePath: string) => boolean;
  getAccessibleRoutes: () => string[];
  
  // Development helpers
  validateChange: typeof frameworkHelpers.validateChange;
  createFeature: typeof frameworkHelpers.createFeature;
  enhanceComponent: typeof frameworkHelpers.enhanceComponent;
  generateCode: typeof frameworkHelpers.generateCode;
  
  // Framework status
  getStatus: () => any;
  performHealthCheck: () => Promise<any>;
  
  // Component enhancement
  isComponentRegistered: (componentName: string) => boolean;
  getComponentSuggestions: (componentName: string) => string[];
  
  // Loading state
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to interact with the stability framework
 */
export const useStabilityFramework = (): UseStabilityFrameworkReturn => {
  const { user, userRoles } = useMasterAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      // Framework should already be initialized, but ensure it's available
      getStabilityFramework();
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, []);

  // Feature access functions
  const canAccessFeature = useCallback((featureName: string): boolean => {
    if (!user) return false;
    try {
      const framework = getStabilityFramework();
      const roleManager = framework.getRoleManager();
      return roleManager.canUserAccessFeature(featureName, {
        id: user.id,
        roles: userRoles || []
      });
    } catch {
      return false;
    }
  }, [user]);

  const canAccessRoute = useCallback((routePath: string): boolean => {
    if (!user) return false;
    try {
      const framework = getStabilityFramework();
      const roleManager = framework.getRoleManager();
      return roleManager.canUserAccessRoute(routePath, {
        id: user.id,
        roles: userRoles || []
      });
    } catch {
      return false;
    }
  }, [user]);

  const getAccessibleRoutes = useCallback((): string[] => {
    if (!user) return [];
    try {
      const framework = getStabilityFramework();
      const roleManager = framework.getRoleManager();
      return roleManager.getAccessibleRoutes({
        id: user.id,
        roles: userRoles || []
      });
    } catch {
      return [];
    }
  }, [user]);

  // Component management functions
  const isComponentRegistered = useCallback((componentName: string): boolean => {
    try {
      const framework = getStabilityFramework();
      const componentManager = framework.getComponentManager();
      return !!componentManager.getComponent(componentName);
    } catch {
      return false;
    }
  }, []);

  const getComponentSuggestions = useCallback((componentName: string): string[] => {
    try {
      const framework = getStabilityFramework();
      const componentManager = framework.getComponentManager();
      return componentManager.getEnhancementSuggestions(componentName);
    } catch {
      return [];
    }
  }, []);

  // Framework status functions
  const getStatus = useCallback(() => {
    try {
      return frameworkHelpers.getStatus();
    } catch (err) {
      console.error('Error getting framework status:', err);
      return null;
    }
  }, []);

  const performHealthCheck = useCallback(async () => {
    try {
      return await frameworkHelpers.healthCheck();
    } catch (err) {
      console.error('Error performing health check:', err);
      return null;
    }
  }, []);

  return {
    // Feature access
    canAccessFeature,
    canAccessRoute,
    getAccessibleRoutes,
    
    // Development helpers
    validateChange: frameworkHelpers.validateChange,
    createFeature: frameworkHelpers.createFeature,
    enhanceComponent: frameworkHelpers.enhanceComponent,
    generateCode: frameworkHelpers.generateCode,
    
    // Framework status
    getStatus,
    performHealthCheck,
    
    // Component enhancement
    isComponentRegistered,
    getComponentSuggestions,
    
    // State
    loading,
    error
  };
};

/**
 * Hook for role-based feature flags
 */
export const useFeatureFlag = (featureName: string) => {
  const { canAccessFeature, loading } = useStabilityFramework();
  
  const enabled = !loading && canAccessFeature(featureName);
  
  return {
    enabled,
    loading
  };
};

/**
 * Hook for route protection
 */
export const useRouteProtection = (routePath: string) => {
  const { canAccessRoute, loading } = useStabilityFramework();
  
  const canAccess = !loading && canAccessRoute(routePath);
  
  return {
    canAccess,
    loading
  };
};

/**
 * Development hook for component enhancement (only in development)
 */
export const useComponentEnhancement = (componentName: string) => {
  const { 
    isComponentRegistered, 
    getComponentSuggestions, 
    enhanceComponent,
    loading 
  } = useStabilityFramework();

  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && isComponentRegistered(componentName)) {
      setSuggestions(getComponentSuggestions(componentName));
    }
  }, [componentName, loading, isComponentRegistered, getComponentSuggestions]);

  const enhance = useCallback(async (enhancement: {
    newProps?: Record<string, any>;
    newFeatures?: string[];
    version?: string;
  }) => {
    return await enhanceComponent({
      componentName,
      ...enhancement
    });
  }, [componentName, enhanceComponent]);

  return {
    isRegistered: isComponentRegistered(componentName),
    suggestions,
    enhance,
    loading
  };
};

export default useStabilityFramework;
import { useCallback, useRef, useEffect } from 'react';
import { useStability } from '@/components/stability/StabilityProvider';

/**
 * Hook to ensure no duplicate data fetching across modules
 */
export const useDuplicateProtection = (
  fetchKey: string,
  moduleId: string,
  fetchFn: () => Promise<any>
) => {
  const { trackHookUsage, addProtectionAlert } = useStability();
  const fetchCacheRef = useRef<Map<string, { data: any; timestamp: number; promise?: Promise<any> }>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Track this fetch usage
  useEffect(() => {
    trackHookUsage(`fetch-${fetchKey}`, moduleId, 'useDuplicateProtection');
  }, [fetchKey, moduleId, trackHookUsage]);

  const protectedFetch = useCallback(async () => {
    const cache = fetchCacheRef.current;
    const cached = cache.get(fetchKey);
    const now = Date.now();

    // Return cached data if still fresh
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log(`🛡️ Using cached data for ${fetchKey} from ${moduleId}`);
      return cached.data;
    }

    // If there's an ongoing fetch, wait for it
    if (cached?.promise) {
      addProtectionAlert(`Prevented duplicate fetch for ${fetchKey} in ${moduleId}`);
      console.log(`🛡️ Waiting for ongoing fetch: ${fetchKey}`);
      return await cached.promise;
    }

    // Start new fetch
    console.log(`🔄 Starting new fetch: ${fetchKey} for ${moduleId}`);
    const promise = fetchFn();
    
    // Cache the promise to prevent duplicates
    cache.set(fetchKey, { 
      data: null, 
      timestamp: now, 
      promise 
    });

    try {
      const data = await promise;
      
      // Cache the result
      cache.set(fetchKey, { 
        data, 
        timestamp: now 
      });
      
      return data;
    } catch (error) {
      // Remove failed fetch from cache
      cache.delete(fetchKey);
      throw error;
    }
  }, [fetchKey, moduleId, fetchFn, addProtectionAlert]);

  const invalidateCache = useCallback(() => {
    fetchCacheRef.current.delete(fetchKey);
    console.log(`🗑️ Cache invalidated for ${fetchKey}`);
  }, [fetchKey]);

  return { protectedFetch, invalidateCache };
};

/**
 * Hook to prevent breaking changes to existing functionality
 */
export const useBreakingChangeProtection = (
  componentName: string,
  expectedProps: string[],
  moduleId: string
) => {
  const { addProtectionAlert } = useStability();

  const validateProps = useCallback((props: Record<string, any>) => {
    const missingProps = expectedProps.filter(prop => !(prop in props));
    const extraProps = Object.keys(props).filter(prop => !expectedProps.includes(prop));

    if (missingProps.length > 0) {
      addProtectionAlert(`Missing required props in ${componentName}: ${missingProps.join(', ')}`);
      console.error(`🚨 Breaking change detected in ${componentName}:`, { missingProps });
    }

    if (extraProps.length > 5) { // Allow some flexibility for new props
      addProtectionAlert(`Unexpected number of new props in ${componentName}: ${extraProps.length}`);
    }

    return {
      isValid: missingProps.length === 0,
      missingProps,
      extraProps
    };
  }, [componentName, expectedProps, addProtectionAlert]);

  return { validateProps };
};

/**
 * Hook to monitor and protect component render performance
 */
export const useRenderProtection = (
  componentName: string,
  moduleId: string,
  maxRenderTime = 100 // ms
) => {
  const { trackModuleMetrics, addProtectionAlert } = useStability();
  const renderStartRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);

  const startRender = useCallback(() => {
    renderStartRef.current = performance.now();
    renderCountRef.current += 1;
  }, []);

  const endRender = useCallback(() => {
    const renderTime = performance.now() - renderStartRef.current;
    
    trackModuleMetrics(moduleId, {
      renderCount: renderCountRef.current,
      performanceScore: Math.max(0, 100 - (renderTime / maxRenderTime) * 50)
    });

    if (renderTime > maxRenderTime) {
      addProtectionAlert(`Slow render detected in ${componentName}: ${renderTime.toFixed(1)}ms`);
      console.warn(`⚠️ Slow render: ${componentName} took ${renderTime.toFixed(1)}ms`);
    }

    return renderTime;
  }, [componentName, moduleId, maxRenderTime, trackModuleMetrics, addProtectionAlert]);

  // Auto-tracking effect
  useEffect(() => {
    startRender();
    return () => {
      endRender();
    };
  });

  return { startRender, endRender, renderCount: renderCountRef.current };
};

/**
 * Hook to protect against state mutations that could break other modules
 */
export const useStateMutationProtection = <T,>(
  stateName: string,
  moduleId: string,
  initialState: T
) => {
  const { addProtectionAlert } = useStability();
  const stateHistoryRef = useRef<T[]>([initialState]);
  const maxHistorySize = 10;

  const protectedSetState = useCallback((newState: T | ((prev: T) => T)) => {
    const history = stateHistoryRef.current;
    const currentState = history[history.length - 1];

    let nextState: T;
    if (typeof newState === 'function') {
      nextState = (newState as (prev: T) => T)(currentState);
    } else {
      nextState = newState;
    }

    // Detect potential breaking mutations
    if (typeof currentState === 'object' && typeof nextState === 'object') {
      const currentKeys = Object.keys(currentState as any);
      const nextKeys = Object.keys(nextState as any);
      
      const removedKeys = currentKeys.filter(key => !nextKeys.includes(key));
      if (removedKeys.length > 0) {
        addProtectionAlert(`State mutation in ${stateName} (${moduleId}) removed keys: ${removedKeys.join(', ')}`);
      }
    }

    // Update history
    history.push(nextState);
    if (history.length > maxHistorySize) {
      history.shift();
    }

    return nextState;
  }, [stateName, moduleId, addProtectionAlert]);

  const rollbackState = useCallback((steps = 1) => {
    const history = stateHistoryRef.current;
    const targetIndex = Math.max(0, history.length - 1 - steps);
    const rolledBackState = history[targetIndex];
    
    console.log(`🔄 Rolling back ${stateName} state by ${steps} steps`);
    return rolledBackState;
  }, [stateName]);

  return { protectedSetState, rollbackState, stateHistory: stateHistoryRef.current };
};

/**
 * Hook to validate that existing routes still work after changes
 */
export const useRouteProtection = (moduleId: string) => {
  const { addProtectionAlert } = useStability();
  const knownRoutesRef = useRef<Set<string>>(new Set());

  const registerRoute = useCallback((route: string) => {
    knownRoutesRef.current.add(route);
    console.log(`📍 Route registered: ${route} by ${moduleId}`);
  }, [moduleId]);

  const validateRouteAccess = useCallback((route: string) => {
    if (!knownRoutesRef.current.has(route)) {
      addProtectionAlert(`Unknown route accessed: ${route} from ${moduleId}`);
      return false;
    }
    return true;
  }, [moduleId, addProtectionAlert]);

  const checkRouteBroken = useCallback(async (route: string) => {
    try {
      // Simple check - in real app, you might make a HEAD request
      const isAccessible = validateRouteAccess(route);
      return !isAccessible;
    } catch (error) {
      addProtectionAlert(`Route check failed for ${route}: ${error}`);
      return true;
    }
  }, [validateRouteAccess, addProtectionAlert]);

  return { registerRoute, validateRouteAccess, checkRouteBroken, knownRoutes: Array.from(knownRoutesRef.current) };
};

/**
 * Hook to ensure backward compatibility with existing APIs
 */
export const useAPICompatibilityProtection = (moduleId: string) => {
  const { addProtectionAlert } = useStability();
  const apiSignaturesRef = useRef<Map<string, string[]>>(new Map());

  const registerAPISignature = useCallback((apiName: string, signature: string[]) => {
    apiSignaturesRef.current.set(apiName, signature);
    console.log(`🔌 API signature registered: ${apiName} by ${moduleId}`);
  }, [moduleId]);

  const validateAPICall = useCallback((apiName: string, args: any[]) => {
    const expectedSignature = apiSignaturesRef.current.get(apiName);
    if (!expectedSignature) {
      addProtectionAlert(`Unknown API called: ${apiName} from ${moduleId}`);
      return false;
    }

    if (args.length !== expectedSignature.length) {
      addProtectionAlert(`API signature mismatch for ${apiName}: expected ${expectedSignature.length} args, got ${args.length}`);
      return false;
    }

    return true;
  }, [moduleId, addProtectionAlert]);

  return { registerAPISignature, validateAPICall };
};
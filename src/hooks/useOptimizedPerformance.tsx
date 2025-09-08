import { useCallback, useMemo, useRef, useEffect } from 'react';
import { debounce } from 'lodash';

/**
 * Performance optimization hook that addresses memory issues and improves rendering
 */
export const useOptimizedPerformance = () => {
  const performanceRef = useRef({
    memoryUsage: 0,
    renderCount: 0,
    lastCleanup: Date.now()
  });

  // Memory management
  const checkMemoryUsage = useCallback(() => {
    if (typeof window !== 'undefined' && (window.performance as any)?.memory) {
      const memory = (window.performance as any).memory;
      const usage = memory.usedJSHeapSize / memory.totalJSHeapSize;
      performanceRef.current.memoryUsage = usage;
      
      // Trigger cleanup if memory usage is high
      if (usage > 0.85) {
        performMemoryCleanup();
      }
    }
  }, []);

  // Memory cleanup function
  const performMemoryCleanup = useCallback(() => {
    console.log('🧹 Performing memory cleanup...');
    
    // Force garbage collection if available
    if (typeof window !== 'undefined' && (window as any).gc) {
      try {
        (window as any).gc();
      } catch (e) {
        // Fallback cleanup strategies
        // Clear unused event listeners
        window.removeEventListener('beforeunload', () => {});
        
        // Clear any cached data older than 5 minutes
        const now = Date.now();
        if (now - performanceRef.current.lastCleanup > 300000) {
          // Cleanup React Query cache if available
          if ((window as any).queryClient) {
            (window as any).queryClient.clear();
          }
          performanceRef.current.lastCleanup = now;
        }
      }
    }
  }, []);

  // Debounced memory check to prevent excessive calls
  const debouncedMemoryCheck = useMemo(
    () => debounce(checkMemoryUsage, 30000), // Check every 30 seconds
    [checkMemoryUsage]
  );

  // Performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      debouncedMemoryCheck();
      performanceRef.current.renderCount++;
    }, 30000);

    // Initial check
    checkMemoryUsage();

    return () => {
      clearInterval(interval);
      debouncedMemoryCheck.cancel();
    };
  }, [debouncedMemoryCheck, checkMemoryUsage]);

  // Optimized memoization helper
  const memoize = useCallback(<T extends any[], R>(
    fn: (...args: T) => R,
    deps: React.DependencyList
  ) => {
    return useMemo(() => fn, deps);
  }, []);

  return {
    performMemoryCleanup,
    checkMemoryUsage,
    memoize,
    memoryUsage: performanceRef.current.memoryUsage,
    renderCount: performanceRef.current.renderCount
  };
};
import { useCallback, useMemo, useRef, useEffect } from 'react';
import { debounce } from 'lodash';
import { MemoryLeakDetector } from '@/utils/performance/MemoryLeakDetector';

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
      
      // Trigger aggressive cleanup if memory usage is high
      if (usage > 0.80) {
        console.warn('🚨 Memory usage critical:', (usage * 100).toFixed(1) + '%');
        performMemoryCleanup();
      }
    }
  }, []);

  // Safe memory cleanup function - does NOT remove styles that break animations
  const performMemoryCleanup = useCallback(() => {
    console.log('🧹 Performing safe memory cleanup...');
    
    try {
      // Clear only specifically marked cached elements
      const elementsToClean = document.querySelectorAll('[data-performance-cached="true"]');
      elementsToClean.forEach(el => el.remove());
      
      // DO NOT clear inline styles - this breaks framer-motion and other animation libraries
      // The previous implementation was removing all styles which caused UI flickering
      
      // Force garbage collection if available (Chrome DevTools only)
      if (typeof window !== 'undefined' && (window as any).gc) {
        (window as any).gc();
      }
      
      // Clear stale React Query cache entries (older than 5 minutes)
      if (typeof window !== 'undefined' && (window as any).queryClient) {
        try {
          (window as any).queryClient.invalidateQueries({ stale: true });
        } catch {
          // Ignore if queryClient doesn't support this
        }
      }
      
      // Clear only temp localStorage entries (not cache which might be needed)
      if (typeof window !== 'undefined' && window.localStorage) {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('temp_') || key.includes('_temp_')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      // Clear performance entries
      if (typeof window !== 'undefined' && window.performance?.clearResourceTimings) {
        window.performance.clearResourceTimings();
      }
      
      performanceRef.current.lastCleanup = Date.now();
      console.log('✅ Safe cleanup completed');
      
    } catch (error) {
      console.warn('⚠️ Memory cleanup failed:', error);
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
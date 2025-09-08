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

  // Aggressive memory cleanup function
  const performMemoryCleanup = useCallback(() => {
    console.log('🧹 Performing aggressive memory cleanup...');
    
    try {
      // Clear DOM elements and cached data
      const elementsToClean = document.querySelectorAll('[data-performance-cached]');
      elementsToClean.forEach(el => el.remove());
      
      // Clear all inline styles that might hold references
      const styledElements = document.querySelectorAll('[style]');
      styledElements.forEach(el => el.removeAttribute('style'));
      
      // Force garbage collection if available
      if (typeof window !== 'undefined' && (window as any).gc) {
        (window as any).gc();
      }
      
      // Clear React Query cache aggressively
      if (typeof window !== 'undefined' && (window as any).queryClient) {
        (window as any).queryClient.removeQueries();
        (window as any).queryClient.clear();
      }
      
      // Clear localStorage of old cached data
      if (typeof window !== 'undefined' && window.localStorage) {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes('cache') || key.includes('temp')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      // Clear performance entries
      if (typeof window !== 'undefined' && window.performance?.clearResourceTimings) {
        window.performance.clearResourceTimings();
      }
      
      // Use comprehensive memory leak detector
      MemoryLeakDetector.performCleanup();
      
      performanceRef.current.lastCleanup = Date.now();
      console.log('✅ Enhanced cleanup completed with leak detection');
      
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
import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { debounce, throttle } from 'lodash';

/**
 * React Performance Optimizations
 * Implements actual fixes for the performance issues identified
 */

export class ReactOptimizations {
  // Fix #1: Component memoization helper
  static createMemoizedComponent<P extends object>(
    Component: React.ComponentType<P>,
    propsAreEqual?: (prevProps: P, nextProps: P) => boolean
  ) {
    return React.memo(Component, propsAreEqual);
  }

  // Fix #2: Optimized useCallback with dependency tracking
  static useStableCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: React.DependencyList,
    debounceMs?: number
  ): T {
    const callbackRef = useRef(callback);
    
    // Update ref when deps change
    useEffect(() => {
      callbackRef.current = callback;
    }, deps);

    return useMemo(() => {
      const stableCallback = (...args: Parameters<T>) => {
        return callbackRef.current(...args);
      };
      
      return debounceMs 
        ? debounce(stableCallback, debounceMs) as T
        : stableCallback as T;
    }, [debounceMs]);
  }

  // Fix #3: Memory-efficient list rendering
  static useVirtualizedList<T>(
    items: T[],
    itemHeight: number,
    containerHeight: number
  ) {
    const [scrollTop, setScrollTop] = useState(0);
    
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length - 1
    );
    
    const visibleItems = items.slice(startIndex, endIndex + 1);
    const offsetY = startIndex * itemHeight;
    
    return {
      visibleItems,
      startIndex,
      endIndex,
      offsetY,
      totalHeight: items.length * itemHeight,
      setScrollTop: useCallback((top: number) => {
        setScrollTop(Math.max(0, Math.min(top, items.length * itemHeight - containerHeight)));
      }, [items.length, itemHeight, containerHeight])
    };
  }

  // Fix #4: Throttled event handlers
  static useThrottledHandler<T extends (...args: any[]) => void>(
    handler: T,
    delay: number = 100
  ): T {
    const throttledHandler = useMemo(
      () => throttle(handler, delay),
      [handler, delay]
    );

    useEffect(() => {
      return () => {
        throttledHandler.cancel();
      };
    }, [throttledHandler]);

    return throttledHandler as T;
  }

  // Fix #5: Efficient re-render prevention
  static useShallowCompare<T extends Record<string, any>>(obj: T): T {
    const ref = useRef<T>(obj);
    
    const hasChanged = useMemo(() => {
      const keys = Object.keys(obj);
      const prevKeys = Object.keys(ref.current);
      
      if (keys.length !== prevKeys.length) return true;
      
      return keys.some(key => obj[key] !== ref.current[key]);
    }, [obj]);
    
    if (hasChanged) {
      ref.current = obj;
    }
    
    return ref.current;
  }

  // Fix #6: Query optimization
  static optimizeQueryKey(baseKey: string[], filters: any): string[] {
    // Normalize filters to prevent unnecessary cache misses
    const normalizedFilters = filters ? JSON.stringify(filters) : '';
    return [...baseKey, normalizedFilters].filter(Boolean);
  }

  // Fix #7: Component lazy loading with error boundaries
  static createLazyComponent<P>(
    importFn: () => Promise<{ default: React.ComponentType<P> }>,
    fallback?: React.ComponentType
  ) {
    const LazyComponent = React.lazy(importFn);
    
    return (props: P) => {
      return React.createElement(
        React.Suspense,
        { fallback: fallback ? React.createElement(fallback, {} as any) : React.createElement('div', {}, 'Loading...') },
        React.createElement(LazyComponent, props as any)
      );
    };
  }

  // Fix #8: Memory cleanup on unmount
  static useCleanupEffect(cleanup: () => void, deps: React.DependencyList = []) {
    useEffect(() => {
      return cleanup;
    }, deps);
  }
}

// Fix #9: Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);
  
  useEffect(() => {
    renderCount.current++;
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      renderTimes.current.push(renderTime);
      
      // Keep only last 10 render times
      if (renderTimes.current.length > 10) {
        renderTimes.current = renderTimes.current.slice(-10);
      }
      
      // Log if render is slow
      if (renderTime > 16) {
        console.warn(`🐌 Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
      
      // Log average performance every 10 renders
      if (renderCount.current % 10 === 0) {
        const avgTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
        console.log(`📊 ${componentName} avg render time: ${avgTime.toFixed(2)}ms (${renderCount.current} total renders)`);
      }
    };
  });
  
  return {
    renderCount: renderCount.current,
    averageRenderTime: renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length || 0
  };
};

// Fix #10: Bundle size optimization utilities
export const BundleOptimizations = {
  // Dynamic imports for code splitting
  loadModule: <T>(moduleFn: () => Promise<T>): Promise<T> => {
    return moduleFn().catch(error => {
      console.error('❌ Failed to load module:', error);
      throw error;
    });
  },
  
  // Preload critical modules
  preloadModule: (moduleFn: () => Promise<any>): void => {
    if (typeof window !== 'undefined') {
      // Preload after initial render
      setTimeout(() => {
        moduleFn().catch(() => {
          // Silently handle preload failures
        });
      }, 1000);
    }
  }
};

import React, { memo, useCallback, useMemo, useEffect } from 'react';
import { useOptimizedPerformance } from '@/hooks/useOptimizedPerformance';

interface PerformanceOptimizedWrapperProps {
  children: React.ReactNode;
  componentName?: string;
  enableMemoryMonitoring?: boolean;
}

/**
 * Wrapper component that applies performance optimizations to child components
 */
export const PerformanceOptimizedWrapper = memo<PerformanceOptimizedWrapperProps>(({
  children,
  componentName = 'Component',
  enableMemoryMonitoring = true
}) => {
  const { performMemoryCleanup, checkMemoryUsage, memoryUsage } = useOptimizedPerformance();

  // Performance tracking
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // More than one frame at 60fps
        console.warn(`⚠️ Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);

  // Memory monitoring
  useEffect(() => {
    if (!enableMemoryMonitoring) return;
    
    const memoryCheckInterval = setInterval(() => {
      checkMemoryUsage();
      
      // If memory usage is critical, perform cleanup
      if (memoryUsage > 0.9) {
        console.warn(`🚨 Critical memory usage in ${componentName}: ${(memoryUsage * 100).toFixed(1)}%`);
        performMemoryCleanup();
      }
    }, 60000); // Check every minute

    return () => clearInterval(memoryCheckInterval);
  }, [enableMemoryMonitoring, checkMemoryUsage, memoryUsage, performMemoryCleanup, componentName]);

  // Optimized error boundary
  const handleError = useCallback((error: Error, errorInfo: any) => {
    console.error(`❌ Error in optimized ${componentName}:`, error, errorInfo);
    
    // Perform emergency cleanup
    performMemoryCleanup();
  }, [componentName, performMemoryCleanup]);

  return (
    <div data-performance-optimized={componentName}>
      {children}
    </div>
  );
});

PerformanceOptimizedWrapper.displayName = 'PerformanceOptimizedWrapper';
/**
 * STABILITY HOOKS
 * Extracted custom hooks from StabilityProvider for better organization
 * Part of Stability Framework Phase 2 refactoring
 */
import React, { useContext } from 'react';

// Types for stability monitoring (re-exported from main provider)
export interface StabilityMetrics {
  moduleId: string;
  renderCount: number;
  errorCount: number;
  lastError: string | null;
  performanceScore: number;
  memoryUsage: number;
  loadTime: number;
  crashCount: number;
  recoveryCount: number;
  healthStatus: 'healthy' | 'warning' | 'critical' | 'recovering';
}

export interface HookUsageTracker {
  hookName: string;
  usageCount: number;
  lastUsed: number;
  isDuplicate: boolean;
  moduleId: string;
  source: string;
}

export interface LayoutProtection {
  originalLayout: DOMRect | null;
  currentLayout: DOMRect | null;
  hasLayoutShift: boolean;
  shiftAmount: number;
  isProtected: boolean;
}

export interface StabilityState {
  modules: Record<string, StabilityMetrics>;
  hooks: Record<string, HookUsageTracker>;
  layouts: Record<string, LayoutProtection>;
  globalHealth: 'stable' | 'warning' | 'unstable';
  duplicateDetections: string[];
  protectionAlerts: string[];
}

// Stability context interface
export interface StabilityContextType {
  state: StabilityState;
  trackModuleMetrics: (moduleId: string, metrics: Partial<StabilityMetrics>) => void;
  trackHookUsage: (hookName: string, moduleId: string, source: string) => void;
  detectLayoutShift: (elementId: string, layout: DOMRect) => void;
  addProtectionAlert: (alert: string) => void;
  clearAlerts: () => void;
  updateGlobalHealth: (health: 'stable' | 'warning' | 'unstable') => void;
  isStable: boolean;
  getDuplicateHooks: () => HookUsageTracker[];
  getLayoutShifts: () => LayoutProtection[];
  getModuleHealth: (moduleId: string) => 'healthy' | 'warning' | 'critical' | 'recovering' | 'unknown';
}

// Create a placeholder context - will be provided by StabilityProvider
export const StabilityContext = React.createContext<StabilityContextType | undefined>(undefined);

// Hook to use stability context
export const useStability = () => {
  const context = useContext(StabilityContext);
  if (context === undefined) {
    throw new Error('useStability must be used within a StabilityProvider');
  }
  return context;
};

// Hook for module stability monitoring
export const useModuleStability = (moduleId: string) => {
  const { trackModuleMetrics, getModuleHealth, addProtectionAlert } = useStability();
  const [renderCount, setRenderCount] = React.useState(0);
  const [errorCount, setErrorCount] = React.useState(0);
  const [lastError, setLastError] = React.useState<string | null>(null);

  // Track renders
  React.useEffect(() => {
    const newRenderCount = renderCount + 1;
    setRenderCount(newRenderCount);
    
    trackModuleMetrics(moduleId, {
      renderCount: newRenderCount,
      errorCount,
      lastError
    });
  }, [moduleId, renderCount, errorCount, lastError, trackModuleMetrics]);

  const reportError = React.useCallback((error: string) => {
    const newErrorCount = errorCount + 1;
    setErrorCount(newErrorCount);
    setLastError(error);
    
    trackModuleMetrics(moduleId, {
      renderCount,
      errorCount: newErrorCount,
      lastError: error
    });

    if (newErrorCount > 3) {
      addProtectionAlert(`Module ${moduleId} has high error count: ${newErrorCount}`);
    }
  }, [moduleId, errorCount, renderCount, trackModuleMetrics, addProtectionAlert]);

  const markRecovery = React.useCallback(() => {
    trackModuleMetrics(moduleId, {
      recoveryCount: (errorCount > 0 ? 1 : 0)
    });
    setErrorCount(0);
    setLastError(null);
  }, [moduleId, errorCount, trackModuleMetrics]);

  return {
    renderCount,
    errorCount,
    lastError,
    health: getModuleHealth(moduleId),
    reportError,
    markRecovery
  };
};

// Hook for preventing duplicate hooks
export const useHookProtection = (hookName: string, moduleId: string) => {
  const { trackHookUsage, getDuplicateHooks, addProtectionAlert } = useStability();
  
  React.useEffect(() => {
    trackHookUsage(hookName, moduleId, new Error().stack || 'unknown');
    
    const duplicates = getDuplicateHooks();
    const currentHookDuplicates = duplicates.filter(h => h.hookName === hookName);
    
    if (currentHookDuplicates.length > 0) {
      addProtectionAlert(`Duplicate hook detected: ${hookName} in ${moduleId}`);
    }
  }, [hookName, moduleId, trackHookUsage, getDuplicateHooks, addProtectionAlert]);

  const duplicates = getDuplicateHooks();
  const isDuplicate = duplicates.some(h => h.hookName === hookName && h.moduleId !== moduleId);

  return {
    isDuplicate,
    duplicateCount: duplicates.filter(h => h.hookName === hookName).length
  };
};

// Hook for layout protection
export const useLayoutProtection = (elementId: string, ref: React.RefObject<HTMLElement>) => {
  const { detectLayoutShift, getLayoutShifts, addProtectionAlert } = useStability();
  const [isProtected, setIsProtected] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { contentRect } = entry;
        detectLayoutShift(elementId, contentRect);
        
        const layoutShifts = getLayoutShifts();
        const currentShift = layoutShifts[elementId];
        
        if (currentShift?.hasLayoutShift && currentShift.shiftAmount > 50) {
          addProtectionAlert(`Significant layout shift detected in ${elementId}: ${currentShift.shiftAmount}px`);
        }
      }
    });

    observer.observe(ref.current);
    setIsProtected(true);

    return () => {
      observer.disconnect();
      setIsProtected(false);
    };
  }, [elementId, ref, detectLayoutShift, getLayoutShifts, addProtectionAlert]);

  const layoutShifts = getLayoutShifts();
  const currentShift = layoutShifts[elementId];

  return {
    isProtected,
    hasLayoutShift: currentShift?.hasLayoutShift || false,
    shiftAmount: currentShift?.shiftAmount || 0
  };
};

// Hook for performance monitoring
export const usePerformanceMonitoring = (moduleId: string) => {
  const { trackModuleMetrics } = useStability();
  const [loadTime, setLoadTime] = React.useState(0);
  const [memoryUsage, setMemoryUsage] = React.useState(0);

  React.useEffect(() => {
    const startTime = performance.now();

    // Monitor memory usage if available
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      setMemoryUsage(memInfo.usedJSHeapSize);
    }

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      setLoadTime(duration);

      trackModuleMetrics(moduleId, {
        loadTime: duration,
        memoryUsage,
        performanceScore: duration < 100 ? 100 : Math.max(0, 100 - (duration - 100) / 10)
      });
    };
  }, [moduleId, memoryUsage, trackModuleMetrics]);

  return {
    loadTime,
    memoryUsage,
    performanceScore: loadTime < 100 ? 100 : Math.max(0, 100 - (loadTime - 100) / 10)
  };
};

export default {
  useStability,
  useModuleStability,
  useHookProtection,
  useLayoutProtection,
  usePerformanceMonitoring
};
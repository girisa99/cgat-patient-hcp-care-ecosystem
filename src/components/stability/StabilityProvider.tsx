import React, { createContext, useContext, ReactNode, useReducer, useCallback } from 'react';

// Types for stability monitoring
interface StabilityMetrics {
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

interface HookUsageTracker {
  hookName: string;
  usageCount: number;
  lastUsed: number;
  isDuplicate: boolean;
  moduleId: string;
  source: string;
}

interface LayoutProtection {
  originalLayout: DOMRect | null;
  currentLayout: DOMRect | null;
  hasLayoutShift: boolean;
  shiftAmount: number;
  isProtected: boolean;
}

interface StabilityState {
  modules: Record<string, StabilityMetrics>;
  hooks: Record<string, HookUsageTracker>;
  layouts: Record<string, LayoutProtection>;
  globalHealth: 'stable' | 'warning' | 'unstable';
  duplicateDetections: string[];
  protectionAlerts: string[];
}

type StabilityAction =
  | { type: 'UPDATE_MODULE_METRICS'; moduleId: string; metrics: Partial<StabilityMetrics> }
  | { type: 'TRACK_HOOK_USAGE'; hookName: string; moduleId: string; source: string }
  | { type: 'DETECT_LAYOUT_SHIFT'; elementId: string; layout: DOMRect }
  | { type: 'ADD_PROTECTION_ALERT'; alert: string }
  | { type: 'CLEAR_ALERTS' }
  | { type: 'UPDATE_GLOBAL_HEALTH'; health: 'stable' | 'warning' | 'unstable' };

// Stability reducer
const stabilityReducer = (state: StabilityState, action: StabilityAction): StabilityState => {
  switch (action.type) {
    case 'UPDATE_MODULE_METRICS':
      const currentMetrics = state.modules[action.moduleId] || {
        moduleId: action.moduleId,
        renderCount: 0,
        errorCount: 0,
        lastError: null,
        performanceScore: 100,
        memoryUsage: 0,
        loadTime: 0,
        crashCount: 0,
        recoveryCount: 0,
        healthStatus: 'healthy' as const
      };

      const updatedMetrics = { ...currentMetrics, ...action.metrics };
      
      // Auto-calculate health status
      let healthStatus: 'healthy' | 'warning' | 'critical' | 'recovering' = 'healthy';
      if (updatedMetrics.errorCount > 5) healthStatus = 'critical';
      else if (updatedMetrics.errorCount > 2) healthStatus = 'warning';
      else if (updatedMetrics.recoveryCount > updatedMetrics.crashCount) healthStatus = 'recovering';

      return {
        ...state,
        modules: {
          ...state.modules,
          [action.moduleId]: { ...updatedMetrics, healthStatus }
        }
      };

    case 'TRACK_HOOK_USAGE':
      const existingHook = state.hooks[action.hookName];
      const isDuplicate = existingHook && existingHook.moduleId !== action.moduleId;
      
      const updatedHooks = {
        ...state.hooks,
        [action.hookName]: {
          hookName: action.hookName,
          usageCount: (existingHook?.usageCount || 0) + 1,
          lastUsed: Date.now(),
          isDuplicate,
          moduleId: action.moduleId,
          source: action.source
        }
      };

      const duplicates = Object.values(updatedHooks)
        .filter(hook => hook.isDuplicate)
        .map(hook => hook.hookName);

      return {
        ...state,
        hooks: updatedHooks,
        duplicateDetections: Array.from(new Set([...state.duplicateDetections, ...duplicates]))
      };

    case 'DETECT_LAYOUT_SHIFT':
      const existingLayout = state.layouts[action.elementId];
      const hasShift = existingLayout?.originalLayout ? 
        Math.abs(action.layout.top - existingLayout.originalLayout.top) > 5 ||
        Math.abs(action.layout.left - existingLayout.originalLayout.left) > 5 : false;

      return {
        ...state,
        layouts: {
          ...state.layouts,
          [action.elementId]: {
            originalLayout: existingLayout?.originalLayout || action.layout,
            currentLayout: action.layout,
            hasLayoutShift: hasShift,
            shiftAmount: hasShift ? 
              Math.sqrt(
                Math.pow(action.layout.top - (existingLayout?.originalLayout?.top || 0), 2) +
                Math.pow(action.layout.left - (existingLayout?.originalLayout?.left || 0), 2)
              ) : 0,
            isProtected: true
          }
        }
      };

    case 'ADD_PROTECTION_ALERT':
      return {
        ...state,
        protectionAlerts: [...state.protectionAlerts, action.alert].slice(-10) // Keep last 10
      };

    case 'CLEAR_ALERTS':
      return {
        ...state,
        protectionAlerts: [],
        duplicateDetections: []
      };

    case 'UPDATE_GLOBAL_HEALTH':
      return {
        ...state,
        globalHealth: action.health
      };

    default:
      return state;
  }
};

// Context interface
interface StabilityContextValue {
  state: StabilityState;
  trackModuleMetrics: (moduleId: string, metrics: Partial<StabilityMetrics>) => void;
  trackHookUsage: (hookName: string, moduleId: string, source: string) => void;
  detectLayoutShift: (elementId: string, rect: DOMRect | DOMRectReadOnly) => void;
  addProtectionAlert: (alert: string) => void;
  clearAlerts: () => void;
  isStable: boolean;
  getDuplicateHooks: () => HookUsageTracker[];
  getLayoutShifts: () => LayoutProtection[];
  getModuleHealth: (moduleId: string) => StabilityMetrics | null;
}

// Create context
const StabilityContext = createContext<StabilityContextValue | undefined>(undefined);

// Initial state
const createInitialState = (): StabilityState => ({
  modules: {},
  hooks: {},
  layouts: {},
  globalHealth: 'stable',
  duplicateDetections: [],
  protectionAlerts: []
});

// Provider component
interface StabilityProviderProps {
  children: ReactNode;
  enableMonitoring?: boolean;
  alertThreshold?: number;
}

export const StabilityProvider: React.FC<StabilityProviderProps> = ({
  children,
  enableMonitoring = true,
  alertThreshold = 3
}) => {
  const [state, dispatch] = useReducer(stabilityReducer, createInitialState());

  // Performance monitoring
  React.useEffect(() => {
    if (!enableMonitoring) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure' && entry.name.includes('module-')) {
          const moduleId = entry.name.replace('module-', '');
          trackModuleMetrics(moduleId, {
            loadTime: entry.duration,
            performanceScore: Math.max(0, 100 - (entry.duration / 10))
          });
        }
      }
    });

    observer.observe({ entryTypes: ['measure'] });
    return () => observer.disconnect();
  }, [enableMonitoring]);

  // Global error handling
  React.useEffect(() => {
    if (!enableMonitoring) return;

    const handleError = (event: ErrorEvent) => {
      const moduleId = 'global';
      addProtectionAlert(`Global error: ${event.message}`);
      trackModuleMetrics(moduleId, {
        errorCount: (state.modules[moduleId]?.errorCount || 0) + 1,
        lastError: event.message
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const moduleId = 'global';
      addProtectionAlert(`Unhandled promise rejection: ${event.reason}`);
      trackModuleMetrics(moduleId, {
        errorCount: (state.modules[moduleId]?.errorCount || 0) + 1,
        lastError: String(event.reason)
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [enableMonitoring, state.modules]);

  // Action creators
  const trackModuleMetrics = useCallback((moduleId: string, metrics: Partial<StabilityMetrics>) => {
    dispatch({ type: 'UPDATE_MODULE_METRICS', moduleId, metrics });
  }, []);

  const trackHookUsage = useCallback((hookName: string, moduleId: string, source: string) => {
    dispatch({ type: 'TRACK_HOOK_USAGE', hookName, moduleId, source });
  }, []);

  const detectLayoutShift = useCallback((elementId: string, rect: DOMRect | DOMRectReadOnly) => {
    dispatch({ type: 'DETECT_LAYOUT_SHIFT', elementId, layout: rect });
  }, []);

  const addProtectionAlert = useCallback((alert: string) => {
    console.warn(`🛡️ Stability Alert: ${alert}`);
    dispatch({ type: 'ADD_PROTECTION_ALERT', alert });
  }, []);

  const clearAlerts = useCallback(() => {
    dispatch({ type: 'CLEAR_ALERTS' });
  }, []);

  // Computed values
  const isStable = React.useMemo(() => {
    const moduleHealthScores = Object.values(state.modules).map(m => m.healthStatus);
    const criticalCount = moduleHealthScores.filter(h => h === 'critical').length;
    const warningCount = moduleHealthScores.filter(h => h === 'warning').length;
    
    return criticalCount === 0 && warningCount <= alertThreshold;
  }, [state.modules, alertThreshold]);

  const getDuplicateHooks = useCallback(() => {
    return Object.values(state.hooks).filter(hook => hook.isDuplicate);
  }, [state.hooks]);

  const getLayoutShifts = useCallback(() => {
    return Object.values(state.layouts).filter(layout => layout.hasLayoutShift);
  }, [state.layouts]);

  const getModuleHealth = useCallback((moduleId: string) => {
    return state.modules[moduleId] || null;
  }, [state.modules]);

  // Auto-update global health
  React.useEffect(() => {
    const duplicates = getDuplicateHooks();
    const shifts = getLayoutShifts();
    const criticalModules = Object.values(state.modules).filter(m => m.healthStatus === 'critical');

    let globalHealth: 'stable' | 'warning' | 'unstable' = 'stable';
    
    if (criticalModules.length > 0 || duplicates.length > 2) {
      globalHealth = 'unstable';
    } else if (duplicates.length > 0 || shifts.length > 1 || state.protectionAlerts.length > alertThreshold) {
      globalHealth = 'warning';
    }

    if (globalHealth !== state.globalHealth) {
      dispatch({ type: 'UPDATE_GLOBAL_HEALTH', health: globalHealth });
    }
  }, [state.modules, state.protectionAlerts, getDuplicateHooks, getLayoutShifts, alertThreshold, state.globalHealth]);

  const contextValue: StabilityContextValue = {
    state,
    trackModuleMetrics,
    trackHookUsage,
    detectLayoutShift,
    addProtectionAlert,
    clearAlerts,
    isStable,
    getDuplicateHooks,
    getLayoutShifts,
    getModuleHealth
  };

  return (
    <StabilityContext.Provider value={contextValue}>
      {children}
    </StabilityContext.Provider>
  );
};

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

  // Track renders
  React.useEffect(() => {
    setRenderCount(prev => prev + 1);
    trackModuleMetrics(moduleId, { renderCount: renderCount + 1 });
  }, [moduleId, renderCount, trackModuleMetrics]);

  // Performance measurement
  React.useEffect(() => {
    const startTime = performance.now();
    performance.mark(`${moduleId}-start`);

    return () => {
      performance.mark(`${moduleId}-end`);
      performance.measure(`module-${moduleId}`, `${moduleId}-start`, `${moduleId}-end`);
    };
  }, [moduleId]);

  const reportError = useCallback((error: Error) => {
    addProtectionAlert(`Module ${moduleId} error: ${error.message}`);
    trackModuleMetrics(moduleId, {
      errorCount: (getModuleHealth(moduleId)?.errorCount || 0) + 1,
      lastError: error.message
    });
  }, [moduleId, addProtectionAlert, trackModuleMetrics, getModuleHealth]);

  const reportRecovery = useCallback(() => {
    trackModuleMetrics(moduleId, {
      recoveryCount: (getModuleHealth(moduleId)?.recoveryCount || 0) + 1
    });
  }, [moduleId, trackModuleMetrics, getModuleHealth]);

  return {
    moduleHealth: getModuleHealth(moduleId),
    renderCount,
    reportError,
    reportRecovery
  };
};

// Hook for detecting hook duplicates
export const useHookProtection = (hookName: string, moduleId: string) => {
  const { trackHookUsage, getDuplicateHooks } = useStability();

  React.useEffect(() => {
    const source = new Error().stack?.split('\n')[2] || 'unknown';
    trackHookUsage(hookName, moduleId, source);
  }, [hookName, moduleId, trackHookUsage]);

  const duplicates = getDuplicateHooks();
  const isDuplicate = duplicates.some(hook => hook.hookName === hookName);

  if (isDuplicate) {
    console.warn(`🚨 Duplicate hook detected: ${hookName} in module ${moduleId}`);
  }

  return { isDuplicate, duplicates };
};

// Hook for layout shift protection
export const useLayoutProtection = (elementId: string) => {
  const { detectLayoutShift, getLayoutShifts } = useStability();
  const elementRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new ResizeObserver(() => {
      detectLayoutShift(elementId, element.getBoundingClientRect());
    });

    observer.observe(element);
    
    // Initial measurement
    detectLayoutShift(elementId, element.getBoundingClientRect());

    return () => observer.disconnect();
  }, [elementId, detectLayoutShift]);

  const layoutShifts = getLayoutShifts();
  const hasShift = layoutShifts.some(shift => shift.hasLayoutShift);

  return { elementRef, hasShift, layoutShifts };
};
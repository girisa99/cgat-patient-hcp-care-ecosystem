import React, { createContext, useContext, ReactNode, useReducer, useCallback } from 'react';

// Types for isolated state management
interface StateSlice<T = any> {
  data: T;
  loading: boolean;
  error: string | null;
  lastUpdated: number;
  version: number;
}

interface IsolatedState {
  slices: Record<string, StateSlice>;
  globalLoading: boolean;
  moduleId: string;
}

type StateAction<T = any> =
  | { type: 'SET_SLICE_DATA'; sliceKey: string; data: T }
  | { type: 'SET_SLICE_LOADING'; sliceKey: string; loading: boolean }
  | { type: 'SET_SLICE_ERROR'; sliceKey: string; error: string | null }
  | { type: 'RESET_SLICE'; sliceKey: string }
  | { type: 'CLEAR_ALL_SLICES' }
  | { type: 'SET_GLOBAL_LOADING'; loading: boolean };

// State reducer with isolation
const stateReducer = (state: IsolatedState, action: StateAction): IsolatedState => {
  switch (action.type) {
    case 'SET_SLICE_DATA':
      return {
        ...state,
        slices: {
          ...state.slices,
          [action.sliceKey]: {
            ...state.slices[action.sliceKey],
            data: action.data,
            loading: false,
            error: null,
            lastUpdated: Date.now(),
            version: (state.slices[action.sliceKey]?.version || 0) + 1
          }
        }
      };

    case 'SET_SLICE_LOADING':
      return {
        ...state,
        slices: {
          ...state.slices,
          [action.sliceKey]: {
            ...state.slices[action.sliceKey],
            loading: action.loading,
            error: action.loading ? null : state.slices[action.sliceKey]?.error || null,
            lastUpdated: Date.now(),
            version: state.slices[action.sliceKey]?.version || 0
          }
        }
      };

    case 'SET_SLICE_ERROR':
      return {
        ...state,
        slices: {
          ...state.slices,
          [action.sliceKey]: {
            ...state.slices[action.sliceKey],
            error: action.error,
            loading: false,
            lastUpdated: Date.now(),
            version: state.slices[action.sliceKey]?.version || 0
          }
        }
      };

    case 'RESET_SLICE':
      const { [action.sliceKey]: removed, ...remainingSlices } = state.slices;
      return {
        ...state,
        slices: remainingSlices
      };

    case 'CLEAR_ALL_SLICES':
      return {
        ...state,
        slices: {},
        globalLoading: false
      };

    case 'SET_GLOBAL_LOADING':
      return {
        ...state,
        globalLoading: action.loading
      };

    default:
      return state;
  }
};

// Context interface
interface StateIsolationContextValue {
  state: IsolatedState;
  getSlice: <T = any>(key: string) => StateSlice<T> | undefined;
  setSliceData: <T = any>(key: string, data: T) => void;
  setSliceLoading: (key: string, loading: boolean) => void;
  setSliceError: (key: string, error: string | null) => void;
  resetSlice: (key: string) => void;
  clearAllSlices: () => void;
  setGlobalLoading: (loading: boolean) => void;
  useSlice: <T = any>(key: string, initialData?: T) => [StateSlice<T>, StateSliceActions<T>];
  moduleId: string;
}

interface StateSliceActions<T = any> {
  setData: (data: T) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  update: (updater: (prev: T) => T) => void;
}

// Create context
const StateIsolationContext = createContext<StateIsolationContextValue | undefined>(undefined);

// Provider component
interface StateIsolationProviderProps {
  children: ReactNode;
  moduleId: string;
  isolated?: boolean;
}

export const StateIsolationProvider: React.FC<StateIsolationProviderProps> = ({
  children,
  moduleId,
  isolated = true
}) => {
  const [state, dispatch] = useReducer(stateReducer, {
    slices: {},
    globalLoading: false,
    moduleId
  });

  // Action creators
  const getSlice = useCallback(<T = any>(key: string): StateSlice<T> | undefined => {
    return state.slices[key] as StateSlice<T> | undefined;
  }, [state.slices]);

  const setSliceData = useCallback(<T = any>(key: string, data: T) => {
    dispatch({ type: 'SET_SLICE_DATA', sliceKey: key, data });
  }, []);

  const setSliceLoading = useCallback((key: string, loading: boolean) => {
    dispatch({ type: 'SET_SLICE_LOADING', sliceKey: key, loading });
  }, []);

  const setSliceError = useCallback((key: string, error: string | null) => {
    dispatch({ type: 'SET_SLICE_ERROR', sliceKey: key, error });
  }, []);

  const resetSlice = useCallback((key: string) => {
    dispatch({ type: 'RESET_SLICE', sliceKey: key });
  }, []);

  const clearAllSlices = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_SLICES' });
  }, []);

  const setGlobalLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_GLOBAL_LOADING', loading });
  }, []);

  // Hook for individual slice management
  const useSlice = useCallback(<T = any>(key: string, initialData?: T): [StateSlice<T>, StateSliceActions<T>] => {
    const slice = getSlice<T>(key) || {
      data: initialData,
      loading: false,
      error: null,
      lastUpdated: Date.now(),
      version: 0
    } as StateSlice<T>;

    const actions: StateSliceActions<T> = {
      setData: (data: T) => setSliceData(key, data),
      setLoading: (loading: boolean) => setSliceLoading(key, loading),
      setError: (error: string | null) => setSliceError(key, error),
      reset: () => resetSlice(key),
      update: (updater: (prev: T) => T) => {
        const currentData = getSlice<T>(key)?.data;
        if (currentData !== undefined) {
          setSliceData(key, updater(currentData));
        }
      }
    };

    return [slice, actions];
  }, [getSlice, setSliceData, setSliceLoading, setSliceError, resetSlice]);

  const contextValue: StateIsolationContextValue = {
    state,
    getSlice,
    setSliceData,
    setSliceLoading,
    setSliceError,
    resetSlice,
    clearAllSlices,
    setGlobalLoading,
    useSlice,
    moduleId
  };

  const wrapperProps = isolated ? {
    'data-state-module': moduleId,
    className: 'state-isolation-boundary'
  } : {};

  return (
    <div {...wrapperProps}>
      <StateIsolationContext.Provider value={contextValue}>
        {children}
      </StateIsolationContext.Provider>
    </div>
  );
};

// Hook to use state isolation
export const useStateIsolation = () => {
  const context = useContext(StateIsolationContext);
  if (context === undefined) {
    throw new Error('useStateIsolation must be used within a StateIsolationProvider');
  }
  return context;
};

// Hook for managing a specific state slice
export const useIsolatedSlice = <T = any>(
  sliceKey: string, 
  initialData?: T
): [StateSlice<T>, StateSliceActions<T>] => {
  const { useSlice } = useStateIsolation();
  return useSlice<T>(sliceKey, initialData);
};

// Hook for async data fetching with isolation
export const useIsolatedAsync = <T = any>(
  sliceKey: string,
  fetchFn: () => Promise<T>,
  dependencies: React.DependencyList = []
) => {
  const [slice, actions] = useIsolatedSlice<T>(sliceKey);

  const refetch = useCallback(async () => {
    try {
      actions.setLoading(true);
      actions.setError(null);
      const data = await fetchFn();
      actions.setData(data);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      actions.setError(errorMessage);
      throw error;
    }
  }, [fetchFn, actions]);

  // Auto-fetch on mount or dependency change
  React.useEffect(() => {
    refetch().catch(() => {
      // Error already handled in refetch
    });
  }, dependencies);

  return {
    ...slice,
    refetch,
    isStale: slice.lastUpdated < Date.now() - 300000, // 5 minutes
    actions
  };
};

// Hook for isolated form state
export const useIsolatedForm = <T extends Record<string, any>>(
  formKey: string,
  initialValues: T
) => {
  const [slice, actions] = useIsolatedSlice(formKey, initialValues);

  const updateField = useCallback((field: keyof T, value: any) => {
    actions.update(prev => ({
      ...prev,
      [field]: value
    }));
  }, [actions]);

  const updateFields = useCallback((updates: Partial<T>) => {
    actions.update(prev => ({
      ...prev,
      ...updates
    }));
  }, [actions]);

  const resetForm = useCallback(() => {
    actions.setData(initialValues);
  }, [actions, initialValues]);

  const validateForm = useCallback((validator: (data: T) => string | null) => {
    const error = validator(slice.data);
    actions.setError(error);
    return error === null;
  }, [slice.data, actions]);

  return {
    formData: slice.data,
    loading: slice.loading,
    error: slice.error,
    updateField,
    updateFields,
    resetForm,
    validateForm,
    setLoading: actions.setLoading,
    setError: actions.setError
  };
};

// Performance monitoring hook
export const useStatePerformance = (moduleId: string) => {
  const { state } = useStateIsolation();
  
  return React.useMemo(() => {
    const sliceCount = Object.keys(state.slices).length;
    const loadingSlices = Object.values(state.slices).filter(s => s.loading).length;
    const errorSlices = Object.values(state.slices).filter(s => s.error).length;
    const totalUpdates = Object.values(state.slices).reduce((sum, s) => sum + s.version, 0);
    
    return {
      moduleId,
      sliceCount,
      loadingSlices,
      errorSlices,
      totalUpdates,
      globalLoading: state.globalLoading,
      performance: {
        efficiency: sliceCount > 0 ? (sliceCount - errorSlices) / sliceCount : 1,
        activity: loadingSlices / Math.max(sliceCount, 1)
      }
    };
  }, [state, moduleId]);
};
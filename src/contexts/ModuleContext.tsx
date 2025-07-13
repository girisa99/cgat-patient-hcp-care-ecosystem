import React, { createContext, useContext, ReactNode, useReducer, useCallback } from 'react';

// Types for module context
export interface ModuleState {
  moduleName: string;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  data: Record<string, any>;
  permissions: string[];
  settings: Record<string, any>;
  lastUpdated: number;
}

export type ModuleAction =
  | { type: 'INITIALIZE'; payload: { moduleName: string; permissions: string[] } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DATA'; payload: { key: string; value: any } }
  | { type: 'UPDATE_SETTINGS'; payload: Record<string, any> }
  | { type: 'CLEAR_DATA' }
  | { type: 'RESET_MODULE' };

// Module reducer
const moduleReducer = (state: ModuleState, action: ModuleAction): ModuleState => {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        moduleName: action.payload.moduleName,
        permissions: action.payload.permissions,
        isInitialized: true,
        isLoading: false,
        error: null,
        lastUpdated: Date.now()
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error, // Clear error when starting to load
        lastUpdated: Date.now()
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        lastUpdated: Date.now()
      };

    case 'SET_DATA':
      return {
        ...state,
        data: {
          ...state.data,
          [action.payload.key]: action.payload.value
        },
        lastUpdated: Date.now()
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        },
        lastUpdated: Date.now()
      };

    case 'CLEAR_DATA':
      return {
        ...state,
        data: {},
        lastUpdated: Date.now()
      };

    case 'RESET_MODULE':
      return {
        moduleName: state.moduleName,
        isInitialized: false,
        isLoading: false,
        error: null,
        data: {},
        permissions: [],
        settings: {},
        lastUpdated: Date.now()
      };

    default:
      return state;
  }
};

// Context interface
interface ModuleContextValue {
  state: ModuleState;
  initialize: (moduleName: string, permissions: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setData: (key: string, value: any) => void;
  updateSettings: (settings: Record<string, any>) => void;
  clearData: () => void;
  resetModule: () => void;
  hasPermission: (permission: string) => boolean;
  getData: <T = any>(key: string, defaultValue?: T) => T;
  getSetting: <T = any>(key: string, defaultValue?: T) => T;
}

// Create context
const ModuleContext = createContext<ModuleContextValue | undefined>(undefined);

// Initial state factory
const createInitialState = (moduleName?: string): ModuleState => ({
  moduleName: moduleName || '',
  isInitialized: false,
  isLoading: false,
  error: null,
  data: {},
  permissions: [],
  settings: {},
  lastUpdated: Date.now()
});

// Provider component
interface ModuleProviderProps {
  children: ReactNode;
  moduleName?: string;
  initialPermissions?: string[];
  initialSettings?: Record<string, any>;
  isolated?: boolean; // Whether this module should be completely isolated
}

export const ModuleProvider: React.FC<ModuleProviderProps> = ({
  children,
  moduleName = '',
  initialPermissions = [],
  initialSettings = {},
  isolated = true
}) => {
  const [state, dispatch] = useReducer(
    moduleReducer,
    createInitialState(moduleName)
  );

  // Initialize module
  const initialize = useCallback((name: string, permissions: string[]) => {
    console.log(`🚀 Initializing module: ${name}`);
    dispatch({ 
      type: 'INITIALIZE', 
      payload: { moduleName: name, permissions } 
    });
    
    // Set initial settings
    if (Object.keys(initialSettings).length > 0) {
      dispatch({ type: 'UPDATE_SETTINGS', payload: initialSettings });
    }
  }, [initialSettings]);

  // Auto-initialize if moduleName provided
  React.useEffect(() => {
    if (moduleName && !state.isInitialized) {
      initialize(moduleName, initialPermissions);
    }
  }, [moduleName, initialPermissions, initialize, state.isInitialized]);

  // Action creators
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setData = useCallback((key: string, value: any) => {
    dispatch({ type: 'SET_DATA', payload: { key, value } });
  }, []);

  const updateSettings = useCallback((settings: Record<string, any>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  const clearData = useCallback(() => {
    dispatch({ type: 'CLEAR_DATA' });
  }, []);

  const resetModule = useCallback(() => {
    console.log(`🔄 Resetting module: ${state.moduleName}`);
    dispatch({ type: 'RESET_MODULE' });
  }, [state.moduleName]);

  // Helper functions
  const hasPermission = useCallback((permission: string) => {
    return state.permissions.includes(permission);
  }, [state.permissions]);

  const getData = useCallback(<T = any>(key: string, defaultValue?: T): T => {
    return state.data[key] ?? defaultValue;
  }, [state.data]);

  const getSetting = useCallback(<T = any>(key: string, defaultValue?: T): T => {
    return state.settings[key] ?? defaultValue;
  }, [state.settings]);

  const contextValue: ModuleContextValue = {
    state,
    initialize,
    setLoading,
    setError,
    setData,
    updateSettings,
    clearData,
    resetModule,
    hasPermission,
    getData,
    getSetting
  };

  // Isolation wrapper - prevents context bleeding
  if (isolated) {
    return (
      <div data-module={state.moduleName} className="module-isolation-boundary">
        <ModuleContext.Provider value={contextValue}>
          {children}
        </ModuleContext.Provider>
      </div>
    );
  }

  return (
    <ModuleContext.Provider value={contextValue}>
      {children}
    </ModuleContext.Provider>
  );
};

// Hook to use module context
export const useModuleContext = () => {
  const context = useContext(ModuleContext);
  if (context === undefined) {
    throw new Error('useModuleContext must be used within a ModuleProvider');
  }
  return context;
};

// Hook for module-specific data management
export const useModuleData = <T = any>(key: string, initialValue?: T) => {
  const { getData, setData } = useModuleContext();
  
  const value = getData<T>(key, initialValue);
  
  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    if (typeof newValue === 'function') {
      const currentValue = getData<T>(key, initialValue);
      const computedValue = (newValue as (prev: T) => T)(currentValue);
      setData(key, computedValue);
    } else {
      setData(key, newValue);
    }
  }, [key, getData, setData, initialValue]);

  return [value, setValue] as const;
};

// Hook for module settings
export const useModuleSettings = <T = any>(key: string, defaultValue?: T) => {
  const { getSetting, updateSettings } = useModuleContext();
  
  const value = getSetting<T>(key, defaultValue);
  
  const setValue = useCallback((newValue: T) => {
    updateSettings({ [key]: newValue });
  }, [key, updateSettings]);

  return [value, setValue] as const;
};

// Hook for module permissions
export const useModulePermissions = (requiredPermissions?: string[]) => {
  const { hasPermission, state } = useModuleContext();
  
  const hasAllPermissions = React.useMemo(() => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    return requiredPermissions.every(permission => hasPermission(permission));
  }, [requiredPermissions, hasPermission]);

  const hasAnyPermission = React.useMemo(() => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    return requiredPermissions.some(permission => hasPermission(permission));
  }, [requiredPermissions, hasPermission]);

  return {
    permissions: state.permissions,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission
  };
};
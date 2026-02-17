/**
 * COMPREHENSIVE COMPONENT ISOLATION SYSTEM
 * Ensures components never break each other during development
 */
import React, { ReactNode, ErrorInfo, Component } from 'react';
import { useMasterToast } from '@/hooks/useMasterToast';

interface IsolationBoundaryProps {
  moduleId: string;
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface IsolationBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ComponentIsolationBoundary extends Component<IsolationBoundaryProps, IsolationBoundaryState> {
  constructor(props: IsolationBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): IsolationBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Log error without breaking other components
    console.error(`🚨 Component Error in ${this.props.moduleId}:`, error, errorInfo);
    
    // Report to monitoring system
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <h3 className="text-red-800 font-semibold">Module Error: {this.props.moduleId}</h3>
          <p className="text-red-600 text-sm">This component encountered an error and has been isolated.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for automatic isolation
export const withComponentIsolation = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  moduleId: string
) => {
  const IsolatedComponent = (props: P) => (
    <ComponentIsolationBoundary moduleId={moduleId}>
      <WrappedComponent {...props} />
    </ComponentIsolationBoundary>
  );

  IsolatedComponent.displayName = `Isolated(${moduleId})`;
  return IsolatedComponent;
};

// State isolation hook
export const useStateIsolation = <T,>(initialValue: T, moduleId: string) => {
  const [state, setState] = React.useState<T>(initialValue);
  
  // Isolate state changes to prevent cross-module contamination
  const setIsolatedState = React.useCallback((newState: T | ((prev: T) => T)) => {
    try {
      setState(newState);
    } catch (error) {
      console.error(`🚨 State Error in ${moduleId}:`, error);
      // Reset to initial value on error
      setState(initialValue);
    }
  }, [initialValue, moduleId]);

  return [state, setIsolatedState] as const;
};

// Event isolation hook
export const useEventIsolation = (moduleId: string) => {
  const { showError } = useMasterToast();

  const isolatedHandler = React.useCallback(
    <TArgs extends any[]>(handler: (...args: TArgs) => void | Promise<void>) => {
      return async (...args: TArgs) => {
        try {
          await handler(...args);
        } catch (error) {
          console.error(`🚨 Event Error in ${moduleId}:`, error);
          showError(`Error in ${moduleId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };
    },
    [moduleId, showError]
  );

  return { isolatedHandler };
};

export default ComponentIsolationBoundary;
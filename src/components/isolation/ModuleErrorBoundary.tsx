import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  moduleName: string;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showRetry?: boolean;
  showNavigateHome?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
}

export class ModuleErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`🚨 Error in ${this.props.moduleName} module:`, error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      console.log(`🔄 Retrying ${this.props.moduleName} module (attempt ${this.state.retryCount + 1})`);
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  handleNavigateHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      const canRetry = this.state.retryCount < this.maxRetries;
      const { showRetry = true, showNavigateHome = true } = this.props;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle className="text-destructive">
                {this.props.moduleName} Module Error
              </CardTitle>
              <CardDescription>
                Something went wrong while loading this module. 
                {canRetry && ' You can try refreshing the component.'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Error Details (development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-muted p-3 rounded-md text-sm">
                  <summary className="cursor-pointer font-medium mb-2">
                    Technical Details
                  </summary>
                  <div className="space-y-2 text-xs">
                    <div>
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 overflow-auto max-h-32 bg-background p-2 rounded border">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                {showRetry && canRetry && (
                  <Button 
                    onClick={this.handleRetry}
                    variant="default"
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry Module ({this.maxRetries - this.state.retryCount} left)
                  </Button>
                )}
                
                {showNavigateHome && (
                  <Button 
                    onClick={this.handleNavigateHome}
                    variant="outline"
                    className="flex-1"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                )}
              </div>

              {!canRetry && showRetry && (
                <p className="text-sm text-muted-foreground text-center">
                  Maximum retry attempts reached. Please refresh the page or contact support.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useModuleErrorBoundary = (moduleName: string) => {
  const reportError = React.useCallback((error: Error, errorInfo?: any) => {
    console.error(`🚨 Error in ${moduleName} module:`, error, errorInfo);
    
    // Here you could integrate with error reporting services
    // like Sentry, Bugsnag, etc.
  }, [moduleName]);

  return { reportError };
};
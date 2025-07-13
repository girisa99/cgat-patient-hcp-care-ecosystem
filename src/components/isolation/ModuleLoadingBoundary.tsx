import React, { Suspense, ReactNode } from 'react';
import { Loader2, Clock, Wifi, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ModuleLoadingBoundaryProps {
  children: ReactNode;
  moduleName: string;
  loadingComponent?: ReactNode;
  fallback?: ReactNode;
  timeout?: number;
  showModuleName?: boolean;
}

interface ModuleLoadingStateProps {
  moduleName: string;
  message?: string;
  showModuleName?: boolean;
  variant?: 'default' | 'card' | 'minimal' | 'skeleton';
}

// Enhanced loading component with different variants
export const ModuleLoadingState: React.FC<ModuleLoadingStateProps> = ({
  moduleName,
  message,
  showModuleName = true,
  variant = 'default'
}) => {
  const getLoadingContent = () => {
    switch (variant) {
      case 'minimal':
        return (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            {showModuleName && (
              <span className="ml-2 text-sm text-muted-foreground">
                Loading {moduleName}...
              </span>
            )}
          </div>
        );

      case 'skeleton':
        return (
          <div className="space-y-4 p-4">
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
              <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-muted animate-pulse rounded" />
              <div className="h-20 bg-muted animate-pulse rounded" />
            </div>
          </div>
        );

      case 'card':
        return (
          <div className="min-h-[200px] flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
                {showModuleName && (
                  <CardTitle className="text-lg">Loading {moduleName}</CardTitle>
                )}
                {message && (
                  <CardDescription>{message}</CardDescription>
                )}
              </CardHeader>
            </Card>
          </div>
        );

      default:
        return (
          <div className="min-h-[300px] flex flex-col items-center justify-center p-8 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse" />
            </div>
            
            {showModuleName && (
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">Loading {moduleName}</h3>
                {message && (
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {message}
                  </p>
                )}
              </div>
            )}
          </div>
        );
    }
  };

  return <div className="w-full">{getLoadingContent()}</div>;
};

// Timeout wrapper for handling slow-loading modules
const TimeoutWrapper: React.FC<{
  children: ReactNode;
  timeout?: number;
  moduleName: string;
}> = ({ children, timeout = 10000, moduleName }) => {
  const [isTimedOut, setIsTimedOut] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimedOut(true);
      console.warn(`⏰ ${moduleName} module loading timeout after ${timeout}ms`);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, moduleName]);

  if (isTimedOut) {
    return (
      <div className="min-h-[200px] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <CardTitle className="text-warning">Loading Timeout</CardTitle>
            <CardDescription>
              {moduleName} is taking longer than expected to load.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <Wifi className="w-4 h-4" />
                <span>Check your connection</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Module may be experiencing issues</span>
              </div>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              size="sm"
            >
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

// Main boundary component
export const ModuleLoadingBoundary: React.FC<ModuleLoadingBoundaryProps> = ({
  children,
  moduleName,
  loadingComponent,
  fallback,
  timeout,
  showModuleName = true
}) => {
  const defaultLoadingComponent = loadingComponent || (
    <ModuleLoadingState 
      moduleName={moduleName}
      showModuleName={showModuleName}
      message={`Initializing ${moduleName} module...`}
    />
  );

  const content = (
    <Suspense fallback={fallback || defaultLoadingComponent}>
      {children}
    </Suspense>
  );

  // Wrap with timeout if specified
  if (timeout) {
    return (
      <TimeoutWrapper timeout={timeout} moduleName={moduleName}>
        {content}
      </TimeoutWrapper>
    );
  }

  return content;
};

// Utility hook for module loading states
export const useModuleLoading = (moduleName: string) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState<string>('');

  const startLoading = React.useCallback((message?: string) => {
    console.log(`🔄 ${moduleName} module loading started`);
    setIsLoading(true);
    setLoadingMessage(message || `Loading ${moduleName}...`);
  }, [moduleName]);

  const stopLoading = React.useCallback(() => {
    console.log(`✅ ${moduleName} module loading completed`);
    setIsLoading(false);
    setLoadingMessage('');
  }, [moduleName]);

  const LoadingComponent = React.useMemo(() => {
    if (!isLoading) return null;
    
    return (
      <ModuleLoadingState 
        moduleName={moduleName}
        message={loadingMessage}
        variant="minimal"
      />
    );
  }, [isLoading, moduleName, loadingMessage]);

  return {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
    LoadingComponent
  };
};
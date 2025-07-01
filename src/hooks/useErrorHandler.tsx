
import { useToast } from './use-toast';
import { useCallback } from 'react';

interface ErrorContext {
  component?: string;
  operation?: string;
  metadata?: Record<string, any>;
}

interface ErrorHandlerOptions {
  component: string;
  showToast?: boolean;
  logToConsole?: boolean;
}

export const useErrorHandler = (options: ErrorHandlerOptions) => {
  const { toast } = useToast();
  const { component, showToast = true, logToConsole = true } = options;

  const handleError = useCallback((
    error: any, 
    context?: ErrorContext
  ) => {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    const errorDetails = {
      component,
      operation: context?.operation,
      error: errorMessage,
      metadata: context?.metadata,
      timestamp: new Date().toISOString()
    };

    if (logToConsole) {
      console.error(`❌ Error in ${component}:`, errorDetails);
    }

    if (showToast) {
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }

    return errorDetails;
  }, [component, showToast, logToConsole, toast]);

  return { handleError };
};


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
    
    // Enhanced database error detection
    const isDatabaseError = errorMessage.toLowerCase().includes('database') ||
                           errorMessage.toLowerCase().includes('supabase') ||
                           errorMessage.toLowerCase().includes('postgres') ||
                           errorMessage.toLowerCase().includes('rls') ||
                           errorMessage.toLowerCase().includes('policy') ||
                           errorMessage.toLowerCase().includes('row-level security') ||
                           error?.code?.startsWith?.('PGRST');
    
    const errorDetails = {
      component,
      operation: context?.operation,
      error: errorMessage,
      metadata: context?.metadata,
      timestamp: new Date().toISOString(),
      isDatabaseError,
      errorCode: error?.code,
      errorHint: error?.hint
    };

    if (logToConsole) {
      console.error(`❌ Error in ${component}:`, errorDetails);
      
      // Extra logging for database errors
      if (isDatabaseError) {
        console.error('🗄️ Database Error Details:', {
          originalError: error,
          sqlState: error?.code,
          hint: error?.hint,
          details: error?.details
        });
      }
    }

    if (showToast) {
      const displayMessage = isDatabaseError && context?.operation
        ? `Database error during ${context.operation}: ${errorMessage}`
        : errorMessage;
        
      toast({
        title: "Error",
        description: displayMessage,
        variant: "destructive",
      });
    }

    return errorDetails;
  }, [component, showToast, logToConsole, toast]);

  return { handleError };
};

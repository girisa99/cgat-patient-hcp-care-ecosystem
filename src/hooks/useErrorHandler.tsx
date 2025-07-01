
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { errorManager, AppError } from '@/utils/error/ErrorManager';

export interface UseErrorHandlerOptions {
  component?: string;
  showToast?: boolean;
  customHandler?: (error: AppError) => void;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const { toast } = useToast();
  const { component, showToast = true, customHandler } = options;

  const handleError = useCallback((error: Error | AppError, context?: Record<string, any>) => {
    const appError = errorManager.handleError(error, {
      ...context,
      component
    });

    // Show toast notification if enabled
    if (showToast && (appError.severity === 'high' || appError.severity === 'critical')) {
      toast({
        title: 'An error occurred',
        description: appError.message,
        variant: 'destructive'
      });
    }

    // Execute custom handler if provided
    if (customHandler) {
      customHandler(appError);
    }

    return appError;
  }, [toast, component, showToast, customHandler]);

  const handleAsyncError = useCallback(async <T>(
    asyncOperation: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T | null> => {
    try {
      return await asyncOperation();
    } catch (error) {
      handleError(error as Error, context);
      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError
  };
};

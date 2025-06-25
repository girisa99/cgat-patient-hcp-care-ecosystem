
// Authentication Error Handler
// Provides standardized error handling for auth-related operations

import { PostgrestError } from '@supabase/supabase-js';

export interface AuthErrorInfo {
  message: string;
  code?: string;
  isRecursionError: boolean;
  isPermissionError: boolean;
  userFriendlyMessage: string;
}

/**
 * Analyzes and categorizes authentication errors
 */
export const analyzeAuthError = (error: any): AuthErrorInfo => {
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  const errorCode = error?.code;

  // Check for infinite recursion errors
  const isRecursionError = errorMessage.toLowerCase().includes('infinite recursion') ||
                          errorMessage.toLowerCase().includes('recursive') ||
                          errorMessage.toLowerCase().includes('maximum recursion depth');

  // Check for permission/RLS errors
  const isPermissionError = errorMessage.toLowerCase().includes('row-level security') ||
                           errorMessage.toLowerCase().includes('insufficient') ||
                           errorMessage.toLowerCase().includes('permission') ||
                           errorMessage.toLowerCase().includes('policy');

  let userFriendlyMessage = 'An unexpected error occurred. Please try again.';

  if (isRecursionError) {
    userFriendlyMessage = 'There is a configuration issue with the system. Please contact support.';
    console.error('CRITICAL: RLS Recursion detected:', errorMessage);
  } else if (isPermissionError) {
    userFriendlyMessage = 'You do not have permission to perform this action.';
  } else if (errorCode === 'PGRST301') {
    userFriendlyMessage = 'The requested data could not be found.';
  } else if (errorCode === 'PGRST116') {
    userFriendlyMessage = 'No data found.';
  } else if (errorMessage.includes('JWT')) {
    userFriendlyMessage = 'Session expired. Please sign in again.';
  }

  return {
    message: errorMessage,
    code: errorCode,
    isRecursionError,
    isPermissionError,
    userFriendlyMessage
  };
};

/**
 * Logs authentication errors with appropriate severity
 */
export const logAuthError = (operation: string, error: any, userId?: string) => {
  const errorInfo = analyzeAuthError(error);
  
  const logData = {
    operation,
    userId,
    error: errorInfo.message,
    code: errorInfo.code,
    timestamp: new Date().toISOString()
  };

  if (errorInfo.isRecursionError) {
    console.error('CRITICAL AUTH ERROR (RLS RECURSION):', logData);
    // In production, you might want to send this to error tracking service
  } else if (errorInfo.isPermissionError) {
    console.warn('PERMISSION ERROR:', logData);
  } else {
    console.error('AUTH ERROR:', logData);
  }

  return errorInfo;
};

/**
 * Helper to safely retry auth operations with backoff
 */
export const retryAuthOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T | null> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      const errorInfo = analyzeAuthError(error);
      
      // Don't retry recursion errors
      if (errorInfo.isRecursionError) {
        console.error('RLS recursion error - not retrying:', errorInfo.message);
        throw error;
      }
      
      if (i === maxRetries - 1) {
        throw error;
      }
      
      console.warn(`Auth operation failed, retrying in ${delay}ms (attempt ${i + 1}/${maxRetries}):`, errorInfo.message);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
  
  return null;
};

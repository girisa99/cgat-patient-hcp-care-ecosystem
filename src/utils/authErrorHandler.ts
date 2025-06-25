
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
                          errorMessage.toLowerCase().includes('recursive');

  // Check for permission/RLS errors
  const isPermissionError = errorMessage.toLowerCase().includes('row-level security') ||
                           errorMessage.toLowerCase().includes('insufficient') ||
                           errorMessage.toLowerCase().includes('permission');

  let userFriendlyMessage = 'An unexpected error occurred. Please try again.';

  if (isRecursionError) {
    userFriendlyMessage = 'There is a configuration issue with the system. Please contact support.';
    console.error('CRITICAL: RLS Recursion detected:', errorMessage);
  } else if (isPermissionError) {
    userFriendlyMessage = 'You do not have permission to perform this action.';
  } else if (errorCode === 'PGRST301') {
    userFriendlyMessage = 'The requested data could not be found.';
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
    console.error('CRITICAL AUTH ERROR:', logData);
  } else if (errorInfo.isPermissionError) {
    console.warn('PERMISSION ERROR:', logData);
  } else {
    console.error('AUTH ERROR:', logData);
  }

  return errorInfo;
};

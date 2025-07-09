import React from 'react';

/**
 * Utility function to extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  
  return 'An unknown error occurred';
}

/**
 * Utility function to safely get string length for arithmetic operations
 */
export function getLength(value: unknown): number {
  if (typeof value === 'string') {
    return value.length;
  }
  
  if (Array.isArray(value)) {
    return value.length;
  }
  
  return 0;
}

/**
 * Utility function to render error messages safely in React components
 */
export function renderErrorMessage(error: unknown): string {
  return getErrorMessage(error);
}

/**
 * Utility React component to display errors
 */
export function ErrorDisplay({ error }: { error: unknown }) {
  return <div className="text-red-600">{renderErrorMessage(error)}</div>;
}
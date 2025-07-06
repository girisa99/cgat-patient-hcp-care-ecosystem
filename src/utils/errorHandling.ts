
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
    return String(error.message);
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

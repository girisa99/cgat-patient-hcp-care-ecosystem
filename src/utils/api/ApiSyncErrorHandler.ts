/**
 * API Sync Error Handler
 * Centralized error handling for API synchronization operations
 */

export interface SyncError {
  code: string;
  message: string;
  operation: string;
  context?: Record<string, any>;
  timestamp: Date;
  retryable: boolean;
}

export interface SyncErrorStats {
  totalErrors: number;
  retryableErrors: number;
  criticalErrors: number;
  lastError?: SyncError;
}

class ApiSyncErrorHandler {
  private errors: SyncError[] = [];
  private maxErrorHistory = 100;

  /**
   * Handle and categorize sync errors
   */
  handleError(error: any, operation: string, context?: Record<string, any>): SyncError {
    const syncError: SyncError = {
      code: this.categorizeError(error),
      message: this.extractErrorMessage(error),
      operation,
      context,
      timestamp: new Date(),
      retryable: this.isRetryable(error)
    };

    this.logError(syncError);
    this.addToHistory(syncError);

    return syncError;
  }

  /**
   * Categorize errors by type
   */
  private categorizeError(error: any): string {
    if (error?.code === 'PGRST116') return 'DATABASE_CONNECTION_ERROR';
    if (error?.message?.includes('network')) return 'NETWORK_ERROR';
    if (error?.message?.includes('timeout')) return 'TIMEOUT_ERROR';
    if (error?.message?.includes('authentication')) return 'AUTH_ERROR';
    if (error?.message?.includes('rate limit')) return 'RATE_LIMIT_ERROR';
    if (error?.message?.includes('schema')) return 'SCHEMA_ERROR';
    if (error?.message?.includes('validation')) return 'VALIDATION_ERROR';
    return 'UNKNOWN_ERROR';
  }

  /**
   * Extract meaningful error message
   */
  private extractErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error?.message) return error.error.message;
    if (error?.details) return error.details;
    return 'Unknown error occurred';
  }

  /**
   * Determine if error is retryable
   */
  private isRetryable(error: any): boolean {
    const retryableCodes = [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'RATE_LIMIT_ERROR',
      'DATABASE_CONNECTION_ERROR'
    ];
    
    const errorCode = this.categorizeError(error);
    return retryableCodes.includes(errorCode);
  }

  /**
   * Log error with appropriate level
   */
  private logError(syncError: SyncError): void {
    const logLevel = this.getLogLevel(syncError);
    const logMessage = `[API-SYNC-ERROR] ${syncError.operation}: ${syncError.message}`;
    
    switch (logLevel) {
      case 'error':
        console.error(logMessage, syncError);
        break;
      case 'warn':
        console.warn(logMessage, syncError);
        break;
      default:
        console.log(logMessage, syncError);
    }
  }

  /**
   * Get appropriate log level for error
   */
  private getLogLevel(syncError: SyncError): 'error' | 'warn' | 'info' {
    const criticalCodes = ['AUTH_ERROR', 'SCHEMA_ERROR', 'VALIDATION_ERROR'];
    const warningCodes = ['RATE_LIMIT_ERROR', 'TIMEOUT_ERROR'];
    
    if (criticalCodes.includes(syncError.code)) return 'error';
    if (warningCodes.includes(syncError.code)) return 'warn';
    return 'info';
  }

  /**
   * Add error to history
   */
  private addToHistory(syncError: SyncError): void {
    this.errors.unshift(syncError);
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrorHistory) {
      this.errors = this.errors.slice(0, this.maxErrorHistory);
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): SyncErrorStats {
    return {
      totalErrors: this.errors.length,
      retryableErrors: this.errors.filter(e => e.retryable).length,
      criticalErrors: this.errors.filter(e => this.getLogLevel(e) === 'error').length,
      lastError: this.errors[0]
    };
  }

  /**
   * Get recent errors for a specific operation
   */
  getErrorsForOperation(operation: string, limit = 10): SyncError[] {
    return this.errors
      .filter(e => e.operation === operation)
      .slice(0, limit);
  }

  /**
   * Clear error history
   */
  clearHistory(): void {
    this.errors = [];
  }

  /**
   * Check if operation should be retried based on error history
   */
  shouldRetry(operation: string, maxRetries = 3): boolean {
    const recentErrors = this.getErrorsForOperation(operation, maxRetries);
    
    // Don't retry if we've hit max retries
    if (recentErrors.length >= maxRetries) {
      return false;
    }

    // Don't retry if last error is not retryable
    const lastError = recentErrors[0];
    if (lastError && !lastError.retryable) {
      return false;
    }

    return true;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  getRetryDelay(operation: string, baseDelay = 1000): number {
    const recentErrors = this.getErrorsForOperation(operation);
    const retryCount = recentErrors.length;
    
    return Math.min(baseDelay * Math.pow(2, retryCount), 30000); // Max 30 seconds
  }
}

export const apiSyncErrorHandler = new ApiSyncErrorHandler();

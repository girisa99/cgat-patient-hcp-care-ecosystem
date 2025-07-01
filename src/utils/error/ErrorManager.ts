
/**
 * Centralized Error Management System
 */

export interface AppError {
  id: string;
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  component?: string;
  stack?: string;
}

export class ErrorManager {
  private static instance: ErrorManager;
  private errors: Map<string, AppError> = new Map();
  private errorHandlers: Map<string, (error: AppError) => void> = new Map();

  static getInstance(): ErrorManager {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager();
    }
    return ErrorManager.instance;
  }

  /**
   * Register an error handler for specific error codes
   */
  registerHandler(errorCode: string, handler: (error: AppError) => void): void {
    this.errorHandlers.set(errorCode, handler);
  }

  /**
   * Handle an error with centralized processing
   */
  handleError(error: Error | AppError, context?: Record<string, any>): AppError {
    const appError: AppError = this.normalizeError(error, context);
    
    // Store error
    this.errors.set(appError.id, appError);
    
    // Log error
    this.logError(appError);
    
    // Execute specific handler if exists
    const handler = this.errorHandlers.get(appError.code);
    if (handler) {
      handler(appError);
    }
    
    // Execute global handlers based on severity
    this.executeGlobalHandlers(appError);
    
    return appError;
  }

  /**
   * Normalize different error types to AppError
   */
  private normalizeError(error: Error | AppError, context?: Record<string, any>): AppError {
    if (this.isAppError(error)) {
      return { ...error, context: { ...error.context, ...context } };
    }

    const errorId = this.generateErrorId();
    const errorCode = this.categorizeError(error);
    
    return {
      id: errorId,
      code: errorCode,
      message: error.message || 'Unknown error occurred',
      severity: this.determineSeverity(error, errorCode),
      context: context || {},
      timestamp: new Date(),
      stack: error.stack,
      component: context?.component
    };
  }

  /**
   * Check if error is already an AppError
   */
  private isAppError(error: any): error is AppError {
    return error && typeof error === 'object' && 'id' in error && 'code' in error;
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Categorize error by type
   */
  private categorizeError(error: Error): string {
    if (error.name === 'TypeError') return 'TYPE_ERROR';
    if (error.name === 'ReferenceError') return 'REFERENCE_ERROR';
    if (error.message.includes('network')) return 'NETWORK_ERROR';
    if (error.message.includes('auth')) return 'AUTH_ERROR';
    if (error.message.includes('database')) return 'DATABASE_ERROR';
    if (error.message.includes('validation')) return 'VALIDATION_ERROR';
    return 'UNKNOWN_ERROR';
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: Error, code: string): AppError['severity'] {
    if (code === 'AUTH_ERROR' || code === 'DATABASE_ERROR') return 'critical';
    if (code === 'NETWORK_ERROR' || code === 'VALIDATION_ERROR') return 'high';
    if (code === 'TYPE_ERROR' || code === 'REFERENCE_ERROR') return 'medium';
    return 'low';
  }

  /**
   * Log error with appropriate level
   */
  private logError(error: AppError): void {
    const logData = {
      id: error.id,
      code: error.code,
      message: error.message,
      severity: error.severity,
      context: error.context,
      timestamp: error.timestamp.toISOString(),
      component: error.component
    };

    switch (error.severity) {
      case 'critical':
        console.error('🚨 CRITICAL ERROR:', logData);
        break;
      case 'high':
        console.error('❌ HIGH SEVERITY ERROR:', logData);
        break;
      case 'medium':
        console.warn('⚠️ MEDIUM SEVERITY ERROR:', logData);
        break;
      case 'low':
        console.log('ℹ️ LOW SEVERITY ERROR:', logData);
        break;
    }
  }

  /**
   * Execute global error handlers based on severity
   */
  private executeGlobalHandlers(error: AppError): void {
    // For critical errors, we might want to trigger alerts
    if (error.severity === 'critical') {
      this.handleCriticalError(error);
    }
    
    // For high severity errors, notify user
    if (error.severity === 'high' || error.severity === 'critical') {
      this.notifyUser(error);
    }
  }

  /**
   * Handle critical errors
   */
  private handleCriticalError(error: AppError): void {
    // Send to monitoring service
    console.error('Critical error detected - should send to monitoring service:', error);
  }

  /**
   * Notify user of errors
   */
  private notifyUser(error: AppError): void {
    // This could integrate with toast notifications
    console.warn('User notification should be triggered for:', error);
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    bySeverity: Record<AppError['severity'], number>;
    byCode: Record<string, number>;
    recent: AppError[];
  } {
    const errors = Array.from(this.errors.values());
    
    return {
      total: errors.length,
      bySeverity: {
        low: errors.filter(e => e.severity === 'low').length,
        medium: errors.filter(e => e.severity === 'medium').length,
        high: errors.filter(e => e.severity === 'high').length,
        critical: errors.filter(e => e.severity === 'critical').length
      },
      byCode: errors.reduce((acc, error) => {
        acc[error.code] = (acc[error.code] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recent: errors
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10)
    };
  }

  /**
   * Clear old errors (keep last 100)
   */
  clearOldErrors(): void {
    const errors = Array.from(this.errors.entries())
      .sort(([, a], [, b]) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 100);
    
    this.errors.clear();
    errors.forEach(([id, error]) => this.errors.set(id, error));
  }
}

// Global error manager instance
export const errorManager = ErrorManager.getInstance();

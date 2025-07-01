/**
 * Error Manager
 * Centralized error handling and reporting system
 */

export interface ErrorRecord {
  id: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  component?: string;
  timestamp: Date;
  stack?: string;
  context?: any;
}

export interface ErrorStats {
  total: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byComponent: Record<string, number>;
  recentErrors: ErrorRecord[];
}

export class ErrorManager {
  private static instance: ErrorManager;
  private errors: ErrorRecord[] = [];

  private constructor() {}

  static getInstance(): ErrorManager {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager();
    }
    return ErrorManager.instance;
  }

  /**
   * Report an error to the error manager
   */
  reportError(error: Error | string, context?: {
    component?: string;
    severity?: ErrorRecord['severity'];
    additionalContext?: any;
  }): string {
    const errorRecord: ErrorRecord = {
      id: this.generateErrorId(),
      message: error instanceof Error ? error.message : error,
      severity: context?.severity || 'medium',
      component: context?.component,
      timestamp: new Date(),
      stack: error instanceof Error ? error.stack : undefined,
      context: context?.additionalContext
    };

    this.errors.push(errorRecord);
    
    // Keep only last 1000 errors to prevent memory issues
    if (this.errors.length > 1000) {
      this.errors = this.errors.slice(-1000);
    }

    console.error('🚨 Error reported:', errorRecord);
    
    return errorRecord.id;
  }

  /**
   * Get error statistics
   */
  getErrorStats(): ErrorStats {
    const bySeverity = {
      critical: this.errors.filter(e => e.severity === 'critical').length,
      high: this.errors.filter(e => e.severity === 'high').length,
      medium: this.errors.filter(e => e.severity === 'medium').length,
      low: this.errors.filter(e => e.severity === 'low').length
    };

    const byComponent: Record<string, number> = {};
    this.errors.forEach(error => {
      if (error.component) {
        byComponent[error.component] = (byComponent[error.component] || 0) + 1;
      }
    });

    const recentErrors = this.errors
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      total: this.errors.length,
      bySeverity,
      byComponent,
      recentErrors
    };
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = [];
    console.log('🧹 All errors cleared');
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorRecord['severity']): ErrorRecord[] {
    return this.errors.filter(error => error.severity === severity);
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const errorManager = ErrorManager.getInstance();

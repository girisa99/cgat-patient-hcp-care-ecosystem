/**
 * ENROLLMENT DEBUGGING UTILITIES
 * Comprehensive debugging system for enrollment form issues
 */

export interface DebugLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  category: string;
  message: string;
  data?: any;
}

class EnrollmentDebugger {
  private logs: DebugLog[] = [];
  private maxLogs = 100;

  log(level: 'info' | 'warn' | 'error', category: string, message: string, data?: any) {
    const log: DebugLog = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data
    };

    this.logs.unshift(log);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Also log to console for immediate visibility
    const consoleFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    consoleFn(`[${category}] ${message}`, data || '');
  }

  info(category: string, message: string, data?: any) {
    this.log('info', category, message, data);
  }

  warn(category: string, message: string, data?: any) {
    this.log('warn', category, message, data);
  }

  error(category: string, message: string, data?: any) {
    this.log('error', category, message, data);
  }

  getLogs(filter?: { level?: string; category?: string; limit?: number }) {
    let filteredLogs = this.logs;

    if (filter?.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filter.level);
    }

    if (filter?.category) {
      filteredLogs = filteredLogs.filter(log => log.category === filter.category);
    }

    if (filter?.limit) {
      filteredLogs = filteredLogs.slice(0, filter.limit);
    }

    return filteredLogs;
  }

  clearLogs() {
    this.logs = [];
  }

  // Debug specific enrollment operations
  debugFieldMapping(formData: Record<string, any>, mappings: any[]) {
    this.info('FIELD_MAPPING', 'Starting field mapping process', {
      inputFields: Object.keys(formData),
      inputData: formData,
      availableMappings: mappings.length
    });

    const unmappedFields: string[] = [];
    const mappedFields: string[] = [];

    Object.keys(formData).forEach(fieldKey => {
      const mapping = mappings.find(m => m.fieldKey === fieldKey);
      if (mapping) {
        mappedFields.push(fieldKey);
        this.info('FIELD_MAPPING', `Mapped field: ${fieldKey} -> ${mapping.destinationTable}.${mapping.destinationColumn}`, {
          field: fieldKey,
          value: formData[fieldKey],
          destination: `${mapping.destinationTable}.${mapping.destinationColumn}`,
          fieldType: mapping.fieldType
        });
      } else {
        unmappedFields.push(fieldKey);
        this.warn('FIELD_MAPPING', `No mapping found for field: ${fieldKey}`, {
          field: fieldKey,
          value: formData[fieldKey]
        });
      }
    });

    this.info('FIELD_MAPPING', 'Field mapping summary', {
      totalFields: Object.keys(formData).length,
      mappedFields: mappedFields.length,
      unmappedFields: unmappedFields.length,
      unmapped: unmappedFields
    });

    return { mappedFields, unmappedFields };
  }

  debugDatabaseOperation(operation: string, tableName: string, data: any, result?: any, error?: any) {
    if (error) {
      this.error('DATABASE', `${operation} failed on ${tableName}`, {
        operation,
        tableName,
        data,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        }
      });
    } else {
      this.info('DATABASE', `${operation} successful on ${tableName}`, {
        operation,
        tableName,
        data,
        result
      });
    }
  }

  debugConditionalFields(section: string, formData: any, expandedFields: any) {
    this.info('CONDITIONAL_FIELDS', `Expanding fields for section: ${section}`, {
      section,
      currentData: formData,
      expandedFields,
      additionalFieldsCount: expandedFields.fields?.length || 0,
      requiredFieldsCount: expandedFields.requiredFields?.length || 0
    });
  }

  // Get debug summary for troubleshooting
  getDebugSummary() {
    const recentErrors = this.getLogs({ level: 'error', limit: 5 });
    const recentWarnings = this.getLogs({ level: 'warn', limit: 5 });
    const fieldMappingLogs = this.getLogs({ category: 'FIELD_MAPPING', limit: 10 });
    const databaseLogs = this.getLogs({ category: 'DATABASE', limit: 10 });

    return {
      summary: {
        totalLogs: this.logs.length,
        errorCount: this.logs.filter(l => l.level === 'error').length,
        warningCount: this.logs.filter(l => l.level === 'warn').length,
      },
      recentErrors,
      recentWarnings,
      fieldMappingLogs,
      databaseLogs,
      lastError: recentErrors[0] || null
    };
  }
}

// Export singleton instance
export const enrollmentDebugger = new EnrollmentDebugger();

// Helper function to debug enrollment issues
export const debugEnrollmentIssue = (context: string, data: any) => {
  enrollmentDebugger.info('DEBUG_HELPER', `Manual debug: ${context}`, data);
  
  // Log to console for immediate visibility
  console.group(`🔍 ENROLLMENT DEBUG: ${context}`);
  console.log('Data:', data);
  console.log('Debug Summary:', enrollmentDebugger.getDebugSummary());
  console.groupEnd();
};

// React hook for accessing debugger in components
export const useEnrollmentDebugger = () => {
  return {
    debugger: enrollmentDebugger,
    debug: debugEnrollmentIssue,
    getLogs: () => enrollmentDebugger.getLogs(),
    getErrors: () => enrollmentDebugger.getLogs({ level: 'error' }),
    getSummary: () => enrollmentDebugger.getDebugSummary()
  };
};

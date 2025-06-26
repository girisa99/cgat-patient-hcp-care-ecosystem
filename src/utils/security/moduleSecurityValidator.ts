
/**
 * Module Security Validation Utilities
 * Ensures secure module creation and validation
 */

import { AutoModuleConfig } from '@/utils/schema/types';
import { validateTableExists } from '@/utils/moduleValidation';

export interface SecurityValidationResult {
  isSecure: boolean;
  securityIssues: string[];
  recommendations: string[];
}

/**
 * Validates module security before creation
 */
export const validateModuleSecurity = (config: AutoModuleConfig): SecurityValidationResult => {
  const securityIssues: string[] = [];
  const recommendations: string[] = [];

  // Check table name for SQL injection patterns
  if (containsSQLInjectionPatterns(config.tableName)) {
    securityIssues.push(`Table name '${config.tableName}' contains potential SQL injection patterns`);
  }

  // Validate table exists in schema
  if (!validateTableExists(config.tableName)) {
    securityIssues.push(`Table '${config.tableName}' does not exist in database schema`);
  }

  // Check for sensitive field names
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'hash'];
  const hasSensitiveFields = config.requiredFields.some(field => 
    sensitiveFields.some(sensitive => field.toLowerCase().includes(sensitive))
  );

  if (hasSensitiveFields) {
    recommendations.push('Consider moving sensitive fields to optional or implementing additional encryption');
  }

  // Validate confidence threshold
  if (config.confidence < 0.6) {
    recommendations.push('Low confidence module - manual review recommended before production use');
  }

  // Check module name format
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(config.moduleName)) {
    securityIssues.push(`Module name '${config.moduleName}' must be PascalCase to prevent code injection`);
  }

  return {
    isSecure: securityIssues.length === 0,
    securityIssues,
    recommendations
  };
};

/**
 * Checks for common SQL injection patterns
 */
const containsSQLInjectionPatterns = (input: string): boolean => {
  const dangerousPatterns = [
    /[';]/, // Semicolon or single quote
    /--/, // SQL comment
    /\/\*/, // Multi-line comment start
    /\*\//, // Multi-line comment end
    /union\s+select/i, // Union select
    /drop\s+table/i, // Drop table
    /delete\s+from/i, // Delete from
    /insert\s+into/i, // Insert into
    /update\s+set/i // Update set
  ];

  return dangerousPatterns.some(pattern => pattern.test(input));
};

/**
 * Sanitizes module configuration for safe processing
 */
export const sanitizeModuleConfig = (config: AutoModuleConfig): AutoModuleConfig => {
  return {
    ...config,
    tableName: config.tableName.replace(/[^a-zA-Z0-9_]/g, ''),
    moduleName: config.moduleName.replace(/[^a-zA-Z0-9]/g, ''),
    requiredFields: config.requiredFields.map(field => field.replace(/[^a-zA-Z0-9_]/g, '')),
    optionalFields: config.optionalFields?.map(field => field.replace(/[^a-zA-Z0-9_]/g, ''))
  };
};

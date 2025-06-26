
/**
 * Module Security Validation
 */

export interface SecurityValidationResult {
  isSecure: boolean;
  securityIssues: string[];
}

export const validateModuleSecurity = (module: any): SecurityValidationResult => {
  const issues: string[] = [];
  
  // Basic validation checks
  if (!module.moduleName || module.moduleName.length < 2) {
    issues.push('Module name too short');
  }
  
  if (!module.tableName || module.tableName.length < 2) {
    issues.push('Table name too short');
  }
  
  // Check for SQL injection patterns
  const dangerousPatterns = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'SELECT', '--', ';'];
  const moduleText = JSON.stringify(module).toUpperCase();
  
  for (const pattern of dangerousPatterns) {
    if (moduleText.includes(pattern)) {
      issues.push(`Potentially dangerous pattern detected: ${pattern}`);
    }
  }

  return {
    isSecure: issues.length === 0,
    securityIssues: issues
  };
};

export const sanitizeModuleConfig = (module: any) => {
  // Create a sanitized copy
  return {
    ...module,
    moduleName: module.moduleName?.replace(/[^a-zA-Z0-9]/g, '') || 'Unknown',
    tableName: module.tableName?.replace(/[^a-zA-Z0-9_]/g, '') || 'unknown',
    description: module.description?.substring(0, 200) || '',
  };
};

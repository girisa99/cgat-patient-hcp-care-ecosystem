
/**
 * Module Security Validation
 * Real implementation for validating module security
 */

interface SecurityIssue {
  type: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  location: string;
  remediation: string;
}

interface ModuleSecurityResult {
  isSecure: boolean;
  securityIssues: SecurityIssue[];
  securityScore: number;
}

export const validateModuleSecurity = (module: any): ModuleSecurityResult => {
  const securityIssues: SecurityIssue[] = [];
  
  // Validate module configuration
  if (!module) {
    securityIssues.push({
      type: 'critical',
      message: 'Module configuration is null or undefined',
      location: 'module',
      remediation: 'Provide valid module configuration'
    });
  }
  
  // Check for required security fields
  if (module && typeof module === 'object') {
    // Validate module name
    if (!module.name || typeof module.name !== 'string') {
      securityIssues.push({
        type: 'medium',
        message: 'Module name is missing or invalid',
        location: 'module.name',
        remediation: 'Provide a valid string name for the module'
      });
    }
    
    // Check for dangerous configurations
    if (module.allowUnsafeOperations === true) {
      securityIssues.push({
        type: 'high',
        message: 'Module allows unsafe operations',
        location: 'module.allowUnsafeOperations',
        remediation: 'Disable unsafe operations or implement proper validation'
      });
    }
    
    // Validate permissions if present
    if (module.permissions && Array.isArray(module.permissions)) {
      if (module.permissions.includes('*') || module.permissions.includes('all')) {
        securityIssues.push({
          type: 'high',
          message: 'Module has wildcard permissions',
          location: 'module.permissions',
          remediation: 'Use specific permissions instead of wildcards'
        });
      }
    }
    
    // Check for insecure configurations
    if (module.debugMode === true && process.env.NODE_ENV === 'production') {
      securityIssues.push({
        type: 'medium',
        message: 'Debug mode enabled in production',
        location: 'module.debugMode',
        remediation: 'Disable debug mode in production environments'
      });
    }
  }
  
  // Calculate security score
  const criticalCount = securityIssues.filter(i => i.type === 'critical').length;
  const highCount = securityIssues.filter(i => i.type === 'high').length;
  const mediumCount = securityIssues.filter(i => i.type === 'medium').length;
  const lowCount = securityIssues.filter(i => i.type === 'low').length;
  
  let securityScore = 100;
  securityScore -= criticalCount * 25;
  securityScore -= highCount * 15;
  securityScore -= mediumCount * 8;
  securityScore -= lowCount * 3;
  
  const isSecure = criticalCount === 0 && highCount === 0;
  
  return {
    isSecure,
    securityIssues,
    securityScore: Math.max(0, securityScore)
  };
};

export const sanitizeModuleConfig = (module: any) => {
  if (!module || typeof module !== 'object') {
    return {};
  }
  
  const sanitized = { ...module };
  
  // Remove potentially dangerous properties
  delete sanitized.allowUnsafeOperations;
  delete sanitized.__proto__;
  delete sanitized.constructor;
  
  // Sanitize permissions
  if (sanitized.permissions && Array.isArray(sanitized.permissions)) {
    sanitized.permissions = sanitized.permissions.filter(
      (permission: any) => typeof permission === 'string' && 
                          permission !== '*' && 
                          permission !== 'all' &&
                          permission.length > 0
    );
  }
  
  // Ensure debug mode is disabled in production
  if (process.env.NODE_ENV === 'production') {
    sanitized.debugMode = false;
  }
  
  // Sanitize string fields
  if (sanitized.name && typeof sanitized.name === 'string') {
    sanitized.name = sanitized.name.trim().substring(0, 255);
  }
  
  if (sanitized.description && typeof sanitized.description === 'string') {
    sanitized.description = sanitized.description.trim().substring(0, 1000);
  }
  
  return sanitized;
};

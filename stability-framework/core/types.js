/**
 * Type definitions and constants for the Stability Framework
 * Provides TypeScript-like type definitions and validation for JavaScript
 */

/**
 * Framework configuration types
 */
export const FrameworkConfigSchema = {
  autoStart: 'boolean',
  development: 'boolean',
  enableLogging: 'boolean',
  monitoringInterval: 'number',
  autoFix: 'boolean'
};

/**
 * Stability metrics types
 */
export const StabilityMetricsSchema = {
  duplicateCount: 'number',
  fixesApplied: 'number',
  lastCheck: 'date',
  healthScore: 'number'
};

/**
 * Duplicate analysis types
 */
export const DuplicateSchema = {
  type: 'string', // 'exact_file', 'component', 'hook', 'utility'
  severity: 'string', // 'low', 'medium', 'high', 'critical'
  files: 'array',
  patterns: 'array',
  hash: 'string',
  canAutoFix: 'boolean',
  description: 'string'
};

/**
 * Component types
 */
export const ComponentSchema = {
  name: 'string',
  type: 'string', // 'functional', 'class', 'hook', 'utility'
  file: 'string',
  dependencies: 'array',
  exports: 'array',
  complexity: 'number'
};

/**
 * Route types
 */
export const RouteSchema = {
  path: 'string',
  component: 'string',
  exact: 'boolean',
  guards: 'array',
  metadata: 'object'
};

/**
 * Role types
 */
export const RoleSchema = {
  id: 'string',
  name: 'string',
  permissions: 'array',
  hierarchy: 'number',
  active: 'boolean'
};

/**
 * Feature flag types
 */
export const FeatureFlagSchema = {
  name: 'string',
  enabled: 'boolean',
  rolloutPercentage: 'number',
  conditions: 'object',
  metadata: 'object'
};

/**
 * Severity levels
 */
export const SeverityLevels = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Component types
 */
export const ComponentTypes = {
  FUNCTIONAL: 'functional',
  CLASS: 'class',
  HOOK: 'hook',
  UTILITY: 'utility',
  CONSTANT: 'constant'
};

/**
 * Duplicate types
 */
export const DuplicateTypes = {
  EXACT_FILE: 'exact_file',
  COMPONENT: 'component',
  HOOK: 'hook',
  UTILITY: 'utility',
  PATTERN: 'pattern'
};

/**
 * Framework event types
 */
export const EventTypes = {
  FRAMEWORK_INITIALIZED: 'framework:initialized',
  FRAMEWORK_STARTED: 'framework:started',
  FRAMEWORK_STOPPED: 'framework:stopped',
  STABILITY_ISSUE_DETECTED: 'stability:issue-detected',
  STABILITY_ISSUE_FIXED: 'stability:issue-fixed',
  COMPONENT_DUPLICATE_DETECTED: 'component:duplicate-detected',
  ROUTE_CONFLICT_DETECTED: 'route:conflict-detected',
  HOOK_ISSUE_DETECTED: 'hook:issue-detected'
};

/**
 * Health status types
 */
export const HealthStatus = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNHEALTHY: 'unhealthy'
};

/**
 * Validation utilities
 */
export class TypeValidator {
  /**
   * Validate object against schema
   */
  static validate(obj, schema) {
    const errors = [];
    
    for (const [key, expectedType] of Object.entries(schema)) {
      if (!(key in obj)) {
        errors.push(`Missing required field: ${key}`);
        continue;
      }
      
      const value = obj[key];
      const actualType = this.getType(value);
      
      if (actualType !== expectedType) {
        errors.push(`Field ${key}: expected ${expectedType}, got ${actualType}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get JavaScript type of value
   */
  static getType(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (Array.isArray(value)) return 'array';
    if (value instanceof Date) return 'date';
    if (value instanceof RegExp) return 'regexp';
    
    return typeof value;
  }

  /**
   * Check if value is of expected type
   */
  static isType(value, expectedType) {
    return this.getType(value) === expectedType;
  }

  /**
   * Assert type or throw error
   */
  static assertType(value, expectedType, fieldName = 'value') {
    const actualType = this.getType(value);
    if (actualType !== expectedType) {
      throw new TypeError(`${fieldName}: expected ${expectedType}, got ${actualType}`);
    }
  }
}

/**
 * Configuration defaults
 */
export const DefaultConfig = {
  framework: {
    autoStart: true,
    development: process.env.NODE_ENV === 'development',
    enableLogging: true,
    monitoringInterval: 30000,
    autoFix: false
  },
  duplicateAnalyzer: {
    srcPath: './src',
    ignorePaths: ['node_modules', '.git', 'dist', 'build'],
    fileExtensions: ['.js', '.jsx', '.ts', '.tsx'],
    minSimilarity: 0.8,
    minLines: 10
  },
  componentManager: {
    catalogPath: './src/components',
    autoRegister: true,
    validateProps: true,
    trackUsage: true
  },
  router: {
    basePath: '/',
    enableGuards: true,
    trackNavigation: true,
    conflictDetection: true
  },
  hookManager: {
    trackDependencies: true,
    detectInfiniteLoops: true,
    validateRules: true
  }
};

/**
 * Error types
 */
export class FrameworkError extends Error {
  constructor(message, code, component) {
    super(message);
    this.name = 'FrameworkError';
    this.code = code;
    this.component = component;
    this.timestamp = new Date();
  }
}

export class ValidationError extends FrameworkError {
  constructor(message, field, expectedType, actualType) {
    super(message, 'VALIDATION_ERROR', 'TypeValidator');
    this.field = field;
    this.expectedType = expectedType;
    this.actualType = actualType;
  }
}

export class DuplicateError extends FrameworkError {
  constructor(message, duplicateType, files) {
    super(message, 'DUPLICATE_ERROR', 'DuplicateAnalyzer');
    this.duplicateType = duplicateType;
    this.files = files;
  }
}

/**
 * Utility functions for type checking
 */
export const TypeUtils = {
  /**
   * Create a type-safe configuration object
   */
  createConfig(config, schema, defaults = {}) {
    const result = { ...defaults, ...config };
    const validation = TypeValidator.validate(result, schema);
    
    if (!validation.valid) {
      throw new ValidationError(
        `Configuration validation failed: ${validation.errors.join(', ')}`
      );
    }
    
    return result;
  },

  /**
   * Safely access nested object properties
   */
  safeGet(obj, path, defaultValue = undefined) {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return defaultValue;
      }
      current = current[key];
    }
    
    return current;
  },

  /**
   * Deep clone object (simple implementation)
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const cloned = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned;
    }
    return obj;
  }
};

export default {
  FrameworkConfigSchema,
  StabilityMetricsSchema,
  DuplicateSchema,
  ComponentSchema,
  RouteSchema,
  RoleSchema,
  FeatureFlagSchema,
  SeverityLevels,
  ComponentTypes,
  DuplicateTypes,
  EventTypes,
  HealthStatus,
  TypeValidator,
  DefaultConfig,
  FrameworkError,
  ValidationError,
  DuplicateError,
  TypeUtils
};
/**
 * Framework Configuration - Main configuration for the Stability Framework
 * Centralized configuration management for all framework components
 */

import { DefaultConfig } from '../core/types.js';

export const FrameworkConfig = {
  /**
   * Core framework settings
   */
  framework: {
    ...DefaultConfig.framework,
    name: 'Stability Framework',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    
    // Framework behavior
    autoStart: true,
    autoRestart: false,
    gracefulShutdown: true,
    
    // Monitoring settings
    enableMonitoring: true,
    monitoringInterval: 30000, // 30 seconds
    healthCheckInterval: 60000, // 1 minute
    
    // Logging configuration
    logging: {
      enabled: true,
      level: 'info', // 'debug', 'info', 'warn', 'error'
      format: 'pretty', // 'pretty', 'json'
      includeTimestamp: true,
      includeLevel: true,
      colors: true
    },
    
    // Performance settings
    performance: {
      enableMetrics: true,
      metricsRetention: 24 * 60 * 60 * 1000, // 24 hours
      alertThresholds: {
        memoryUsage: 500 * 1024 * 1024, // 500MB
        cpuUsage: 80, // 80%
        responseTime: 5000 // 5 seconds
      }
    }
  },

  /**
   * Stability Manager configuration
   */
  stabilityManager: {
    monitoringInterval: 30000,
    autoFix: process.env.NODE_ENV === 'development',
    logLevel: 'info',
    
    // Issue detection thresholds
    thresholds: {
      duplicateCount: 5,
      healthScore: 70,
      criticalIssues: 3
    },
    
    // Recovery settings
    recovery: {
      enableAutoRecovery: true,
      maxRetries: 3,
      retryDelay: 5000,
      backoffMultiplier: 2
    }
  },

  /**
   * Duplicate Analyzer configuration
   */
  duplicateAnalyzer: {
    ...DefaultConfig.duplicateAnalyzer,
    
    // Advanced detection settings
    advanced: {
      enableSemanticAnalysis: true,
      enableASTComparison: false,
      enableContentHashing: true,
      hashAlgorithm: 'md5'
    },
    
    // Pattern matching
    patterns: {
      componentPattern: /^[A-Z][a-zA-Z0-9]*$/,
      hookPattern: /^use[A-Z][a-zA-Z0-9]*$/,
      utilityPattern: /^[a-z][a-zA-Z0-9]*$/
    },
    
    // Exclusions
    exclusions: {
      patterns: [
        'test.*',
        '*.test.*',
        '*.spec.*',
        '__tests__',
        'stories',
        'storybook'
      ],
      directories: [
        'node_modules',
        '.git',
        'dist',
        'build',
        'coverage'
      ]
    }
  },

  /**
   * Component Manager configuration
   */
  componentManager: {
    ...DefaultConfig.componentManager,
    
    // Component validation
    validation: {
      enablePropValidation: true,
      enableAccessibilityCheck: true,
      enablePerformanceCheck: true,
      maxComponentSize: 200, // lines
      maxProps: 20
    },
    
    // Component organization
    organization: {
      enforceNamingConvention: true,
      enableCategorization: true,
      autoGenerateIndex: true,
      createBarrelExports: false
    },
    
    // Monitoring settings
    monitoring: {
      trackRenderCount: true,
      trackPropChanges: true,
      trackErrorBoundaries: true,
      alertOnErrors: true
    }
  },

  /**
   * Router configuration
   */
  router: {
    ...DefaultConfig.router,
    
    // Route validation
    validation: {
      enforceExactPaths: false,
      validateGuards: true,
      checkPermissions: true,
      enableMetaValidation: true
    },
    
    // Navigation tracking
    tracking: {
      enableAnalytics: true,
      trackUserJourney: true,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      retainHistory: 1000 // entries
    },
    
    // Security settings
    security: {
      enableCSRFProtection: true,
      enforceHTTPS: process.env.NODE_ENV === 'production',
      validateOrigin: true,
      sanitizeParams: true
    }
  },

  /**
   * Hook Manager configuration
   */
  hookManager: {
    ...DefaultConfig.hookManager,
    
    // Hook validation
    validation: {
      enforceRulesOfHooks: true,
      validateDependencies: true,
      checkInfiniteLoops: true,
      maxExecutionsPerSecond: 100
    },
    
    // Performance monitoring
    performance: {
      trackExecutionTime: true,
      trackMemoryUsage: false,
      alertOnSlowHooks: true,
      slowHookThreshold: 100 // milliseconds
    },
    
    // Development helpers
    development: {
      enableWarnings: true,
      suggestOptimizations: true,
      logViolations: true,
      enableDevTools: process.env.NODE_ENV === 'development'
    }
  },

  /**
   * Role Manager configuration
   */
  roleManager: {
    hierarchical: true,
    cacheTimeout: 300000, // 5 minutes
    
    // Permission system
    permissions: {
      enableGranularPermissions: true,
      enableResourcePermissions: true,
      enableTimeBasedPermissions: false,
      enableLocationBasedPermissions: false
    },
    
    // Security settings
    security: {
      enableAuditLog: true,
      auditRetention: 90 * 24 * 60 * 60 * 1000, // 90 days
      enablePasswordPolicy: true,
      sessionTimeout: 24 * 60 * 60 * 1000 // 24 hours
    },
    
    // Default roles for healthcare system
    defaultRoles: [
      'superAdmin',
      'admin',
      'onboardingTeam',
      'facilityManager',
      'clinician',
      'nurse',
      'pharmacist',
      'patientCaregiver',
      'support',
      'readonly'
    ]
  },

  /**
   * Feature Flags configuration
   */
  featureFlags: {
    defaultEnabled: false,
    evaluationCacheTime: 60000, // 1 minute
    persistToStorage: true,
    storageKey: 'stability_framework_features',
    
    // Rollout settings
    rollout: {
      enableGradualRollout: true,
      enableA_B_Testing: true,
      enableTargeting: true,
      enableAnalytics: true
    },
    
    // Evaluation settings
    evaluation: {
      enableServerSideEvaluation: false,
      enableClientSideEvaluation: true,
      fallbackOnError: true,
      logEvaluations: false
    }
  },

  /**
   * MCP Server configuration
   */
  mcpServer: {
    name: 'stability-framework',
    version: '1.0.0',
    description: 'Stability Framework MCP Server',
    
    // Server settings
    server: {
      host: 'localhost',
      port: 3001,
      enableHTTPS: false,
      enableCORS: true,
      maxConnections: 100
    },
    
    // Tool configuration
    tools: {
      enableAllTools: true,
      toolTimeout: 30000, // 30 seconds
      maxConcurrentTools: 10,
      enableToolValidation: true
    },
    
    // Context management
    context: {
      maxContextSize: 10 * 1024 * 1024, // 10MB
      contextTimeout: 60000, // 1 minute
      enableContextPersistence: false
    }
  },

  /**
   * Integration configurations
   */
  integrations: {
    // Lovable integration
    lovable: {
      enabled: true,
      apiEndpoint: 'https://api.lovable.dev',
      enableRealTimeSync: true,
      enableAIAssistance: true,
      autoFix: false,
      syncInterval: 30000
    },
    
    // Webpack integration
    webpack: {
      enabled: true,
      enableBuildAnalysis: true,
      enableBundleOptimization: true,
      detectDuplicates: true,
      generateReport: true,
      
      thresholds: {
        maxAssetSize: 1000000, // 1MB
        maxChunkSize: 500000,  // 500KB
        duplicateThreshold: 0.8
      }
    },
    
    // ESLint integration
    eslint: {
      enabled: true,
      enableCustomRules: true,
      enableStabilityChecks: true,
      enableDuplicateDetection: true,
      severity: 'warn',
      
      ruleOverrides: {
        'no-duplicate-components': 'error',
        'hooks-dependency-array': 'error',
        'no-conditional-hooks': 'error'
      }
    }
  },

  /**
   * Security configuration
   */
  security: {
    // General security settings
    enableSecurityHeaders: true,
    enableContentSecurityPolicy: true,
    enableXSSProtection: true,
    enableClickjackingProtection: true,
    
    // API security
    api: {
      enableRateLimiting: true,
      rateLimitRequests: 100,
      rateLimitWindow: 60000, // 1 minute
      enableAPIKeyValidation: true,
      enableJWTValidation: false
    },
    
    // Data protection
    data: {
      enableDataEncryption: true,
      encryptionAlgorithm: 'AES-256-GCM',
      enableDataMasking: true,
      enableAuditTrail: true
    }
  },

  /**
   * Healthcare-specific configuration
   */
  healthcare: {
    // HIPAA compliance
    hipaa: {
      enableCompliance: true,
      enableAuditLog: true,
      enableAccessControl: true,
      enableDataEncryption: true,
      enableSecureMessaging: true
    },
    
    // Clinical settings
    clinical: {
      enableClinicalWorkflows: true,
      enableMedicationAlerts: true,
      enableDrugInteractionChecks: true,
      enableAllergyAlerts: true
    },
    
    // Regulatory compliance
    regulatory: {
      enable21CFRPart11: true,
      enableGxPCompliance: true,
      enableSOXCompliance: false,
      enableGDPRCompliance: true
    }
  },

  /**
   * Development configuration
   */
  development: {
    // Development tools
    enableHotReload: process.env.NODE_ENV === 'development',
    enableSourceMaps: true,
    enableDebugMode: process.env.NODE_ENV === 'development',
    enablePerformanceDebugging: false,
    
    // Testing configuration
    testing: {
      enableTestMode: process.env.NODE_ENV === 'test',
      enableCoverage: true,
      coverageThreshold: 80,
      enableE2ETests: false
    },
    
    // Debugging tools
    debugging: {
      enableVerboseLogging: false,
      enableMemoryProfiling: false,
      enablePerformanceProfiling: false,
      enableNetworkDebugging: false
    }
  },

  /**
   * Production configuration
   */
  production: {
    // Optimization settings
    enableMinification: true,
    enableCompression: true,
    enableCaching: true,
    enableCDN: false,
    
    // Monitoring
    enableAPM: false,
    enableErrorTracking: true,
    enablePerformanceMonitoring: true,
    enableUpTimeMonitoring: true,
    
    // Scaling
    enableLoadBalancing: false,
    enableAutoScaling: false,
    maxInstances: 5,
    minInstances: 1
  }
};

/**
 * Environment-specific configuration overrides
 */
export const EnvironmentConfigs = {
  development: {
    framework: {
      autoFix: true,
      logging: {
        level: 'debug'
      }
    },
    stabilityManager: {
      autoFix: true
    }
  },
  
  staging: {
    framework: {
      autoFix: false,
      logging: {
        level: 'info'
      }
    },
    security: {
      api: {
        enableRateLimiting: true
      }
    }
  },
  
  production: {
    framework: {
      autoFix: false,
      logging: {
        level: 'warn'
      }
    },
    security: {
      enableSecurityHeaders: true,
      api: {
        enableRateLimiting: true,
        rateLimitRequests: 50
      }
    },
    production: {
      enableMinification: true,
      enableCompression: true
    }
  }
};

/**
 * Get configuration for specific environment
 */
export function getEnvironmentConfig(environment = process.env.NODE_ENV) {
  const baseConfig = { ...FrameworkConfig };
  const envOverrides = EnvironmentConfigs[environment] || {};
  
  return mergeConfigurations(baseConfig, envOverrides);
}

/**
 * Merge configuration objects deeply
 */
function mergeConfigurations(base, overrides) {
  const result = { ...base };
  
  for (const [key, value] of Object.entries(overrides)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = mergeConfigurations(result[key] || {}, value);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Validate configuration
 */
export function validateConfiguration(config) {
  const errors = [];
  
  // Required fields
  const required = [
    'framework.name',
    'framework.version',
    'stabilityManager.monitoringInterval'
  ];
  
  for (const field of required) {
    const value = getNestedValue(config, field);
    if (value === undefined || value === null) {
      errors.push(`Missing required configuration field: ${field}`);
    }
  }
  
  // Validation rules
  if (config.stabilityManager?.monitoringInterval < 1000) {
    errors.push('stabilityManager.monitoringInterval must be at least 1000ms');
  }
  
  if (config.componentManager?.validation?.maxComponentSize < 50) {
    errors.push('componentManager.validation.maxComponentSize must be at least 50');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => 
    current && current[key] !== undefined ? current[key] : undefined, obj
  );
}

export default FrameworkConfig;
/**
 * Comprehensive Framework Configuration
 * Central configuration for duplicate prevention, stability monitoring, and governance
 */

export const frameworkConfig = {
  // Core Framework Settings
  framework: {
    name: 'Healthcare Intelligence Platform',
    version: '1.0.0',
    environment: 'development',
    strictMode: true,
    autoProtection: true
  },

  // Duplicate Prevention Configuration
  duplicatePrevention: {
    enabled: true,
    strictMode: true,
    autoFix: false,
    
    // Analysis settings
    analysis: {
      enableRealTimeAnalysis: true,
      similarityThreshold: 0.8,
      functionalDuplicateThreshold: 0.9,
      scanInterval: 30000
    },

    // Component registration
    registry: {
      autoRegister: true,
      validateOnRegister: true,
      lockAfterInitialization: false
    },

    // Detection patterns
    patterns: {
      components: {
        namePattern: /^[A-Z][a-zA-Z0-9]*$/,
        functionalityCheck: true,
        propsComparison: true
      },
      services: {
        namePattern: /^[a-z][a-zA-Z0-9]*Service$/,
        methodsComparison: true,
        interfaceCheck: true
      },
      hooks: {
        namePattern: /^use[A-Z][a-zA-Z0-9]*$/,
        returnTypeCheck: true,
        dependencyCheck: true
      }
    }
  },

  // Mock Data Prevention
  mockDataPrevention: {
    enabled: true,
    strictMode: true,
    
    // Detection patterns
    patterns: {
      mockDataIndicators: [
        /mock(?:ed)?[\s_-]?data/gi,
        /dummy[\s_-]?data/gi,
        /fake[\s_-]?data/gi,
        /test[\s_-]?data/gi,
        /placeholder[\s_-]?data/gi,
        /sample[\s_-]?data/gi
      ],
      mockObjects: [
        /const\s+\w*mock\w*/gi,
        /const\s+\w*dummy\w*/gi,
        /const\s+\w*fake\w*/gi,
        /const\s+\w*sample\w*/gi
      ],
      hardcodedData: [
        /\[\s*{\s*id:\s*['"]?\d+['"]?/gi,
        /\[\s*{\s*name:\s*['"](?:John|Jane|Test|Sample|Mock)/gi,
        /email:\s*['"](?:test@|mock@|dummy@|sample@)/gi
      ]
    },

    // Required database patterns
    requiredPatterns: [
      /supabase\.from\(/gi,
      /\.select\(/gi,
      /\.insert\(/gi,
      /\.update\(/gi,
      /\.delete\(/gi,
      /useQuery\(/gi,
      /useMutation\(/gi
    ],

    // Minimum database usage score
    minimumDatabaseScore: 90
  },

  // Stability Monitoring
  stabilityMonitoring: {
    enabled: true,
    
    // Monitoring intervals
    intervals: {
      componentHealth: 30000,
      performanceMetrics: 60000,
      errorTracking: 5000,
      memoryUsage: 30000
    },

    // Thresholds
    thresholds: {
      errorRate: 0.05,
      responseTime: 2000,
      memoryUsage: 0.8,
      componentCount: 100
    },

    // Alerts
    alerts: {
      enabled: true,
      emailNotifications: false,
      consoleWarnings: true,
      autoReporting: true
    }
  },

  // Prompt Governance
  promptGovernance: {
    enabled: true,
    
    // Interception settings
    interception: {
      analyzeAll: true,
      enhancePrompts: true,
      blockViolations: false,
      logAll: true
    },

    // Compliance checks
    compliance: {
      preventMockDataRequests: true,
      enforceRealDatabaseUsage: true,
      validateNamingConventions: true,
      checkForDuplicates: true
    },

    // Enhancement settings
    enhancement: {
      addFrameworkContext: true,
      includeStabilityRequirements: true,
      enforceNamingConventions: true,
      addComplianceChecks: true
    }
  },

  // Project Structure
  projectStructure: {
    enforceStructure: true,
    
    // Required directories
    requiredDirectories: [
      'duplicate-prevention/core/',
      'duplicate-prevention/mcp/',
      'duplicate-prevention/integrations/',
      'duplicate-prevention/config/',
      'src/',
      'stability-framework/'
    ],

    // Naming conventions
    namingConventions: {
      components: {
        pattern: /^[A-Z][a-zA-Z0-9]*$/,
        extension: '.tsx'
      },
      hooks: {
        pattern: /^use[A-Z][a-zA-Z0-9]*$/,
        extension: '.ts'
      },
      services: {
        pattern: /^[a-z][a-zA-Z0-9]*Service$/,
        extension: '.ts'
      },
      types: {
        pattern: /^[A-Z][a-zA-Z0-9]*$/,
        extension: '.ts'
      }
    }
  },

  // Code Quality
  codeQuality: {
    enabled: true,
    
    // File size limits
    fileSizeLimits: {
      components: 300,
      services: 200,
      hooks: 100,
      types: 50
    },

    // Complexity limits
    complexityLimits: {
      cyclomaticComplexity: 10,
      nestingDepth: 4,
      functionLength: 50
    },

    // Linting rules
    linting: {
      enforceNamingConventions: 'error',
      limitFileComplexity: 'warn',
      limitFileLength: 'warn',
      noDuplicateImports: 'error',
      enforceUpdateFirst: 'warn'
    }
  },

  // Database Requirements
  database: {
    enforceRealData: true,
    
    // Required patterns in code
    requiredUsagePatterns: [
      'supabase.from(',
      'useQuery(',
      'useMutation(',
      'auth.uid()'
    ],

    // Forbidden patterns
    forbiddenPatterns: [
      'const mockData',
      'const testData',
      'const sampleData',
      'const dummyData',
      'hardcodedArray',
      'staticData'
    ],

    // Database operation requirements
    operations: {
      requireAuth: true,
      useRLS: true,
      validateInputs: true,
      handleErrors: true
    }
  },

  // Integration Settings
  integrations: {
    webpack: {
      enabled: true,
      duplicateCheck: true,
      mockDataCheck: true
    },
    
    eslint: {
      enabled: true,
      rules: 'stability-framework/recommended'
    },
    
    lovable: {
      enabled: true,
      monitoring: true,
      enhancement: true
    },

    mcp: {
      enabled: true,
      serverPort: 3001,
      clientTimeout: 30000
    }
  },

  // Reporting
  reporting: {
    enabled: true,
    
    // Report types
    reports: {
      compliance: true,
      duplicates: true,
      stability: true,
      performance: true
    },

    // Report intervals
    intervals: {
      daily: true,
      weekly: true,
      onDemand: true
    },

    // Export formats
    formats: ['json', 'html', 'markdown']
  },

  // Development Mode Settings
  development: {
    debugMode: true,
    verboseLogging: true,
    autoFix: false,
    realTimeValidation: true,
    
    // Development helpers
    helpers: {
      componentSuggestions: true,
      duplicateWarnings: true,
      performanceHints: true,
      structureValidation: true
    }
  }
};

export default frameworkConfig;
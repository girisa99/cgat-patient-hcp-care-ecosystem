/**
 * MCP Configuration
 * Configuration for Model Context Protocol integration
 */

export const mcpConfig = {
  // Server configuration
  server: {
    name: 'duplicate-prevention-server',
    version: '1.0.0',
    host: 'localhost',
    port: 3001,
    transport: 'stdio'
  },

  // Security configuration
  security: {
    authentication: {
      enabled: true,
      method: 'token',
      tokens: {
        // In production, these should be environment variables
        admin: process.env.MCP_ADMIN_TOKEN || 'admin-token-change-me',
        readonly: process.env.MCP_READONLY_TOKEN || 'readonly-token-change-me'
      }
    },
    
    rateLimit: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    },
    
    cors: {
      enabled: true,
      origin: ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true
    }
  },

  // Tool configuration
  tools: {
    analyze_component: {
      enabled: true,
      timeout: 30000,
      maxRetries: 3
    },
    
    register_component: {
      enabled: true,
      timeout: 10000,
      maxRetries: 2,
      requireAuth: true
    },
    
    validate_component: {
      enabled: true,
      timeout: 15000,
      maxRetries: 2
    },
    
    search_catalog: {
      enabled: true,
      timeout: 5000,
      maxRetries: 1,
      maxResults: 100
    },
    
    get_statistics: {
      enabled: true,
      timeout: 5000,
      maxRetries: 1,
      cacheTimeout: 60000 // Cache for 1 minute
    },
    
    run_analysis: {
      enabled: true,
      timeout: 60000, // 1 minute for comprehensive analysis
      maxRetries: 1,
      requireAuth: true
    },
    
    validate_code: {
      enabled: true,
      timeout: 20000,
      maxRetries: 2,
      maxCodeSize: 1000000 // 1MB max code size
    },
    
    get_similar_components: {
      enabled: true,
      timeout: 10000,
      maxRetries: 2
    }
  },

  // Logging configuration
  logging: {
    level: 'info', // error, warn, info, debug
    format: 'json',
    timestamp: true,
    
    // Log rotation
    rotation: {
      enabled: true,
      maxFiles: 5,
      maxSize: '10MB',
      datePattern: 'YYYY-MM-DD'
    },
    
    // Log destinations
    destinations: {
      console: true,
      file: {
        enabled: true,
        path: './logs/mcp-server.log'
      },
      database: {
        enabled: false,
        table: 'mcp_logs'
      }
    }
  },

  // Performance configuration
  performance: {
    // Request timeouts
    timeouts: {
      default: 30000,
      analysis: 60000,
      validation: 15000
    },
    
    // Memory limits
    memory: {
      maxHeapSize: '512MB',
      gcThreshold: 0.8
    },
    
    // Caching
    cache: {
      enabled: true,
      ttl: 300000, // 5 minutes
      maxSize: 1000,
      
      // Cache strategies per tool
      strategies: {
        get_statistics: 'memory',
        search_catalog: 'memory',
        validate_code: 'none'
      }
    }
  },

  // Integration configuration
  integration: {
    // Framework integration
    framework: {
      autoRegister: true,
      syncInterval: 30000,
      conflictResolution: 'latest'
    },
    
    // Database integration
    database: {
      enabled: true,
      syncChanges: true,
      batchSize: 100
    },
    
    // Webhook integration
    webhooks: {
      enabled: false,
      endpoints: {
        componentRegistered: null,
        duplicateDetected: null,
        validationFailed: null
      }
    }
  },

  // Development configuration
  development: {
    debugMode: process.env.NODE_ENV === 'development',
    verboseLogging: true,
    hotReload: true,
    
    // Testing
    testing: {
      mockData: false,
      skipValidation: false,
      simulateDelays: false
    }
  },

  // Production configuration
  production: {
    clustering: {
      enabled: false,
      workers: 'auto' // or number
    },
    
    monitoring: {
      enabled: true,
      healthCheck: '/health',
      metrics: '/metrics'
    },
    
    security: {
      hideErrorDetails: true,
      requestLogging: true,
      auditTrail: true
    }
  },

  // Feature flags
  features: {
    realTimeAnalysis: true,
    autoFixing: false,
    predictiveAnalysis: false,
    mlEnhancedDuplicateDetection: false,
    advancedSimilarityScoring: true
  }
};
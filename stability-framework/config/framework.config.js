/**
 * Framework Configuration
 * Central configuration for the stability framework
 */

export const frameworkConfig = {
  // Component categories and their patterns
  componentCategories: {
    ui: {
      namingPattern: /^[A-Z][a-zA-Z]*$/,
      description: 'User interface components',
      examples: ['Button', 'Modal', 'Card', 'Input']
    },
    forms: {
      namingPattern: /^[A-Z][a-zA-Z]*Form$/,
      description: 'Form-related components',
      examples: ['LoginForm', 'ContactForm', 'RegistrationForm']
    },
    layouts: {
      namingPattern: /^[A-Z][a-zA-Z]*Layout$/,
      description: 'Layout components',
      examples: ['MainLayout', 'SidebarLayout', 'GridLayout']
    },
    pages: {
      namingPattern: /^[A-Z][a-zA-Z]*Page$/,
      description: 'Page components',
      examples: ['HomePage', 'LoginPage', 'DashboardPage']
    }
  },

  // Service patterns
  servicePatterns: {
    naming: /^[A-Z][a-zA-Z]*Service$/,
    description: 'Service classes for business logic',
    examples: ['UserService', 'AuthService', 'ApiService']
  },

  // Hook patterns
  hookPatterns: {
    naming: /^use[A-Z][a-zA-Z]*$/,
    description: 'Custom React hooks',
    examples: ['useAuth', 'useApi', 'useLocalStorage']
  },

  // Type patterns
  typePatterns: {
    interface: /^[A-Z][a-zA-Z]*$/,
    type: /^[A-Z][a-zA-Z]*Type$/,
    enum: /^[A-Z][a-zA-Z]*Enum$/
  },

  // Similarity thresholds
  similarity: {
    component: {
      exact: 0.95,
      functionality: 0.8,
      props: 0.7
    },
    service: {
      exact: 0.95,
      methods: 0.8,
      functionality: 0.7
    }
  },

  // Codebase scanning configuration
  codebase: {
    scanPaths: [
      'src/components/**/*.{ts,tsx,js,jsx}',
      'src/services/**/*.{ts,js}',
      'src/hooks/**/*.{ts,js}',
      'src/types/**/*.{ts,js}',
      'src/utils/**/*.{ts,js}'
    ],
    excludePaths: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '**/*.test.{ts,tsx,js,jsx}',
      '**/*.spec.{ts,tsx,js,jsx}',
      '**/*.stories.{ts,tsx,js,jsx}'
    ]
  },

  // Complexity thresholds
  complexity: {
    component: {
      low: 3,
      medium: 6,
      high: 10
    },
    service: {
      low: 5,
      medium: 10,
      high: 15
    }
  },

  // Quality gates
  qualityGates: {
    maxDuplicates: 0,
    maxNamingViolations: 0,
    minTestCoverage: 80,
    maxComplexity: 10
  },

  // Reporting configuration
  reporting: {
    outputPath: './reports',
    formats: ['json', 'html'],
    includeDetails: true,
    includeRecommendations: true
  },

  // Integration settings
  integrations: {
    webpack: {
      failOnDuplicate: false,
      failOnBreakingChange: true,
      generateReport: true
    },
    eslint: {
      enableRules: true,
      severity: 'warn'
    }
  }
};

export function getEnvironmentConfig() {
  const environment = process.env.NODE_ENV || 'development';
  
  const envConfig = {
    development: {
      framework: {
        ...frameworkConfig,
        qualityGates: {
          ...frameworkConfig.qualityGates,
          maxDuplicates: 5, // Allow some duplicates in dev
          maxNamingViolations: 10
        }
      }
    },
    test: {
      framework: {
        ...frameworkConfig,
        codebase: {
          ...frameworkConfig.codebase,
          scanPaths: [
            'src/**/*.{ts,tsx}',
            'test/**/*.{ts,tsx}'
          ]
        }
      }
    },
    production: {
      framework: {
        ...frameworkConfig,
        qualityGates: {
          ...frameworkConfig.qualityGates,
          maxDuplicates: 0, // Strict in production
          maxNamingViolations: 0
        }
      }
    }
  };

  return envConfig[environment] || envConfig.development;
}
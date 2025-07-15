/**
 * Stability Configuration - Specific settings for stability monitoring and analysis
 */

export const StabilityConfig = {
  // Detection thresholds
  thresholds: {
    duplicateCount: 5,
    healthScore: 70,
    criticalIssues: 3,
    similarityThreshold: 0.8,
    maxComponentSize: 200
  },

  // Auto-fix settings
  autoFix: {
    enabled: process.env.NODE_ENV === 'development',
    duplicateFiles: true,
    unusedImports: true,
    codeFormatting: false
  },

  // Monitoring intervals
  monitoring: {
    stabilityCheck: 30000,
    componentScan: 60000,
    routeValidation: 45000,
    hookAnalysis: 20000
  }
};

export default StabilityConfig;
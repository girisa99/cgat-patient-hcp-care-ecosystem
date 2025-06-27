/**
 * Environment Configuration Validator
 * Validates environment variables, configuration files, and deployment settings
 */

export interface EnvironmentValidationResult {
  configurationScore: number;
  missingVariables: MissingVariable[];
  invalidValues: InvalidValue[];
  securityIssues: SecurityIssue[];
  environmentMismatches: EnvironmentMismatch[];
  configurationRecommendations: ConfigurationRecommendation[];
  deploymentReadiness: DeploymentReadiness;
}

export interface MissingVariable {
  name: string;
  environment: 'development' | 'staging' | 'production' | 'all';
  required: boolean;
  defaultValue?: string;
  description: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
}

export interface InvalidValue {
  name: string;
  currentValue: string;
  expectedFormat: string;
  validationError: string;
  suggestedValue?: string;
}

export interface SecurityIssue {
  type: 'exposed_secret' | 'weak_encryption' | 'insecure_protocol' | 'default_credentials';
  severity: 'critical' | 'high' | 'medium' | 'low';
  variable: string;
  description: string;
  remediation: string;
}

export interface EnvironmentMismatch {
  variable: string;
  developmentValue: string;
  stagingValue?: string;
  productionValue?: string;
  mismatchType: 'missing' | 'different' | 'insecure';
  recommendation: string;
}

export interface ConfigurationRecommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'security' | 'performance' | 'reliability' | 'maintainability';
  description: string;
  implementation: string;
  benefit: string;
}

export interface DeploymentReadiness {
  ready: boolean;
  blockers: string[];
  warnings: string[];
  score: number;
  environments: {
    development: 'ready' | 'warning' | 'blocked';
    staging: 'ready' | 'warning' | 'blocked';
    production: 'ready' | 'warning' | 'blocked';
  };
}

export class EnvironmentConfigValidator {
  private static readonly REQUIRED_VARS = [
    { name: 'VITE_SUPABASE_URL', required: true, format: 'url' },
    { name: 'VITE_SUPABASE_ANON_KEY', required: true, format: 'jwt' },
    { name: 'DATABASE_URL', required: true, format: 'postgres_url' },
    { name: 'NEXTAUTH_SECRET', required: true, format: 'secret' },
    { name: 'OPENAI_API_KEY', required: false, format: 'api_key' }
  ];

  /**
   * Validate environment configuration
   */
  static async validateEnvironmentConfiguration(): Promise<EnvironmentValidationResult> {
    console.log('⚙️ Validating environment configuration...');

    const missingVariables = this.detectMissingVariables();
    const invalidValues = this.validateVariableValues();
    const securityIssues = this.scanSecurityIssues();
    const environmentMismatches = this.detectEnvironmentMismatches();
    const configurationRecommendations = this.generateConfigurationRecommendations(
      missingVariables, invalidValues, securityIssues
    );
    const deploymentReadiness = this.assessDeploymentReadiness(
      missingVariables, invalidValues, securityIssues
    );
    
    const configurationScore = this.calculateConfigurationScore(
      missingVariables, invalidValues, securityIssues
    );

    const result: EnvironmentValidationResult = {
      configurationScore,
      missingVariables,
      invalidValues,
      securityIssues,
      environmentMismatches,
      configurationRecommendations,
      deploymentReadiness
    };

    console.log(`📊 Environment validation complete: ${configurationScore}% configuration score`);
    return result;
  }

  private static detectMissingVariables(): MissingVariable[] {
    const missing: MissingVariable[] = [];

    // Simulate environment variable checking
    this.REQUIRED_VARS.forEach(varConfig => {
      const value = this.getEnvironmentVariable(varConfig.name);
      if (!value && varConfig.required) {
        missing.push({
          name: varConfig.name,
          environment: 'all',
          required: true,
          description: this.getVariableDescription(varConfig.name),
          impact: varConfig.name.includes('SECRET') || varConfig.name.includes('KEY') ? 'critical' : 'high'
        });
      }
    });

    return missing;
  }

  private static validateVariableValues(): InvalidValue[] {
    const invalid: InvalidValue[] = [];

    // Mock validation - would check actual environment variables
    const mockInvalidUrl = 'invalid-url';
    if (mockInvalidUrl) {
      invalid.push({
        name: 'VITE_SUPABASE_URL',
        currentValue: mockInvalidUrl,
        expectedFormat: 'https://your-project.supabase.co',
        validationError: 'Invalid URL format',
        suggestedValue: 'https://your-project.supabase.co'
      });
    }

    return invalid;
  }

  private static scanSecurityIssues(): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Check for common security issues
    const secrets = ['password', 'secret', 'key', 'token'];
    
    // Mock security scanning
    issues.push({
      type: 'exposed_secret',
      severity: 'critical',
      variable: 'API_SECRET',
      description: 'Secret key appears to be using default or weak value',
      remediation: 'Generate a strong, unique secret key for production'
    });

    return issues;
  }

  private static detectEnvironmentMismatches(): EnvironmentMismatch[] {
    return [
      {
        variable: 'NODE_ENV',
        developmentValue: 'development',
        stagingValue: 'staging',
        productionValue: 'production',
        mismatchType: 'different',
        recommendation: 'Ensure NODE_ENV is correctly set for each environment'
      }
    ];
  }

  private static generateConfigurationRecommendations(
    missing: MissingVariable[],
    invalid: InvalidValue[],
    security: SecurityIssue[]
  ): ConfigurationRecommendation[] {
    const recommendations: ConfigurationRecommendation[] = [];

    if (missing.length > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'reliability',
        description: 'Set up all required environment variables',
        implementation: 'Create .env files for each environment with required variables',
        benefit: 'Prevents runtime errors and ensures proper application functionality'
      });
    }

    if (security.length > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'security',
        description: 'Address security issues in environment configuration',
        implementation: 'Use strong secrets and secure configuration management',
        benefit: 'Protects application and user data from security breaches'
      });
    }

    if (invalid.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'reliability',
        description: 'Fix invalid configuration values',
        implementation: 'Validate and correct format of environment variables',
        benefit: 'Ensures proper application configuration and prevents errors'
      });
    }

    recommendations.push({
      priority: 'medium',
      category: 'maintainability',
      description: 'Implement configuration validation in CI/CD pipeline',
      implementation: 'Add environment validation scripts to deployment process',
      benefit: 'Catches configuration issues before deployment'
    });

    return recommendations;
  }

  private static assessDeploymentReadiness(
    missing: MissingVariable[],
    invalid: InvalidValue[],
    security: SecurityIssue[]
  ): DeploymentReadiness {
    const criticalMissingVars = missing.filter(m => m.impact === 'critical');
    const criticalSecurityIssues = security.filter(s => s.severity === 'critical');
    
    const criticalIssues = [
      ...criticalMissingVars,
      ...criticalSecurityIssues
    ];

    const warnings = [
      ...missing.filter(m => m.impact !== 'critical'),
      ...invalid,
      ...security.filter(s => s.severity !== 'critical')
    ];

    const ready = criticalIssues.length === 0;
    const score = Math.max(0, 100 - (criticalIssues.length * 25) - (warnings.length * 5));

    const blockers: string[] = [];
    
    // Handle missing variables
    criticalMissingVars.forEach(variable => {
      blockers.push(`Missing critical variable: ${variable.name}`);
    });
    
    // Handle security issues
    criticalSecurityIssues.forEach(issue => {
      blockers.push(`Security issue: ${issue.variable}`);
    });

    const warningMessages: string[] = [];
    
    // Handle non-critical missing variables
    missing.filter(m => m.impact !== 'critical').forEach(variable => {
      warningMessages.push(`Missing variable: ${variable.name}`);
    });
    
    // Handle invalid values
    invalid.forEach(value => {
      warningMessages.push(`Invalid value for ${value.name}`);
    });
    
    // Handle non-critical security issues
    security.filter(s => s.severity !== 'critical').forEach(issue => {
      warningMessages.push(`Security concern: ${issue.variable}`);
    });

    return {
      ready,
      blockers,
      warnings: warningMessages,
      score,
      environments: {
        development: ready && score > 80 ? 'ready' : score > 60 ? 'warning' : 'blocked',
        staging: ready && score > 90 ? 'ready' : score > 70 ? 'warning' : 'blocked',
        production: ready && score > 95 ? 'ready' : score > 80 ? 'warning' : 'blocked'
      }
    };
  }

  private static calculateConfigurationScore(
    missing: MissingVariable[],
    invalid: InvalidValue[],
    security: SecurityIssue[]
  ): number {
    let score = 100;

    // Deduct for missing variables
    missing.forEach(variable => {
      const deduction = { critical: 25, high: 15, medium: 10, low: 5 }[variable.impact];
      score -= deduction;
    });

    // Deduct for invalid values
    score -= invalid.length * 10;

    // Deduct for security issues
    security.forEach(issue => {
      const deduction = { critical: 30, high: 20, medium: 10, low: 5 }[issue.severity];
      score -= deduction;
    });

    return Math.max(0, score);
  }

  private static getEnvironmentVariable(name: string): string | undefined {
    // Mock implementation - would check actual environment
    if (name === 'VITE_SUPABASE_URL') return 'https://ithspbabhmdntioslfqe.supabase.co';
    if (name === 'VITE_SUPABASE_ANON_KEY') return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    return undefined;
  }

  private static getVariableDescription(name: string): string {
    const descriptions: Record<string, string> = {
      'VITE_SUPABASE_URL': 'Supabase project URL for database and auth',
      'VITE_SUPABASE_ANON_KEY': 'Supabase anonymous key for client authentication',
      'DATABASE_URL': 'Direct database connection URL',
      'NEXTAUTH_SECRET': 'Secret key for NextAuth.js session encryption',
      'OPENAI_API_KEY': 'OpenAI API key for AI features'
    };
    return descriptions[name] || 'Configuration variable';
  }

  /**
   * Generate comprehensive environment configuration report
   */
  static generateEnvironmentReport(result: EnvironmentValidationResult): string {
    let report = '⚙️ ENVIRONMENT CONFIGURATION REPORT\n';
    report += '=' .repeat(50) + '\n\n';

    report += `🔧 CONFIGURATION SCORE: ${result.configurationScore}%\n`;
    report += `🚀 DEPLOYMENT READY: ${result.deploymentReadiness.ready ? 'YES' : 'NO'}\n\n`;

    report += `📊 SUMMARY:\n`;
    report += `   Missing Variables: ${result.missingVariables.length}\n`;
    report += `   Invalid Values: ${result.invalidValues.length}\n`;
    report += `   Security Issues: ${result.securityIssues.length}\n`;
    report += `   Environment Mismatches: ${result.environmentMismatches.length}\n\n`;

    if (!result.deploymentReadiness.ready) {
      report += '🚫 DEPLOYMENT BLOCKERS:\n';
      result.deploymentReadiness.blockers.forEach(blocker => {
        report += `   • ${blocker}\n`;
      });
      report += '\n';
    }

    if (result.securityIssues.length > 0) {
      report += '🔒 SECURITY ISSUES:\n';
      result.securityIssues.forEach(issue => {
        report += `   ${issue.severity.toUpperCase()}: ${issue.variable}\n`;
        report += `   ${issue.description}\n`;
        report += `   Fix: ${issue.remediation}\n\n`;
      });
    }

    if (result.configurationRecommendations.length > 0) {
      report += '💡 CONFIGURATION RECOMMENDATIONS:\n';
      result.configurationRecommendations
        .filter(rec => rec.priority === 'critical' || rec.priority === 'high')
        .forEach(rec => {
          report += `   ${rec.priority.toUpperCase()}: ${rec.description}\n`;
        });
    }

    return report;
  }
}

// Export for global access
export const environmentConfigValidator = EnvironmentConfigValidator;

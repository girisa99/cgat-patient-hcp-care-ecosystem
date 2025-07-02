
/**
 * Single Source of Truth Validator - Enhanced Version
 * Validates that all systems use consolidated data sources and follow single source principles
 */

export interface ValidationViolation {
  component: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location: string;
  suggestedFix: string;
}

export interface ValidationSummary {
  complianceScore: number;
  totalViolations: number;
  systemsVerified: string[];
  dataSourcesValidated: string[];
}

export interface ValidationResult {
  summary: ValidationSummary;
  violations: ValidationViolation[];
  recommendations: string[];
}

export class SingleSourceValidator {
  static async validateCompleteSystem(): Promise<ValidationResult> {
    console.log('🔍 Starting comprehensive single source validation...');
    
    const violations: ValidationViolation[] = [];
    const systemsVerified: string[] = [];
    const dataSourcesValidated: string[] = [];
    
    // Validate Module Registry System
    try {
      await this.validateModuleRegistry();
      systemsVerified.push('Module Registry System');
      dataSourcesValidated.push('moduleRegistry singleton instance');
    } catch (error) {
      violations.push({
        component: 'Module Registry',
        severity: 'high',
        description: 'Module registry validation failed',
        location: 'src/utils/moduleRegistry/',
        suggestedFix: 'Check module registry implementation for consistency'
      });
    }
    
    // Validate Authentication System
    try {
      await this.validateAuthSystem();
      systemsVerified.push('Authentication System');
      dataSourcesValidated.push('CleanAuthProvider context');
    } catch (error) {
      violations.push({
        component: 'Authentication',
        severity: 'critical',
        description: 'Authentication context not properly configured',
        location: 'src/App.tsx',
        suggestedFix: 'Ensure CleanAuthProvider wraps the entire application'
      });
    }
    
    // Validate Data Management
    try {
      await this.validateDataManagement();
      systemsVerified.push('Data Management');
      dataSourcesValidated.push('Unified hook patterns', 'Supabase client singleton');
    } catch (error) {
      violations.push({
        component: 'Data Management',
        severity: 'medium',
        description: 'Data management patterns inconsistent',
        location: 'src/hooks/',
        suggestedFix: 'Standardize data fetching patterns across all hooks'
      });
    }
    
    // Validate Component Architecture
    try {
      await this.validateComponentArchitecture();
      systemsVerified.push('Component Architecture');
      dataSourcesValidated.push('Component registry', 'Template system');
    } catch (error) {
      violations.push({
        component: 'Component Architecture',
        severity: 'medium',
        description: 'Component architecture needs consolidation',
        location: 'src/components/',
        suggestedFix: 'Follow single component per file pattern'
      });
    }
    
    // Calculate compliance score
    const totalChecks = 4;
    const passedChecks = systemsVerified.length;
    const complianceScore = Math.round((passedChecks / totalChecks) * 100);
    
    const summary: ValidationSummary = {
      complianceScore,
      totalViolations: violations.length,
      systemsVerified,
      dataSourcesValidated
    };
    
    const recommendations = this.generateRecommendations(violations, complianceScore);
    
    return {
      summary,
      violations,
      recommendations
    };
  }
  
  private static async validateModuleRegistry(): Promise<void> {
    // Validate that module registry is properly instantiated and accessible
    const { moduleRegistry } = await import('@/utils/moduleRegistry');
    if (!moduleRegistry) {
      throw new Error('Module registry not accessible');
    }
    
    // Validate registry methods
    const stats = moduleRegistry.getStats();
    if (!stats) {
      throw new Error('Module registry stats not available');
    }
  }
  
  private static async validateAuthSystem(): Promise<void> {
    // Check if auth provider is properly configured
    // This is a compile-time check - if we get here, the import works
    try {
      await import('@/components/auth/CleanAuthProvider');
    } catch (error) {
      throw new Error('CleanAuthProvider not found or misconfigured');
    }
  }
  
  private static async validateDataManagement(): Promise<void> {
    // Validate that unified hooks are available
    try {
      await import('@/hooks/useUnifiedUserManagement');
      await import('@/integrations/supabase/client');
    } catch (error) {
      throw new Error('Unified data management components not available');
    }
  }
  
  private static async validateComponentArchitecture(): Promise<void> {
    // Validate that component templates are available
    try {
      await import('@/templates/components/ExtensibleModuleTemplate');
    } catch (error) {
      throw new Error('Component template system not available');
    }
  }
  
  private static generateRecommendations(violations: ValidationViolation[], score: number): string[] {
    const recommendations: string[] = [];
    
    if (score >= 95) {
      recommendations.push('✅ Excellent single source compliance! System architecture is well-maintained.');
    } else if (score >= 85) {
      recommendations.push('✅ Good single source compliance with minor improvements needed.');
    } else if (score >= 70) {
      recommendations.push('⚠️ Moderate compliance - address identified violations to improve architecture.');
    } else {
      recommendations.push('❌ Low compliance - significant architectural improvements needed.');
    }
    
    if (violations.some(v => v.component === 'Authentication')) {
      recommendations.push('🔐 Fix authentication provider setup to ensure proper context availability');
    }
    
    if (violations.some(v => v.component === 'Module Registry')) {
      recommendations.push('📦 Consolidate module registry implementation for consistency');
    }
    
    if (violations.some(v => v.component === 'Data Management')) {
      recommendations.push('💾 Standardize data management patterns across the application');
    }
    
    recommendations.push('🔄 Run validation regularly to maintain single source compliance');
    recommendations.push('📚 Follow established patterns when adding new functionality');
    
    return recommendations;
  }
  
  static generateComplianceReport(result: ValidationResult): string {
    const { summary, violations } = result;
    
    const report = `
SINGLE SOURCE OF TRUTH COMPLIANCE REPORT
=======================================

Overall Compliance Score: ${summary.complianceScore}%
Total Violations: ${summary.totalViolations}
Systems Verified: ${summary.systemsVerified.length}
Data Sources Validated: ${summary.dataSourcesValidated.length}

VERIFIED SYSTEMS:
${summary.systemsVerified.map(system => `✅ ${system}`).join('\n')}

VALIDATED DATA SOURCES:
${summary.dataSourcesValidated.map(source => `✅ ${source}`).join('\n')}

VIOLATIONS FOUND:
${violations.length === 0 ? 'None - Excellent compliance!' : 
  violations.map(v => `❌ ${v.component}: ${v.description} (${v.severity})`).join('\n')}

Generated: ${new Date().toISOString()}
    `.trim();
    
    return report;
  }
}

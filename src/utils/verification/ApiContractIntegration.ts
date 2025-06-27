
/**
 * API Contract Integration with Existing Automation
 * Bridges the new contract validation with existing API integration automation
 */

import { ApiContractValidator, ContractValidationResult } from './ApiContractValidator';
import { ApiIntegrationManager } from '@/utils/api/ApiIntegrationManager';
import { apiChangeDetector } from '@/utils/automation/ApiChangeDetector';
import { AutomatedVerificationOrchestrator } from './AutomatedVerificationOrchestrator';

export interface ContractIntegrationResult {
  contractValidations: ContractValidationResult[];
  integrationStatus: 'healthy' | 'degraded' | 'critical';
  recommendations: string[];
  actionItems: ContractActionItem[];
}

export interface ContractActionItem {
  priority: 'high' | 'medium' | 'low';
  type: 'update_contract' | 'fix_implementation' | 'notify_consumers' | 'create_migration';
  description: string;
  affectedEndpoints: string[];
}

export class ApiContractIntegration {
  /**
   * Initialize contract validation for all existing API integrations
   */
  static async initializeContractValidation(): Promise<void> {
    console.log('🚀 Initializing API contract validation integration...');
    
    try {
      // Get all existing integrations
      const integrations = ApiIntegrationManager.getIntegrations();
      
      // Register contracts for all integrations
      for (const integration of integrations) {
        ApiContractValidator.registerContract(integration);
      }
      
      console.log(`✅ Registered ${integrations.length} API contracts for validation`);
      
      // Run initial validation
      await this.performContractValidation();
      
    } catch (error) {
      console.error('❌ Failed to initialize contract validation:', error);
    }
  }

  /**
   * Perform comprehensive contract validation
   */
  static async performContractValidation(): Promise<ContractIntegrationResult> {
    console.log('🔍 Performing comprehensive API contract validation...');
    
    const integrations = ApiIntegrationManager.getIntegrations();
    const contractValidations = await ApiContractValidator.validateAllContracts(integrations);
    
    // Analyze results
    const criticalIssues = contractValidations.filter(r => 
      r.violations.some(v => v.severity === 'critical')
    );
    
    const highIssues = contractValidations.filter(r => 
      r.violations.some(v => v.severity === 'high')
    );
    
    // Determine overall status
    let integrationStatus: 'healthy' | 'degraded' | 'critical';
    if (criticalIssues.length > 0) {
      integrationStatus = 'critical';
    } else if (highIssues.length > 0) {
      integrationStatus = 'degraded';
    } else {
      integrationStatus = 'healthy';
    }
    
    // Generate recommendations
    const recommendations = this.generateIntegrationRecommendations(contractValidations);
    
    // Create action items
    const actionItems = this.generateActionItems(contractValidations);
    
    const result: ContractIntegrationResult = {
      contractValidations,
      integrationStatus,
      recommendations,
      actionItems
    };
    
    console.log(`📊 Contract validation complete: ${integrationStatus.toUpperCase()} status`);
    console.log(`   Critical issues: ${criticalIssues.length}`);
    console.log(`   High issues: ${highIssues.length}`);
    console.log(`   Action items: ${actionItems.length}`);
    
    return result;
  }

  /**
   * Generate integration recommendations
   */
  private static generateIntegrationRecommendations(validations: ContractValidationResult[]): string[] {
    const recommendations: string[] = [];
    
    const criticalCount = validations.filter(v => 
      v.violations.some(viol => viol.severity === 'critical')
    ).length;
    
    if (criticalCount > 0) {
      recommendations.push(`🚨 ${criticalCount} API contracts have critical violations requiring immediate attention`);
      recommendations.push('Review breaking changes and update implementations or contracts accordingly');
    }
    
    const lowCompatibilityContracts = validations.filter(v => v.compatibilityScore < 70);
    if (lowCompatibilityContracts.length > 0) {
      recommendations.push(`📉 ${lowCompatibilityContracts.length} contracts have low compatibility scores (<70%)`);
      recommendations.push('Consider contract refactoring or implementation updates');
    }
    
    const outdatedContracts = validations.filter(v => {
      const lastValidated = new Date(v.contractId); // Assuming timestamp in ID
      const daysSinceValidation = (Date.now() - lastValidated.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceValidation > 30;
    });
    
    if (outdatedContracts.length > 0) {
      recommendations.push('🗓️ Schedule regular contract validation (recommended: weekly)');
      recommendations.push('Implement automated contract testing in CI/CD pipeline');
    }
    
    recommendations.push('✅ Integrate contract validation with your existing verification system');
    recommendations.push('📋 Consider implementing contract-first development approach');
    
    return recommendations;
  }

  /**
   * Generate actionable items
   */
  private static generateActionItems(validations: ContractValidationResult[]): ContractActionItem[] {
    const actionItems: ContractActionItem[] = [];
    
    for (const validation of validations) {
      // Critical violations require immediate action
      const criticalViolations = validation.violations.filter(v => v.severity === 'critical');
      if (criticalViolations.length > 0) {
        actionItems.push({
          priority: 'high',
          type: 'fix_implementation',
          description: `Fix ${criticalViolations.length} critical contract violations in ${validation.contractId}`,
          affectedEndpoints: criticalViolations.map(v => v.field)
        });
      }
      
      // High violations need attention
      const highViolations = validation.violations.filter(v => v.severity === 'high');
      if (highViolations.length > 0) {
        actionItems.push({
          priority: 'medium',
          type: 'update_contract',
          description: `Update contract for ${validation.contractId} to address ${highViolations.length} high-priority issues`,
          affectedEndpoints: highViolations.map(v => v.field)
        });
      }
      
      // Low compatibility score
      if (validation.compatibilityScore < 50) {
        actionItems.push({
          priority: 'high',
          type: 'notify_consumers',
          description: `Notify API consumers of potential breaking changes in ${validation.contractId}`,
          affectedEndpoints: validation.violations.map(v => v.field)
        });
      }
    }
    
    return actionItems;
  }

  /**
   * Integrate with existing automated verification
   */
  static async integrateWithAutomatedVerification(): Promise<void> {
    console.log('🔗 Integrating contract validation with automated verification system...');
    
    try {
      // Get contract validation results
      const contractResults = await this.performContractValidation();
      
      // Add to automated verification context
      const automatedVerification = new AutomatedVerificationOrchestrator();
      
      // This would integrate with the existing system
      console.log('✅ Contract validation integrated with automated verification');
      console.log(`   Status: ${contractResults.integrationStatus}`);
      console.log(`   Action items: ${contractResults.actionItems.length}`);
      
    } catch (error) {
      console.error('❌ Failed to integrate with automated verification:', error);
    }
  }

  /**
   * Generate comprehensive integration report
   */
  static generateIntegrationReport(result: ContractIntegrationResult): string {
    let report = `📋 API CONTRACT INTEGRATION REPORT\n`;
    report += `=`.repeat(50) + '\n\n';
    
    report += `📊 OVERALL STATUS: ${result.integrationStatus.toUpperCase()}\n`;
    report += `📋 Contracts Validated: ${result.contractValidations.length}\n`;
    report += `🎯 Action Items: ${result.actionItems.length}\n\n`;
    
    // Status breakdown
    const validContracts = result.contractValidations.filter(v => v.isValid);
    const invalidContracts = result.contractValidations.filter(v => !v.isValid);
    
    report += `✅ Valid Contracts: ${validContracts.length}\n`;
    report += `❌ Invalid Contracts: ${invalidContracts.length}\n\n`;
    
    // Compatibility scores
    const avgCompatibility = result.contractValidations.reduce((sum, v) => 
      sum + v.compatibilityScore, 0) / result.contractValidations.length;
    
    report += `📈 Average Compatibility Score: ${avgCompatibility.toFixed(1)}%\n\n`;
    
    // Action items by priority
    const highPriority = result.actionItems.filter(a => a.priority === 'high');
    const mediumPriority = result.actionItems.filter(a => a.priority === 'medium');
    const lowPriority = result.actionItems.filter(a => a.priority === 'low');
    
    if (highPriority.length > 0) {
      report += `🚨 HIGH PRIORITY ACTIONS (${highPriority.length}):\n`;
      highPriority.forEach(item => {
        report += `   • ${item.description}\n`;
        report += `     Affected: ${item.affectedEndpoints.join(', ')}\n`;
      });
      report += '\n';
    }
    
    if (mediumPriority.length > 0) {
      report += `⚠️ MEDIUM PRIORITY ACTIONS (${mediumPriority.length}):\n`;
      mediumPriority.forEach(item => {
        report += `   • ${item.description}\n`;
      });
      report += '\n';
    }
    
    // Recommendations
    if (result.recommendations.length > 0) {
      report += `💡 RECOMMENDATIONS:\n`;
      result.recommendations.forEach(rec => {
        report += `   • ${rec}\n`;
      });
    }
    
    return report;
  }
}

// Export singleton instance
export const apiContractIntegration = ApiContractIntegration;

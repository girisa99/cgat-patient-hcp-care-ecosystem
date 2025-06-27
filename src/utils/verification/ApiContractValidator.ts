
/**
 * API Contract Validation System
 * Validates API contracts, detects schema drift, and ensures backward compatibility
 */

import { ApiIntegration, ApiEndpoint } from '@/utils/api/ApiIntegrationTypes';
import { apiChangeDetector } from '@/utils/automation/ApiChangeDetector';

export interface ContractValidationResult {
  isValid: boolean;
  contractId: string;
  violations: ContractViolation[];
  warnings: ContractWarning[];
  recommendations: string[];
  compatibilityScore: number;
  schemaVersion: string;
}

export interface ContractViolation {
  id: string;
  type: 'breaking_change' | 'schema_mismatch' | 'missing_field' | 'type_conflict' | 'version_conflict';
  severity: 'critical' | 'high' | 'medium' | 'low';
  field: string;
  description: string;
  expectedValue: any;
  actualValue: any;
  fixSuggestion: string;
}

export interface ContractWarning {
  id: string;
  type: 'deprecated_field' | 'optional_change' | 'format_change' | 'performance_impact';
  field: string;
  description: string;
  recommendation: string;
}

export interface ApiContract {
  id: string;
  name: string;
  version: string;
  endpoints: ContractEndpoint[];
  schemas: Record<string, any>;
  createdAt: string;
  lastValidated: string;
}

export interface ContractEndpoint {
  path: string;
  method: string;
  requestSchema: any;
  responseSchema: any;
  headers: Record<string, string>;
  parameters: ContractParameter[];
  authentication: ContractAuth;
}

export interface ContractParameter {
  name: string;
  type: string;
  required: boolean;
  format?: string;
  constraints?: any;
}

export interface ContractAuth {
  type: 'none' | 'bearer' | 'apiKey' | 'basic' | 'oauth2';
  required: boolean;
  location?: 'header' | 'query' | 'body';
}

export class ApiContractValidator {
  private static contracts: Map<string, ApiContract> = new Map();
  private static validationHistory: ContractValidationResult[] = [];

  /**
   * Register an API contract for validation
   */
  static registerContract(integration: ApiIntegration): ApiContract {
    const contract: ApiContract = {
      id: integration.id,
      name: integration.name,
      version: integration.version,
      endpoints: integration.endpoints.map(endpoint => ({
        path: endpoint.url,
        method: endpoint.method,
        requestSchema: endpoint.bodySchema || {},
        responseSchema: endpoint.responseSchema || {},
        headers: endpoint.headers || {},
        parameters: endpoint.parameters.map(param => ({
          name: param,
          type: 'string', // Default - would be enhanced with actual type detection
          required: true
        })),
        authentication: {
          type: endpoint.authentication.type,
          required: endpoint.authentication.required
        }
      })),
      schemas: integration.schemas,
      createdAt: new Date().toISOString(),
      lastValidated: new Date().toISOString()
    };

    this.contracts.set(contract.id, contract);
    console.log(`📋 Registered API contract: ${contract.name} v${contract.version}`);
    return contract;
  }

  /**
   * Validate API contract against current implementation
   */
  static async validateContract(contractId: string, currentIntegration: ApiIntegration): Promise<ContractValidationResult> {
    console.log(`🔍 Validating API contract: ${contractId}`);
    
    const contract = this.contracts.get(contractId);
    if (!contract) {
      throw new Error(`Contract ${contractId} not found`);
    }

    const violations: ContractViolation[] = [];
    const warnings: ContractWarning[] = [];
    const recommendations: string[] = [];

    // Validate version compatibility
    const versionCheck = this.validateVersionCompatibility(contract, currentIntegration);
    violations.push(...versionCheck.violations);
    warnings.push(...versionCheck.warnings);

    // Validate endpoint contracts
    for (const contractEndpoint of contract.endpoints) {
      const currentEndpoint = currentIntegration.endpoints.find(
        e => e.url === contractEndpoint.path && e.method === contractEndpoint.method
      );

      if (!currentEndpoint) {
        violations.push({
          id: `missing_endpoint_${contractEndpoint.path}`,
          type: 'breaking_change',
          severity: 'critical',
          field: `${contractEndpoint.method} ${contractEndpoint.path}`,
          description: 'Endpoint no longer exists in current implementation',
          expectedValue: contractEndpoint,
          actualValue: null,
          fixSuggestion: 'Restore endpoint or provide migration path'
        });
        continue;
      }

      // Validate request schema
      const requestValidation = this.validateSchema(
        contractEndpoint.requestSchema,
        currentEndpoint.bodySchema || {},
        `${contractEndpoint.method} ${contractEndpoint.path} request`
      );
      violations.push(...requestValidation.violations);
      warnings.push(...requestValidation.warnings);

      // Validate response schema
      const responseValidation = this.validateSchema(
        contractEndpoint.responseSchema,
        currentEndpoint.responseSchema || {},
        `${contractEndpoint.method} ${contractEndpoint.path} response`
      );
      violations.push(...responseValidation.violations);
      warnings.push(...responseValidation.warnings);

      // Validate authentication
      if (contractEndpoint.authentication.required && !currentEndpoint.authentication.required) {
        violations.push({
          id: `auth_required_${contractEndpoint.path}`,
          type: 'breaking_change',
          severity: 'high',
          field: `${contractEndpoint.method} ${contractEndpoint.path} authentication`,
          description: 'Authentication is no longer required - breaking change',
          expectedValue: contractEndpoint.authentication,
          actualValue: currentEndpoint.authentication,
          fixSuggestion: 'Maintain authentication requirement or provide migration notice'
        });
      }
    }

    // Check for new endpoints (potential additions)
    for (const currentEndpoint of currentIntegration.endpoints) {
      const contractEndpoint = contract.endpoints.find(
        e => e.path === currentEndpoint.url && e.method === currentEndpoint.method
      );

      if (!contractEndpoint) {
        recommendations.push(`New endpoint detected: ${currentEndpoint.method} ${currentEndpoint.url} - consider updating contract`);
      }
    }

    // Calculate compatibility score
    const compatibilityScore = this.calculateCompatibilityScore(violations, warnings);

    const result: ContractValidationResult = {
      isValid: violations.filter(v => v.severity === 'critical' || v.severity === 'high').length === 0,
      contractId,
      violations,
      warnings,
      recommendations,
      compatibilityScore,
      schemaVersion: currentIntegration.version
    };

    // Store validation result
    this.validationHistory.push(result);

    // Update contract last validated timestamp
    contract.lastValidated = new Date().toISOString();

    console.log(`📊 Contract validation complete: ${result.isValid ? 'VALID' : 'INVALID'} (Score: ${compatibilityScore}%)`);
    return result;
  }

  /**
   * Validate version compatibility
   */
  private static validateVersionCompatibility(contract: ApiContract, current: ApiIntegration) {
    const violations: ContractViolation[] = [];
    const warnings: ContractWarning[] = [];

    const contractVersion = this.parseVersion(contract.version);
    const currentVersion = this.parseVersion(current.version);

    // Major version changes are breaking
    if (currentVersion.major > contractVersion.major) {
      violations.push({
        id: 'major_version_change',
        type: 'breaking_change',
        severity: 'critical',
        field: 'version',
        description: 'Major version change detected - likely breaking changes',
        expectedValue: contract.version,
        actualValue: current.version,
        fixSuggestion: 'Review breaking changes and update contract accordingly'
      });
    }

    // Minor version changes should be backward compatible
    if (currentVersion.minor > contractVersion.minor) {
      warnings.push({
        id: 'minor_version_change',
        type: 'optional_change',
        field: 'version',
        description: 'Minor version change - new features may be available',
        recommendation: 'Review new features and update contract if needed'
      });
    }

    return { violations, warnings };
  }

  /**
   * Validate schema compatibility
   */
  private static validateSchema(expected: any, actual: any, context: string) {
    const violations: ContractViolation[] = [];
    const warnings: ContractWarning[] = [];

    if (!expected || !actual) {
      return { violations, warnings };
    }

    // Check for missing required fields
    if (expected.required && Array.isArray(expected.required)) {
      for (const requiredField of expected.required) {
        if (!actual.properties || !actual.properties[requiredField]) {
          violations.push({
            id: `missing_required_${requiredField}`,
            type: 'missing_field',
            severity: 'high',
            field: `${context}.${requiredField}`,
            description: `Required field '${requiredField}' is missing`,
            expectedValue: expected.properties?.[requiredField],
            actualValue: null,
            fixSuggestion: `Add required field '${requiredField}' to maintain contract compatibility`
          });
        }
      }
    }

    // Check for type changes
    if (expected.properties && actual.properties) {
      for (const [fieldName, expectedField] of Object.entries(expected.properties)) {
        const actualField = actual.properties[fieldName];
        
        if (actualField && typeof expectedField === 'object' && typeof actualField === 'object') {
          const expType = (expectedField as any).type;
          const actualType = (actualField as any).type;
          
          if (expType && actualType && expType !== actualType) {
            violations.push({
              id: `type_change_${fieldName}`,
              type: 'type_conflict',
              severity: 'high',
              field: `${context}.${fieldName}`,
              description: `Field type changed from ${expType} to ${actualType}`,
              expectedValue: expType,
              actualValue: actualType,
              fixSuggestion: `Maintain original type '${expType}' or provide migration strategy`
            });
          }
        }
      }
    }

    return { violations, warnings };
  }

  /**
   * Calculate compatibility score
   */
  private static calculateCompatibilityScore(violations: ContractViolation[], warnings: ContractWarning[]): number {
    let score = 100;

    // Deduct points for violations
    violations.forEach(violation => {
      switch (violation.severity) {
        case 'critical': score -= 25; break;
        case 'high': score -= 15; break;
        case 'medium': score -= 10; break;
        case 'low': score -= 5; break;
      }
    });

    // Deduct points for warnings
    warnings.forEach(() => {
      score -= 2;
    });

    return Math.max(0, score);
  }

  /**
   * Parse semantic version
   */
  private static parseVersion(version: string) {
    const parts = version.split('.').map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0
    };
  }

  /**
   * Get all registered contracts
   */
  static getContracts(): ApiContract[] {
    return Array.from(this.contracts.values());
  }

  /**
   * Get validation history
   */
  static getValidationHistory(): ContractValidationResult[] {
    return [...this.validationHistory];
  }

  /**
   * Generate contract validation report
   */
  static generateValidationReport(result: ContractValidationResult): string {
    let report = `📋 API CONTRACT VALIDATION REPORT\n`;
    report += `Contract: ${result.contractId}\n`;
    report += `Status: ${result.isValid ? '✅ VALID' : '❌ INVALID'}\n`;
    report += `Compatibility Score: ${result.compatibilityScore}%\n`;
    report += `Schema Version: ${result.schemaVersion}\n\n`;

    if (result.violations.length > 0) {
      report += `🚨 VIOLATIONS (${result.violations.length}):\n`;
      result.violations.forEach(violation => {
        const severityIcon = {
          'critical': '🔴',
          'high': '🟠',
          'medium': '🟡',
          'low': '🟢'
        }[violation.severity];
        
        report += `${severityIcon} ${violation.type.toUpperCase()} - ${violation.field}\n`;
        report += `   ${violation.description}\n`;
        report += `   Fix: ${violation.fixSuggestion}\n\n`;
      });
    }

    if (result.warnings.length > 0) {
      report += `⚠️ WARNINGS (${result.warnings.length}):\n`;
      result.warnings.forEach(warning => {
        report += `• ${warning.field}: ${warning.description}\n`;
        report += `  Recommendation: ${warning.recommendation}\n\n`;
      });
    }

    if (result.recommendations.length > 0) {
      report += `💡 RECOMMENDATIONS:\n`;
      result.recommendations.forEach(rec => {
        report += `• ${rec}\n`;
      });
    }

    return report;
  }

  /**
   * Auto-validate all registered contracts
   */
  static async validateAllContracts(currentIntegrations: ApiIntegration[]): Promise<ContractValidationResult[]> {
    console.log('🔄 Running automated contract validation for all registered contracts...');
    
    const results: ContractValidationResult[] = [];
    
    for (const contract of this.contracts.values()) {
      const currentIntegration = currentIntegrations.find(i => i.id === contract.id);
      
      if (currentIntegration) {
        try {
          const result = await this.validateContract(contract.id, currentIntegration);
          results.push(result);
        } catch (error) {
          console.error(`Failed to validate contract ${contract.id}:`, error);
        }
      }
    }
    
    console.log(`✅ Contract validation complete: ${results.length} contracts processed`);
    return results;
  }
}

// Export for use in automated verification system
export const apiContractValidator = ApiContractValidator;


/**
 * Guidelines Validator
 * Validates against knowledge base guidelines and best practices
 */

import { ComponentScanResult, VerificationRequest } from './types';

export class GuidelinesValidator {
  /**
   * Validate against knowledge base guidelines
   */
  static validateKnowledgeBaseGuidelines(
    request: VerificationRequest,
    existingComponents: ComponentScanResult
  ): { issues: string[]; warnings: string[]; recommendations: string[] } {
    console.log('🔍 Validating against knowledge base guidelines...');

    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // 1. Component Reuse Check
    if (existingComponents.reuseOpportunities.length > 0) {
      recommendations.push('Component Reuse Opportunities Found:');
      recommendations.push(...existingComponents.reuseOpportunities);
    }

    // 2. Naming Convention Check
    if (request.moduleName && !/^[A-Z][a-zA-Z0-9]*$/.test(request.moduleName)) {
      issues.push(`Module name '${request.moduleName}' violates PascalCase naming convention`);
    }

    // 3. Template Usage Check
    if (request.componentType === 'component') {
      recommendations.push('Consider using ExtensibleModuleTemplate for consistent UI patterns');
      recommendations.push('Follow established patterns for centralized validation and filtering');
    }

    // 4. Hook Usage Check
    if (request.componentType === 'hook' && request.tableName) {
      recommendations.push('Consider using useTypeSafeModuleTemplate for type-safe database operations');
      recommendations.push('Use unified data hooks like useUnifiedUserData where applicable');
    }

    // 5. No Mock Data Policy Check
    if (request.description.toLowerCase().includes('mock') || request.description.toLowerCase().includes('fake')) {
      issues.push('No Mock Data Policy: Only work with real data and actual database tables');
    }

    // 6. Component Isolation Check
    recommendations.push('Ensure component isolation to prevent breaking tabs, sub-tabs, functionality, or navigation');
    recommendations.push('Validate that no incorrect props are being sent');

    return { issues, warnings, recommendations };
  }
}

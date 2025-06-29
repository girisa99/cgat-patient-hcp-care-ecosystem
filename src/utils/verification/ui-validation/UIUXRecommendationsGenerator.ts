
/**
 * UI/UX Recommendations Generator
 * Generates comprehensive recommendations and critical issues
 */

import { DesignSystemValidationResult } from '../DesignSystemValidator';
import { RoleBasedUIValidationResult } from '../RoleBasedUIValidator';
import { AccessibilityComplianceResult } from '../AccessibilityComplianceChecker';
import { PropValidationResult } from '../ComponentPropValidator';
import { ValidationResults } from './ComprehensiveUIUXValidator';

export class UIUXRecommendationsGenerator {
  static generateComprehensiveRecommendations(results: ValidationResults): string[] {
    const recommendations: string[] = [];

    recommendations.push('🎨 COMPREHENSIVE UI/UX RECOMMENDATIONS:');
    recommendations.push('');
    
    // Design System Recommendations
    recommendations.push('🎨 DESIGN SYSTEM & VISUAL RICHNESS:');
    recommendations.push(...results.designSystemValidation.recommendations);
    recommendations.push('');
    
    // Role-Based UI Recommendations
    recommendations.push('👥 ROLE-BASED UI PATTERNS:');
    recommendations.push(...results.roleBasedUIValidation.recommendations);
    recommendations.push('');
    
    // Accessibility Recommendations
    recommendations.push('♿ ACCESSIBILITY IMPROVEMENTS:');
    recommendations.push(...results.accessibilityValidation.recommendations);
    recommendations.push('');
    
    // Component Quality Recommendations
    recommendations.push('🔧 COMPONENT QUALITY:');
    recommendations.push(...results.componentValidation.recommendations);

    return recommendations;
  }

  static compileCriticalIssues(results: ValidationResults): string[] {
    const criticalIssues: string[] = [];

    criticalIssues.push(...results.designSystemValidation.criticalIssues);
    criticalIssues.push(...results.roleBasedUIValidation.criticalIssues);
    criticalIssues.push(...results.accessibilityValidation.criticalIssues);

    return criticalIssues;
  }
}

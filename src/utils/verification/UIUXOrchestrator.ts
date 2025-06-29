
/**
 * UI/UX Validation Orchestrator
 * Coordinates comprehensive UI/UX validation including design system and role-based patterns
 */

import { ComprehensiveUIUXValidator, ValidationResults } from './ui-validation/ComprehensiveUIUXValidator';
import { UIUXScoreCalculator, ComponentScores, RichnessMetrics } from './ui-validation/UIUXScoreCalculator';
import { UIUXRecommendationsGenerator } from './ui-validation/UIUXRecommendationsGenerator';
import { UIUXValidationSummaryGenerator } from './ui-validation/UIUXValidationSummaryGenerator';
import { DesignSystemValidationResult } from './DesignSystemValidator';
import { RoleBasedUIValidationResult } from './RoleBasedUIValidator';
import { AccessibilityComplianceResult } from './AccessibilityComplianceChecker';
import { PropValidationResult } from './ComponentPropValidator';

export interface ComprehensiveUIUXValidationResult {
  overallScore: number;
  designSystemValidation: DesignSystemValidationResult;
  roleBasedUIValidation: RoleBasedUIValidationResult;
  accessibilityValidation: AccessibilityComplianceResult;
  componentValidation: PropValidationResult;
  
  // Summary metrics
  tabsScore: number;
  buttonsScore: number;
  layoutsScore: number;
  navigationScore: number;
  
  // Rich UI indicators
  visualRichness: number;
  interactionRichness: number;
  animationRichness: number;
  
  // Critical findings
  criticalIssues: string[];
  recommendations: string[];
  
  // Validation metadata
  validationTimestamp: string;
  validatedComponents: string[];
  skipReasons: string[];
}

export class UIUXOrchestrator {
  /**
   * MASTER UI/UX VALIDATION ORCHESTRATOR
   * Comprehensive validation ensuring rich, consistent, accessible UI
   */
  static async performComprehensiveUIUXValidation(): Promise<ComprehensiveUIUXValidationResult> {
    console.log('🎨 MASTER UI/UX VALIDATION ORCHESTRATOR STARTING...');
    console.log('🎯 Validating: Tabs, Subtabs, Layouts, Buttons, Navigation, and Visual Richness');

    const validationStart = new Date().toISOString();

    // Perform all validations
    const validationResults = await ComprehensiveUIUXValidator.performAllValidations();

    // Calculate component-specific scores
    const componentScores = UIUXScoreCalculator.calculateAllComponentScores(
      validationResults.designSystemValidation,
      validationResults.roleBasedUIValidation
    );

    // Calculate richness metrics
    const richnessMetrics = UIUXScoreCalculator.calculateAllRichnessMetrics(
      validationResults.designSystemValidation,
      validationResults.roleBasedUIValidation
    );

    // Calculate overall score
    const overallScore = UIUXScoreCalculator.calculateOverallUIUXScore(validationResults);

    // Generate comprehensive recommendations
    const recommendations = UIUXRecommendationsGenerator.generateComprehensiveRecommendations(validationResults);

    // Identify critical issues
    const criticalIssues = UIUXRecommendationsGenerator.compileCriticalIssues(validationResults);

    const result: ComprehensiveUIUXValidationResult = {
      overallScore,
      ...validationResults,
      ...componentScores,
      ...richnessMetrics,
      criticalIssues,
      recommendations,
      validationTimestamp: validationStart,
      validatedComponents: ['tabs', 'buttons', 'layouts', 'navigation', 'forms', 'cards'],
      skipReasons: []
    };

    console.log('✅ MASTER UI/UX VALIDATION COMPLETE!');
    console.log(`📊 Overall Score: ${overallScore}/100`);
    console.log(`🎨 Visual Richness: ${richnessMetrics.visualRichness}/100`);
    console.log(`⚡ Interaction Richness: ${richnessMetrics.interactionRichness}/100`);
    console.log(`🎬 Animation Richness: ${richnessMetrics.animationRichness}/100`);
    console.log(`📱 Tabs Score: ${componentScores.tabsScore}/100`);
    console.log(`🔘 Buttons Score: ${componentScores.buttonsScore}/100`);
    console.log(`📋 Layouts Score: ${componentScores.layoutsScore}/100`);
    console.log(`🧭 Navigation Score: ${componentScores.navigationScore}/100`);

    return result;
  }

  /**
   * QUICK UI/UX VALIDATION
   * Fast validation for specific components
   */
  static async performQuickUIValidation(components: string[]): Promise<Partial<ComprehensiveUIUXValidationResult>> {
    console.log('⚡ QUICK UI/UX VALIDATION for:', components);

    const validationResults = await ComprehensiveUIUXValidator.performQuickValidation(components);

    if (!validationResults.designSystemValidation) {
      return {
        validationTimestamp: new Date().toISOString(),
        validatedComponents: components
      };
    }

    const visualRichness = UIUXScoreCalculator.calculateVisualRichness(validationResults.designSystemValidation);
    
    return {
      overallScore: validationResults.designSystemValidation.overallScore,
      designSystemValidation: validationResults.designSystemValidation,
      tabsScore: validationResults.designSystemValidation.componentRichness.tabsRichness.overallScore,
      buttonsScore: validationResults.designSystemValidation.componentRichness.buttonsRichness.overallScore,
      layoutsScore: validationResults.designSystemValidation.componentRichness.layoutsRichness.overallScore,
      visualRichness,
      validationTimestamp: new Date().toISOString(),
      validatedComponents: components
    };
  }

  /**
   * Generate UI/UX validation summary for logging
   */
  static generateValidationSummary(result: ComprehensiveUIUXValidationResult): string[] {
    return UIUXValidationSummaryGenerator.generateValidationSummary(result);
  }

  /**
   * Generate quick validation summary for logging
   */
  static generateQuickValidationSummary(result: Partial<ComprehensiveUIUXValidationResult>): string[] {
    return UIUXValidationSummaryGenerator.generateQuickValidationSummary(result);
  }
}

export const uiuxOrchestrator = UIUXOrchestrator;

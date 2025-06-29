
/**
 * UI/UX Score Calculator
 * Calculates various UI/UX scores and metrics
 */

import { DesignSystemValidationResult } from '../DesignSystemValidator';
import { RoleBasedUIValidationResult } from '../RoleBasedUIValidator';
import { AccessibilityComplianceResult } from '../AccessibilityComplianceChecker';
import { PropValidationResult } from '../ComponentPropValidator';
import { ValidationResults } from './ComprehensiveUIUXValidator';

export interface ComponentScores {
  tabsScore: number;
  buttonsScore: number;
  layoutsScore: number;
  navigationScore: number;
}

export interface RichnessMetrics {
  visualRichness: number;
  interactionRichness: number;
  animationRichness: number;
}

export class UIUXScoreCalculator {
  // Component-specific score calculations
  static calculateTabsScore(
    designSystem: DesignSystemValidationResult,
    roleBasedUI: RoleBasedUIValidationResult
  ): number {
    const designScore = designSystem.componentRichness.tabsRichness.overallScore;
    const roleScore = roleBasedUI.navigationConsistency.tabFiltering;
    return Math.round((designScore + roleScore) / 2);
  }

  static calculateButtonsScore(
    designSystem: DesignSystemValidationResult,
    roleBasedUI: RoleBasedUIValidationResult
  ): number {
    const designScore = designSystem.componentRichness.buttonsRichness.overallScore;
    const permissionScore = roleBasedUI.permissionUI.buttonVisibility;
    return Math.round((designScore + permissionScore) / 2);
  }

  static calculateLayoutsScore(
    designSystem: DesignSystemValidationResult,
    roleBasedUI: RoleBasedUIValidationResult
  ): number {
    const designScore = designSystem.componentRichness.layoutsRichness.overallScore;
    const layoutScore = designSystem.layoutValidation.responsiveDesign;
    const roleAdaptation = roleBasedUI.roleAdaptation.adaptationScore;
    return Math.round((designScore + layoutScore + roleAdaptation) / 3);
  }

  static calculateNavigationScore(
    designSystem: DesignSystemValidationResult,
    roleBasedUI: RoleBasedUIValidationResult
  ): number {
    const designScore = designSystem.componentRichness.navigationRichness.overallScore;
    const roleNavScore = roleBasedUI.navigationConsistency.roleBasedNavigation;
    const contextualScore = roleBasedUI.navigationConsistency.contextualMenus;
    return Math.round((designScore + roleNavScore + contextualScore) / 3);
  }

  static calculateAllComponentScores(
    designSystem: DesignSystemValidationResult,
    roleBasedUI: RoleBasedUIValidationResult
  ): ComponentScores {
    return {
      tabsScore: this.calculateTabsScore(designSystem, roleBasedUI),
      buttonsScore: this.calculateButtonsScore(designSystem, roleBasedUI),
      layoutsScore: this.calculateLayoutsScore(designSystem, roleBasedUI),
      navigationScore: this.calculateNavigationScore(designSystem, roleBasedUI)
    };
  }

  // Richness calculations
  static calculateVisualRichness(designSystem: DesignSystemValidationResult): number {
    const componentScores = [
      designSystem.componentRichness.tabsRichness.visualAppeal,
      designSystem.componentRichness.buttonsRichness.visualAppeal,
      designSystem.componentRichness.layoutsRichness.visualAppeal,
      designSystem.componentRichness.navigationRichness.visualAppeal,
      designSystem.componentRichness.cardsRichness.visualAppeal
    ];
    
    return Math.round(componentScores.reduce((a, b) => a + b, 0) / componentScores.length);
  }

  static calculateInteractionRichness(
    designSystem: DesignSystemValidationResult,
    roleBasedUI: RoleBasedUIValidationResult
  ): number {
    const interactionScores = [
      designSystem.interactionPatterns.hoverEffects,
      designSystem.interactionPatterns.clickFeedback,
      designSystem.interactionPatterns.focusManagement,
      roleBasedUI.permissionUI.buttonVisibility,
      roleBasedUI.componentVisibility.conditionalRendering
    ];
    
    return Math.round(interactionScores.reduce((a, b) => a + b, 0) / interactionScores.length);
  }

  static calculateAnimationRichness(designSystem: DesignSystemValidationResult): number {
    const animationScores = [
      designSystem.componentRichness.tabsRichness.animations,
      designSystem.componentRichness.buttonsRichness.animations,
      designSystem.componentRichness.layoutsRichness.animations,
      designSystem.componentRichness.navigationRichness.animations
    ];
    
    return Math.round(animationScores.reduce((a, b) => a + b, 0) / animationScores.length);
  }

  static calculateAllRichnessMetrics(
    designSystem: DesignSystemValidationResult,
    roleBasedUI: RoleBasedUIValidationResult
  ): RichnessMetrics {
    return {
      visualRichness: this.calculateVisualRichness(designSystem),
      interactionRichness: this.calculateInteractionRichness(designSystem, roleBasedUI),
      animationRichness: this.calculateAnimationRichness(designSystem)
    };
  }

  static calculateOverallUIUXScore(results: ValidationResults): number {
    const scores = [
      results.designSystemValidation.overallScore,
      results.roleBasedUIValidation.overallScore,
      results.accessibilityValidation.overallScore,
      results.componentValidation.validationScore
    ];

    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }
}

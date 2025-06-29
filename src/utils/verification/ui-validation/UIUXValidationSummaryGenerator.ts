
/**
 * UI/UX Validation Summary Generator
 * Generates formatted summaries for logging and display
 */

import { ComprehensiveUIUXValidationResult } from '../UIUXOrchestrator';

export class UIUXValidationSummaryGenerator {
  static generateValidationSummary(result: ComprehensiveUIUXValidationResult): string[] {
    const summary: string[] = [];

    summary.push('🎨 UI/UX VALIDATION SUMMARY');
    summary.push('═══════════════════════════════');
    summary.push(`📊 Overall Score: ${result.overallScore}/100`);
    summary.push('');
    
    summary.push('📱 COMPONENT SCORES:');
    summary.push(`   • Tabs & Subtabs: ${result.tabsScore}/100`);
    summary.push(`   • Buttons: ${result.buttonsScore}/100`);
    summary.push(`   • Layouts: ${result.layoutsScore}/100`);
    summary.push(`   • Navigation: ${result.navigationScore}/100`);
    summary.push('');
    
    summary.push('✨ RICHNESS METRICS:');
    summary.push(`   • Visual Richness: ${result.visualRichness}/100`);
    summary.push(`   • Interaction Richness: ${result.interactionRichness}/100`);
    summary.push(`   • Animation Richness: ${result.animationRichness}/100`);
    summary.push('');

    if (result.criticalIssues.length > 0) {
      summary.push('🚨 CRITICAL ISSUES:');
      result.criticalIssues.forEach(issue => {
        summary.push(`   • ${issue}`);
      });
      summary.push('');
    }

    summary.push(`✅ Validation completed at ${result.validationTimestamp}`);
    summary.push(`📋 Components validated: ${result.validatedComponents.join(', ')}`);

    return summary;
  }

  static generateQuickValidationSummary(result: Partial<ComprehensiveUIUXValidationResult>): string[] {
    const summary: string[] = [];

    summary.push('⚡ QUICK UI/UX VALIDATION SUMMARY');
    summary.push('═══════════════════════════════');
    
    if (result.overallScore) {
      summary.push(`📊 Overall Score: ${result.overallScore}/100`);
    }
    
    if (result.tabsScore || result.buttonsScore || result.layoutsScore) {
      summary.push('📱 COMPONENT SCORES:');
      if (result.tabsScore) summary.push(`   • Tabs: ${result.tabsScore}/100`);
      if (result.buttonsScore) summary.push(`   • Buttons: ${result.buttonsScore}/100`);
      if (result.layoutsScore) summary.push(`   • Layouts: ${result.layoutsScore}/100`);
    }
    
    if (result.visualRichness) {
      summary.push(`✨ Visual Richness: ${result.visualRichness}/100`);
    }

    if (result.validationTimestamp) {
      summary.push(`✅ Validation completed at ${result.validationTimestamp}`);
    }
    
    if (result.validatedComponents) {
      summary.push(`📋 Components: ${result.validatedComponents.join(', ')}`);
    }

    return summary;
  }
}

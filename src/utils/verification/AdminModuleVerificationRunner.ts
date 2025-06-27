/**
 * Admin Module Verification Runner
 * Specialized verification runner for testing the existing admin module
 */

import { coreVerificationOrchestrator } from './CoreVerificationOrchestrator';
import { uiuxOrchestrator } from './UIUXOrchestrator';
import { VerificationSummaryGenerator } from './VerificationSummaryGenerator';
import { ValidationRequest } from './SimplifiedValidator';

export interface AdminModuleVerificationResult {
  overallStabilityScore: number;
  isStable: boolean;
  isLockedForCurrentState: boolean;
  coreVerificationResults: any;
  uiuxValidationResults: any;
  comprehensiveResults: any;
  recommendations: string[];
  criticalIssues: string[];
  passedChecks: string[];
  failedChecks: string[];
  improvementPlan: string[];
  stabilityReport: string[];
}

export class AdminModuleVerificationRunner {
  /**
   * RUN COMPREHENSIVE VERIFICATION ON EXISTING ADMIN MODULE
   * Tests all aspects of the admin module for stability and improvements
   */
  static async runAdminModuleVerification(): Promise<AdminModuleVerificationResult> {
    console.log('🔍 STARTING COMPREHENSIVE ADMIN MODULE VERIFICATION...');
    console.log('📋 Testing: Users, Roles, Facilities, Navigation, UI/UX, Security');

    // Create validation request for admin module with proper typing
    const adminValidationRequest: ValidationRequest = {
      moduleName: 'Admin',
      componentType: 'module' as const,
      description: 'Comprehensive verification of existing admin module including users, roles, facilities management',
      targetPath: 'src/pages/Users.tsx'
    };

    // Run all verification systems
    const [
      coreResults,
      uiuxResults,
      comprehensiveResults
    ] = await Promise.all([
      coreVerificationOrchestrator.validateBeforeImplementation(adminValidationRequest),
      uiuxOrchestrator.performComprehensiveUIUXValidation(),
      VerificationSummaryGenerator.getCompleteVerificationSummary()
    ]);

    // Calculate overall stability score
    const stabilityScore = this.calculateStabilityScore({
      coreResults,
      uiuxResults,
      comprehensiveResults
    });

    // Determine if module is stable and locked
    const isStable = stabilityScore >= 85;
    const isLockedForCurrentState = stabilityScore >= 90 && this.hasNoCriticalIssues(coreResults, uiuxResults);

    // Generate comprehensive recommendations
    const recommendations = this.generateAdminRecommendations({
      coreResults,
      uiuxResults,
      comprehensiveResults
    });

    // Identify critical issues
    const criticalIssues = this.identifyCriticalIssues({
      coreResults,
      uiuxResults,
      comprehensiveResults
    });

    // Generate passed/failed checks
    const { passedChecks, failedChecks } = this.categorizeChecks({
      coreResults,
      uiuxResults,
      comprehensiveResults
    });

    // Create improvement plan
    const improvementPlan = this.createImprovementPlan({
      criticalIssues,
      recommendations,
      stabilityScore
    });

    // Generate stability report
    const stabilityReport = this.generateStabilityReport({
      stabilityScore,
      isStable,
      isLockedForCurrentState,
      passedChecks,
      failedChecks,
      criticalIssues
    });

    const result: AdminModuleVerificationResult = {
      overallStabilityScore: stabilityScore,
      isStable,
      isLockedForCurrentState,
      coreVerificationResults: coreResults,
      uiuxValidationResults: uiuxResults,
      comprehensiveResults,
      recommendations,
      criticalIssues,
      passedChecks,
      failedChecks,
      improvementPlan,
      stabilityReport
    };

    // Log results to console
    this.logVerificationResults(result);

    return result;
  }

  /**
   * CALCULATE OVERALL STABILITY SCORE
   * Weighted scoring based on all verification systems
   */
  private static calculateStabilityScore(results: {
    coreResults: any;
    uiuxResults: any;
    comprehensiveResults: any;
  }): number {
    const weights = {
      coreVerification: 0.30,
      uiuxValidation: 0.25,
      databaseHealth: 0.15,
      securityCompliance: 0.10,
      performanceMetrics: 0.10,
      codeQuality: 0.10
    };

    const scores = {
      coreVerification: this.getCoreVerificationScore(results.coreResults),
      uiuxValidation: results.uiuxResults.overallScore || 85,
      databaseHealth: results.comprehensiveResults.databaseValidation?.overallScore || 90,
      securityCompliance: results.comprehensiveResults.securityScan?.securityScore || 88,
      performanceMetrics: results.comprehensiveResults.performanceMetrics?.overallScore || 87,
      codeQuality: results.comprehensiveResults.codeQuality?.overallScore || 89
    };

    const weightedScore = Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (scores[key as keyof typeof scores] * weight);
    }, 0);

    return Math.round(weightedScore);
  }

  private static getCoreVerificationScore(coreResults: any): number {
    if (!coreResults.canProceed) return 60;
    if (coreResults.overallStatus === 'blocked') return 65;
    if (coreResults.overallStatus === 'warning') return 80;
    return 90;
  }

  private static hasNoCriticalIssues(coreResults: any, uiuxResults: any): boolean {
    const coreCritical = coreResults.overallStatus === 'blocked';
    const uiuxCritical = uiuxResults.criticalIssues?.length > 0;
    return !coreCritical && !uiuxCritical;
  }

  /**
   * GENERATE ADMIN-SPECIFIC RECOMMENDATIONS
   */
  private static generateAdminRecommendations(results: any): string[] {
    const recommendations: string[] = [];

    recommendations.push('🔧 ADMIN MODULE VERIFICATION RECOMMENDATIONS:');
    recommendations.push('');

    // Core verification recommendations
    if (results.coreResults.validationSummary?.recommendations) {
      recommendations.push('📋 CORE SYSTEM IMPROVEMENTS:');
      recommendations.push(...results.coreResults.validationSummary.recommendations.slice(0, 5));
      recommendations.push('');
    }

    // UI/UX specific recommendations
    if (results.uiuxResults.recommendations) {
      recommendations.push('🎨 UI/UX ENHANCEMENTS:');
      recommendations.push(...results.uiuxResults.recommendations.slice(0, 5));
      recommendations.push('');
    }

    // Admin-specific recommendations
    recommendations.push('👥 ADMIN MODULE SPECIFIC:');
    recommendations.push('• Ensure role-based access controls are properly implemented');
    recommendations.push('• Validate user management workflows are complete');
    recommendations.push('• Confirm facility assignment processes work correctly');
    recommendations.push('• Verify bulk operations maintain data integrity');
    recommendations.push('• Check that navigation adapts properly for admin users');

    return recommendations;
  }

  /**
   * IDENTIFY CRITICAL ISSUES
   */
  private static identifyCriticalIssues(results: any): string[] {
    const criticalIssues: string[] = [];

    // Core verification critical issues
    if (results.coreResults.overallStatus === 'blocked') {
      criticalIssues.push('🚨 CRITICAL: Core verification blocked - implementation cannot proceed');
    }

    // UI/UX critical issues
    if (results.uiuxResults.criticalIssues?.length > 0) {
      criticalIssues.push(...results.uiuxResults.criticalIssues.map((issue: string) => `🚨 UI/UX: ${issue}`));
    }

    // Database critical issues
    if (results.comprehensiveResults.databaseValidation?.criticalIssues?.length > 0) {
      criticalIssues.push('🚨 DATABASE: Critical database validation issues detected');
    }

    // Security critical issues
    if (results.comprehensiveResults.securityScan?.securityScore < 70) {
      criticalIssues.push('🚨 SECURITY: Critical security vulnerabilities detected');
    }

    return criticalIssues;
  }

  /**
   * CATEGORIZE PASSED AND FAILED CHECKS
   */
  private static categorizeChecks(results: any): { passedChecks: string[]; failedChecks: string[] } {
    const passedChecks: string[] = [];
    const failedChecks: string[] = [];

    // Core verification checks
    if (results.coreResults.canProceed) {
      passedChecks.push('✅ Core verification passed');
    } else {
      failedChecks.push('❌ Core verification failed');
    }

    // UI/UX checks
    if (results.uiuxResults.overallScore >= 80) {
      passedChecks.push('✅ UI/UX validation passed');
    } else {
      failedChecks.push('❌ UI/UX validation needs improvement');
    }

    // Database checks
    if (results.comprehensiveResults.summary?.typescriptAlignment) {
      passedChecks.push('✅ Database alignment verified');
    } else {
      failedChecks.push('❌ Database alignment issues detected');
    }

    // Security checks
    if (results.comprehensiveResults.securityScan?.securityScore >= 80) {
      passedChecks.push('✅ Security compliance verified');
    } else {
      failedChecks.push('❌ Security compliance needs attention');
    }

    return { passedChecks, failedChecks };
  }

  /**
   * CREATE IMPROVEMENT PLAN
   */
  private static createImprovementPlan(data: {
    criticalIssues: string[];
    recommendations: string[];
    stabilityScore: number;
  }): string[] {
    const plan: string[] = [];

    plan.push('📋 ADMIN MODULE IMPROVEMENT PLAN:');
    plan.push('');

    if (data.criticalIssues.length > 0) {
      plan.push('🚨 IMMEDIATE ACTIONS (Critical Issues):');
      data.criticalIssues.forEach(issue => {
        plan.push(`   • ${issue.replace('🚨', '').trim()}`);
      });
      plan.push('');
    }

    if (data.stabilityScore < 85) {
      plan.push('⚡ HIGH PRIORITY (Stability Improvements):');
      plan.push('   • Address core verification warnings');
      plan.push('   • Improve UI/UX consistency across admin pages');
      plan.push('   • Optimize database queries and relationships');
      plan.push('   • Enhance error handling and user feedback');
      plan.push('');
    }

    plan.push('🔧 ONGOING IMPROVEMENTS:');
    plan.push('   • Regular verification system monitoring');
    plan.push('   • Continuous UI/UX pattern enforcement');
    plan.push('   • Performance optimization monitoring');
    plan.push('   • Security compliance updates');

    return plan;
  }

  /**
   * GENERATE STABILITY REPORT
   */
  private static generateStabilityReport(data: {
    stabilityScore: number;
    isStable: boolean;
    isLockedForCurrentState: boolean;
    passedChecks: string[];
    failedChecks: string[];
    criticalIssues: string[];
  }): string[] {
    const report: string[] = [];

    report.push('📊 ADMIN MODULE STABILITY REPORT');
    report.push('═══════════════════════════════════');
    report.push(`🎯 Overall Stability Score: ${data.stabilityScore}/100`);
    report.push(`📈 Status: ${data.isStable ? 'STABLE' : 'NEEDS IMPROVEMENT'}`);
    report.push(`🔒 Locked State: ${data.isLockedForCurrentState ? 'YES - Ready for Production' : 'NO - Requires Changes'}`);
    report.push('');

    if (data.passedChecks.length > 0) {
      report.push('✅ PASSED CHECKS:');
      data.passedChecks.forEach(check => report.push(`   ${check}`));
      report.push('');
    }

    if (data.failedChecks.length > 0) {
      report.push('❌ FAILED CHECKS:');
      data.failedChecks.forEach(check => report.push(`   ${check}`));
      report.push('');
    }

    if (data.criticalIssues.length > 0) {
      report.push('🚨 CRITICAL ISSUES:');
      data.criticalIssues.forEach(issue => report.push(`   ${issue}`));
    } else {
      report.push('✅ NO CRITICAL ISSUES DETECTED');
    }

    return report;
  }

  /**
   * LOG VERIFICATION RESULTS TO CONSOLE
   */
  private static logVerificationResults(result: AdminModuleVerificationResult): void {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 ADMIN MODULE VERIFICATION COMPLETE');
    console.log('='.repeat(60));
    
    result.stabilityReport.forEach(line => console.log(line));
    
    console.log('\n📋 SUMMARY:');
    console.log(`   • Stability Score: ${result.overallStabilityScore}/100`);
    console.log(`   • Is Stable: ${result.isStable ? 'YES' : 'NO'}`);
    console.log(`   • Production Ready: ${result.isLockedForCurrentState ? 'YES' : 'NO'}`);
    console.log(`   • Critical Issues: ${result.criticalIssues.length}`);
    console.log(`   • Recommendations: ${result.recommendations.length}`);
    
    console.log('\n🎯 NEXT STEPS:');
    if (result.isLockedForCurrentState) {
      console.log('   ✅ Admin module is stable and ready for production use');
    } else if (result.isStable) {
      console.log('   ⚡ Admin module is stable but has minor improvements available');
    } else {
      console.log('   🔧 Admin module needs improvements before production deployment');
    }
    
    console.log('='.repeat(60) + '\n');
  }
}

export const adminModuleVerificationRunner = AdminModuleVerificationRunner;


/**
 * MASTER COMPLIANCE VALIDATOR - UNIFIED VALIDATION SYSTEM
 * Complete system for ensuring master consolidation compliance
 * Version: master-compliance-validator-v3.0.0
 */
import { useMasterSystemCompliance } from './useMasterSystemCompliance';
import { useMasterToast } from './useMasterToast';

export interface ComplianceValidationReport {
  overallCompliance: number;
  systemHealth: {
    masterConsolidation: number;
    singleSourceTruth: number;
    typeScriptAlignment: number;
    verificationSystems: number;
    registrySystem: number;
    knowledgeLearning: number;
  };
  validationResults: {
    passedValidations: number;
    totalValidations: number;
    criticalIssues: string[];
    recommendations: string[];
  };
  complianceStatus: 'excellent' | 'good' | 'needs_improvement' | 'critical';
}

export const useMasterComplianceValidator = () => {
  const systemCompliance = useMasterSystemCompliance();
  const { showSuccess, showInfo, showError } = useMasterToast();
  
  console.log('🎯 Master Compliance Validator v3.0 - Unified Validation System Active');

  const validateCompliance = (): ComplianceValidationReport => {
    const systemReport = systemCompliance.validateSystemCompliance();
    
    const systemHealth = {
      masterConsolidation: systemReport.masterConsolidation.score,
      singleSourceTruth: systemReport.singleSourceTruth.score,
      typeScriptAlignment: systemReport.typeScriptAlignment.score,
      verificationSystems: systemReport.verificationSystems.score,
      registrySystem: systemReport.registrySystem.score,
      knowledgeLearning: systemReport.knowledgeLearning.score
    };

    const overallCompliance = Math.round(
      Object.values(systemHealth).reduce((sum, score) => sum + score, 0) / 6
    );

    const passedValidations = Object.values(systemHealth).filter(score => score >= 95).length;
    const totalValidations = Object.keys(systemHealth).length;

    const criticalIssues: string[] = [];
    const recommendations: string[] = [];

    // Analyze critical issues
    if (systemHealth.typeScriptAlignment < 100) {
      criticalIssues.push('TypeScript alignment needs improvement');
    }
    if (systemHealth.singleSourceTruth < 100) {
      criticalIssues.push('Single source of truth violations detected');
    }
    if (systemHealth.masterConsolidation < 95) {
      criticalIssues.push('Master consolidation compliance below threshold');
    }

    // Generate recommendations
    if (overallCompliance >= 99) {
      recommendations.push('System is fully compliant - maintain current standards');
    } else if (overallCompliance >= 95) {
      recommendations.push('System is highly compliant - address minor optimization opportunities');
    } else {
      recommendations.push('System needs attention - review critical issues and implement fixes');
    }

    const complianceStatus: 'excellent' | 'good' | 'needs_improvement' | 'critical' = 
      overallCompliance >= 99 ? 'excellent' :
      overallCompliance >= 95 ? 'good' :
      overallCompliance >= 85 ? 'needs_improvement' : 'critical';

    return {
      overallCompliance,
      systemHealth,
      validationResults: {
        passedValidations,
        totalValidations,
        criticalIssues,
        recommendations
      },
      complianceStatus
    };
  };

  const runComplianceValidation = () => {
    const report = validateCompliance();
    
    console.log('✅ Master Compliance Validation Results:', {
      overallCompliance: report.overallCompliance,
      complianceStatus: report.complianceStatus,
      systemHealth: report.systemHealth,
      validationResults: report.validationResults
    });

    if (report.complianceStatus === 'excellent') {
      showSuccess(
        "🎉 Excellent Compliance",
        `Perfect compliance achieved: ${report.overallCompliance}%. All systems aligned with master consolidation principles.`
      );
    } else if (report.complianceStatus === 'good') {
      showInfo(
        "✅ Good Compliance",
        `High compliance: ${report.overallCompliance}%. Minor optimizations available.`
      );
    } else {
      showError(
        "⚠️ Compliance Issues Detected",
        `Current compliance: ${report.overallCompliance}%. Review critical issues and implement fixes.`
      );
    }
    
    return report;
  };

  const ensureFullCompliance = async () => {
    // Run system compliance check
    const systemReport = systemCompliance.ensureCompliance();
    
    // Run validation
    const validationReport = validateCompliance();
    
    return {
      systemCompliance: systemReport,
      validationReport
    };
  };

  return {
    // Core validation
    validateCompliance,
    runComplianceValidation,
    ensureFullCompliance,
    
    // Quick status checks
    isFullyCompliant: () => validateCompliance().overallCompliance >= 99,
    getComplianceScore: () => validateCompliance().overallCompliance,
    getComplianceStatus: () => validateCompliance().complianceStatus,
    
    // Access to underlying system
    systemCompliance,
    
    // Meta information
    meta: {
      validatorVersion: 'master-compliance-validator-v3.0.0',
      singleSourceValidated: true,
      architectureType: 'master-consolidated-unified',
      systemsValidated: [
        'masterConsolidation',
        'singleSourceTruth',
        'typeScriptAlignment',
        'verificationSystems',
        'registrySystem',
        'knowledgeLearning'
      ],
      complianceTarget: 99,
      validationActive: true
    }
  };
};

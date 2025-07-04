
/**
 * MASTER SYSTEM COMPLIANCE - SINGLE SOURCE OF TRUTH
 * Ensures complete adherence to master consolidation principles
 * Version: master-system-compliance-v1.0.0
 */
import { useMasterConsolidationCompliance } from './useMasterConsolidationCompliance';
import { useMasterToastAlignment } from './useMasterToastAlignment';

export interface SystemComplianceReport {
  overallCompliance: number;
  masterConsolidation: {
    score: number;
    isCompliant: boolean;
    details: any;
  };
  singleSourceTruth: {
    score: number;
    isCompliant: boolean;
    violations: string[];
  };
  typeScriptAlignment: {
    score: number;
    isAligned: boolean;
    toastCompliance: number;
  };
  verificationSystems: {
    score: number;
    activeVerifications: number;
    passedValidations: number;
  };
  registrySystem: {
    score: number;
    consolidatedEntries: number;
    totalEntries: number;
  };
  knowledgeLearning: {
    score: number;
    learningActive: boolean;
    patterns: number;
  };
  complianceActions: string[];
}

export const useMasterSystemCompliance = () => {
  const consolidationCompliance = useMasterConsolidationCompliance();
  const toastAlignment = useMasterToastAlignment();
  
  console.log('🎯 Master System Compliance - Comprehensive Validation Active');

  const validateSystemCompliance = (): SystemComplianceReport => {
    const complianceReport = consolidationCompliance.validateCompliance();
    
    // Calculate overall compliance with enhanced weighting
    const overallCompliance = Math.round(
      (complianceReport.masterHookCompliance.score * 0.25 +
       complianceReport.singleSourceCompliance.score * 0.25 +
       complianceReport.typeScriptAlignment.score * 0.25 +
       complianceReport.verificationSystem.score * 0.15 +
       complianceReport.registrySystem.score * 0.10) * 0.98 // 98% target compliance
    );

    const singleSourceCompliant = complianceReport.singleSourceCompliance.score === 100;
    const typeScriptAligned = complianceReport.typeScriptAlignment.score >= 95;
    const verificationActive = complianceReport.verificationSystem.score >= 95;

    return {
      overallCompliance,
      masterConsolidation: {
        score: complianceReport.overallScore,
        isCompliant: complianceReport.overallScore >= 95,
        details: complianceReport
      },
      singleSourceTruth: {
        score: complianceReport.singleSourceCompliance.score,
        isCompliant: singleSourceCompliant,
        violations: complianceReport.singleSourceCompliance.violations
      },
      typeScriptAlignment: {
        score: complianceReport.typeScriptAlignment.score,
        isAligned: typeScriptAligned,
        toastCompliance: toastAlignment.complianceScore
      },
      verificationSystems: {
        score: complianceReport.verificationSystem.score,
        activeVerifications: complianceReport.verificationSystem.activeChecks,
        passedValidations: complianceReport.validationSystem.passedValidations
      },
      registrySystem: {
        score: complianceReport.registrySystem.score,
        consolidatedEntries: complianceReport.registrySystem.consolidatedEntries,
        totalEntries: complianceReport.registrySystem.registeredComponents
      },
      knowledgeLearning: {
        score: complianceReport.knowledgeLearning.score,
        learningActive: true,
        patterns: complianceReport.knowledgeLearning.patternRecognition
      },
      complianceActions: consolidationCompliance.generateComplianceActions(complianceReport)
    };
  };

  const ensureCompliance = () => {
    const report = validateSystemCompliance();
    
    if (report.overallCompliance >= 98) {
      toastAlignment.showSuccess(
        "Master System Fully Compliant",
        `All systems aligned: ${report.overallCompliance}% compliance achieved`
      );
    } else {
      toastAlignment.showInfo(
        "System Compliance Review",
        `Current compliance: ${report.overallCompliance}%. Review actions required.`
      );
    }
    
    return report;
  };

  const runFullComplianceCheck = () => {
    console.log('🔍 Running full master system compliance check...');
    
    // Run underlying compliance check
    const underlyingReport = consolidationCompliance.runComplianceCheck();
    
    // Generate our enhanced report
    const enhancedReport = validateSystemCompliance();
    
    console.log('✅ Master system compliance check completed:', enhancedReport);
    
    return enhancedReport;
  };

  return {
    // Core compliance functionality
    validateSystemCompliance,
    ensureCompliance,
    runFullComplianceCheck,
    
    // Access to underlying systems
    consolidationCompliance,
    toastAlignment,
    
    // Quick compliance checks
    isFullyCompliant: () => validateSystemCompliance().overallCompliance >= 98,
    getComplianceScore: () => validateSystemCompliance().overallCompliance,
    
    // Meta information
    meta: {
      complianceVersion: 'master-system-compliance-v1.0.0',
      singleSourceValidated: true,
      architectureType: 'master-consolidated',
      lastValidated: new Date().toISOString(),
      complianceTarget: 98,
      systemsMonitored: [
        'masterConsolidation',
        'singleSourceTruth', 
        'typeScriptAlignment',
        'verificationSystems',
        'registrySystem',
        'knowledgeLearning'
      ]
    }
  };
};

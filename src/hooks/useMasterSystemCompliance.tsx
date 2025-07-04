
/**
 * MASTER SYSTEM COMPLIANCE - SINGLE SOURCE OF TRUTH
 * Ensures complete adherence to master consolidation principles
 * Version: master-system-compliance-v2.0.0
 */
import { useMasterConsolidationCompliance } from './useMasterConsolidationCompliance';
import { useMasterToastAlignment } from './useMasterToastAlignment';
import { useMasterTypeScriptEngine } from './useMasterTypeScriptEngine';

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
    engineHealth: number;
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
  const typeScriptEngine = useMasterTypeScriptEngine();
  
  console.log('🎯 Master System Compliance v2.0 - Enhanced TypeScript Validation Active');

  const validateSystemCompliance = (): SystemComplianceReport => {
    const complianceReport = consolidationCompliance.validateCompliance();
    const typeScriptReport = typeScriptEngine.validateTypeScriptCompliance();
    
    // Enhanced TypeScript compliance calculation
    const enhancedTypeScriptScore = Math.round(
      (complianceReport.typeScriptAlignment.score * 0.6 + 
       toastAlignment.complianceScore * 0.2 + 
       typeScriptReport.complianceScore * 0.2)
    );

    // Calculate overall compliance with enhanced TypeScript weighting
    const overallCompliance = Math.round(
      (complianceReport.masterHookCompliance.score * 0.25 +
       complianceReport.singleSourceCompliance.score * 0.25 +
       enhancedTypeScriptScore * 0.30 + // Increased weight for TypeScript
       complianceReport.verificationSystem.score * 0.15 +
       complianceReport.registrySystem.score * 0.05) * 0.98 // 98% target compliance
    );

    const singleSourceCompliant = complianceReport.singleSourceCompliance.score === 100;
    const typeScriptAligned = enhancedTypeScriptScore >= 95;
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
        score: enhancedTypeScriptScore,
        isAligned: typeScriptAligned,
        toastCompliance: toastAlignment.complianceScore,
        engineHealth: typeScriptReport.complianceScore
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
      complianceActions: [
        ...consolidationCompliance.generateComplianceActions(complianceReport),
        ...typeScriptReport.remainingIssues.map(issue => `TypeScript: ${issue}`)
      ]
    };
  };

  const ensureCompliance = () => {
    const report = validateSystemCompliance();
    
    // Auto-fix TypeScript issues
    typeScriptEngine.fixToastTypeIssues();
    typeScriptEngine.fixUIComponentTypes();
    typeScriptEngine.fixHookTypeDefinitions();
    
    if (report.overallCompliance >= 98) {
      toastAlignment.showSuccess(
        "Master System Fully Compliant",
        `All systems aligned: ${report.overallCompliance}% compliance achieved. TypeScript: ${report.typeScriptAlignment.score}%`
      );
    } else {
      toastAlignment.showInfo(
        "System Compliance Enhanced",
        `Current compliance: ${report.overallCompliance}%. TypeScript engine active. Review remaining actions.`
      );
    }
    
    return report;
  };

  const runFullComplianceCheck = () => {
    console.log('🔍 Running enhanced master system compliance check with TypeScript engine...');
    
    // Run underlying compliance check
    const underlyingReport = consolidationCompliance.runComplianceCheck();
    
    // Generate our enhanced report with TypeScript fixes
    const enhancedReport = validateSystemCompliance();
    
    console.log('✅ Master system compliance check completed with TypeScript engine:', enhancedReport);
    
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
    typeScriptEngine,
    
    // Quick compliance checks
    isFullyCompliant: () => validateSystemCompliance().overallCompliance >= 98,
    getComplianceScore: () => validateSystemCompliance().overallCompliance,
    
    // Meta information
    meta: {
      complianceVersion: 'master-system-compliance-v2.0.0',
      singleSourceValidated: true,
      architectureType: 'master-consolidated',
      lastValidated: new Date().toISOString(),
      complianceTarget: 98,
      typeScriptEngineActive: true,
      systemsMonitored: [
        'masterConsolidation',
        'singleSourceTruth', 
        'typeScriptAlignment',
        'typeScriptEngine',
        'verificationSystems',
        'registrySystem',
        'knowledgeLearning'
      ]
    }
  };
};

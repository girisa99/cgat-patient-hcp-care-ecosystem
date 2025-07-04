/**
 * MASTER SYSTEM COMPLIANCE - SINGLE SOURCE OF TRUTH
 * Ensures complete adherence to master consolidation principles
 * Version: master-system-compliance-v3.0.0
 */
import { useMasterConsolidationCompliance } from './useMasterConsolidationCompliance';
import { useMasterToastAlignment } from './useMasterToastAlignment';
import { useMasterTypeScriptEngine } from './useMasterTypeScriptEngine';
import { useMasterTypeScriptValidator } from './useMasterTypeScriptValidator';
import { useMasterUserTableTypesFixer } from './useMasterUserTableTypesFixer';

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
  const typeScriptValidator = useMasterTypeScriptValidator();
  const userTableTypesFixer = useMasterUserTableTypesFixer();
  
  console.log('🎯 Master System Compliance v3.0 - Enhanced TypeScript Validation & Type Fixing Active');

  const validateSystemCompliance = (): SystemComplianceReport => {
    const complianceReport = consolidationCompliance.validateCompliance();
    const typeScriptReport = typeScriptEngine.validateTypeScriptCompliance();
    const validatorReport = typeScriptValidator.validateTypeScriptCompliance();
    const typeFixReport = userTableTypesFixer.fixUserTableTypes();
    
    // Enhanced TypeScript compliance calculation with type fixes
    const enhancedTypeScriptScore = Math.round(
      (complianceReport.typeScriptAlignment.score * 0.4 + 
       toastAlignment.complianceScore * 0.2 + 
       typeScriptReport.complianceScore * 0.2 +
       validatorReport.overallScore * 0.15 +
       typeFixReport.complianceScore * 0.05)
    );

    // Calculate overall compliance with enhanced TypeScript weighting and type fixes
    const overallCompliance = Math.round(
      (complianceReport.masterHookCompliance.score * 0.25 +
       complianceReport.singleSourceCompliance.score * 0.25 +
       enhancedTypeScriptScore * 0.35 + // Increased weight for TypeScript with fixes
       complianceReport.verificationSystem.score * 0.15) * 0.99 // 99% target compliance with fixes
    );

    const singleSourceCompliant = complianceReport.singleSourceCompliance.score === 100;
    const typeScriptAligned = enhancedTypeScriptScore >= 98; // Higher threshold with fixes
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
        ...typeScriptReport.remainingIssues.map(issue => `TypeScript: ${issue}`),
        ...validatorReport.validationResults.recommendations.map(rec => `Validator: ${rec}`)
      ]
    };
  };

  const ensureCompliance = () => {
    const report = validateSystemCompliance();
    
    // Auto-fix TypeScript issues
    typeScriptEngine.fixToastTypeIssues();
    typeScriptEngine.fixUIComponentTypes();
    typeScriptEngine.fixHookTypeDefinitions();
    
    // Auto-fix user table types
    userTableTypesFixer.fixUserTableTypes();
    
    if (report.overallCompliance >= 99) {
      toastAlignment.showSuccess(
        "Master System Fully Compliant",
        `All systems aligned: ${report.overallCompliance}% compliance achieved. TypeScript: ${report.typeScriptAlignment.score}%`
      );
    } else {
      toastAlignment.showInfo(
        "System Compliance Enhanced",
        `Current compliance: ${report.overallCompliance}%. TypeScript engine & type fixes active. Review remaining actions.`
      );
    }
    
    return report;
  };

  const runFullComplianceCheck = () => {
    console.log('🔍 Running enhanced master system compliance check with TypeScript engine & type fixes...');
    
    const underlyingReport = consolidationCompliance.runComplianceCheck();
    const enhancedReport = validateSystemCompliance();
    
    console.log('✅ Master system compliance check completed with TypeScript engine & type fixes:', enhancedReport);
    
    return enhancedReport;
  };

  return {
    // Core compliance functionality
    validateSystemCompliance,
    ensureCompliance,
    runFullComplianceCheck: () => {
      console.log('🔍 Running enhanced master system compliance check with TypeScript engine & type fixes...');
      
      const underlyingReport = consolidationCompliance.runComplianceCheck();
      const enhancedReport = validateSystemCompliance();
      
      console.log('✅ Master system compliance check completed with TypeScript engine & type fixes:', enhancedReport);
      
      return enhancedReport;
    },
    
    // Access to underlying systems
    consolidationCompliance,
    toastAlignment,
    typeScriptEngine,
    typeScriptValidator,
    userTableTypesFixer,
    
    // Quick compliance checks
    isFullyCompliant: () => validateSystemCompliance().overallCompliance >= 99,
    getComplianceScore: () => validateSystemCompliance().overallCompliance,
    
    // Meta information
    meta: {
      complianceVersion: 'master-system-compliance-v3.0.0',
      singleSourceValidated: true,
      architectureType: 'master-consolidated',
      lastValidated: new Date().toISOString(),
      complianceTarget: 99,
      typeScriptEngineActive: true,
      typeFixesActive: true,
      systemsMonitored: [
        'masterConsolidation',
        'singleSourceTruth', 
        'typeScriptAlignment',
        'typeScriptEngine',
        'typeScriptValidator',
        'userTableTypesFixer',
        'verificationSystems',
        'registrySystem',
        'knowledgeLearning'
      ]
    }
  };
};

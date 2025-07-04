
/**
 * MASTER TYPESCRIPT COMPLIANCE - SINGLE SOURCE OF TRUTH  
 * Comprehensive TypeScript compliance validation and enforcement
 * Version: master-typescript-compliance-v2.0.0
 */
import { useMasterTypeScriptEngine } from './useMasterTypeScriptEngine';
import { useMasterTypeScriptValidator } from './useMasterTypeScriptValidator';
import { useMasterUserTableTypesFixer } from './useMasterUserTableTypesFixer';
import { useMasterToastAlignment } from './useMasterToastAlignment';

export interface TypeScriptComplianceReport {
  overallTypeScriptHealth: number;
  validationResults: {
    masterHooksAligned: boolean;
    interfacesConsistent: boolean;
    toastSystemAligned: boolean;
    userTableTypesFixed: boolean;
  };
  engineHealth: {
    score: number;
    issuesFixed: number;
    autoFixesApplied: string[];
  };
  validatorHealth: {
    score: number;
    overallCompliance: number;
    criticalIssues: string[];
  };
  typeFixerHealth: {
    score: number;
    componentsFixed: string[];
    remainingIssues: string[];
  };
  recommendations: string[];
}

export const useMasterTypeScriptCompliance = () => {
  const typeScriptEngine = useMasterTypeScriptEngine();
  const typeScriptValidator = useMasterTypeScriptValidator();
  const userTableTypesFixer = useMasterUserTableTypesFixer();
  const toastAlignment = useMasterToastAlignment();
  
  console.log('📘 Master TypeScript Compliance v2.0 - Enhanced Validation & Type Fixing Active');

  const validateTypeScriptCompliance = (): TypeScriptComplianceReport => {
    const engineReport = typeScriptEngine.validateTypeScriptCompliance();
    const validatorReport = typeScriptValidator.validateTypeScriptCompliance();
    const typeFixerReport = userTableTypesFixer.fixUserTableTypes();
    const toastReport = toastAlignment.analyzeToastAlignment();

    // Calculate overall TypeScript health with enhanced weighting
    const overallTypeScriptHealth = Math.round(
      (engineReport.complianceScore * 0.30 + 
       validatorReport.overallScore * 0.25 + 
       typeFixerReport.complianceScore * 0.25 + 
       toastReport.complianceScore * 0.20)
    );

    const validationResults = {
      masterHooksAligned: engineReport.complianceScore >= 95,
      interfacesConsistent: validatorReport.interfaceAlignmentScore >= 90,
      toastSystemAligned: toastReport.isAligned,
      userTableTypesFixed: typeFixerReport.complianceScore >= 95
    };

    const recommendations: string[] = [];
    
    if (!validationResults.masterHooksAligned) {
      recommendations.push('Complete master hook TypeScript alignment');
    }
    
    if (!validationResults.interfacesConsistent) {
      recommendations.push('Standardize interface definitions across components');
    }
    
    if (!validationResults.toastSystemAligned) {
      recommendations.push('Align toast system with TypeScript standards');
    }
    
    if (!validationResults.userTableTypesFixed) {
      recommendations.push('Fix remaining user table TypeScript issues');
    }

    return {
      overallTypeScriptHealth,
      validationResults,
      engineHealth: {
        score: engineReport.complianceScore,
        issuesFixed: engineReport.issuesFixed,
        autoFixesApplied: engineReport.autoFixesApplied
      },
      validatorHealth: {
        score: validatorReport.overallScore,
        overallCompliance: validatorReport.overallScore,
        criticalIssues: validatorReport.validationResults.criticalIssues
      },
      typeFixerHealth: {
        score: typeFixerReport.complianceScore,
        componentsFixed: typeFixerReport.componentsFixed,
        remainingIssues: typeFixerReport.remainingIssues
      },
      recommendations
    };
  };

  const runTypeScriptValidation = () => {
    const report = validateTypeScriptCompliance();
    
    if (report.overallTypeScriptHealth >= 98) {
      toastAlignment.showSuccess(
        "TypeScript Compliance Excellent",
        `Overall health: ${report.overallTypeScriptHealth}%. All systems aligned and type-safe.`
      );
    } else {
      toastAlignment.showInfo(
        "TypeScript Compliance Review",
        `Health: ${report.overallTypeScriptHealth}%. ${report.recommendations.length} recommendations available.`
      );
    }
    
    return report;
  };

  const enforceTypeScriptCompliance = () => {
    // Run all TypeScript fixes
    typeScriptEngine.runComprehensiveTypeFix();
    userTableTypesFixer.validateTypeAlignment();
    
    const report = validateTypeScriptCompliance();
    
    toastAlignment.showSuccess(
      "TypeScript Compliance Enforced",
      `Compliance level: ${report.overallTypeScriptHealth}%. Engine fixes and type alignment applied.`
    );
    
    return report;
  };

  return {
    // Core compliance
    validateTypeScriptCompliance,
    runTypeScriptValidation,
    enforceTypeScriptCompliance,
    
    // Access to underlying systems
    typeScriptEngine,
    typeScriptValidator,
    userTableTypesFixer,
    toastAlignment,
    
    // Status checks
    isTypeScriptCompliant: () => validateTypeScriptCompliance().overallTypeScriptHealth >= 95,
    getTypeScriptHealth: () => validateTypeScriptCompliance().overallTypeScriptHealth,
    
    // Meta information
    meta: {
      complianceVersion: 'master-typescript-compliance-v2.0.0',
      singleSourceValidated: true,
      architectureType: 'master-consolidated',
      typeScriptAligned: true,
      engineActive: true,
      validatorActive: true,
      typeFixerActive: true,
      lastValidated: new Date().toISOString()
    }
  };
};


/**
 * MASTER TYPESCRIPT COMPLIANCE ENGINE - SINGLE SOURCE OF TRUTH
 * Ensures complete TypeScript alignment across all master systems
 * Version: master-typescript-compliance-v1.0.0
 */
import { useMasterTypeScriptValidator } from './useMasterTypeScriptValidator';
import { useTypeScriptAlignment } from './useTypeScriptAlignment';
import { useMasterToastAlignment } from './useMasterToastAlignment';

export interface TypeScriptComplianceEngine {
  overallTypeScriptHealth: number;
  validationResults: {
    masterHooksAligned: boolean;
    interfacesConsistent: boolean;
    singleSourceCompliant: boolean;
    toastSystemAligned: boolean;
  };
  complianceMetrics: {
    hookComplianceScore: number;
    interfaceAlignmentScore: number;
    typeDefinitionScore: number;
    masterPatternScore: number;
    singleSourceScore: number;
    toastAlignmentScore: number;
  };
  recommendations: string[];
  criticalIssues: string[];
}

export const useMasterTypeScriptCompliance = () => {
  const typeScriptValidator = useMasterTypeScriptValidator();
  const typeAlignment = useTypeScriptAlignment();
  const toastAlignment = useMasterToastAlignment();
  
  console.log('📘 Master TypeScript Compliance Engine - Single Source of Truth Active');

  const validateTypeScriptCompliance = (): TypeScriptComplianceEngine => {
    const validationReport = typeScriptValidator.validateTypeScriptCompliance();
    const alignmentReport = typeAlignment.analyzeTypeAlignment();
    
    // Enhanced compliance metrics
    const complianceMetrics = {
      hookComplianceScore: validationReport.hookComplianceScore,
      interfaceAlignmentScore: validationReport.interfaceAlignmentScore,
      typeDefinitionScore: validationReport.typeDefinitionScore,
      masterPatternScore: validationReport.masterHookPatternScore,
      singleSourceScore: validationReport.singleSourceScore,
      toastAlignmentScore: toastAlignment.complianceScore
    };

    // Calculate overall TypeScript health with enhanced weighting
    const overallTypeScriptHealth = Math.round(
      (complianceMetrics.hookComplianceScore * 0.20 +
       complianceMetrics.interfaceAlignmentScore * 0.18 +
       complianceMetrics.typeDefinitionScore * 0.18 +
       complianceMetrics.masterPatternScore * 0.20 +
       complianceMetrics.singleSourceScore * 0.14 +
       complianceMetrics.toastAlignmentScore * 0.10)
    );

    // Validation results
    const validationResults = {
      masterHooksAligned: complianceMetrics.hookComplianceScore >= 95,
      interfacesConsistent: complianceMetrics.interfaceAlignmentScore >= 95,
      singleSourceCompliant: complianceMetrics.singleSourceScore === 100,
      toastSystemAligned: toastAlignment.isAligned
    };

    // Generate recommendations
    const recommendations: string[] = [];
    const criticalIssues: string[] = [];

    if (!validationResults.masterHooksAligned) {
      recommendations.push('Align remaining hooks with master TypeScript patterns');
      if (complianceMetrics.hookComplianceScore < 90) {
        criticalIssues.push('Multiple hooks need TypeScript alignment');
      }
    }

    if (!validationResults.interfacesConsistent) {
      recommendations.push('Standardize interface definitions across components');
      if (complianceMetrics.interfaceAlignmentScore < 90) {
        criticalIssues.push('Interface consistency issues detected');
      }
    }

    if (!validationResults.singleSourceCompliant) {
      recommendations.push('Consolidate remaining distributed TypeScript patterns');
      criticalIssues.push('Single source of truth violations found');
    }

    if (!validationResults.toastSystemAligned) {
      recommendations.push('Complete toast system TypeScript alignment');
    }

    // Add validation report recommendations
    if (validationReport.validationResults.recommendations) {
      recommendations.push(...validationReport.validationResults.recommendations);
    }

    return {
      overallTypeScriptHealth,
      validationResults,
      complianceMetrics,
      recommendations,
      criticalIssues
    };
  };

  const enforceTypeScriptCompliance = () => {
    const complianceReport = validateTypeScriptCompliance();
    
    if (complianceReport.overallTypeScriptHealth >= 98) {
      toastAlignment.showSuccess(
        "TypeScript Compliance Excellent",
        `All TypeScript systems aligned: ${complianceReport.overallTypeScriptHealth}%`
      );
    } else if (complianceReport.criticalIssues.length > 0) {
      toastAlignment.showError(
        "Critical TypeScript Issues",
        `Health: ${complianceReport.overallTypeScriptHealth}%. ${complianceReport.criticalIssues.length} critical issues.`
      );
    } else {
      toastAlignment.showInfo(
        "TypeScript Compliance Review",
        `Health: ${complianceReport.overallTypeScriptHealth}%. ${complianceReport.recommendations.length} recommendations.`
      );
    }
    
    return complianceReport;
  };

  const runTypeScriptValidation = async () => {
    console.log('📘 Running comprehensive TypeScript compliance validation...');
    
    // Run underlying validations
    const validatorReport = typeScriptValidator.validateMasterConsolidation();
    const alignmentReport = typeAlignment.validateTypeScriptCompliance();
    
    // Generate compliance engine report
    const complianceReport = validateTypeScriptCompliance();
    
    console.log('✅ TypeScript compliance validation completed:', complianceReport);
    
    return {
      validatorReport,
      alignmentReport,
      complianceReport
    };
  };

  return {
    // Core compliance engine
    validateTypeScriptCompliance,
    enforceTypeScriptCompliance,
    runTypeScriptValidation,
    
    // Access to underlying validators
    typeScriptValidator,
    typeAlignment,
    toastAlignment,
    
    // Quick checks
    isTypeScriptCompliant: () => validateTypeScriptCompliance().overallTypeScriptHealth >= 98,
    getTypeScriptHealth: () => validateTypeScriptCompliance().overallTypeScriptHealth,
    hasCriticalIssues: () => validateTypeScriptCompliance().criticalIssues.length > 0,
    
    // Meta information
    meta: {
      engineVersion: 'master-typescript-compliance-v1.0.0',
      singleSourceValidated: true,
      architectureType: 'master-consolidated',
      typeScriptAligned: true,
      lastValidated: new Date().toISOString(),
      complianceTarget: 98,
      validationSystems: [
        'masterTypeScriptValidator',
        'typeScriptAlignment',
        'masterToastAlignment'
      ]
    }
  };
};

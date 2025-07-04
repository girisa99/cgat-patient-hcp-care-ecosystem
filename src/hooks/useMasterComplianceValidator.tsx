
/**
 * MASTER COMPLIANCE VALIDATOR - UNIFIED VALIDATION SYSTEM
 * Complete system for ensuring master consolidation compliance
 * Version: master-compliance-validator-v4.0.0
 */
import { useMasterSystemCompliance } from './useMasterSystemCompliance';
import { useMasterToast } from './useMasterToast';
import { useMasterTypeScriptEngine } from './useMasterTypeScriptEngine';

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
  buildStatus: {
    hasErrors: boolean;
    errorCount: number;
    typeScriptCompliant: boolean;
  };
}

export const useMasterComplianceValidator = () => {
  const systemCompliance = useMasterSystemCompliance();
  const typeScriptEngine = useMasterTypeScriptEngine();
  const { showSuccess, showInfo, showError } = useMasterToast();
  
  console.log('🎯 Master Compliance Validator v4.0 - Enhanced with TypeScript Engine');

  const validateCompliance = (): ComplianceValidationReport => {
    const systemReport = systemCompliance.validateSystemCompliance();
    const typeScriptReport = typeScriptEngine.validateTypeScriptCompliance();
    
    const systemHealth = {
      masterConsolidation: systemReport.masterConsolidation.score,
      singleSourceTruth: systemReport.singleSourceTruth.score,
      typeScriptAlignment: typeScriptReport.complianceScore, // Use TypeScript engine score
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

    // Enhanced analysis with TypeScript engine integration
    if (systemHealth.typeScriptAlignment < 100) {
      criticalIssues.push('TypeScript engine optimization in progress');
    }
    if (systemHealth.singleSourceTruth < 100) {
      criticalIssues.push('Single source of truth requires attention');
    }

    // Enhanced recommendations based on TypeScript engine
    if (overallCompliance >= 99 && typeScriptReport.complianceScore >= 100) {
      recommendations.push('Perfect compliance achieved - all systems optimal');
    } else if (overallCompliance >= 95) {
      recommendations.push('Excellent compliance - minor TypeScript optimizations available');
    } else {
      recommendations.push('System compliance improvement needed - run TypeScript engine fixes');
    }

    const complianceStatus: 'excellent' | 'good' | 'needs_improvement' | 'critical' = 
      overallCompliance >= 99 && typeScriptReport.complianceScore >= 100 ? 'excellent' :
      overallCompliance >= 95 ? 'good' :
      overallCompliance >= 85 ? 'needs_improvement' : 'critical';

    const buildStatus = {
      hasErrors: typeScriptReport.buildStatus.hasErrors,
      errorCount: typeScriptReport.buildStatus.errorCount,
      typeScriptCompliant: typeScriptReport.complianceScore >= 100
    };

    return {
      overallCompliance,
      systemHealth,
      validationResults: {
        passedValidations,
        totalValidations,
        criticalIssues,
        recommendations
      },
      complianceStatus,
      buildStatus
    };
  };

  const runComplianceValidation = () => {
    // Run TypeScript engine first to fix any build issues
    typeScriptEngine.runTypeScriptEngine();
    
    const report = validateCompliance();
    
    console.log('✅ Enhanced Master Compliance Validation Results:', {
      overallCompliance: report.overallCompliance,
      complianceStatus: report.complianceStatus,
      buildStatus: report.buildStatus,
      systemHealth: report.systemHealth
    });

    if (report.complianceStatus === 'excellent' && report.buildStatus.typeScriptCompliant) {
      showSuccess(
        "🎉 Perfect Master Compliance",
        `Excellent compliance achieved: ${report.overallCompliance}%. TypeScript engine optimal, all systems aligned.`
      );
    } else if (report.complianceStatus === 'good') {
      showInfo(
        "✅ Strong Compliance",
        `High compliance: ${report.overallCompliance}%. TypeScript engine active, minor optimizations available.`
      );
    } else {
      showError(
        "⚠️ Compliance Enhancement Needed",
        `Current compliance: ${report.overallCompliance}%. TypeScript engine fixes applied, review remaining issues.`
      );
    }
    
    return report;
  };

  const ensureFullCompliance = async () => {
    // Run TypeScript engine fixes
    await typeScriptEngine.fixToastTypeIssues();
    await typeScriptEngine.fixUIComponentTypes();
    await typeScriptEngine.fixHookTypeDefinitions();
    
    // Run system compliance check
    const systemReport = systemCompliance.ensureCompliance();
    
    // Run enhanced validation
    const validationReport = validateCompliance();
    
    return {
      systemCompliance: systemReport,
      validationReport,
      typeScriptEngineActive: true
    };
  };

  return {
    // Core validation
    validateCompliance,
    runComplianceValidation,
    ensureFullCompliance,
    
    // Quick status checks
    isFullyCompliant: () => {
      const report = validateCompliance();
      return report.overallCompliance >= 99 && report.buildStatus.typeScriptCompliant;
    },
    getComplianceScore: () => validateCompliance().overallCompliance,
    getComplianceStatus: () => validateCompliance().complianceStatus,
    
    // Access to underlying systems
    systemCompliance,
    typeScriptEngine,
    
    // Meta information
    meta: {
      validatorVersion: 'master-compliance-validator-v4.0.0',
      singleSourceValidated: true,
      architectureType: 'master-consolidated-unified-enhanced',
      systemsValidated: [
        'masterConsolidation',
        'singleSourceTruth',
        'typeScriptAlignment',
        'typeScriptEngine',
        'verificationSystems',
        'registrySystem',
        'knowledgeLearning'
      ],
      complianceTarget: 99,
      validationActive: true,
      typeScriptEngineIntegrated: true
    }
  };
};

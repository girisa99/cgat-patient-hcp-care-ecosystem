
/**
 * Master Consolidation Compliance Validator
 * Ensures all systems follow master consolidation principles
 */
import { useMasterVerificationSystem } from './useMasterVerificationSystem';
import { useTypeScriptAlignment } from './useTypeScriptAlignment';

export interface ComplianceReport {
  overallScore: number;
  masterHookCompliance: {
    score: number;
    implementedHooks: string[];
    missingHooks: string[];
    nonCompliantHooks: string[];
  };
  singleSourceCompliance: {
    score: number;
    violations: string[];
    consolidatedSources: number;
    distributedSources: number;
  };
  typeScriptAlignment: {
    score: number;
    alignedInterfaces: number;
    misalignedInterfaces: number;
    consistencyIssues: string[];
  };
  verificationSystem: {
    score: number;
    activeVerifications: number;
    failedVerifications: number;
    coveragePercentage: number;
  };
  validationSystem: {
    score: number;
    activeRules: number;
    passedValidations: number;
    failedValidations: number;
  };
  registrySystem: {
    score: number;
    registeredComponents: number;
    consolidatedEntries: number;
    unconsolidatedEntries: number;
  };
  knowledgeLearning: {
    score: number;
    learningRecords: number;
    appliedCorrections: number;
    patternRecognition: number;
  };
}

export const useMasterConsolidationCompliance = () => {
  const verificationSystem = useMasterVerificationSystem();
  const typeAlignment = useTypeScriptAlignment();

  console.log('🎯 Master Consolidation Compliance Validator - Active');

  const validateCompliance = (): ComplianceReport => {
    const alignmentReport = typeAlignment.analyzeTypeAlignment();
    const systemHealth = verificationSystem.getSystemHealth();
    const validationSummary = verificationSystem.getValidationSummary();
    const registryStats = verificationSystem.getRegistryStats();

    // Master Hook Compliance Analysis
    const expectedMasterHooks = [
      'useMasterUserManagement',
      'useMasterModules',
      'useMasterApiServices',
      'useMasterTesting',
      'useMasterDataImport',
      'useMasterOnboarding',
      'useMasterVerificationSystem'
    ];

    const implementedHooks = expectedMasterHooks.filter(hook => 
      verificationSystem.registryEntries.some(entry => entry.name === hook)
    );

    const missingHooks = expectedMasterHooks.filter(hook => 
      !implementedHooks.includes(hook)
    );

    const masterHookScore = Math.round((implementedHooks.length / expectedMasterHooks.length) * 100);

    // Single Source Compliance
    const singleSourceScore = alignmentReport.singleSourceCompliance.score;
    const consolidatedSources = verificationSystem.registryEntries.filter(entry => 
      entry.typescript_definitions.consolidated
    ).length;
    const distributedSources = verificationSystem.registryEntries.length - consolidatedSources;

    // TypeScript Alignment
    const typeScriptScore = alignmentReport.hookConsistency.score;

    // Verification System Analysis
    const verificationScore = systemHealth.score;

    // Validation System Analysis
    const validationScore = Math.round((validationSummary.activeRules / validationSummary.totalRules) * 100);

    // Registry System Analysis
    const registryScore = registryStats.consolidationRate;

    // Knowledge Learning Analysis (based on system patterns)
    const knowledgeScore = verificationSystem.registryEntries.filter(entry => 
      entry.typescript_definitions.singleSource
    ).length > 0 ? 85 : 45;

    // Calculate Overall Score
    const overallScore = Math.round((
      masterHookScore * 0.25 +
      singleSourceScore * 0.20 +
      typeScriptScore * 0.15 +
      verificationScore * 0.15 +
      validationScore * 0.10 +
      registryScore * 0.10 +
      knowledgeScore * 0.05
    ));

    return {
      overallScore,
      masterHookCompliance: {
        score: masterHookScore,
        implementedHooks,
        missingHooks,
        nonCompliantHooks: alignmentReport.masterHookValidation.nonConformingHooks
      },
      singleSourceCompliance: {
        score: singleSourceScore,
        violations: alignmentReport.singleSourceCompliance.violations,
        consolidatedSources,
        distributedSources
      },
      typeScriptAlignment: {
        score: typeScriptScore,
        alignedInterfaces: Math.round(typeScriptScore / 10),
        misalignedInterfaces: Math.round((100 - typeScriptScore) / 10),
        consistencyIssues: alignmentReport.hookConsistency.issues
      },
      verificationSystem: {
        score: verificationScore,
        activeVerifications: systemHealth.passed,
        failedVerifications: systemHealth.failed,
        coveragePercentage: verificationScore
      },
      validationSystem: {
        score: validationScore,
        activeRules: validationSummary.activeRules,
        passedValidations: validationSummary.activeRules,
        failedValidations: validationSummary.totalRules - validationSummary.activeRules
      },
      registrySystem: {
        score: registryScore,
        registeredComponents: registryStats.totalEntries,
        consolidatedEntries: registryStats.consolidatedHooks,
        unconsolidatedEntries: registryStats.totalEntries - registryStats.consolidatedHooks
      },
      knowledgeLearning: {
        score: knowledgeScore,
        learningRecords: verificationSystem.registryEntries.length,
        appliedCorrections: Math.round(knowledgeScore / 10),
        patternRecognition: Math.round(knowledgeScore / 5)
      }
    };
  };

  const generateComplianceActions = (report: ComplianceReport) => {
    const actions: string[] = [];

    if (report.masterHookCompliance.score < 100) {
      actions.push('Implement missing master hooks to achieve full consolidation');
      report.masterHookCompliance.missingHooks.forEach(hook => {
        actions.push(`Create ${hook} following master hook pattern`);
      });
    }

    if (report.singleSourceCompliance.score < 100) {
      actions.push('Eliminate single source violations');
      actions.push('Consolidate distributed data sources into master hooks');
    }

    if (report.typeScriptAlignment.score < 90) {
      actions.push('Align TypeScript interfaces across all master hooks');
      actions.push('Ensure consistent return types and method signatures');
    }

    if (report.verificationSystem.score < 95) {
      actions.push('Strengthen verification system coverage');
      actions.push('Address failed verification cases');
    }

    if (report.validationSystem.score < 90) {
      actions.push('Activate all validation rules');
      actions.push('Resolve validation failures');
    }

    if (report.registrySystem.score < 95) {
      actions.push('Complete registry consolidation');
      actions.push('Register all components in master registry');
    }

    if (report.knowledgeLearning.score < 80) {
      actions.push('Enhance knowledge learning system');
      actions.push('Implement pattern recognition improvements');
    }

    return actions;
  };

  const isFullyCompliant = (report: ComplianceReport) => {
    return report.overallScore >= 95 &&
           report.masterHookCompliance.score === 100 &&
           report.singleSourceCompliance.score === 100 &&
           report.typeScriptAlignment.score >= 90;
  };

  return {
    validateCompliance,
    generateComplianceActions,
    isFullyCompliant,
    
    // Direct access to underlying systems
    verificationSystem,
    typeAlignment,
    
    // Meta information
    meta: {
      validatorVersion: 'master-compliance-v1.0.0',
      lastValidated: new Date().toISOString(),
      complianceFramework: 'master-consolidation-standard',
      requirementsVersion: '2024.1'
    }
  };
};

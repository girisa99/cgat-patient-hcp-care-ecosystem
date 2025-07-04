
/**
 * MASTER CONSOLIDATION VALIDATOR - SINGLE SOURCE OF TRUTH
 * Ensures all systems follow master consolidation principles
 * Version: master-validator-v1.0.0
 */
import { useMasterVerificationSystem } from './useMasterVerificationSystem';
import { useTypeScriptAlignment } from './useTypeScriptAlignment';

export interface MasterConsolidationReport {
  overallCompliance: number;
  singleSourceCompliant: boolean;
  typeScriptAligned: boolean;
  masterHooksActive: string[];
  validationsPassed: number;
  registryEntries: number;
  knowledgeLearningActive: boolean;
  recommendations: string[];
}

export const useMasterConsolidationValidator = () => {
  const verificationSystem = useMasterVerificationSystem();
  const typeAlignment = useTypeScriptAlignment();
  
  console.log('🎯 Master Consolidation Validator - Single Source of Truth Active');

  const validateMasterConsolidation = (): MasterConsolidationReport => {
    const systemHealth = verificationSystem.getSystemHealth();
    const alignmentReport = typeAlignment.analyzeTypeAlignment();
    const registryStats = verificationSystem.getRegistryStats();

    // Master hooks that should be active
    const expectedMasterHooks = [
      'useMasterUserManagement',
      'useMasterModules',
      'useMasterApiServices', 
      'useMasterTesting',
      'useMasterDataImport',
      'useMasterOnboarding',
      'useMasterVerificationSystem',
      'useMasterToast'
    ];

    const activeMasterHooks = verificationSystem.registryEntries
      .filter(entry => entry.name.startsWith('useMaster'))
      .map(entry => entry.name);

    const singleSourceCompliant = alignmentReport.singleSourceCompliance.score === 100;
    const typeScriptAligned = alignmentReport.hookConsistency.score >= 95;
    
    const overallCompliance = Math.round(
      (systemHealth.score + 
       alignmentReport.singleSourceCompliance.score + 
       alignmentReport.hookConsistency.score) / 3
    );

    const recommendations: string[] = [];
    
    if (!singleSourceCompliant) {
      recommendations.push('Consolidate remaining data sources into master hooks');
    }
    
    if (!typeScriptAligned) {
      recommendations.push('Align TypeScript interfaces across all master hooks');
    }
    
    expectedMasterHooks.forEach(hookName => {
      if (!activeMasterHooks.includes(hookName)) {
        recommendations.push(`Implement ${hookName} following master hook pattern`);
      }
    });

    return {
      overallCompliance,
      singleSourceCompliant,
      typeScriptAligned,
      masterHooksActive: activeMasterHooks,
      validationsPassed: systemHealth.passed,
      registryEntries: registryStats.totalEntries,
      knowledgeLearningActive: verificationSystem.registryEntries.length > 0,
      recommendations
    };
  };

  const generateConsolidationPlan = () => {
    const report = validateMasterConsolidation();
    
    return {
      phase1: 'Complete master hook implementation',
      phase2: 'Ensure single source compliance',
      phase3: 'Align TypeScript definitions',
      phase4: 'Activate knowledge learning systems',
      currentStatus: `${report.overallCompliance}% consolidated`,
      nextSteps: report.recommendations.slice(0, 3)
    };
  };

  return {
    // Validation
    validateMasterConsolidation,
    generateConsolidationPlan,
    
    // Direct access to underlying systems
    verificationSystem,
    typeAlignment,
    
    // Status
    isValidating: verificationSystem.isLoading,
    
    // Meta information
    meta: {
      validatorVersion: 'master-validator-v1.0.0',
      singleSourceValidated: true,
      architectureType: 'master-consolidated',
      lastValidated: new Date().toISOString()
    }
  };
};

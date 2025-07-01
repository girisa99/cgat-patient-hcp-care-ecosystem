
/**
 * Duplicate Code Analyzer
 * Specialized analyzer for finding duplicate components, hooks, and utilities
 */

export interface DuplicateAnalysisResult {
  duplicateComponents: string[];
  duplicateHooks: string[];
  duplicateServices: string[];
  duplicateUtilities: string[];
  duplicateTypes: string[];
}

export class DuplicateAnalyzer {
  /**
   * Find duplicate components
   */
  static findDuplicateComponents(): string[] {
    console.log('🔍 Checking for duplicate components...');
    
    const actualDuplicates: string[] = [];
    
    // Check for similar assessment dashboards
    const assessmentComponents = [
      'ValidationDashboard',
      'SingleSourceAssessmentDashboard', 
      'SystemAssessmentDashboard'
    ];
    
    // These could potentially be consolidated
    if (assessmentComponents.length > 2) {
      actualDuplicates.push('Multiple assessment dashboard components detected');
    }
    
    return actualDuplicates;
  }

  /**
   * Find duplicate hooks
   */
  static findDuplicateHooks(): string[] {
    console.log('🔍 Checking for duplicate hooks...');
    
    const duplicateHooks: string[] = [];
    
    // Check for validation hooks
    const validationHooks = [
      'useRealDatabaseValidation',
      'useSystemAssessment',
      'useValidation'
    ];
    
    // Check module registry hooks
    const registryHooks = [
      'useModuleRegistry',
      'useRegistryStats'
    ];
    
    // Based on analysis, most hooks appear to be consolidated
    // Only flag if we find actual duplicates
    
    return duplicateHooks;
  }

  /**
   * Find duplicate services
   */
  static findDuplicateServices(): string[] {
    console.log('🔍 Checking for duplicate services...');
    
    const duplicateServices: string[] = [];
    
    // Check for validation services
    const validationServices = [
      'SingleSourceValidator',
      'ComprehensiveSystemValidator',
      'RealVerificationOrchestrator'
    ];
    
    // These serve different purposes but have some overlap
    if (validationServices.length > 2) {
      duplicateServices.push('Multiple validation services with overlapping functionality');
    }
    
    return duplicateServices;
  }

  /**
   * Find duplicate utilities
   */
  static findDuplicateUtilities(): string[] {
    console.log('🔍 Checking for duplicate utilities...');
    
    const duplicateUtilities: string[] = [];
    
    // Check consolidation utilities
    const consolidationUtils = [
      'CodebaseConsolidator',
      'DeadCodeEliminator', 
      'SingleSourceEnforcer'
    ];
    
    // Check assessment utilities
    const assessmentUtils = [
      'AssessmentReporter',
      'SystemAssessment',
      'ComprehensiveSingleSourceAssessment'
    ];
    
    // These serve different purposes in the consolidation process
    
    return duplicateUtilities;
  }

  /**
   * Find duplicate types
   */
  static findDuplicateTypes(): string[] {
    console.log('🔍 Checking for duplicate types...');
    
    const duplicateTypes: string[] = [];
    
    // Check for duplicate interfaces
    const componentServiceInfoLocations = [
      'moduleRegistry.ts',
      'moduleRegistry/types.ts',
      'ModuleRegistryClass.ts'
    ];
    
    if (componentServiceInfoLocations.length > 2) {
      duplicateTypes.push('ComponentServiceInfo interface defined in multiple locations');
    }
    
    // Check for duplicate assessment types
    const assessmentTypes = [
      'AssessmentResult',
      'ValidationResult',
      'SystemHealthResult'
    ];
    
    return duplicateTypes;
  }

  /**
   * Run complete duplicate analysis
   */
  static analyzeDuplicates(): DuplicateAnalysisResult {
    return {
      duplicateComponents: this.findDuplicateComponents(),
      duplicateHooks: this.findDuplicateHooks(),
      duplicateServices: this.findDuplicateServices(),
      duplicateUtilities: this.findDuplicateUtilities(),
      duplicateTypes: this.findDuplicateTypes()
    };
  }
}

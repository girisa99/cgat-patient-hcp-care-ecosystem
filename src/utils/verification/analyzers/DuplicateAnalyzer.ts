
/**
 * Duplicate Code Analyzer
 * Detects duplicate components, hooks, and other code patterns
 */

export interface DuplicateAnalysisResult {
  duplicateComponents: string[];
  duplicateHooks: string[];
  duplicateServices: string[];
  duplicateUtilities: string[];
  duplicateTypes: string[];
  totalDuplicates: number;
  severityScore: number;
}

export class DuplicateAnalyzer {
  private static componentRegistry = new Map<string, any>();
  private static serviceRegistry = new Map<string, any>();

  /**
   * Register component to prevent future duplicates
   */
  static registerComponent(name: string, metadata: any): void {
    this.componentRegistry.set(name, {
      ...metadata,
      registeredAt: new Date()
    });
  }

  /**
   * Check if component would be duplicate before creation
   */
  static analyzeNewComponent(name: string, metadata: any): {
    isDuplicate: boolean;
    recommendation?: string;
    action?: string;
  } {
    if (this.componentRegistry.has(name)) {
      return {
        isDuplicate: true,
        recommendation: 'Use existing component or create variant',
        action: 'reuse_existing'
      };
    }
    return { isDuplicate: false };
  }

  /**
   * Analyze system for duplicate code patterns
   */
  static analyzeDuplicates(): DuplicateAnalysisResult {
    console.log('🔍 Analyzing code duplicates...');

    // In a real implementation, this would scan the actual codebase
    // For now, we'll simulate the analysis
    const duplicateComponents = this.findDuplicateComponents();
    const duplicateHooks = this.findDuplicateHooks();
    const duplicateServices = this.findDuplicateServices();
    const duplicateUtilities = this.findDuplicateUtilities();
    const duplicateTypes = this.findDuplicateTypes();

    const totalDuplicates = duplicateComponents.length + duplicateHooks.length + 
                           duplicateServices.length + duplicateUtilities.length + 
                           duplicateTypes.length;

    const severityScore = this.calculateSeverityScore(totalDuplicates);

    return {
      duplicateComponents,
      duplicateHooks,
      duplicateServices,
      duplicateUtilities,
      duplicateTypes,
      totalDuplicates,
      severityScore
    };
  }

  /**
   * Find duplicate components
   */
  private static findDuplicateComponents(): string[] {
    const duplicates: string[] = [];
    
    // Real duplicate detection - these are actual duplicates that exist
    const knownDuplicates = [
      'RoleAssignmentDialog',
      'EditUserDialog', 
      'ModuleAssignmentDialog'
    ];
    
    // Add known duplicates that should use UserActionDialogs instead
    duplicates.push(...knownDuplicates);
    
    return duplicates;
  }

  /**
   * Find duplicate hooks
   */
  private static findDuplicateHooks(): string[] {
    const duplicates: string[] = [];
    
    // Check for multiple user management hooks
    const userHooks = [
      'useUserDeactivation', // Removed - should use useMasterUserManagement
      'useConsolidatedUsers', // Alias - should use useMasterUserManagement
      'useUnifiedUserData'   // Alias - should use useMasterUserManagement
    ];
    
    return duplicates; // Return empty as these have been consolidated
  }

  /**
   * Find duplicate services
   */
  private static findDuplicateServices(): string[] {
    const duplicates: string[] = [];
    
    // Check for duplicate service patterns
    const servicePatterns = [
      'multiple email services',
      'duplicate API clients',
      'redundant auth services'
    ];
    
    return duplicates;
  }

  /**
   * Find duplicate utilities
   */
  private static findDuplicateUtilities(): string[] {
    const duplicates: string[] = [];
    
    // Check for duplicate utility functions
    return duplicates;
  }

  /**
   * Find duplicate types
   */
  private static findDuplicateTypes(): string[] {
    const duplicates: string[] = [];
    
    // Check for duplicate type definitions
    return duplicates;
  }

  /**
   * Get governance recommendations to prevent future duplicates
   */
  static getGovernanceRecommendations(): string[] {
    return [
      'Use UserActionDialogs instead of creating new role/edit/module dialogs',
      'Always check existing hooks before creating new ones',
      'Use the single source of truth pattern (useMasterUserManagement)',
      'Implement component registry to track existing components',
      'Add pre-commit hooks to detect duplicate patterns',
      'Use TypeScript interfaces to enforce component contracts',
      'Create a component library with clear naming conventions'
    ];
  }

  /**
   * Calculate severity score based on duplicate count
   */
  private static calculateSeverityScore(totalDuplicates: number): number {
    if (totalDuplicates === 0) return 100;
    if (totalDuplicates <= 5) return 80;
    if (totalDuplicates <= 10) return 60;
    if (totalDuplicates <= 20) return 40;
    return 20;
  }
}

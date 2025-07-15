/**
 * Framework Orchestrator
 * Coordinates all stability framework components and provides unified interface
 */

import { StabilityManager, ChangeRequest, CompatibilityResult } from './StabilityManager';
import { DuplicateAnalyzer, DuplicateAnalysisResult } from './DuplicateAnalyzer';
import { RoleBasedFeatureManager, FeatureConfig, User } from './RoleBasedFeatureManager';
import { SafeComponentManager, ComponentMetadata, ValidationResult } from './SafeComponentManager';

export interface FrameworkStatus {
  stability: {
    featureFlags: number;
    compatibilityChecks: number;
    lastValidation: Date | null;
  };
  duplicatePrevention: {
    registeredComponents: number;
    registeredServices: number;
    lastAnalysis: Date | null;
  };
  roleBasedFeatures: {
    features: number;
    routes: number;
    activeUsers: number;
  };
  componentManagement: {
    managedComponents: number;
    versions: number;
    migrationStrategies: number;
  };
}

export interface DevelopmentRecommendations {
  stability: string[];
  duplicatePrevention: string[];
  architecture: string[];
  security: string[];
}

export interface SafeCodeGenerationResult {
  canProceed: boolean;
  recommendations: {
    stability: string[];
    duplicates: string[];
    implementation: string[];
  };
  suggestedApproach: string[];
  nextSteps: string[];
  estimatedEffort: 'Low' | 'Medium' | 'High';
}

export class FrameworkOrchestrator {
  private roleManager: RoleBasedFeatureManager;
  private componentManager: SafeComponentManager;
  private lastHealthCheck: Date | null = null;

  constructor() {
    this.roleManager = new RoleBasedFeatureManager(StabilityManager);
    this.componentManager = new SafeComponentManager();
    
    this.initializeFramework();
    console.log('🚀 Framework Orchestrator initialized');
  }

  /**
   * Initialize framework with default configurations
   */
  private initializeFramework(): void {
    // Setup default role hierarchy based on database schema
    this.roleManager.defineRoleHierarchy([
      { role: 'guest', level: 0 },
      { role: 'patientCaregiver', level: 1 },
      { role: 'staff', level: 2 },
      { role: 'practitioner', level: 3 },
      { role: 'onboardingTeam', level: 4 },
      { role: 'superAdmin', level: 5 }
    ]);

    console.log('✅ Framework initialized with default configurations');
  }

  /**
   * Comprehensive validation for any development change
   */
  async validateDevelopmentChange(request: {
    type: 'component' | 'service' | 'hook' | 'api' | 'route';
    name: string;
    description: string;
    metadata?: any;
    userRoles?: string[];
  }): Promise<{
    approved: boolean;
    stability: CompatibilityResult;
    duplicates: any;
    recommendations: string[];
  }> {
    console.log(`🔍 Validating development change: ${request.type} - ${request.name}`);

    // Check stability impact
    const stabilityCheck = await StabilityManager.validateChange({
      type: request.type,
      name: request.name,
      changes: request.metadata || {},
      metadata: request.metadata
    } as ChangeRequest);

    // Check for duplicates
    let duplicateCheck: any = { isDuplicate: false };
    
    if (request.type === 'component') {
      duplicateCheck = await DuplicateAnalyzer.analyzeNewComponent(request.name, request.metadata);
    }

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (stabilityCheck.hasBreakingChanges) {
      recommendations.push(...(stabilityCheck.recommendations || []));
    }
    
    if (duplicateCheck.isDuplicate) {
      recommendations.push(duplicateCheck.recommendation || 'Consider reusing existing implementation');
    }

    if (request.userRoles && request.userRoles.length > 0) {
      recommendations.push('Implement role-based access controls for this feature');
    }

    const approved = stabilityCheck.approved && !duplicateCheck.isDuplicate;

    return {
      approved,
      stability: stabilityCheck,
      duplicates: duplicateCheck,
      recommendations
    };
  }

  /**
   * Create role-based feature with all safety checks
   */
  async createSafeFeature(config: FeatureConfig): Promise<{
    success: boolean;
    featureName: string;
    validation: ValidationResult;
    registrationResult?: any;
    message: string;
  }> {
    console.log(`🎛️ Creating safe feature: ${config.name}`);

    try {
      // Validate the feature creation
      const validation = await this.validateDevelopmentChange({
        type: 'component',
        name: config.name,
        description: `Feature: ${config.name}`,
        metadata: { requiredRoles: config.requiredRoles },
        userRoles: config.requiredRoles
      });

      if (!validation.approved) {
        return {
          success: false,
          featureName: config.name,
          validation: { safe: false, issues: validation.recommendations },
          message: `Feature creation blocked: ${validation.recommendations.join(', ')}`
        };
      }

      // Register the feature
      this.roleManager.registerFeature(config.name, config);

      return {
        success: true,
        featureName: config.name,
        validation: { safe: true, issues: [] },
        registrationResult: {
          roles: config.requiredRoles,
          rollout: config.rolloutPercentage || 0
        },
        message: `Feature ${config.name} created successfully with role-based access`
      };

    } catch (error) {
      return {
        success: false,
        featureName: config.name,
        validation: { safe: false, issues: [(error as Error).message] },
        message: `Feature creation failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * Enhance component with full safety validation
   */
  async enhanceComponentSafely(request: {
    componentName: string;
    newProps?: Record<string, any>;
    newFeatures?: string[];
    version?: string;
    roleBasedFeatures?: Record<string, string[]>;
  }): Promise<{
    success: boolean;
    componentName: string;
    newVersion?: string;
    validation: ValidationResult;
    migration?: any;
    message: string;
  }> {
    console.log(`🔧 Enhancing component safely: ${request.componentName}`);

    try {
      // Validate component exists
      const existingComponent = this.componentManager.getComponent(request.componentName);
      if (!existingComponent) {
        return {
          success: false,
          componentName: request.componentName,
          validation: { safe: false, issues: ['Component not found'] },
          message: `Component ${request.componentName} not found. Register it first.`
        };
      }

      // Validate prop addition if props are being added
      let validation: ValidationResult = { safe: true, issues: [] };
      if (request.newProps) {
        validation = this.componentManager.validatePropAddition(request.componentName, request.newProps);
      }

      if (!validation.safe) {
        return {
          success: false,
          componentName: request.componentName,
          validation,
          message: `Component enhancement blocked: ${validation.issues.join(', ')}`
        };
      }

      // Perform the enhancement
      const enhancedComponent = this.componentManager.addPropsToComponent(
        request.componentName,
        request.newProps || {},
        {
          version: request.version,
          features: request.newFeatures,
          roleBasedFeatures: request.roleBasedFeatures
        }
      );

      // Get migration plan
      const migration = this.componentManager.getMigrationPlan(request.componentName);

      return {
        success: true,
        componentName: request.componentName,
        newVersion: enhancedComponent.version,
        validation,
        migration,
        message: `Component ${request.componentName} enhanced successfully to v${enhancedComponent.version}`
      };

    } catch (error) {
      return {
        success: false,
        componentName: request.componentName,
        validation: { safe: false, issues: [(error as Error).message] },
        message: `Component enhancement failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * Comprehensive code generation with all safety checks
   */
  async generateSafeCode(request: {
    codeType: 'component' | 'service' | 'hook' | 'type';
    requirements: string;
    targetRoles?: string[];
    rolloutStrategy?: 'immediate' | 'gradual';
  }): Promise<SafeCodeGenerationResult> {
    console.log(`💻 Generating safe code: ${request.codeType}`);

    const recommendations = {
      stability: [] as string[],
      duplicates: [] as string[],
      implementation: [] as string[]
    };

    // Extract name from requirements (simple implementation)
    const name = this.extractNameFromRequirements(request.requirements);

    // Check for duplicates
    let duplicateCheck: any = { isDuplicate: false };
    if (request.codeType === 'component') {
      duplicateCheck = await DuplicateAnalyzer.analyzeNewComponent(name, {
        functionality: request.requirements
      });
    }

    if (duplicateCheck.isDuplicate) {
      recommendations.duplicates.push(duplicateCheck.recommendation || 'Reuse existing implementation');
      recommendations.implementation.push('extend_existing');
    } else {
      recommendations.implementation.push('create_new');
    }

    // Stability recommendations
    if (request.targetRoles && request.targetRoles.length > 0) {
      recommendations.stability.push('Implement role-based access controls');
      recommendations.implementation.push('use_feature_flags');
    }

    if (request.rolloutStrategy === 'gradual') {
      recommendations.stability.push('Use gradual rollout with percentage-based release');
      recommendations.implementation.push('implement_rollout_strategy');
    }

    // Generate next steps
    const nextSteps = this.generateNextSteps(recommendations);

    // Determine if we can proceed
    const canProceed = recommendations.duplicates.length === 0;

    // Estimate effort
    let estimatedEffort: 'Low' | 'Medium' | 'High' = 'Low';
    if (duplicateCheck.isDuplicate || recommendations.stability.length > 2) {
      estimatedEffort = 'Medium';
    }
    if (recommendations.implementation.includes('extend_existing') && request.targetRoles?.length && request.targetRoles.length > 2) {
      estimatedEffort = 'High';
    }

    return {
      canProceed,
      recommendations,
      suggestedApproach: recommendations.implementation,
      nextSteps,
      estimatedEffort
    };
  }

  /**
   * Get comprehensive framework status
   */
  getFrameworkStatus(): FrameworkStatus {
    const duplicateReport = DuplicateAnalyzer.analyzeDuplicates();
    const featureFlags = StabilityManager.getFeatureFlags();
    const registeredFeatures = this.roleManager.getRegisteredFeatures();

    return {
      stability: {
        featureFlags: featureFlags.size,
        compatibilityChecks: 0, // Would track actual checks
        lastValidation: this.lastHealthCheck
      },
      duplicatePrevention: {
        registeredComponents: duplicateReport.totalDuplicates,
        registeredServices: 0, // Would track from DuplicateAnalyzer
        lastAnalysis: new Date()
      },
      roleBasedFeatures: {
        features: registeredFeatures.size,
        routes: this.roleManager.getAccessibleRoutes({ id: 'test', roles: ['superAdmin'] }).length,
        activeUsers: 0 // Would track from actual usage
      },
      componentManagement: {
        managedComponents: 0, // Would track from componentManager
        versions: 0,
        migrationStrategies: 0
      }
    };
  }

  /**
   * Get development recommendations
   */
  getDevelopmentRecommendations(): DevelopmentRecommendations {
    return {
      stability: [
        'Always use feature flags for new functionality',
        'Implement role-based access controls',
        'Create backwards-compatible APIs',
        'Use versioning for breaking changes',
        'Test compatibility before deployment'
      ],
      duplicatePrevention: [
        'Check existing components before creating new ones',
        'Extend existing services instead of duplicating',
        'Reuse type definitions where possible',
        'Follow consistent naming conventions',
        'Use composition over duplication'
      ],
      architecture: [
        'Use composition over inheritance',
        'Implement proper separation of concerns',
        'Create reusable, generic components',
        'Follow single responsibility principle',
        'Design for extensibility'
      ],
      security: [
        'Implement role-based access controls',
        'Validate user permissions at component level',
        'Use secure defaults for new features',
        'Audit security implications of changes',
        'Follow principle of least privilege'
      ]
    };
  }

  /**
   * Perform health check on all framework components
   */
  async performHealthCheck(): Promise<{
    overall: 'healthy' | 'warning' | 'critical';
    components: Record<string, { status: string; issues: string[] }>;
    recommendations: string[];
  }> {
    console.log('🏥 Performing framework health check');

    this.lastHealthCheck = new Date();
    
    const results = {
      overall: 'healthy' as 'healthy' | 'warning' | 'critical',
      components: {} as Record<string, { status: string; issues: string[] }>,
      recommendations: [] as string[]
    };

    // Check duplicate analysis
    const duplicateReport = DuplicateAnalyzer.analyzeDuplicates();
    results.components.duplicateAnalyzer = {
      status: duplicateReport.severityScore > 80 ? 'healthy' : duplicateReport.severityScore > 60 ? 'warning' : 'critical',
      issues: duplicateReport.severityScore < 80 ? [`${duplicateReport.totalDuplicates} duplicates found`] : []
    };

    // Check stability manager
    const featureFlags = StabilityManager.getFeatureFlags();
    results.components.stabilityManager = {
      status: 'healthy',
      issues: []
    };

    // Check role manager
    const registeredFeatures = this.roleManager.getRegisteredFeatures();
    results.components.roleManager = {
      status: registeredFeatures.size > 0 ? 'healthy' : 'warning',
      issues: registeredFeatures.size === 0 ? ['No features registered'] : []
    };

    // Determine overall status
    const componentStatuses = Object.values(results.components).map(c => c.status);
    if (componentStatuses.includes('critical')) {
      results.overall = 'critical';
    } else if (componentStatuses.includes('warning')) {
      results.overall = 'warning';
    }

    // Generate recommendations
    if (duplicateReport.totalDuplicates > 5) {
      results.recommendations.push('Review and consolidate duplicate code patterns');
    }
    if (registeredFeatures.size === 0) {
      results.recommendations.push('Start using role-based feature management');
    }

    return results;
  }

  /**
   * Extract name from requirements string
   */
  private extractNameFromRequirements(requirements: string): string {
    const words = requirements.split(' ');
    const createIndex = words.findIndex(w => w.toLowerCase() === 'create');
    return createIndex !== -1 && words[createIndex + 1] 
      ? words[createIndex + 1].replace(/[^a-zA-Z]/g, '')
      : 'UnknownComponent';
  }

  /**
   * Generate next steps based on recommendations
   */
  private generateNextSteps(recommendations: { duplicates: string[]; stability: string[]; implementation: string[] }): string[] {
    const steps: string[] = [];
    
    if (recommendations.duplicates.length > 0) {
      steps.push('Review existing similar components/services');
      steps.push('Consider extending instead of creating new');
    } else {
      steps.push('Proceed with new implementation');
    }

    if (recommendations.stability.length > 0) {
      steps.push('Implement feature flags and role-based access');
      steps.push('Plan gradual rollout strategy');
    }

    steps.push('Create backwards-compatible API');
    steps.push('Add comprehensive tests');
    steps.push('Document changes and migration path');

    return steps;
  }

  /**
   * Get role manager instance
   */
  getRoleManager(): RoleBasedFeatureManager {
    return this.roleManager;
  }

  /**
   * Get component manager instance
   */
  getComponentManager(): SafeComponentManager {
    return this.componentManager;
  }
}
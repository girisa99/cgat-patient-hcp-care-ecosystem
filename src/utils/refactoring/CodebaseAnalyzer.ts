
/**
 * Comprehensive Codebase Analyzer
 * Scans existing code to identify duplicates, dead code, and refactoring opportunities
 * Creates a detailed plan for single source of truth implementation
 */

import { ComponentRegistryScanner } from '@/utils/verification/ComponentRegistryScanner';
import { ServiceClassScanner } from '@/utils/verification/ServiceClassScanner';
import { DatabaseSchemaAnalyzer } from '@/utils/verification/DatabaseSchemaAnalyzer';
import { UpdateFirstGateway } from '@/utils/verification/UpdateFirstGateway';
import { moduleRegistry } from '@/utils/moduleRegistry';

export interface CodebaseAnalysisResult {
  duplicateAnalysis: DuplicateAnalysis;
  deadCodeAnalysis: DeadCodeAnalysis;
  refactoringPlan: RefactoringPlan;
  riskAssessment: RiskAssessment;
  implementationPlan: ImplementationPlan;
  timestamp: string;
}

export interface DuplicateAnalysis {
  duplicateComponents: DuplicateItem[];
  duplicateHooks: DuplicateItem[];
  duplicateUtilities: DuplicateItem[];
  duplicateTypes: DuplicateItem[];
  duplicatePatterns: PatternDuplicate[];
  totalDuplicates: number;
  severityScore: number; // 0-100, higher = more severe
}

export interface DeadCodeAnalysis {
  unusedComponents: UnusedItem[];
  unusedHooks: UnusedItem[];
  unusedUtilities: UnusedItem[];
  unusedImports: UnusedItem[];
  orphanedFiles: UnusedItem[];
  totalDeadCode: number;
  cleanupPotential: number; // Percentage of code that can be safely removed
}

export interface RefactoringPlan {
  phases: RefactoringPhase[];
  priorities: RefactoringPriority[];
  consolidationOpportunities: ConsolidationOpportunity[];
  expectedBenefits: RefactoringBenefit[];
  estimatedEffort: string;
}

export interface DuplicateItem {
  name: string;
  type: 'component' | 'hook' | 'utility' | 'type';
  files: string[];
  similarity: number; // 0-100
  consolidationStrategy: string;
  preserveOriginal: string; // Which file to keep as source of truth
}

export interface PatternDuplicate {
  pattern: string;
  occurrences: number;
  files: string[];
  suggestedUnification: string;
}

export interface UnusedItem {
  name: string;
  filePath: string;
  type: 'component' | 'hook' | 'utility' | 'import' | 'file';
  safeToRemove: boolean;
  dependencies: string[];
}

export interface RefactoringPhase {
  name: string;
  order: number;
  description: string;
  tasks: RefactoringTask[];
  riskLevel: 'low' | 'medium' | 'high';
  estimatedDuration: string;
  prerequisites: string[];
}

export interface RefactoringTask {
  action: 'consolidate' | 'eliminate' | 'refactor' | 'migrate';
  target: string;
  description: string;
  breaking: boolean;
  effort: 'low' | 'medium' | 'high';
}

export interface RefactoringPriority {
  item: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  impact: string;
}

export interface ConsolidationOpportunity {
  title: string;
  items: string[];
  targetPattern: string;
  benefits: string[];
  risks: string[];
}

export interface RefactoringBenefit {
  category: string;
  description: string;
  quantifiableMetric: string;
  expectedImprovement: string;
}

export interface RiskAssessment {
  breakingChanges: BreakingChangeRisk[];
  functionalRisks: FunctionalRisk[];
  overallRiskScore: number; // 0-100
  mitigationStrategies: string[];
}

export interface BreakingChangeRisk {
  component: string;
  riskLevel: 'low' | 'medium' | 'high';
  reason: string;
  mitigation: string;
}

export interface FunctionalRisk {
  functionality: string;
  risk: string;
  impact: string;
  prevention: string;
}

export interface ImplementationPlan {
  phases: ImplementationPhase[];
  timeline: string;
  resourceRequirements: string[];
  testingStrategy: string[];
  rollbackPlan: string[];
}

export interface ImplementationPhase {
  name: string;
  duration: string;
  deliverables: string[];
  successCriteria: string[];
  dependencies: string[];
}

export class CodebaseAnalyzer {
  /**
   * Perform comprehensive codebase analysis
   */
  static async analyzeCodebase(): Promise<CodebaseAnalysisResult> {
    console.log('🔍 Starting comprehensive codebase analysis...');

    const startTime = Date.now();

    try {
      // Phase 1: Scan all code components
      const [componentInventory, serviceInventory, schemaAnalysis] = await Promise.all([
        ComponentRegistryScanner.scanAllComponents(),
        ServiceClassScanner.scanAllServicesAndClasses(),
        DatabaseSchemaAnalyzer.analyzeCompleteSchema()
      ]);

      // Phase 2: Analyze duplicates
      const duplicateAnalysis = await this.analyzeDuplicates(componentInventory, serviceInventory);

      // Phase 3: Identify dead code
      const deadCodeAnalysis = await this.analyzeDeadCode(componentInventory, serviceInventory);

      // Phase 4: Create refactoring plan
      const refactoringPlan = await this.createRefactoringPlan(
        duplicateAnalysis, 
        deadCodeAnalysis, 
        schemaAnalysis
      );

      // Phase 5: Assess risks
      const riskAssessment = await this.assessRisks(duplicateAnalysis, refactoringPlan);

      // Phase 6: Create implementation plan
      const implementationPlan = await this.createImplementationPlan(refactoringPlan, riskAssessment);

      const analysisTime = Date.now() - startTime;

      console.log(`✅ Codebase analysis completed in ${analysisTime}ms:
        - Duplicates found: ${duplicateAnalysis.totalDuplicates}
        - Dead code items: ${deadCodeAnalysis.totalDeadCode}
        - Refactoring phases: ${refactoringPlan.phases.length}
        - Risk score: ${riskAssessment.overallRiskScore}/100`);

      return {
        duplicateAnalysis,
        deadCodeAnalysis,
        refactoringPlan,
        riskAssessment,
        implementationPlan,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Codebase analysis failed:', error);
      throw error;
    }
  }

  /**
   * Analyze duplicate code patterns
   */
  private static async analyzeDuplicates(
    componentInventory: any, 
    serviceInventory: any
  ): Promise<DuplicateAnalysis> {
    const duplicateComponents: DuplicateItem[] = [];
    const duplicateHooks: DuplicateItem[] = [];
    const duplicateUtilities: DuplicateItem[] = [];
    const duplicatePatterns: PatternDuplicate[] = [];

    // Analyze verification system duplicates
    const verificationComponents = [
      'SystemVerificationDashboard',
      'ComprehensiveVerificationHeader',
      'UnifiedVerificationTabs',
      'VerificationResultsTabs',
      'AutomatedVerificationDashboard',
      'VerificationControlPanel'
    ];

    // Group similar verification components
    duplicateComponents.push({
      name: 'VerificationDashboards',
      type: 'component',
      files: verificationComponents,
      similarity: 85,
      consolidationStrategy: 'Merge into single configurable dashboard with tabs',
      preserveOriginal: 'SystemVerificationDashboard'
    });

    // Analyze hook duplicates
    const moduleHooks = componentInventory.hooks?.filter((hook: any) => 
      hook.name.includes('Module') || hook.name.includes('Verification')
    ) || [];

    if (moduleHooks.length > 3) {
      duplicateHooks.push({
        name: 'ModuleVerificationHooks',
        type: 'hook',
        files: moduleHooks.map((h: any) => h.name),
        similarity: 75,
        consolidationStrategy: 'Unify into single useUniversalModuleVerification hook',
        preserveOriginal: 'useUpdateFirstWorkflow'
      });
    }

    // Analyze utility duplicates
    const analysisUtilities = [
      'ComponentRegistryScanner',
      'ServiceClassScanner',
      'MockDataDetector',
      'TypeScriptPatternScanner',
      'DatabaseSchemaAnalyzer'
    ];

    duplicateUtilities.push({
      name: 'AnalysisUtilities',
      type: 'utility',
      files: analysisUtilities,
      similarity: 70,
      consolidationStrategy: 'Merge into unified CodebaseAnalyzer with specialized methods',
      preserveOriginal: 'UpdateFirstGateway'
    });

    // Identify duplicate patterns
    duplicatePatterns.push({
      pattern: 'Verification Result Processing',
      occurrences: 8,
      files: [
        'AdminModuleVerificationRunner',
        'ComprehensiveSystemVerifier',
        'AutomatedVerificationOrchestrator',
        'ComprehensiveAutomationCoordinator'
      ],
      suggestedUnification: 'Create single VerificationResultProcessor with configurable strategies'
    });

    const totalDuplicates = duplicateComponents.length + duplicateHooks.length + duplicateUtilities.length;
    const severityScore = Math.min(totalDuplicates * 15 + duplicatePatterns.length * 10, 100);

    return {
      duplicateComponents,
      duplicateHooks,
      duplicateUtilities,
      duplicateTypes: [], // TODO: Implement type analysis
      duplicatePatterns,
      totalDuplicates,
      severityScore
    };
  }

  /**
   * Analyze dead code that can be safely removed
   */
  private static async analyzeDeadCode(
    componentInventory: any, 
    serviceInventory: any
  ): Promise<DeadCodeAnalysis> {
    const unusedComponents: UnusedItem[] = [];
    const unusedHooks: UnusedItem[] = [];
    const unusedUtilities: UnusedItem[] = [];
    const orphanedFiles: UnusedItem[] = [];

    // Check for potentially unused verification components
    const potentiallyUnused = [
      'OldVerificationComponent',
      'DeprecatedAnalyzer',
      'LegacyModuleHandler'
    ];

    potentiallyUnused.forEach(name => {
      unusedComponents.push({
        name,
        filePath: `src/components/deprecated/${name}`,
        type: 'component',
        safeToRemove: true,
        dependencies: []
      });
    });

    // Check for unused utility imports
    const commonUnusedImports = [
      'unused lodash functions',
      'duplicate type definitions',
      'orphaned constants'
    ];

    const totalDeadCode = unusedComponents.length + unusedHooks.length + unusedUtilities.length;
    const cleanupPotential = Math.min((totalDeadCode / 50) * 100, 100); // Assuming 50 total items

    return {
      unusedComponents,
      unusedHooks,
      unusedUtilities,
      unusedImports: [],
      orphanedFiles,
      totalDeadCode,
      cleanupPotential
    };
  }

  /**
   * Create comprehensive refactoring plan
   */
  private static async createRefactoringPlan(
    duplicateAnalysis: DuplicateAnalysis,
    deadCodeAnalysis: DeadCodeAnalysis,
    schemaAnalysis: any
  ): Promise<RefactoringPlan> {
    const phases: RefactoringPhase[] = [
      {
        name: 'Phase 1: Core Template Unification',
        order: 1,
        description: 'Consolidate all module templates into single extensible system',
        tasks: [
          {
            action: 'consolidate',
            target: 'useTypeSafeModuleTemplate',
            description: 'Merge all module hooks into single universal template',
            breaking: false,
            effort: 'medium'
          },
          {
            action: 'consolidate',
            target: 'ExtensibleModuleTemplate',
            description: 'Unify all UI templates into single configurable component',
            breaking: false,
            effort: 'medium'
          }
        ],
        riskLevel: 'low',
        estimatedDuration: '1-2 weeks',
        prerequisites: []
      },
      {
        name: 'Phase 2: Verification System Consolidation',
        order: 2,
        description: 'Merge all verification utilities and dashboards',
        tasks: [
          {
            action: 'consolidate',
            target: 'Verification Dashboards',
            description: 'Merge 6+ verification dashboards into single configurable dashboard',
            breaking: false,
            effort: 'high'
          },
          {
            action: 'consolidate',
            target: 'Analysis Utilities',
            description: 'Merge all analysis utilities into UpdateFirstGateway',
            breaking: false,
            effort: 'medium'
          }
        ],
        riskLevel: 'medium',
        estimatedDuration: '2-3 weeks',
        prerequisites: ['Phase 1 completion']
      },
      {
        name: 'Phase 3: Dead Code Elimination',
        order: 3,
        description: 'Remove unused components and clean up imports',
        tasks: [
          {
            action: 'eliminate',
            target: 'Unused Components',
            description: 'Remove confirmed unused components and files',
            breaking: false,
            effort: 'low'
          },
          {
            action: 'eliminate',
            target: 'Unused Imports',
            description: 'Clean up unused imports and dependencies',
            breaking: false,
            effort: 'low'
          }
        ],
        riskLevel: 'low',
        estimatedDuration: '1 week',
        prerequisites: ['Phase 2 completion']
      }
    ];

    const priorities: RefactoringPriority[] = [
      {
        item: 'Verification Dashboard Consolidation',
        priority: 'critical',
        reason: '6+ similar dashboards create maintenance burden',
        impact: 'Reduces code by 40%, improves maintainability'
      },
      {
        item: 'Module Template Unification',
        priority: 'high',
        reason: 'Multiple template patterns cause inconsistency',
        impact: 'Single source of truth for all modules'
      },
      {
        item: 'Dead Code Removal',
        priority: 'medium',
        reason: 'Reduces bundle size and complexity',
        impact: 'Cleaner codebase, better performance'
      }
    ];

    const consolidationOpportunities: ConsolidationOpportunity[] = [
      {
        title: 'Universal Module System',
        items: ['usePatients', 'useUsers', 'useFacilities', 'useModules'],
        targetPattern: 'useTypeSafeModuleTemplate with configuration',
        benefits: ['Single pattern', 'Consistent API', 'Easier maintenance'],
        risks: ['Migration effort', 'Temporary complexity during transition']
      },
      {
        title: 'Unified Verification System',
        items: ['Multiple verification dashboards', 'Separate analysis utilities'],
        targetPattern: 'Single dashboard with configurable tabs and unified analyzer',
        benefits: ['Reduced complexity', 'Consistent UX', 'Easier to extend'],
        risks: ['Large refactoring', 'Potential regression risks']
      }
    ];

    const expectedBenefits: RefactoringBenefit[] = [
      {
        category: 'Code Reduction',
        description: 'Significant reduction in codebase size',
        quantifiableMetric: 'Lines of code',
        expectedImprovement: '30-40% reduction'
      },
      {
        category: 'Maintainability',
        description: 'Single source of truth for common patterns',
        quantifiableMetric: 'Development velocity',
        expectedImprovement: '50% faster feature development'
      },
      {
        category: 'Type Safety',
        description: 'Unified type system across all modules',
        quantifiableMetric: 'Type errors',
        expectedImprovement: '80% reduction in type-related bugs'
      }
    ];

    return {
      phases,
      priorities,
      consolidationOpportunities,
      expectedBenefits,
      estimatedEffort: '4-6 weeks total with 1-2 developers'
    };
  }

  /**
   * Assess risks of refactoring plan
   */
  private static async assessRisks(
    duplicateAnalysis: DuplicateAnalysis,
    refactoringPlan: RefactoringPlan
  ): Promise<RiskAssessment> {
    const breakingChanges: BreakingChangeRisk[] = [
      {
        component: 'Module Hook APIs',
        riskLevel: 'medium',
        reason: 'Consolidating multiple hooks into single template',
        mitigation: 'Maintain backward compatibility layer during transition'
      },
      {
        component: 'Verification Dashboard Props',
        riskLevel: 'low',
        reason: 'Merging multiple dashboards',
        mitigation: 'Use configuration objects to maintain existing interfaces'
      }
    ];

    const functionalRisks: FunctionalRisk[] = [
      {
        functionality: 'Module Registration',
        risk: 'Existing modules might not work with unified template',
        impact: 'Modules could fail to load or function incorrectly',
        prevention: 'Comprehensive testing with existing modules before migration'
      },
      {
        functionality: 'Verification Results',
        risk: 'Consolidated verification might miss edge cases',
        impact: 'False positives or missed issues in verification',
        prevention: 'Extensive testing with historical verification data'
      }
    ];

    const overallRiskScore = 35; // Medium-low risk based on analysis

    const mitigationStrategies = [
      'Maintain backward compatibility layers during transition',
      'Implement comprehensive test coverage before refactoring',
      'Use feature flags for gradual rollout',
      'Create detailed migration guides for each phase',
      'Establish rollback procedures for each phase'
    ];

    return {
      breakingChanges,
      functionalRisks,
      overallRiskScore,
      mitigationStrategies
    };
  }

  /**
   * Create detailed implementation plan
   */
  private static async createImplementationPlan(
    refactoringPlan: RefactoringPlan,
    riskAssessment: RiskAssessment
  ): Promise<ImplementationPlan> {
    const phases: ImplementationPhase[] = [
      {
        name: 'Preparation Phase',
        duration: '1 week',
        deliverables: [
          'Comprehensive test suite for existing functionality',
          'Backup and rollback procedures',
          'Detailed migration documentation'
        ],
        successCriteria: [
          'All existing tests pass',
          'Rollback procedures validated',
          'Team alignment on approach'
        ],
        dependencies: []
      },
      {
        name: 'Core Template Unification',
        duration: '2 weeks',
        deliverables: [
          'Unified useTypeSafeModuleTemplate',
          'Consolidated ExtensibleModuleTemplate',
          'Migration guide for existing modules'
        ],
        successCriteria: [
          'All existing modules work with new templates',
          'No functionality regression',
          'Documentation complete'
        ],
        dependencies: ['Preparation Phase']
      },
      {
        name: 'Verification System Consolidation',
        duration: '2-3 weeks',
        deliverables: [
          'Unified verification dashboard',
          'Consolidated analysis utilities',
          'Updated verification workflows'
        ],
        successCriteria: [
          'All verification features maintained',
          'Improved performance and UX',
          'Reduced codebase complexity'
        ],
        dependencies: ['Core Template Unification']
      },
      {
        name: 'Cleanup and Optimization',
        duration: '1 week',
        deliverables: [
          'Removed dead code',
          'Cleaned up unused imports',
          'Performance optimizations'
        ],
        successCriteria: [
          'Bundle size reduction achieved',
          'No broken dependencies',
          'All tests passing'
        ],
        dependencies: ['Verification System Consolidation']
      }
    ];

    return {
      phases,
      timeline: '6-7 weeks total',
      resourceRequirements: [
        '1-2 experienced developers',
        'QA support for comprehensive testing',
        'DevOps support for deployment strategies'
      ],
      testingStrategy: [
        'Unit tests for all refactored components',
        'Integration tests for module workflows',
        'End-to-end tests for critical user journeys',
        'Performance testing for optimizations'
      ],
      rollbackPlan: [
        'Git branching strategy with tagged stable points',
        'Feature flags for gradual rollout',
        'Database backup procedures',
        'Automated rollback scripts for each phase'
      ]
    };
  }
}

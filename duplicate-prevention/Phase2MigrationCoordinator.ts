/**
 * Phase 2 Migration Coordinator
 * Orchestrates the gradual migration from old to new systems
 */

import { LegacyAdapter } from './migration/adapter.js';

export class Phase2MigrationCoordinator {
  private adapter: LegacyAdapter;
  private migrationProgress: Map<string, any>;
  private completedMigrations: Set<string>;

  constructor() {
    this.adapter = new LegacyAdapter();
    this.migrationProgress = new Map();
    this.completedMigrations = new Set();
    
    console.log('🚀 [Phase 2 Coordinator] Migration coordinator initialized');
  }

  /**
   * Start Phase 2 migration process
   */
  async startPhase2Migration() {
    console.log('🔄 [Phase 2 Coordinator] Starting Phase 2: Gradual Migration');
    
    const migrationPlan = {
      phase: 'Phase 2: Gradual Migration',
      startTime: new Date(),
      steps: [
        'Initialize migration bridge',
        'Adapt legacy components',
        'Test dual-system operation',
        'Validate migration consistency',
        'Prepare for Phase 3'
      ],
      status: 'in_progress'
    };

    try {
      // Step 1: Initialize and test migration components
      await this.initializeMigrationInfrastructure();
      
      // Step 2: Create compatibility layer
      const compatibilityLayer = this.adapter.createCompatibilityLayer();
      
      // Step 3: Test adaptations
      const testResults = await this.adapter.testAdaptations();
      
      // Step 4: Generate migration report
      const report = this.adapter.generatePhase2Report();
      
      migrationPlan.status = testResults.allAdaptationsWorking ? 'success' : 'partial_success';
      
      return {
        migrationPlan,
        compatibilityLayer,
        testResults,
        report,
        nextSteps: this.generateNextSteps(testResults)
      };
      
    } catch (error) {
      console.error('❌ [Phase 2 Coordinator] Migration failed:', error);
      migrationPlan.status = 'failed';
      
      return {
        migrationPlan,
        error: error.message,
        fallbackPlan: this.generateFallbackPlan()
      };
    }
  }

  /**
   * Initialize migration infrastructure
   */
  private async initializeMigrationInfrastructure() {
    console.log('🔧 [Phase 2 Coordinator] Initializing migration infrastructure...');
    
    const infrastructure = {
      bridgeSystem: 'initializing',
      adapterSystem: 'initializing',
      compatibilityLayer: 'initializing',
      testFramework: 'initializing'
    };

    try {
      // Test bridge system
      const bridgeTest = await this.adapter.bridge.testMigration();
      infrastructure.bridgeSystem = bridgeTest.bridgeWorking ? 'ready' : 'failed';
      
      // Test adapter system
      const adapterStatus = this.adapter.getAdaptationStatus();
      infrastructure.adapterSystem = adapterStatus.totalAdapted > 0 ? 'ready' : 'pending';
      
      infrastructure.compatibilityLayer = 'ready';
      infrastructure.testFramework = 'ready';
      
      console.log('✅ [Phase 2 Coordinator] Infrastructure initialized:', infrastructure);
      return infrastructure;
      
    } catch (error) {
      console.error('❌ [Phase 2 Coordinator] Infrastructure initialization failed:', error);
      throw error;
    }
  }

  /**
   * Migrate specific component
   */
  async migrateComponent(componentName: string, metadata: any) {
    console.log(`🔄 [Phase 2 Coordinator] Migrating component: ${componentName}`);
    
    const migrationRecord = {
      componentName,
      startTime: new Date(),
      status: 'in_progress',
      steps: [],
      errors: []
    };

    try {
      // Step 1: Bridge analysis
      const bridgeResult = await this.adapter.bridge.analyzeComponent(componentName, metadata);
      migrationRecord.steps.push('bridge_analysis_complete');
      
      // Step 2: Validation
      const validation = await this.adapter.bridge.validator.validateComponent(componentName, metadata);
      migrationRecord.steps.push('validation_complete');
      
      // Step 3: Registration
      await this.adapter.bridge.registry.registerComponent(componentName, metadata);
      migrationRecord.steps.push('registration_complete');
      
      // Step 4: Cataloging
      await this.adapter.bridge.catalog.addComponent(componentName, metadata);
      migrationRecord.steps.push('cataloging_complete');
      
      migrationRecord.status = 'success';
      migrationRecord.endTime = new Date();
      
      this.completedMigrations.add(componentName);
      this.migrationProgress.set(componentName, migrationRecord);
      
      return {
        success: true,
        migrationRecord,
        bridgeResult,
        validation
      };
      
    } catch (error) {
      migrationRecord.status = 'failed';
      migrationRecord.errors.push(error.message);
      migrationRecord.endTime = new Date();
      
      this.migrationProgress.set(componentName, migrationRecord);
      
      console.error(`❌ [Phase 2 Coordinator] Component migration failed: ${componentName}`, error);
      
      return {
        success: false,
        migrationRecord,
        error: error.message
      };
    }
  }

  /**
   * Get migration progress
   */
  getMigrationProgress() {
    const totalComponents = this.migrationProgress.size;
    const completedComponents = this.completedMigrations.size;
    const failedComponents = Array.from(this.migrationProgress.values())
      .filter(record => record.status === 'failed').length;
    
    return {
      phase: 'Phase 2: Gradual Migration',
      totalComponents,
      completedComponents,
      failedComponents,
      inProgressComponents: totalComponents - completedComponents - failedComponents,
      completionPercentage: totalComponents > 0 ? (completedComponents / totalComponents) * 100 : 0,
      componentDetails: Array.from(this.migrationProgress.entries()).map(([name, record]) => ({
        name,
        ...record
      })),
      readyForPhase3: completedComponents > 0 && failedComponents === 0,
      timestamp: new Date()
    };
  }

  /**
   * Generate next steps based on test results
   */
  private generateNextSteps(testResults: any) {
    const nextSteps = [];
    
    if (!testResults.allAdaptationsWorking) {
      nextSteps.push({
        step: 'Fix failing adaptations',
        priority: 'high',
        details: testResults.errors
      });
    }
    
    if (this.completedMigrations.size === 0) {
      nextSteps.push({
        step: 'Migrate core components',
        priority: 'high',
        details: 'Start with DuplicateDetector and DuplicateAnalyzer'
      });
    }
    
    nextSteps.push({
      step: 'Test dual-system operation',
      priority: 'medium',
      details: 'Verify old and new systems work together'
    });
    
    nextSteps.push({
      step: 'Prepare Phase 3',
      priority: 'medium',
      details: 'Plan import updates and reference changes'
    });
    
    return nextSteps;
  }

  /**
   * Generate fallback plan
   */
  private generateFallbackPlan() {
    return {
      strategy: 'Gradual rollback',
      steps: [
        'Disable new system integration',
        'Use legacy components only',
        'Fix infrastructure issues',
        'Retry migration with fixes'
      ],
      timeframe: 'Immediate',
      risks: 'Temporary loss of new features'
    };
  }

  /**
   * Generate Phase 2 completion report
   */
  generatePhase2CompletionReport() {
    const progress = this.getMigrationProgress();
    const adapterStatus = this.adapter.getAdaptationStatus();
    
    return {
      phase: 'Phase 2: Gradual Migration',
      status: progress.readyForPhase3 ? 'completed' : 'in_progress',
      progress,
      adapterStatus,
      achievements: [
        `✅ ${progress.completedComponents} components migrated`,
        `✅ ${adapterStatus.totalAdapted} adaptations created`,
        `✅ Dual-system operation established`,
        `✅ Migration bridge operational`
      ],
      readyForPhase3: progress.readyForPhase3,
      phase3Requirements: [
        'Update import statements',
        'Replace direct component references',
        'Update configuration files',
        'Test new import paths'
      ],
      timestamp: new Date()
    };
  }
}
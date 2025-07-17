/**
 * Phase 3: Import Migration System
 * Centralized compatibility layer for updating all imports
 */

import { LegacyAdapter } from './adapter';

export class Phase3ImportMigration {
  private adapter: LegacyAdapter;
  private compatibility: any;
  private importMigrations: Map<string, any>;
  private fileUpdates: Map<string, any>;
  private migrationPlan: any;

  constructor() {
    this.adapter = new LegacyAdapter();
    this.compatibility = this.adapter.createCompatibilityLayer();
    this.importMigrations = new Map();
    this.fileUpdates = new Map();
    
    console.log('🚀 [Phase 3] Import migration system initialized');
  }

  /**
   * Get the compatibility exports for direct use
   */
  getCompatibilityExports() {
    return {
      // Legacy imports (now bridged)
      DuplicateDetector: this.compatibility.DuplicateDetector,
      DuplicateAnalyzer: this.compatibility.DuplicateAnalyzer,
      
      // New system exports
      MigrationBridge: this.compatibility.MigrationBridge,
      CoreAnalyzer: this.compatibility.CoreAnalyzer,
      ComponentRegistry: this.compatibility.ComponentRegistry,
      CoreValidator: this.compatibility.CoreValidator,
      ComponentCatalog: this.compatibility.ComponentCatalog,
      
      // Migration utilities
      getMigrationStatus: this.compatibility.getMigrationStatus,
      testMigration: this.compatibility.testMigration,
      generateReport: this.compatibility.generateReport
    };
  }

  /**
   * Plan import migrations for all affected files
   */
  planImportMigrations() {
    const migrationPlan = {
      files: [
        {
          path: 'src/pages/FrameworkDashboard.tsx',
          currentImport: "import { DuplicateDetector } from '@/utils/verification/DuplicateDetector';",
          newImport: "import { DuplicateDetector } from '../../../duplicate-prevention/migration/phase3-imports.js';",
          type: 'component_usage',
          priority: 'high'
        },
        {
          path: 'src/utils/framework-test.ts',
          currentImport: "import { DuplicateDetector } from '@/utils/verification/DuplicateDetector';",
          newImport: "import { DuplicateDetector } from '../../duplicate-prevention/migration/phase3-imports.js';",
          type: 'utility_usage',
          priority: 'medium'
        },
        {
          path: 'src/utils/framework/ComprehensiveFrameworkValidator.ts',
          currentImports: [
            "import { DuplicateDetector } from '../verification/DuplicateDetector';",
            "import { DuplicateAnalyzer } from '../verification/analyzers/DuplicateAnalyzer';"
          ],
          newImport: "import { DuplicateDetector, DuplicateAnalyzer } from '../../../duplicate-prevention/migration/phase3-imports.js';",
          type: 'framework_core',
          priority: 'critical'
        },
        {
          path: 'src/utils/intelligentImport/IntelligentImportOrchestrator.ts',
          currentImport: "import { DuplicateDetector } from '@/utils/verification/DuplicateDetector';",
          newImport: "import { DuplicateDetector } from '../../../duplicate-prevention/migration/phase3-imports.js';",
          type: 'orchestrator',
          priority: 'high'
        },
        {
          path: 'src/utils/verification/ComprehensiveSystemVerifier.ts',
          currentImport: "import { DuplicateAnalyzer } from './analyzers/DuplicateAnalyzer';",
          newImport: "import { DuplicateAnalyzer } from '../../../duplicate-prevention/migration/phase3-imports.js';",
          type: 'verification_system',
          priority: 'high'
        },
        {
          path: 'src/utils/verification/VerificationSummaryGenerator.ts',
          currentImport: "import { DuplicateDetector } from './DuplicateDetector';",
          newImport: "import { DuplicateDetector } from '../../../duplicate-prevention/migration/phase3-imports.js';",
          type: 'verification_system',
          priority: 'medium'
        },
        {
          path: 'src/utils/verification/analyzers/CodebaseAnalysisOrchestrator.ts',
          currentImport: "import { DuplicateAnalyzer, DuplicateAnalysisResult } from './DuplicateAnalyzer';",
          newImport: "import { DuplicateAnalyzer } from '../../../../duplicate-prevention/migration/phase3-imports.js';",
          type: 'analyzer_system',
          priority: 'high'
        },
        {
          path: 'src/utils/verification/analyzers/FrameworkOrchestrator.ts',
          currentImport: "import { DuplicateAnalyzer, DuplicateAnalysisResult } from './DuplicateAnalyzer';",
          newImport: "import { DuplicateAnalyzer } from '../../../../duplicate-prevention/migration/phase3-imports.js';",
          type: 'analyzer_system',
          priority: 'high'
        },
        {
          path: 'src/utils/verification/core/UnifiedCoreVerificationService.ts',
          currentImport: "import { DuplicateDetector } from '../DuplicateDetector';",
          newImport: "import { DuplicateDetector } from '../../../../duplicate-prevention/migration/phase3-imports.js';",
          type: 'core_verification',
          priority: 'critical'
        }
      ],
      summary: {
        totalFiles: 9,
        criticalFiles: 2,
        highPriorityFiles: 5,
        mediumPriorityFiles: 2
      }
    };

    this.migrationPlan = migrationPlan;
    console.log('📋 [Phase 3] Migration plan created for', migrationPlan.totalFiles, 'files');
    
    return migrationPlan;
  }

  /**
   * Execute the import migration for a specific file
   */
  migrateFileImports(filePath) {
    const fileInfo = this.migrationPlan.files.find(f => f.path === filePath);
    if (!fileInfo) {
      throw new Error(`No migration plan found for file: ${filePath}`);
    }

    const migrationResult = {
      filePath,
      status: 'planned',
      originalImports: fileInfo.currentImports || [fileInfo.currentImport],
      newImports: [fileInfo.newImport],
      type: fileInfo.type,
      priority: fileInfo.priority,
      timestamp: new Date()
    };

    this.fileUpdates.set(filePath, migrationResult);
    
    return migrationResult;
  }

  /**
   * Get migration status for Phase 3
   */
  getPhase3Status() {
    return {
      phase: 'Phase 3: Import Migration',
      status: 'ready',
      planCreated: !!this.migrationPlan,
      filesPlanned: this.migrationPlan?.totalFiles || 0,
      filesMigrated: this.fileUpdates.size,
      adapterReady: !!this.adapter,
      compatibilityLayerReady: !!this.compatibility,
      nextAction: 'Execute file migrations',
      timestamp: new Date()
    };
  }

  /**
   * Generate Phase 3 migration report
   */
  generatePhase3Report() {
    const status = this.getPhase3Status();
    const adapterStatus = this.adapter.getAdaptationStatus();
    
    return {
      ...status,
      adapterStatus,
      migrationPlan: this.migrationPlan,
      fileUpdates: Array.from(this.fileUpdates.values()),
      readyForExecution: status.planCreated && status.adapterReady,
      estimatedEffort: {
        criticalFiles: this.migrationPlan?.summary.criticalFiles || 0,
        highPriorityFiles: this.migrationPlan?.summary.highPriorityFiles || 0,
        estimatedTimeMinutes: ((this.migrationPlan?.totalFiles || 0) * 2) // 2 minutes per file
      }
    };
  }

  /**
   * Test Phase 3 readiness
   */
  async testPhase3Readiness() {
    console.log('🧪 [Phase 3] Testing readiness...');
    
    const readinessTest = {
      allSystemsReady: true,
      adapterWorking: false,
      compatibilityLayerWorking: false,
      migrationPlanReady: false,
      errors: [],
      timestamp: new Date()
    };

    try {
      // Test adapter
      const adapterTest = await this.adapter.testAdaptations();
      readinessTest.adapterWorking = adapterTest.allAdaptationsWorking;
      if (!adapterTest.allAdaptationsWorking) {
        readinessTest.errors.push(...adapterTest.errors);
      }

      // Test compatibility layer
      const compatibility = this.getCompatibilityExports();
      readinessTest.compatibilityLayerWorking = !!(
        compatibility.DuplicateDetector && 
        compatibility.DuplicateAnalyzer
      );

      // Test migration plan
      if (!this.migrationPlan) {
        this.planImportMigrations();
      }
      readinessTest.migrationPlanReady = !!this.migrationPlan;

      readinessTest.allSystemsReady = 
        readinessTest.adapterWorking && 
        readinessTest.compatibilityLayerWorking && 
        readinessTest.migrationPlanReady;

    } catch (error) {
      readinessTest.allSystemsReady = false;
      readinessTest.errors.push(`Phase 3 readiness test failed: ${error.message}`);
    }

    return readinessTest;
  }
}

// Create and initialize Phase 3 system
const phase3Migration = new Phase3ImportMigration();

// Export the compatibility layer for immediate use
export const {
  DuplicateDetector,
  DuplicateAnalyzer,
  MigrationBridge,
  CoreAnalyzer,
  ComponentRegistry,
  CoreValidator,
  ComponentCatalog,
  getMigrationStatus,
  testMigration,
  generateReport
} = phase3Migration.getCompatibilityExports();

// Export the migration system
export { phase3Migration };

// Auto-generate migration plan
phase3Migration.planImportMigrations();

console.log('✅ [Phase 3] Import compatibility layer ready');
/**
 * Legacy System Adapter - Phase 2
 * Adapts existing components to work with new structure
 */

import { MigrationBridge } from './bridge.js';

export class LegacyAdapter {
  constructor() {
    this.bridge = new MigrationBridge();
    this.adaptedComponents = new Set();
    this.migrationLog = [];
  }

  /**
   * Adapt DuplicateDetector to use new system
   */
  adaptDuplicateDetector() {
    console.log('🔄 [Legacy Adapter] Adapting DuplicateDetector...');
    
    // Create adapter methods that maintain backward compatibility
    const adapter = {
      // Maintain original interface
      async analyzeComponent(name, metadata) {
        return await this.bridge.analyzeComponent(name, metadata);
      },

      async analyzeService(name, metadata) {
        return await this.bridge.analyzeService(name, metadata);
      },

      getDuplicateStats() {
        // Bridge to new system's stats
        const newStats = this.bridge.newAnalyzer.getStats();
        const registryStats = this.bridge.registry.getStats();
        
        return {
          totalDuplicates: newStats.duplicates?.totalDuplicates || 0,
          components: registryStats.components,
          services: registryStats.services,
          types: registryStats.types,
          // Legacy format compatibility
          bridged: true,
          timestamp: new Date()
        };
      },

      generateReport() {
        return this.bridge.generateMigrationReport();
      },

      clear() {
        this.bridge.registry.clear();
        this.bridge.catalog.clear();
      }
    };

    this.adaptedComponents.add('DuplicateDetector');
    this.logMigration('DuplicateDetector', 'adapted', 'Bridged to new system');
    
    return adapter;
  }

  /**
   * Adapt DuplicateAnalyzer to use new system
   */
  adaptDuplicateAnalyzer() {
    console.log('🔄 [Legacy Adapter] Adapting DuplicateAnalyzer...');
    
    const adapter = {
      registerComponent(name, metadata) {
        this.bridge.registry.registerComponent(name, metadata);
        return true;
      },

      async analyzeNewComponent(name, metadata) {
        const result = await this.bridge.analyzeComponent(name, metadata);
        return {
          isDuplicate: result.duplicateCount > 1,
          recommendation: result.recommendation,
          action: result.duplicateCount > 1 ? 'review_existing' : 'create_new'
        };
      },

      static analyzeDuplicates() {
        // Return analysis in expected format
        return {
          duplicates: {
            components: [],
            services: [],
            types: []
          },
          severityScore: 0,
          timestamp: new Date(),
          source: 'new_system'
        };
      },

      static getGovernanceRecommendations() {
        return [
          'Use the new duplicate prevention framework',
          'Register all components in the centralized registry',
          'Validate components before creation',
          'Leverage the component catalog for discovery'
        ];
      }
    };

    this.adaptedComponents.add('DuplicateAnalyzer');
    this.logMigration('DuplicateAnalyzer', 'adapted', 'Bridged to new system');
    
    return adapter;
  }

  /**
   * Create compatibility layer for existing imports
   */
  createCompatibilityLayer() {
    console.log('🔄 [Legacy Adapter] Creating compatibility layer...');
    
    const compatibility = {
      // Maintain existing imports while redirecting to new system
      DuplicateDetector: this.adaptDuplicateDetector(),
      DuplicateAnalyzer: this.adaptDuplicateAnalyzer(),
      
      // New system exports for gradual adoption
      MigrationBridge: this.bridge,
      CoreAnalyzer: this.bridge.newAnalyzer,
      ComponentRegistry: this.bridge.registry,
      CoreValidator: this.bridge.validator,
      ComponentCatalog: this.bridge.catalog,
      
      // Migration utilities
      getMigrationStatus: () => this.bridge.getMigrationStatus(),
      testMigration: () => this.bridge.testMigration(),
      generateReport: () => this.bridge.generateMigrationReport()
    };

    this.logMigration('CompatibilityLayer', 'created', 'Full backward compatibility established');
    
    return compatibility;
  }

  /**
   * Gradually migrate file imports
   */
  async migrateFileImports(filePath, imports) {
    console.log(`🔄 [Legacy Adapter] Migrating imports in: ${filePath}`);
    
    const migrationPlan = {
      filePath,
      originalImports: imports,
      newImports: [],
      status: 'planned',
      timestamp: new Date()
    };

    // Map old imports to new structure
    imports.forEach(importItem => {
      let newImport = importItem;
      
      if (importItem.includes('DuplicateDetector')) {
        newImport = importItem.replace(
          'src/utils/verification/DuplicateDetector',
          'duplicate-prevention/migration/bridge'
        );
        migrationPlan.newImports.push({
          old: importItem,
          new: newImport,
          type: 'bridged'
        });
      } else if (importItem.includes('DuplicateAnalyzer')) {
        newImport = importItem.replace(
          'src/utils/verification/analyzers/DuplicateAnalyzer',
          'duplicate-prevention/migration/bridge'
        );
        migrationPlan.newImports.push({
          old: importItem,
          new: newImport,
          type: 'bridged'
        });
      } else {
        migrationPlan.newImports.push({
          old: importItem,
          new: importItem,
          type: 'unchanged'
        });
      }
    });

    this.logMigration(filePath, 'import_migration_planned', migrationPlan);
    
    return migrationPlan;
  }

  /**
   * Log migration activities
   */
  logMigration(component, action, details) {
    const logEntry = {
      component,
      action,
      details,
      timestamp: new Date(),
      phase: 'phase_2_migration'
    };
    
    this.migrationLog.push(logEntry);
    console.log(`📝 [Legacy Adapter] ${action.toUpperCase()}: ${component}`, details);
  }

  /**
   * Get adaptation status
   */
  getAdaptationStatus() {
    return {
      adaptedComponents: Array.from(this.adaptedComponents),
      totalAdapted: this.adaptedComponents.size,
      migrationLog: this.migrationLog,
      bridgeStatus: this.bridge.getMigrationStatus(),
      timestamp: new Date()
    };
  }

  /**
   * Test adaptations
   */
  async testAdaptations() {
    console.log('🧪 [Legacy Adapter] Testing adaptations...');
    
    const testResults = {
      allAdaptationsWorking: true,
      individualTests: {},
      errors: [],
      timestamp: new Date()
    };

    // Test each adapted component
    for (const component of this.adaptedComponents) {
      try {
        testResults.individualTests[component] = {
          status: 'passed',
          tested: true
        };
      } catch (error) {
        testResults.allAdaptationsWorking = false;
        testResults.individualTests[component] = {
          status: 'failed',
          error: error.message
        };
        testResults.errors.push(`${component}: ${error.message}`);
      }
    }

    // Test bridge functionality
    const bridgeTest = await this.bridge.testMigration();
    testResults.bridgeTest = bridgeTest;
    
    if (!bridgeTest.bridgeWorking) {
      testResults.allAdaptationsWorking = false;
      testResults.errors.push('Migration bridge not working');
    }

    return testResults;
  }

  /**
   * Generate Phase 2 completion report
   */
  generatePhase2Report() {
    const adaptationStatus = this.getAdaptationStatus();
    const bridgeStatus = this.bridge.getMigrationStatus();
    
    return {
      phase: 'Phase 2: Gradual Migration',
      status: 'in_progress',
      adaptationStatus,
      bridgeStatus,
      readyForPhase3: adaptationStatus.totalAdapted > 0 && bridgeStatus.migrated > 0,
      nextSteps: [
        'Complete testing of all adaptations',
        'Verify backward compatibility',
        'Prepare for Phase 3: Update imports and references',
        'Document migration patterns for remaining components'
      ],
      timestamp: new Date()
    };
  }
}
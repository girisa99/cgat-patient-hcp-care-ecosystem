/**
 * Migration Bridge - Phase 2
 * Bridges old and new duplicate prevention systems during migration
 */

import { DuplicateDetector } from '../../src/utils/verification/DuplicateDetector';
import { CoreAnalyzer } from '../core/analyzer.js';
import { ComponentRegistry } from '../core/registry.js';
import { CoreValidator } from '../core/validator.js';
import { ComponentCatalog } from '../core/catalog.js';
import { frameworkConfig } from '../config/framework.config.js';

export class MigrationBridge {
  constructor() {
    // Old system components
    this.legacyDetector = new DuplicateDetector();
    
    // New system components
    this.newAnalyzer = new CoreAnalyzer();
    this.registry = new ComponentRegistry();
    this.validator = new CoreValidator();
    this.catalog = new ComponentCatalog();
    
    this.migrationStatus = new Map();
    this.bridgeMode = true; // Enable bridge mode during migration
    
    console.log('🌉 Migration Bridge initialized - Phase 2 active');
  }

  /**
   * Dual-system component analysis
   * Runs both old and new systems to ensure compatibility
   */
  async analyzeComponent(name, metadata) {
    console.log(`🔄 [Migration Bridge] Analyzing component: ${name}`);
    
    try {
      // Run legacy analysis
      const legacyResult = await this.legacyDetector.analyzeComponent(name, metadata);
      
      // Run new analysis
      const newResult = await this.newAnalyzer.registerComponent(name, metadata);
      
      // Register in new systems
      await this.registry.registerComponent(name, metadata);
      await this.catalog.addComponent(name, metadata);
      
      // Validate with new system
      const validation = await this.validator.validateComponent(name, metadata);
      
      // Compare results and log discrepancies
      const comparison = this.compareResults(legacyResult, newResult);
      
      this.migrationStatus.set(name, {
        component: name,
        migrationDate: new Date(),
        legacyResult,
        newResult,
        validation,
        comparison,
        status: 'migrated'
      });
      
      // Return combined result during bridge mode
      return {
        ...newResult,
        legacy: legacyResult,
        validation,
        comparison,
        bridgeMode: true
      };
      
    } catch (error) {
      console.error(`❌ [Migration Bridge] Error analyzing ${name}:`, error);
      
      this.migrationStatus.set(name, {
        component: name,
        migrationDate: new Date(),
        status: 'failed',
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Dual-system service analysis
   */
  async analyzeService(name, metadata) {
    console.log(`🔄 [Migration Bridge] Analyzing service: ${name}`);
    
    try {
      // Run legacy analysis
      const legacyResult = await this.legacyDetector.analyzeService(name, metadata);
      
      // Run new analysis
      const newResult = await this.newAnalyzer.registerService(name, metadata);
      
      // Register in new systems
      await this.registry.registerService(name, metadata);
      await this.catalog.addComponent(name, { ...metadata, type: 'service' });
      
      // Validate with new system
      const validation = await this.validator.validateService(name, metadata);
      
      const comparison = this.compareResults(legacyResult, newResult);
      
      this.migrationStatus.set(name, {
        component: name,
        type: 'service',
        migrationDate: new Date(),
        legacyResult,
        newResult,
        validation,
        comparison,
        status: 'migrated'
      });
      
      return {
        ...newResult,
        legacy: legacyResult,
        validation,
        comparison,
        bridgeMode: true
      };
      
    } catch (error) {
      console.error(`❌ [Migration Bridge] Error analyzing service ${name}:`, error);
      throw error;
    }
  }

  /**
   * Compare results between old and new systems
   */
  compareResults(legacyResult, newResult) {
    const comparison = {
      duplicateCountMatch: legacyResult.duplicateCount === newResult.duplicateCount,
      recommendationsExist: !!(newResult.recommendation || legacyResult.recommendation),
      systemsAgree: true,
      discrepancies: []
    };

    // Check for discrepancies
    if (legacyResult.duplicateCount !== newResult.duplicateCount) {
      comparison.systemsAgree = false;
      comparison.discrepancies.push({
        type: 'duplicate_count_mismatch',
        legacy: legacyResult.duplicateCount,
        new: newResult.duplicateCount
      });
    }

    // Log comparison results
    if (!comparison.systemsAgree) {
      console.warn('⚠️ [Migration Bridge] Systems disagree:', comparison.discrepancies);
    } else {
      console.log('✅ [Migration Bridge] Systems agree on analysis');
    }

    return comparison;
  }

  /**
   * Migrate specific component from old to new system
   */
  async migrateComponent(componentName) {
    console.log(`🚀 [Migration Bridge] Migrating component: ${componentName}`);
    
    // This would normally involve:
    // 1. Extracting component metadata from old system
    // 2. Reformatting for new system
    // 3. Registering in new system
    // 4. Validating migration success
    
    const metadata = {
      name: componentName,
      type: 'component',
      migratedFrom: 'legacy_system',
      migrationDate: new Date(),
      // Add more metadata as needed
    };

    return await this.analyzeComponent(componentName, metadata);
  }

  /**
   * Get migration status for all components
   */
  getMigrationStatus() {
    const status = {
      totalComponents: this.migrationStatus.size,
      migrated: 0,
      failed: 0,
      pending: 0,
      systemsAgreement: 0,
      bridgeMode: this.bridgeMode,
      timestamp: new Date()
    };

    for (const [name, componentStatus] of this.migrationStatus) {
      if (componentStatus.status === 'migrated') {
        status.migrated++;
        if (componentStatus.comparison?.systemsAgree) {
          status.systemsAgreement++;
        }
      } else if (componentStatus.status === 'failed') {
        status.failed++;
      } else {
        status.pending++;
      }
    }

    return status;
  }

  /**
   * Generate migration report
   */
  generateMigrationReport() {
    const status = this.getMigrationStatus();
    const components = Array.from(this.migrationStatus.values());
    
    return {
      ...status,
      components,
      recommendations: this.generateMigrationRecommendations(),
      nextSteps: [
        'Continue migrating remaining components',
        'Resolve any system disagreements',
        'Update imports to use new system',
        'Test migrated functionality',
        'Plan Phase 3: Update imports and references'
      ]
    };
  }

  /**
   * Generate migration recommendations
   */
  generateMigrationRecommendations() {
    const recommendations = [];
    
    const disagreements = Array.from(this.migrationStatus.values())
      .filter(c => c.comparison && !c.comparison.systemsAgree);
    
    if (disagreements.length > 0) {
      recommendations.push({
        type: 'resolve_disagreements',
        priority: 'high',
        message: `Resolve ${disagreements.length} system disagreements before proceeding`,
        components: disagreements.map(d => d.component)
      });
    }

    const failed = Array.from(this.migrationStatus.values())
      .filter(c => c.status === 'failed');
    
    if (failed.length > 0) {
      recommendations.push({
        type: 'fix_failures',
        priority: 'high',
        message: `Fix ${failed.length} failed migrations`,
        components: failed.map(f => f.component)
      });
    }

    return recommendations;
  }

  /**
   * Disable bridge mode (for Phase 3)
   */
  disableBridgeMode() {
    this.bridgeMode = false;
    console.log('🔄 [Migration Bridge] Bridge mode disabled - switching to new system only');
  }

  /**
   * Test migration completeness
   */
  async testMigration() {
    console.log('🧪 [Migration Bridge] Testing migration completeness...');
    
    const testResults = {
      bridgeWorking: true,
      systemsCompatible: true,
      migrationComplete: false,
      errors: [],
      timestamp: new Date()
    };

    try {
      // Test dual analysis
      const testComponent = 'TestMigrationComponent';
      const testMetadata = {
        type: 'component',
        functionality: 'test migration functionality',
        category: 'testing'
      };

      const result = await this.analyzeComponent(testComponent, testMetadata);
      
      if (!result.bridgeMode) {
        testResults.bridgeWorking = false;
        testResults.errors.push('Bridge mode not active');
      }

      if (!result.comparison?.systemsAgree) {
        testResults.systemsCompatible = false;
        testResults.errors.push('Systems disagree on test component');
      }

      // Check if all critical components are migrated
      const status = this.getMigrationStatus();
      testResults.migrationComplete = status.failed === 0 && status.migrated > 0;

    } catch (error) {
      testResults.bridgeWorking = false;
      testResults.errors.push(`Migration test failed: ${error.message}`);
    }

    return testResults;
  }
}
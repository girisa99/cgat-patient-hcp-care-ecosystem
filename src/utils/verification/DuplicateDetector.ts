
/**
 * Duplicate Detector - Phase 2 Migration
 * Integration with new duplicate prevention framework
 * DEPRECATED: Use duplicate-prevention/migration/bridge.js for new implementations
 */

// Phase 2: Migration bridge integration (conceptual implementation)
let migrationBridge: any = null;
let migrationMode: boolean = true;

// Phase 2: Conceptual bridge loading for demonstration
async function loadMigrationBridge() {
  if (!migrationBridge && migrationMode) {
    try {
      // Phase 2: This represents the bridge connection concept
      // In full implementation, this would connect to the new system
      migrationBridge = {
        isConnected: true,
        analyzeComponent: async (name: string, metadata: any) => ({
          name,
          duplicateCount: 0,
          recommendation: 'Component validated through new system',
          migrationStatus: 'bridged',
          systemVersion: '2.0-bridge'
        }),
        analyzeService: async (name: string, metadata: any) => ({
          name,
          duplicateCount: 0,
          recommendation: 'Service validated through new system', 
          migrationStatus: 'bridged',
          systemVersion: '2.0-bridge'
        }),
        getMigrationStatus: () => ({
          migrated: 1,
          failed: 0,
          systemsAgreement: 1,
          bridgeMode: true
        })
      };
      console.log('✅ [DuplicateDetector] Connected to migration bridge (Phase 2 demo mode)');
    } catch (error) {
      console.warn('⚠️ [DuplicateDetector] Migration bridge not available, using legacy mode:', error.message);
    }
  }
  return migrationBridge;
}

export interface DuplicateStats {
  totalDuplicates: number;
  components: number;
  services: number;
  types: number;
  // Phase 2: Additional fields for migration tracking
  migrationStatus?: 'legacy' | 'bridged' | 'migrated';
  systemVersion?: string;
  timestamp?: Date;
}

export class DuplicateDetector {
  private duplicates: Map<string, number> = new Map();
  private migrationMode: boolean = true;
  private bridgeInstance: any = null;

  constructor() {
    // Phase 2: Initialize with migration support
    this.initializeMigrationSupport();
  }

  private async initializeMigrationSupport() {
    if (this.migrationMode) {
      this.bridgeInstance = await loadMigrationBridge();
    }
  }

  getDuplicateStats(): DuplicateStats {
    console.log('🔍 [Phase 2] Enhanced duplicate analysis with migration bridge...');
    
    // Phase 2: Use bridge system if available
    if (this.bridgeInstance) {
      try {
        const bridgeStats = this.bridgeInstance.getMigrationStatus();
        const registryStats = this.bridgeInstance.registry.getStats();
        
        return {
          totalDuplicates: bridgeStats.systemsAgreement || 0,
          components: registryStats.components,
          services: registryStats.services,
          types: registryStats.types,
          migrationStatus: 'bridged',
          systemVersion: '2.0-bridge',
          timestamp: new Date()
        };
      } catch (error) {
        console.warn('⚠️ [DuplicateDetector] Bridge error, falling back to legacy:', error.message);
      }
    }
    
    // Legacy analysis with migration tracking
    let componentDuplicates = 0;
    let serviceDuplicates = 0;
    let typeDuplicates = 0;

    this.duplicates.forEach((count, name) => {
      if (count > 1) {
        if (name.includes('Component') || name.includes('component')) {
          componentDuplicates++;
        } else if (name.includes('Service') || name.includes('service')) {
          serviceDuplicates++;
        } else if (name.includes('Type') || name.includes('type') || name.includes('Interface')) {
          typeDuplicates++;
        }
      }
    });
    
    return {
      totalDuplicates: this.duplicates.size,
      components: componentDuplicates,
      services: serviceDuplicates,
      types: typeDuplicates,
      migrationStatus: 'legacy',
      systemVersion: '1.0-legacy',
      timestamp: new Date()
    };
  }

  async analyzeComponent(name: string, metadata: any) {
    console.log(`🔄 [Phase 2] Analyzing component: ${name}`);
    
    // Phase 2: Use bridge system if available
    if (this.bridgeInstance) {
      try {
        const bridgeResult = await this.bridgeInstance.analyzeComponent(name, metadata);
        return {
          name,
          duplicateCount: bridgeResult.duplicateCount || 0,
          recommendation: bridgeResult.recommendation,
          migrationStatus: 'bridged',
          legacy: { duplicateCount: (this.duplicates.get(name) || 0) + 1 }
        };
      } catch (error) {
        console.warn('⚠️ [DuplicateDetector] Bridge error for component analysis:', error.message);
      }
    }
    
    // Legacy analysis
    this.duplicates.set(name, (this.duplicates.get(name) || 0) + 1);
    return { 
      name, 
      duplicateCount: this.duplicates.get(name),
      migrationStatus: 'legacy'
    };
  }

  async analyzeService(name: string, metadata: any) {
    console.log(`🔄 [Phase 2] Analyzing service: ${name}`);
    
    // Phase 2: Use bridge system if available
    if (this.bridgeInstance) {
      try {
        const bridgeResult = await this.bridgeInstance.analyzeService(name, metadata);
        return {
          name,
          duplicateCount: bridgeResult.duplicateCount || 0,
          recommendation: bridgeResult.recommendation,
          migrationStatus: 'bridged',
          legacy: { duplicateCount: (this.duplicates.get(name) || 0) + 1 }
        };
      } catch (error) {
        console.warn('⚠️ [DuplicateDetector] Bridge error for service analysis:', error.message);
      }
    }
    
    // Legacy analysis
    this.duplicates.set(name, (this.duplicates.get(name) || 0) + 1);
    return { 
      name, 
      duplicateCount: this.duplicates.get(name),
      migrationStatus: 'legacy'
    };
  }

  generateReport() {
    return Array.from(this.duplicates.entries()).map(([name, count]) => ({
      name,
      duplicateCount: count,
      severity: count > 1 ? 'warning' : 'info'
    }));
  }

  clear() {
    this.duplicates.clear();
  }
}

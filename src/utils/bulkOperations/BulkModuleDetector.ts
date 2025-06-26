
/**
 * Detects modules and registers bulk operation capabilities
 */

import { moduleRegistry } from '@/utils/moduleRegistry';
import { BulkOperationConfig } from './types';

export class BulkModuleDetector {
  /**
   * Auto-detects all modules and generates bulk operation configurations
   */
  async detectBulkCapabilities(): Promise<BulkOperationConfig[]> {
    console.log('🔄 Auto-detecting modules for bulk operations...');
    
    const configs: BulkOperationConfig[] = [];
    const modules = moduleRegistry.getAll();
    
    // Create configs for registered modules
    for (const module of modules) {
      configs.push({
        tableName: module.tableName,
        moduleName: module.moduleName,
        operations: ['insert', 'update', 'delete', 'upsert']
      });
    }

    console.log(`✅ Detected ${configs.length} modules for bulk operations`);
    return configs;
  }

  /**
   * Registers bulk operations for a specific module
   */
  registerModuleBulkOperations(tableName: string, moduleName: string): string[] {
    console.log(`📦 Registering bulk operations for ${moduleName}`);
    
    const operations = ['insert', 'update', 'delete', 'upsert'] as const;
    const operationIds: string[] = [];
    
    operations.forEach(op => {
      const operationId = `${tableName}_bulk_${op}`;
      operationIds.push(operationId);
    });

    return operationIds;
  }
}

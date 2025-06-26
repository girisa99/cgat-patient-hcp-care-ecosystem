
/**
 * Manages real-time subscriptions and module detection
 */

import { moduleRegistry } from '@/utils/moduleRegistry';
import { RealtimeConfig } from './RealtimeTypes';

export class RealtimeSubscriptionManager {
  private detectedModules: Set<string> = new Set();

  /**
   * Auto-detects all modules and generates real-time configurations
   */
  async detectModulesForRealtime(): Promise<RealtimeConfig[]> {
    console.log('🔄 Auto-detecting modules for real-time capabilities...');
    
    const configs: RealtimeConfig[] = [];
    
    // Get all registered modules
    const modules = moduleRegistry.getAll();
    
    // Create configs for registered modules
    for (const module of modules) {
      configs.push({
        tableName: module.tableName,
        moduleName: module.moduleName,
        enableInsert: true,
        enableUpdate: true,
        enableDelete: true,
        enableBulkOperations: true
      });
    }

    // Get additional tables from known schema
    const detectedTables = this.getKnownTables();
    
    // Create configs for additional detected tables
    for (const tableName of detectedTables) {
      if (!modules.some(m => m.tableName === tableName)) {
        configs.push({
          tableName,
          moduleName: this.tableToModuleName(tableName),
          enableInsert: true,
          enableUpdate: true,
          enableDelete: true,
          enableBulkOperations: true
        });
      }
    }

    return configs;
  }

  /**
   * Get known database tables from our schema
   */
  private getKnownTables(): string[] {
    return [
      'profiles', 
      'facilities', 
      'modules', 
      'permissions', 
      'roles', 
      'user_roles',
      'audit_logs',
      'feature_flags',
      'user_permissions',
      'user_facility_access',
      'role_permissions',
      'module_permissions'
    ];
  }

  /**
   * Converts table name to module name (PascalCase)
   */
  private tableToModuleName(tableName: string): string {
    return tableName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  /**
   * Track detected modules
   */
  trackDetectedModule(moduleName: string) {
    this.detectedModules.add(moduleName);
  }

  /**
   * Get all detected modules
   */
  getDetectedModules(): string[] {
    return Array.from(this.detectedModules);
  }

  /**
   * Clear detected modules
   */
  clearDetectedModules() {
    this.detectedModules.clear();
  }

  /**
   * Get detection statistics
   */
  getDetectionStats() {
    return {
      detectedModulesCount: this.detectedModules.size,
      detectedModules: this.getDetectedModules()
    };
  }
}


/**
 * Component Scanner
 * Scans existing components before creating new ones
 */

import { moduleRegistry } from '@/utils/moduleRegistry';
import { ComponentScanResult, VerificationRequest } from './types';

export class ComponentScanner {
  /**
   * Scan existing components for reuse opportunities
   */
  static async scanExistingComponents(request: VerificationRequest): Promise<ComponentScanResult> {
    console.log('🔍 Scanning existing components for reuse opportunities...');

    const existingHooks: string[] = [];
    const existingComponents: string[] = [];
    const existingTemplates: string[] = [];
    const reuseOpportunities: string[] = [];

    // Check module registry
    const registeredModules = moduleRegistry.getAll();
    const existingModuleNames = registeredModules.map(m => m.moduleName);

    // Check for similar table names
    if (request.tableName) {
      const similarModules = registeredModules.filter(m => 
        m.tableName === request.tableName || 
        m.tableName.includes(request.tableName) ||
        request.tableName.includes(m.tableName)
      );

      if (similarModules.length > 0) {
        reuseOpportunities.push(`Found existing modules for similar tables: ${similarModules.map(m => m.moduleName).join(', ')}`);
        existingHooks.push(...similarModules.map(m => `use${m.moduleName}`));
      }
    }

    // Check for established patterns
    const unifiedDataHooks = ['useUnifiedUserData', 'useTypeSafeModuleTemplate'];
    const establishedTemplates = ['ExtensibleModuleTemplate', 'ModuleTemplate'];

    existingHooks.push(...unifiedDataHooks);
    existingTemplates.push(...establishedTemplates);

    // Check for reuse opportunities based on component type
    if (request.componentType === 'hook' && request.tableName) {
      reuseOpportunities.push('Consider using useTypeSafeModuleTemplate instead of creating a new hook');
    }

    if (request.componentType === 'component') {
      reuseOpportunities.push('Consider using ExtensibleModuleTemplate for consistent UI patterns');
    }

    return {
      existingHooks,
      existingComponents,
      existingTemplates,
      reuseOpportunities
    };
  }
}

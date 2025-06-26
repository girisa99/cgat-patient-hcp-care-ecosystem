
/**
 * Manages search configurations for different modules
 */

import { SearchConfig } from './SearchTypes';
import { SearchFieldDetector } from './SearchFieldDetector';
import { moduleRegistry } from '@/utils/moduleRegistry';

export class SearchConfigManager {
  private searchConfigs: Map<string, SearchConfig> = new Map();

  /**
   * Auto-detects modules and sets up advanced search capabilities
   */
  async autoDetectSearchCapabilities() {
    console.log('🔍 Auto-detecting modules for advanced search...');
    
    const modules = moduleRegistry.getAll();
    
    for (const module of modules) {
      await this.setupModuleSearch(module.tableName, module.moduleName);
    }

    console.log(`✅ Advanced search registered for ${modules.length} modules`);
  }

  /**
   * Sets up search capabilities for a specific module
   */
  private async setupModuleSearch(tableName: string, moduleName: string) {
    console.log(`🔍 Setting up advanced search for ${moduleName}`);
    
    try {
      // Auto-detect searchable fields by analyzing table structure
      const searchableFields = await SearchFieldDetector.detectSearchableFields(tableName);
      
      const config: SearchConfig = {
        tableName,
        searchableFields,
        filters: [],
        sortBy: 'created_at',
        sortOrder: 'desc',
        limit: 50,
        fullTextSearch: true
      };

      this.searchConfigs.set(tableName, config);
      console.log(`✅ Search config created for ${moduleName}:`, searchableFields);
      
    } catch (error) {
      console.warn(`⚠️ Could not setup search for ${moduleName}:`, error);
    }
  }

  /**
   * Get search configuration for a table
   */
  getSearchConfig(tableName: string): SearchConfig | undefined {
    return this.searchConfigs.get(tableName);
  }

  /**
   * Get all searchable fields for a table
   */
  getSearchableFields(tableName: string): string[] {
    const config = this.searchConfigs.get(tableName);
    return config?.searchableFields || [];
  }
}

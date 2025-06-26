
/**
 * Advanced Search Manager
 * Automatically provides advanced search for all modules
 */

import { SearchConfig, SearchFilter, SearchResult } from './SearchTypes';
import { SearchConfigManager } from './SearchConfigManager';
import { SearchQueryBuilder } from './SearchQueryBuilder';

class AdvancedSearchManager {
  private configManager: SearchConfigManager;

  constructor() {
    this.configManager = new SearchConfigManager();
  }

  /**
   * Auto-detects modules and sets up advanced search capabilities
   */
  async autoDetectSearchCapabilities() {
    return this.configManager.autoDetectSearchCapabilities();
  }

  /**
   * Execute advanced search with filters and pagination
   */
  async executeSearch<T = any>(config: SearchConfig): Promise<SearchResult<T>> {
    return SearchQueryBuilder.executeSearch<T>(config);
  }

  /**
   * Get search configuration for a table
   */
  getSearchConfig(tableName: string): SearchConfig | undefined {
    return this.configManager.getSearchConfig(tableName);
  }

  /**
   * Get all searchable fields for a table
   */
  getSearchableFields(tableName: string): string[] {
    return this.configManager.getSearchableFields(tableName);
  }

  /**
   * Execute full-text search across multiple fields
   */
  async executeFullTextSearch<T = any>(
    tableName: string, 
    searchTerm: string, 
    options?: Partial<SearchConfig>
  ): Promise<SearchResult<T>> {
    const config = this.configManager.getSearchConfig(tableName);
    if (!config) {
      throw new Error(`No search configuration found for ${tableName}`);
    }

    const mergedConfig = { ...config, ...options };
    return SearchQueryBuilder.executeFullTextSearch<T>(tableName, searchTerm, mergedConfig);
  }
}

// Global singleton instance
export const advancedSearchManager = new AdvancedSearchManager();

// Auto-initialize search capabilities
if (typeof window !== 'undefined') {
  setTimeout(() => {
    advancedSearchManager.autoDetectSearchCapabilities();
  }, 2000);
}

// Export types for external use
export type { SearchFilter, SearchConfig, SearchResult };


/**
 * Advanced Search Manager
 * Automatically provides advanced search for all modules
 */

import { supabase } from '@/integrations/supabase/client';
import { moduleRegistry } from '@/utils/moduleRegistry';

export interface SearchFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is' | 'not.is';
  value: any;
  logicalOperator?: 'and' | 'or';
}

export interface SearchConfig {
  tableName: string;
  searchableFields: string[];
  filters: SearchFilter[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  fullTextSearch?: boolean;
}

export interface SearchResult<T = any> {
  data: T[];
  count: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}

class AdvancedSearchManager {
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
      const searchableFields = await this.detectSearchableFields(tableName);
      
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
   * Auto-detects searchable fields from table structure
   */
  private async detectSearchableFields(tableName: string): Promise<string[]> {
    // Define common searchable field patterns
    const textFields = ['name', 'title', 'description', 'email', 'first_name', 'last_name', 'phone'];
    const searchableTypes = ['text', 'varchar', 'character varying'];
    
    try {
      // In a real implementation, this would query the information schema
      // For now, we'll use common patterns based on table names
      const commonFields = this.getCommonFieldsForTable(tableName);
      return commonFields.filter(field => 
        textFields.some(pattern => field.toLowerCase().includes(pattern.toLowerCase()))
      );
      
    } catch (error) {
      console.warn(`⚠️ Could not detect fields for ${tableName}:`, error);
      return this.getCommonFieldsForTable(tableName);
    }
  }

  /**
   * Returns common fields based on table name patterns
   */
  private getCommonFieldsForTable(tableName: string): string[] {
    const commonFieldsMap: Record<string, string[]> = {
      'profiles': ['first_name', 'last_name', 'email', 'phone'],
      'users': ['first_name', 'last_name', 'email', 'phone'],
      'patients': ['first_name', 'last_name', 'email', 'phone'],
      'facilities': ['name', 'address', 'email', 'phone'],
      'modules': ['name', 'description'],
      'roles': ['name', 'description'],
      'permissions': ['name', 'description']
    };

    return commonFieldsMap[tableName] || ['name', 'description', 'email'];
  }

  /**
   * Execute advanced search with filters and pagination
   */
  async executeSearch<T = any>(config: SearchConfig): Promise<SearchResult<T>> {
    console.log(`🔍 Executing advanced search for ${config.tableName}`);
    
    try {
      // Use type assertion to handle dynamic table names
      let query = (supabase as any).from(config.tableName).select('*', { count: 'exact' });

      // Apply filters
      for (const filter of config.filters) {
        query = this.applyFilter(query, filter);
      }

      // Apply sorting
      if (config.sortBy) {
        query = query.order(config.sortBy, { ascending: config.sortOrder === 'asc' });
      }

      // Apply pagination
      if (config.limit) {
        query = query.limit(config.limit);
      }
      
      if (config.offset) {
        query = query.range(config.offset, config.offset + (config.limit || 50) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      const totalCount = count || 0;
      const currentPage = Math.floor((config.offset || 0) / (config.limit || 50)) + 1;
      const totalPages = Math.ceil(totalCount / (config.limit || 50));

      const result: SearchResult<T> = {
        data: (data || []) as T[],
        count: totalCount,
        totalPages,
        currentPage,
        hasMore: currentPage < totalPages
      };

      console.log(`✅ Search completed: ${result.data.length} results found`);
      return result;

    } catch (error) {
      console.error(`❌ Search failed for ${config.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Apply individual filter to query
   */
  private applyFilter(query: any, filter: SearchFilter) {
    switch (filter.operator) {
      case 'eq':
        return query.eq(filter.field, filter.value);
      case 'neq':
        return query.neq(filter.field, filter.value);
      case 'gt':
        return query.gt(filter.field, filter.value);
      case 'gte':
        return query.gte(filter.field, filter.value);
      case 'lt':
        return query.lt(filter.field, filter.value);
      case 'lte':
        return query.lte(filter.field, filter.value);
      case 'like':
        return query.like(filter.field, filter.value);
      case 'ilike':
        return query.ilike(filter.field, `%${filter.value}%`);
      case 'in':
        return query.in(filter.field, filter.value);
      case 'is':
        return query.is(filter.field, filter.value);
      case 'not.is':
        return query.not(filter.field, 'is', filter.value);
      default:
        return query;
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

  /**
   * Execute full-text search across multiple fields
   */
  async executeFullTextSearch<T = any>(
    tableName: string, 
    searchTerm: string, 
    options?: Partial<SearchConfig>
  ): Promise<SearchResult<T>> {
    const config = this.searchConfigs.get(tableName);
    if (!config) {
      throw new Error(`No search configuration found for ${tableName}`);
    }

    const searchFilters: SearchFilter[] = config.searchableFields.map((field, index) => ({
      field,
      operator: 'ilike' as const,
      value: searchTerm,
      logicalOperator: index === 0 ? 'and' : 'or'
    }));

    const searchConfig: SearchConfig = {
      ...config,
      ...options,
      filters: searchFilters
    };

    return this.executeSearch<T>(searchConfig);
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

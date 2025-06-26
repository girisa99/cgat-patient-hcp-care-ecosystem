
/**
 * Handles query building and execution for advanced search
 */

import { supabase } from '@/integrations/supabase/client';
import { SearchConfig, SearchFilter, SearchResult } from './SearchTypes';

export class SearchQueryBuilder {
  /**
   * Execute advanced search with filters and pagination
   */
  static async executeSearch<T = any>(config: SearchConfig): Promise<SearchResult<T>> {
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
  private static applyFilter(query: any, filter: SearchFilter) {
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
   * Execute full-text search across multiple fields
   */
  static async executeFullTextSearch<T = any>(
    tableName: string, 
    searchTerm: string, 
    config: SearchConfig
  ): Promise<SearchResult<T>> {
    const searchFilters: SearchFilter[] = config.searchableFields.map((field, index) => ({
      field,
      operator: 'ilike' as const,
      value: searchTerm,
      logicalOperator: index === 0 ? 'and' : 'or'
    }));

    const searchConfig: SearchConfig = {
      ...config,
      filters: searchFilters
    };

    return this.executeSearch<T>(searchConfig);
  }
}

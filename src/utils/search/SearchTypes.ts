
/**
 * Type definitions for the Advanced Search system
 */

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

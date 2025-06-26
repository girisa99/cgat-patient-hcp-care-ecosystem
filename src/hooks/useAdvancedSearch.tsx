/**
 * Universal Advanced Search Hook
 * Automatically available for all modules
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { advancedSearchManager } from '@/utils/search';
import type { SearchConfig, SearchFilter, SearchResult } from '@/utils/search';

export interface UseAdvancedSearchOptions {
  tableName: string;
  initialFilters?: SearchFilter[];
  initialSortBy?: string;
  initialSortOrder?: 'asc' | 'desc';
  pageSize?: number;
  enableAutoSearch?: boolean;
  debounceMs?: number;
}

export const useAdvancedSearch = <T = any>(options: UseAdvancedSearchOptions) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilter[]>(options.initialFilters || []);
  const [sortBy, setSortBy] = useState(options.initialSortBy || 'created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(options.initialSortOrder || 'desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const pageSize = options.pageSize || 50;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, options.debounceMs || 300);

    return () => clearTimeout(timer);
  }, [searchTerm, options.debounceMs]);

  // Build search config
  const searchConfig: SearchConfig = {
    tableName: options.tableName,
    searchableFields: advancedSearchManager.getSearchableFields(options.tableName),
    filters,
    sortBy,
    sortOrder,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
    fullTextSearch: true
  };

  // Execute search query
  const {
    data: searchResult,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [
      'advanced-search',
      options.tableName,
      debouncedSearchTerm,
      filters,
      sortBy,
      sortOrder,
      currentPage
    ],
    queryFn: async (): Promise<SearchResult<T>> => {
      if (debouncedSearchTerm.trim()) {
        return advancedSearchManager.executeFullTextSearch<T>(
          options.tableName,
          debouncedSearchTerm,
          searchConfig
        );
      } else {
        return advancedSearchManager.executeSearch<T>(searchConfig);
      }
    },
    enabled: options.enableAutoSearch !== false,
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  // Search operations
  const executeSearch = useCallback(async () => {
    return refetch();
  }, [refetch]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setFilters(options.initialFilters || []);
    setCurrentPage(1);
  }, [options.initialFilters]);

  const addFilter = useCallback((filter: SearchFilter) => {
    setFilters(prev => [...prev, filter]);
    setCurrentPage(1);
  }, []);

  const removeFilter = useCallback((index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
    setCurrentPage(1);
  }, []);

  const updateFilter = useCallback((index: number, filter: SearchFilter) => {
    setFilters(prev => prev.map((f, i) => i === index ? filter : f));
    setCurrentPage(1);
  }, []);

  const setSort = useCallback((field: string, order: 'asc' | 'desc' = 'asc') => {
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
  }, []);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const nextPage = useCallback(() => {
    if (searchResult?.hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [searchResult?.hasMore]);

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  // Get available searchable fields
  const searchableFields = advancedSearchManager.getSearchableFields(options.tableName);

  return {
    // Data
    data: searchResult?.data || [],
    count: searchResult?.count || 0,
    totalPages: searchResult?.totalPages || 0,
    currentPage,
    hasMore: searchResult?.hasMore || false,
    
    // State
    searchTerm,
    filters,
    sortBy,
    sortOrder,
    isLoading,
    error,
    searchableFields,
    
    // Actions
    setSearchTerm,
    executeSearch,
    clearSearch,
    addFilter,
    removeFilter,
    updateFilter,
    setSort,
    goToPage,
    nextPage,
    previousPage
  };
};

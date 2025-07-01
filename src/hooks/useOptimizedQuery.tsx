
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { queryOptimizer } from '@/utils/performance/QueryOptimizer';
import { useErrorHandler } from './useErrorHandler';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryFn'> {
  queryFn: () => Promise<T>;
  cacheTime?: number;
  staleWhileRevalidate?: boolean;
  component?: string;
}

export const useOptimizedQuery = <T,>(options: OptimizedQueryOptions<T>) => {
  const { handleAsyncError } = useErrorHandler({ 
    component: options.component 
  });

  const {
    queryKey,
    queryFn,
    cacheTime = 300000, // 5 minutes
    staleWhileRevalidate = false,
    component,
    ...restOptions
  } = options;

  const optimizedQueryFn = async (): Promise<T> => {
    const keyString = Array.isArray(queryKey) ? queryKey.join(':') : String(queryKey);
    
    return queryOptimizer.executeQuery(
      keyString,
      queryFn,
      {
        ttl: cacheTime,
        staleWhileRevalidate,
        deduplicate: true
      }
    );
  };

  const wrappedQueryFn = async (): Promise<T> => {
    const result = await handleAsyncError(optimizedQueryFn, {
      queryKey: queryKey,
      component
    });
    
    if (result === null) {
      throw new Error('Query failed and was handled by error manager');
    }
    
    return result;
  };

  return useQuery({
    ...restOptions,
    queryKey,
    queryFn: wrappedQueryFn,
    staleTime: cacheTime * 0.8, // Consider stale after 80% of cache time
    gcTime: cacheTime * 2 // Garbage collect after 2x cache time
  });
};

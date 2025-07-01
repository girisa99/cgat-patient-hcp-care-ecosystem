
import { useQuery } from '@tanstack/react-query';
import { useErrorHandler } from './useErrorHandler';

interface OptimizedQueryOptions {
  queryKey: string[];
  queryFn: () => Promise<any>;
  cacheTime?: number;
  staleWhileRevalidate?: boolean;
  component: string;
}

export const useOptimizedQuery = ({
  queryKey,
  queryFn,
  cacheTime = 300000,
  staleWhileRevalidate = true,
  component
}: OptimizedQueryOptions) => {
  const { handleError } = useErrorHandler({ component });

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (error) {
        handleError(error, { operation: 'query-execution' });
        throw error;
      }
    },
    staleTime: staleWhileRevalidate ? cacheTime / 2 : cacheTime,
    gcTime: cacheTime,
    retry: (failureCount, error) => {
      console.log(`🔄 Query retry attempt ${failureCount}:`, error);
      return failureCount < 3;
    }
  });
};

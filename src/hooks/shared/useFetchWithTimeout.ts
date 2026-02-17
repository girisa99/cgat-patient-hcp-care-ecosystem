/**
 * Consolidated Fetch Utility with Timeout Support
 * Provides AbortController-based timeout handling for all fetch operations
 * 
 * Fixes common issues:
 * - Hanging requests without timeout
 * - Missing AbortController cleanup
 * - Inconsistent error handling
 */

import { useCallback, useRef, useEffect } from 'react';

export interface FetchWithTimeoutOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  onTimeout?: () => void;
  onRetry?: (attempt: number, error: Error) => void;
}

export interface FetchResult<T> {
  data: T | null;
  error: Error | null;
  status: number | null;
  timedOut: boolean;
  aborted: boolean;
}

/**
 * Performs a fetch request with timeout support
 */
export async function fetchWithTimeout<T = unknown>(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<FetchResult<T>> {
  const {
    timeoutMs = 30000,
    retries = 0,
    retryDelayMs = 1000,
    onTimeout,
    onRetry,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json() as T;

      return {
        data,
        error: null,
        status: response.status,
        timedOut: false,
        aborted: false,
      };
    } catch (err) {
      clearTimeout(timeoutId);

      const error = err as Error;
      lastError = error;

      // Check if aborted due to timeout
      if (error.name === 'AbortError') {
        onTimeout?.();
        
        // Don't retry on timeout by default
        return {
          data: null,
          error: new Error(`Request timed out after ${timeoutMs}ms`),
          status: null,
          timedOut: true,
          aborted: true,
        };
      }

      // Retry logic
      if (attempt < retries) {
        onRetry?.(attempt + 1, error);
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        attempt++;
        continue;
      }

      return {
        data: null,
        error,
        status: null,
        timedOut: false,
        aborted: error.name === 'AbortError',
      };
    }
  }

  return {
    data: null,
    error: lastError || new Error('Unknown fetch error'),
    status: null,
    timedOut: false,
    aborted: false,
  };
}

/**
 * Hook for making fetch requests with automatic cleanup and timeout
 */
export function useFetchWithTimeout() {
  const abortControllersRef = useRef<Set<AbortController>>(new Set());

  // Cleanup all pending requests on unmount
  useEffect(() => {
    return () => {
      abortControllersRef.current.forEach((controller) => {
        controller.abort();
      });
      abortControllersRef.current.clear();
    };
  }, []);

  const fetchWithAbort = useCallback(async <T = unknown>(
    url: string,
    options: FetchWithTimeoutOptions = {}
  ): Promise<FetchResult<T>> => {
    const {
      timeoutMs = 30000,
      ...fetchOptions
    } = options;

    const controller = new AbortController();
    abortControllersRef.current.add(controller);

    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      abortControllersRef.current.delete(controller);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json() as T;

      return {
        data,
        error: null,
        status: response.status,
        timedOut: false,
        aborted: false,
      };
    } catch (err) {
      clearTimeout(timeoutId);
      abortControllersRef.current.delete(controller);

      const error = err as Error;

      if (error.name === 'AbortError') {
        return {
          data: null,
          error: new Error(`Request timed out after ${timeoutMs}ms`),
          status: null,
          timedOut: true,
          aborted: true,
        };
      }

      return {
        data: null,
        error,
        status: null,
        timedOut: false,
        aborted: false,
      };
    }
  }, []);

  const abortAll = useCallback(() => {
    abortControllersRef.current.forEach((controller) => {
      controller.abort();
    });
    abortControllersRef.current.clear();
  }, []);

  return {
    fetch: fetchWithAbort,
    abortAll,
  };
}

/**
 * Create a fetch function with pre-configured options for edge functions
 */
export function createEdgeFunctionFetcher(
  supabaseUrl: string,
  supabaseKey: string,
  defaultTimeoutMs: number = 30000
) {
  return async <T = unknown>(
    functionName: string,
    body: Record<string, unknown>,
    options: Partial<FetchWithTimeoutOptions> = {}
  ): Promise<FetchResult<T>> => {
    const url = `${supabaseUrl}/functions/v1/${functionName}`;
    
    return fetchWithTimeout<T>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify(body),
      timeoutMs: defaultTimeoutMs,
      ...options,
    });
  };
}

/**
 * Convenience wrapper for Supabase edge function calls
 */
export async function callEdgeFunction<T = unknown>(
  supabaseUrl: string,
  supabaseKey: string,
  functionName: string,
  body: Record<string, unknown>,
  timeoutMs: number = 30000
): Promise<FetchResult<T>> {
  const fetcher = createEdgeFunctionFetcher(supabaseUrl, supabaseKey, timeoutMs);
  return fetcher<T>(functionName, body);
}

export default useFetchWithTimeout;

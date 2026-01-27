/**
 * Lazy Loading with Retry - Handles stale chunk errors after deployments
 * 
 * This utility wraps React.lazy() to automatically retry failed imports
 * which commonly happen when the app has been updated but the browser
 * has cached old chunk references.
 */

import React from 'react';

type ComponentImport<T> = () => Promise<{ default: T }>;

/**
 * Wraps React.lazy with retry logic for failed dynamic imports
 * @param importFn - The import function to wrap
 * @param retries - Number of retry attempts (default: 3)
 * @param retryDelay - Delay between retries in ms (default: 1000)
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  importFn: ComponentImport<T>,
  retries: number = 3,
  retryDelay: number = 1000,
  timeout: number = 30000 // 30 second timeout
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    let lastError: Error | undefined;
    
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Module load timeout - the page is taking too long to load. Please refresh.'));
      }, timeout);
    });
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // Race between import and timeout
        const result = await Promise.race([
          importFn(),
          timeoutPromise
        ]);
        return result;
      } catch (error) {
        lastError = error as Error;
        
        // Check if it's a timeout error
        const isTimeoutError = error instanceof Error && error.message.includes('timeout');
        
        // Check if it's a chunk loading error
        const isChunkError = 
          error instanceof Error && 
          (error.message.includes('Failed to fetch dynamically imported module') ||
           error.message.includes('Loading chunk') ||
           error.message.includes('ChunkLoadError'));
        
        if (isChunkError || isTimeoutError) {
          console.warn(`[lazyWithRetry] Load failed (attempt ${attempt + 1}/${retries}):`, error);
          
          // If this is not the last attempt, wait and retry
          if (attempt < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          }
          
          // On final failure, check if we should reload
          console.error('[lazyWithRetry] All retry attempts failed');
          
          const lastReload = sessionStorage.getItem('last_chunk_reload');
          
          if (lastReload) {
            const timeSinceLastReload = Date.now() - parseInt(lastReload, 10);
            if (timeSinceLastReload < 10000) {
              // Prevent reload loop - show error instead
              throw new Error(
                'Failed to load page. Please try refreshing manually (Ctrl+Shift+R).'
              );
            }
          }
          
          sessionStorage.setItem('last_chunk_reload', Date.now().toString());
          window.location.reload();
          
          return new Promise(() => {});
        }
        
        // For non-chunk errors, just throw immediately
        throw error;
      }
    }
    
    throw lastError || new Error('Failed to load module after retries');
  });
}

/**
 * Pre-defined lazy loaders for commonly used pages
 * GenieStudio has extended timeout (60s) due to its size
 * Note: GenieArc removed - merged into Production Hub (/genie-admin)
 */
export const LazyPages = {
  GenieStudio: lazyWithRetry(() => import('@/pages/GenieStudio'), 3, 2000, 60000), // 60s timeout for large file
  GenieSpark: lazyWithRetry(() => import('@/pages/GenieSpark')),
  GenieMind: lazyWithRetry(() => import('@/pages/GenieMind')),
  GenieVibe: lazyWithRetry(() => import('@/pages/GenieVibe')),
  ProductionHub: lazyWithRetry(() => import('@/pages/ProductionHub')),
};

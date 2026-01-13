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
  retryDelay: number = 1000
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await importFn();
      } catch (error) {
        lastError = error as Error;
        
        // Check if it's a chunk loading error
        const isChunkError = 
          error instanceof Error && 
          (error.message.includes('Failed to fetch dynamically imported module') ||
           error.message.includes('Loading chunk') ||
           error.message.includes('ChunkLoadError'));
        
        if (isChunkError) {
          console.warn(`[lazyWithRetry] Chunk load failed (attempt ${attempt + 1}/${retries}):`, error);
          
          // If this is not the last attempt, wait and retry
          if (attempt < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            
            // On first retry, try to refresh by adding cache-busting query
            if (attempt === 0) {
              // Clear any cached modules (this helps with Vite HMR issues)
              if (typeof window !== 'undefined') {
                console.log('[lazyWithRetry] Clearing module cache and retrying...');
              }
            }
            continue;
          }
          
          // On final failure, show a user-friendly message and offer reload
          console.error('[lazyWithRetry] All retry attempts failed, reloading page...');
          
          // Store that we're reloading to prevent infinite loops
          const reloadKey = 'app_chunk_reload_' + Date.now();
          const lastReload = sessionStorage.getItem('last_chunk_reload');
          
          if (lastReload) {
            const timeSinceLastReload = Date.now() - parseInt(lastReload, 10);
            if (timeSinceLastReload < 5000) {
              // Prevent reload loop - we just reloaded
              console.error('[lazyWithRetry] Reload loop detected, showing error instead');
              throw new Error(
                'Failed to load page component. Please try refreshing the page manually (Ctrl+Shift+R or Cmd+Shift+R).'
              );
            }
          }
          
          sessionStorage.setItem('last_chunk_reload', Date.now().toString());
          window.location.reload();
          
          // Return a never-resolving promise while page reloads
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
 */
export const LazyPages = {
  GenieStudio: lazyWithRetry(() => import('@/pages/GenieStudio'), 3, 2000),
  GenieSpark: lazyWithRetry(() => import('@/pages/GenieSpark')),
  GenieArc: lazyWithRetry(() => import('@/pages/GenieArc')),
  GenieMind: lazyWithRetry(() => import('@/pages/GenieMind')),
  GenieVibe: lazyWithRetry(() => import('@/pages/GenieVibe')),
  ProductionHub: lazyWithRetry(() => import('@/pages/ProductionHub')),
};

/**
 * Query Optimization and Caching System
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

interface QueryStats {
  queryKey: string;
  executionTime: number;
  cacheHit: boolean;
  timestamp: number;
}

export class QueryOptimizer {
  private static instance: QueryOptimizer;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private queryStats: QueryStats[] = [];
  private pendingQueries: Map<string, Promise<any>> = new Map();

  static getInstance(): QueryOptimizer {
    if (!QueryOptimizer.instance) {
      QueryOptimizer.instance = new QueryOptimizer();
    }
    return QueryOptimizer.instance;
  }

  /**
   * Execute a query with caching and deduplication
   */
  async executeQuery<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    options: {
      ttl?: number; // Time to live in milliseconds
      staleWhileRevalidate?: boolean;
      deduplicate?: boolean;
    } = {}
  ): Promise<T> {
    const {
      ttl = 300000, // 5 minutes default
      staleWhileRevalidate = false,
      deduplicate = true
    } = options;

    const startTime = performance.now();

    // Check for existing pending query (deduplication)
    if (deduplicate && this.pendingQueries.has(queryKey)) {
      console.log(`🔄 Deduplicating query: ${queryKey}`);
      const result = await this.pendingQueries.get(queryKey)!;
      this.recordQueryStats(queryKey, performance.now() - startTime, true);
      return result;
    }

    // Check cache first
    const cachedEntry = this.cache.get(queryKey);
    const now = Date.now();

    if (cachedEntry && now - cachedEntry.timestamp < cachedEntry.ttl) {
      console.log(`💾 Cache hit for: ${queryKey}`);
      this.recordQueryStats(queryKey, performance.now() - startTime, true);
      
      // If stale-while-revalidate, trigger background refresh
      if (staleWhileRevalidate && now - cachedEntry.timestamp > cachedEntry.ttl * 0.8) {
        this.backgroundRefresh(queryKey, queryFn, ttl);
      }
      
      return cachedEntry.data;
    }

    // Execute query
    console.log(`🔃 Executing fresh query: ${queryKey}`);
    const queryPromise = this.executeWithTimeout(queryFn, 30000); // 30s timeout
    
    if (deduplicate) {
      this.pendingQueries.set(queryKey, queryPromise);
    }

    try {
      const result = await queryPromise;
      
      // Cache the result
      this.cache.set(queryKey, {
        data: result,
        timestamp: now,
        ttl,
        key: queryKey
      });

      this.recordQueryStats(queryKey, performance.now() - startTime, false);
      return result;
    } finally {
      if (deduplicate) {
        this.pendingQueries.delete(queryKey);
      }
    }
  }

  /**
   * Execute query with timeout
   */
  private async executeWithTimeout<T>(queryFn: () => Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      queryFn(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Query timeout after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }

  /**
   * Background refresh for stale-while-revalidate
   */
  private async backgroundRefresh<T>(queryKey: string, queryFn: () => Promise<T>, ttl: number): void {
    try {
      const result = await queryFn();
      this.cache.set(queryKey, {
        data: result,
        timestamp: Date.now(),
        ttl,
        key: queryKey
      });
      console.log(`🔄 Background refresh completed for: ${queryKey}`);
    } catch (error) {
      console.warn(`Background refresh failed for ${queryKey}:`, error);
    }
  }

  /**
   * Record query statistics
   */
  private recordQueryStats(queryKey: string, executionTime: number, cacheHit: boolean): void {
    this.queryStats.push({
      queryKey,
      executionTime,
      cacheHit,
      timestamp: Date.now()
    });

    // Keep only last 1000 stats
    if (this.queryStats.length > 1000) {
      this.queryStats = this.queryStats.slice(-1000);
    }
  }

  /**
   * Invalidate cache entries
   */
  invalidateCache(pattern?: string | RegExp): number {
    let invalidatedCount = 0;

    if (!pattern) {
      // Clear all cache
      invalidatedCount = this.cache.size;
      this.cache.clear();
    } else if (typeof pattern === 'string') {
      // Invalidate by exact key or prefix
      for (const [key] of this.cache) {
        if (key === pattern || key.startsWith(pattern)) {
          this.cache.delete(key);
          invalidatedCount++;
        }
      }
    } else {
      // Invalidate by regex pattern
      for (const [key] of this.cache) {
        if (pattern.test(key)) {
          this.cache.delete(key);
          invalidatedCount++;
        }
      }
    }

    console.log(`🗑️ Invalidated ${invalidatedCount} cache entries`);
    return invalidatedCount;
  }

  /**
   * Clean expired cache entries
   */
  cleanExpiredCache(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    console.log(`🧹 Cleaned ${cleanedCount} expired cache entries`);
    return cleanedCount;
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    cacheStats: {
      size: number;
      hitRate: number;
      avgExecutionTime: number;
    };
    queryStats: {
      totalQueries: number;
      slowQueries: QueryStats[];
      frequentQueries: Array<{ queryKey: string; count: number }>;
    };
  } {
    const recentStats = this.queryStats.filter(stat => 
      Date.now() - stat.timestamp < 3600000 // Last hour
    );

    const cacheHits = recentStats.filter(stat => stat.cacheHit).length;
    const totalQueries = recentStats.length;
    const avgExecutionTime = recentStats.reduce((sum, stat) => sum + stat.executionTime, 0) / totalQueries || 0;

    // Find slow queries (>1000ms)
    const slowQueries = recentStats
      .filter(stat => stat.executionTime > 1000)
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10);

    // Find frequent queries
    const queryFrequency = recentStats.reduce((acc, stat) => {
      acc[stat.queryKey] = (acc[stat.queryKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const frequentQueries = Object.entries(queryFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([queryKey, count]) => ({ queryKey, count }));

    return {
      cacheStats: {
        size: this.cache.size,
        hitRate: totalQueries > 0 ? (cacheHits / totalQueries) * 100 : 0,
        avgExecutionTime
      },
      queryStats: {
        totalQueries,
        slowQueries,
        frequentQueries
      }
    };
  }
}

// Global query optimizer instance
export const queryOptimizer = QueryOptimizer.getInstance();

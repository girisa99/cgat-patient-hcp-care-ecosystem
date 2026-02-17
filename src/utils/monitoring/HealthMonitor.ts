
/**
 * Application Health Monitoring System
 */

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'unhealthy' | 'unknown';
  message?: string;
  responseTime?: number;
  lastChecked: Date;
  metadata?: Record<string, any>;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
  uptime: number;
  timestamp: Date;
}

export class HealthMonitor {
  private static instance: HealthMonitor;
  private healthChecks: Map<string, () => Promise<HealthCheck>> = new Map();
  private lastHealthCheck?: SystemHealth;
  private startTime: Date = new Date();

  static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor();
      HealthMonitor.instance.initializeDefaultChecks();
    }
    return HealthMonitor.instance;
  }

  /**
   * Register a health check
   */
  registerHealthCheck(name: string, checkFn: () => Promise<HealthCheck>): void {
    this.healthChecks.set(name, checkFn);
    console.log(`📊 Registered health check: ${name}`);
  }

  /**
   * Run all health checks
   */
  async runHealthChecks(): Promise<SystemHealth> {
    console.log('🔍 Running health checks...');
    const startTime = performance.now();

    const checks: HealthCheck[] = [];
    
    for (const [name, checkFn] of this.healthChecks) {
      try {
        const check = await Promise.race([
          checkFn(),
          this.createTimeoutCheck(name, 5000) // 5 second timeout
        ]);
        checks.push(check);
      } catch (error) {
        checks.push({
          name,
          status: 'unhealthy',
          message: error instanceof Error ? error.message : 'Unknown error',
          lastChecked: new Date()
        });
      }
    }

    const overall = this.determineOverallHealth(checks);
    const totalTime = performance.now() - startTime;

    const systemHealth: SystemHealth = {
      overall,
      checks,
      uptime: Date.now() - this.startTime.getTime(),
      timestamp: new Date()
    };

    this.lastHealthCheck = systemHealth;
    console.log(`✅ Health check completed in ${totalTime.toFixed(2)}ms - Status: ${overall}`);

    return systemHealth;
  }

  /**
   * Get last health check results
   */
  getLastHealthCheck(): SystemHealth | undefined {
    return this.lastHealthCheck;
  }

  /**
   * Create timeout check
   */
  private async createTimeoutCheck(name: string, timeoutMs: number): Promise<HealthCheck> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Health check timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }

  /**
   * Determine overall system health
   */
  private determineOverallHealth(checks: HealthCheck[]): SystemHealth['overall'] {
    const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length;
    const warningCount = checks.filter(c => c.status === 'warning').length;

    if (unhealthyCount > 0) {
      return 'unhealthy';
    } else if (warningCount > 0) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  /**
   * Initialize default health checks
   */
  private initializeDefaultChecks(): void {
    // Browser API availability check
    this.registerHealthCheck('browser-apis', async () => {
      const startTime = performance.now();
      const issues: string[] = [];

      if (!window.localStorage) issues.push('localStorage not available');
      if (!window.sessionStorage) issues.push('sessionStorage not available');
      if (!window.fetch) issues.push('fetch API not available');
      if (!window.WebSocket) issues.push('WebSocket not available');

      return {
        name: 'browser-apis',
        status: issues.length === 0 ? 'healthy' : 'warning',
        message: issues.length > 0 ? `Issues: ${issues.join(', ')}` : 'All APIs available',
        responseTime: performance.now() - startTime,
        lastChecked: new Date(),
        metadata: { issues }
      };
    });

    // Memory usage check
    this.registerHealthCheck('memory-usage', async () => {
      const startTime = performance.now();
      
      // @ts-ignore - performance.memory might not be available in all browsers
      const memory = (performance as any).memory;
      
      if (!memory) {
        return {
          name: 'memory-usage',
          status: 'unknown',
          message: 'Memory API not available',
          responseTime: performance.now() - startTime,
          lastChecked: new Date()
        };
      }

      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
      
      const usagePercentage = (usedMB / limitMB) * 100;
      
      let status: HealthCheck['status'] = 'healthy';
      if (usagePercentage > 80) status = 'unhealthy';
      else if (usagePercentage > 60) status = 'warning';

      return {
        name: 'memory-usage',
        status,
        message: `Using ${usedMB}MB of ${limitMB}MB (${usagePercentage.toFixed(1)}%)`,
        responseTime: performance.now() - startTime,
        lastChecked: new Date(),
        metadata: { usedMB, totalMB, limitMB, usagePercentage }
      };
    });

    // Performance check
    this.registerHealthCheck('performance', async () => {
      const startTime = performance.now();
      
      // Simple performance test
      const iterations = 10000;
      const testStart = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        Math.random() * Math.random();
      }
      
      const testDuration = performance.now() - testStart;
      const opsPerSecond = Math.round(iterations / (testDuration / 1000));
      
      let status: HealthCheck['status'] = 'healthy';
      if (opsPerSecond < 100000) status = 'warning';
      if (opsPerSecond < 50000) status = 'unhealthy';

      return {
        name: 'performance',
        status,
        message: `${opsPerSecond.toLocaleString()} ops/sec`,
        responseTime: performance.now() - startTime,
        lastChecked: new Date(),
        metadata: { opsPerSecond, testDuration }
      };
    });

    // Local storage check
    this.registerHealthCheck('local-storage', async () => {
      const startTime = performance.now();
      
      try {
        const testKey = '_health_check_test';
        const testValue = Date.now().toString();
        
        localStorage.setItem(testKey, testValue);
        const retrieved = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        
        const isWorking = retrieved === testValue;
        
        return {
          name: 'local-storage',
          status: isWorking ? 'healthy' : 'unhealthy',
          message: isWorking ? 'LocalStorage working correctly' : 'LocalStorage failed test',
          responseTime: performance.now() - startTime,
          lastChecked: new Date()
        };
      } catch (error) {
        return {
          name: 'local-storage',
          status: 'unhealthy',
          message: error instanceof Error ? error.message : 'LocalStorage error',
          responseTime: performance.now() - startTime,
          lastChecked: new Date()
        };
      }
    });
  }

  /**
   * Get system metrics
   */
  getSystemMetrics(): {
    uptime: number;
    memoryUsage?: {
      used: number;
      total: number;
      limit: number;
    };
    performanceMetrics: {
      navigation?: PerformanceNavigationTiming;
      paint?: PerformancePaintTiming[];
    };
  } {
    const uptime = Date.now() - this.startTime.getTime();
    
    // @ts-ignore
    const memory = (performance as any).memory;
    const memoryUsage = memory ? {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
    } : undefined;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint') as PerformancePaintTiming[];

    return {
      uptime,
      memoryUsage,
      performanceMetrics: {
        navigation,
        paint
      }
    };
  }
}

// Global health monitor instance
export const healthMonitor = HealthMonitor.getInstance();

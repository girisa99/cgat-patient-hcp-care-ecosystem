
import { useState, useEffect, useCallback } from 'react';
import { healthMonitor, SystemHealth } from '@/utils/monitoring/HealthMonitor';

export interface UseHealthMonitorOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  onHealthChange?: (health: SystemHealth) => void;
}

export const useHealthMonitor = (options: UseHealthMonitorOptions = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    onHealthChange
  } = options;

  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runHealthCheck = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const healthResult = await healthMonitor.runHealthChecks();
      setHealth(healthResult);
      
      if (onHealthChange) {
        onHealthChange(healthResult);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Health check failed';
      setError(errorMessage);
      console.error('Health check failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [onHealthChange]);

  // Auto refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(runHealthCheck, refreshInterval);
    
    // Run initial check
    runHealthCheck();

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, runHealthCheck]);

  // Get last health check on mount
  useEffect(() => {
    const lastHealth = healthMonitor.getLastHealthCheck();
    if (lastHealth) {
      setHealth(lastHealth);
    }
  }, []);

  const getSystemMetrics = useCallback(() => {
    return healthMonitor.getSystemMetrics();
  }, []);

  const registerHealthCheck = useCallback((name: string, checkFn: () => Promise<any>) => {
    healthMonitor.registerHealthCheck(name, checkFn);
  }, []);

  return {
    health,
    isLoading,
    error,
    runHealthCheck,
    getSystemMetrics,
    registerHealthCheck
  };
};

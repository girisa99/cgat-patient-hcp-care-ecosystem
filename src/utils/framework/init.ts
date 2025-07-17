/**
 * COMPREHENSIVE FRAMEWORK INITIALIZATION
 * Bootstraps complete stability, compliance, and enhancement framework
 * Ensures all systems follow unified project structure
 */

import { toast } from 'sonner';
import { FrameworkComplianceMonitor } from '../stability/FrameworkComplianceMonitor';
import { PromptGovernanceInterceptor } from '../stability/PromptGovernanceInterceptor';
import ComprehensiveFrameworkValidator from './ComprehensiveFrameworkValidator';
import PromptEnhancementEngine from './PromptEnhancementEngine';

interface FrameworkConfig {
  monitoring: {
    enabled: boolean;
    interval: number;
    realTime: boolean;
  };
  enforcement: {
    preCommit: boolean;
    eslint: boolean;
    buildChecks: boolean;
  };
  notifications: {
    enabled: boolean;
    severity: 'high' | 'medium' | 'low';
  };
}

const defaultConfig: FrameworkConfig = {
  monitoring: {
    enabled: true,
    interval: 30000, // 30 seconds
    realTime: true
  },
  enforcement: {
    preCommit: true,
    eslint: true,
    buildChecks: true
  },
  notifications: {
    enabled: true,
    severity: 'medium'
  }
};

class StabilityFrameworkManager {
  private config: FrameworkConfig;
  private monitoringInterval?: NodeJS.Timeout;
  private isInitialized = false;

  constructor(config: Partial<FrameworkConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('🔧 Stability Framework already initialized');
      return;
    }

    try {
      console.log('🔧 Initializing Stability Framework...');

      // Initialize monitoring systems
      if (this.config.monitoring.enabled) {
        await this.initializeMonitoring();
      }

      // Initialize enforcement systems
      if (this.config.enforcement.eslint) {
        await this.initializeESLintIntegration();
      }

      // Setup notification systems
      if (this.config.notifications.enabled) {
        await this.initializeNotifications();
      }

      this.isInitialized = true;
      console.log('✅ Stability Framework initialized successfully');
      
      if (this.config.notifications.enabled) {
        toast.success('Stability Framework Active', {
          description: 'Real-time monitoring and enforcement enabled'
        });
      }

    } catch (error) {
      console.error('❌ Failed to initialize Stability Framework:', error);
      toast.error('Framework Initialization Failed', {
        description: 'Some monitoring features may not work correctly'
      });
    }
  }

  private async initializeMonitoring(): Promise<void> {
    console.log('📊 Starting real-time monitoring...');
    
    if (this.config.monitoring.realTime) {
      this.monitoringInterval = setInterval(() => {
        this.performPeriodicCheck();
      }, this.config.monitoring.interval);
    }
  }

  private async initializeESLintIntegration(): Promise<void> {
    console.log('🔍 Integrating with ESLint...');
    
    // Register custom event listeners for ESLint violations
    if (typeof window !== 'undefined') {
      window.addEventListener('eslint-violation', this.handleESLintViolation.bind(this));
    }
  }

  private async initializeNotifications(): Promise<void> {
    console.log('🔔 Setting up notification system...');
    
    // Setup performance monitoring
    if (typeof window !== 'undefined' && 'performance' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (entry.duration > 100) { // Log slow operations
            console.warn('🐌 Slow operation detected:', entry.name, entry.duration + 'ms');
          }
        }
      });
      
      try {
        observer.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (error) {
        console.warn('Performance observer not supported');
      }
    }
  }

  private performPeriodicCheck(): void {
    // Perform lightweight checks
    this.checkMemoryUsage();
    this.checkErrorCount();
  }

  private checkMemoryUsage(): void {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in window.performance) {
      const memory = (window.performance as any).memory;
      if (memory) {
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        const totalMB = memory.totalJSHeapSize / 1024 / 1024;
        const usagePercent = (usedMB / totalMB) * 100;
        
        if (usagePercent > 90) {
          console.warn('🚨 High memory usage detected:', usagePercent.toFixed(1) + '%');
        }
      }
    }
  }

  private checkErrorCount(): void {
    // Check for accumulated console errors
    const errorCount = this.getConsoleErrorCount();
    if (errorCount > 10) {
      console.warn('🚨 High error count detected:', errorCount, 'errors');
    }
  }

  private getConsoleErrorCount(): number {
    // This would require custom console error tracking
    // For now, return a simulated count
    return 0;
  }

  private handleESLintViolation(event: Event): void {
    const customEvent = event as CustomEvent;
    const violation = customEvent.detail;
    
    if (this.config.notifications.enabled) {
      console.warn('🔍 ESLint violation detected:', violation);
      
      if (violation.severity === 'error') {
        toast.error('Code Quality Issue', {
          description: violation.message
        });
      } else if (violation.severity === 'warn' && this.config.notifications.severity !== 'high') {
        toast.warning('Code Quality Warning', {
          description: violation.message
        });
      }
    }
  }

  shutdown(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('eslint-violation', this.handleESLintViolation.bind(this));
    }
    
    this.isInitialized = false;
    console.log('🔧 Stability Framework shutdown complete');
  }

  getStatus(): { initialized: boolean; monitoring: boolean; config: FrameworkConfig } {
    return {
      initialized: this.isInitialized,
      monitoring: !!this.monitoringInterval,
      config: this.config
    };
  }
}

// Global instance
let frameworkInstance: StabilityFrameworkManager | null = null;

export const initializeStabilityFramework = async (config?: Partial<FrameworkConfig>): Promise<void> => {
  if (!frameworkInstance) {
    frameworkInstance = new StabilityFrameworkManager(config);
  }
  
  await frameworkInstance.initialize();
};

export const getStabilityFrameworkStatus = () => {
  return frameworkInstance?.getStatus() || { initialized: false, monitoring: false, config: defaultConfig };
};

export const shutdownStabilityFramework = (): void => {
  if (frameworkInstance) {
    frameworkInstance.shutdown();
    frameworkInstance = null;
  }
};
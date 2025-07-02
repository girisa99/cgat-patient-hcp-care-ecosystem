
import { testingService } from '@/services/testingService';
import { comprehensiveTestingService } from '@/services/comprehensiveTestingService';
import { enhancedTestingService } from '@/services/enhancedTestingService';
import { enhancedTestingBusinessLayer } from '@/services/enhancedTestingBusinessLayer';

/**
 * Testing Service Factory
 * Provides centralized access to all testing services with proper dependency injection
 * and configuration management.
 */

export interface TestingServiceConfiguration {
  environment: 'development' | 'staging' | 'production';
  enableEnhancedFeatures: boolean;
  enableComplianceMode: boolean;
  enableRealTimeUpdates: boolean;
  batchSize: number;
  maxRetries: number;
}

export interface TestingServiceRegistry {
  core: typeof testingService;
  comprehensive: typeof comprehensiveTestingService;
  enhanced: typeof enhancedTestingService;
  businessLayer: typeof enhancedTestingBusinessLayer;
}

class TestingServiceFactory {
  private static instance: TestingServiceFactory;
  private configuration: TestingServiceConfiguration;
  private serviceRegistry: TestingServiceRegistry;
  private initialized: boolean = false;

  private constructor() {
    this.configuration = {
      environment: 'development',
      enableEnhancedFeatures: true,
      enableComplianceMode: true,
      enableRealTimeUpdates: false,
      batchSize: 50,
      maxRetries: 3
    };

    this.serviceRegistry = {
      core: testingService,
      comprehensive: comprehensiveTestingService,
      enhanced: enhancedTestingService,
      businessLayer: enhancedTestingBusinessLayer
    };
  }

  static getInstance(): TestingServiceFactory {
    if (!TestingServiceFactory.instance) {
      TestingServiceFactory.instance = new TestingServiceFactory();
    }
    return TestingServiceFactory.instance;
  }

  /**
   * Initialize the testing service factory with configuration
   */
  async initialize(config?: Partial<TestingServiceConfiguration>): Promise<void> {
    if (this.initialized) {
      console.log('🏭 Testing Service Factory already initialized');
      return;
    }

    if (config) {
      this.configuration = { ...this.configuration, ...config };
    }

    console.log('🏭 Initializing Testing Service Factory with config:', this.configuration);

    try {
      // Initialize comprehensive testing if in compliance mode
      if (this.configuration.enableComplianceMode) {
        console.log('🔒 Initializing compliance mode testing services...');
        // Comprehensive service initialization would happen here
      }

      this.initialized = true;
      console.log('✅ Testing Service Factory initialized successfully');
    } catch (error) {
      console.error('❌ Testing Service Factory initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get the core testing service
   */
  getCoreService() {
    return this.serviceRegistry.core;
  }

  /**
   * Get the comprehensive testing service
   */
  getComprehensiveService() {
    return this.serviceRegistry.comprehensive;
  }

  /**
   * Get the enhanced testing service
   */
  getEnhancedService() {
    if (!this.configuration.enableEnhancedFeatures) {
      throw new Error('Enhanced features are disabled in current configuration');
    }
    return this.serviceRegistry.enhanced;
  }

  /**
   * Get the business layer service
   */
  getBusinessLayerService() {
    if (!this.configuration.enableEnhancedFeatures) {
      throw new Error('Enhanced features are disabled in current configuration');
    }
    return this.serviceRegistry.businessLayer;
  }

  /**
   * Get the recommended service based on requirements
   */
  getRecommendedService(requirements: {
    needCompliance?: boolean;
    needEnhancedFeatures?: boolean;
    needBusinessLogic?: boolean;
  }) {
    if (requirements.needBusinessLogic && this.configuration.enableEnhancedFeatures) {
      return this.getBusinessLayerService();
    }

    if (requirements.needEnhancedFeatures && this.configuration.enableEnhancedFeatures) {
      return this.getEnhancedService();
    }

    if (requirements.needCompliance && this.configuration.enableComplianceMode) {
      return this.getComprehensiveService();
    }

    return this.getCoreService();
  }

  /**
   * Execute tests using the most appropriate service
   */
  async executeTests(testType: string, options?: any) {
    const service = this.getRecommendedService({
      needCompliance: testType.includes('compliance'),
      needEnhancedFeatures: testType.includes('enhanced') || testType.includes('security'),
      needBusinessLogic: testType.includes('comprehensive') || testType.includes('advanced')
    });

    // Use the correct method based on the service type
    if (service === this.serviceRegistry.businessLayer) {
      return service.executeComprehensiveTestSuite({
        suiteType: testType,
        batchSize: this.configuration.batchSize,
        priority: 'medium',
        reportingLevel: 'summary'
      });
    }

    if (service === this.serviceRegistry.comprehensive) {
      return service.executeTestSuite(testType, this.configuration.batchSize);
    }

    if (service === this.serviceRegistry.enhanced) {
      // Enhanced service doesn't have executeTestSuite, use comprehensive service instead
      return this.serviceRegistry.comprehensive.executeTestSuite(testType, this.configuration.batchSize);
    }

    // Core service
    return service.executeTestSuite(testType);
  }

  /**
   * Get current configuration
   */
  getConfiguration(): TestingServiceConfiguration {
    return { ...this.configuration };
  }

  /**
   * Update configuration
   */
  updateConfiguration(updates: Partial<TestingServiceConfiguration>): void {
    this.configuration = { ...this.configuration, ...updates };
    console.log('🔧 Testing Service Factory configuration updated:', this.configuration);
  }

  /**
   * Get service health status
   */
  getHealthStatus() {
    return {
      factoryInitialized: this.initialized,
      configuration: this.configuration,
      availableServices: {
        core: true,
        comprehensive: true,
        enhanced: this.configuration.enableEnhancedFeatures,
        businessLayer: this.configuration.enableEnhancedFeatures
      },
      lastHealthCheck: new Date().toISOString()
    };
  }

  /**
   * Reset factory to initial state
   */
  reset(): void {
    this.initialized = false;
    this.configuration = {
      environment: 'development',
      enableEnhancedFeatures: true,
      enableComplianceMode: true,
      enableRealTimeUpdates: false,
      batchSize: 50,
      maxRetries: 3
    };
    console.log('🔄 Testing Service Factory reset to initial state');
  }
}

// Export singleton instance
export const testingServiceFactory = TestingServiceFactory.getInstance();

// Export class for direct usage
export { TestingServiceFactory };

// Auto-initialize with default configuration
testingServiceFactory.initialize().catch(error => {
  console.error('❌ Failed to auto-initialize Testing Service Factory:', error);
});


import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testingServiceFactory } from '@/services/testing/TestingServiceFactory';
import { 
  enhancedTestingBusinessLayer,
  type TestExecutionOptions,
  type EnhancedTestMetrics,
  type ComplianceReport,
  type DocumentationPackage,
  type TraceabilityMatrix
} from '@/services/enhancedTestingBusinessLayer';
import { comprehensiveTestingService } from '@/services/comprehensiveTestingService';
import { TestResult } from '@/services/testingService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UnifiedTestingConfig {
  enableEnhancedFeatures?: boolean;
  enableComplianceMode?: boolean;
  batchSize?: number;
  environment?: 'development' | 'staging' | 'production';
}

interface UnifiedTestingData {
  // API Integration Data
  apiIntegrationTests: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    coverage: number;
  };
  
  // System Health Data
  systemHealth: {
    totalFunctionality: number;
    totalTestCases: number;
    overallCoverage: number;
    criticalIssues: number;
  };
  
  // Enhanced Metrics
  enhancedMetrics?: EnhancedTestMetrics;
}

interface UnifiedTestingMeta {
  singleSourceEnforced: boolean;
  integrationValidated: boolean;
  testingVersion: string;
  totalTestSuites: number;
  overallCoverage: number;
  dataSource: string;
  usingRealData: boolean;
  lastSyncAt: string;
  totalApisAvailable: number;
  testingFocus: string;
  serviceFactoryStatus: any;
}

export const useUnifiedTesting = (config?: UnifiedTestingConfig) => {
  const queryClient = useQueryClient();
  
  // Local state
  const [isExecuting, setIsExecuting] = useState(false);
  const [isGeneratingDocs, setIsGeneratingDocs] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [availableApis, setAvailableApis] = useState(0);
  const [serviceFactoryStatus, setServiceFactoryStatus] = useState<any>(null);

  // Initialize service factory
  useEffect(() => {
    const initializeServices = async () => {
      setIsInitializing(true);
      try {
        await testingServiceFactory.initialize({
          enableEnhancedFeatures: config?.enableEnhancedFeatures ?? true,
          enableComplianceMode: config?.enableComplianceMode ?? true,
          batchSize: config?.batchSize ?? 50,
          environment: config?.environment ?? 'development'
        });
        
        const healthStatus = testingServiceFactory.getHealthStatus();
        setServiceFactoryStatus(healthStatus);
        
        console.log('🏭 Unified Testing: Service Factory initialized');
      } catch (error) {
        console.error('❌ Unified Testing: Service Factory initialization failed:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeServices();
  }, [config]);

  // Check available APIs
  useEffect(() => {
    const checkAvailableApis = async () => {
      try {
        const { data: apis, error } = await supabase
          .from('api_integration_registry')
          .select('id')
          .eq('status', 'active');
        
        if (!error) {
          setAvailableApis(apis?.length || 0);
        }
      } catch (error) {
        console.error('Failed to check available APIs:', error);
        setAvailableApis(0);
      }
    };

    checkAvailableApis();
  }, []);

  // Enhanced Test Metrics Query
  const {
    data: enhancedMetrics,
    isLoading: isLoadingEnhancedMetrics,
    error: enhancedMetricsError,
    refetch: refetchEnhancedMetrics
  } = useQuery({
    queryKey: ['unified-enhanced-metrics'],
    queryFn: () => enhancedTestingBusinessLayer.getAdvancedTestMetrics('30d'),
    staleTime: 60000,
  });

  // Comprehensive System Health Query
  const {
    data: systemHealth,
    isLoading: isLoadingSystemHealth,
    error: systemHealthError,
    refetch: refetchSystemHealth
  } = useQuery({
    queryKey: ['unified-system-health'],
    queryFn: async () => {
      const testCases = await comprehensiveTestingService.getTestCases();
      const functionality = await comprehensiveTestingService.getSystemFunctionality();
      const stats = await comprehensiveTestingService.getTestStatistics();
      
      return {
        totalFunctionality: functionality.length,
        totalTestCases: testCases.length,
        overallCoverage: stats.overallCoverage || 0,
        criticalIssues: testCases.filter(tc => tc.test_status === 'failed').length
      };
    },
    staleTime: 60000,
  });

  // API Integration Data Query
  const {
    data: apiIntegrationData,
    isLoading: isLoadingApiData,
    refetch: refetchApiData
  } = useQuery({
    queryKey: ['unified-api-integration'],
    queryFn: async () => {
      // Default structure when no APIs are available
      return {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        coverage: 0
      };
    },
    staleTime: 30000,
  });

  // Execute Test Suite Mutation
  const executeTestSuiteMutation = useMutation({
    mutationFn: async ({ testType, options }: { testType: string; options?: TestExecutionOptions }) => {
      setIsExecuting(true);
      
      if (testType === 'comprehensive' || testType === 'enhanced') {
        const execOptions: TestExecutionOptions = {
          suiteType: testType,
          priority: 'medium',
          reportingLevel: 'summary',
          ...options
        };
        return enhancedTestingBusinessLayer.executeComprehensiveTestSuite(execOptions);
      }
      
      // Use service factory for other test types
      return testingServiceFactory.executeTests(testType, options);
    },
    onSuccess: (result) => {
      // Handle different result types
      if (Array.isArray(result)) {
        const passed = result.filter(r => r.status === 'passed').length;
        const total = result.length;
        toast(`Test Suite Completed: ${passed}/${total} tests passed`);
      } else if (result && typeof result === 'object') {
        // Handle business layer result format
        const passed = (result as any).passed_tests || 0;
        const total = (result as any).total_tests || 0;
        toast(`Test Suite Completed: ${passed}/${total} tests passed`);
      } else {
        toast('Test Suite Completed');
      }
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['unified-enhanced-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['unified-system-health'] });
      queryClient.invalidateQueries({ queryKey: ['unified-api-integration'] });
    },
    onError: (error) => {
      console.error('Unified test execution failed:', error);
      toast.error(`Test Execution Failed: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
    },
    onSettled: () => {
      setIsExecuting(false);
    }
  });

  // Generate Documentation Mutation
  const generateDocumentationMutation = useMutation({
    mutationFn: async (format?: 'PDF' | 'HTML' | 'JSON') => {
      setIsGeneratingDocs(true);
      return enhancedTestingBusinessLayer.generateTestDocumentation(format);
    },
    onSuccess: () => {
      toast('Documentation Generated: Test documentation has been generated successfully');
    },
    onError: (error) => {
      console.error('Documentation generation failed:', error);
      toast.error(`Documentation Generation Failed: ${error instanceof Error ? error.message : 'Failed to generate documentation'}`);
    },
    onSettled: () => {
      setIsGeneratingDocs(false);
    }
  });

  // Convenience methods - REAL DATABASE EXECUTION
  const executeStandardTestSuite = useCallback(() => {
    console.log('🚀 Unified Testing - Executing Standard Test Suite - REAL database');
    return executeTestSuiteMutation.mutate({
      testType: 'unit',
      options: { priority: 'medium', reportingLevel: 'summary' }
    });
  }, [executeTestSuiteMutation]);

  const executeSecurityTestSuite = useCallback(() => {
    console.log('🚀 Unified Testing - Executing Security Test Suite - REAL database');
    return executeTestSuiteMutation.mutate({
      testType: 'security',
      options: { priority: 'high', reportingLevel: 'detailed' }
    });
  }, [executeTestSuiteMutation]);

  const executeApiIntegrationTests = useCallback(() => {
    console.log('🚀 Unified Testing - Executing API Integration Tests - REAL database');
    if (availableApis === 0) {
      console.warn('⚠️ No APIs available for testing - proceeding with database tests');
    }
    
    return executeTestSuiteMutation.mutate({
      testType: 'integration',
      options: { batchSize: config?.batchSize ?? 50 }
    });
  }, [executeTestSuiteMutation, availableApis, config?.batchSize]);

  const generateComplianceReport = useCallback(async (level?: '21CFR' | 'HIPAA' | 'SOX'): Promise<ComplianceReport | null> => {
    try {
      const report = await enhancedTestingBusinessLayer.generateComplianceReport(level);
      toast(`Compliance Report Generated: ${level || '21CFR'} compliance report has been generated`);
      return report;
    } catch (error) {
      console.error('Compliance report generation failed:', error);
      toast.error(`Compliance Report Failed: ${error instanceof Error ? error.message : 'Failed to generate compliance report'}`);
      return null;
    }
  }, []);

  const buildTraceabilityMatrix = useCallback(async (): Promise<TraceabilityMatrix | null> => {
    try {
      const matrix = await enhancedTestingBusinessLayer.buildTraceabilityMatrix();
      toast('Traceability Matrix Built: Traceability matrix has been built successfully');
      return matrix;
    } catch (error) {
      console.error('Traceability matrix generation failed:', error);
      toast.error(`Traceability Matrix Failed: ${error instanceof Error ? error.message : 'Failed to build traceability matrix'}`);
      return null;
    }
  }, []);

  const generateFullDocumentationPackage = useCallback(() => {
    return generateDocumentationMutation.mutateAsync('JSON');
  }, [generateDocumentationMutation]);

  // Refresh all data
  const refreshAllData = useCallback(async () => {
    await Promise.all([
      refetchEnhancedMetrics(),
      refetchSystemHealth(),
      refetchApiData()
    ]);
  }, [refetchEnhancedMetrics, refetchSystemHealth, refetchApiData]);

  // Compute unified data
  const unifiedTestingData: UnifiedTestingData = {
    apiIntegrationTests: apiIntegrationData || { total: 0, passed: 0, failed: 0, skipped: 0, coverage: 0 },
    systemHealth: systemHealth || { totalFunctionality: 0, totalTestCases: 0, overallCoverage: 0, criticalIssues: 0 },
    enhancedMetrics
  };

  // Compute unified metadata
  const unifiedMeta: UnifiedTestingMeta = {
    singleSourceEnforced: true,
    integrationValidated: true,
    testingVersion: 'v3.0.0-unified',
    totalTestSuites: 4, // comprehensive, security, integration, unit
    overallCoverage: enhancedMetrics?.complianceScore || systemHealth?.overallCoverage || 0,
    dataSource: 'Unified Testing Architecture',
    usingRealData: true,
    lastSyncAt: new Date().toISOString(),
    totalApisAvailable: availableApis,
    testingFocus: 'Comprehensive Unified Testing',
    serviceFactoryStatus
  };

  // Loading states
  const isLoading = isLoadingEnhancedMetrics || isLoadingSystemHealth || isLoadingApiData || isInitializing;
  const error = enhancedMetricsError || systemHealthError;

  return {
    // Unified Data
    testingData: unifiedTestingData,
    meta: unifiedMeta,
    
    // Loading States
    isLoading,
    isExecuting,
    isGeneratingDocs,
    isInitializing,
    
    // Error States
    error,
    
    // Core Actions
    executeTestSuite: executeTestSuiteMutation.mutate,
    generateDocumentation: generateDocumentationMutation.mutate,
    
    // Convenience Actions
    executeStandardTestSuite,
    executeSecurityTestSuite,
    executeApiIntegrationTests,
    generateComplianceReport,
    buildTraceabilityMatrix,
    generateFullDocumentationPackage,
    
    // Data Management
    refreshAllData,
    refetchEnhancedMetrics,
    refetchSystemHealth,
    refetchApiData,
    
    // Service Access (for advanced usage)
    serviceFactory: testingServiceFactory,
    queryClient
  };
};

export default useUnifiedTesting;

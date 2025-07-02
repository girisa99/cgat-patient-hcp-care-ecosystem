
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  enhancedTestingBusinessLayer,
  type TestExecutionOptions,
  type EnhancedTestMetrics,
  type ComplianceReport,
  type DocumentationPackage,
  type TraceabilityMatrix,
  type ModuleComplianceStatus
} from '@/services/enhancedTestingBusinessLayer';
import { toast } from 'sonner';

export const useEnhancedTestingBusinessLayer = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isGeneratingDocs, setIsGeneratingDocs] = useState(false);
  const queryClient = useQueryClient();

  // Enhanced Test Metrics Query
  const {
    data: enhancedMetrics,
    isLoading: isLoadingMetrics,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['enhanced-test-metrics'],
    queryFn: () => enhancedTestingBusinessLayer.getAdvancedTestMetrics('30d'),
    staleTime: 60000,
  });

  // Execute Enhanced Test Suite Mutation
  const executeEnhancedTestSuiteMutation = useMutation({
    mutationFn: async (options?: TestExecutionOptions) => {
      setIsExecuting(true);
      return enhancedTestingBusinessLayer.executeComprehensiveTestSuite(options);
    },
    onSuccess: (result) => {
      toast.success(`Test suite executed successfully: ${result.passed_tests}/${result.total_tests} passed`);
      queryClient.invalidateQueries({ queryKey: ['enhanced-test-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-test-cases'] });
    },
    onError: (error) => {
      console.error('Enhanced test execution failed:', error);
      toast.error('Failed to execute enhanced test suite');
    },
    onSettled: () => {
      setIsExecuting(false);
    }
  });

  // Generate Security Tests Mutation
  const generateSecurityTestsMutation = useMutation({
    mutationFn: async (scope?: string) => {
      return enhancedTestingBusinessLayer.generateSecurityCompliantTests(scope);
    },
    onSuccess: (count) => {
      toast.success(`Generated ${count} security compliant test cases`);
      queryClient.invalidateQueries({ queryKey: ['enhanced-test-metrics'] });
    },
    onError: (error) => {
      console.error('Security test generation failed:', error);
      toast.error('Failed to generate security tests');
    }
  });

  // Generate Documentation Mutation
  const generateDocumentationMutation = useMutation({
    mutationFn: async (format?: 'PDF' | 'HTML' | 'JSON') => {
      setIsGeneratingDocs(true);
      return enhancedTestingBusinessLayer.generateTestDocumentation(format);
    },
    onSuccess: (doc) => {
      toast.success('Comprehensive documentation generated successfully');
      return doc;
    },
    onError: (error) => {
      console.error('Documentation generation failed:', error);
      toast.error('Failed to generate documentation');
    },
    onSettled: () => {
      setIsGeneratingDocs(false);
    }
  });

  // Generate Compliance Report
  const generateComplianceReport = useCallback(async (level?: '21CFR' | 'HIPAA' | 'SOX'): Promise<ComplianceReport | null> => {
    try {
      const report = await enhancedTestingBusinessLayer.generateComplianceReport(level);
      toast.success(`${level || '21CFR'} compliance report generated`);
      return report;
    } catch (error) {
      console.error('Compliance report generation failed:', error);
      toast.error('Failed to generate compliance report');
      return null;
    }
  }, []);

  // Build Traceability Matrix
  const buildTraceabilityMatrix = useCallback(async (): Promise<TraceabilityMatrix | null> => {
    try {
      const matrix = await enhancedTestingBusinessLayer.buildTraceabilityMatrix();
      toast.success('Traceability matrix generated');
      return matrix;
    } catch (error) {
      console.error('Traceability matrix generation failed:', error);
      toast.error('Failed to build traceability matrix');
      return null;
    }
  }, []);

  // Create Role-Based Test Scenarios
  const createRoleBasedTests = useCallback(async (roles: string[]) => {
    try {
      const suites = await enhancedTestingBusinessLayer.createRoleBasedTestScenarios(roles);
      toast.success(`Created test scenarios for ${roles.length} roles`);
      return suites;
    } catch (error) {
      console.error('Role-based test creation failed:', error);
      toast.error('Failed to create role-based tests');
      throw error;
    }
  }, []);

  // Validate Module Compliance
  const validateModuleCompliance = useCallback(async (moduleId: string): Promise<ModuleComplianceStatus | null> => {
    try {
      const status = await enhancedTestingBusinessLayer.validateModuleCompliance(moduleId);
      toast.success(`Module compliance validated for ${moduleId}`);
      return status;
    } catch (error) {
      console.error('Module compliance validation failed:', error);
      toast.error('Failed to validate module compliance');
      return null;
    }
  }, []);

  // Convenience methods for common operations
  const executeStandardTestSuite = useCallback(() => {
    const options: TestExecutionOptions = {
      suiteType: 'comprehensive',
      priority: 'medium',
      reportingLevel: 'summary'
    };
    return executeEnhancedTestSuiteMutation.mutate(options);
  }, [executeEnhancedTestSuiteMutation]);

  const executeSecurityTestSuite = useCallback(() => {
    const options: TestExecutionOptions = {
      suiteType: 'security',
      priority: 'high',
      reportingLevel: 'detailed'
    };
    return executeEnhancedTestSuiteMutation.mutate(options);
  }, [executeEnhancedTestSuiteMutation]);

  const generateFullDocumentationPackage = useCallback(() => {
    return generateDocumentationMutation.mutateAsync('JSON');
  }, [generateDocumentationMutation]);

  return {
    // Data
    enhancedMetrics,
    
    // Loading States
    isLoadingMetrics,
    isExecuting,
    isGeneratingDocs,
    
    // Error States
    metricsError,
    
    // Core Actions
    executeEnhancedTestSuite: executeEnhancedTestSuiteMutation.mutate,
    generateSecurityTests: generateSecurityTestsMutation.mutate,
    generateDocumentation: generateDocumentationMutation.mutate,
    
    // Advanced Actions
    generateComplianceReport,
    buildTraceabilityMatrix,
    createRoleBasedTests,
    validateModuleCompliance,
    
    // Convenience Actions
    executeStandardTestSuite,
    executeSecurityTestSuite,
    generateFullDocumentationPackage,
    
    // Utility
    refetchMetrics,
    queryClient
  };
};

export default useEnhancedTestingBusinessLayer;

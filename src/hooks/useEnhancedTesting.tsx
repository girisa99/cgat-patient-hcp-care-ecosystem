
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enhancedTestingService, type AdvancedTestFilters, type TestExecutionMetrics } from '@/services/enhancedTestingService';
import { type ComprehensiveTestCase } from '@/services/comprehensiveTestingService';
import { toast } from 'sonner';

export const useEnhancedTesting = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const queryClient = useQueryClient();

  // Test cases query
  const {
    data: testCases = [],
    isLoading: isLoadingTestCases,
    error: testCasesError,
    refetch: refetchTestCases
  } = useQuery({
    queryKey: ['enhanced-test-cases'],
    queryFn: () => enhancedTestingService.getAdvancedTestCases(),
    staleTime: 30000,
  });

  // Test metrics query
  const {
    data: testMetrics,
    isLoading: isLoadingMetrics,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['test-execution-metrics'],
    queryFn: () => enhancedTestingService.getTestExecutionMetrics(),
    staleTime: 60000,
  });

  // Execute test suite mutation
  const executeTestSuiteMutation = useMutation({
    mutationFn: async (suiteType?: string) => {
      setIsExecuting(true);
      return enhancedTestingService.generateSecurityAndComplianceTests();
    },
    onSuccess: (result) => {
      toast.success(`Generated ${result} security and compliance test cases`);
      queryClient.invalidateQueries({ queryKey: ['enhanced-test-cases'] });
      queryClient.invalidateQueries({ queryKey: ['test-execution-metrics'] });
    },
    onError: (error) => {
      console.error('Test execution failed:', error);
      toast.error('Failed to execute test suite');
    },
    onSettled: () => {
      setIsExecuting(false);
    }
  });

  // Get filtered test cases
  const getFilteredTestCases = async (filters: AdvancedTestFilters): Promise<ComprehensiveTestCase[]> => {
    return enhancedTestingService.getAdvancedTestCases(filters);
  };

  // Generate documentation
  const generateDocumentation = async () => {
    try {
      const doc = await enhancedTestingService.generateComprehensiveDocumentation();
      toast.success('Documentation generated successfully');
      return doc;
    } catch (error) {
      console.error('Documentation generation failed:', error);
      toast.error('Failed to generate documentation');
      throw error;
    }
  };

  // Generate role-based test suites
  const generateRoleBasedTests = async () => {
    try {
      const suites = await enhancedTestingService.generateRoleBasedTestSuites();
      toast.success(`Generated test suites for ${suites.length} roles`);
      return suites;
    } catch (error) {
      console.error('Role-based test generation failed:', error);
      toast.error('Failed to generate role-based tests');
      throw error;
    }
  };

  const isLoading = isLoadingTestCases || isLoadingMetrics;
  const error = testCasesError || metricsError;

  return {
    // Data
    testCases,
    testMetrics,
    
    // Loading states
    isLoading,
    isExecuting,
    
    // Error states
    error,
    
    // Actions
    executeTestSuite: executeTestSuiteMutation.mutate,
    getFilteredTestCases,
    generateDocumentation,
    generateRoleBasedTests,
    refetchTestCases,
    refetchMetrics,
    
    // Query client for manual invalidation
    queryClient
  };
};


import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enhancedTestingService, type AdvancedTestFilters, type TestExecutionMetrics } from '@/services/enhancedTestingService';
import { type ComprehensiveTestCase } from '@/services/comprehensiveTestingService';
import { enhancedTestingBusinessLayer } from '@/services/enhancedTestingBusinessLayer';
import { toast } from 'sonner';

export const useEnhancedTesting = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const queryClient = useQueryClient();

  // Test cases query - now passes empty object as default filter
  const {
    data: testCases = [],
    isLoading: isLoadingTestCases,
    error: testCasesError,
    refetch: refetchTestCases
  } = useQuery({
    queryKey: ['enhanced-test-cases'],
    queryFn: () => enhancedTestingService.getAdvancedTestCases({}),
    staleTime: 30000,
  });

  // Enhanced metrics query - now uses business layer
  const {
    data: testMetrics,
    isLoading: isLoadingMetrics,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['enhanced-test-metrics-legacy'],
    queryFn: () => enhancedTestingBusinessLayer.getAdvancedTestMetrics('30d'),
    staleTime: 60000,
  });

  // Execute test suite mutation - now uses business layer
  const executeTestSuiteMutation = useMutation({
    mutationFn: async (suiteType?: string) => {
      setIsExecuting(true);
      // Use business layer for enhanced execution
      return enhancedTestingBusinessLayer.executeComprehensiveTestSuite({
        suiteType: suiteType || 'security',
        priority: 'medium',
        reportingLevel: 'summary'
      });
    },
    onSuccess: (result) => {
      toast.success(`Enhanced test suite executed: ${result.passed_tests}/${result.total_tests} passed`);
      queryClient.invalidateQueries({ queryKey: ['enhanced-test-cases'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-test-metrics-legacy'] });
    },
    onError: (error) => {
      console.error('Enhanced test execution failed:', error);
      toast.error('Failed to execute test suite');
    },
    onSettled: () => {
      setIsExecuting(false);
    }
  });

  // Get filtered test cases - maintains backward compatibility
  const getFilteredTestCases = async (filters: AdvancedTestFilters): Promise<ComprehensiveTestCase[]> => {
    return enhancedTestingService.getAdvancedTestCases(filters);
  };

  // Generate documentation - now uses business layer
  const generateDocumentation = async () => {
    try {
      const doc = await enhancedTestingBusinessLayer.generateTestDocumentation('JSON');
      toast.success('Enhanced documentation generated successfully');
      return doc;
    } catch (error) {
      console.error('Enhanced documentation generation failed:', error);
      toast.error('Failed to generate documentation');
      throw error;
    }
  };

  // Generate role-based test suites - now uses business layer
  const generateRoleBasedTests = async () => {
    try {
      const suites = await enhancedTestingBusinessLayer.createRoleBasedTestScenarios(['admin', 'user', 'guest']);
      toast.success(`Generated enhanced test suites for ${suites.length} roles`);
      return suites;
    } catch (error) {
      console.error('Enhanced role-based test generation failed:', error);
      toast.error('Failed to generate role-based tests');
      throw error;
    }
  };

  const isLoading = isLoadingTestCases || isLoadingMetrics;
  const error = testCasesError || metricsError;

  return {
    // Data - maintaining backward compatibility
    testCases,
    testMetrics,
    
    // Loading states
    isLoading,
    isExecuting,
    
    // Error states
    error,
    
    // Actions - enhanced with business layer
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


/**
 * MASTER TESTING SUITE HOOK - SINGLE SOURCE OF TRUTH
 * Consolidates all testing functionality
 * Version: master-testing-suite-v1.0.0
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

export const useMasterTestingSuite = () => {
  console.log('🧪 Master Testing Suite Hook - Single source of truth');
  
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  const { data: testCases = [], isLoading: testCasesLoading } = useQuery({
    queryKey: ['master-test-cases'],
    queryFn: async () => {
      console.log('📡 Fetching comprehensive test cases');
      
      const { data, error } = await supabase
        .from('comprehensive_test_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('✅ Test cases loaded:', data?.length || 0);
      return data || [];
    },
    staleTime: 300000,
  });

  const { data: testExecutions = [], isLoading: executionsLoading } = useQuery({
    queryKey: ['master-test-executions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_execution_history')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const executeTestSuiteMutation = useMutation({
    mutationFn: async (suiteType?: string) => {
      console.log('🚀 Executing test suite:', suiteType || 'all');
      
      const { data, error } = await supabase
        .rpc('execute_comprehensive_test_suite', {
          suite_type: suiteType,
          batch_size: 50
        });

      if (error) throw error;
      return data;
    },
    onSuccess: (results: any) => {
      queryClient.invalidateQueries({ queryKey: ['master-test-cases'] });
      queryClient.invalidateQueries({ queryKey: ['master-test-executions'] });
      
      // Handle the results safely
      const totalTests = results?.total_tests || 0;
      const passedTests = results?.passed_tests || 0;
      
      showSuccess('Test Suite Executed', `Executed ${totalTests} tests with ${passedTests} passing`);
    },
    onError: (error: any) => {
      showError('Test Execution Failed', error.message);
    }
  });

  const generateTestCasesMutation = useMutation({
    mutationFn: async (functionalityId?: string) => {
      console.log('🔧 Generating test cases for functionality:', functionalityId || 'all');
      
      const { data, error } = await supabase
        .rpc('generate_comprehensive_test_cases', {
          functionality_id: functionalityId
        });

      if (error) throw error;
      return data;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['master-test-cases'] });
      showSuccess('Test Cases Generated', `Generated ${count} new test cases`);
    },
    onError: (error: any) => {
      showError('Test Generation Failed', error.message);
    }
  });

  const testingStats = {
    totalTests: testCases.length,
    passedTests: testCases.filter(tc => tc.test_status === 'passed').length,
    failedTests: testCases.filter(tc => tc.test_status === 'failed').length,
    pendingTests: testCases.filter(tc => tc.test_status === 'pending').length,
    testCoverage: testCases.length > 0 ? 
      (testCases.filter(tc => tc.test_status === 'passed').length / testCases.length) * 100 : 0,
    suiteBreakdown: testCases.reduce((acc, tc) => {
      acc[tc.test_suite_type] = (acc[tc.test_suite_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    recentExecutions: testExecutions.slice(0, 10),
  };

  const getTestsByModule = (moduleName: string) => {
    return testCases.filter(tc => tc.module_name === moduleName);
  };

  const getTestsByStatus = (status: string) => {
    return testCases.filter(tc => tc.test_status === status);
  };

  const getTestExecutionHistory = (testCaseId: string) => {
    return testExecutions.filter(te => te.test_case_id === testCaseId);
  };

  return {
    // Core data
    testCases,
    testExecutions,
    testingStats,
    
    // Loading states
    isLoading: testCasesLoading || executionsLoading,
    isExecuting: executeTestSuiteMutation.isPending,
    isGenerating: generateTestCasesMutation.isPending,
    
    // Actions
    executeTestSuite: (suiteType?: string) => executeTestSuiteMutation.mutate(suiteType),
    generateTestCases: (functionalityId?: string) => generateTestCasesMutation.mutate(functionalityId),
    
    // Utilities
    getTestsByModule,
    getTestsByStatus,
    getTestExecutionHistory,
    
    // Meta
    meta: {
      hookName: 'useMasterTestingSuite',
      version: 'master-testing-suite-v1.0.0',
      singleSourceValidated: true,
      testingConsolidated: true,
      dataSource: 'comprehensive_test_cases-test_execution_history-tables'
    }
  };
};

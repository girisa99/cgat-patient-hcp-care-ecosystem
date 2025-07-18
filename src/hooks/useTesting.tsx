/**
 * TESTING HOOK - Real Data Implementation
 * Provides complete testing and validation functionality
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

interface TestCase {
  id: string;
  test_name: string;
  test_description?: string;
  test_status: string;
  test_category: string;
  test_suite_type: string;
  module_name?: string;
  expected_results?: string;
  actual_results?: string;
  created_at: string;
  updated_at: string;
}

export const useTesting = () => {
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  // Fetch test cases from database
  const { data: testCases = [], isLoading, error } = useQuery({
    queryKey: ['test-cases'],
    queryFn: async (): Promise<TestCase[]> => {
      console.log('🧪 Fetching test cases from database...');
      
      const { data, error } = await supabase
        .from('comprehensive_test_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching test cases:', error);
        throw error;
      }

      console.log('✅ Test cases loaded:', data?.length || 0);
      return data || [];
    },
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  // Execute test suite mutation
  const executeTestSuiteMutation = useMutation({
    mutationFn: async (suiteType?: string) => {
      const { data, error } = await supabase
        .rpc('execute_comprehensive_test_suite', { 
          suite_type: suiteType,
          batch_size: 50 
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ['test-cases'] });
      showSuccess(
        'Test Suite Executed', 
        `${result?.passed_tests || 0}/${result?.total_tests || 0} tests passed`
      );
    },
    onError: (error: any) => {
      showError('Execution Failed', error.message);
    }
  });

  // Generate test cases mutation
  const generateTestCasesMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .rpc('generate_comprehensive_test_cases');
      
      if (error) throw error;
      return data;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['test-cases'] });
      showSuccess('Test Cases Generated', `${count} new test cases created`);
    },
    onError: (error: any) => {
      showError('Generation Failed', error.message);
    }
  });

  // Update test case mutation
  const updateTestCaseMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('comprehensive_test_cases')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-cases'] });
      showSuccess('Test Case Updated', 'Test case updated successfully');
    },
    onError: (error: any) => {
      showError('Update Failed', error.message);
    }
  });

  const getTestingStats = () => {
    const stats = {
      total: testCases.length,
      passed: testCases.filter(t => t.test_status === 'passed').length,
      failed: testCases.filter(t => t.test_status === 'failed').length,
      pending: testCases.filter(t => t.test_status === 'pending').length,
      bySuite: {} as Record<string, number>,
      byModule: {} as Record<string, number>
    };

    // Group by suite type
    testCases.forEach(test => {
      stats.bySuite[test.test_suite_type] = (stats.bySuite[test.test_suite_type] || 0) + 1;
      if (test.module_name) {
        stats.byModule[test.module_name] = (stats.byModule[test.module_name] || 0) + 1;
      }
    });

    return stats;
  };

  return {
    // Core data
    testCases,
    
    // Loading states
    isLoading,
    isExecuting: executeTestSuiteMutation.isPending,
    isGenerating: generateTestCasesMutation.isPending,
    isUpdating: updateTestCaseMutation.isPending,
    
    // Error state
    error,
    
    // Actions
    executeTestSuite: (suiteType?: string) => executeTestSuiteMutation.mutate(suiteType),
    generateTestCases: () => generateTestCasesMutation.mutate(),
    updateTestCase: (id: string, updates: any) => 
      updateTestCaseMutation.mutate({ id, updates }),
    
    // Utilities
    getTestingStats,
    getTestsByStatus: (status: string) => testCases.filter(t => t.test_status === status),
    getTestsBySuite: (suite: string) => testCases.filter(t => t.test_suite_type === suite),
    getTestsByModule: (module: string) => testCases.filter(t => t.module_name === module),
    
    // Meta
    meta: {
      dataSource: 'comprehensive_test_cases table',
      version: 'testing-v1.0.0',
      totalTestCases: testCases.length
    }
  };
};
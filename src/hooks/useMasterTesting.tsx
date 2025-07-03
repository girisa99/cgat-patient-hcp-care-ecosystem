/**
 * MASTER TESTING MANAGEMENT HOOK - SINGLE SOURCE OF TRUTH
 * Consolidates ALL testing functionality into ONE hook
 * Version: master-testing-v1.0.0
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// SINGLE CACHE KEY for all testing operations
const MASTER_TESTING_CACHE_KEY = ['master-testing'];

export interface TestCase {
  id: string;
  test_name: string;
  test_suite_type: string;
  test_category: string;
  test_status: string;
  test_description: string;
  module_name?: string;
  created_at: string;
  updated_at: string;
}

export interface TestExecution {
  id: string;
  test_case_id: string;
  execution_status: string;
  executed_at: string;
  execution_details: any;
}

/**
 * MASTER Testing Management Hook - Everything in ONE place
 */
export const useMasterTesting = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  console.log('🧪 Master Testing - Single Source of Truth Active');

  // ====================== DATA FETCHING ======================
  const {
    data: testCases = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: MASTER_TESTING_CACHE_KEY,
    queryFn: async (): Promise<TestCase[]> => {
      console.log('🔍 Fetching test cases from single source...');
      
      const { data, error } = await supabase
        .from('comprehensive_test_cases')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching test cases:', error);
        throw error;
      }
      
      console.log('✅ Test cases fetched from master source:', data?.length || 0);
      return data || [];
    },
    retry: 1,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // ====================== CACHE INVALIDATION HELPER ======================
  const invalidateCache = () => {
    console.log('🔄 Invalidating master testing cache...');
    queryClient.invalidateQueries({ queryKey: MASTER_TESTING_CACHE_KEY });
  };

  // ====================== TEST EXECUTION ======================
  const executeTestsMutation = useMutation({
    mutationFn: async (suiteType: string = 'all') => {
      console.log('🔄 Executing tests in master hook:', suiteType || 'all');
      
      const { data, error } = await supabase.rpc('execute_comprehensive_test_suite', {
        suite_type: suiteType,
        batch_size: 50
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateCache();
      toast({
        title: "Test Execution Started",
        description: "Comprehensive test suite is now running.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Test Execution Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // ====================== UTILITY FUNCTIONS ======================
  const getTestingStats = () => {
    const statusDistribution = testCases.reduce((acc: any, test: TestCase) => {
      acc[test.test_status] = (acc[test.test_status] || 0) + 1;
      return acc;
    }, {});

    const suiteDistribution = testCases.reduce((acc: any, test: TestCase) => {
      acc[test.test_suite_type] = (acc[test.test_suite_type] || 0) + 1;
      return acc;
    }, {});
    
    return {
      total: testCases.length,
      statusDistribution,
      suiteDistribution,
      pending: testCases.filter(t => t.test_status === 'pending').length,
      passed: testCases.filter(t => t.test_status === 'passed').length,
      failed: testCases.filter(t => t.test_status === 'failed').length,
      passRate: testCases.length > 0 ? (testCases.filter(t => t.test_status === 'passed').length / testCases.length * 100) : 0,
    };
  };

  const getTestSuites = () => {
    const suites = testCases.reduce((acc: any, test: TestCase) => {
      if (!acc[test.test_suite_type]) {
        acc[test.test_suite_type] = {
          name: test.test_suite_type,
          total: 0,
          passed: 0,
          failed: 0,
          pending: 0
        };
      }
      acc[test.test_suite_type].total++;
      acc[test.test_suite_type][test.test_status]++;
      return acc;
    }, {});
    
    return Object.values(suites);
  };

  // ====================== RETURN CONSOLIDATED API ======================
  return {
    // Data
    testCases,
    isLoading,
    error,
    refetch,
    
    // Test Execution
    executeTests: executeTestsMutation.mutate,
    isExecutingTests: executeTestsMutation.isPending,
    
    // Utilities
    getTestingStats,
    getTestSuites,
    
    // Computed Values
    testSuites: getTestSuites(),
    testingStats: getTestingStats(),
    
    // Meta Information
    meta: {
      totalTestCases: testCases.length,
      dataSource: 'comprehensive_test_cases table (master hook)',
      lastFetched: new Date().toISOString(),
      version: 'master-testing-v1.0.0',
      singleSourceValidated: true,
      architectureType: 'consolidated',
      cacheKey: MASTER_TESTING_CACHE_KEY.join('-'),
      stabilityGuarantee: true
    }
  };
};
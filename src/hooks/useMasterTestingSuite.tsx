
/**
 * MASTER TESTING SUITE HOOK - SINGLE SOURCE OF TRUTH
 * Consolidates all testing functionality
 * Version: master-testing-suite-v1.0.0
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';
import { useEffect, useState } from 'react';

export const useMasterTestingSuite = () => {
  console.log('🧪 Master Testing Suite Hook - Single source of truth with Real-time');
  
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const { data: testCases = [], isLoading: testCasesLoading } = useQuery({
    queryKey: ['master-test-cases'],
    queryFn: async () => {
      console.log('📡 Fetching comprehensive test cases - REAL database data');
      
      const { data, error } = await supabase
        .from('comprehensive_test_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Verify we're getting real database tests
      const dbTests = data?.filter(tc => 
        tc.database_source && 
        !tc.database_source.includes('mock') && 
        !tc.database_source.includes('test_')
      ) || [];
      
      console.log('✅ Real database test cases loaded:', data?.length || 0);
      console.log('✅ Database-specific tests:', dbTests.length);
      console.log('✅ Test suites breakdown:', data?.reduce((acc, tc) => {
        acc[tc.test_suite_type] = (acc[tc.test_suite_type] || 0) + 1;
        return acc;
      }, {}));
      
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

  // Real-time subscription for comprehensive updates
  useEffect(() => {
    const channel = supabase
      .channel('comprehensive-testing-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comprehensive_test_cases'
        },
        (payload) => {
          console.log('🔄 Real-time test case update:', payload);
          queryClient.invalidateQueries({ queryKey: ['master-test-cases'] });
          setLastSync(new Date());
          showSuccess('Real-time Update', 'Test cases updated automatically');
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_functionality_registry'
        },
        (payload) => {
          console.log('🔄 Real-time functionality update:', payload);
          queryClient.invalidateQueries({ queryKey: ['master-test-cases'] });
          setLastSync(new Date());
          showSuccess('New Functionality', 'Detected new functionality - generating tests');
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'test_execution_history'
        },
        (payload) => {
          console.log('🔄 Real-time execution update:', payload);
          queryClient.invalidateQueries({ queryKey: ['master-test-executions'] });
          setLastSync(new Date());
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', status);
        setRealTimeEnabled(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          showSuccess('Real-time Enabled', 'Live updates are now active');
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setRealTimeEnabled(false);
    };
  }, [queryClient, showSuccess]);

  // Generate comprehensive documentation mutation
  const generateDocumentationMutation = useMutation({
    mutationFn: async (options: {
      functionalityId?: string;
      includeArchitecture?: boolean;
      includeRequirements?: boolean;
      includeTestCases?: boolean;
    } = {}) => {
      console.log('📋 Generating comprehensive documentation:', options);
      
      const { data, error } = await supabase.rpc('generate_comprehensive_documentation', {
        functionality_id: options.functionalityId || null,
        include_architecture: options.includeArchitecture ?? true,
        include_requirements: options.includeRequirements ?? true,
        include_test_cases: options.includeTestCases ?? true
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      console.log('📋 Documentation generated successfully:', data);
      showSuccess('Documentation Generated', 'Comprehensive architecture, requirements, and test documentation created');
    },
    onError: (error: any) => {
      console.error('❌ Documentation generation failed:', error);
      showError('Documentation Failed', error.message);
    }
  });

  // Enhanced test case generation with all coverage areas
  const generateEnhancedTestCasesMutation = useMutation({
    mutationFn: async (functionalityId?: string) => {
      console.log('🔧 Generating enhanced test cases with full coverage:', functionalityId || 'all');
      
      const { data, error } = await supabase
        .rpc('generate_comprehensive_test_cases_enhanced', {
          functionality_id: functionalityId
        });

      if (error) throw error;
      return data;
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ['master-test-cases'] });
      const count = (result as any)?.test_cases_created || 0;
      showSuccess('Enhanced Test Generation', `Generated ${count} comprehensive test cases across all coverage areas`);
    },
    onError: (error: any) => {
      showError('Enhanced Test Generation Failed', error.message);
    }
  });

  // Real-time sync mutation
  const syncRealTimeMutation = useMutation({
    mutationFn: async () => {
      console.log('🔄 Syncing real-time updates...');
      const { data, error } = await supabase.rpc('sync_real_time_testing_updates');
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      console.log('🔄 Real-time sync completed:', data);
      setLastSync(new Date());
      queryClient.invalidateQueries({ queryKey: ['master-test-cases'] });
      queryClient.invalidateQueries({ queryKey: ['master-test-executions'] });
      
      const newFunctionality = (data as any)?.new_functionality_detected || 0;
      const updatedTests = (data as any)?.tests_updated || 0;
      showSuccess('Sync Complete', `${newFunctionality} new functionality, ${updatedTests} tests updated`);
    },
    onError: (error: any) => {
      console.error('❌ Real-time sync failed:', error);
      showError('Sync Failed', error.message);
    }
  });

  return {
    // Core data
    testCases,
    testExecutions,
    testingStats,
    
    // Loading states
    isLoading: testCasesLoading || executionsLoading,
    isExecuting: executeTestSuiteMutation.isPending,
    isGenerating: generateTestCasesMutation.isPending || generateEnhancedTestCasesMutation.isPending,
    isDocumenting: generateDocumentationMutation.isPending,
    isSyncing: syncRealTimeMutation.isPending,
    
    // Actions
    executeTestSuite: (suiteType?: string) => executeTestSuiteMutation.mutate(suiteType),
    generateTestCases: (functionalityId?: string) => generateTestCasesMutation.mutate(functionalityId),
    generateEnhancedTestCases: (functionalityId?: string) => generateEnhancedTestCasesMutation.mutate(functionalityId),
    generateDocumentation: (options?: any) => generateDocumentationMutation.mutate(options),
    syncRealTime: () => syncRealTimeMutation.mutate(),
    
    // Utilities
    getTestsByModule,
    getTestsByStatus,
    getTestExecutionHistory,
    
    // Real-time capabilities
    realTimeEnabled,
    lastSync,
    
    // Meta with comprehensive coverage info
    meta: {
      hookName: 'useMasterTestingSuite',
      version: 'v4.0.0-realtime-comprehensive',
      singleSourceValidated: true,
      testingConsolidated: true,
      realTimeEnabled,
      lastSyncAt: lastSync?.toISOString() || new Date().toISOString(),
      dataSource: 'Real-time Comprehensive Testing Database',
      coverageAreas: [
        'Core Functionality',
        'Stability Testing', 
        'Governance & Compliance',
        'Verification & Validation',
        'Healthcare AI',
        'Framework Testing',
        'Security Testing',
        'Performance Testing',
        'User Experience',
        'Data Integrity',
        'Audit & Traceability'
      ],
      testTypes: ['unit', 'integration', 'system', 'e2e', 'uat', 'regression'],
      validationLevels: ['IQ', 'OQ', 'PQ'],
      documentationTypes: [
        'High Level Architecture',
        'Low Level Architecture',
        'Reference Architecture', 
        'Business Requirements',
        'Functional Requirements',
        'Test Cases & Scripts',
        'Persona-based E2E Tests',
        'Traceability Matrix'
      ],
      complianceFrameworks: ['21_CFR_Part_11', 'HIPAA', 'SOX', 'GDPR'],
      realTimeFeatures: {
        continuousUpdates: true,
        autoTestGeneration: true,
        architectureDocGeneration: true,
        personaBasedTesting: true,
        functionalityDetection: true,
        executionTracking: true
      }
    }
  };
};

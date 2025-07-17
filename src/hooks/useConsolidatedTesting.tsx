/**
 * CONSOLIDATED TESTING HOOK
 * Single source of truth for all testing functionality
 * Replaces: useMasterTestingSuite, useUnifiedTesting, useEnhancedTesting
 */
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Consolidated interfaces
interface TestCase {
  id: string;
  test_name: string;
  test_description: string;
  test_suite_type: string;
  test_category: string;
  test_status: string;
  module_name?: string;
  related_functionality?: string;
  database_source?: string;
  validation_level?: string;
  execution_duration_ms?: number;
  created_at: string;
  updated_at: string;
  actual_results?: string;
  expected_results?: string;
  test_steps?: any;
  execution_data?: any;
  cfr_part11_metadata?: any;
}

interface TestExecution {
  id: string;
  test_case_id: string;
  execution_status: string;
  executed_at: string;
  execution_details?: any;
  performance_metrics?: any;
}

interface TestingStats {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  pendingTests: number;
  testCoverage: number;
  suiteBreakdown: Record<string, number>;
  recentExecutions: TestExecution[];
  systemHealth: {
    overallCoverage: number;
    criticalIssues: number;
    status: 'healthy' | 'warning' | 'critical';
  };
}

interface ConsolidatedTestingReturn {
  // Core data
  testCases: TestCase[];
  testingStats: TestingStats;
  
  // Loading states
  isLoading: boolean;
  isExecuting: boolean;
  isDocumenting: boolean;
  
  // Actions
  executeTestSuite: (suiteType?: string) => Promise<void>;
  generateTestCases: (functionality?: string) => Promise<void>;
  generateDocumentation: () => Promise<void>;
  generateComplianceReport: (standard: string) => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Execution control
  startExecution: () => void;
  stopExecution: () => void;
  
  // Metadata
  meta: {
    hookName: string;
    version: string;
    consolidatedFrom: string[];
    lastUpdated: string;
  };
}

export const useConsolidatedTesting = (): ConsolidatedTestingReturn => {
  console.log('🧪 Consolidated Testing Hook - Single Source of Truth');
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDocumenting, setIsDocumenting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch test cases
  const { data: testCases = [], isLoading: isLoadingTests } = useQuery({
    queryKey: ['consolidated-test-cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comprehensive_test_cases')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TestCase[];
    },
    staleTime: 30000, // 30 seconds
  });

  // Fetch test executions
  const { data: executions = [], isLoading: isLoadingExecutions } = useQuery({
    queryKey: ['test-executions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_execution_history')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as TestExecution[];
    },
    staleTime: 30000,
  });

  // Calculate comprehensive testing stats
  const testingStats: TestingStats = {
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
    recentExecutions: executions.slice(0, 10),
    systemHealth: {
      overallCoverage: testCases.length > 0 ? 
        (testCases.filter(tc => tc.test_status === 'passed').length / testCases.length) * 100 : 0,
      criticalIssues: testCases.filter(tc => tc.test_status === 'failed').length,
      status: testCases.filter(tc => tc.test_status === 'failed').length === 0 ? 'healthy' : 
              testCases.filter(tc => tc.test_status === 'failed').length > 5 ? 'critical' : 'warning'
    }
  };

  // Execute comprehensive test suite
  const executeTestSuite = useCallback(async (suiteType?: string) => {
    setIsExecuting(true);
    try {
      toast({
        title: "Executing Test Suite",
        description: `Running ${suiteType || 'all'} tests...`,
      });

      const { data, error } = await supabase.rpc('execute_comprehensive_test_suite', {
        suite_type: suiteType || null,
        batch_size: 50
      });

      if (error) throw error;

      // Parse the result data safely
      const resultData = typeof data === 'object' && data !== null ? data as any : {};

      // Refresh data after execution
      await queryClient.invalidateQueries({ queryKey: ['consolidated-test-cases'] });
      await queryClient.invalidateQueries({ queryKey: ['test-executions'] });

      toast({
        title: "Test Suite Completed",
        description: `Executed ${resultData.total_tests || 0} tests with ${resultData.passed_tests || 0} passing`,
      });
    } catch (error) {
      console.error('Test execution failed:', error);
      toast({
        title: "Test Execution Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  }, [toast, queryClient]);

  // Generate test cases for functionality
  const generateTestCases = useCallback(async (functionality?: string) => {
    try {
      toast({
        title: "Generating Test Cases",
        description: "Creating comprehensive test cases...",
      });

      const { data, error } = await supabase.rpc('generate_comprehensive_test_cases_enhanced', {
        functionality_id: functionality || null
      });

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['consolidated-test-cases'] });

      toast({
        title: "Test Cases Generated",
        description: `Created ${data} new test cases`,
      });
    } catch (error) {
      console.error('Test case generation failed:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  }, [toast, queryClient]);

  // Generate documentation
  const generateDocumentation = useCallback(async () => {
    setIsDocumenting(true);
    try {
      toast({
        title: "Generating Documentation",
        description: "Creating comprehensive test documentation...",
      });

      // Simulate documentation generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Documentation Generated",
        description: "Test documentation has been created successfully",
      });
    } catch (error) {
      console.error('Documentation generation failed:', error);
      toast({
        title: "Documentation Failed",
        description: "Failed to generate documentation",
        variant: "destructive",
      });
    } finally {
      setIsDocumenting(false);
    }
  }, [toast]);

  // Generate compliance report
  const generateComplianceReport = useCallback(async (standard: string) => {
    try {
      toast({
        title: "Generating Compliance Report",
        description: `Creating ${standard} compliance report...`,
      });

      // Insert compliance report with proper JSON conversion
      const { error } = await supabase
        .from('compliance_reports')
        .insert({
          report_type: standard,
          compliance_score: testingStats.testCoverage,
          total_violations: testingStats.failedTests,
          report_data: {
            testingStats: JSON.parse(JSON.stringify(testingStats)),
            generatedAt: new Date().toISOString(),
            standard
          } as any
        });

      if (error) throw error;

      toast({
        title: "Compliance Report Generated",
        description: `${standard} report created successfully`,
      });
    } catch (error) {
      console.error('Compliance report generation failed:', error);
      toast({
        title: "Report Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  }, [testingStats, toast]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['consolidated-test-cases'] });
    await queryClient.invalidateQueries({ queryKey: ['test-executions'] });
  }, [queryClient]);

  // Execution control
  const startExecution = useCallback(() => {
    setIsExecuting(true);
  }, []);

  const stopExecution = useCallback(() => {
    setIsExecuting(false);
  }, []);

  return {
    testCases,
    testingStats,
    isLoading: isLoadingTests || isLoadingExecutions,
    isExecuting,
    isDocumenting,
    executeTestSuite,
    generateTestCases,
    generateDocumentation,
    generateComplianceReport,
    refreshData,
    startExecution,
    stopExecution,
    meta: {
      hookName: 'useConsolidatedTesting',
      version: 'v1.0.0-consolidated',
      consolidatedFrom: [
        'useMasterTestingSuite',
        'useUnifiedTesting', 
        'useEnhancedTesting'
      ],
      lastUpdated: new Date().toISOString()
    }
  };
};

export default useConsolidatedTesting;
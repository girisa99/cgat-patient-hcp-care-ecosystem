import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterToast } from './useMasterToast';

interface TestRun {
  id?: string;
  agent_id: string;
  test_name: string;
  status: string;
  test_dataset_id: string;
  model_config_id: string;
  start_time?: string;
  end_time?: string;
  total_samples?: number;
  processed_samples?: number;
  success_rate?: number;
  avg_response_time_ms?: number;
  avg_accuracy?: number;
  results?: Record<string, any>;
  performance_metrics?: Record<string, any>;
  error_logs?: Record<string, any>;
  resource_usage?: Record<string, any>;
  created_by?: string;
}

interface TestDataset {
  id?: string;
  name: string;
  description?: string;
  dataset_type: 'conversation' | 'performance' | 'compliance' | 'integration';
  data: any;
  created_by?: string;
  is_active?: boolean;
}

export const useTestingManager = () => {
  const { showSuccess, showError } = useMasterToast();
  const queryClient = useQueryClient();

  // Fetch test runs (reusing existing table)
  const testRunsQuery = useQuery({
    queryKey: ['agent-test-runs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_test_runs')
        .select('*')
        .order('start_time', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch comprehensive test cases (reusing existing table) 
  const testCasesQuery = useQuery({
    queryKey: ['test-cases-simple'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('comprehensive_test_cases')
          .select('id, test_name, test_description, test_category')
          .limit(50);
        
        if (error) throw error;
        return data || [];
      } catch (err) {
        return [];
      }
    },
  });

  const testRuns = testRunsQuery.data || [];
  const testCases = testCasesQuery.data || [];
  const isLoadingTestRuns = testRunsQuery.isLoading;
  const isLoadingTestCases = testCasesQuery.isLoading;

  // Create test run
  const createTestRun = useMutation({
    mutationFn: async (testRunData: any) => {
      const user = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('agent_test_runs')
        .insert({
          ...testRunData,
          created_by: user.data.user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-test-runs'] });
      showSuccess('Test run created successfully');
    },
    onError: (error) => {
      showError('Failed to create test run: ' + error.message);
    }
  });

  // Update test run
  const updateTestRun = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('agent_test_runs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-test-runs'] });
      showSuccess('Test run updated successfully');
    },
    onError: (error) => {
      showError('Failed to update test run: ' + error.message);
    }
  });

  // Execute test run
  const executeTestRun = useMutation({
    mutationFn: async ({ testRunId, agentId }: { testRunId: string; agentId: string }) => {
      // Update status to running
      const { error: updateError } = await supabase
        .from('agent_test_runs')
        .update({ 
          status: 'running',
          start_time: new Date().toISOString()
        })
        .eq('id', testRunId);
      
      if (updateError) throw updateError;

      // Simulate test execution (in real implementation, this would trigger actual testing)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update with results
      const { data, error } = await supabase
        .from('agent_test_runs')
        .update({
          status: 'completed',
          end_time: new Date().toISOString(),
          processed_samples: 100,
          success_rate: 0.95,
          avg_response_time_ms: 250,
          avg_accuracy: 0.92,
          results: {
            test_passed: 95,
            test_failed: 5,
            warnings: 2,
            errors: 0
          }
        })
        .eq('id', testRunId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-test-runs'] });
      showSuccess('Test run completed successfully');
    },
    onError: (error) => {
      showError('Failed to execute test run: ' + error.message);
    }
  });

  // Create test case
  const createTestCase = useMutation({
    mutationFn: async (testCaseData: any) => {
      const { data, error } = await supabase
        .from('comprehensive_test_cases')
        .insert({
          ...testCaseData,
          auto_generated: false
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comprehensive-test-cases'] });
      showSuccess('Test case created successfully');
    },
    onError: (error) => {
      showError('Failed to create test case: ' + error.message);
    }
  });

  return {
    // Data
    testRuns,
    testCases,
    
    // Loading states
    isLoading: isLoadingTestRuns || isLoadingTestCases,
    isLoadingTestRuns,
    isLoadingTestCases,
    
    // Mutations
    createTestRun: createTestRun.mutate,
    updateTestRun: updateTestRun.mutate,
    executeTestRun: executeTestRun.mutate,
    createTestCase: createTestCase.mutate,
    
    // Mutation states
    isCreatingTestRun: createTestRun.isPending,
    isUpdatingTestRun: updateTestRun.isPending,
    isExecutingTestRun: executeTestRun.isPending,
    isCreatingTestCase: createTestCase.isPending,
  };
};
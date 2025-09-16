/**
 * System Integration Hook - Comprehensive system management and monitoring
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSystemIntegration = () => {
  const queryClient = useQueryClient();

  // Get comprehensive system status
  const { data: systemStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['system-integration-status'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_system_integration_status');
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds for real-time monitoring
  });

  // Get JSONB migration integrity status
  const { data: migrationIntegrity, isLoading: migrationLoading } = useQuery({
    queryKey: ['jsonb-migration-integrity'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('verify_jsonb_migration_integrity');
      if (error) throw error;
      return data;
    },
  });

  // Run comprehensive system cleanup and update
  const comprehensiveUpdateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('run_comprehensive_system_update');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success('System update completed successfully', {
        description: `Updated ${data.api_documentation_update?.updated_services || 0} API services and ${data.testing_suite_update?.updated_tests || 0} test cases`,
      });
      queryClient.invalidateQueries({ queryKey: ['system-integration-status'] });
      queryClient.invalidateQueries({ queryKey: ['jsonb-migration-integrity'] });
    },
    onError: (error) => {
      toast.error('System update failed', {
        description: error.message,
      });
    },
  });

  // Run automated cleanup only
  const cleanupMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('run_automated_cleanup');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const totalDeleted = (data.universal_save_cleanup?.deleted_sessions || 0) + 
                          (data.agent_sessions_cleanup?.deleted_sessions || 0) + 
                          (data.test_cases_cleanup?.deleted_duplicates || 0);
      toast.success('Database cleanup completed', {
        description: `Cleaned up ${totalDeleted} records`,
      });
      queryClient.invalidateQueries({ queryKey: ['system-integration-status'] });
    },
    onError: (error) => {
      toast.error('Cleanup failed', {
        description: error.message,
      });
    },
  });

  // Update API services documentation
  const apiDocumentationMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('update_api_services_documentation');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success('API documentation updated', {
        description: `Enhanced ${data.updated_services} API services`,
      });
      queryClient.invalidateQueries({ queryKey: ['system-integration-status'] });
    },
    onError: (error) => {
      toast.error('API documentation update failed', {
        description: error.message,
      });
    },
  });

  // Update testing suite
  const testingSuiteMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('update_testing_suite_comprehensive');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success('Testing suite updated', {
        description: `Cleaned ${data.cleaned_duplicates} duplicates and updated ${data.updated_tests} test cases`,
      });
      queryClient.invalidateQueries({ queryKey: ['system-integration-status'] });
    },
    onError: (error) => {
      toast.error('Testing suite update failed', {
        description: error.message,
      });
    },
  });

  return {
    // Data
    systemStatus,
    migrationIntegrity,
    
    // Loading states
    statusLoading,
    migrationLoading,
    isUpdating: comprehensiveUpdateMutation.isPending,
    isCleaning: cleanupMutation.isPending,
    isUpdatingAPIs: apiDocumentationMutation.isPending,
    isUpdatingTests: testingSuiteMutation.isPending,
    
    // Actions
    runComprehensiveUpdate: comprehensiveUpdateMutation.mutate,
    runCleanup: cleanupMutation.mutate,
    updateAPIDocumentation: apiDocumentationMutation.mutate,
    updateTestingSuite: testingSuiteMutation.mutate,
    refetchStatus,
    
    // Computed values
    isHealthy: systemStatus?.system_health === 'optimal',
    isMultiTenantReady: systemStatus?.multi_tenant_ready === true,
    isRealTimeCapable: systemStatus?.real_time_capable === true,
    totalAgents: systemStatus?.agent_system_stats?.total_agents || 0,
    totalAPIs: systemStatus?.api_services_stats?.total_apis || 0,
    totalTests: systemStatus?.testing_suite_stats?.total_test_cases || 0,
  };
};
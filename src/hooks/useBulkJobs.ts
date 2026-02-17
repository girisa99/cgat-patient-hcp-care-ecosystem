/**
 * useBulkJobs - Hook for managing bulk_jobs database table
 * Provides CRUD operations and real-time status updates for bulk jobs
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterAuth } from '@/hooks/useMasterAuth';

export interface BulkJob {
  id: string;
  operation_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'paused' | 'cancelled';
  total_items: number;
  processed_items: number;
  failed_items: number;
  items: any[];
  results: any[];
  errors: any[];
  options: Record<string, any>;
  created_by: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBulkJobInput {
  operation_type: string;
  items: any[];
  options?: Record<string, any>;
}

export interface BulkJobStats {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalItemsProcessed: number;
}

export function useBulkJobs() {
  const queryClient = useQueryClient();
  const { user } = useMasterAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch all bulk jobs for current user
  const { data: jobs = [], isLoading, error, refetch } = useQuery({
    queryKey: ['bulk_jobs', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bulk_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as BulkJob[];
    },
    enabled: !!user?.id,
    refetchInterval: 5000, // Poll every 5 seconds for active jobs
  });

  // Create a new bulk job
  const createJobMutation = useMutation({
    mutationFn: async (input: CreateBulkJobInput) => {
      const { data, error } = await supabase
        .from('bulk_jobs')
        .insert({
          operation_type: input.operation_type,
          items: input.items,
          total_items: input.items.length,
          options: input.options || {},
          created_by: user?.id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data as BulkJob;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulk_jobs'] });
    },
  });

  // Update job status
  const updateJobStatusMutation = useMutation({
    mutationFn: async ({ 
      jobId, 
      status, 
      processed_items,
      failed_items,
      results,
      errors 
    }: { 
      jobId: string; 
      status: BulkJob['status'];
      processed_items?: number;
      failed_items?: number;
      results?: any[];
      errors?: any[];
    }) => {
      const updates: Partial<BulkJob> = { status };
      
      if (processed_items !== undefined) updates.processed_items = processed_items;
      if (failed_items !== undefined) updates.failed_items = failed_items;
      if (results !== undefined) updates.results = results;
      if (errors !== undefined) updates.errors = errors;
      
      if (status === 'processing' && !updates.started_at) {
        updates.started_at = new Date().toISOString();
      }
      if (status === 'completed' || status === 'failed') {
        updates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('bulk_jobs')
        .update(updates)
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;
      return data as BulkJob;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulk_jobs'] });
    },
  });

  // Delete a job
  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('bulk_jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulk_jobs'] });
    },
  });

  // Pause/Resume job
  const toggleJobPause = useCallback(async (jobId: string, currentStatus: BulkJob['status']) => {
    const newStatus = currentStatus === 'paused' ? 'processing' : 'paused';
    return updateJobStatusMutation.mutateAsync({ jobId, status: newStatus });
  }, [updateJobStatusMutation]);

  // Cancel job
  const cancelJob = useCallback(async (jobId: string) => {
    return updateJobStatusMutation.mutateAsync({ jobId, status: 'cancelled' });
  }, [updateJobStatusMutation]);

  // Refresh jobs
  const refreshJobs = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  // Computed stats
  const stats: BulkJobStats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter(j => j.status === 'processing' || j.status === 'pending').length,
    completedJobs: jobs.filter(j => j.status === 'completed').length,
    failedJobs: jobs.filter(j => j.status === 'failed').length,
    totalItemsProcessed: jobs.reduce((acc, j) => acc + (j.processed_items || 0), 0),
  };

  // Filter helpers
  const activeJobs = jobs.filter(j => j.status === 'processing' || j.status === 'pending' || j.status === 'paused');
  const completedJobs = jobs.filter(j => j.status === 'completed' || j.status === 'failed' || j.status === 'cancelled');

  return {
    // Data
    jobs,
    activeJobs,
    completedJobs,
    stats,
    isLoading,
    isRefreshing,
    error,

    // Actions
    createJob: createJobMutation.mutateAsync,
    updateJobStatus: updateJobStatusMutation.mutateAsync,
    deleteJob: deleteJobMutation.mutateAsync,
    toggleJobPause,
    cancelJob,
    refreshJobs,

    // Mutation states
    isCreating: createJobMutation.isPending,
    isUpdating: updateJobStatusMutation.isPending,
    isDeleting: deleteJobMutation.isPending,
  };
}

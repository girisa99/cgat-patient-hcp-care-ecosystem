/**
 * useVideoAssembly Hook
 * 
 * React hook for managing video assembly jobs with real-time updates
 */

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { videoAssemblyService } from '../VideoAssemblyService';
import type {
  AssemblyJob,
  AssemblyConfig,
  AssemblyProgress,
  AssemblyEvent,
  BatchAssemblyRequest,
  BatchAssemblyResult,
} from '../types';

interface UseVideoAssemblyOptions {
  onJobComplete?: (job: AssemblyJob) => void;
  onJobFailed?: (job: AssemblyJob) => void;
  onProgressUpdate?: (progress: AssemblyProgress) => void;
  autoSubscribe?: boolean;
}

interface UseVideoAssemblyReturn {
  // State
  currentJob: AssemblyJob | null;
  jobs: AssemblyJob[];
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  startAssembly: (config: AssemblyConfig) => Promise<AssemblyJob>;
  startBatchAssembly: (request: BatchAssemblyRequest) => Promise<BatchAssemblyResult>;
  cancelJob: (jobId: string) => Promise<boolean>;
  getJob: (jobId: string) => AssemblyJob | undefined;
  
  // Progress
  progress: AssemblyProgress | null;
}

export function useVideoAssembly(options: UseVideoAssemblyOptions = {}): UseVideoAssemblyReturn {
  const {
    onJobComplete,
    onJobFailed,
    onProgressUpdate,
    autoSubscribe = true,
  } = options;

  const [currentJob, setCurrentJob] = useState<AssemblyJob | null>(null);
  const [jobs, setJobs] = useState<AssemblyJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<AssemblyProgress | null>(null);

  // Handle assembly events
  const handleEvent = useCallback((event: AssemblyEvent) => {
    switch (event.type) {
      case 'progress_update':
        const progressData = event.data as AssemblyProgress;
        setProgress(progressData);
        onProgressUpdate?.(progressData);
        break;
        
      case 'job_completed':
        const job = videoAssemblyService.getJob(event.jobId);
        if (job) {
          setCurrentJob(job);
          setJobs(prev => prev.map(j => j.id === job.id ? job : j));
          onJobComplete?.(job);
          toast.success('Video assembly completed!', {
            description: `Your ${job.config.language} video is ready.`,
          });
        }
        setIsLoading(false);
        break;
        
      case 'job_failed':
        const failedJob = videoAssemblyService.getJob(event.jobId);
        if (failedJob) {
          setCurrentJob(failedJob);
          setJobs(prev => prev.map(j => j.id === failedJob.id ? failedJob : j));
          onJobFailed?.(failedJob);
          toast.error('Video assembly failed', {
            description: failedJob.error?.message || 'Unknown error',
          });
        }
        setIsLoading(false);
        break;
        
      case 'job_started':
        toast.info('Video assembly started', {
          description: 'Your video is being processed...',
        });
        break;
    }
  }, [onJobComplete, onJobFailed, onProgressUpdate]);

  // Start single assembly
  const startAssembly = useCallback(async (config: AssemblyConfig): Promise<AssemblyJob> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const job = await videoAssemblyService.createJob(config);
      setCurrentJob(job);
      setJobs(prev => [...prev, job]);
      
      // Subscribe to job events
      if (autoSubscribe) {
        videoAssemblyService.subscribeToJob(job.id, handleEvent);
      }
      
      return job;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsLoading(false);
      toast.error('Failed to start assembly', {
        description: error.message,
      });
      throw error;
    }
  }, [autoSubscribe, handleEvent]);

  // Start batch assembly
  const startBatchAssembly = useCallback(async (request: BatchAssemblyRequest): Promise<BatchAssemblyResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await videoAssemblyService.createBatchJobs(request);
      setJobs(prev => [...prev, ...result.jobs]);
      
      // Subscribe to all job events
      if (autoSubscribe) {
        result.jobs.forEach(job => {
          videoAssemblyService.subscribeToJob(job.id, handleEvent);
        });
      }
      
      toast.success(`Started ${result.jobs.length} assembly jobs`, {
        description: `Languages: ${request.languages.join(', ')}`,
      });
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsLoading(false);
      toast.error('Failed to start batch assembly', {
        description: error.message,
      });
      throw error;
    }
  }, [autoSubscribe, handleEvent]);

  // Cancel job
  const cancelJob = useCallback(async (jobId: string): Promise<boolean> => {
    const success = await videoAssemblyService.cancelJob(jobId);
    if (success) {
      setJobs(prev => prev.map(j => 
        j.id === jobId ? { ...j, status: 'cancelled' as const } : j
      ));
      toast.info('Assembly cancelled');
    }
    return success;
  }, []);

  // Get job
  const getJob = useCallback((jobId: string): AssemblyJob | undefined => {
    return videoAssemblyService.getJob(jobId);
  }, []);

  return {
    currentJob,
    jobs,
    isLoading,
    error,
    startAssembly,
    startBatchAssembly,
    cancelJob,
    getJob,
    progress,
  };
}

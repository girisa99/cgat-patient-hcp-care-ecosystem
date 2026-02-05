/**
 * useMarketingPipelines Hook
 * 
 * React hook for interacting with the marketing pipeline service.
 * Used across Genie Cast, Spark, Mind, Vibe, and Deck for:
 * - Content repurposing (shorts, highlights, thumbnails)
 * - Marketing content generation (comparisons, case studies)
 * - Video enhancement and translation
 * 
 * Follows ecosystem-wide patterns:
 * - Uses master-ecosystem-registry for pipeline definitions
 * - Integrates with ai-universal-processor for AI tasks
 * - Supports regional routing via styleIntentResolver
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  marketingPipelineService,
  type PipelineExecutionContext,
  type PipelineJob,
  type PipelineStatus,
  ACTIVE_PIPELINES
} from '@/services/marketing/marketingPipelineService';
import { MASTER_MARKETING_PIPELINES } from '@/config/master-ecosystem-registry';

// Alias for convenience
const MASTER_PIPELINES = MASTER_MARKETING_PIPELINES;

// Hook options
interface UseMarketingPipelinesOptions {
  userId?: string;
  autoRefreshInterval?: number; // ms
}

// Hook return type
interface UseMarketingPipelinesReturn {
  // Pipeline data
  availablePipelines: typeof MASTER_PIPELINES;
  activePipelineIds: string[];
  isPipelineActive: (id: string) => boolean;
  
  // Jobs
  jobs: PipelineJob[];
  activeJobs: PipelineJob[];
  completedJobs: PipelineJob[];
  failedJobs: PipelineJob[];
  
  // Execution
  executePipeline: (context: Omit<PipelineExecutionContext, 'userId'>) => Promise<PipelineJob>;
  isExecuting: boolean;
  
  // Quick actions for common pipelines
  generateShorts: (videoId: string, style?: string) => Promise<PipelineJob>;
  generateThumbnails: (videoId: string, count?: number) => Promise<PipelineJob>;
  addCaptions: (videoId: string, language?: string) => Promise<PipelineJob>;
  createComparison: (productName: string, competitorName: string, points?: string[]) => Promise<PipelineJob>;
  createCaseStudy: (data: { clientName: string; challenge: string; solution: string; results: string }) => Promise<PipelineJob>;
  translateVideo: (videoId: string, targetLanguage: string) => Promise<PipelineJob>;
  
  // Job management
  getJob: (jobId: string) => PipelineJob | undefined;
  refreshJobs: () => void;
  
  // Stats
  stats: {
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    failedJobs: number;
    successRate: number;
  };
}

export const useMarketingPipelines = (options: UseMarketingPipelinesOptions = {}): UseMarketingPipelinesReturn => {
  const { userId, autoRefreshInterval = 5000 } = options;
  const queryClient = useQueryClient();
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [localJobs, setLocalJobs] = useState<PipelineJob[]>([]);

  // Get available pipelines from registry
  const availablePipelines = useMemo(() => {
    return marketingPipelineService.getAvailablePipelines();
  }, []);

  // Get active pipeline IDs
  const activePipelineIds = useMemo(() => {
    return marketingPipelineService.getActivePipelines();
  }, []);

  // Check if pipeline is active
  const isPipelineActive = useCallback((id: string) => {
    return marketingPipelineService.isPipelineActive(id);
  }, []);

  // Execute pipeline
  const executePipeline = useCallback(async (
    context: Omit<PipelineExecutionContext, 'userId'>
  ): Promise<PipelineJob> => {
    setIsExecuting(true);
    
    try {
      const job = await marketingPipelineService.executePipeline({
        ...context,
        userId,
      });

      // Add to local jobs
      setLocalJobs(prev => [job, ...prev]);
      
      // Show toast
      const pipelineInfo = marketingPipelineService.getPipelineInfo(context.pipelineId);
      toast.success(`Started: ${pipelineInfo?.name || context.pipelineId}`, {
        description: 'Processing in background...',
      });

      // Set up polling for job status
      const pollInterval = setInterval(() => {
        const updatedJob = marketingPipelineService.getJob(job.id);
        if (updatedJob) {
          setLocalJobs(prev => prev.map(j => j.id === job.id ? updatedJob : j));
          
          if (updatedJob.status === 'completed') {
            clearInterval(pollInterval);
            toast.success(`Completed: ${pipelineInfo?.name || context.pipelineId}`);
          } else if (updatedJob.status === 'failed') {
            clearInterval(pollInterval);
            toast.error(`Failed: ${pipelineInfo?.name || context.pipelineId}`, {
              description: updatedJob.result?.error,
            });
          }
        }
      }, 1000);

      // Clear interval after 10 minutes max
      setTimeout(() => clearInterval(pollInterval), 600000);

      return job;
    } catch (error) {
      toast.error('Pipeline execution failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, [userId]);

  // Quick action: Generate shorts
  const generateShorts = useCallback(async (videoId: string, style = 'dynamic') => {
    return executePipeline({
      pipelineId: 'video-shorts',
      sourceVideoId: videoId,
      inputData: { style },
    });
  }, [executePipeline]);

  // Quick action: Generate thumbnails
  const generateThumbnails = useCallback(async (videoId: string, count = 3) => {
    return executePipeline({
      pipelineId: 'video-thumbnails',
      sourceVideoId: videoId,
      inputData: { count },
    });
  }, [executePipeline]);

  // Quick action: Add captions
  const addCaptions = useCallback(async (videoId: string, language = 'en') => {
    return executePipeline({
      pipelineId: 'video-captions',
      sourceVideoId: videoId,
      language,
      inputData: {},
    });
  }, [executePipeline]);

  // Quick action: Create comparison
  const createComparison = useCallback(async (
    productName: string, 
    competitorName: string, 
    points: string[] = ['features', 'pricing', 'support']
  ) => {
    return executePipeline({
      pipelineId: 'competitor-to-comparison',
      inputData: { productName, competitorName, comparisonPoints: points },
    });
  }, [executePipeline]);

  // Quick action: Create case study
  const createCaseStudy = useCallback(async (data: {
    clientName: string;
    challenge: string;
    solution: string;
    results: string;
  }) => {
    return executePipeline({
      pipelineId: 'case-study-to-video',
      inputData: data,
    });
  }, [executePipeline]);

  // Quick action: Translate video
  const translateVideo = useCallback(async (videoId: string, targetLanguage: string) => {
    return executePipeline({
      pipelineId: 'video-translate',
      sourceVideoId: videoId,
      language: targetLanguage,
      inputData: {},
    });
  }, [executePipeline]);

  // Get job
  const getJob = useCallback((jobId: string) => {
    return localJobs.find(j => j.id === jobId) || marketingPipelineService.getJob(jobId);
  }, [localJobs]);

  // Refresh jobs
  const refreshJobs = useCallback(() => {
    if (userId) {
      const userJobs = marketingPipelineService.getUserJobs(userId);
      setLocalJobs(prev => {
        // Merge with local jobs, preferring newer data
        const merged = [...userJobs];
        prev.forEach(job => {
          if (!merged.find(j => j.id === job.id)) {
            merged.push(job);
          }
        });
        return merged.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      });
    }
  }, [userId]);

  // Derived job lists
  const activeJobs = useMemo(() => 
    localJobs.filter(j => j.status === 'processing' || j.status === 'queued'),
    [localJobs]
  );

  const completedJobs = useMemo(() => 
    localJobs.filter(j => j.status === 'completed'),
    [localJobs]
  );

  const failedJobs = useMemo(() => 
    localJobs.filter(j => j.status === 'failed'),
    [localJobs]
  );

  // Stats
  const stats = useMemo(() => ({
    totalJobs: localJobs.length,
    activeJobs: activeJobs.length,
    completedJobs: completedJobs.length,
    failedJobs: failedJobs.length,
    successRate: localJobs.length > 0 
      ? Math.round((completedJobs.length / (completedJobs.length + failedJobs.length)) * 100) || 0
      : 0,
  }), [localJobs, activeJobs, completedJobs, failedJobs]);

  return {
    // Pipeline data
    availablePipelines,
    activePipelineIds,
    isPipelineActive,
    
    // Jobs
    jobs: localJobs,
    activeJobs,
    completedJobs,
    failedJobs,
    
    // Execution
    executePipeline,
    isExecuting,
    
    // Quick actions
    generateShorts,
    generateThumbnails,
    addCaptions,
    createComparison,
    createCaseStudy,
    translateVideo,
    
    // Job management
    getJob,
    refreshJobs,
    
    // Stats
    stats,
  };
};

export default useMarketingPipelines;

/**
 * Distribution Agent Hook
 * Multi-platform distribution with scheduling, cloud storage, and n8n integration
 * Supports: Social Media, Professional, Cloud Storage (S3, Dropbox)
 * Scheduling: Simple Queue, AI-Optimized Timing, Calendar Integration
 * Integration: n8n MCP + Direct API + Hybrid
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Platform Types
export type SocialPlatform = 
  | 'youtube' 
  | 'instagram' 
  | 'tiktok' 
  | 'facebook' 
  | 'twitter' 
  | 'linkedin' 
  | 'snapchat'
  | 'threads';

export type ProfessionalPlatform = 
  | 'vimeo' 
  | 'wistia' 
  | 'brightcove' 
  | 'kaltura'
  | 'loom'
  | 'vidyard';

export type CloudPlatform = 
  | 's3' 
  | 'dropbox' 
  | 'google_drive' 
  | 'onedrive'
  | 'box';

export type AllPlatforms = SocialPlatform | ProfessionalPlatform | CloudPlatform;

// Scheduling Types
export type ScheduleType = 'immediate' | 'queue' | 'ai_optimized' | 'calendar';

export interface ScheduleConfig {
  type: ScheduleType;
  scheduledAt?: Date;
  timezone?: string;
  aiOptimization?: {
    targetAudience?: string;
    engagementGoal?: 'views' | 'engagement' | 'reach';
    avoidTimes?: string[];
  };
  calendarIntegration?: {
    provider: 'google' | 'outlook' | 'apple';
    eventId?: string;
  };
}

// Integration Types
export type IntegrationMode = 'n8n' | 'direct' | 'hybrid';

export interface N8nWorkflowConfig {
  webhookUrl: string;
  workflowId?: string;
  customPayload?: Record<string, any>;
}

// Platform Format Specs
export interface PlatformFormatSpec {
  width: number;
  height: number;
  aspectRatio: string;
  maxDuration: number; // seconds
  maxFileSize: number; // MB
  supportedFormats: string[];
  recommendedBitrate?: number;
}

export const PLATFORM_SPECS: Record<AllPlatforms, PlatformFormatSpec> = {
  // Social Platforms
  youtube: { width: 1920, height: 1080, aspectRatio: '16:9', maxDuration: 43200, maxFileSize: 256000, supportedFormats: ['mp4', 'mov', 'webm'] },
  instagram: { width: 1080, height: 1920, aspectRatio: '9:16', maxDuration: 90, maxFileSize: 4000, supportedFormats: ['mp4', 'mov'] },
  tiktok: { width: 1080, height: 1920, aspectRatio: '9:16', maxDuration: 600, maxFileSize: 287, supportedFormats: ['mp4', 'mov'] },
  facebook: { width: 1080, height: 1080, aspectRatio: '1:1', maxDuration: 14400, maxFileSize: 10000, supportedFormats: ['mp4', 'mov'] },
  twitter: { width: 1920, height: 1080, aspectRatio: '16:9', maxDuration: 140, maxFileSize: 512, supportedFormats: ['mp4'] },
  linkedin: { width: 1920, height: 1080, aspectRatio: '16:9', maxDuration: 600, maxFileSize: 5000, supportedFormats: ['mp4'] },
  snapchat: { width: 1080, height: 1920, aspectRatio: '9:16', maxDuration: 60, maxFileSize: 32, supportedFormats: ['mp4', 'mov'] },
  threads: { width: 1080, height: 1350, aspectRatio: '4:5', maxDuration: 300, maxFileSize: 500, supportedFormats: ['mp4', 'mov'] },
  
  // Professional Platforms
  vimeo: { width: 3840, height: 2160, aspectRatio: '16:9', maxDuration: 0, maxFileSize: 500000, supportedFormats: ['mp4', 'mov', 'wmv', 'avi'] },
  wistia: { width: 3840, height: 2160, aspectRatio: '16:9', maxDuration: 0, maxFileSize: 80000, supportedFormats: ['mp4', 'mov', 'avi'] },
  brightcove: { width: 3840, height: 2160, aspectRatio: '16:9', maxDuration: 0, maxFileSize: 10000, supportedFormats: ['mp4', 'mov'] },
  kaltura: { width: 3840, height: 2160, aspectRatio: '16:9', maxDuration: 0, maxFileSize: 0, supportedFormats: ['mp4', 'mov', 'avi', 'wmv'] },
  loom: { width: 1920, height: 1080, aspectRatio: '16:9', maxDuration: 18000, maxFileSize: 5000, supportedFormats: ['mp4', 'webm'] },
  vidyard: { width: 1920, height: 1080, aspectRatio: '16:9', maxDuration: 0, maxFileSize: 5000, supportedFormats: ['mp4', 'mov'] },
  
  // Cloud Storage
  s3: { width: 0, height: 0, aspectRatio: 'any', maxDuration: 0, maxFileSize: 5000000, supportedFormats: ['any'] },
  dropbox: { width: 0, height: 0, aspectRatio: 'any', maxDuration: 0, maxFileSize: 50000, supportedFormats: ['any'] },
  google_drive: { width: 0, height: 0, aspectRatio: 'any', maxDuration: 0, maxFileSize: 5000000, supportedFormats: ['any'] },
  onedrive: { width: 0, height: 0, aspectRatio: 'any', maxDuration: 0, maxFileSize: 250000, supportedFormats: ['any'] },
  box: { width: 0, height: 0, aspectRatio: 'any', maxDuration: 0, maxFileSize: 50000, supportedFormats: ['any'] },
};

// Distribution Request & Result
export interface DistributionRequest {
  videoUrl: string;
  videoBlob?: Blob;
  platforms: AllPlatforms[];
  schedule: ScheduleConfig;
  integrationMode: IntegrationMode;
  n8nConfig?: N8nWorkflowConfig;
  metadata: {
    title: string;
    description?: string;
    tags?: string[];
    thumbnail?: string;
    visibility?: 'public' | 'private' | 'unlisted';
    category?: string;
  };
  cloudConfig?: {
    bucket?: string;
    path?: string;
    accessKey?: string;
  };
}

export interface DistributionResult {
  platform: AllPlatforms;
  status: 'queued' | 'processing' | 'success' | 'failed' | 'scheduled';
  url?: string;
  error?: string;
  scheduledAt?: Date;
  metadata?: Record<string, any>;
}

export interface DistributionQueueItem {
  id: string;
  request: DistributionRequest;
  results: DistributionResult[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  aiOptimizedTime?: Date;
}

// Hook Return Type
interface UseDistributionAgentReturn {
  isDistributing: boolean;
  progress: number;
  currentPlatform: AllPlatforms | null;
  queue: DistributionQueueItem[];
  results: DistributionResult[];
  error: string | null;
  
  // Actions
  distribute: (request: DistributionRequest) => Promise<DistributionResult[]>;
  scheduleDistribution: (request: DistributionRequest) => Promise<string>;
  getOptimalTiming: (platforms: AllPlatforms[], audience?: string) => Promise<Record<AllPlatforms, Date>>;
  cancelDistribution: (queueId: string) => Promise<boolean>;
  retryFailed: (queueId: string) => Promise<DistributionResult[]>;
  
  // Utilities
  getPlatformSpec: (platform: AllPlatforms) => PlatformFormatSpec;
  validateForPlatform: (videoUrl: string, platform: AllPlatforms) => Promise<{ valid: boolean; issues: string[] }>;
  generateMetadata: (videoUrl: string, platform: AllPlatforms) => Promise<{ title: string; description: string; tags: string[] }>;
}

export const useDistributionAgent = (): UseDistributionAgentReturn => {
  const [isDistributing, setIsDistributing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPlatform, setCurrentPlatform] = useState<AllPlatforms | null>(null);
  const [queue, setQueue] = useState<DistributionQueueItem[]>([]);
  const [results, setResults] = useState<DistributionResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get platform spec
  const getPlatformSpec = useCallback((platform: AllPlatforms): PlatformFormatSpec => {
    return PLATFORM_SPECS[platform];
  }, []);

  // Validate video for platform
  const validateForPlatform = useCallback(async (
    videoUrl: string, 
    platform: AllPlatforms
  ): Promise<{ valid: boolean; issues: string[] }> => {
    const spec = PLATFORM_SPECS[platform];
    const issues: string[] = [];
    
    // For cloud storage, most things are allowed
    if (['s3', 'dropbox', 'google_drive', 'onedrive', 'box'].includes(platform)) {
      return { valid: true, issues: [] };
    }

    // Check format based on URL extension
    const extension = videoUrl.split('.').pop()?.toLowerCase() || '';
    if (spec.supportedFormats[0] !== 'any' && !spec.supportedFormats.includes(extension)) {
      issues.push(`Format .${extension} not supported. Use: ${spec.supportedFormats.join(', ')}`);
    }

    return { valid: issues.length === 0, issues };
  }, []);

  // Generate AI metadata
  const generateMetadata = useCallback(async (
    videoUrl: string, 
    platform: AllPlatforms
  ): Promise<{ title: string; description: string; tags: string[] }> => {
    try {
      const { data, error } = await supabase.functions.invoke('distribution-agent', {
        body: {
          action: 'generate_metadata',
          videoUrl,
          platform,
        },
      });

      if (error) throw error;

      return data.metadata || {
        title: 'Untitled Video',
        description: 'Created with Genie AI',
        tags: ['video', 'content'],
      };
    } catch (err) {
      console.error('Metadata generation failed:', err);
      return {
        title: 'Untitled Video',
        description: 'Created with Genie AI',
        tags: ['video', 'content'],
      };
    }
  }, []);

  // Get AI-optimized timing
  const getOptimalTiming = useCallback(async (
    platforms: AllPlatforms[], 
    audience?: string
  ): Promise<Record<AllPlatforms, Date>> => {
    try {
      const { data, error } = await supabase.functions.invoke('distribution-agent', {
        body: {
          action: 'get_optimal_timing',
          platforms,
          audience,
        },
      });

      if (error) throw error;

      const timing: Record<AllPlatforms, Date> = {} as any;
      for (const platform of platforms) {
        timing[platform] = new Date(data.timing?.[platform] || Date.now());
      }
      return timing;
    } catch (err) {
      console.error('Optimal timing failed:', err);
      // Default to now
      const timing: Record<AllPlatforms, Date> = {} as any;
      platforms.forEach(p => { timing[p] = new Date(); });
      return timing;
    }
  }, []);

  // Main distribution function
  const distribute = useCallback(async (request: DistributionRequest): Promise<DistributionResult[]> => {
    setIsDistributing(true);
    setProgress(0);
    setError(null);
    setResults([]);

    const distributionResults: DistributionResult[] = [];
    const totalPlatforms = request.platforms.length;

    try {
      for (let i = 0; i < request.platforms.length; i++) {
        const platform = request.platforms[i];
        setCurrentPlatform(platform);
        setProgress(((i) / totalPlatforms) * 100);

        try {
          // Call distribution edge function
          const { data, error: fnError } = await supabase.functions.invoke('distribution-agent', {
            body: {
              action: 'distribute',
              platform,
              videoUrl: request.videoUrl,
              metadata: request.metadata,
              integrationMode: request.integrationMode,
              n8nConfig: request.n8nConfig,
              cloudConfig: request.cloudConfig,
              schedule: request.schedule,
            },
          });

          if (fnError) throw fnError;

          const result: DistributionResult = {
            platform,
            status: data.status || 'success',
            url: data.url,
            scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
            metadata: data.metadata,
          };

          distributionResults.push(result);
          setResults([...distributionResults]);

        } catch (platformError: any) {
          distributionResults.push({
            platform,
            status: 'failed',
            error: platformError.message || 'Distribution failed',
          });
          setResults([...distributionResults]);
        }

        setProgress(((i + 1) / totalPlatforms) * 100);
      }

      // Add to queue history
      const queueItem: DistributionQueueItem = {
        id: crypto.randomUUID(),
        request,
        results: distributionResults,
        status: distributionResults.every(r => r.status === 'success' || r.status === 'scheduled') 
          ? 'completed' 
          : distributionResults.some(r => r.status === 'success' || r.status === 'scheduled')
            ? 'completed'
            : 'failed',
        createdAt: new Date(),
        completedAt: new Date(),
      };

      setQueue(prev => [queueItem, ...prev]);

      const successCount = distributionResults.filter(r => r.status === 'success' || r.status === 'scheduled').length;
      toast.success(`Distributed to ${successCount}/${totalPlatforms} platforms`);

      return distributionResults;

    } catch (err: any) {
      setError(err.message || 'Distribution failed');
      toast.error('Distribution failed: ' + err.message);
      return [];
    } finally {
      setIsDistributing(false);
      setCurrentPlatform(null);
      setProgress(100);
    }
  }, []);

  // Schedule distribution
  const scheduleDistribution = useCallback(async (request: DistributionRequest): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('distribution-agent', {
        body: {
          action: 'schedule',
          request,
        },
      });

      if (error) throw error;

      const queueItem: DistributionQueueItem = {
        id: data.queueId,
        request,
        results: request.platforms.map(p => ({
          platform: p,
          status: 'scheduled' as const,
          scheduledAt: request.schedule.scheduledAt,
        })),
        status: 'pending',
        createdAt: new Date(),
        aiOptimizedTime: request.schedule.type === 'ai_optimized' 
          ? new Date(data.optimizedTime) 
          : undefined,
      };

      setQueue(prev => [queueItem, ...prev]);
      toast.success(`Scheduled for ${request.platforms.length} platforms`);

      return data.queueId;

    } catch (err: any) {
      toast.error('Scheduling failed: ' + err.message);
      throw err;
    }
  }, []);

  // Cancel distribution
  const cancelDistribution = useCallback(async (queueId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.functions.invoke('distribution-agent', {
        body: {
          action: 'cancel',
          queueId,
        },
      });

      if (error) throw error;

      setQueue(prev => prev.filter(q => q.id !== queueId));
      toast.success('Distribution cancelled');
      return true;

    } catch (err: any) {
      toast.error('Cancel failed: ' + err.message);
      return false;
    }
  }, []);

  // Retry failed distributions
  const retryFailed = useCallback(async (queueId: string): Promise<DistributionResult[]> => {
    const queueItem = queue.find(q => q.id === queueId);
    if (!queueItem) {
      toast.error('Queue item not found');
      return [];
    }

    const failedPlatforms = queueItem.results
      .filter(r => r.status === 'failed')
      .map(r => r.platform);

    if (failedPlatforms.length === 0) {
      toast.info('No failed platforms to retry');
      return [];
    }

    const retryRequest: DistributionRequest = {
      ...queueItem.request,
      platforms: failedPlatforms,
    };

    return distribute(retryRequest);
  }, [queue, distribute]);

  return {
    isDistributing,
    progress,
    currentPlatform,
    queue,
    results,
    error,
    distribute,
    scheduleDistribution,
    getOptimalTiming,
    cancelDistribution,
    retryFailed,
    getPlatformSpec,
    validateForPlatform,
    generateMetadata,
  };
};

export default useDistributionAgent;
